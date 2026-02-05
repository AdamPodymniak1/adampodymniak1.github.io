const boidsCanvas = document.getElementById("boids");
const boidsCtx = boidsCanvas.getContext("2d");

let DPR = window.devicePixelRatio || 1;
let W = 0, H = 0;

function resize() {
  const r = boidsCanvas.getBoundingClientRect();
  W = r.width;
  H = r.height;
  boidsCanvas.width = W * DPR;
  boidsCanvas.height = H * DPR;
  boidsCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

let BOID_COUNT = 120;
const MAX_SPEED = 2.2;
const MAX_FORCE = 0.05;

const SEP_DIST = 20;
const ALI_DIST = 50;
const COH_DIST = 60;

const SEP_WEIGHT = 1.4;
const ALI_WEIGHT = 1.0;
const COH_WEIGHT = 0.9;

const rand = (a, b) => Math.random() * (b - a) + a;

function limit(vx, vy, max) {
  const m = Math.hypot(vx, vy);
  if (m > max) {
    vx = (vx / m) * max;
    vy = (vy / m) * max;
  }
  return [vx, vy];
}

function resetBoids() {
  boids.length = 0;

  const maxBoids = Math.min(BOID_COUNT, 400);

  for (let i = 0; i < maxBoids; i++) {
    boids.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
    });
  }
}

const boids = [];
resetBoids();

const resetBtn = document.getElementById("resetBoids");
if (resetBtn) {
  resetBtn.onclick = resetBoids;
}

let pointer = { x: 0, y: 0, active: false };

boidsCanvas.addEventListener("pointerdown", e => {
  pointer.active = true;
  pointer.x = e.offsetX;
  pointer.y = e.offsetY;
});

boidsCanvas.addEventListener("pointermove", e => {
  if (!pointer.active) return;
  pointer.x = e.offsetX;
  pointer.y = e.offsetY;
});

boidsCanvas.addEventListener("pointerup", () => pointer.active = false);
boidsCanvas.addEventListener("pointerleave", () => pointer.active = false);

const countSlider = document.getElementById("boidsCount");
if (countSlider) {
  countSlider.addEventListener("input", () => {
    BOID_COUNT = +countSlider.value;
    resetBoids();
  });
}

function step() {
  for (let b of boids) {
    let sepX = 0, sepY = 0, sepC = 0;
    let aliX = 0, aliY = 0, aliC = 0;
    let cohX = 0, cohY = 0, cohC = 0;

    for (let o of boids) {
      if (o === b) continue;
      let dx = o.x - b.x;
      let dy = o.y - b.y;
      let d = Math.hypot(dx, dy);

      if (d < SEP_DIST && d > 0) {
        sepX -= dx / d;
        sepY -= dy / d;
        sepC++;
      }

      if (d < ALI_DIST) {
        aliX += o.vx;
        aliY += o.vy;
        aliC++;
      }

      if (d < COH_DIST) {
        cohX += o.x;
        cohY += o.y;
        cohC++;
      }
    }

    let fx = 0, fy = 0;

    if (sepC) {
      fx += (sepX / sepC) * SEP_WEIGHT;
      fy += (sepY / sepC) * SEP_WEIGHT;
    }

    if (aliC) {
      fx += ((aliX / aliC) - b.vx) * ALI_WEIGHT;
      fy += ((aliY / aliC) - b.vy) * ALI_WEIGHT;
    }

    if (cohC) {
      fx += ((cohX / cohC) - b.x) * 0.002 * COH_WEIGHT;
      fy += ((cohY / cohC) - b.y) * 0.002 * COH_WEIGHT;
    }

    if (pointer.active) {
      const dx = pointer.x - b.x;
      const dy = pointer.y - b.y;
      const d = Math.hypot(dx, dy) + 0.001;
      fx += (dx / d) * 0.05;
      fy += (dy / d) * 0.05;
    }

    [fx, fy] = limit(fx, fy, MAX_FORCE);

    b.vx += fx;
    b.vy += fy;
    [b.vx, b.vy] = limit(b.vx, b.vy, MAX_SPEED);

    b.x += b.vx;
    b.y += b.vy;

    if (b.x < 0) b.x += W;
    if (b.y < 0) b.y += H;
    if (b.x > W) b.x -= W;
    if (b.y > H) b.y -= H;
  }
}

function render() {
  boidsCtx.clearRect(0, 0, W, H);

  boidsCtx.fillStyle = "#fff";
  for (let b of boids) {
    const a = Math.atan2(b.vy, b.vx);
    boidsCtx.save();
    boidsCtx.translate(b.x, b.y);
    boidsCtx.rotate(a);
    boidsCtx.beginPath();
    boidsCtx.moveTo(6, 0);
    boidsCtx.lineTo(-4, 3);
    boidsCtx.lineTo(-4, -3);
    boidsCtx.closePath();
    boidsCtx.fill();
    boidsCtx.restore();
  }
}

(function loop() {
  step();
  render();
  requestAnimationFrame(loop);
})();
