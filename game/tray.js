class TraySpace {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.content = null;
  }

  setContent(content) {
    this.content = content
    this.centralizeContent()
  }

  centralizeContent() {
    if (!this.content) return
    this.content.x = this.x + (this.width - this.content.width) / 2
    this.content.y = this.y + (this.height - this.content.height) / 2;
  }
  isPointInside(px, py) {
    return (
      this.x < px &&
      px < this.x + this.width &&
      this.y < py &&
      py < this.y + this.height
    );
  }
  onPointerDown(pointer) {
    if (this.isPointInside(pointer.x, pointer.y) && this.content) {
      pointer.drag(this.content);
    }
  }
  draw(ctx) {
    ctx.fillStyle = "#9e9e9e39";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}