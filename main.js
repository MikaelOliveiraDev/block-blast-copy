"user strict";

const canvas = document.querySelector("canvas");
const config = {
	blockWidth: 38,
	boardRowLength: 10,
	boardColumnLength: 10
};
const board = {
	grid: [],
	x: 10,
	y: 10,
	width: null,
	height: null,
	init: function () {
		// Define dimentions
		this.width = config.blockWidth * config.boardRowLength;
		this.height = config.blockWidth * config.boardColumnLength;
		// Define position
		this.x = (canvas.width - this.width) / 2;

		// Prepare the grid
		for (let x = 0; x < config.boardRowLength; x++) {
			this.grid[x] = [];
			for (let y = 0; y < config.boardColumnLength; y++) {
				this.grid[x][y] = null;
			}
		}
	},
	drawSpace: function (row, column, ctx) {
		const colors = ["#a3a3a3",
			"hsl(0,0%,58%)"];
		let evenOdd = (row + column) % 2;
		let color = colors[evenOdd];

		let x = config.blockWidth * row + this.x;
		let y = config.blockWidth * column + this.y;

		ctx.fillStyle = color;
		ctx.fillRect(x, y, config.blockWidth, config.blockWidth);
	}
};
const touch = {
	x: null,
	y: null,
	touching: false,
	touchingCount: 0,
	isDraging: false,
	draging: null,
	dragOffsetX: 0,
	dragOffsetY: 0,
	update: function () {
		if (this.isDraging) {
			this.draging.x = this.x + this.dragOffsetX;
			this.draging.y = this.y + this.dragOffsetY;
		}
	}
};
const blocksTray = {
	spaces: [{
		x: null,
		y: null,
		content: null
	},
		{
			x: null,
			y: null,
			content: null
		}],
	spaceWidth: null,
	spaceHeight: null,
	init: function () {
		this.spaceWidth = config.blockWidth * 5;
		this.spaceHeight = config.blockWidth * 5;
		let spaceBetween = 5;
		let marginTop = 20;
		let middleX = canvas.width / 2;

		this.spaces[0].x = middleX - this.spaceWidth - spaceBetween;
		this.spaces[0].y = board.y + board.height + marginTop;

		this.spaces[1].x = middleX + spaceBetween;
		this.spaces[1].y = board.y + board.height + marginTop;
	},
	draw: function (ctx) {
		ctx.fillStyle = "#9e9e9e6e";
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
	}
};
const screen = [];
const pool = {
	blocks: []
};

screen.put = function (item, zIndex) {
	let frame = screen[zIndex];

	if (!frame) screen[zIndex] = [];

	screen[zIndex].push(item);
};
screen.remove = function (item, zIndex) {
	let frame = screen[zIndex];
	let index = frame.indexOf(item);

	if (index != -1) frame.splice(index, 1);
};

pool.get = function (objString) {
	if (objString == "block") {
		if (pool.blocks.length == 0) return new Block()
		else return pool.blocks.pop()
	}
}
pool.put = function(obj, objString) {
	pool[objString].push(obj)
}

window.onload = () => {
	canvas.height = 800;
	canvas.width = 450;

	board.init();
	blocksTray.init();

	//initGame()
	showNewPiece();
	update();
};

const blockImgs = [];
for (let i = 0; i < 5; i++) {
	let img = new Image();
	img.src = `./assets/block-${i}.png`;
	blockImgs.push(img);
}

function createGrid(width, height) {
	let grid = [];
	for (let x = 0; x < width; x++) {
		grid[x] = [];
		for (let y = 0; y < height; y++) {
			grid[x][y] = null;
		}
	}

	return grid;
}
function iterateGrid(grid, func) {
	for (let x = 0; x < grid.length; x++) {
		for (let y = 0; y < grid[x].length; y++) {
			func(grid[x][y], x, y, grid);
		}
	}
}

