<template>
  <div>
    <v-row justify="center">
      <v-dialog v-model="resultModal" persistent max-width="400">
        <v-card>
          <v-card-title class="headline">{{ resultMessage }}</v-card-title>
          <v-img
            :src="require('@/assets/' + result + '.png')"
          ></v-img>
          <v-card-actions>
            <v-btn color="green darken-1" text @click="close()"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
export default {
  data: () => ({
    result: "lose"
  }),
  props: ["resultModal"],
  computed: {
    resultMessage() {
      if (this.result == "win") {
        return "勝利しました！";
      } else if (this.result == "lose") {
        return "敗北しました…";
      } else {
        return "";
      }
    }
  },
  methods: {
    setResult(result) {
      this.result = result;
    },
    close() {
      this.$emit("end");
    }
  }
}
</script>