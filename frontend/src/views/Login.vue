<template>
  <v-container fluid>
    <v-row align="center" justify="center" style="height: 500px;">
      <v-col cols="8" md="8" lg="6">
        <v-card class="home-card">
          <div class="pa-8">
            <v-card-title class="card-title">ログイン</v-card-title>
            <p v-for="e in errors" :key="e.index" style="color: red;">
              {{ e }}
            </p>
            <v-text-field
              label="ユーザー名"
              v-model="userName"
              class="ma-3"
            ></v-text-field>
            <v-text-field
              label="パスワード"
              v-model="password"
              class="ma-3"
            ></v-text-field>
            <v-card-actions>
              <v-btn
                color="primary"
                style="margin: auto;"
                outlined
                @click="login()"
                >ログイン</v-btn
              >
              <v-btn
                color="orange"
                style="margin: auto;"
                outlined
                @click="signUp()"
                >新規登録</v-btn
              >
            </v-card-actions>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  components: {},
  data: () => ({
    userName: "",
    password: "",
    errors: []
  }),
  methods: {
    validate() {
      this.errors = [];
      if (!this.userName || !this.password) {
        this.errors.push("ユーザー名とパスワードを入力してください");
      }
      if (this.userName.length > 10 || this.password.length > 10) {
        this.errors.push("ユーザー名とパスワードは10文字までです");
      }
    },
    async login() {
      this.validate();
      if (this.errors[0]) {
        return;
      }
      const error = await this.$store.dispatch("login", {
        name: this.userName,
        password: this.password
      });
      if (error) {
        this.errors.push(error);
      }
      this.$router.push("/board");
    },
    async signUp() {
      this.errors = [];
      if (!this.userName || !this.password) {
        this.errors.push("ユーザー名とパスワードを入力してください");
        return;
      }
      const error = await this.$store.dispatch("signUp", {
        name: this.userName,
        password: this.password
      });
      if (error) {
        this.errors.push(error);
      }
      this.$router.push("/board");
    }
  }
};
</script>
