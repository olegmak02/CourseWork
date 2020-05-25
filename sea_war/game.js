const canv = document.getElementById('canvas');
const context = canv.getContext('2d');
context.font = '30px serif';
canv.width = 1000;
canv.height = 1000;

context.lineWidth = 1;
context.strokeStyle = 'black';
context.strokeRect(300, 700, 570, 250);
context.stroke();
context.font = '30px serif';
context.fillText('Ваше поле', 190, 30, 200);
context.fillText('Поле противника', 660, 30, 300);

const sizeOfCell = 35;
const delay = 700;
let end = false;
let rand = 1;
let directs = [true, true, true, true];
let firstHit = [];
let lastHit = [];
let shootX;
let shootY;

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

let onField = true;

function outputMessage(str, x = 410, y = 800) {
  if (str === 'Ваш ход' ) {
    context.font = '60px serif';
  }

  context.fillStyle = 'black'; 
  context.fillText(str, x, y);
  context.fillStyle = 'white';
}

function clearMessage() {
  context.strokeStyle = 'white';
  context.fillStyle = 'white';
  context.fillRect(305, 705, 560, 240);
}

function drawField(startX, startY) {
  context.beginPath();
  for (let i = 1; i < 12; i++) {
    context.moveTo(startX + i * sizeOfCell, startY);
    context.lineTo(startX + i * sizeOfCell, startY + sizeOfCell * 11);
  }
  context.stroke();
  for (let i = 1; i < 12; i++) {
    context.moveTo(startX, startY + i * sizeOfCell);
    context.lineTo(startX + sizeOfCell * 11, startY + i * sizeOfCell);
  }
  context.stroke();

  let arrayLetters = 'АБВГДЕЖЗИЙ';
  context.font = '27px serif';

  for (let i = 0; i < 10; i++) {
    let letter = arrayLetters[i];
    context.fillText(letter, startX + (i + 1.2) * sizeOfCell, startY + 23);
  } 

  for (let i = 1; i < 11; i++) {
    context.fillText(i, startX + 5, startY + (i + 0.7) * sizeOfCell);
  }
}

function drawCross(cellX, cellY, player) {
  if (cellX > 0 && cellX < 11 && cellY > 0 && cellY < 11) {
    
    context.beginPath();
    let originX = player.originX;
    let originY = player.originY;
    context.moveTo(originX + sizeOfCell * cellX + 5, originY + sizeOfCell * cellY + 5);
    context.lineTo(originX + sizeOfCell * (cellX + 1) - 5, originY + sizeOfCell * (cellY + 1) - 5);
    context.moveTo(originX + sizeOfCell * (cellX + 1) - 5, originY + sizeOfCell * cellY + 5);
    context.lineTo(originX + sizeOfCell * cellX + 5, originY + sizeOfCell * (cellY + 1) - 5);
    context.lineWidth = 5;
    context.strokeStyle = 'red';
    context.stroke();
  }
}

function drawPoint(cellX, cellY, player) {
  if (cellX > 0 && cellX < 11 && cellY > 0 && cellY < 11) {
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = 'blue';
    let originX = player.originX;
    let originY = player.originY;
    context.fillStyle = 'blue';
    context.arc(originX + sizeOfCell * cellX + 17, originY + sizeOfCell * cellY + 17, 7, 0, Math.PI * 2, false);
    context.stroke();
    context.fill();
  }
}

class Ship {
  constructor(startX, startY, endX, endY, direction, length) {
    this.length = length;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.direction = direction;
    this.alive = true;
    this.coordsX = [];
    this.coordsY = [];
    this.cells = new Array(length).fill(1);
    for (let i = 0; i < length; i++) {
      if (direction) {
        this.coordsX[i] = startX + i;
        this.coordsY[i] = startY;
      } else {
        this.coordsX[i] = startX;
        this.coordsY[i] = startY + i;
      }
    }
  }

  isAlive() {
    return this.cells.includes(1);
  }

  findByCoord(x, y) {
    for (let i = 0; i < this.length; i++) {
      if (this.coordsX[i] == x && this.coordsY[i] == y) {
        return true;
      }
    }
    return false;
  }

  damage(x, y) {
    let ind;
    if (this.direction) {
      ind = this.coordsX.indexOf(x);
    } else {
      ind = this.coordsY.indexOf(y);
    }
    this.coordsX[ind] = 0;
    this.coordsY[ind] = 0;
    this.cells[ind] = 0;
  }

}

class Fleet {
  constructor(originX, originY, opponent) {
    this.allShips = new Array(10);
    this.opponent = opponent;
    this.killedShips = [];
    this.originX = originX;
    this.originY = originY;
    this.coordinateShips = new Array(12);
    for (let i = 0; i < 12; i++) {
      this.coordinateShips[i] = new Array(12).fill(0);                    // matrix of ship arrangment: 0 - empty cell; 1 - ship; 2 - cell near with ship
    }                          
  }

