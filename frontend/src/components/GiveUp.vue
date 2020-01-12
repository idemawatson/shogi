<template>
  <div style="text-align: right; margin-top: 8px;">
    <v-btn outlined color="primary" @click="modal = true">投了</v-btn>
    <v-row justify="center">
      <v-dialog v-model="modal" persistent max-width="400">
        <v-card>
          <v-card-title class="headline">投了しますか？</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="giveUp()">はい</v-btn>
            <v-btn color="green darken-1" text @click="closeModal()"
              >いいえ</v-btn
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
    modal: false
  }),
  methods: {
    closeModal() {
      this.modal = false;
    },
    giveUp() {
      this.$emit("giveUp");
      this.modal = false;
    }
  }
};
</script>
