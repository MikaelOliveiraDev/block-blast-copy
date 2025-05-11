class Board extends DisplayObject {
  constructor() {
    super();
    this.canvas = canvas;
    this.blockWidth = 38;
    this.xLength = 8;
    this.yLength = 8;

    this.width = this.blockWidth * this.xLength;
    this.height = this.blockWidth * this.yLength;
    this.relX = (this.canvas.width - this.width) / 2;
    this.relY = 100;

    this.grid = Array.from({ length: this.yLength }, () =>
      Array.from({ length: this.xLength }, () => null)
    );
  }

  checkBoardYs() {
    const filledYs = [];

    for (let indexY in this.grid) {
      if (this.grid[indexY].every((cell) => cell !== null)) {
        filledYs.push(parseInt(indexY));
      }
    }

    return filledYs;
  }

  checkBoardXs() {
    const filledXs = [];

    for (let indexX = 0; indexX < this.xLength; indexX++) {
      if (this.grid.every((row) => row[indexX] !== null)) {
        filledXs.push(indexX);
      }
    }

    return filledXs;
  }

  clearAlongY(indexY) {
    let targetScore = 0;
    for (let indexX = 0; indexX < this.xLength; indexX++) {
      const block = this.grid[indexY][indexX];
      if (block) {
        setTimeout(() => {
          block.startGrowFadeAnimations(() => LayerManager.remove(block));
        }, indexX * 30);
        this.grid[indexY][indexX] = null;
        targetScore++;
      }
    }
    combo.play();
    combo.increase();
  }

  clearAlongX(indexX) {
    let targetScore = 0;
    for (let indexY = 0; indexY < this.yLength; indexY++) {
      const block = this.grid[indexY][indexX];
      if (block) {
        setTimeout(() => {
          block.startGrowFadeAnimations(() => LayerManager.remove(block));
        }, indexY * 30);
        this.grid[indexY][indexX] = null;
        targetScore++;
      }
    }
    combo.play();
    combo.increase();
  }

  checkLost() {
    for (let slot of slots) {
      let piece = slot.content;
      let maxIndexY = this.yLength - piece.blocks.length;
      let maxIndexX = this.xLength - piece.blocks[0].length;

      for (let [y, row] of this.grid.entries()) {
        if (y > maxIndexY) continue;
        for (let [x, cell] of row.entries()) {
          if (x > maxIndexX || cell) continue;

          if (piece.checkFit(y, x)) return false;
        }
      }
    }
    alert("You've lost! Refresh the page to play again.");
    return true;
  }

  draw(ctx) {
    const colors = ["#a3a3a3", "#949494"];
    for (let indexY = 0; indexY < this.grid.length; indexY++) {
      for (let indexX = 0; indexX < this.grid[indexY].length; indexX++) {
        let evenOdd = (indexY + indexX) % 2;
        let color = colors[evenOdd];
        let x = this.blockWidth * indexX + this.left;
        let y = this.blockWidth * indexY + this.top;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.blockWidth, this.blockWidth);
      }
    }
  }
}

const board = new Board();
