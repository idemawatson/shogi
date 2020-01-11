import Vue from "vue";
import Vuex from "vuex";
import State from "@/store/state.js";
import Mutations from "@/store/mutations.js";
import Actions from "@/store/actions.js";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: State,
  mutations: Mutations,
  actions: Actions,
  plugins: [
    createPersistedState({
      key: "SHOGI_VUE",
      storage: window.sessionStorage
    })
  ]
});
