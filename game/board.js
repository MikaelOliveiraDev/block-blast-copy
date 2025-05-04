const board = {
  grid: [],
  x: 10,
  y: 100,
  width: null,
  height: null,
  blockWidth: 38,
  xLength: 8,
  yLength: 8,
  canvas: null,
  init: function () {
    // Define dimentions
    this.width = this.blockWidth * this.xLength;
    this.height = this.blockWidth * this.yLength;
    // Define position
    this.x = (this.canvas.width - this.width) / 2;

    // Prepare the grid
    for (let indexY = 0; indexY < this.yLength; indexY++) {
      this.grid[indexY] = [];
      for (let indexX = 0; indexX < this.xLength; indexX++) {
        this.grid[indexY][indexX] = null;
      }
    }
  },
  checkBoardYs: function () {
    // Check if some rows are filled

    let filledYs = [];
    for (let indexY in this.grid) {
      let containsEmptyParts = false;

      for (let indexX in this.grid[indexY]) {
        if (this.grid[indexY][indexX]) continue;
        else containsEmptyParts = true;
        break;
      }

      if (!containsEmptyParts) filledYs.push(indexY);
    }
    return filledYs;
  },
  checkBoardXs: function () {
    // Check if some columns are filled

    let filledXs = [];
    for (let indexX = 0; indexX < this.xLength; indexX++) {
      let containsEmptyParts = false;

      for (let indexY = 0; indexY < board.yLength; indexY++) {
        if (this.grid[indexY][indexX]) continue;
        else containsEmptyParts = true;

        break;
      }

      if (!containsEmptyParts) filledXs.push(indexX);
    }

    return filledXs;
  },
  clearAlongY: function (indexY) {
    let targetScore = 0;
    for (let indexX = 0; indexX < this.xLength; indexX++) {
      let animationDelay = indexX * 30;
      let block = this.grid[indexY][indexX];

      setTimeout(() => {
        block.startGrowFadeAnimations(() => LayerManager.remove(block));
      }, animationDelay);

      this.grid[indexY][indexX] = null;
      targetScore++;
    }
    //score.target += targetScore;
  },
  clearAlongX: function (indexX) {
    let targetScore = 0;
    for (let indexY = 0; indexY < this.yLength; indexY++) {
      let animationDelay = indexY * 30;
      let block = this.grid[indexY][indexX];

      setTimeout(() => {
        block.startGrowFadeAnimations(() => LayerManager.remove(block));
      }, animationDelay);

      this.grid[indexY][indexX] = null;
      targetScore++;
    }
    //score.target += targetScore;
  },
  checkLost: function() {
    for (let space of tray.spaces) {
      let piece = space.content;
      let maxIndexY = this.yLength - piece.blocks.length;
      let maxIndexX = this.xLength - piece.blocks[0].length;
  
      // Check if fit on any part of the board grid
      for (let [y, row] of this.grid.entries()) {
        if (y > maxIndexY) continue;
        for (let [x, cell] of row.entries()) {
          if (x > maxIndexX || cell) continue;
      
          if (piece.checkFit(y, x)) return;
        }
      }
      
    }
  
    alert("You've lost! Refresh the page to play again.");
  },
  draw: function (ctx) {
    const colors = ["#a3a3a3", "#949494"];

    for (let indexY = 0; indexY < this.grid.length; indexY++) {
		
      for (let indexX = 0; indexX < this.grid[indexY].length; indexX++) {
        let evenOdd = (indexY + indexX) % 2;
        let color = colors[evenOdd];
		let x = this.blockWidth * indexX + this.x;
		let y = this.blockWidth * indexY + this.y;
	
		ctx.fillStyle = color;
		ctx.fillRect(x, y, this.blockWidth, this.blockWidth);
      }
    }
  },
};