  addNewShip(startCellX, startCellY, direction, length, arrayShips) {                       // direction:  0 - vertically; 1 - horizontally;
    let index = arrayShips.indexOf(length);
    let endCellX;
    let endCellY;
    
    if (direction) {
      endCellX = startCellX + length - 1;
      endCellY = startCellY;
    } else {
      endCellX = startCellX;
      endCellY = startCellY + length - 1;
    }
    
    if(endCellX > 10 || endCellY > 10) {
      return [false];
    }
    
    let checkTouchStart = this.coordinateShips[startCellY][startCellX];

    let checkTouchEnd = this.coordinateShips[endCellY][endCellX];

    if (checkTouchStart > 0 || checkTouchEnd > 0) {
      return [false, 'Корабли не должны соприкасаться'];
    }
    if (index > -1) {
        if (arrayShips === unchosenShips) {
          let lastShip = arrayShips.length - 1;
          arrayShips[index] = arrayShips[lastShip];
          arrayShips.pop();
      }
    } else {
      return [false, 'Корабль данной длины нельзя размещать.'];
    }

    switch (length) {
      case 1: 
        for (let i = 0; i < 4; i++) {
          if (this.allShips[i] === undefined) {
            this.allShips[i] = new Ship(startCellX, startCellY, endCellX, endCellY, direction, 1);
            break;
          }
        }
      break;
      case 2:
          for (let i = 4; i < 7; i++) {
            if (this.allShips[i] === undefined) {
              this.allShips[i] = new Ship(startCellX, startCellY, endCellX, endCellY, direction, 2);
              break;
            }
          }
      break;
      case 3:
          for (let i = 7; i < 9; i++) {
            if (this.allShips[i] === undefined) {
              this.allShips[i] = new Ship(startCellX, startCellY, endCellX, endCellY, direction, 3);
              break;
            }
          }
      break;
      case 4:
          if (this.allShips[9] === undefined) {
            this.allShips[9] = new Ship(startCellX, startCellY, endCellX, endCellY, direction, 4);
          }
      break;
    }

    if (direction) {
      for (let k = startCellX; k < endCellX + 1; k++) {
        this.coordinateShips[startCellY][k] = 1;
        this.coordinateShips[startCellY - 1][k] = 2;
        this.coordinateShips[startCellY + 1][k] = 2;
      }
      for (let t = startCellY - 1; t < startCellY + 2; t++) {
        this.coordinateShips[t][startCellX - 1] = 2;
        this.coordinateShips[t][endCellX + 1] = 2;
      }
    } else {
      for (let i = startCellY; i < endCellY + 1; i++) {
        this.coordinateShips[i][startCellX] = 1;
        this.coordinateShips[i][startCellX - 1] = 2;
        this.coordinateShips[i][startCellX + 1] = 2;
      }
      for (let y = startCellX - 1; y < startCellX + 2; y++) {
        this.coordinateShips[startCellY - 1][y] = 2;
        this.coordinateShips[endCellY + 1][y] = 2;
      }
    }
    return [true];
  }

  isAliveShips() {
    for (let i = 0; i < 10; i++) {
      if (this.allShips[i] === undefined) {
        continue;
      }
      let alive = this.allShips[i].isAlive();
      if (alive) {
        return true;
      }
    }
    return false;
  }

  killShip(index, ship) {
    let startCellX = ship.startX;
    let startCellY = ship.startY;
    let direction = ship.direction;
    let endCellX = ship.endX;
    let endCellY = ship.endY;
    this.killedShips.push(this.allShips[index]);
    this.allShips[index].alive = false;

    if (direction) {
      for (let k = startCellX; k < endCellX + 1; k++) {
        this.coordinateShips[startCellY - 1][k] = 3;
        this.coordinateShips[startCellY + 1][k] = 3;
        drawPoint(k, startCellY - 1, this);
        drawPoint(k, startCellY + 1, this);
      }
      for (let t = startCellY - 1; t < startCellY + 2; t++) {
        this.coordinateShips[t][startCellX - 1] = 3;
        this.coordinateShips[t][endCellX + 1] = 3;
        drawPoint(startCellX - 1,t, this);
        drawPoint(endCellX + 1, t, this);
      }
    } else {
      for (let i = startCellY; i < endCellY + 1; i++) {
        this.coordinateShips[i][startCellX - 1] = 3;
        this.coordinateShips[i][startCellX + 1] = 3;
        drawPoint(startCellX - 1, i, this);
        drawPoint(endCellX + 1, i, this);
      }
      for (let y = startCellX - 1; y < startCellX + 2; y++) {
        this.coordinateShips[startCellY - 1][y] = 3;
        this.coordinateShips[endCellY + 1][y] = 3;
        drawPoint(y, startCellY - 1, this);
        drawPoint(y, endCellY + 1, this);
      }
    }
  }

