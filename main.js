"user strict";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const board = {
  grid: [],
  x: 10,
  y: 100,
  width: null,
  height: null,
  blockWidth: 38,
  xLength: 10,
  yLength: 8,
  init: function () {
    // Define dimentions
    this.width = this.blockWidth * this.xLength;
    this.height = this.blockWidth * this.yLength;
    // Define position
    this.x = (canvas.width - this.width) / 2;

    // Prepare the grid
    for (let indexY = 0; indexY < this.yLength; indexY++) {
      this.grid[indexY] = [];
      for (let indexX = 0; indexX < this.xLength; indexX++) {
        this.grid[indexY][indexX] = null;
      }
    }
  },
  drawSpace: function (indexY, indexX, ctx) {
    const colors = ["#a3a3a3", "#949494"];
    let evenOdd = (indexY + indexX) % 2;
    let color = colors[evenOdd];

    let x = this.blockWidth * indexX + this.x;
    let y = this.blockWidth * indexY + this.y;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, this.blockWidth, this.blockWidth);
  },
};
const pointer = {
  x: null,
  y: null,
  hold: 0,
  dragging: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  update: function () {
    if (this.hold) this.hold++;

    if (this.dragging) {
      this.dragging.x = this.x + this.dragOffsetX;
      this.dragging.y = this.y + this.dragOffsetY;
    }
  },
  drag: function (item) {
    pointer.dragging = item;
    pointer.dragging.isBeingDragged = true;

    if (item instanceof Piece) {
      pointer.dragOffsetX = -(item.width / 2);
      pointer.dragOffsetY = -item.height - board.blockWidth;
    }
  },
  drop: function () {
    if (pointer.dragging.onDrop) pointer.dragging.onDrop();
    pointer.dragging.isBeingDragged = false;
    pointer.dragging = null;
  },
};
const blocksTray = {
  spaces: [
    {
      x: null,
      y: null,
      content: null,
    },
    {
      x: null,
      y: null,
      content: null,
    },
  ],
  spaceWidth: null,
  spaceHeight: null,
  spaceRows: 4,
  spaceCols: 4,
  init: function () {
    this.spaceWidth = board.blockWidth * this.spaceRows;
    this.spaceHeight = board.blockWidth * this.spaceCols;
    let spaceBetween = 5;
    let marginTop = 20;
    let middleX = canvas.width / 2;

    this.spaces[0].x = middleX - this.spaceWidth - spaceBetween;
    this.spaces[0].y = board.y + board.height + marginTop;

    this.spaces[1].x = middleX + spaceBetween;
    this.spaces[1].y = board.y + board.height + marginTop;
  },
  contentPositionAsInCenter: function (space) {
    let content = space.content;
    let marginTop = (this.spaceHeight - content.height) / 2;
    let marginLeft = (this.spaceWidth - content.width) / 2;

    let x = space.x + marginLeft;
    let y = space.y + marginTop;

    return {
      x: x,
      y: y,
    };
  },
  centralizeContent: function (space) {
    let position = this.contentPositionAsInCenter(space);
    space.content.x = position.x;
    space.content.y = position.y;
  },
  isPointInside: function (x, y) {
    /* If point is inside a space, return that space
		   otherwise, return false */
    for (let space of this.spaces) {
      let spcX = space.x;
      let spcX1 = space.x + this.spaceWidth;
      let spcY = space.y;
      let spcY1 = space.y + this.spaceHeight;
      if (spcX < x && x < spcX1 && spcY < y && y < spcY1) {
        return space;
      }
    }

    return false;
  },
  draw: function (ctx) {
    ctx.fillStyle = "#9e9e9e39";
    ctx.fillRect(
      this.spaces[0].x,
      this.spaces[0].y,
      this.spaceWidth,
      this.spaceHeight
    );
    ctx.fillRect(
      this.spaces[1].x,
      this.spaces[1].y,
      this.spaceWidth,
      this.spaceHeight
    );
  },
};
const score = {
  current: 0,
  target: 0,
  x: null,
  y: null,
  init: function () {
    this.x = board.x + board.width / 2;
    this.y = board.y / 2;
    this.y = this.y > 16 ? this.y : 16;
  },
  update: function () {
    // Score change animation
    if (this.current < this.target) this.current++;
    else if (this.current > this.target) this.current--;
  },
  draw: function (ctx) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.font = "50px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.current, this.x, this.y);
  },
};

const ZINDEX = {
  BACKGROUND: 0,
  BOARD_ITEMS: 1,
  PIECES: 2,
  UI: 3,
};
const layers = [];
function addToLayer(item) {
  let zIndex = item.zIndex;

  if (!layers[zIndex]) layers[zIndex] = [];

  layers[zIndex].push(item);
}
function removeFromLayer(item) {
  let zIndex = item.zIndex;
  let layer = layers[zIndex];
  if (!layer) {
    console.log(`Camada ${zIndex} não existe!`);
    return;
  }
  for (let i = 0; i < layer.length; i++) {
    if (layer[i] === item) {
      layer.splice(i, 1);
      return;
    }
  }
}
function changeLayer(item, zIndex) {
  removeFromLayer(item);
  item.zIndex = zIndex;
  addToLayer(item);
}

