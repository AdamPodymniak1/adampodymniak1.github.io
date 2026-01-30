function renderGrid() {
  const circuitEl = document.getElementById("circuit");
  circuitEl.innerHTML = "";
  
  for(let q=0; q<nQubits; q++) {
    const wireContainer = document.createElement("div");
    wireContainer.className = "wire-container";
    wireContainer.dataset.row = q;
    
    const wireLabel = document.createElement("div");
    wireLabel.className = "wire-label";
    wireLabel.innerHTML = `|q${q}⟩`;
    wireContainer.appendChild(wireLabel);
    
    for(let c=0; c<columns; c++) {
      const column = document.createElement("div");
      column.className = "column";
      column.dataset.col = c;
      column.dataset.row = q;
      
      const wire = document.createElement("div");
      wire.className = "wire";
      column.appendChild(wire);
      
      const slot = document.createElement("div");
      slot.className = "gate-slot";
      slot.dataset.col = c;
      slot.dataset.row = q;
      
      const gateData = gridData[c][q];
      if(gateData) {
        if(gateData.type === 'control-dot') {
          slot.classList.add("control-dot");
          slot.innerHTML = '<div class="control-dot"></div>';
        } else {
          slot.textContent = gateData.gate;
          slot.classList.add("filled");
          
          if(gateData.type === 'control') {
            slot.classList.add("control-gate");
          } else if(gateData.type === 'multi') {
            slot.classList.add("multi-gate");
            if(gateData.gate === 'SWAP') {
              slot.innerHTML = '<div class="swap-cross"></div>';
            }
          } else if(gateData.gate === 'MEASURE') {
            slot.classList.add("measure-gate");
            slot.innerHTML = '<div class="measure-indicator"></div>';
          }
          
          const removeBtn = document.createElement("button");
          removeBtn.className = "remove-btn";
          removeBtn.innerHTML = "×";
          removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeGate(c, q);
          };
          slot.appendChild(removeBtn);
        }
      }
      
      slot.oncontextmenu = (e) => {
        e.preventDefault();
        if(gateData) {
          selectedGate = {col: c, row: q, data: gateData};
          showContextMenu(e.clientX, e.clientY, c, q);
        }
      };
      
      slot.onclick = (e) => {
        if(e.target !== slot && !e.target.classList.contains('remove-btn')) {
          if(gateData && ['RX', 'RY', 'RZ'].includes(gateData.gate)) {
            openAngleConfig(c, q, gateData);
          }
        }
      };
      
      slot.ondragover = (e) => {
        e.preventDefault();
        if(!gateData) {
          slot.style.borderColor = "#3cffb2";
          slot.style.background = "rgba(60, 255, 178, 0.1)";
        }
      };
      
      slot.ondragleave = () => {
        slot.style.borderColor = "";
        slot.style.background = "";
      };
      
      slot.ondrop = (e) => {
        e.preventDefault();
        slot.style.borderColor = "";
        slot.style.background = "";
        
        if(!draggedGate || gateData) return;
        
        const col = parseInt(slot.dataset.col);
        const row = parseInt(slot.dataset.row);
        
        if(['CNOT', 'CY', 'CZ'].includes(draggedGate)) {
          for(let i=0; i<nQubits; i++) {
            if(i !== row && !gridData[col][i]) {
              gridData[col][row] = {
                gate: draggedGate,
                type: 'control',
                control: i,
                target: row
              };
              gridData[col][i] = {gate: '●', type: 'control-dot'};
              break;
            }
          }
          if(!gridData[col][row]) {
            alert("Potrzebna pusta linia kubitu dla kontroli");
            return;
          }
          
        } else if(draggedGate === 'CCX') {
          const controls = [];
          for(let i=0; i<nQubits; i++) {
            if(i !== row && !gridData[col][i] && controls.length < 2) {
              controls.push(i);
              gridData[col][i] = {gate: '●', type: 'control-dot'};
            }
          }
          if(controls.length === 2) {
            gridData[col][row] = {
              gate: 'CCX',
              type: 'control',
              controls: controls,
              target: row
            };
          } else {
            for(const ctrl of controls) {
              gridData[col][ctrl] = null;
            }
            alert("Potrzebne 2 puste kubity dla kontroli");
            return;
          }
        } else if(draggedGate === 'SWAP') {
          let swapRow = -1;
          for(let i=0; i<nQubits; i++) {
            if(i !== row && !gridData[col][i]) {
              swapRow = i;
              break;
            }
          }
          if(swapRow !== -1) {
            gridData[col][row] = {gate: 'SWAP', type: 'multi', swapWith: swapRow};
            gridData[col][swapRow] = {gate: 'SWAP', type: 'multi', swapWith: row};
          } else {
            alert("Potrzebna pusta linia kubitu dla SWAP");
            return;
          }
        } else if(['RX', 'RY', 'RZ'].includes(draggedGate)) {
          gridData[col][row] = {gate: draggedGate, type: 'multi', angle: Math.PI/2};
        } else {
          gridData[col][row] = {gate: draggedGate, type: 'basic'};
        }
        
        renderGrid();
        drawControlLines();
        if(autoRunEnabled) runCircuit();
      };
      
      column.appendChild(slot);
      wireContainer.appendChild(column);
    }
    
    circuitEl.appendChild(wireContainer);
  }
  
  drawControlLines();
}

