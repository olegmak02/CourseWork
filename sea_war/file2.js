drawField(70, 70);
drawField(570, 70);
drawShips();

const delay = 700;
const unchosenShips = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
const unchosenCompShips = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];

const beginShip = {
  x: undefined,
  y: undefined,
};
const endShip = {
  x: undefined,
  y: undefined,
};

const myShips = new Fleet(70, 70);
const computerShips = new Fleet(570, 70, myShips);

myShips.opponent = computerShips;
myShips.originX = 70;
myShips.originY = 70;
computerShips.originX = 570;
computerShips.originY = 70;

let end = false;
let rand = 1;
let directs = [true, true, true, true];
let firstHit = [];
let lastHit = [];
let shootX;
let shootY;

randomArrangeShips(computerShips);