window.onload = () => {
  canvas.height = 800;
  canvas.width = 450;

  board.init();
  blocksTray.init();
  score.init();

  //initGame()
  showNewPiece();
  showNewPiece();
  update();
};

const blockImgs = [];
for (let i = 0; i < 5; i++) {
  let img = new Image();
  img.src = `./assets/block-${i}.png`;
  blockImgs.push(img);
}

class Block {
  constructor() {
    this.x = null;
    this.y = null;
    this.width = board.blockWidth;
    this.img = null;
    this.globalAlpha = 1;

	this.animations = []
  }

  startGrowFadeAnimations(callback) {
	const duration = 500
	this.animations.push(
		new Animation({
			property: "width",
			from: this.width,
			to: this.width + 20,
			duration,
			onUpdate: (v) => this.width = v,
			onComplete: () => checkAllDone()
		}),
		new Animation({
			property: "x",
			from: this.x,
			to: this.x - 10,
			duration,
			onUpdate: (v) => this.x = v,
			onComplete: () => checkAllDone()
		}),
		new Animation({
			property: "y",
			from: this.y,
			to: this.y - 10,
			duration,
			onUpdate: (v) => this.y = v,
			onComplete: () => checkAllDone()
		}),
		new Animation({
			property: "globalAlpha",
			from: this.globalAlpha,
			to: 0,
			duration,
			onUpdate: (v) => this.globalAlpha = v,
			onComplete: () => checkAllDone()
		})
	)

	let done = 0;
	const checkAllDone = () => {
		if (++done === 2 && callback) callback()
	}
  }

  update(now) {
	this.animations = this.animations.filter(animation => {
		animation.update(now)
		return !animation.finished
	})
  }
  draw(x, y) {
    x = x || this.x;
    y = y || this.y;
    ctx.globalAlpha = this.globalAlpha;
    ctx.drawImage(this.img, x, y, this.width, this.width);
    ctx.globalAlpha = 1;
  }
  isPointInside(x, y) {
    let top = this.y;
    let right = this.x + this.width;
    let bottom = this.y + this.width;
    let left = this.x;

    if (left < x && x < right) if (top < y && y < bottom) return true;

    return false;
  }
}
class Piece {
  constructor() {
    this.x = null;
    this.y = null;
    this.blocks = [];
    this.isBeingDragged = false;
    this.targetX = null;
    this.targetY = null;

    // Select a random pattern
    let index = Math.floor(Math.random() * Piece.patterns.length);
    let pattern = Piece.patterns[index];
    // Rotate some times
    let rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) pattern = Piece.rotatePattern(pattern);
    // Select an image
    let img = blockImgs[Math.floor(Math.random() * blockImgs.length)];

