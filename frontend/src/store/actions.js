import Api from "@/api/api.js";

const actions = {
  async getBoard({ commit }) {
    try {
      const res = await Api.getBoard();
      commit("setBoard", res.data.board);
    } catch (error) {
      alert("failed to get board from server.");
    }
  },
  async signUp({ commit }, info) {
    try {
      const res = await Api.signUp({ info: info });
      commit("setUserId", res.data.user_id);
    } catch (e) {
      if (e.response.status == 500) {
        return "サーバーエラーが発生しました";
      } else {
        return e.response.data.message;
      }
    }
  },
  async login({ commit }, info) {
    try {
      const res = await Api.login({ info: info });
      commit("setUserId", res.data.user_id);
      commit("setUserName", res.data.name);
    } catch (e) {
      if (e.response.status == 500) {
        return "サーバーエラーが発生しました";
      } else {
        return e.response.data.message;
      }
    }
  }
};

export default actions;
