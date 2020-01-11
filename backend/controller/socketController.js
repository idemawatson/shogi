
var socketController = function() {};
var store = [];

const emitError = (nsp, id, message) => {
  nsp.to(id).emit("errorEvent", message);
};

socketController.prototype.setLogger = (logger) => {
  this.logger = logger;
}

socketController.prototype.initRoom = (info, socket) => {
  var hasId = false;
  for (p of store) {
    if (p.id == info.userId) {
      socket.join(info.roomId);
      p.socket = socket.id;
      this.logger.info(
        info.roomId + ": " + info.userId + "がルームに再接続しました。"
      );
      hasId = true;
      break;
    }
  }
  if (store.length <= 1 || hasId) {
    if (!hasId) {
      socket.join(info.roomId);
      const player = new Object();
      player.id = info.userId;
      player.socket = socket.id;
      store.push(player);
      this.logger.info(info.roomId + ": " + info.userId + "が入室しました");
    }
  } else {
    emitError(nsp, socket.id, "Room initialize error.");
  }
}

socketController.prototype.startGame = async (info, socket, date, nsp, db) => {
  if (store.length == 2) {
    const body = await db.start(store[0].id, store[1].id, date).catch(err => {
      console.log(err.message);
      nsp.sockets[socket.id].emit("errorEvent", "Start Game failed");
    });
    console.log(
      "ゲーム開始 [プレイヤー1: " +
        store[0].id +
        ", プレイヤー2: " +
        store[1].id +
        "]"
    );
    nsp.to(info).emit("start-game", body);
  } else {
    emitError(nsp, socket.id, "Room is empty.");
  }
}

socketController.prototype.restartGame = async (roomId, userId, db, nsp, socket) => {
  if (store.length == 2) {
    const body = await db.restart(userId).catch(err => {
      console.log(err.message);
      nsp.sockets[socket.id].emit("errorEvent", "Restart Game failed");
    });
    if (body) {
      if (
        (body.p1_id == store[0].id && body.p2_id == store[1].id) ||
        (body.p1_id == store[1].id && body.p2_id == store[0].id)
      ) {
        console.log(
          "ゲーム再開 [プレイヤー1: " +
            store[0].id +
            ", プレイヤー2: " +
            store[1].id +
            "]"
        );
        nsp.to(roomId).emit("restart-game", body);
      } else {
        emitError(nsp, socket.id, "Room users are different from data.");
      }
    }
  } else {
    emitError(nsp, socket.id, "Room is empty.");
  }
}

socketController.prototype.move = (move, socket) => {
  console.log(
    "User " +
      move.userId +
      ": " +
      move.after[0] +
      move.after[1] +
      move.name +
      " Moved."
  );
  socket.broadcast.to(move.roomId).emit("send-move", move);
}

socketController.prototype.put = (put, socket) => {
  console.log(
    "User " +
      put.userId +
      ": " +
      put.point[0] +
      put.point[1] +
      put.name +
      "Put."
  );
  socket.broadcast.to(put.roomId).emit("send-put", put);
}

socketController.prototype.giveUp = (roomId, socket) => {
  socket.broadcast.to(roomId).emit("win");
}

socketController.prototype.breakGame = (roomId, socket) => {
  socket.broadcast.to(roomId).emit("onBreak");
}

module.exports = new socketController();