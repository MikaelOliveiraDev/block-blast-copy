class Piece extends DisplayObject {
  constructor(board) {
    super()
    this.blocks = [];
    this.isBeingDragged = false;
    this.needsPositionUpdate = false;
    this.animations = [];
    this.blockWidth = board.blockWidth

    // Select a random pattern
    let index = Math.floor(Math.random() * Piece.patterns.length);
    let pattern = Piece.patterns[index];
    // Rotate some times
    let rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) pattern = Piece.rotatePattern(pattern);
    // Select an image
    let imageID = Math.floor(Math.random() * Block.images.length)

    this.createGrid(pattern, imageID);
    // Configure width and height
    this.width = this.blockWidth * pattern[0].length;
    this.height = this.blockWidth * pattern.length;
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
  static dragSound = new Sound("./assets/drag-block.aac", 7)
  static dropSound = new Sound("./assets/drop-block.aac", 7)

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
          this.blocks[y][x] = new Block();
          this.blocks[y][x].image = Block.images[imageID];
          this.blocks[y][x].globalAlpha = 1;
          this.blocks[y][x].zIndex = LayerManager.ZINDEX.PIECES;
          LayerManager.add(this.blocks[y][x]);
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
        
        let blockOffsetX = x * this.blockWidth;
        let blockOffsetY = y * this.blockWidth;
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
    let indexX = Math.round(relX / this.blockWidth);
    let indexY = Math.round(relY / this.blockWidth);

    // Align this piece on the board grid
    this.x = indexX * this.blockWidth + board.x;
    this.y = indexY * this.blockWidth + board.y;
    this.updateBlocksPosition();

    // Put each block of piece in the board
    for (let y = 0; y < this.blocks.length; y++) {
      for (let x = 0; x < this.blocks[y].length; x++) {
        let block = this.blocks[y][x];
        if (block) {
          let bx = indexX + x;
          let by = indexY + y;
          board.grid[by][bx] = block;
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

    // Remove this piece from screen and tray
    LayerManager.remove(this);
    for (let space of trayspaces) {
      if (space.content == this) {
        space.content = null;
      }
    }
  }

  onDrag() {
    Piece.dragSound.play()

    const marginToPoiner = 50

    this.relX = 0
    this.relY = -this.height/2 - marginToPoiner
  }
  onDrop() {
    let relX = this.x - board.x;
    let relY = this.y - board.y;
    let indexX = Math.round(relX / this.blockWidth);
    let indexY = Math.round(relY / this.blockWidth);

    if (this.checkFit(indexY, indexX)) {
      Piece.dropSound.play()
      this.placeOnBoard();
      showNewPiece();
      board.checkLost()
    } else {
      this.changeOrigin(this.space)
      this.startGoBackAnimation();
    }
  }

  startGoBackAnimation(callback) {
    if (!this.space)
      console.error("Piece is not positioned in tray");
    
    const SPEED_PIXELS_PER_FRAME = 4;
    const distance = this.distanceTo(this.space)
    const duration = Math.ceil(distance / SPEED_PIXELS_PER_FRAME);
    
    let complete = 0;
    const checkAllComplete = () => {
      if (++complete === 2 && callback) callback();
    };

    const targetRelX = this.space.width / 2
    const targetRelY = this.space.height / 2
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
      this.needsPositionUpdate = true;
      return !animation.finished;
    });

    if (this.isBeingDragged || this.needsPositionUpdate) {
      this.updateBlocksPosition();
      this.needsPositionUpdate = false;
    }
  }
  draw(ctx) {
    const x = this.x - this.width/2
    const y = this.y - this.height/2

    ctx.strokeRect(x, y, this.width, this.height)
  }
}