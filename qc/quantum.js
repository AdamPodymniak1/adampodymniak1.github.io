const C = (re, im=0) => ({re, im});
const add = (a,b) => C(a.re+b.re, a.im+b.im);
const mul = (a,b) => C(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re);
const smul = (s, a) => C(s*a.re, s*a.im);
const abs2 = a => a.re*a.re + a.im*a.im;
const norm = a => Math.sqrt(abs2(a));
const conj = a => C(a.re, -a.im);
const phase = a => Math.atan2(a.im, a.re);

const GATES = {
  H: [[C(1/Math.SQRT2), C(1/Math.SQRT2)], [C(1/Math.SQRT2), C(-1/Math.SQRT2)]],
  X: [[C(0), C(1)], [C(1), C(0)]],
  Y: [[C(0), C(0,-1)], [C(0,1), C(0)]],
  Z: [[C(1), C(0)], [C(0), C(-1)]],
  S: [[C(1), C(0)], [C(0), C(0,1)]],
  T: [[C(1), C(0)], [C(0), C(Math.cos(Math.PI/4), Math.sin(Math.PI/4))]],
  RX: (θ) => [[C(Math.cos(θ/2)), C(0,-Math.sin(θ/2))], [C(0,-Math.sin(θ/2)), C(Math.cos(θ/2))]],
  RY: (θ) => [[C(Math.cos(θ/2)), C(-Math.sin(θ/2))], [C(Math.sin(θ/2)), C(Math.cos(θ/2))]],
  RZ: (θ) => [[C(Math.cos(-θ/2), Math.sin(-θ/2)), C(0)], [C(0), C(Math.cos(θ/2), Math.sin(θ/2))]]
};

class QuantumCircuit {
  constructor(n) {
    this.n = n;
    this.dim = 1 << n;
    this.state = Array(this.dim).fill(C(0));
    this.state[0] = C(1);
  }

  applyGate(gate, target, params=null) {
    let gateMatrix;
    if(typeof gate === 'function') {
      gateMatrix = gate(params);
    } else {
      gateMatrix = gate;
    }
    
    const ns = Array(this.dim).fill(C(0));
    for(let i=0; i<this.dim; i++) {
      const bit = (i >> target) & 1;
      for(let b=0; b<2; b++) {
        const j = (i & ~(1 << target)) | (b << target);
        ns[i] = add(ns[i], mul(gateMatrix[bit][b], this.state[j]));
      }
    }
    this.state = ns;
  }

  applyControlledGate(gate, controls, target, params=null) {
    const ns = Array(this.dim).fill(C(0));
    for(let i=0; i<this.dim; i++) {
      let allControls = true;
      for(const c of controls) {
        if(((i >> c) & 1) === 0) {
          allControls = false;
          break;
        }
      }
      
      if(allControls) {
        const bit = (i >> target) & 1;
        const base = i & ~(1 << target);
        for(let b=0; b<2; b++) {
          const j = base | (b << target);
          let gateMatrix;
          if(typeof gate === 'function') {
            gateMatrix = gate(params);
          } else {
            gateMatrix = gate;
          }
          for(let b2=0; b2<2; b2++) {
            const k = base | (b2 << target);
            ns[j] = add(ns[j], mul(gateMatrix[bit][b2], this.state[k]));
          }
        }
      } else {
        ns[i] = this.state[i];
      }
    }
    this.state = ns;
  }

  applySWAP(q1, q2) {
    const ns = [...this.state];
    for(let i=0; i<this.dim; i++) {
      const bit1 = (i >> q1) & 1;
      const bit2 = (i >> q2) & 1;
      if(bit1 !== bit2) {
        const j = i ^ (1 << q1) ^ (1 << q2);
        ns[j] = this.state[i];
      }
    }
    this.state = ns;
  }

  getQubitState(qubit, value) {
    let sum0 = C(0);
    let sum1 = C(0);
    
    for(let i=0; i<this.dim; i++) {
      const bit = (i >> qubit) & 1;
      if(bit === 0) {
        sum0 = add(sum0, this.state[i]);
      } else {
        sum1 = add(sum1, this.state[i]);
      }
    }
    
    const norm0 = norm(sum0);
    const norm1 = norm(sum1);
    const totalNorm = Math.sqrt(norm0*norm0 + norm1*norm1);
    
    if(totalNorm > 0) {
      sum0 = smul(1/totalNorm, sum0);
      sum1 = smul(1/totalNorm, sum1);
    }
    
    return value === 0 ? sum0 : sum1;
  }

  measure(shots=1024) {
    const probs = this.state.map(abs2);
    const out = {};
    for(let s=0; s<shots; s++) {
      let r = Math.random(), a = 0;
      for(let i=0; i<probs.length; i++) {
        a += probs[i];
        if(r < a) {
          const b = i.toString(2).padStart(this.n, "0");
          out[b] = (out[b] || 0) + 1;
          break;
        }
      }
    }
    return out;
  }

  getStateVector() {
    return this.state.map((c,i) => {
      const prob = abs2(c);
      const phaseVal = phase(c);
      return {
        state: i.toString(2).padStart(this.n, "0"),
        amplitude: c,
        probability: prob,
        phase: phaseVal
      };
    });
  }
}