    this.createGrid(pattern, img);
    // Configure width and height
    this.width = board.blockWidth * pattern[0].length;
    this.height = board.blockWidth * pattern.length;
  }

  static patterns = [
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    [[1, 1, 1, 1]],
    [[1, 1, 1, 1, 1]],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
    ],
    [[1, 1]],
    [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
    [[1]],
  ];

  static rotatePattern(pattern) {
    // Get the number of rows and columns at pattern
    const rows = pattern.length;
    const cols = pattern[0].length;
    const rotatedPattern = [];

    // Determine the dimensions of the rotated pattern based on the original pattern
    const newRows = cols;
    const newCols = rows;

    // Loop through each row of the rotated pattern
    for (let r = 0; r < newRows; r++) {
      rotatedPattern.push([]);

      // Loop through each column of the rotatedPattern
      for (let c = 0; c < newCols; c++) {
        // Handle cases based on the original pattern dimensions
        rotatedPattern[r].push(pattern[rows - 1 - c][r]);
      }
    }
    return rotatedPattern;
  }

  createGrid(pattern, img) {
    for (let y in pattern) {
      this.blocks[y] = [];
      for (let x in pattern[y]) {
        if (pattern[y][x] === 1) {
          this.blocks[y][x] = new Block();
          this.blocks[y][x].img = img;
          this.blocks[y][x].globalAlpha = 1;
          this.blocks[y][x].zIndex = ZINDEX.PIECES;
          addToLayer(this.blocks[y][x]);
        } else {
          this.blocks[y][x] = null;
        }
      }
    }
  }

  checkFit(desY, desX) {
    /* Check if board.grid has space to fit this piece in the given indexes. */
    /* desX => destination index in which the PIECE would be placed */
    /* blcX => BLOCK index relative to the PIECE index */
    /* brdX => BOARD space index in which the BLOCK would be placed */
    desX = Number(desX);
    desY = Number(desY);

    for (let blcY = 0; blcY < this.blocks.length; blcY++) {
      for (let blcX = 0; blcX < this.blocks[blcY].length; blcX++) {
        if (!this.blocks[blcY][blcX]) continue;

        let brdX = desX + blcX;
        let brdY = desY + blcY;

        if (board.grid[brdY] === undefined) {
          console.warn(`brdY[${brdY}] === undefined`);
          return false;
        }
        if (board.grid[brdY][brdX] === undefined) {
          console.warn(`brdX[${brdX}] === undefined`);
          return false;
        }
        if (board.grid[brdY][brdX]) {
          console.warn(`grid[${brdY}][${brdX}] ocupied`);
          return false;
        }
      }
    }

    return true;
  }

  updateBlocksPosition() {
    for (let y in this.blocks) {
      for (let x in this.blocks[y]) {
        let block = this.blocks[y][x];
        if (block === null) continue;

        let blockOffsetX = x * board.blockWidth;
        let blockOffsetY = y * board.blockWidth;
        block.x = this.x + blockOffsetX;
        block.y = this.y + blockOffsetY;
      }
    }
  }

  isPointInside(x, y) {
    let point = { x, y };
    let blocks = this.blocks;

    for (let x = 0; x < blocks.length; x++) {
      for (let y = 0; y < blocks[x].length; y++) {
        let block = blocks[x][y];
        if (block && block.isPointInside(point.x, point.y)) {
          return true;
        }
      }
    }
    return false;
  }

  placeOnBoard() {
    // Compute index position
    let relX = this.x - board.x;
    let relY = this.y - board.y;
    let indexX = Math.round(relX / board.blockWidth);
    let indexY = Math.round(relY / board.blockWidth);

    // Align this piece on the board grid
    this.x = indexX * board.blockWidth + board.x;
    this.y = indexY * board.blockWidth + board.y;
    this.updateBlocksPosition();

    // Put each block of piece in the board
    for (let y = 0; y < this.blocks.length; y++) {
      for (let x = 0; x < this.blocks[y].length; x++) {
        let block = this.blocks[y][x];
        if (block) {
          let bx = indexX + x;
          let by = indexY + y;
          board.grid[by][bx] = block;
          changeLayer(block, ZINDEX.BOARD_ITEMS);

		  block.startGrowFadeAnimations()
        }
      }
    }

    // Remove this piece from screen and tray
    removeFromLayer(this);
    for (let space of blocksTray.spaces) {
      if (space.content == this) {
        space.content = null;
      }
    }
  }

  onDrop() {
    let relX = this.x - board.x;
    let relY = this.y - board.y;
    let indexX = Math.round(relX / board.blockWidth);
    let indexY = Math.round(relY / board.blockWidth);

    if (this.checkFit(indexY, indexX)) {
      this.placeOnBoard();
      showNewPiece();

      // Get row & columns that got filled
      let filledYs = checkBoardYs();
      let filledXs = checkBoardXs();
      // Clear them (if there are any)
      for (let indexY of filledYs) clearAlongY(indexY);
      for (let indexX of filledXs) clearAlongX(indexX);
      checkLost();
    } else {
      // Prepare an animation to get back to tray
      for (let space of blocksTray.spaces) {
        if (space.content != this) continue;
        let position = blocksTray.contentPositionAsInCenter(space);
        this.targetX = position.x;
        this.targetY = position.y;
      }
    }
  }

  update() {
    if (this.isBeingDragged) {
      this.updateBlocksPosition();
    } else if (this.targetX || this.targetY) {
      let diffX = this.targetX - this.x;
      let diffY = this.targetY - this.y;

      // Set a diagonal movement based on a proportion between
      // the complete movement and the hypotenuse
      let hypotenuse = Math.sqrt(diffX * diffX + diffY * diffY);
      let proportionX = diffX / hypotenuse;
      let proportionY = diffY / hypotenuse;
      let movementDiag = 20;
      let movementX = proportionX * movementDiag;
      let movementY = proportionY * movementDiag;

      this.x += movementX;
      this.y += movementY;

      // End animation
      if (Math.abs(movementX) >= Math.abs(diffX)) {
        this.x = this.targetX;
        this.targetX = null;
      }
      if (Math.abs(movementY) >= Math.abs(diffY)) {
        this.y = this.targetY;
        this.targetY = null;
      }

      this.updateBlocksPosition();
    }
  }
}
class Animation {
	constructor({ property, from, to, duration, onUpdate, onComplete }) {
	  this.property = property;
	  this.from = from;
	  this.to = to;
	  this.duration = duration;
	  this.onUpdate = onUpdate;
	  this.onComplete = onComplete;
	  this.startTime = null;
	  this.finished = false;
	}
  
