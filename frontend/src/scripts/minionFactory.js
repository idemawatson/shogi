import Minions from "@/minions/minion.js";

export default {
  create(name, promoted) {
    let minion = Minions[name];
    if (!minion) {
      return;
    }
    return new minion(promoted);
  }
};