function drawControlLines() {
  document.querySelectorAll(".control-line").forEach(el => el.remove());
  
  for(let c=0; c<columns; c++) {
    for(let q=0; q<nQubits; q++) {
      const gate = gridData[c][q];
      if(gate && gate.type === 'control' && !gate.gate.startsWith('●')) {
        const columnEl = document.querySelector(`.column[data-col="${c}"][data-row="${q}"]`);
        if(columnEl) {
          const controls = gate.controls || [gate.control];
          
          for(const controlRow of controls) {
            if(controlRow !== q) {
              const controlColumn = document.querySelector(`.column[data-col="${c}"][data-row="${controlRow}"]`);
              if(controlColumn) {
                const minRow = Math.min(controlRow, q);
                const maxRow = Math.max(controlRow, q);
                const height = (maxRow - minRow) * 80;
                
                const line = document.createElement("div");
                line.className = "control-line";
                line.style.height = `${height}px`;
                line.style.top = controlRow < q ? "50%" : `${50 - (height/80)*100}%`;
                line.style.zIndex = "5";
                controlColumn.appendChild(line);
              }
            }
          }
        }
      }
    }
  }
}

function removeGate(col, row) {
  const gate = gridData[col][row];
  if(!gate) return;
  
  if(gate.type === 'control') {
    if(gate.controls) {
      for(const ctrl of gate.controls) {
        if(gridData[col][ctrl] && gridData[col][ctrl].gate === '●') {
          gridData[col][ctrl] = null;
        }
      }
    } else if(gate.control !== undefined && gridData[col][gate.control] && gridData[col][gate.control].gate === '●') {
      gridData[col][gate.control] = null;
    }
  } else if(gate.type === 'multi' && gate.gate === 'SWAP' && gate.swapWith !== undefined) {
    if(gridData[col][gate.swapWith] && gridData[col][gate.swapWith].gate === 'SWAP') {
      gridData[col][gate.swapWith] = null;
    }
  }
  
  gridData[col][row] = null;
  renderGrid();
  if(autoRunEnabled) runCircuit();
}

function drawBlochSphere(q, alpha, beta) {
  const canvas = document.getElementById(`bloch${q}`);
  const info = document.getElementById(`blochInfo${q}`);
  if(!canvas || !info) return;
  
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const radius = Math.min(width, height) * 0.35;
  const centerX = width / 2;
  const centerY = height / 2;
  
  ctx.clearRect(0, 0, width, height);
  
  const prob0 = abs2(alpha);
  const prob1 = abs2(beta);
  
  const normAlpha = norm(alpha);
  const normBeta = norm(beta);
  
  drawBlochSphereOutline(ctx, centerX, centerY, radius);
  
  let x = 0, y = 0, z = 0;
  let theta = 0, phi = 0;
  
  if (normAlpha > 0 || normBeta > 0) {
    const totalNorm = Math.sqrt(prob0 + prob1);
    if (totalNorm > 0) {
      const normalizedAlpha = normAlpha / totalNorm;
      theta = 2 * Math.acos(Math.max(-1, Math.min(1, normalizedAlpha)));
      phi = phase(beta) - phase(alpha);
      
      x = Math.sin(theta) * Math.cos(phi);
      y = Math.sin(theta) * Math.sin(phi);
      z = Math.cos(theta);
    }
  } else {
    z = 1;
  }
  
  const sphereX = centerX + radius * x;
  const sphereY = centerY - radius * z;
  
  ctx.strokeStyle = "#3cffb2";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(sphereX, sphereY);
  ctx.stroke();
  
  ctx.fillStyle = "#3cffb2";
  ctx.beginPath();
  ctx.arc(sphereX, sphereY, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#3cffb2";
  ctx.font = "12px Arial";
  ctx.fillText("|0⟩", centerX - 5, centerY - radius - 10);
  ctx.fillText("|1⟩", centerX - 5, centerY + radius + 15);
  ctx.fillText("|+⟩", centerX + radius + 5, centerY - 5);
  ctx.fillText("|-⟩", centerX - radius - 10, centerY - 5);
  
  info.innerHTML = `
    θ = ${theta.toFixed(3)} rad<br>
    φ = ${phi.toFixed(3)} rad<br>
    |0⟩: ${(prob0*100).toFixed(1)}%<br>
    |1⟩: ${(prob1*100).toFixed(1)}%
  `;
}

function drawBlochSphereOutline(ctx, centerX, centerY, radius) {
  ctx.strokeStyle = "#4a4a6a";
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius * 0.5, radius, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI);
  ctx.stroke();
}

