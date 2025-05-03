class Block {
  constructor() {
    this.x = null;
    this.y = null;
    this.width = board.blockWidth;
    this.image = null;
    this.alpha = 1;

    this.animations = [];
  }

  static images = Array.from({ length: 4 }, (_, i) => {
    const img = new Image()
    img.src = `./assets/block-${i}.png`
    return img
  })

  startGrowFadeAnimations(callback) {
    const duration = 500;
    this.animations.push(
      new Animation({
        property: "width",
        from: this.width,
        to: this.width + 20,
        duration,
        onUpdate: (v) => (this.width = v),
        onComplete: () => checkAllDone(),
      }),
      new Animation({
        property: "x",
        from: this.x,
        to: this.x - 10,
        duration,
        onUpdate: (v) => (this.x = v),
        onComplete: () => checkAllDone(),
      }),
      new Animation({
        property: "y",
        from: this.y,
        to: this.y - 10,
        duration,
        onUpdate: (v) => (this.y = v),
        onComplete: () => checkAllDone(),
      }),
      new Animation({
        property: "alpha",
        from: this.alpha,
        to: 0,
        duration,
        onUpdate: (v) => (this.alpha = v),
        onComplete: () => checkAllDone(),
      })
    );

    let done = 0;
    const checkAllDone = () => {
      if (++done === 2 && callback) callback();
    };
  }

  update(now) {
    this.animations = this.animations.filter((animation) => {
      animation.update(now);
      return !animation.finished;
    });
  }
  draw(ctx, x, y) {
    let img = this.image

    x = x || this.x;
    y = y || this.y;
    
    ctx.alpha = this.alpha;
    ctx.drawImage(img, x, y, this.width, this.width);
    ctx.alpha = 1;
  }
  isPointInside(x, y) {
    let top = this.y;
    let right = this.x + this.width;
    let bottom = this.y + this.width;
    let left = this.x;

    if (left < x && x < right) if (top < y && y < bottom) return true;

    return false;
  }
}
