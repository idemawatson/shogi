<template>
  <v-container fluid style="margin-top: 100px;">
    <v-row align="center" justify="center" style="height: 500px;">
      <v-col cols="5" md="10" sm="10" lg="5">
        <v-card class="home-card">
          <div class="pa-8">
            <v-card-title class="card-title">ルーム作成</v-card-title>
            <v-card-actions>
              <v-btn
                color="orange"
                style="margin: auto;"
                outlined
                @click="createRoom()"
                >作成</v-btn
              >
            </v-card-actions>
          </div>
        </v-card>
      </v-col>
      <v-col cols="5" md="10" sm="10" lg="5">
        <v-card class="home-card">
          <div class="pa-8">
            <p v-for="e in errors" :key="e.index">{{ e }}</p>
            <v-card-title class="card-title">ルーム参加</v-card-title>
            <v-text-field
              label="ルーム名"
              v-model="roomName"
              class="ma-3"
            ></v-text-field>
            <v-card-actions>
              <v-btn
                color="primary"
                style="margin: auto;"
                outlined
                @click="joinRoom()"
                >参加</v-btn
              >
            </v-card-actions>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import uuid from "node-uuid";

export default {
  components: {},
  data: () => ({
    roomName: "",
    errors: []
  }),
  methods: {
    async createRoom() {
      this.errors = [];
      const id = uuid.v4();
      this.$store.commit("setRoom", id);
      this.$router.push("/board");
    },
    async joinRoom() {
      this.errors = [];
      if (!this.roomName) {
        this.errors.push("ルーム名が空です！");
        return;
      }
      this.$store.commit("setRoom", this.roomName);
      this.$router.push("/board");
    }
  }
};
</script>
<style scoped>
.card-title {
  justify-content: center;
}

.home-card {
  margin: auto auto;
}
</style>
