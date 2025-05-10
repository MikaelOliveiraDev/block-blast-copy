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
        property: "relX",
        from: this.relX,
        to: this.relX - grow / 2,
        duration,
        onUpdate: (v) => (this.relX = v),
        onComplete: () => checkAllDone(),
      }),
      new Animation({
        property: "relY",
        from: this.relY,
        to: this.relY - grow / 2,
        duration,
        onUpdate: (v) => (this.relY = v),
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
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.image, this.left, this.top, this.width, this.width);
    ctx.globalAlpha = 1;
    ctx.restore()
  }
}
