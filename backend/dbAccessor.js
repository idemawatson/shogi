var promise = require("bluebird");
var options = {
  promiseLib: promise,
  noWarnings: true
};

var pgp = require("pg-promise")(options);
require("dotenv").config();
const logger = require("log4js").getLogger();
logger.level = "all";

var db = pgp(process.env.DATABASE_URL);
const INVALID_REQUEST = "Invalid Request.";

const START_BOARD = JSON.stringify(require("./startBoard.json"));
const START_HOLDING = "[]";

const outputLog = (kind, message) => {
  switch (kind) {
    case "info":
      logger.info(message);
      break;
    case "error":
      logger.error(message);
      break;
    default:
      logger.debug(message);
  }
}

const signUp = (req, res) => {
  let info = req.body.info;
  if (!info) {
    outputLog("error", INVALID_REQUEST);
    res.status(400).json({
      message: INVALID_REQUEST
    });
  }
  db.any(
    'INSERT INTO "user"(name, password)' + "VALUES($1, $2) RETURNING user_id",
    [info.name, info.password]
  )
    .then(function(data) {
      res.status(200).json({
        user_id: data[0].user_id
      });
      outputLog("info", "Signned Up.");
    })
    .catch(function(err) {
      outputLog("error", err);
      res.status(400).json({
        message: "登録済みのユーザー名です。"
      });
    });
};

const login = (req, res) => {
  let info = req.body.info;
  if (!info) {
    outputLog("error", INVALID_REQUEST);
    res.status(400).json({
      message: INVALID_REQUEST
    });
  }
  db.any('SELECT user_id FROM "user" WHERE name = $1 AND password = $2', [
    info.name,
    info.password
  ])
    .then(
      data =>
        new Promise((resolve, reject) => {
          if (data.length) {
            outputLog("info", "Logged in" + info.name);
            return resolve(
              res.status(200).json({
                user_id: data[0].user_id,
                name: info.name
              })
            );
          } else {
            reject("ログインに失敗しました。パスワードを確かめてください。");
          }
        })
    )
    .catch(err => {
      outputLog("error", err);
      res.status(500).json({
        message: err
      });
    });
};

const start = (user1, user2, date) => {
  return db
    .any(
      'INSERT INTO game ("p1_id", "p2_id", "board", "state", "p1_holding", "p2_holding", "turn", "update_date") values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING game_id',
      [
        user1,
        user2,
        START_BOARD,
        "on",
        START_HOLDING,
        START_HOLDING,
        user1,
        date
      ]
    )
    .then(data => {
      outputLog("info", "Game Started: " + data[0].game_id);
      return {
        game_id: data[0].game_id,
        board: START_BOARD,
        p1_id: user1,
        p2_id: user2,
        turn: user1
      };
    })
    .catch(err => {
      outputLog("error", err);
      throw err;
    });
};

const restart = async (gameId) => {
  const game = await db.any("SELECT * from game where game_id = $1", [gameId]);
  if (game[0]) {
    outputLog("info", "Restart game: " + game[0].game_id);
    return game[0];
  } else {
    outputLog("error", "Game is not exists.");
    throw new Error("Game is not exists.");
  }
};

const getSaves = async (req, res, next) => {
  let info = req.body.info;
  if (!info) {
    outputLog("error", INVALID_REQUEST);
    res.status(400).json({
      message: INVALID_REQUEST
    });
    next();
  }
  try {
    const data = await db.any(
      "SELECT game_id, count, update_date from game where (p1_id = $1 OR p2_id = $1) AND state = 'on'",
      [info]
    );
    outputLog("info", "Got saves for " + info);
    res.status(200).json({
      data: data
    });
  } catch (err) {
    outputLog("error", err);
    res.status(500).json({
      message: err
    });
  }
};

const saveBoard = (req, res, next) => {
  let board = req.body.board;
  let gameId = req.body.gameId;
  let holdings = req.body.holding;
  if (!board || !gameId) {
    outputLog("error", INVALID_REQUEST);
    res.status(400).json({
      message: INVALID_REQUEST
    });
    next();
  }
  return db
    .any(
      "UPDATE game SET board = $1, p1_holding = $2, p2_holding = $3, turn = $4, count = $6, update_date = $7 WHERE game_id = $5 RETURNING p1_id, p2_id",
      [
        JSON.stringify(board),
        JSON.stringify(holdings.p1),
        JSON.stringify(holdings.p2),
        holdings.next,
        gameId,
        req.body.count,
        req.body.date
      ]
    )
    .then(data => {
      outputLog("info", "Saved for " + gameId);
      res.status(200).json({
        next_turn: holdings.next
      });
    })
    .catch(err => {
      outputLog("error", err);
      res.status(500).json({
        message: err
      });
    });
};

const getBoard = (req, res, next) => {
  var gameId = req.body.gameId;
  if (!gameId) {
    outputLog("error", INVALID_REQUEST);
    res.status(400).json({
      message: INVALID_REQUEST
    });
    next();
  }
  return db
    .any("SELECT * FROM game WHERE game_id = $1", [gameId])
    .then(data => {
      outputLog("info", "Got Board for " + gameId);
      res.status(200).json(data[0]);
    })
    .catch(err => {
      outputLog("error", err);
      res.status(500).json({
        message: err
      });
    });
};

const giveUp = (req, res) => {
  return db.any("UPDATE game SET state = 'off' WHERE game_id = $1", [req.body.gameId])
  .then(() => {
    outputLog("info", "Game finished: " + req.body.gameId);
    res.status(200).json(null);
  })
  .catch (err => {
    outputLog("error", err);
    res.status(500).json({
      message: err
    });
  });
};

module.exports = {
  signUp: signUp,
  login: login,
  start: start,
  restart: restart,
  getSaves: getSaves,
  saveBoard: saveBoard,
  getBoard: getBoard,
  giveUp: giveUp
};