	update(now) {
	  if (this.finished) return;
  
	  if (this.startTime === null) this.startTime = now;
  
	  const elapsed = now - this.startTime;
	  const progress = Math.min(elapsed / this.duration, 1);
	  const value = this.from + (this.to - this.from) * progress;
  
	  this.onUpdate(value);
  
	  if (progress === 1) {
		this.finished = true;
		this.onComplete?.();
	  }
	}
  }
  

canvas.addEventListener("pointerdown", function (ev) {
  ev.preventDefault();

  let rect = ev.target.getBoundingClientRect();

  pointer.x = ev.clientX - rect.left;
  pointer.y = ev.clientY - rect.top;
  pointer.hold = 0;

  // Check if pick something on screen objs
  for (let layer of layers)
    if (layer)
      for (let item of layer)
        if (item.isPointInside(pointer.x, pointer.y)) pointer.drag(item);

  // Check if clicked on tray
  let space = blocksTray.isPointInside(pointer.x, pointer.y);
  if (space && space.content) pointer.drag(space.content);
});
canvas.addEventListener("pointermove", function (ev) {
  ev.preventDefault();

  let rect = ev.target.getBoundingClientRect();
  pointer.x = ev.clientX - rect.left;
  pointer.y = ev.clientY - rect.top;
});
canvas.addEventListener("pointerup", function (ev) {
  pointer.x = null;
  pointer.y = null;
  pointer.hold = false;

  if (pointer.dragging) pointer.drop();
});
function showNewPiece() {
  let spaces = blocksTray.spaces;

  // Try to find an empty space in the blocks tray
  for (let space of spaces) {
    if (space.content) continue;

    // Config the piece
    let piece = new Piece();
    space.content = piece;
    blocksTray.centralizeContent(space);
    piece.updateBlocksPosition();
    piece.zIndex = ZINDEX.PIECES;

    addToLayer(piece);
    break;
  }
}

function checkBoardYs() {
  // Check if some rows are filled

  let filledYs = [];
  for (let indexY in board.grid) {
    let containsEmptyParts = false;

    for (let indexX in board.grid[indexY]) {
      if (board.grid[indexY][indexX]) continue;
      else containsEmptyParts = true;
      break;
    }

    if (!containsEmptyParts) filledYs.push(indexY);
  }
  return filledYs;
}
function checkBoardXs() {
  // Check if some columns are filled

  let filledXs = [];
  for (let indexX = 0; indexX < board.xLength; indexX++) {
    let containsEmptyParts = false;

    for (let indexY = 0; indexY < board.yLength; indexY++) {
      if (board.grid[indexY][indexX]) continue;
      else containsEmptyParts = true;

      break;
    }

    if (!containsEmptyParts) filledXs.push(indexX);
  }

  return filledXs;
}
function clearAlongY(indexY) {
  let targetScore = 0;
  for (let indexX = 0; indexX < board.xLength; indexX++) {
    removeFromLayer(board.grid[indexY][indexX]);
    board.grid[indexY][indexX] = null;
    targetScore++;
  }
  score.target += targetScore;
}
function clearAlongX(indexX) {
  let targetScore = 0;
  for (let indexY = 0; indexY < board.yLength; indexY++) {
    removeFromLayer(board.grid[indexY][indexX]);
    board.grid[indexY][indexX] = null;
    targetScore++;
  }
  score.target += targetScore;
}

function checkLost() {
  for (let space of blocksTray.spaces) {
    let piece = space.content;
    let maxIndexY = board.yLength - piece.blocks.length;
    let maxIndexX = board.xLength - piece.blocks[0].length;

    // Check if fit on any part of the board grid
    for (let indexY in board.grid) {
      for (let indexX in board.grid[indexY]) {
        if (indexX > maxIndexX || indexY > maxIndexY) continue;
        if (board.grid[indexY][indexX]) continue;

        let fit = piece.checkFit(indexY, indexX);

        if (fit) return;
      }
    }
  }

  alert("You've lost! Refresh the page to play again.");
}

function update(now) {
  requestAnimationFrame(update);

  pointer.update(now);

  for (let layer of layers)
    if (layer) for (let item of layer) if (item.update) item.update(now);

  render();
}
function render() {
  // Paint the hole canvas
  ctx.fillStyle = "#4f6875";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw board spaces or items
  for (let indexY = 0; indexY < board.yLength; indexY++) {
    for (let indexX = 0; indexX < board.xLength; indexX++) {
      let onSpace = board.grid[indexY][indexX];

      if (onSpace == null) board.drawSpace(indexY, indexX, ctx);
    }
  }

  blocksTray.draw(ctx);

  for (let layer of layers)
    if (layer) for (let item of layer) if (item.draw) item.draw();

  score.draw(ctx);
}
