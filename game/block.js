class Block extends DisplayObject {
  constructor() {
    super()
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
    const grow = 10
    const duration = 500;

    this.animations.push(
      new Animation({
        property: "width",
        from: this.width,
        to: this.width + grow,
        duration,
        onUpdate: (v) => (this.width = v),
        onComplete: () => checkAllDone(),
      }),
      new Animation({
        property: "x",
        from: this.x,
        to: this.x - grow / 2,
        duration,
        onUpdate: (v) => (this.x = v),
        onComplete: () => checkAllDone(),
      }),
      new Animation({
        property: "y",
        from: this.y,
        to: this.y - grow / 2,
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
  draw(ctx) {
    ctx.save()
    ctx.translate(this.positionOrigin.x, this.positionOrigin.y)
    ctx.translate(this.relX, this.relY)
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.image, 0, 0, this.width, this.width);
    ctx.globalAlpha = 1;
    ctx.restore()
  }
}
