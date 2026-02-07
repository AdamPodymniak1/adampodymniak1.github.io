const lifeCanvas = document.getElementById("life");
const lifeCtx = lifeCanvas.getContext("2d");
const playBtn = document.getElementById("playPauseLife");
const resetBtn = document.getElementById("resetLife");
const speedSlider = document.getElementById("lifeSpeed");

const COLS = 60;
const ROWS = 60;
let grid = Array.from({ length: COLS }, () => new Uint8Array(ROWS));

let isPlaying = false; 
playBtn.textContent = "Start";

let cellSize = 1;

function resizeLife() {
  const r = lifeCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  lifeCanvas.width = r.width * dpr;
  lifeCanvas.height = r.height * dpr;
  lifeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cellSize = r.width / COLS;
}

window.addEventListener("resize", resizeLife);
resizeLife();

function getNextGen() {
  let next = grid.map(arr => new Uint8Array(arr));
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      let neighbors = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) continue;
          const x = (col + i + COLS) % COLS;
          const y = (row + j + ROWS) % ROWS;
          neighbors += grid[x][y];
        }
      }

      if (grid[col][row] === 1 && (neighbors < 2 || neighbors > 3)) {
        next[col][row] = 0;
      } else if (grid[col][row] === 0 && neighbors === 3) {
        next[col][row] = 1;
      }
    }
  }
  grid = next;
}

function renderLife() {
  lifeCtx.fillStyle = "#000";
  lifeCtx.fillRect(0, 0, lifeCanvas.width, lifeCanvas.height);
  
  lifeCtx.fillStyle = "#fff";
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (grid[col][row]) {
        lifeCtx.fillRect(col * cellSize, row * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
}

let drawing = false;
let paintMode = 1;

function interact(e) {
  if (!drawing) return;
  const r = lifeCanvas.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
  const x = Math.floor((clientX - r.left) / r.width * COLS);
  const y = Math.floor((clientY - r.top) / r.height * ROWS);
  
  if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
    grid[x][y] = paintMode;
  }
}

lifeCanvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  const r = lifeCanvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / r.width * COLS);
  const y = Math.floor((e.clientY - r.top) / r.height * ROWS);
  
  if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
    paintMode = grid[x][y] === 1 ? 0 : 1;
    grid[x][y] = paintMode;
  }
});

window.addEventListener("pointerup", () => drawing = false);
lifeCanvas.addEventListener("pointermove", interact);

playBtn.onclick = () => {
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? "Stop" : "Start";
};

resetBtn.onclick = () => {
  grid = Array.from({ length: COLS }, () => new Uint8Array(ROWS));
  isPlaying = false;
  playBtn.textContent = "Start";
};

let lastTime = 0;
function loopLife(timestamp) {
  const speed = parseInt(speedSlider.value);
  const threshold = 1000 / speed;
  
  if (isPlaying && timestamp - lastTime > threshold) {
    getNextGen();
    lastTime = timestamp;
  }
  renderLife();
  requestAnimationFrame(loopLife);
}

requestAnimationFrame(loopLife);