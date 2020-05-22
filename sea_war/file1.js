const canv = document.getElementById('canvas');
const context = canv.getContext('2d');

canv.width = 1000;
canv.height = 700;

const sizeOfCell = 35;

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

function drawCross(cellX, cellY, player) {
  context.beginPath();
  context.lineWidth = 5;
  context.strokeStyle = 'red';
  let originX = player.originX;
  let originY = player.originY;
  context.moveTo(originX + sizeOfCell * cellX + 5, originY + sizeOfCell * cellY + 5);
  context.lineTo(originX + sizeOfCell * (cellX + 1) - 5, originY + sizeOfCell * (cellY + 1) - 5);
  context.moveTo(originX + sizeOfCell * (cellX + 1) - 5, originY + sizeOfCell * cellY + 5);
  context.lineTo(originX + sizeOfCell * cellX + 5, originY + sizeOfCell * (cellY + 1) - 5);
  context.stroke();
}

function drawPoint(cellX, cellY, player) {
  context.beginPath();
  context.strokeStyle = 'blue';
  let originX = player.originX;
  let originY = player.originY;
  context.fillStyle = 'blue';
  context.arc(originX + sizeOfCell * cellX + 17, originY + sizeOfCell * cellY + 17, 7, 0, Math.PI * 2, false);
  context.stroke();
  context.fill();
}

class Ship {
  constructor(startX, startY, dir, length) {
    this.length = length;
    this.direction = dir;
    this.alive = true;
    this.coordsX = [];
    this.coordsY = [];
    this.cells = new Array(length).fill(1);
    for (let i = 0; i < length; i++) {
      if (dir) {
        this.coordsY[i] = startY;
        this.coordsX[i] = startX + i;
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
    if (this.dir) {
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
      return [false, `Корабль данное длины нельзя размещать. 
      Вам доступны корабли с длинами: ${arrayShips}`];
    }

    switch (length) {
      case 1: 
        for (let i = 0; i < 4; i++) {
          if (this.allShips[i] === undefined) {
            this.allShips[i] = new Ship(startCellX, startCellY, direction, 1);
            break;
          }
        }
        break;
      case 2:
          for (let i = 4; i < 7; i++) {
            if (this.allShips[i] === undefined) {
              this.allShips[i] = new Ship(startCellX, startCellY, direction, 2);
              break;
            }
          }
          break;
      case 3:
          for (let i = 7; i < 9; i++) {
            if (this.allShips[i] === undefined) {
              this.allShips[i] = new Ship(startCellX, startCellY, direction, 3);
              break;
            }
          }
          break;
      case 4:
          if (this.allShips[9] === undefined) {
            this.allShips[9] = new Ship(startCellX, startCellY, direction, 4);
          }
          break;
    }

    if (direction) {
      for (let k = startCellX; k < endCellX + 1; k++) {
        this.coordinateShips[startCellY][k] = 1;
        this.coordinateShips[startCellY - 1][k] = 2;
        this.coordinateShips[startCellY + 1][k] = 2;
      };
      for (let t = startCellY - 1; t < startCellY + 2; t++) {
        this.coordinateShips[t][startCellX - 1] = 2;
        this.coordinateShips[t][endCellX + 1] = 2;
      }
    } else {
      for (let i = startCellY; i < endCellY + 1; i++) {
        this.coordinateShips[i][startCellX] = 1;
        this.coordinateShips[i][startCellX - 1] = 2;
        this.coordinateShips[i][startCellX + 1] = 2;
      };
      for (let y = startCellX - 1; y < startCellX + 2; y++) {
        this.coordinateShips[startCellY - 1][y] = 2;
        this.coordinateShips[endCellY + 1][y] = 2;
      }
    }
    return [true];
  }

  killShip(index, ship) {
    let startCellX = ship.startCellX;
    let startCellY = ship.startCellY;
    let direction = ship.direction;
    let endCellX = ship.endCellX;
    let endCellY = ship.endCellY;
    this.killedShips.push(this.allShips[index]);
    this.allShips[index].alive = false;
    if (direction) {
      for (let k = startCellX; k < endCellX + 1; k++) {
        this.coordinateShips[startCellY - 1][k] = 3;
        this.coordinateShips[startCellY + 1][k] = 3;
        drawCross(k, startCellY - 1, this.opponent);
        drawCross(k, startCellY + 1, this.opponent);
      };
      for (let t = startCellY - 1; t < startCellY + 2; t++) {
        this.coordinateShips[t][startCellX - 1] = 3;
        this.coordinateShips[t][endCellX + 1] = 3;
        drawCross(startCellX - 1,t, this.opponent);
        drawCross(endCellX + 1, t, this.opponent);
      }
    } else {
      for (let i = startCellY; i < endCellY + 1; i++) {
        this.coordinateShips[i][startCellX - 1] = 3;
        this.coordinateShips[i][startCellX + 1] = 3;
        drawCross(startCellX - 1, i, this.opponent);
        drawCross(endCellX + 1, i, this.opponent);
      };
      for (let y = startCellX - 1; y < startCellX + 2; y++) {
        this.coordinateShips[startCellY - 1][y] = 3;
        this.coordinateShips[endCellY + 1][y] = 3;
        drawCross(y, startCellY - 1, this.opponent);
        drawCross(y, endCellY + 1, this.opponent);
      }
    }
  }

  shoot(x, y) {
    if (this.coordinateShips[y][x] != 1) {
      drawPoint(x, y, this.opponent);
      return [false];
    } else {
      let ship;
      for (let index = 0; index < 10; index++) {
        let result = this.allShips[index].findByCoord(x, y);
        if (result) {
          ship = this.allShips[index];
          ship.damage(x, y);
          drawCross(x, y, this.opponent);
          this.coordinateShips[y][x] = 3;
          if (!ship.isAlive()) {
            this.killShip(index, ship);
          } 
        }
      }
      return [true, ship.alive];
    }
  }
}

function coordinateAtField(coor) {
  let numberOfCellX = Math.floor((coor.x - 80) / sizeOfCell);  
  let numberOfCellY = Math.floor((coor.y - 80) / sizeOfCell);
  return [numberOfCellX, numberOfCellY];
}

function click(e) {
  let clickX = e.clientX;
  let clickY = e.clientY;
  if (clickX > 410 && clickX < 610 && clickY > 510 && clickY < 660) {
    game();
  }
}

function mousemove(e) {
  if (e.clientY < 465 && e.clientX < 465 && e.clientY >= 115 && e.clientX >=115) {
    onField = true;
  } else {
    onField = false;
  };
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
        console.log(check[1]);
      }
    }
  }

  if (unchosenShips.length == 0) {
    canv.removeEventListener('mousemove', mousemove);
    canv.removeEventListener('mousedown', mousedown);
    canv.removeEventListener('mouseup', mouseup);
    context.strokeRect(400, 500, 200, 150);
    context.stroke();
    context.font = '30px serif';
    context.fillText('Начать битву', 410, 535);
    canv.addEventListener('mousedown', click);
  }
}


