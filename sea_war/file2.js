drawField(70, 70);
drawField(570, 70);
drawShips();

const myShips = new Fleet(80, 80);
const computerShips = new Fleet(580, 80, myShips);

myShips.opponent = computerShips;
myShips.originX = 70;
myShips.originY = 70;
computerShips.originX = 570;
computerShips.originY = 70;

randomArrangeShips(computerShips);
