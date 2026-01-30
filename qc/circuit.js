let nQubits = 2;
let columns = 6;
let gridData = [];
let draggedGate = null;
let selectedGate = null;
let contextMenu = {col: -1, row: -1};
let circuit = null;
let autoRunEnabled = true;

function initGrid() {
  gridData = [];
  for(let c=0; c<columns; c++) {
    gridData[c] = Array(nQubits).fill(null);
  }
  renderGrid();
  createBlochSpheres();
  if(autoRunEnabled) runCircuit();
}

function updateQubitCount() {
  const input = document.getElementById("qubitsInput");
  const newCount = parseInt(input.value);
  if(newCount >= 1 && newCount <= 10) {
    const oldCount = nQubits;
    nQubits = newCount;
    
    for(let c=0; c<columns; c++) {
      if(nQubits > oldCount) {
        for(let i=oldCount; i<nQubits; i++) {
          gridData[c].push(null);
        }
      } else {
        gridData[c] = gridData[c].slice(0, nQubits);
      }
    }
    renderGrid();
    createBlochSpheres();
    if(autoRunEnabled) runCircuit();
  }
}

function addQubit() {
  if(nQubits < 10) {
    nQubits++;
    document.getElementById("qubitsInput").value = nQubits;
    for(let c=0; c<columns; c++) {
      gridData[c].push(null);
    }
    renderGrid();
    createBlochSpheres();
    if(autoRunEnabled) runCircuit();
  }
}

function removeQubit() {
  if(nQubits > 1) {
    nQubits--;
    document.getElementById("qubitsInput").value = nQubits;
    for(let c=0; c<columns; c++) {
      gridData[c].pop();
    }
    renderGrid();
    createBlochSpheres();
    if(autoRunEnabled) runCircuit();
  }
}

function addColumn() {
  gridData.push(Array(nQubits).fill(null));
  columns++;
  renderGrid();
  if(autoRunEnabled) runCircuit();
}

function resetCircuit() {
  nQubits = 2;
  columns = 6;
  document.getElementById("qubitsInput").value = nQubits;
  initGrid();
  document.getElementById("output").textContent = "";
  document.getElementById("stateVector").textContent = "";
  document.getElementById("probabilityBars").innerHTML = "";
  selectedGate = null;
}

function clearGates() {
  for(let c=0; c<columns; c++) {
    for(let q=0; q<nQubits; q++) {
      gridData[c][q] = null;
    }
  }
  renderGrid();
  if(autoRunEnabled) runCircuit();
}

function createBlochSpheres() {
  const container = document.getElementById("blochSpheres");
  container.innerHTML = "";
  
  for(let q=0; q<nQubits; q++) {
    const sphere = document.createElement("div");
    sphere.className = "bloch-sphere";
    
    const canvas = document.createElement("canvas");
    canvas.className = "bloch-canvas";
    canvas.width = 200;
    canvas.height = 200;
    canvas.id = `bloch${q}`;
    
    const label = document.createElement("div");
    label.className = "bloch-label";
    label.textContent = `Kubit ${q}`;
    
    const info = document.createElement("div");
    info.className = "bloch-info";
    info.id = `blochInfo${q}`;
    
    sphere.appendChild(canvas);
    sphere.appendChild(label);
    sphere.appendChild(info);
    container.appendChild(sphere);
    
    drawBlochSphere(q, C(1), C(0));
  }
}

function runCircuit() {
  const shotsInput = document.getElementById("shotsInput");
  const shots = parseInt(shotsInput.value) || 1024;
  autoRunEnabled = document.getElementById("autoRun").checked;
  
  circuit = new QuantumCircuit(nQubits);
  
  for(let c=0; c<columns; c++) {
    for(let q=0; q<nQubits; q++) {
      const gateData = gridData[c][q];
      if(!gateData) continue;
      
      if(gateData.type === 'control-dot') continue;
      
      if(gateData.gate === 'CNOT') {
        circuit.applyControlledGate(GATES.X, [gateData.control], gateData.target);
      } else if(gateData.gate === 'CY') {
        circuit.applyControlledGate(GATES.Y, [gateData.control], gateData.target);
      } else if(gateData.gate === 'CZ') {
        circuit.applyControlledGate(GATES.Z, [gateData.control], gateData.target);
      } else if(gateData.gate === 'CCX') {
        circuit.applyControlledGate(GATES.X, gateData.controls, gateData.target);
      } else if(gateData.gate === 'SWAP') {
        circuit.applySWAP(q, gateData.swapWith);
      } else if(gateData.gate === 'RX') {
        circuit.applyGate(GATES.RX(gateData.angle || Math.PI/2), q);
      } else if(gateData.gate === 'RY') {
        circuit.applyGate(GATES.RY(gateData.angle || Math.PI/2), q);
      } else if(gateData.gate === 'RZ') {
        circuit.applyGate(GATES.RZ(gateData.angle || Math.PI/2), q);
      } else if(gateData.gate === 'MEASURE') {
       
      } else if(GATES[gateData.gate]) {
        circuit.applyGate(GATES[gateData.gate], q);
      }
    }
  }
  
  const measurements = circuit.measure(shots);
  const stateVector = circuit.getStateVector();
  
  let output = `Całkowita liczba pomiarów: ${shots}\n\n`;
  let totalShots = 0;
  Object.entries(measurements)
    .sort((a,b) => b[1] - a[1])
    .forEach(([state, count]) => {
      output += `${state}: ${count} (${(count/shots*100).toFixed(1)}%)\n`;
      totalShots += count;
    });
  
  document.getElementById("output").textContent = output;
  
  let stateText = "";
  stateVector.forEach(s => {
    if(s.probability > 0.0001) {
      const amplitude = s.amplitude;
      const prob = s.probability;
      const phaseVal = s.phase;
      stateText += `|${s.state}⟩: ${amplitude.re.toFixed(3)}${amplitude.im >= 0 ? '+' : ''}${amplitude.im.toFixed(3)}i\n`;
      stateText += `  Prawdopodobieństwo: ${(prob*100).toFixed(2)}%, Faza: ${phaseVal.toFixed(3)} rad\n\n`;
    }
  });
  document.getElementById("stateVector").textContent = stateText;
  
  const bars = document.getElementById("probabilityBars");
  bars.innerHTML = "";
  
  const sortedStates = stateVector
    .filter(s => s.probability > 0.0001)
    .sort((a,b) => parseInt(a.state,2) - parseInt(b.state,2));
  
  sortedStates.forEach(s => {
    const bar = document.createElement("div");
    bar.className = "prob-bar";
    bar.style.height = `${s.probability * 100}%`;
    bar.title = `|${s.state}⟩: ${(s.probability*100).toFixed(1)}%`;
    
    const label = document.createElement("div");
    label.className = "prob-label";
    label.textContent = `|${s.state}⟩`;
    
    bar.appendChild(label);
    bars.appendChild(bar);
  });
  
  for(let q=0; q<nQubits; q++) {
    const { x, y, z } = circuit.getBlochVector(q);
    drawBlochSphereVector(q, x, y, z);
  }
}

function exportCircuit() {
  const data = {
    nQubits: nQubits,
    columns: columns,
    gridData: gridData,
    version: "2.0"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "obwod_kwantowy.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importCircuit() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        nQubits = data.nQubits;
        columns = data.columns;
        gridData = data.gridData;
        document.getElementById("qubitsInput").value = nQubits;
        renderGrid();
        createBlochSpheres();
        runCircuit();
      } catch(err) {
        alert("Błąd podczas wczytywania pliku obwodu");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}