  shoot(x, y) {
    if (this.coordinateShips[y][x] !== 1) {
        if (this.coordinateShips[y][x] !== 3) {      
        drawPoint(x, y, this);
        this.coordinateShips[y][x] = 3;
        return [false];
      } else {
        return [false];
      }
    } else {
      let ship;
      let index;
      for (index = 0; index < 10; index++) {
        let result = this.allShips[index].findByCoord(x, y);
        if (result) {
          ship = this.allShips[index];
          break;
        }
      }

      ship.damage(x, y);
      drawCross(x, y, this);
      this.coordinateShips[y][x] = 3;

      if (!ship.isAlive()) {
        this.killShip(index, ship);
      }

      return [true, ship.isAlive()];
    }
  }
}

function coordinateAtField(coor) {
  let numberOfCellX = Math.floor((coor.x - 80) / sizeOfCell);  
  let numberOfCellY = Math.floor((coor.y - 80) / sizeOfCell);
  return [numberOfCellX, numberOfCellY];
}

function cellAtEnemyField(x, y) {
  let numberOfCellX = Math.floor((x - 570) / sizeOfCell);  
  let numberOfCellY = Math.floor((y - 70) / sizeOfCell);
  return [numberOfCellX, numberOfCellY];
}

function click(e) {
  let clickX = e.clientX;
  let clickY = e.clientY;
  if (clickX > 390 && clickX < 830 && clickY > 520 && clickY < 660) {
    context.fillStyle = 'white';
    context.strokeStyle = 'white';
    context.fillRect(375, 505, 500, 160);
    game();
  }
}

function mousemove(e) {
  if (e.clientY < 465 && e.clientX < 465 && e.clientY >= 115 && e.clientX >=115) {
    onField = true;
  } else {
    onField = false;
  }
}

function mousedown(e) {
  if (onField) {
    beginShip.x = e.clientX;
    beginShip.y = e.clientY;
  } else {
    beginShip.x = undefined;
    beginShip.y = undefined;
  }
}

function mouseup(c) {
  clearMessage();
  outputMessage('Расставьте корабли');
  outputMessage('на вашем поле', 410, 840);
  if (onField) {
    endShip.x = c.clientX;
    endShip.y = c.clientY;

    let [beginCellX, beginCellY] = coordinateAtField(beginShip);
    let [endCellX, endCellY] = coordinateAtField(endShip);

    if (endCellX < beginCellX) {
      let a = endCellX;
      endCellX = beginCellX;
      beginCellX = a; 
    }

    if (endCellY < beginCellY) {
      let a = endCellY;
      endCellY = beginCellY;
      beginCellY = a; 
    }

    const widthShip = endCellX - beginCellX + 1;
    const heightShip = endCellY - beginCellY + 1;

    let length;

    if (widthShip > heightShip) {
      length = widthShip;
    } else if (heightShip > widthShip) {
      length = heightShip;
    } else {
      length = 1;
    }

    if (widthShip < 2 || heightShip < 2) {
      let direction = (beginCellX == endCellX) ? 0 : 1;
      let check = myShips.addNewShip(beginCellX, beginCellY, direction, length, unchosenShips );
      if (check[0]) {
        context.fillStyle = 'black';
        context.fillRect(beginCellX * sizeOfCell + 70, beginCellY * sizeOfCell + 70, widthShip * sizeOfCell, heightShip * sizeOfCell);
      } else {
        clearMessage();
        outputMessage(check[1], 330, 800);
        if (check[1] === 'Корабль данной длины нельзя размещать.') {
          outputMessage(`Вам доступны корабли с длинами:`, 330, 850);
          outputMessage(`${unchosenShips}`, 330, 900);
        }
      }
    }
  }

  if (unchosenShips.length == 0) {
    canv.removeEventListener('mousemove', mousemove);
    canv.removeEventListener('mousedown', mousedown);
    canv.removeEventListener('mouseup', mouseup);
    clearMessage();
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    context.strokeRect(380, 510, 450, 150);
    context.fillText(`Нажмите сюда, чтобы начать битву`, 400, 575);
    canv.addEventListener('mousedown', click);
  }
}

function drawShips() {
  canv.addEventListener('mousemove', mousemove);
  canv.addEventListener('mousedown', mousedown);
  canv.addEventListener('mouseup', mouseup);
  outputMessage('Расставьте корабли');
  outputMessage('на вашем поле', 410, 840);
}

