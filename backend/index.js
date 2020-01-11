const app = require("express")();

const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").Server(app);
const PORT = 7000;

const io = require("socket.io")(server);
// const options = {
  //   stream: {
    //     write: function(data) {
      //       console.log(data);
      //     }
      //   }
      // };
      // const logger = require("socket.io-logger")(options);
      // io.use(logger);
      
const db = require("./dbAccessor");
      
const logger = require("log4js").getLogger();
logger.level = "all";

const socketController = require("./controller/socketController.js");
socketController.setLogger(logger);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/signUp", db.signUp);
app.post("/login", db.login);
app.post("/save", db.saveBoard);
app.post("/getSaves", db.getSaves);
app.post("/getBoard", db.getBoard);
app.post("/giveUp", db.giveUp);

const nsp = io.of("/socket-board");
nsp.on("connection", socket => {
  socket.on("init", info => socketController.initRoom(info, socket));
  socket.on("start", async (info, date) => await socketController.startGame(info, socket, date, nsp, db));
  socket.on("restart", async (roomId, userId) => await socketController.restartGame(roomId, userId, db, nsp, socket));
  socket.on("move", move => socketController.move(move, socket));
  socket.on("put", put => socketController.put(put, socket));
  socket.on("giveUp", roomId => socketController.giveUp(roomId, socket));
  socket.on("break", roomId => socketController.breakGame(roomId, socket));
});

server.listen(PORT, function() {
  logger.info("server listening. Port: " + PORT);
});
