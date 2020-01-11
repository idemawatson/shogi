<template>
  <div class="holding-body">
    <v-card raised class="holding-card" v-if="holds.length">
      <ul>
        <table class="pt-2 pb-2">
          <tr v-for="h of holds" :key="h.name">
            <td>
              <v-card
                class="piece"
                :class="{ selected: selected == h.name }"
                @click="showPutAreas(h.name)"
              >
                <v-img
                  :src="require('@/assets/' + h.name + '.png')"
                  aspect-ratio="1.0"
                ></v-img>
              </v-card>
            </td>
            <td>
              <div style="font-size: 24px">× {{ h.amount }}</div>
            </td>
          </tr>
        </table>
      </ul>
    </v-card>
  </div>
</template>
<script>
export default {
  props: ["holds", "selected"],
  methods: {
    showPutAreas(name) {
      this.$emit("showPutAreas", name);
    }
  }
};
</script>
<style scoped>
.holding-card {
  background-color: rgb(189, 218, 255);
}
ul {
  list-style-type: none;
  padding: 0;
}
ul table {
  margin: auto;
}
ul table td {
  padding: 5px;
}
.selected {
  border: solid 3px red;
}
.piece {
  height: 50px;
  width: 50px;
}
</style>
