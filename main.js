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
	y: 100,
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
	draging: null,
	dragOffsetX: 0,
	dragOffsetY: 0,
	update: function () {
		if (this.draging) {
			this.draging.x = this.x + this.dragOffsetX;
			this.draging.y = this.y + this.dragOffsetY;
		}
	},
	drag: function(item) {
		touch.draging = item;
		touch.draging.isBeingDragged = true;

		if (item instanceof Piece) {
			touch.dragOffsetX = -(item.width / 2);
			touch.dragOffsetY = - item.height - config.blockWidth;
		}
	},
	drop: function() {
		if (touch.draging.onDrop)
			touch.draging.onDrop()
		touch.draging.isBeingDragged = false;
		touch.draging = null;
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
	spaceRows: 4,
	spaceCols: 4,
	init: function () {
		this.spaceWidth = config.blockWidth * this.spaceRows
		this.spaceHeight = config.blockWidth * this.spaceCols
		let spaceBetween = 5;
		let marginTop = 20;
		let middleX = canvas.width / 2;

		this.spaces[0].x = middleX - this.spaceWidth - spaceBetween;
		this.spaces[0].y = board.y + board.height + marginTop;

		this.spaces[1].x = middleX + spaceBetween;
		this.spaces[1].y = board.y + board.height + marginTop;
	},
	contentPositionAsInCenter: function(space) {
		let content = space.content
		let marginTop = (this.spaceHeight - content.height) / 2
		let marginLeft = (this.spaceWidth - content.width) / 2

		let x = space.x + marginLeft
		let y = space.y + marginTop

		return {
			x: x,
			y: y
		}
	},
	centralizeContent: function(space) {
		let position = this.contentPositionAsInCenter(space)
		space.content.x = position.x
		space.content.y = position.y
	},
	isPointInside: function(x, y) {
		/* If point is inside a space, return that space
		   otherwise, return false */
		for (let space of this.spaces) {
			let spcX = space.x
			let spcX1 = space.x + this.spaceWidth
			let spcY = space.y
			let spcY1 = space.y + this.spaceHeight
			if (spcX < x && x < spcX1 && spcY < y && y < spcY1) {
				return space
			}
		}

		return false
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
	}
};
const screen = [];
const pool = {
	blocks: []
};
const score = {
	current: 0,
	target: 0,
	x: null,
	y: null,
	init: function() {
		this.x = board.x + (board.width / 2)
		this.y = board.y / 2
		this.y = this.y > 16 ? this.y: 16
	},
	update: function() {
		// Score change animation
		if (this.current < this.target)
			this.current++
		else if (this.current > this.target)
			this.current--
	},
	draw: function(ctx) {
		ctx.globalAlpha = 1
		ctx.fillStyle = "#ffffff"
		ctx.font = "50px sans-serif"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText(this.current, this.x, this.y)
	}
}

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
	score.init()

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
		this.blocks = []
		this.shadow = []
		this.shadowIndexX = null;
		this.shadowIndexY = null;
		this.isBeingDragged = false;
		this.isShadowVisible = false;
		this.zIndex = 0;
		this.targetX = null
		this.targetY = null

		// Select a random pattern
		let index = Math.floor(Math.random() * Piece.patterns.length)
		let pattern = Piece.patterns[index]
		// Rotate some times
		let rotations = Math.floor(Math.random() * 4)
		for (let i = 0; i < rotations; i++)
			pattern = Piece.rotatePattern(pattern)
		// Select an image
		let img = blockImgs[Math.floor(Math.random() * blockImgs.length)]

		this.createGrid(pattern, img)
		// Configure width and height
		this.width = config.blockWidth * pattern[0].length
		this.height = config.blockWidth * pattern.length
	}

	static patterns = [
		[
			[0, 1, 0],
			[1, 1, 1]
		],[
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		],[
			[1, 0],
			[1, 1],
			[0, 1]
		],[
			[0, 1],
			[1, 1],
			[1, 0]
		],[
			[1, 1, 1],
			[1, 0, 0]
		],[
			[1, 0, 0],
			[1, 1, 1]
		],[
			[1, 0, 0],
			[1, 0, 0],
			[1, 1, 1],
		],[
			[1, 1, 1, 1]
		],[
			[1, 1, 1, 1, 1]
		],[
			[1, 1],
			[1, 1]
		],[
			[1, 0],
			[1, 1]
		],[
			[1, 1]
		],[
			[1, 1],
			[1, 1],
			[1, 1]
		],[
			[1],
		]
	]
	
	static rotatePattern(pattern) {

		// Get the number of rows and columns at pattern
		const rows = pattern.length;
		const cols = pattern[0].length;

		const rotatedPattern = [];

		// Determine the dimensions of the rotated pattern based on the original pattern
		const newRows = cols
		const newCols = rows

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
			this.blocks[y] = []
			this.shadow[y] = []
			for (let x in pattern[y]) {
				//console.log(pattern.length, pattern[y].length)
				//console.log(y, x, pattern)
				if (pattern[y][x] === 1) {
					this.blocks[y][x] = pool.get("block")
					this.blocks[y][x].img = img
					this.blocks[y][x].globalAlpha = 1

					this.shadow[y][x] = pool.get("block")
					this.shadow[y][x].img = img
					this.shadow[y][x].globalAlpha = .5
				} else {
					this.blocks[y][x] = null;
					this.shadow[y][x] = null;
				}
			}
		}
	}
	checkFit(indexY, indexX) {
		/* Check if board.grid has space to fit this piece in the given indexes*/

		indexX = Number(indexX)
		indexY = Number(indexY)

		for (let iY in this.blocks) {
			for (let iX in this.blocks[iY]) {
				if (!this.blocks[iY][iX]) continue;

				iX = Number(iX)
				iY = Number(iY)

				let absIndexX = indexX + iX
				let absIndexY = indexY + iY

				if (board.grid[absIndexX][absIndexY])
					return false
			}
		}

		return true
	}
	updateBlocksPosition() {
		for (let y in this.blocks) {
			for (let x in this.blocks[y]) {
				let block = this.blocks[y][x]
				if (block === null) continue

				let blockOffsetX = x * config.blockWidth
				let blockOffsetY = y * config.blockWidth
				block.x = this.x + blockOffsetX
				block.y = this.y + blockOffsetY
			}
		}
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
		let isToTheLeft = shadowX < board.x
		let isToTheRight = shadowX > board.x + board.width - this.width
		let isOverTheTop = shadowY < board.y
		let isUnderTheBottom = shadowY > board.y + board.height - this.height
		if (isToTheLeft || isToTheRight || isOverTheTop || isUnderTheBottom)
			return this.isShadowVisible = false;

		this.shadowIndexX = (shadowX - board.x) / config.blockWidth;
		this.shadowIndexY = (shadowY - board.y) / config.blockWidth;

		let fit = this.checkFit(this.shadowIndexY, this.shadowIndexX)
		if (fit) {
			for (let y in this.shadow) {
				for (let x in this.shadow[y]) {
					if (!this.shadow[y][x]) continue;
					let blockOffsetX = x * config.blockWidth
					let blockOffsetY = y * config.blockWidth

					this.shadow[y][x].x = shadowX + blockOffsetX
					this.shadow[y][x].y = shadowY + blockOffsetY
				}
			}
		}

		this.isShadowVisible = fit

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

	}
	placeOnBoard() {
		// Align this piece and its blocks on the board grid
		this.x = this.shadowIndexX * config.blockWidth + board.x;
		this.y = this.shadowIndexY * config.blockWidth + board.y;
		this.updateBlocksPosition();

		// Put each block of piece in the board
		for (let y in this.blocks) {
			for (let x in this.blocks[y]) {
				if (this.blocks[y][x]) {
					let indexX = this.shadowIndexX + Number(x)
					let indexY = this.shadowIndexY + Number(y)
					board.grid[indexX][indexY] = this.blocks[y][x]
				}
			}
		}

		// Remove this piece from screen and tray
		screen.remove(this,
			this.zIndex);
		for (let space of blocksTray.spaces) {
			if (space.content == this) {
				space.content = null;
			}
		}
	}
	onDrop() {
		if (this.isShadowVisible) {
			this.placeOnBoard()
			showNewPiece()

			// Get row & columns that got filled
			let filledColumnsIndex = checkBoardColumns()
			let filledRowsIndex = checkBoardRows()
			// Clear them (if there are any)
			for (let column of filledColumnsIndex)
				clearBoardColumn(column)
			for (let row of filledRowsIndex)
				clearBoardRow(row)

			checkLost()
		} else {
			console.log("shadow is not visible")
			// Prepare an animation to get back to tray
			for (let space of blocksTray.spaces) {
				if (space.content != this) continue;

				let position = blocksTray.contentPositionAsInCenter(space)
				this.targetX = position.x
				this.targetY = position.y
			}
		}
	}
	update() {
		if (this.isBeingDragged) {
			this.updateBlocksPosition();
			this.updateShadowPosition();
		} else if (this.targetX || this.targetY) {
			let diffX = this.targetX - this.x
			let diffY = this.targetY - this.y

			// Set a diagonal movement based on a proportion between
			// the complete movement and the hypotenuse
			let hypotenuse = Math.sqrt(diffX*diffX + diffY*diffY)
			let proportionX = diffX / hypotenuse
			let proportionY = diffY / hypotenuse
			let movementDiag = 20
			let movementX = proportionX * movementDiag
			let movementY = proportionY * movementDiag

			this.x += movementX
			this.y += movementY

			// End animation
			if (Math.abs(movementX) >= Math.abs(diffX)) {
				this.x = this.targetX
				this.targetX = null
			}
			if (Math.abs(movementY) >= Math.abs(diffY)) {
				this.y = this.targetY
				this.targetY = null
			}

			this.updateBlocksPosition()
		}
	}
	draw(ctx) {
		// Draw shadow
		if (this.isShadowVisible)
			for (let row of this.shadow)
			for (let item of row)
			if (item)
			item.draw(ctx);


		// Draw the actual blocks
		for (let row of this.blocks)
			for (let item of row)
			if (item)
			item.draw(ctx);
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

	// Check if pick something on screen objs
	for (let frame of screen)
		for (let item of frame)
		if (item.isPointInside(touchX, touchY))
		touch.drag(item)

	// Check if clicked on tray
	let space = blocksTray.isPointInside(touchX, touchY)
	if (space && space.content)
		touch.drag(space.content)
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

	if (touch.draging)
		touch.drop()
});

