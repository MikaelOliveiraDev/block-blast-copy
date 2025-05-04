"user strict";

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

