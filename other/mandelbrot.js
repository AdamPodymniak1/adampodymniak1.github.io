(() => {
  const canvas = document.getElementById("mandelbrot");
  const gl = canvas.getContext("webgl2");
  if (!gl) return;

  let width = 0;
  let height = 0;

  let centerX = -0.5;
  let centerY = 0.0;
  let scale = 3.0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = Math.floor(r.width * dpr);
    height = Math.floor(r.height * dpr);
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    render();
  }

  window.addEventListener("resize", resize);

  const vs = `#version 300 es
  precision highp float;
  in vec2 pos;
  out vec2 vUV;
  void main() {
    vUV = pos * 0.5 + 0.5;
    gl_Position = vec4(pos, 0.0, 1.0);
  }`;

  const fs = `#version 300 es
  precision highp float;
  in vec2 vUV;
  out vec4 fragColor;

  uniform vec2 uCenter;
  uniform float uScale;
  uniform float uAspect;

  void main() {
      vec2 c;
      c.x = uCenter.x + (vUV.x - 0.5) * uScale * uAspect;
      c.y = uCenter.y + (vUV.y - 0.5) * uScale;

      vec2 z = vec2(0.0);
      int i;
      const int MAX_ITER = 500;

      for(i = 0; i < MAX_ITER; i++){
          if(dot(z,z) > 4.0) break;
          z = vec2(
              z.x*z.x - z.y*z.y,
              2.0*z.x*z.y
          ) + c;
      }

      float color = 0.0;
      if(i < MAX_ITER){
          // smooth escape for edges
          float log_zn = log(dot(z,z))/2.0;
          float nu = log(log_zn / log(2.0)) / log(2.0);
          color = clamp((float(i) + 1.0 - nu)/float(MAX_ITER), 0.0, 1.0);
      }
      fragColor = vec4(vec3(color), 1.0);
  }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  gl.useProgram(program);

  const quad = new Float32Array([
    -1,-1,  1,-1, -1, 1,
    -1, 1,  1,-1,  1, 1
  ]);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, "pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uCenter = gl.getUniformLocation(program, "uCenter");
  const uScale = gl.getUniformLocation(program, "uScale");
  const uAspect = gl.getUniformLocation(program, "uAspect");

  function render() {
    gl.uniform2f(uCenter, centerX, centerY);
    gl.uniform1f(uScale, scale);
    gl.uniform1f(uAspect, width / height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  let dragging = false;
  let lx = 0, ly = 0;

  canvas.addEventListener("pointerdown", e => {
    dragging = true;
    lx = e.clientX;
    ly = e.clientY;
  });

  canvas.addEventListener("pointerup", () => dragging = false);
  canvas.addEventListener("pointerleave", () => dragging = false);

  canvas.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lx;
    const dy = e.clientY - ly;
    centerX -= dx / canvas.clientWidth * scale * (width / height);
    centerY += dy / canvas.clientHeight * scale;
    lx = e.clientX;
    ly = e.clientY;
    render();
  });

  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    scale *= e.deltaY > 0 ? 1.1 : 0.9;
    render();
  }, { passive: false });

  let lastTouchDist = 0;

  canvas.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.hypot(dx, dy);
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = lastTouchDist / dist;
      scale *= factor;
      lastTouchDist = dist;

      const midX = (e.touches[0].clientX + e.touches[1].clientX)/2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY)/2;

      render();
    }
  }, { passive: false });

  canvas.addEventListener("touchend", e => {
    if (e.touches.length < 2) lastTouchDist = 0;
  });

  const resetButton = document.getElementById("resetMandelbrot");
  resetButton.addEventListener("click", () => {
    centerX = -0.5;
    centerY = 0.0;
    scale = 3.0;
    render();
  });

  resize();
})();