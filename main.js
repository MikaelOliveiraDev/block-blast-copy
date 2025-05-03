const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const ZINDEX = {
  BACKGROUND: 0,
  BOARD_ITEMS: 1,
  PIECES: 2,
  UI: 3,
};
const layers = [];
function addToLayer(item) {
  let zIndex = item.zIndex;

  if (!layers[zIndex]) layers[zIndex] = [];

  layers[zIndex].push(item);
}
function removeFromLayer(item) {
  let zIndex = item.zIndex;
  let layer = layers[zIndex];
  if (!layer) {
    console.log(`Camada ${zIndex} não existe!`);
    return;
  }
  for (let i = 0; i < layer.length; i++) {
    if (layer[i] === item) {
      layer.splice(i, 1);
      return;
    }
  }
}
function changeLayer(item, zIndex) {
  removeFromLayer(item);
  item.zIndex = zIndex;
  addToLayer(item);
}
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
  drag: function (item) {
    pointer.dragging = item;
    pointer.dragging.isBeingDragged = true;

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
setTimeout(createGameScreen, 500)
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
  const width = 160;
  const height = 60;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;
  const border = 8;
  const hue = 45;
  const saturation = 100;
  const startButton = {
    zIndex: ZINDEX.UI,
    draw: (ctx) => {
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
      ctx.fillText("START", x + width / 2, y + height / 2);
    },
  };

  // Game Title
  const text = "Block Blast";
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  const gameTitle = {};
  gradient.addColorStop(0.2, "white");
  gradient.addColorStop(0.9, "gold");
  gameTitle.zIndex = ZINDEX.UI;
  gameTitle.draw = (ctx) => {
    ctx.fillStyle = gradient;
    ctx.font = "bold italic 50px Verdana";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 50);
  };

  addToLayer(startButton);
  addToLayer(gameTitle);
}
function createGameScreen() {
  // Clear layers
  for (let index = 0; index < layers.length; index++)
    if(layers[index])
      layers[index] = []
  
  loadScript("./game/board.js", () => {
    board.canvas = canvas
    board.init()
    board.zIndex = ZINDEX.BACKGROUND
    addToLayer(board)

    loadScript("./game/tray.js", () => {
      tray.canvas = canvas
      tray.init(board)
      tray.zIndex = ZINDEX.BACKGROUND
      addToLayer(tray)

      loadScript("./game/block.js", () => {
        loadScript("./game/piece.js")
      })
    })
  })
}

function update(now) {
  for (let layer = 0; layer < layers.length; layer++)
    for (let i = 0; i < layers[layer]?.length; i++)
      if (layers[layer][i].update) layers[layer][i].update();
  
  render();
  requestAnimationFrame(update);
}
function render() {
  ctx.fillStyle = "#4f6875";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let layer = 0; layer < layers.length; layer++)
    for (let i = 0; i < layers[layer]?.length; i++)
      if (layers[layer][i].draw) layers[layer][i].draw(ctx);
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

canvas.addEventListener("click", (ev) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = ev.clientX - rect.left;
  const mouseY = ev.clientY - rect.top;
  const width = 160;
  const height = 60;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  if (
    mouseX >= x &&
    mouseX <= x + width &&
    mouseY >= y &&
    mouseY <= y + height
  ) {
    createGameScreen()
  }
});
