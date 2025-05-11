const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const LayerManager = {
  layers: [],
  ZINDEX: {
    BACKGROUND: 0,
    BOARD_ITEMS: 1,
    PIECES: 2,
    UI: 3,
  },

  add(item) {
    const z = item.zIndex;
    if (!this.layers[z]) this.layers[z] = [];
    this.layers[z].push(item);
  },
  remove(item) {
    const z = item.zIndex;
    const layer = this.layers[z];
    if (!layer) {
      console.log(`Camada ${z} não existe!`);
      return;
    }
    const index = layer.indexOf(item);
    if (index !== -1) {
      layer.splice(index, 1);
    }
  },
  change(item, newZIndex) {
    this.remove(item);
    item.zIndex = newZIndex;
    this.add(item);
  },
  forEach(callback) {
    for (let layer of this.layers)
      if (layer) for (let item of layer) callback(item);
  },
  clear() {
    for (let index = 0; index < this.layers.length; index++)
      if (this.layers[index]) this.layers[index] = [];
  },
};

const pointer = {
  absX: null,
  absY: null,
  hold: 0,
  dragging: null,
  update: function () {
    if (this.hold) this.hold++;
  },
  checkDown: function () {
    LayerManager.forEach((item) => {
      if (
        item.isPointInside &&
        item.isPointInside(this.absX, this.absY) &&
        item.onPointerDown
      )
        item.onPointerDown(this);
    });
  },
  drag: function (item) {
    this.dragging = item;
    this.dragging.isBeingDragged = true;
    this.dragging.positionOrigin = this;

    if (item.onDrag) item.onDrag();
    /* if (item instanceof Piece) {
      pointer.dragOffsetX = -(item.width / 2);
      pointer.dragOffsetY = -item.height - board.blockWidth;
    } */
  },
  drop: function () {
    if (pointer.dragging.onDrop) pointer.dragging.onDrop();
    pointer.dragging.isBeingDragged = false;
    pointer.dragging = null;
  },
};

function loadScript(url, callback) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}

