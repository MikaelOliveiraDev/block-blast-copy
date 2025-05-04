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
      if (layer)
        for (let item of layer)
          callback(item);
  },
  clear() {
    for (let index = 0; index < this.layers.length; index++)
      if(this.layers[index])
        this.layers[index] = []
  }
};

const pointer = {
  x: null,
  y: null,
  hold: 0,
  dragging: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  update: function () {
    if (this.hold) this.hold++;

    if (this.dragging) {
      this.dragging.x = this.x + this.dragOffsetX;
      this.dragging.y = this.y + this.dragOffsetY;
    }
  },
  checkDown: function() {
    LayerManager.forEach((item) => {
      if(item.isPointInside && item.isPointInside(pointer.x, pointer.y) && item.onPointerDown)
        item.onPointerDown(pointer)
    })
  },
  drag: function (item) {
    this.dragging = item;
    this.dragging.isBeingDragged = true;

    if (item instanceof Piece) {
      pointer.dragOffsetX = -(item.width / 2);
      pointer.dragOffsetY = -item.height - board.blockWidth;
    }
  },
  drop: function () {
    if (pointer.dragging.onDrop) pointer.dragging.onDrop();
    pointer.dragging.isBeingDragged = false;
    pointer.dragging = null;
  },
};

canvas.height = 800;
canvas.width = 450;
createStartScreen();
update();

function loadScript(url, callback) {
  const script = document.createElement("script")
  script.type = "text/javascript"
  script.src = url
  script.onload = callback
  document.head.appendChild(script)
}

function createStartScreen() {
  // Start button
  
  const border = 8;
  const hue = 45;
  const saturation = 100;
  const startButton = {
    width: 160,
    height: 60,
    get x() {
      return canvas.width / 2 - this.width / 2;
    },
    get y() {
      return canvas.height / 2 - this.height / 2;
    },
    zIndex: LayerManager.ZINDEX.UI,
    draw(ctx) {
      const { x, y, width, height } = this;

      // The square
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, 55%)`;
      ctx.fillRect(x, y, width, height);

      // Left border
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, 62%)`;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x, y);
      ctx.lineTo(x + border, y + border);
      ctx.lineTo(x + border, y + height - border);
      ctx.lineTo(x, y + height);
      ctx.fill();
      ctx.closePath();

      // Top border
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, 74%)`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width - border, y + border);
      ctx.lineTo(x + border, y + border);
      ctx.lineTo(x, y);
      ctx.fill();
      ctx.closePath();

      // Right border
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, 48%)`;
      ctx.beginPath();
      ctx.moveTo(x + width, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width - border, y + height - border);
      ctx.lineTo(x + width - border, y + border);
      ctx.lineTo(x + width, y);
      ctx.fill();
      ctx.closePath();

      // Bottom border
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, 45%)`;
      ctx.beginPath();
      ctx.moveTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + border, y + height - border);
      ctx.lineTo(x + width - border, y + height - border);
      ctx.lineTo(x + width, y + height);
      ctx.fill();
      ctx.closePath();

      // Text
      ctx.textBaseline = "middle";
      ctx.font = "bold italic 20px Verdana";
      ctx.fillStyle = "#664d00";
      ctx.textAlign = "center";
      ctx.fillText("START", x + width / 2, y + height / 2);
    },
    isPointInside(x, y) {
      return (
        x >= this.x &&
        x <= this.x + this.width &&
        y >= this.y &&
        y <= this.y + this.height
      );
    },
    onPointerDown(pointer) {
      createGameScreen()
    }
  }; 

  // Game Title
  const text = "Block Blast";
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  const gameTitle = {};
  gradient.addColorStop(0.2, "white");
  gradient.addColorStop(0.9, "gold");
  gameTitle.zIndex = LayerManager.ZINDEX.UI;
  gameTitle.draw = (ctx) => {
    ctx.fillStyle = gradient;
    ctx.font = "bold italic 50px Verdana";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 50);
  };

  LayerManager.add(startButton);
  LayerManager.add(gameTitle);
}
function createGameScreen() {
  // Clear layers
  LayerManager.clear()
  
  loadScript("./game/board.js", () => {
    board.canvas = canvas
    board.zIndex = LayerManager.ZINDEX.BACKGROUND
    LayerManager.add(board)

    loadScript("./game/tray.js", () => {
      tray.canvas = canvas
      tray.zIndex = LayerManager.ZINDEX.BACKGROUND
      LayerManager.add(tray)

      loadScript("./game/block.js", () => {
        loadScript("./game/piece.js", startGame)
      })
    })
  })
}
function startGame() {
  board.init()
  tray.init(board)

  showNewPiece()
  showNewPiece()

}
function showNewPiece() {
  let spaces = tray.spaces;

  // Try to find an empty space in the blocks tray
  for (let space of spaces) {
    if (space.content) continue;

    // Config the piece
    let piece = new Piece(board);
    space.content = piece;
    tray.centralizeContent(space);
    piece.updateBlocksPosition();
    piece.zIndex = LayerManager.ZINDEX.PIECES;

    LayerManager.add(piece);
    break;
  }
}

function update(now) {
  pointer.update(now)

  LayerManager.forEach((item) => {
    if (item.update)
      item.update(now);
  })
  
  render();
  requestAnimationFrame(update);
}
function render() {
  ctx.fillStyle = "#4f6875";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  LayerManager.forEach((item) => {
    if(item.draw)
      item.draw(ctx)
  })
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
    this.url = url

    this._audios = []
    this._playing = []

    for (let i = 0; i < clones; i++) {
      const audio = new Audio(url)
      this._audios.push(audio)
    }
  }
  play() {
    if (this._audios.length === 0)
      return console.warn("No clones avaliable")

    const audio = this._audios.pop()

    audio.addEventListener("ended", (ev) => {
      let index = this._playing.indexOf(ev.target)
      if(index != -1)
        this._playing.splice(index, 1)
      this._audios.push(ev.target)
    }, { once: true})

    audio.play()
    .then(() => {
      this._playing.push(audio)
    }).catch(err => {
      console.error("Could not play audio:", err)
      this._audios.push(audio)
    })
  }
}


canvas.addEventListener("pointerdown", (ev) => {
  ev.preventDefault()
  const rect = canvas.getBoundingClientRect()
  
  pointer.x = ev.clientX - rect.left;
  pointer.y = ev.clientY - rect.top;
  pointer.hold = 0

  pointer.checkDown()
})
canvas.addEventListener("pointermove", (ev) => {
  ev.preventDefault()

  const rect = ev.target.getBoundingClientRect()
  pointer.x = ev.clientX - rect.left;
  pointer.y = ev.clientY - rect.top;
})
canvas.addEventListener("pointerup", (ev) => {
  pointer.x = null;
  pointer.y = null
  pointer.hold = false
  
  if(pointer.dragging) pointer.drop()
})
canvas.addEventListener("pointerleave", (ev) => {
  pointer.x = null;
  pointer.y = null
  pointer.hold = false
  
  if(pointer.dragging) pointer.drop()
})