function showNewPiece() {
	let spaces = blocksTray.spaces;

	// Try to find an empty space in the blocks tray
	for (let space of spaces) {
		if (space.content) continue;

		// Config the piece
		let piece = new Piece();
		space.content = piece;
		blocksTray.centralizeContent(space)
		piece.updateBlocksPosition();

		screen.put(piece, 0);
		break;
	}
}

function checkBoardColumns() {
	// Check if some columns are filled

	let filledColumnsIndex = []
	for (let column in board.grid) {
		let columnHaveEmptyParts = false

		for (let row in board.grid[column]) {
			if (board.grid[column][row]) continue
			else columnHaveEmptyParts = true

			break
		}

		if (!columnHaveEmptyParts)
			filledColumnsIndex.push(column)
		//if (!columnHaveEmptyParts) clearBoardColumn(column)
	}

	return filledColumnsIndex
}
function checkBoardRows() {
	// Check if some rows are filled

	let filledRowsIndex = []
	for (let row = 0; row < config.boardColumnLength; row++) {
		let rowHaveEmptyParts = false

		for (let column = 0; column < config.boardColumnLength; column++) {
			if (board.grid[column][row]) continue
			else rowHaveEmptyParts = true

			break
		}

		if (!rowHaveEmptyParts)
			filledRowsIndex.push(row)
		//if (!rowHaveEmptyParts) clearBoardRow(row)
	}

	return filledRowsIndex
}
function clearBoardColumn(column) {
	let targetScore = 0
	for (let row = 0; row < config.boardRowLength; row++) {
		pool.put(board.grid[column][row], "blocks")
		board.grid[column][row] = null
		targetScore++
	}
	score.target += targetScore
}
function clearBoardRow(row) {
	let targetScore = 0
	for (let column = 0; column < config.boardColumnLength; column++) {
		pool.put(board.grid[column][row], "blocks")
		board.grid[column][row] = null
		targetScore++
	}
	score.target += targetScore
}

function checkLost() {
	for (let space of blocksTray.spaces) {
		let piece = space.content
		let maxIndexX = config.boardColumnLength - piece.blocks[0].length
		let maxIndexY = config.boardRowLength - piece.blocks.length

		// Check if fit on any part of the board grid
		for (let indexX in board.grid) {
			for (let indexY in board.grid[indexX]) {
				if (indexX > maxIndexX || indexY > maxIndexY) continue
				if (board.grid[indexX][indexY]) continue

				let fit = piece.checkFit(indexY, indexX)

				if (fit) return
			}
		}
	}

	alert("You've lost! Refresh the page to play again.")
}

function update() {
	requestAnimationFrame(update);

	touch.update();
	score.update()

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
	ctx.fillStyle = "#4f6875";
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

	for (let frame of screen)
		for (let item of frame)
		if (item.draw) item.draw(ctx);

	score.draw(ctx)

}