<template>
  <v-row justify="center">
    <v-dialog v-model="promotionModal" persistent max-width="290">
      <v-card>
        <v-card-title class="headline"
          >成りますか？</v-card-title
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="closeModal(true)"
            >YES</v-btn
          >
          <v-btn color="green darken-1" text @click="closeModal(false)"
            >NO</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
export default {
  data: () => ({
    promotionModal: false,
    toX: "",
    toY: ""
  }),
  methods: {
    openModal(toX, toY) {
      this.toX = toX;
      this.toY = toY;
      this.promotionModal = true;
    },
    closeModal(promotion) {
      this.$emit('promotion', this.toX, this.toY, false, promotion);
      this.toX = null;
      this.toY = null;
      this.promotionModal = false;
    }
  }
}
</script>