class Block {
	constructor() {
		this.x = null;
		this.y = null;
		this.width = config.blockWidth;
		this.img = null;
		this.globalAlpha = 1;
		this.zIndex = 0;
	}

	draw(ctx, x, y) {
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
		this.blocks;
		this.shadow;
		this.shadowIndexX = null;
		this.shadowIndexY = null;
		this.isBeingDragged = false;
		this.isShadowVisible = false;
		this.zIndex = 0;
	}

	updateBlocksPosition() {
		//let blocks = this.blocks;
		let pieceX = this.x;
		let pieceY = this.y;

		iterateGrid(this.blocks, function (block, column, row) {
			if (!block) return;

			let blockOffsetX = column * config.blockWidth;
			let blockOffsetY = row * config.blockWidth;

			block.x = pieceX + blockOffsetX;
			block.y = pieceY + blockOffsetY;
		});
	}
	updateShadowPosition() {
		let pieceX = this.x;
		let pieceY = this.y;
		// The position of the piece relative to the board
		let relX = pieceX - board.x;
		let relY = pieceY - board.y;

		// The distance between the corner of the piece
		// and the corner of the previous grid space
		let remainingX = relX % config.blockWidth;
		let remainingY = relY % config.blockWidth;
		// Position the shadow on the corner of the
		// previous grid space
		let shadowX = pieceX - remainingX;
		let shadowY = pieceY - remainingY;
		// Check if the piece is actually
		// closer to the next grid space
		let halfBlock = config.blockWidth / 2;
		if (remainingX > halfBlock) shadowX += config.blockWidth;
		if (remainingY > halfBlock) shadowY += config.blockWidth;

		// Prevent the shadow the be shown outside of the board
		if (
			shadowX < board.x ||
			shadowX > board.width - this.width + config.blockWidth ||
			shadowY < board.y ||
			shadowY > board.height - this.height + config.blockWidth
		) {
			this.isShadowVisible = false;
			return;
		} else {
			this.isShadowVisible = true;
		}

		this.shadowIndexX = (shadowX - board.x) / config.blockWidth;
		this.shadowIndexY = (shadowY - board.y) / config.blockWidth;

		let isSpaceFree = true;
		iterateGrid(this.shadow, (shadowBlock, column, row, grid) => {
			if (!isSpaceFree) return;

			if (shadowBlock) {
				let blockOffsetX = column * config.blockWidth;
				let blockOffsetY = row * config.blockWidth;

				shadowBlock.x = shadowX + blockOffsetX;
				shadowBlock.y = shadowY + blockOffsetY;

				// Check is space on board is free
				let indexX = this.shadowIndexX + column;
				let indexY = this.shadowIndexY + row;

				if (board.grid[indexX][indexY] != null) isSpaceFree = false;
			}
		});

		if (!isSpaceFree) this.isShadowVisible = false;
	}
	isPointInside(x, y) {
		let point = {
			x,
			y
		};
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

		/*
        let top = this.y;
        let right = this.x + this.width;
        let bottom = this.y + this.width;
        let left = this.x;

        if (left < x && x < right) if (top < y && y < bottom) return true;

        return false;
        */
	}
	placeOnBoard() {
		// Align this piece and its blocks on the board grid
		this.x = this.shadowIndexX * config.blockWidth + board.x;
		this.y = this.shadowIndexY * config.blockWidth + board.y;
		this.updateBlocksPosition();

		// Put each block of piece in the board
		iterateGrid(this.blocks, (block, indexX, indexY) => {
			if (block) {
				indexX += this.shadowIndexX;
				indexY += this.shadowIndexY;

				board.grid[indexX][indexY] = block;
			}
		});

		// Remove this piece from screen and tray
		screen.remove(this,
			this.zIndex);
		for (let space of blocksTray.spaces) {
			if (space.content == this) {
				space.content = null;
			}
		}
	}
	update() {
		if (this.isBeingDragged) {
			this.updateBlocksPosition();
			this.updateShadowPosition();
		}
		/*
      let relX = this.x - board.x
      let relY = this.y - board.y
      let remainingX = relX % config.blockWidth
      let remainingY = relY % config.blockWidth
      let x = relX - remainingX
      let y = relY - remainingY
      this.shadow.x = x
      this.shadow.y = y
      */
	}
	draw(ctx) {
		// Draw shadow
		if (this.isShadowVisible) {
			iterateGrid(this.shadow, shadowBlock => {
				if (shadowBlock) shadowBlock.draw(ctx);
			});
		}

		// Draw the actual blocks
		iterateGrid(this.blocks,
			function (block) {
				if (block) block.draw(ctx);
			});
	}
}
class Piece_0 extends Piece {
	constructor() {
		super();
		this.width = config.blockWidth * 2;
		this.height = config.blockWidth * 2;
		this.blocks = createGrid(2, 2);
		this.shadow = createGrid(2, 2);

		// Pick a random block img
		let img = blockImgs[Math.floor(Math.random() * blockImgs.length)];

		// Fill blocks grid
		iterateGrid(this.blocks,
			(space, x, y, grid) => {
				grid[x][y] = pool.get("block");
				grid[x][y].img = img;
				grid[x][y].globalAlpha = 1
				this.shadow[x][y] = pool.get('block')
				this.shadow[x][y].img = img
				this.shadow[x][y].globalAlpha = .5
			});
	}

}
class Piece_1 extends Piece {
	constructor() {
		super();
		this.width = config.blockWidth * 3;
		this.height = config.blockWidth * 3;
		this.blocks = createGrid(3, 3);
		this.shadow = createGrid(3, 3);

		// Pick a random block img
		let img = blockImgs[Math.floor(Math.random() * blockImgs.length)];

		// Fill blocks grid
		iterateGrid(this.blocks, (space, x, y, grid) => {
			if (x == 0 || y == 2) {
				grid[x][y] = pool.get("block");
				grid[x][y].img = img;
				grid[x][y].globalAlpha = 1
			}
		});
		// Fill shadow grid
		iterateGrid(this.shadow,
			(space, x, y, grid) => {
				if (x == 0 || y == 2) {
					grid[x][y] = pool.get("block");
					grid[x][y].img = img;
					grid[x][y].globalAlpha = 0.5;
				}
			});
	}
}
class Piece_2 extends Piece {
	constructor() {
		super();
		this.width = config.blockWidth * 3;
		this.height = config.blockWidth * 2;
		this.blocks = createGrid(3,
			2);
		this.shadow = createGrid(3,
			2);

		// Pick a random block img
		let img = blockImgs[Math.floor(Math.random() * blockImgs.length)];

		iterateGrid(this.blocks,
			(space, x, y, grid) => {
				if (y == 0 || x == 1) {
					grid[x][y] = pool.get('block');
					grid[x][y].img = img;
					grid[x][y].globalAlpha = 1
				}
			});
		iterateGrid(this.shadow,
			(space, x, y, grid) => {
				if (y == 0 || x == 1) {
					grid[x][y] = pool.get("block");
					grid[x][y].img = img;
					grid[x][y].globalAlpha = 0.5;
				}
			});
	}
}
class Piece_3 extends Piece {
	constructor() {
		super();
		this.width = config.blockWidth * 2;
		this.height = config.blockWidth * 3;
		this.blocks = createGrid(2,
			3);
		this.shadow = createGrid(2,
			3);

		// Pick a random block img
		let img = blockImgs[Math.floor(Math.random() * blockImgs.length)];

		// Fill the grids
		iterateGrid(this.blocks,
			(space, x, y, grid) => {
				let upperRight = x == 1 && y == 0;
				let bottomLeft = x == 0 && y == 2;
				if (!(upperRight || bottomLeft)) {
					grid[x][y] = pool.get("block");
					grid[x][y].img = img;
					grid[x][y].globalAlpha = 1
				}
			});
		iterateGrid(this.shadow,
			(space, x, y, grid) => {
				let upperRight = x == 1 && y == 0;
				let bottomLeft = x == 0 && y == 2;
				if (!(upperRight || bottomLeft)) {
					grid[x][y] = pool.get("block");
					grid[x][y].img = img;
					grid[x][y].globalAlpha = 0.5;
				}
			});
	}
}

