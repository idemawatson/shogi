<template>
  <div>
    <v-app-bar
      color="deep-purple accent-4"
      dark
      fixed
    >
      <v-toolbar-title>将棋: {{userName}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
  </div>
</template>
<script>
import { mapState } from "vuex"; 
export default {
  computed: {
    ...mapState(["userName"])
  },
  methods: {
    logout() {
      this.$store.commit("logout");
      this.$router.push("/login");
    }
  }
};
</script>

