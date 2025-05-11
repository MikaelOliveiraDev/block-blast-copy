class Piece extends DisplayObject {
  constructor(board) {
    super();
    this.blocks = [];
    this.isBeingDragged = false;
    this.animations = [];
    this.blockWidth = board.blockWidth;
    this.scale = 1

    // Select a random pattern
    let index = Math.floor(Math.random() * Piece.patterns.length);
    let pattern = Piece.patterns[index];
    // Rotate some times
    let rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) pattern = Piece.rotatePattern(pattern);
    // Select an image
    let imageID = Math.floor(Math.random() * Block.images.length);

    // Configure width and height
    this.width = this.blockWidth * pattern[0].length;
    this.height = this.blockWidth * pattern.length;
    // Configure reference point
    this.refX = this.width / 2;
    this.refY = this.height / 2;

    this.createGrid(pattern, imageID);
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
  static dragSound = new Sound("./assets/drag-block.aac", 7);
  static dropSound = new Sound("./assets/drop-block.aac", 7);

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

  createGrid(pattern, imageID) {
    for (let y in pattern) {
      this.blocks[y] = [];
      for (let x in pattern[y]) {
        if (pattern[y][x] === 1) {
          const block = new Block();
          block.image = Block.images[imageID];
          block.zIndex = LayerManager.ZINDEX.PIECES;
          block.positionOrigin = this;
          block.relX = 0 - this.refX + (x * this.blockWidth)
          block.relY = 0 - this.refY + (y * this.blockWidth)

          this.blocks[y][x] = block
          LayerManager.add(this.blocks[y][x]);
        } else {
          this.blocks[y][x] = null;
        }
      }
    }
  }

  checkFit(desY, desX) {
    /* Check if board.grid has slot to fit this piece in the given indexes. */
    /* desX => destination index in which the PIECE would be placed */
    /* blcX => BLOCK index relative to the PIECE index */
    /* brdX => BOARD slot index in which the BLOCK would be placed */
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

  placeOnBoard(indexX, indexY) {
    this.positionOrigin = board;
    // Align this piece on the board grid
    this.left = board.left + indexX * this.blockWidth;
    this.top = board.top + indexY * this.blockWidth;

    // Put each block of piece in the board
    for (let y = 0; y < this.blocks.length; y++) {
      for (let x = 0; x < this.blocks[y].length; x++) {
        let block = this.blocks[y][x];
        if (block) {
          let bx = indexX + x;
          let by = indexY + y;
          board.grid[by][bx] = block;
          block.positionOrigin = board;
          block.relX = bx * this.blockWidth;
          block.relY = by * this.blockWidth;
          LayerManager.change(block, LayerManager.ZINDEX.BOARD_ITEMS);
        }
      }
    }
    // Get row & columns that got filled
    let filledYs = board.checkBoardYs();
    let filledXs = board.checkBoardXs();
    // Clear them (if there are any)
    for (let indexY of filledYs) board.clearAlongY(indexY);
    for (let indexX of filledXs) board.clearAlongX(indexX);

    // Remove this piece from screen and slot
    LayerManager.remove(this);
    this.slot.content = null;
  }

  onDrag() {
    Piece.dragSound.play();
    this.scale = 1

    const marginToPoiner = 50;

    this.relX = 0;
    this.relY = this.height / 2 - marginToPoiner;
  }
  onDrop() {
    const relTop = this.top - board.absY;
    const relLeft = this.left - board.absX;
    const indexX = Math.round(relLeft / this.blockWidth);
    const indexY = Math.round(relTop / this.blockWidth);
    
    if (this.checkFit(indexY, indexX)) {
      Piece.dropSound.play();
      this.placeOnBoard(indexX, indexY);
      showNewPiece();
      board.checkLost();
    } else {
      this.positionOrigin = this.slot;
      this.startGoBackAnimation(() => {
        this.scale = .5
      });
    }
  }

  startGoBackAnimation(callback) {
    if (!this.slot) console.error("Piece is not positioned in slot");

    const targetRelX = this.slot.width / 2;
    const targetRelY = this.slot.height / 2;

    const SPEED_PIXELS_PER_FRAME = 4;
    const distance = DisplayObject.distance(
      this.relX,
      this.relY,
      targetRelX,
      targetRelY
    );
    const duration = Math.ceil(distance / SPEED_PIXELS_PER_FRAME);

    let complete = 0;
    const checkAllComplete = () => {
      if (++complete === 2 && callback) callback();
    };

    this.animations.push(
      new Animation({
        property: "relX",
        from: this.relX,
        to: targetRelX,
        duration,
        onUpdate: (x) => (this.relX = x),
        onComplete: checkAllComplete,
      }),
      new Animation({
        property: "relY",
        from: this.relY,
        to: targetRelY,
        duration,
        onUpdate: (y) => (this.relY = y),
        onComplete: checkAllComplete,
      })
    );
  }
  update(now) {
    this.animations = this.animations.filter((animation) => {
      animation.update(now);
      return !animation.finished;
    });

  }
  draw(ctx) {
    ctx.save()
    ctx.translate(this.absX, this.absY)
    ctx.scale(this.scale, this.scale)

    ctx.strokeStyle = "yellow";
    ctx.strokeRect(-this.refX, -this.refY, this.width, this.height);
    //console.log("piece", this.positionOrigin)

    // The reference point
    ctx.fillStyle = "red";
    const dot = 2;
    ctx.fillRect(-dot, -dot, dot * 2, dot * 2);

    ctx.restore()
  }
}
