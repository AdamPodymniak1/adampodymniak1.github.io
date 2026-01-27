const FIXED_TEXT="ADAM PODYMNIAK";

(()=>{
const canvas=document.getElementById("c");
const ctx=canvas.getContext("2d",{alpha:true});
const off=document.createElement("canvas");
const offCtx=off.getContext("2d");

let DPR=1;
let particles=[],targets=[];
let mouse={x:-9999,y:-9999,down:false};
let lastWidth = null;
let canvasHeight = window.innerHeight;

const config={
  sample:6,
  particleSize:2.4,
  spring:0.12,
  friction:0.82,
  backgroundClearAlpha:0.12,
  textFontBase:"900",
  textFamily:"Inter, system-ui",
  maxParticles:2400
};

function resize(){
  const w = innerWidth;
  const h = canvasHeight;

  const firstRun = lastWidth === null;
  const widthChanged = firstRun || w !== lastWidth;
  lastWidth = w;

  DPR = Math.max(1, devicePixelRatio || 1);

  canvas.width = w * DPR;
  canvas.height = h * DPR;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  off.width = w * 0.9 * DPR;
  off.height = h * 0.38 * DPR;

  const density = Math.max(1,900/w);
  config.maxParticles = Math.floor(2400*density);

  if (widthChanged) {
    regenerateParticles(FIXED_TEXT);
    createWaveGraphics();
  }
}


function sampleTextPoints(text){
  const w=off.width,h=off.height;
  offCtx.clearRect(0,0,w,h);
  let fontSize=Math.floor(h*0.9);
  offCtx.textBaseline="middle";
  offCtx.textAlign="center";
  offCtx.fillStyle="#fff";
  offCtx.font=`${config.textFontBase} ${fontSize}px ${config.textFamily}`;
  while(fontSize>10 && offCtx.measureText(text).width>w*0.95){
    fontSize*=0.94;
    offCtx.font=`${config.textFontBase} ${fontSize}px ${config.textFamily}`;
  }
  offCtx.fillText(text,w/2,h/2);
  const img=offCtx.getImageData(0,0,w,h).data;
  const pts=[];
  for(let y=0;y<h;y+=config.sample){
    for(let x=0;x<w;x+=config.sample){
      if(img[(y*w+x)*4+3]>128){
        pts.push({
          x:(innerWidth-(w/DPR))/2+(x/DPR),
          y: particleBaseY() + (y / DPR)
        });
      }
    }
  }
  return pts;
}

function particleBaseY() {
  if (innerWidth < 480) return innerHeight * 0.12;
  if (innerWidth < 768) return innerHeight * 0.14;
  return innerHeight * 0.18;
}

function regenerateParticles(text){
  targets=sampleTextPoints(text);
  if(targets.length>config.maxParticles){
    const step=Math.ceil(targets.length/config.maxParticles);
    targets=targets.filter((_,i)=>i%step===0);
  }
  particles=[];
  const cx = innerWidth / 2, cy = particleBaseY();
  for(const t of targets){
    particles.push({
      x:cx,y:cy,vx:0,vy:0,
      tx:t.x,ty:t.y,
      size:config.particleSize,
      delay:Math.random()*600,
      start:performance.now(),
      maxDist:Math.hypot(cx-t.x,cy-t.y)
    });
  }
}

let last=performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(34,now-last);
  last=now;
  ctx.fillStyle=`rgba(7,12,24,${config.backgroundClearAlpha})`;
  ctx.fillRect(0,0,innerWidth,innerHeight);

  const rr=110,rr2=rr*rr;
  for(const p of particles){
    if(now-p.start<p.delay){
      draw(p.x,p.y,p.size*0.6,"rgba(255,255,255,0.15)");
      continue;
    }
    p.vx+=(p.tx-p.x)*config.spring*(dt/16.67);
    p.vy+=(p.ty-p.y)*config.spring*(dt/16.67);
    const dx=p.x-mouse.x,dy=p.y-mouse.y;
    const d2=dx*dx+dy*dy;
    if(d2<rr2){
      const f=(rr2-d2)/rr2;
      const d=Math.sqrt(d2)+0.01;
      p.vx+=(dx/d)*f*90*(dt/16.67);
      p.vy+=(dy/d)*f*90*(dt/16.67);
    }
    p.vx*=Math.pow(config.friction,dt/16.67);
    p.vy*=Math.pow(config.friction,dt/16.67);
    p.x+=p.vx*(dt/16.67);
    p.y+=p.vy*(dt/16.67);
    const t=Math.min(1,Math.hypot(p.x-p.tx,p.y-p.ty)/p.maxDist);
    draw(p.x,p.y,p.size,`rgb(255,${255*(1-t)},${255*(1-t)})`);
  }
}

function draw(x,y,r,c){
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=c;
  ctx.fill();
}

function pointer(e){
  const r=canvas.getBoundingClientRect();
  const p=e.touches?e.touches[0]:e;
  mouse.x=p.clientX-r.left;
  mouse.y=p.clientY-r.top;
}

canvas.addEventListener("pointerdown",e=>{mouse.down=true;pointer(e);});
canvas.addEventListener("pointermove",pointer);
window.addEventListener("pointerup",()=>{mouse.down=false;mouse.x=-9999;mouse.y=-9999;});

function createWaveGraphics(){
  const c=document.getElementById("wave");
  c.innerHTML="";
  const wc=document.createElement("canvas");
  const dpr=Math.max(1,devicePixelRatio||1);
  wc.width=innerWidth*dpr;
  wc.height=110*dpr;
  wc.style.width="100%";
  wc.style.height="110px";
  c.appendChild(wc);
  const wctx=wc.getContext("2d");
  wctx.setTransform(dpr,0,0,dpr,0,0);
  let t=0;
  function drawWave(){
    t+=0.01;
    wctx.clearRect(0,0,wc.width,wc.height);
    for(let i=0;i<260;i++){
      const n=i/260;
      const x=n*innerWidth;
      const env=Math.exp(-((n-0.5)**2)/0.09);
      const r=env*Math.cos(18*n*10-t*3)*34;
      const im=env*Math.sin(22*n*10-t*3)*34;
      wctx.fillStyle="rgba(0,255,255,0.65)";
      wctx.beginPath();wctx.arc(x,55+r,2,0,7);wctx.fill();
      wctx.fillStyle="rgba(255,0,255,0.65)";
      wctx.beginPath();wctx.arc(x,55+im,2,0,7);wctx.fill();
    }
    requestAnimationFrame(drawWave);
  }
  drawWave();
}

resize();
animate(performance.now());
window.addEventListener("resize",resize);
})();