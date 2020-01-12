import axios from "axios";
const API_HOST = process.env.VUE_APP_API_HOST || "http://localhost:7000";
// const API_PORT = process.env.VUE_APP_API_PORT || "7000";
const app = axios.create({
  // baseURL: API_HOST + ":" + API_PORT,
  baseURL: API_HOST,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,GET"
  }
});

export default {
  async save(info) {
    try {
      const res = await app.post("/save", info);
      // eslint-disable-next-line no-console
      console.log("saved");
      return res;
    } catch (error) {
      alert("failed for Saving.");
    }
  },
  async getBoard(info) {
    try {
      return await app.post("/getBoard", info);
    } catch (error) {
      alert("failed to get board: " + error);
    }
  },
  async getSaves(info) {
    try {
      return await app.post("/getSaves", info);
    } catch (error) {
      alert("failed to get save data: " + error);
    }
  },
  async giveUp(info) {
    try {
      const res = await app.post("/giveUp", info);
      return res;
    } catch (error) {
      alert("failed to proccess of giving up:" + error);
    }
  },
  async signUp(info) {
    return await app.post("/signUp", info);
  },
  async login(info) {
    return await app.post("/login", info);
  }
};