function drawBlochSphereVector(q, x, y, z) {
  const canvas = document.getElementById(`bloch${q}`);
  const info = document.getElementById(`blochInfo${q}`);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const r = canvas.width * 0.35;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBlochSphereOutline(ctx, cx, cy, r);

  const px = cx + r * x;
  const py = cy - r * z;

  ctx.strokeStyle = "#3cffb2";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, py);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#3cffb2";
  ctx.fill();

  info.innerHTML = `
    x = ${x.toFixed(3)}<br>
    y = ${y.toFixed(3)}<br>
    z = ${z.toFixed(3)}
  `;
}

function openAngleConfig(col, row, gateData) {
  selectedGate = {col, row, data: gateData};
  const config = document.getElementById("gateConfig");
  const content = document.getElementById("configContent");
  
  let html = `<label>Kąt θ (radiany):</label>
              <input type="number" id="angleInput" value="${gateData.angle || Math.PI/2}" step="0.1" min="0" max="${2*Math.PI}">
              <br><br>
              <label>Wielokrotności π:</label>
              <select id="piMultiples" onchange="document.getElementById('angleInput').value=this.value*Math.PI">
                <option value="0.125">π/8</option>
                <option value="0.25">π/4</option>
                <option value="0.5" selected>π/2</option>
                <option value="1">π</option>
                <option value="2">2π</option>
              </select>`;
  
  content.innerHTML = html;
  config.style.display = 'block';
  config.style.left = (col * 100 + 100) + 'px';
  config.style.top = (row * 80 + 100) + 'px';
}

function saveGateConfig() {
  if(!selectedGate) return;
  
  const config = document.getElementById("gateConfig");
  const {col, row, data} = selectedGate;
  
  if(['RX', 'RY', 'RZ'].includes(data.gate)) {
    const angle = parseFloat(document.getElementById("angleInput").value);
    if(!isNaN(angle)) {
      gridData[col][row].angle = angle;
    }
  }
  
  config.style.display = 'none';
  renderGrid();
  if(autoRunEnabled) runCircuit();
}

function showContextMenu(x, y, col, row) {
  const menu = document.getElementById("contextMenu");
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';
  contextMenu = {col, row};
}

function editGate() {
  const {col, row} = contextMenu;
  const gateData = gridData[col][row];
  if(!gateData) return;
  
  hideContextMenu();
  
  if(['RX', 'RY', 'RZ'].includes(gateData.gate)) {
    openAngleConfig(col, row, gateData);
  }
}

function removeSelectedGate() {
  const {col, row} = contextMenu;
  removeGate(col, row);
  hideContextMenu();
}

function hideContextMenu() {
  document.getElementById("contextMenu").style.display = 'none';
}

document.addEventListener("click", hideContextMenu);
document.addEventListener("contextmenu", hideContextMenu);

document.querySelectorAll(".gate").forEach(g => {
  g.ondragstart = e => {
    draggedGate = g.dataset.gate;
    e.dataTransfer.setData("text/plain", g.dataset.gate);
    g.style.opacity = "0.5";
  };
  g.ondragend = e => g.style.opacity = "1";
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("autoRun").checked = true;
  autoRunEnabled = true;
  initGrid();
});

document.addEventListener("dragover", e => e.preventDefault());
document.addEventListener("drop", e => e.preventDefault());