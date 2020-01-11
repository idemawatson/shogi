<template>
  <v-row justify="center">
    <v-dialog v-model="restartModal" persistent max-width="400">
      <v-card>
        <v-card-title class="headline"
          >再開する対局を選んでください</v-card-title
        >
        <div v-if="saves.length == 0">
          <h5 style="text-align: center;">中断した対局がありません。</h5>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="closeModal(false)"
              >NO</v-btn
            >
          </v-card-actions>
        </div>
        <div v-else class="tablespace">
          <table>
            <th>No.</th>
            <th>日付</th>
            <th>手数</th>
            <tr v-for="[i, s] of saves.entries()" :key="i" @click="gameId=s.game_id" :class="{ selected: gameId == s.game_id }">
              <td>{{i + 1}}</td>
              <td>{{dateString(s.update_date)}}</td>
              <td>{{ s.count }}手目</td>
            </tr>
          </table>
          <v-card-actions style="justify-content: center;">
            <v-btn color="green darken-1" text @click="restart"
              >YES</v-btn
            >
            <v-btn color="green darken-1" text @click="closeModal"
              >NO</v-btn
            >
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
export default {
  data: () => ({
    saves: [],
    gameId: ""
  }),
  computed: {
    dateString: function(date) {
      return function (date) {
        const dt = new Date(date);
        return [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join("/");
      };
    }
  },
  props: ["restartModal"],
  methods: {
    setSaves(saves) {
      this.saves = saves;
    },
    closeModal() {
      this.gameId = "";
      this.$emit("closeModal");
    },
    restart() {
      this.$emit("restart", this.gameId);
      this.closeModal();
    }
  }
};
</script>
<style scoped>
  .selected td{
    background-color: rgb(174, 255, 191);
  }
  .tablespace {
    margin: auto;
    width: 80%;
  }
  .tablespace table {
    margin: 10px auto;
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }
  .tablespace table th {
    border-bottom: solid 1px;
  }
  .tablespace table td {
    text-align: center;
    border-bottom: solid 1px;
  }
</style>