function createStartScreen() {
  // Start button

  const border = 8;
  const hue = 45;
  const saturation = 100;
  const startButton = new DisplayObject();
  startButton.width = 160;
  startButton.height = 60;
  startButton.relX = canvas.width / 2;
  startButton.relY = canvas.height / 2;
  startButton.refX = startButton.width / 2;
  startButton.refY = startButton.height / 2;
  startButton.zIndex = LayerManager.ZINDEX.UI;
  startButton.onPointerDown = createGameScreen;
  startButton.draw = function (ctx) {
    const { left, top, right, bottom, width, height } = this;
    const centerX = this.refX;
    const centerY = this.refY;

    // The square
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, 55%)`;
    ctx.fillRect(left, top, width, height);

    // Left border
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, 62%)`;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.lineTo(left + border, top + border);
    ctx.lineTo(left + border, bottom - border);
    ctx.lineTo(left, bottom);
    ctx.fill();
    ctx.closePath();

    // Top border
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, 74%)`;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right - border, top + border);
    ctx.lineTo(left + border, top + border);
    ctx.lineTo(left, top);
    ctx.fill();
    ctx.closePath();

    // Right border
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, 48%)`;
    ctx.beginPath();
    ctx.moveTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right - border, bottom - border);
    ctx.lineTo(right - border, top + border);
    ctx.lineTo(right, top);
    ctx.fill();
    ctx.closePath();
    // Bottom border
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, 45%)`;
    ctx.beginPath();
    ctx.moveTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.lineTo(left + border, bottom - border);
    ctx.lineTo(right - border, bottom - border);
    ctx.lineTo(right, bottom);
    ctx.fill();
    ctx.closePath();

    // Text
    ctx.textBaseline = "middle";
    ctx.font = "bold italic 20px Verdana";
    ctx.fillStyle = "#664d00";
    ctx.textAlign = "center";
    ctx.fillText("START", left + centerX, top + centerY);
  };

  // Game Title
  const gameTitle = new DisplayObject();
  gameTitle.text = "Block Blast";
  gameTitle.zIndex = LayerManager.ZINDEX.UI;
  gameTitle.gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gameTitle.gradient.addColorStop(0.2, "white");
  gameTitle.gradient.addColorStop(0.9, "gold");
  gameTitle.draw = function (ctx) {
    ctx.fillStyle = this.gradient;
    ctx.font = "bold italic 50px Verdana";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "center";
    ctx.fillText(this.text, canvas.width / 2, canvas.height / 2 - 50);
  };

  LayerManager.add(startButton);
  LayerManager.add(gameTitle);
}
function createGameScreen() {
  // Clear layers
  LayerManager.clear();

  loadScript("./game/board.js", () => {
    board.canvas = canvas;
    board.zIndex = LayerManager.ZINDEX.BACKGROUND;
    LayerManager.add(board);

    loadScript("./game/slot.js", () => {
      loadScript("./game/block.js", () => {
        loadScript("./game/piece.js", () => {
          loadScript("./game/combo.js", startGame);
        });
      });
    });
  });
}
function startGame() {
  window.slots = [];

  const numberOfSlots = 3;
  const width = canvas.width / numberOfSlots;
  const gap = 5;
  const marginTop = 15;
  const y = board.absY + board.height + marginTop;
  for (let i = 0; i < numberOfSlots; i++) {
    const x = width * i + gap;
    const slot = new Slot(x, y, width - 2 * gap, width - 2 * gap);
    slot.zIndex = LayerManager.ZINDEX.BACKGROUND;
    LayerManager.add(slot);
    slots.push(slot);
  }

  showNewPiece();
  showNewPiece();
  showNewPiece();
}
function showNewPiece() {
  // Try to find an empty slot in the blocks slot
  let slot;
  for (slot of slots) if (!slot.content) break;

  // Config the piece
  let piece = new Piece(board);
  piece.slot = slot;
  piece.positionOrigin = slot;
  piece.relX = slot.width / 2;
  piece.relY = slot.height / 2;
  piece.updateBlocksPosition();
  piece.zIndex = LayerManager.ZINDEX.PIECES;

  slot.content = piece;
  LayerManager.add(piece);
}

function update(now) {
  pointer.update(now);

  LayerManager.forEach((item) => {
    if (item.update) item.update(now);
  });

  render();
  requestAnimationFrame(update);
}
function render() {
  ctx.fillStyle = "#4f6875";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  LayerManager.forEach((item) => {
    if (item.draw) item.draw(ctx);
  });
}

class DisplayObject {
  constructor() {
    this._origin = DisplayObject.CANVAS_ORIGIN;
    // Reference is a coordinate in the this object, which is used to position on the canvas
    this._refX = 0;
    this._refY = 0;

    this._relX = 0;
    this._relY = 0;

    this.width = 0;
    this.height = 0;
  }

  static CANVAS_ORIGIN = Object.freeze({ absX: 0, absY: 0 });
  static distance(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* Getters */
  get refX() {
    return this._refX;
  }
  get refY() {
    return this._refY;
  }
  get relX() {
    return this._relX;
  }
  get relY() {
    return this._relY;
  }

  // Abolute is only getter
  get absX() {
    return this._origin.absX + this._relX;
  }
  get absY() {
    return this._origin.absY + this._relY;
  }

  // Bounds are absolute and are calculated from the absolute positions
  get top() {
    return this.absY - this._refY;
  }
  get left() {
    return this.absX - this._refX;
  }
  get bottom() {
    return this.absY - this._refY + this.height;
  }
  get right() {
    return this.absX - this._refX + this.width;
  }

  get positionOrigin() {
    return this._origin;
  }

  /* Setters */
  set refX(x) {
    this._refX = x;
  }
  set refY(y) {
    this._refY = y;
  }
  set relX(x) {
    this._relX = x;
  }
  set relY(y) {
    this._relY = y;
  }
  // Setters for absolute bounds
  set top(value) {
    this._relY = value + this._refY - this._origin.absY;
  }
  set left(value) {
    this._refY = value + this._refX - this._origin.absY;
  }
  set bottom(value) {
    this.top = value - this.height;
  }
  set right(value) {
    this.left = value - this.width;
  }

  // Prevent setting absX and absY directly
  set absX(_) {
    throw new Error(
      "absX is read-only. Modify relX or positionOrigin instead."
    );
  }
  set absY(_) {
    throw new Error(
      "absY is read-only. Modify relY or positionOrigin instead."
    );
  }

  set positionOrigin(origin) {
    const absX = this.absX;
    const absY = this.absY;
    if (
      !origin ||
      typeof origin.absX !== "number" ||
      typeof origin.absY !== "number"
    ) {
      this._origin = DisplayObject.CANVAS_ORIGIN;
    } else {
      this._origin = origin;
      this._relX = absX - origin.absX;
      this._relY = absY - origin.absY;
    }
  }

  isPointInside(px, py) {
    return (
      px >= this.left && px <= this.right && py >= this.top && py <= this.bottom
    );
  }
}
class Animation {
  constructor({ property, from, to, duration, onUpdate, onComplete }) {
    this.property = property;
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.startTime = null;
    this.finished = false;
  }

  update(now) {
    if (this.finished) return;

    if (this.startTime === null) this.startTime = now;

    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const value = this.from + (this.to - this.from) * progress;
    this.onUpdate(value);

    if (progress === 1) {
      this.finished = true;
      this.onComplete?.();
    }
  }
}
class Sound {
  constructor(url, clones) {
    this.url = url;

    this._audios = [];
    this._playing = [];

    for (let i = 0; i < clones; i++) {
      const audio = new Audio(url);
      this._audios.push(audio);
    }
  }
  play() {
    if (this._audios.length === 0) return console.warn("No clones avaliable");

    const audio = this._audios.pop();

    audio.addEventListener(
      "ended",
      (ev) => {
        let index = this._playing.indexOf(ev.target);
        if (index != -1) this._playing.splice(index, 1);
        this._audios.push(ev.target);
      },
      { once: true }
    );

    audio
      .play()
      .then(() => {
        this._playing.push(audio);
      })
      .catch((err) => {
        console.error("Could not play audio:", err);
        this._audios.push(audio);
      });
  }
}

canvas.addEventListener("pointerdown", (ev) => {
  ev.preventDefault();
  const rect = canvas.getBoundingClientRect();

  pointer.absX = ev.clientX - rect.left;
  pointer.absY = ev.clientY - rect.top;
  pointer.hold = 0;

  pointer.checkDown();
});
canvas.addEventListener("pointermove", (ev) => {
  ev.preventDefault();

  const rect = ev.target.getBoundingClientRect();
  pointer.absX = ev.clientX - rect.left;
  pointer.absY = ev.clientY - rect.top;
});
canvas.addEventListener("pointerup", (ev) => {
  if (pointer.dragging) pointer.drop();

  pointer.absX = null;
  pointer.absY = null;
  pointer.hold = false;
});
canvas.addEventListener("pointerleave", (ev) => {
  if (pointer.dragging) pointer.drop();

  pointer.absX = null;
  pointer.absY = null;
  pointer.hold = false;
});

canvas.height = 800;
canvas.width = 450;
createStartScreen();
update();
