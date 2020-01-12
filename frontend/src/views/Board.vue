<template>
  <div class="body">
    <v-container class="grey lighten-5">
      <h2 class="roomId" style="text-align: center;">RoomID: {{ roomId }}</h2>
      <div v-if="!started" style="text-align: center; margin-top: 8px;">
        <v-btn outlined color="primary" @click="startGame">ゲーム開始</v-btn>
      </div>
      <div v-if="!started" style="text-align: center; margin-top: 8px;">
        <v-btn outlined color="primary" @click="restartModal = true"
          >ゲーム再開</v-btn
        >
        <RestartModal
          :restartModal="restartModal"
          ref="restartModal"
          @closeModal="restartModal = false"
          @restart="restart"
        ></RestartModal>
      </div>
      <div v-if="started" id="scrollBody" style="height: 750px">
        <PromotionModal
          ref="promotionModal"
          :promotionModal="promotionModal"
          @promotion="move"
        ></PromotionModal>
        <h2 style="text-align: center;">{{ count }} 手目</h2>
        <h2 style="text-align: center;">
          {{ side == 1 ? "先手" : "後手" }} :
          {{ turn == userId ? "あなた" : "相手" }}の手番です
        </h2>
        <div style="text-align: right; margin-top: 8px;">
          <v-btn outlined color="red" @click="breakGame">ゲーム中断</v-btn>
        </div>
        <GiveUp v-if="started" @giveUp="giveUp"></GiveUp>
        <ResultModal
          ref="resultModal"
          :resultModal="resultModal"
          @end="breakGame"
        ></ResultModal>
        <v-row style="height: 100%">
          <v-col cols="2" class="holding counterpart-side">
            <Holding :holds="counter_holding"></Holding>
          </v-col>
          <v-col cols="8" class="board">
            <v-card class="board-body" raised>
              <ul class="column">
                <li v-for="n in 9" :key="n">
                  <ul class="line">
                    <li v-for="k in 9" :key="k">
                      <v-card
                        class="pa-2 mass"
                        outlined
                        tile
                        :class="areaClass(n, k)"
                        @click="action(String(n), String(k), false)"
                      >
                        <div v-for="m in minions" :key="m.index">
                          <div v-if="n == m.x && k == m.y">
                            <v-img
                              v-if="m.obj"
                              :src="
                                require('@/assets/' + m.obj.getImage() + '.png')
                              "
                              @click.stop="select(m)"
                              :class="getSide(m.side)"
                            ></v-img>
                          </div>
                        </div>
                      </v-card>
                    </li>
                  </ul>
                </li>
              </ul>
            </v-card>
          </v-col>
          <v-col cols="2" class="holding own-side">
            <Holding
              :holds="holding"
              :selected="holds_selected"
              @showPutAreas="showPutAreas"
            ></Holding>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>
<script>
import Factory from "@/scripts/minionFactory.js";
import { mapState } from "vuex";
import io from "socket.io-client";
import Api from "@/api/api.js";
import Holding from "@/components/Holding";
import PromotionModal from "@/components/PromotionModal";
import RestartModal from "@/components/RestartModal";
import GiveUp from "@/components/GiveUp";
import ResultModal from "@/components/ResultModal";

const SOCKET_HOST = process.env.VUE_APP_API_HOST || "http://localhost:7000";
// const SOCKET_PORT = process.env.VUE_APP_API_PORT || "7000";
const NON_PROMOTION_MINION = ["Kin", "King", "Gyoku"];
const parseIfJSON = target => {
  return typeof target == "string" ? JSON.parse(target) : target;
};

