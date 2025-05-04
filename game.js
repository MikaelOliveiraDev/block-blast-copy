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
