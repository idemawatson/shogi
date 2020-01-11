import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;
router.beforeEach((to, from, next) => {
  if (to.matched.some(path => path.meta.requiresAuth) && !store.state.userId) {
    next({ path: "/login", query: { redirect: "/home" } });
  } else if (
    to.matched.some(path => path.meta.requiresRoom) &&
    !store.state.roomId
  ) {
    next({ path: "/" });
  } else {
    next();
  }
});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
