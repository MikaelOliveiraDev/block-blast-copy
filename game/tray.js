const tray = {
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
  canvas: null,
  init: function (board) {
    this.spaceWidth = board.blockWidth * this.spaceRows;
    this.spaceHeight = board.blockWidth * this.spaceCols;
    let spaceBetween = 5;
    let marginTop = 20;
    let middleX = this.canvas.width / 2;

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