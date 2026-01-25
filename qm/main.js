const h = 6.62607015e-34;
const hbar = h / (2 * Math.PI);
const c = 299792458;
const eV = 1.602176634e-19;
const me = 9.10938356e-31;

document.querySelectorAll('#menu button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#menu button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const panel = btn.dataset.panel;
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(panel).classList.add('active');
    });
});

function drawPlot(canvas, xs, ys, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.strokeStyle = '#7be3ff';
    ctx.lineWidth = 1.5;
    const w = canvas.clientWidth,
        h = canvas.clientHeight;
    const xmin = Math.min(...xs),
        xmax = Math.max(...xs);
    const ymin = Math.min(...ys),
        ymax = Math.max(...ys);

    function mx(x) {
        return (x - xmin) / (xmax - xmin) * w
    }

    function my(y) {
        return h - (y - ymin) / (ymax - ymin) * h
    }
    ctx.beginPath();
    for (let i = 0; i < xs.length; i++) {
        const x = mx(xs[i]),
            y = my(ys[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function drawBar(canvas, labels, vals) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const w = canvas.clientWidth,
        h = canvas.clientHeight;
    const maxv = Math.max(...vals);
    const barw = w / (vals.length * 1.5);
    ctx.fillStyle = '#0ff';
    for (let i = 0; i < vals.length; i++) {
        const bw = barw;
        const x = (i * 1.5 + 0.25) * barw;
        const bh = (vals[i] / maxv) * (h * 0.85);
        ctx.fillRect(x, h - bh, bw, bh);
        ctx.fillStyle = '#9fdbe7';
        ctx.font = '12px sans-serif';
        ctx.fillText(labels[i], x, h - 2);
        ctx.fillStyle = '#0ff';
    }
}

function computeEnergy() {
    const val = parseFloat(document.getElementById('wl_input').value);
    const unit = document.getElementById('wl_unit').value;
    let lambda = val;
    if (unit === 'nm') lambda *= 1e-9;
    else if (unit === 'um') lambda *= 1e-6;
    const E_J = h * c / lambda;
    const E_eV = E_J / eV;
    const out = document.getElementById('wl_output');
    out.innerHTML = `<div>Energia = ${E_J.toExponential(4)} J = ${E_eV.toFixed(4)} eV</div>`;
    drawColorBar(document.getElementById('wl_canvas'), lambda);
}

function drawColorBar(canvas, lambda) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.clientWidth,
        h = canvas.clientHeight;
    const imgData = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
        const t = x / w;
        const wl = 380 + t * (780 - 380);
        const rgb = wavelengthToRGB(wl);
        for (let y = 0; y < h; y++) {
            const idx = (y * w + x) * 4;
            imgData.data[idx] = rgb[0];
            imgData.data[idx + 1] = rgb[1];
            imgData.data[idx + 2] = rgb[2];
            imgData.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);
    if (lambda) {
        const wl_nm = lambda * 1e9;
        if (wl_nm < 380 || wl_nm > 780) return;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        const x = (wl_nm - 380) / (780 - 380) * w;
        ctx.fillRect(x - 1, 0, 2, h);
    }
}

function wavelengthToRGB(wavelength) {
    let r = 0,
        g = 0,
        b = 0;
    const wl = wavelength;
    if (wl >= 380 && wl < 440) {
        r = -(wl - 440) / (440 - 380);
        g = 0;
        b = 1;
    } else if (wl >= 440 && wl < 490) {
        r = 0;
        g = (wl - 440) / (490 - 440);
        b = 1;
    } else if (wl >= 490 && wl < 510) {
        r = 0;
        g = 1;
        b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
        r = (wl - 510) / (580 - 510);
        g = 1;
        b = 0;
    } else if (wl >= 580 && wl < 645) {
        r = 1;
        g = -(wl - 645) / (645 - 580);
        b = 0;
    } else if (wl >= 645 && wl <= 780) {
        r = 1;
        g = 0;
        b = 0;
    }
    r = Math.round(clamp(r, 0, 1) * 255);
    g = Math.round(clamp(g, 0, 1) * 255);
    b = Math.round(clamp(b, 0, 1) * 255);
    return [r, g, b];
}

function clamp(x, a, b) {
    return Math.max(a, Math.min(b, x));
}

const spectralDB = [{
        atom: 'H',
        name: 'Lyman α',
        wl_nm: 121.5679
    },
    {
        atom: 'H',
        name: 'Balmer α (Hα)',
        wl_nm: 656.281
    },
    {
        atom: 'H',
        name: 'Balmer β (Hβ)',
        wl_nm: 486.133
    },
    {
        atom: 'H',
        name: 'Balmer γ (Hγ)',
        wl_nm: 434.047
    },
    {
        atom: 'He',
        name: 'He I',
        wl_nm: 587.562
    },
    {
        atom: 'He',
        name: 'He I',
        wl_nm: 667.815
    },
    {
        atom: 'Na',
        name: 'Na D1',
        wl_nm: 589.592
    },
    {
        atom: 'Na',
        name: 'Na D2',
        wl_nm: 588.995
    }
];

function renderSpecDB() {
    document.getElementById('spec_db').textContent = spectralDB.map(s => `${s.atom} - ${s.name}: ${s.wl_nm} nm`).join(
        '\n');
}
renderSpecDB();

function lookupLine() {
    const wl = parseFloat(document.getElementById('spec_wl').value);
    const tol = parseFloat(document.getElementById('spec_tol').value);
    const matches = spectralDB.map(s => ({
        ...s,
        diff: Math.abs(s.wl_nm - wl)
    })).filter(s => s.diff <= tol).sort((a, b) => a.diff - b.diff);
    const out = document.getElementById('spec_out');
    if (matches.length === 0) {
        const closest = spectralDB.map(s => ({
            ...s,
            diff: Math.abs(s.wl_nm - wl)
        })).sort((a, b) => a.diff - b.diff)[0];
        out.innerHTML =
            `Brak w przedziale ${tol} nm. Najbliższy: ${closest.atom} ${closest.name} at ${closest.wl_nm} nm (Δ=${closest.diff.toFixed(3)} nm)`;
    } else {
        out.innerHTML = '<strong>Dopasowania:</strong><br>' + matches.map(m =>
            `${m.atom} ${m.name} — ${m.wl_nm} nm (Δ=${m.diff.toFixed(3)} nm)`).join('<br>');
    }
}

function computeUncertainty() {
    const dx = parseFloat(document.getElementById('dx').value);
    const m = parseFloat(document.getElementById('mass').value) || me;
    const dp = hbar / (2 * dx);
    const dv = dp / m;
    document.getElementById('unc_out').innerHTML =
        `Δp ≥ ${dp.toExponential(4)} kg·m/s<br>Δv ≥ ${dv.toExponential(4)} m/s`;
}

function runQRNG() {
    const p = parseFloat(document.getElementById('p1').value);
    const N = parseInt(document.getElementById('ntrials').value);
    let c0 = 0,
        c1 = 0;
    for (let i = 0; i < N; i++) {
        if (Math.random() < p) c1++;
        else c0++;
    }
    document.getElementById('q_out').innerHTML = `0: ${c0}  -  1: ${c1}`;
    drawBar(document.getElementById('q_canvas'), ['0', '1'], [c0, c1]);
}

function plotBox() {
    const Lnm = parseFloat(document.getElementById('box_L').value);
    const L = Lnm * 1e-9;
    const n = parseInt(document.getElementById('box_n').value);
    const canvas = document.getElementById('box_canvas');
    const N = 400;
    const xs = [],
        ys = [];
    for (let i = 0; i <= N; i++) {
        const x = i / N;
        const xx = x * L;
        const psi = Math.sqrt(2 / L) * Math.sin(n * Math.PI * xx / L);
        xs.push(x * Lnm);
        ys.push(psi * psi);
    }
    drawPlot(canvas, xs, ys);
    document.getElementById('box_out').innerHTML = `Znormalizowane prawdopodobieństwo dla n=${n}, L=${Lnm} nm`;
}

function plotDoubleSlit() {
    const lambda_nm = parseFloat(document.getElementById('ds_lambda').value);
    const d_mm = parseFloat(document.getElementById('ds_d').value);
    const D = parseFloat(document.getElementById('ds_D').value);
    const lambda = lambda_nm * 1e-9;
    const d = d_mm * 1e-3;
    const canvas = document.getElementById('ds_canvas');
    const N = 800;
    const xs = [],
        ys = [];
    const screenW = 0.02;
    for (let i = 0; i < N; i++) {
        const x = -screenW / 2 + screenW * (i / (N - 1));
        const pathDiff = d * x / D;
        const phase = 2 * Math.PI * pathDiff / lambda;
        const I = Math.cos(phase / 2) ** 2;
        xs.push(x * 1000);
        ys.push(I);
    }
    drawPlot(canvas, xs, ys);
    document.getElementById('ds_out').innerHTML =
        `Wykres intensywności w poprzek ±${(screenW*1000/2).toFixed(1)} mm na ekranie`;
}

function computeTunneling() {
    const V0eV = parseFloat(document.getElementById('bar_V0').value);
    const E_eV = parseFloat(document.getElementById('bar_E').value);
    const a_nm = parseFloat(document.getElementById('bar_a').value);
    const V0 = V0eV * eV;
    const E = E_eV * eV;
    const a = a_nm * 1e-9;
    const canvas = document.getElementById('bar_canvas');
    if (E >= V0) {
        const k1 = Math.sqrt(2 * me * E) / hbar;
        const k2 = Math.sqrt(2 * me * (E - V0)) / hbar;
        const T = 4 * k1 * k2 / ((k1 + k2) ** 2) * 1;
        document.getElementById('bar_out').innerHTML = `E ≥ V0: prosta szacunkowa wartość T ≈ ${T.toExponential(3)}`;
    } else {
        const kappa = Math.sqrt(2 * me * (V0 - E)) / hbar;
        const T = Math.exp(-2 * kappa * a);
        document.getElementById('bar_out').innerHTML =
            `E < V0: prawdopodobieństwo tunnelingu (w przyb.) T ≈ exp(-2κa) = ${T.toExponential(3)}`;
    }
    const Es = [];
    const Ts = [];
    for (let i = 0; i <= 200; i++) {
        const Ee = (i / 200) * Math.max(V0 * 3, E, V0);
        Es.push(Ee / eV);
        if (Ee >= V0) {
            Ts.push(1);
        } else {
            const kap = Math.sqrt(2 * me * (V0 - Ee)) / hbar;
            Ts.push(Math.exp(-2 * kap * a));
        }
    }
    const xs = Es;
    const ys = Ts;
    drawPlot(canvas, xs, ys, {
        xLabel: 'E (eV)'
    });
}

function hermite(n, x) {
    if (n === 0) return 1;
    if (n === 1) return 2 * x;
    let Hnm2 = 1;
    let Hnm1 = 2 * x;
    let Hn;
    for (let k = 2; k <= n; k++) {
        Hn = 2 * x * Hnm1 - 2 * (k - 1) * Hnm2;
        Hnm2 = Hnm1;
        Hnm1 = Hn;
    }
    return Hn;
}

function factorial(n) {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

function plotHO() {
    const n = parseInt(document.getElementById('ho_n').value);
    const m = parseFloat(document.getElementById('ho_m').value);
    const w = parseFloat(document.getElementById('ho_w').value);
    const omega = w;
    const x0 = Math.sqrt(hbar / (m * omega));
    const canvas = document.getElementById('ho_canvas');
    const N = 400;
    const xs = [],
        ys = [];
    for (let i = 0; i <= N; i++) {
        const t = -6 + 12 * (i / N);
        const x = t * x0;
        const xi = x / x0;
        const Hn = hermite(n, xi);
        const norm = 1 / (Math.pow(2, n) * factorial(n)) ** 0.5 / Math.pow(Math.PI, 0.25) / Math.sqrt(x0);
        const psi = norm * Hn * Math.exp(-xi * xi / 2);
        xs.push(x / x0);
        ys.push(psi * psi);
    }
    drawPlot(canvas, xs, ys);
    document.getElementById('ho_out').innerHTML =
        `Wykreślono |ψ|² dla n=${n}, x skalowane przez x0=${x0.toExponential(2)} m`;
}

computeEnergy();
plotBox();
plotHO();