canvas.addEventListener("touchstart", function (ev) {
	ev.preventDefault();

	let touchEv = ev.touches[0];
	let rect = ev.target.getBoundingClientRect();

	let touchX = touchEv.clientX - rect.left;
	let touchY = touchEv.clientY - rect.top;

	touch.x = touchX;
	touch.y = touchY;
	touch.touching = true;

	// Check if pick something
	for (let i = 0; i < screen.length; i++) {
		let frame = screen[i];
		for (let ii = 0; ii < frame.length; ii++) {
			let piece = frame[ii];

			if (piece.isPointInside(touchX, touchY)) {
				touch.draging = piece;
				touch.draging.isBeingDragged = true;
				touch.isDraging = true;

				let margin = config.blockWidth;
				touch.dragOffsetX = -(piece.width / 2);
				touch.dragOffsetY = -piece.height - margin;
			}
		}
	}
});
canvas.addEventListener("touchmove", function (ev) {
	ev.preventDefault();

	let touchEv = ev.touches[0];
	let rect = ev.target.getBoundingClientRect();

	let touchX = touchEv.clientX - rect.left;
	let touchY = touchEv.clientY - rect.top;

	touch.x = touchX;
	touch.y = touchY;
});
canvas.addEventListener("touchend", function (ev) {
	touch.x = null;
	touch.y = null;
	touch.touching = false;
	touch.touchingCount = 0;
	touch.isDraging = false;

	if (touch.draging) {
		let piece = touch.draging;

		if (piece.isShadowVisible) {
			piece.placeOnBoard();
			showNewPiece();
			checkBoardColumns()
		}

		piece.isBeingDragged = false;
		touch.draging = null;
	}
});
var bg = "#66518c"
function showNewPiece() {
	let spaces = blocksTray.spaces;

	// Try to find an empty space in the blocks tray
	for (let space of spaces) {
		if (space.content) continue;

		// Select a random piece type
		let pieceTypes = [Piece_0,
			Piece_1,
			Piece_2,
			Piece_3];
		let index = Math.floor(Math.random() * pieceTypes.length);
		let piece = pieceTypes[index];

		// Config the piece
		piece = new piece();
		piece.x = space.x;
		piece.y = space.y;
		piece.updateBlocksPosition();

		space.content = piece;
		screen.put(piece, 0);
	}
}
function checkBoardColumns() {
	// Check if some columns are filled
	for (let column in board.grid) {
		let columnHaveEmptyParts = false

		for (let row in board.grid[column]) {
			if (board.grid[column][row]) {
				continue
			} else {
				columnHaveEmptyParts = true
				break
			}
		}

		if (!columnHaveEmptyParts) {
			bg = "black"
		}
	}
}

function update() {
	requestAnimationFrame(update);

	touch.update();

	// Update each object on screen
	for (let frame of screen) {
		for (let item of frame) {
			if (item.update) item.update();
		}
	}

	render();
}
function render() {
	let ctx = canvas.getContext("2d");

	// Paint the hole canvas
	ctx.fillStyle = bg || "#66518c";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw board spaces or items
	for (let row = 0; row < config.boardRowLength; row++) {
		for (let column = 0; column < config.boardColumnLength; column++) {
			let onSpace = board.grid[row][column];

			if (onSpace == null) board.drawSpace(row, column, ctx);
			else onSpace.draw(ctx);
		}
	}

	blocksTray.draw(ctx);

	for (let frame of screen) {
		for (let item of frame) {
			if (item.draw) item.draw(ctx);
		}
	}
}