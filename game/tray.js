class TraySpace extends DisplayObject {
  constructor(x, y, width, height) {
    super();
    this.width = width;
    this.height = height;
    this.relX = x;
    this.relY = y;
    this.content = null;
  }

  setContent(content) {
    this.content = content;
    this.centralizeContent();
  }

  centralizeContent() {
    if (this.content) {
      this.content.relX = this.relX + (this.width - this.content.width) / 2;
      this.content.relY = this.relY + (this.height - this.content.height) / 2;
    }
  }

  onPointerDown(pointer) {
    if (this.isPointInside(pointer.x, pointer.y) && this.content) {
      pointer.drag(this.content);
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#9e9e9e39";
    ctx.fillRect(this.left, this.top, this.width, this.height);
  }
}
