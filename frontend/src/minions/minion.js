var Minion = function(name, promoted) {
  this.name = name;
  this.promoted = promoted;
};

Minion.prototype.getName = function() {
  return this.name;
};

Minion.prototype.getImage = function() {
  return this.promoted ? this.name + "_p" : this.name;
};

Minion.prototype.getMoveArea = function() {
  return "";
};

Minion.prototype.promote = function() {
  this.promoted = true;
};

const pushCandidates = (candidates, map) => {
  let areas = [];
  candidates = candidates.filter(c => c.length == 2);
  for (const c of candidates) {
    if (!map.has(c) || !map.get(c)) {
      areas.push(c);
    }
  }
  return areas;
};

const kinAreas = (x, y) => {
  x = Number(x);
  y = Number(y);
  return [
    String(x - 1) + String(y - 1),
    String(x - 1) + String(y),
    String(x) + String(y + 1),
    String(x) + String(y - 1),
    String(x + 1) + String(y - 1),
    String(x + 1) + String(y)
  ];
};

//--------------------------------
//歩

var Hu = function(promoted) {
  Minion.call(this, "Hu", promoted);
};

Hu.prototype = Object.create(Minion.prototype);
Hu.prototype.constructor = Hu;
Hu.prototype.getMoveArea = function(map, minion) {
  const areas = this.promoted
    ? kinAreas(minion.x, minion.y)
    : [minion.x + String(minion.y - 1)];
  return pushCandidates(areas, map);
};

//--------------------------------
//飛車

var Hisya = function(promoted) {
  Minion.call(this, "Hisya", promoted);
};

Hisya.prototype = Object.create(Minion.prototype);
Hisya.prototype.constructor = Hisya;
Hisya.prototype.getMoveArea = function(map, minion) {
  const x = minion.x;
  const y = minion.y;
  let areas = [];
  let start = 1;
  let startV = 1;
  let end = 9;
  let endV = 9;
  for (let i = 1; i < 10; i++) {
    let mathe = String(i) + y;
    if (i < x && map.has(mathe)) {
      start = map.get(mathe) ? i + 1 : i;
    }
    if (i > x && map.has(mathe)) {
      end = map.get(mathe) ? i - 1 : i;
      break;
    }
  }
  for (let i = 1; i < 10; i++) {
    let mathe = x + String(i);
    if (i < y && map.has(mathe)) {
      startV = map.get(mathe) ? i + 1 : i;
    }
    if (i > y && map.has(mathe)) {
      endV = map.get(mathe) ? i - 1 : i;
      break;
    }
  }
  for (let i = start; i <= end; i++) {
    areas.push(String(i) + y);
  }
  for (let i = startV; i <= endV; i++) {
    areas.push(x + String(i));
  }
  if (this.promoted) {
    const numX = Number(x);
    const numY = Number(y);
    areas = areas.concat([
      String(numX - 1) + String(numY + 1),
      String(numX - 1) + String(numY - 1),
      String(numX + 1) + String(numY + 1),
      String(numX + 1) + String(numY - 1)
    ]);
    areas = pushCandidates(areas, map);
  }
  return areas;
};

//--------------------------------
//角行

var Kaku = function(promoted) {
  Minion.call(this, "Kaku", promoted);
};

Kaku.prototype = Object.create(Minion.prototype);
Kaku.prototype.constructor = Kaku;
Kaku.prototype.getMoveArea = function(map, minion) {
  const x = Number(minion.x);
  const y = Number(minion.y);
  let areas = [];
  let left_up = false;
  let left_down = false;
  let right_up = false;
  let right_down = false;
  const push = (direction, toX, toY) => {
    if (direction || !(toX > 0 && toX < 10 && toY > 0 && toY < 10)) {
      return direction;
    }
    const mathe = String(toX) + String(toY);
    if (!map.has(mathe)) {
      areas.push(mathe);
      return direction;
    } else {
      if (!map.get(mathe)) {
        areas.push(mathe);
      }
      return true;
    }
  };
  for (let i = 1; i < 10; i++) {
    left_up = push(left_up, x - i, y + i);
    left_down = push(left_down, x - i, y - i);
    right_up = push(right_up, x + i, y + i);
    right_down = push(right_down, x + i, y - i);
    if (left_up && left_down && right_up && right_down) {
      break;
    }
  }
  if (this.promoted) {
    areas = areas.concat([
      String(x) + String(y + 1),
      String(x) + String(y - 1),
      String(x - 1) + String(y),
      String(x + 1) + String(y)
    ]);
    areas = pushCandidates(areas, map);
  }
  return areas;
};

