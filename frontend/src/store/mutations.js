import initialState from "@/store/initialState";

const mutations = {
  // setBoard(state, board) {
  //   state.board = board;
  // },
  setRoom(state, roomId) {
    state.roomId = roomId;
  },
  setUserId(state, userId) {
    state.userId = userId;
  },
  setUserName(state, userName) {
    state.userName = userName;
  },
  setCounterId(state, counterId) {
    state.counterId = counterId;
  },
  setGameId(state, gameId) {
    state.gameId = gameId;
  },
  setSocket(state, socket) {
    state.socket = socket;
  },
  changeStartStatus(state) {
    state.started = !state.started;
  },
  setSide(state, side) {
    state.side = side;
  },
  logout(state) {
    Object.assign(state, initialState);
  },
  breakGame(state) {
    state.roomId = "";
    state.gameId = "";
    state.counterId = "";
    state.started = false;
    state.side = 0;
  }
};

export default mutations;