export default {
  components: {
    Holding,
    PromotionModal,
    RestartModal,
    GiveUp,
    ResultModal
  },
  data: () => ({
    areas: [],
    minions: [],
    selected: {},
    map: {},
    socket: "",
    moves: [],
    errors: [],
    board: [],
    putting: false,
    holding: [],
    counter_holding: [],
    holds_selected: "",
    turn: "",
    promotionModal: false,
    restartModal: false,
    count: 0,
    resultModal: false
  }),
  computed: {
    ...mapState(["roomId", "userId", "counterId", "started", "side", "gameId"]),
    getImage(x, y) {
      return this.minions[x + y].image;
    }
  },
  async created() {
    if (!this.started) {
      this.getSaves();
    }
    // this.socket = io(SOCKET_HOST + ":" + SOCKET_PORT + "/socket-board");
    this.socket = io(SOCKET_HOST + "/socket-board");
    this.socket.emit("init", { userId: this.userId, roomId: this.roomId });
    if (this.started) {
      const body = await Api.getBoard({ gameId: this.gameId });
      this.board = JSON.parse(body.data.board);
      this.setHoldings(body.data);
      this.setMinions();
      this.turn = body.data.turn;
      this.count = body.data.count;
    }
    this.socket.on("errorEvent", err => {
      alert(err);
    });
    this.socket.on("start-game", body => {
      this.settingsGame(body);
    });
    this.socket.on("restart-game", body => {
      this.settingsGame(body);
      this.setHoldings(body);
      this.count = body.count;
    });
    this.socket.on("send-move", move => {
      for (let min of this.minions) {
        if (min.x == move.before[0] && min.y == move.before[1]) {
          this.selected = min;
          break;
        }
      }
      this.areas = move.areas;
      this.move(move.after[0], move.after[1], true, move.promote);
    });
    this.socket.on("send-put", put => {
      this.holds_selected = put.name;
      this.areas = put.areas;
      this.put(put.point[0], put.point[1], put.side);
    });
    this.socket.on("win", () => {
      this.$refs.resultModal.setResult("win");
      this.resultModal = true;
    });
    this.socket.on("onBreak", () => {
      this.$store.commit("breakGame");
      this.$router.push("/");
    });
  },
  methods: {
    startGame() {
      this.socket.emit("start", this.roomId, new Date());
    },
    breakGame() {
      this.resultModal = false;
      this.socket.emit("break", this.roomId);
      this.$store.commit("breakGame");
      this.$router.push("/");
    },
    async giveUp() {
      await Api.giveUp({ gameId: this.gameId });
      this.$refs.resultModal.setResult("lose");
      this.resultModal = true;
      this.socket.emit("giveUp", this.roomId);
    },
    settingsGame(body) {
      this.$store.commit("setGameId", body.game_id);
      if (body.p1_id == this.userId) {
        this.$store.commit("setSide", 1);
        this.$store.commit("setCounterId", body.p2_id);
      } else if (body.p2_id == this.userId) {
        this.$store.commit("setSide", 2);
        this.$store.commit("setCounterId", body.p1_id);
      } else {
        alert("Game Start error.");
        return;
      }
      this.board = JSON.parse(body.board);
      this.setMinions();
      this.turn = body.turn;
      this.$store.commit("changeStartStatus");
    },
    async getSaves() {
      const saves = await Api.getSaves({ info: this.userId });
      this.$refs.restartModal.setSaves(saves.data.data);
    },
    restart(gameId) {
      this.socket.emit("restart", this.roomId, gameId);
    },
    setMinions() {
      var map = new Map();
      for (let b of this.board) {
        let x = b.x;
        let y = b.y;
        if (this.side != 1) {
          x = String(10 - x);
          y = String(10 - y);
        }
        var minion = {
          x: x,
          y: y,
          side: b.side,
          obj: Factory.create(b.type, b.promoted)
        };
        this.minions.push(minion);
        map.set(x + y, this.side == b.side);
        this.map = map;
      }
    },
    select(minion) {
      if (this.turn != this.userId) {
        return;
      }
      if (this.putting) {
        this.holds_selected = "";
        this.clear();
        this.putting = false;
      }
      if (this.areas.length > 0) {
        if (this.selected == minion) {
          this.clear();
        } else {
          this.action(minion.x, minion.y);
        }
        return;
      }
      if (this.side == minion.side) {
        this.selected = minion;
        this.areas = minion["obj"].getMoveArea(this.map, minion, this.side);
      }
    },
    action(n, k) {
      if (this.turn != this.userId) {
        return;
      }
      if (this.putting) {
        this.put(n, k, this.side);
      } else {
        if (this.canPromote(n, k)) {
          this.$refs.promotionModal.openModal(n, k);
        } else {
          this.move(n, k, false, false);
        }
      }
    },
    canPromote(n, k) {
      return (
        this.areas.includes(String(n) + String(k)) &&
        k <= 3 &&
        !this.selected.obj.promoted &&
        !NON_PROMOTION_MINION.includes(this.selected.obj.getName())
      );
    },
    move(n, k, isReceived, isPromotion) {
      for (let area of this.areas) {
        var toX = area[0];
        var toY = area[1];
        if (toX == n && toY == k) {
          let map = this.map;
          this.kill(map, toX, toY, isReceived);
          map.delete(this.selected["x"] + this.selected["y"]);
          map.set(toX + toY, this.selected["side"] == this.side);
          this.map = map;
          var fromX = this.selected["x"];
          var fromY = this.selected["y"];
          this.selected["x"] = toX;
          this.selected["y"] = toY;
          if (isPromotion) {
            this.selected.obj.promote();
          }
          this.turn = this.userId;
          if (!isReceived) {
            this.sendMoveSocket(fromX, fromY);
            this.save();
            this.turn = this.counterId;
          }
          this.clear();
          this.count += 1;
          break;
        }
      }
      this.clear();
    },
    put(toX, toY, s) {
      if (!this.areas.includes(String(toX) + String(toY))) {
        return;
      }
      const m = {
        x: toX,
        y: toY,
        side: s,
        obj: Factory.create(this.holds_selected)
      };
      const isSelf = this.side == s;
      this.selected = m;
      let map = this.map;
      map.set(String(toX) + String(toY), isSelf);
      this.map = map;
      this.minions.push(m);
      this.removeHoldings(isSelf);
      this.turn = this.userId;
      if (isSelf) {
        this.sendPutSocket();
        this.save();
        this.turn = this.counterId;
      }
      this.putting = false;
      this.holds_selected = "";
      this.clear();
      this.count += 1;
    },
    clear() {
      this.selected = {};
      this.areas = [];
    },
    sendMoveSocket(fromX, fromY) {
      const toX = 10 - this.selected["x"];
      const toY = 10 - this.selected["y"];
      const move = {
        name: this.selected.obj.getName(),
        before: [10 - fromX, 10 - fromY],
        after: [String(toX), String(toY)],
        areas: [String(toX) + String(toY)],
        promote: this.selected.obj.promoted,
        roomId: this.roomId,
        userId: this.userId
      };
      this.socket.emit("move", move);
    },
    sendPutSocket() {
      const put = {
        name: this.selected.obj.getName(),
        point: [String(10 - this.selected.x), String(10 - this.selected.y)],
        side: this.side,
        areas: [String(10 - this.selected.x) + String(10 - this.selected.y)],
        roomId: this.roomId,
        userId: this.userId
      };
      this.socket.emit("put", put);
    },
    kill(map, toX, toY, isReceived) {
      for (let m of this.minions) {
        if (m.x == toX && m.y == toY) {
          this.minions = this.minions.filter(min => min != m);
          this.changeAmount(m, isReceived);
          return;
        }
      }
    },
    changeAmount(m, isReceived) {
      let holding = !isReceived ? this.holding : this.counter_holding;
      for (let i = 0; i < holding.length; i++) {
        if (holding[i].name == m.obj.getName()) {
          holding[i].amount += 1;
          return;
        }
      }
      holding.push({ name: m.obj.getName(), amount: 1 });
    },
    save() {
      let board = [];
      for (let m of this.minions) {
        var b = {
          x: this.side == 1 ? m.x : String(10 - m.x),
          y: this.side == 1 ? m.y : String(10 - m.y),
          type: m.obj.getName(),
          side: m.side,
          promoted: m.obj.promoted
        };
        board.push(b);
      }
      const holds = {};
      if (this.side == 1) {
        holds.p1 = this.holding;
        holds.p2 = this.counter_holding;
      } else {
        holds.p1 = this.counter_holding;
        holds.p2 = this.holding;
      }
      holds.turn = this.userId;
      holds.next = this.counterId;
      Api.save({
        board: board,
        gameId: this.gameId,
        holding: holds,
        count: this.count,
        date: new Date()
      });
      this.board = board;
    },
    showPutAreas(name) {
      if (this.turn != this.userId) {
        return;
      }
      this.clear();
      if (this.holds_selected == name) {
        this.holds_selected = "";
        this.putting = false;
        return;
      }
      this.holds_selected = name;
      var putAreas = [];
      let huCols = [];
      for (const m of this.minions) {
        if (
          m.obj.getName() == "Hu" &&
          m.side == this.side &&
          !huCols.includes(m.x)
        ) {
          huCols.push(m.x);
        }
      }
      for (var i = 1; i <= 9; i++) {
        if (this.holds_selected == "Hu" && huCols.includes(String(i))) {
          continue;
        }
        for (var j = 1; j <= 9; j++) {
          const area = String(i) + String(j);
          if (!this.map.has(area)) {
            putAreas.push(area);
          }
        }
      }
      this.putting = true;
      this.areas = putAreas;
    },
    removeHoldings(isSelf) {
      let holds = isSelf ? this.holding : this.counter_holding;
      for (let h of holds) {
        if (h.name == this.holds_selected) {
          h.amount -= 1;
          break;
        }
      }
      if (isSelf) {
        this.holding = holds.filter(m => m.amount > 0);
      } else {
        this.counter_holding = holds.filter(m => m.amount > 0);
      }
    },
    areaClass(x, y) {
      if (this.areas.includes(String(x) + String(y))) {
        return "moveArea";
      }
    },
    getSide(side) {
      if (side != this.side) {
        return "counterSide";
      }
    },
    setHoldings(body) {
      if (body.p1_id == this.userId) {
        this.holding = parseIfJSON(body.p1_holding);
        this.counter_holding = parseIfJSON(body.p2_holding);
      } else {
        this.holding = parseIfJSON(body.p2_holding);
        this.counter_holding = parseIfJSON(body.p1_holding);
      }
    }
  }
};
</script>
<style scoped>
.body {
  width: 1200px;
  height: 800px;
  margin: 50px auto;
}
.roomId {
  text-align: center;
  margin-top: 100px;
}
.board {
  position: relative;
}
.board-body {
  position: absolute;
  width: 650px;
  height: 650px;
  left: 75px;
  background-color: rgb(255, 250, 226);
}
.column {
  list-style-type: none;
  position: absolute;
  width: 585px;
  left: 30px;
  top: 30px;
  background-color: inherit;
  padding-left: 0;
}
.line {
  list-style-type: none;
  float: left;
  padding: 0;
}
.mass {
  border: solid 1px rgb(85, 73, 73) !important;
  height: 65px;
  width: 65px;
  background-color: rgb(253, 240, 181);
}
.moveArea {
  background-color: rgb(205, 250, 116) !important;
}
.counterSide {
  transform: scale(1, -1);
}
.holding {
  position: relative;
}
.own-side {
  padding-left: 0;
}
.own-side .holding-body {
  position: absolute;
  width: 100%;
  bottom: 5%;
}
.counterpart-side .holding-body {
  position: absolute;
  width: 100%;
  top: 5%;
}
.v-responsive__sizer {
  padding-bottom: 100% !important;
}
</style>