//--------------------------------
//金将

var Kin = function(promoted) {
  Minion.call(this, "Kin", promoted);
};

Kin.prototype = Object.create(Minion.prototype);
Kin.prototype.constructor = Kin;
Kin.prototype.getMoveArea = function(map, minion) {
  return pushCandidates(kinAreas(Number(minion.x), Number(minion.y)), map);
};

//--------------------------------
//銀将

var Gin = function(promoted) {
  Minion.call(this, "Gin", promoted);
};

Gin.prototype = Object.create(Minion.prototype);
Gin.prototype.constructor = Gin;
Gin.prototype.getMoveArea = function(map, minion) {
  const x = Number(minion.x);
  const y = Number(minion.y);
  const ginAreas = [
    String(x - 1) + String(y + 1),
    String(x - 1) + String(y - 1),
    String(x) + String(y - 1),
    String(x + 1) + String(y + 1),
    String(x + 1) + String(y - 1)
  ];
  return pushCandidates(this.promoted ? kinAreas(x, y) : ginAreas, map);
};

//--------------------------------
//桂馬

var Keima = function(promoted) {
  Minion.call(this, "Keima", promoted);
};

Keima.prototype = Object.create(Minion.prototype);
Keima.prototype.constructor = Keima;
Keima.prototype.getMoveArea = function(map, minion) {
  const x = Number(minion.x);
  const y = Number(minion.y);
  return pushCandidates(
    this.promoted
      ? kinAreas(x, y)
      : [String(x - 1) + String(y - 2), String(x + 1) + String(y - 2)],
    map
  );
};

//--------------------------------
//香車

var Kyosya = function(promoted) {
  Minion.call(this, "Kyosya", promoted);
};

Kyosya.prototype = Object.create(Minion.prototype);
Kyosya.prototype.constructor = Kyosya;
Kyosya.prototype.getMoveArea = function(map, minion) {
  const x = minion.x;
  const y = minion.y;
  let kyoshaAreas = [];
  for (let i = 1; y - i > 0; i++) {
    const mathe = x + String(y - i);
    if (!map.has(mathe)) {
      kyoshaAreas.push(mathe);
    } else {
      if (!map.get(mathe)) {
        kyoshaAreas.push(mathe);
      }
      break;
    }
  }
  return pushCandidates(this.promoted ? kinAreas(x, y) : kyoshaAreas, map);
};

//--------------------------------
//王将

var King = function(promoted) {
  Minion.call(this, "King", promoted);
};

King.prototype = Object.create(Minion.prototype);
King.prototype.constructor = King;
King.prototype.getMoveArea = function(map, minion) {
  const x = Number(minion.x);
  const y = Number(minion.y);
  return pushCandidates(
    kinAreas(x, y).concat([
      String(x - 1) + String(y + 1),
      String(x + 1) + String(y + 1)
    ]),
    map
  );
};

//--------------------------------
//玉将

var Gyoku = function(promoted) {
  Minion.call(this, "Gyoku", promoted);
};

Gyoku.prototype = Object.create(King.prototype);
Gyoku.prototype.constructor = Gyoku;

export default {
  Hu,
  Minion,
  Hisya,
  Kaku,
  Kin,
  Gin,
  Keima,
  Kyosya,
  King,
  Gyoku
};
