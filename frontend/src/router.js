import Vue from "vue";
import Router from "vue-router";
import Home from "@/views/Home.vue";
import Board from "@/views/Board.vue";
import Login from "@/views/Login.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: { requiresAuth: true, requiresRoom: false }
    },
    {
      path: "/board",
      name: "board",
      component: Board,
      meta: { requiresAuth: true, requiresRoom: true }
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { requiresAuth: false, requiresRoom: false }
    }
  ]
});
