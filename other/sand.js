(() => {
  const canvas = document.getElementById("sand");
  const ctx = canvas.getContext("2d");

  const W = 140;
  const H = 140;

  const grid = [];
  for (let i = 0; i < W * H; i++) {
    grid.push({ type: 0, water: 0 });
  }

  let material = 1;
  document.getElementById("material").onchange = e => {
    material = +e.target.value;
  };

  document.getElementById("resetSand").onclick = () => {
    for (let i = 0; i < W*H; i++) {
      grid[i].type = 0;
      grid[i].water = 0;
    }
  };

  function idx(x, y) {
    return x + y * W;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener("resize", resize);
  resize();

  function step() {
    const waterUpdates = [];
    
    for (let y = H - 1; y >= 0; y--) {
      for (let x = 0; x < W; x++) {
        const i = idx(x, y);
        const cell = grid[i];
        if (cell.type === 0) continue;
        if (cell.type === 3) continue;

        if (cell.type === 1) {
          const belowY = y + 1;
          if (belowY < H) {
            const below = grid[idx(x, belowY)];
            if (below.type === 0 || (below.type === 2 && below.water > 0)) {
              [grid[i], grid[idx(x, belowY)]] = [below, cell];
              continue;
            }
          }
          
          const dirs = [-1, 1].sort(() => Math.random()-0.5);
          for (let d of dirs) {
            const nx = x + d;
            const ny = y + 1;
            if (nx >= 0 && nx < W && ny < H) {
              const diag = grid[idx(nx, ny)];
              if (diag.type === 0 || (diag.type === 2 && diag.water > 0)) {
                [grid[i], grid[idx(nx, ny)]] = [diag, cell];
                break;
              }
            }
          }
          continue;
        }

        if (cell.type === 2 && cell.water > 0) {
          waterUpdates.push({x, y, i, water: cell.water});
        }
      }
    }

    for (const update of waterUpdates) {
      const {x, y, i} = update;
      const cell = grid[i];
      if (cell.type !== 2 || cell.water <= 0) continue;

      let moved = false;
      
      const belowY = y + 1;
      if (belowY < H) {
        const belowIdx = idx(x, belowY);
        const below = grid[belowIdx];
        if (below.type === 0) {
          const move = Math.min(cell.water, 1);
          below.type = 2;
          below.water = move;
          cell.water -= move;
          moved = true;
        } else if (below.type === 2 && below.water < 1) {
          const space = 1 - below.water;
          const move = Math.min(cell.water, space);
          below.water += move;
          cell.water -= move;
          moved = true;
        }
      }

      if (!moved && cell.water > 0) {
        const sides = [-1, 1].sort(() => Math.random()-0.5);
        for (let dx of sides) {
          const nx = x + dx;
          if (nx < 0 || nx >= W) continue;
          const nidx = idx(nx, y);
          const ncell = grid[nidx];
          if (ncell.type === 0) {
            const move = Math.min(cell.water, 1);
            ncell.type = 2;
            ncell.water = move;
            cell.water -= move;
            break;
          } else if (ncell.type === 2 && ncell.water < 1) {
            const space = 1 - ncell.water;
            const move = Math.min(cell.water, space);
            ncell.water += move;
            cell.water -= move;
            break;
          }
        }
      }

      if (cell.water <= 0) {
        cell.type = 0;
        cell.water = 0;
      }
    }
  }

  function render() {
    const cw = canvas.clientWidth / W;
    const ch = canvas.clientHeight / H;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let y=0;y<H;y++){
      for (let x=0;x<W;x++){
        const cell = grid[idx(x,y)];
        if (cell.type === 0) continue;
        if (cell.type === 1) ctx.fillStyle = "#f2d16b";
        else if (cell.type === 2) {
          const blue = Math.floor(50 + 205*cell.water);
          ctx.fillStyle = `rgb(0,0,${blue})`;
        } else if (cell.type === 3) ctx.fillStyle = "#888";
        ctx.fillRect(x*cw, y*ch, cw, ch);
      }
    }
  }

  let painting = false;
  canvas.style.touchAction = "none";

  canvas.addEventListener("pointerdown", e=>{painting=true; paint(e);});
  canvas.addEventListener("pointerup", ()=>painting=false);
  canvas.addEventListener("pointerleave", ()=>painting=false);
  canvas.addEventListener("pointermove", e=>{if(painting) paint(e);});

  function paint(e){
    const r = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left)/r.width*W);
    const y = Math.floor((e.clientY - r.top)/r.height*H);
    if(x<0||y<0||x>=W||y>=H) return;

    for(let dx=-1;dx<=1;dx++){
      for(let dy=-1;dy<=1;dy++){
        const nx=x+dx;
        const ny=y+dy;
        if(nx>=0 && nx<W && ny>=0 && ny<H){
          const c = grid[idx(nx, ny)];
          if(material === 1){ c.type = 1; c.water = 0; }
          else if(material === 2){ c.type = 2; c.water = 1; }
          else if(material === 3){ c.type = 3; c.water = 0; }
          else if(material === 4){ c.type = 0; c.water = 0; }
        }
      }
    }
  }

  function loop(){
    step();
    render();
    requestAnimationFrame(loop);
  }
  loop();
})();