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

  positionAsInCenter(item) {
    item = item || this.content

    const x = this.x + (this.width - this.content.width) / 2
    const y = this.y + (this.height - this.content.height) / 2;

    return {x: x, y: y}
  }
  centralizeContent() {
    if (!this.content) return
    
    const {x, y} = this.positionAsInCenter()
    this.content.x = x
    this.content.y = y
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