function randomArrangeShips() {
  for (let index = 0; index < 10; index++) {
    let randX = Math.floor(Math.random() * 10 + 1);
    let randY = Math.floor(Math.random() * 10 + 1);
    let randDirection = Math.round(Math.random());
    let check = computerShips.addNewShip(randX, randY, randDirection, unchosenCompShips[index], unchosenCompShips);
    if (!check[0]) {
      index--; 
    }
  }
}

let allowShoot;
function onEnemyField(e) {
  if (e.clientX > 615 && e.clientX < 965 && e.clientY > 115 && e.clientY < 465) {
    allowShoot = true;
  } else {
    allowShoot = false;
  }
}

function choosePlayer(x, y) {
  let chooseX = x;
  let chooseY = y;
  let cell = computerShips.coordinateShips[chooseY][chooseX];
  let resultOfShoot = computerShips.shoot(chooseX, chooseY);
  if (cell == 3) {
    return;
  } else {
    if (resultOfShoot[0]) {
      if (!computerShips.isAliveShips()) {
        canv.removeEventListener('mousedown', move);
        clearMessage();
        outputMessage('Вы победили');
        return;
      }
      clearMessage();
      outputMessage('Ваш ход', 480, 820);
      return;
    } else {
      clearMessage();
      outputMessage('Ход компьютера', 390, 830);
      canv.removeEventListener('mousedown', move);
      setTimeout(chooseComputer, delay);
    }
  }
}

function chooseComputer() {
  if (rand === 1) {
    shootX = Math.floor(Math.random() * 10 + 1);
    shootY = Math.floor(Math.random() * 10 + 1);
  } 

  if (shootX > 10 || shootX < 1 || shootY > 10 || shootY < 1) {
    algorithmShootComp('false');
    chooseComputer();
    return;
  }

  let cell = myShips.coordinateShips[shootY][shootX];
  let resultOfShoot = myShips.shoot(shootX, shootY);
  
  if (cell == 3) {
    algorithmShootComp('false');
    chooseComputer();
  } else {
    if (resultOfShoot[0]) {
      rand = 0;
      algorithmShootComp('true', shootX, shootY);
      if (!myShips.isAliveShips()) {
        end = true;
        canv.removeEventListener('mousedown', move);
        canv.removeEventListener('mousemove', onEnemyField);
        clearMessage();
        outputMessage('Вы проиграли');
        return;
      } else {
        setTimeout(chooseComputer, delay);
      }
      if (!resultOfShoot[1]) {
        rand = 1;
        algorithmShootComp('delete');
      }
    } else {
      algorithmShootComp('false');
      clearMessage();
      outputMessage('Ваш ход', 480, 820);
      if (!end) {
        canv.addEventListener('mousedown', move);
      }
      return;
    }
  }
}

function game() {
  canv.removeEventListener('mousedown', click);
  canv.addEventListener('mousedown', move);
  canv.addEventListener('mousemove', onEnemyField);
  clearMessage();
  outputMessage('Ваш ход', 480, 820);
}

function move(c) {
  if (allowShoot) {
    let x = c.offsetX;
    let y = c.offsetY;
    [x, y] = cellAtEnemyField(x, y);
    choosePlayer(x, y);
  }
}

function algorithmShootComp(str, hitX, hitY) {
  if (str === 'true') {
    lastHit[0] = hitX;
    lastHit[1] = hitY;
    if (firstHit.length === 0) {
      firstHit[0] = hitX;
      firstHit[1] = hitY;
    } else {
      if (hitX === firstHit[0]) {
        directs[0] = false;
        directs[2] = false;
      } else {
        directs[1] = false;
        directs[3] = false;
      }
    }
  }

  if (str === 'delete') {
    lastHit = [];
    firstHit = [];
    directs = [true, true, true, true];
  }

  if (rand === 0) {
    if (str === 'false') {
      for (let index = 0; index < 4; index++) {
        if (directs[index]) {
          lastHit[0] = firstHit[0];
          lastHit[1] = firstHit[1];
          directs[index] = false;
          break;
        }
      }
    }
  }
  
  switch (true) {
    case directs[0]:
      shootX = lastHit[0] + 1;
      shootY = lastHit[1];
      break;
    case directs[1]:
        shootX = lastHit[0];
        shootY = lastHit[1] - 1;
      break;
    case directs[2]:
      shootX = lastHit[0] - 1;
      shootY = lastHit[1];
      break;
    case directs[3]:
      shootX = lastHit[0];
      shootY = lastHit[1] + 1;
      break;
  }
}

drawField(70, 70);
drawField(570, 70);
drawShips();

const myShips = new Fleet(70, 70);
const computerShips = new Fleet(570, 70, myShips);

myShips.opponent = computerShips;
myShips.originX = 70;
myShips.originY = 70;
computerShips.originX = 570;
computerShips.originY = 70;

randomArrangeShips(computerShips);