function drawShips() {
  canv.addEventListener('mousemove', mousemove);
  canv.addEventListener('mousedown', mousedown);
  canv.addEventListener('mouseup', mouseup);
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

function choose(c) {
  canv.removeEventListener('mousedown', choose);
  console.log(c.clientX, c.clientY);
  console.log('Ваш ход');
  if (allowShoot) {
    let x = c.clientX;
    let y = c.clientY;
    let [cellX, cellY] = coordinateAtField({x, y});
    let cell = computerShips.coordinateShips[cellY][cellX];
    let resultOfShoot = computerShips.shoot(cellX, cellY);
    if (cell == 3) {
      choose();
    } else {
      if (resultOfShoot[0]) {
        choose();
      }
    }
  }
  if (c.clientX === undefined) {
    choose();
  }
  canv.removeEventListener('click', choose);
  chooseComputer();
}

function chooseComputer() {
  console.log('Ход компьютера');
  let randomX = Math.floor(Math.random() * 10 + 1);
  let randomY = Math.floor(Math.random() * 10 + 1);
  let resultOfShoot = myShips.shoot(randomX, randomY);
  let cell = myShips.coordinateShips[randomY][randomX];
  if (cell == 3) {
    chooseComputer();
  } else {
    if (resultOfShoot[0]) {
      chooseComputer();
    }
  }
  choose();
}


function game() {
  canv.removeEventListener('mousedown', click);
  canv.addEventListener('mousedown', choose);
  canv.addEventListener('mousemove', onEnemyField);
}
