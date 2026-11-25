const FOTOS = {
    cururu: 'img/cururu.jpg',
    misterioso: 'img/misterioso.jpg',
    girassol: 'img/girassol.jpg',
    fada: 'img/fada.jpg'
};

const $ = id => document.getElementById(id);
const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
let W = 120, SC = 3;
const H0 = 84, PAD = 30, GOAL = 10, TIME = 20, GAP = 4;
let H = H0;
const cv = $('cv'), c = cv.getContext('2d');
cv.width = W;
cv.height = H;
const CAMX = () => Math.round(W * .58);

function fit() {
    const cw = $('stage').getBoundingClientRect().width;
    if (cw < 50)
        return;
    const wide = innerWidth >= 760;
    const mx = wide ? Math.floor((innerHeight - 4) / H0) : Math.floor(innerHeight * .36 / H0);
    const s = Math.max(2, Math.min(Math.round(cw / 130), mx)), w = Math.floor(cw / s);
    const h = wide ? Math.max(H0, Math.floor((innerHeight - 4) / s)) : H0;
    if (cv.style.width === w * s + 'px' && cv.style.height === h * s + 'px' && cv.width === w)
        return;
    SC = s;
    W = w;
    H = h;
    cv.width = W;
    cv.height = H;
    cv.style.width = W * s + 'px';
    cv.style.height = H * s + 'px';
}

const R = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), w, h);
};

const FG = ["..ooo.ooo..", ".oGkGoGkGo.", ".oGGGGGGGo.", "oGpGGGGGpGo", "oGGGyyyGGGo", "oGGyyyyyGGo", ".oGyyyyyGo.", "oGGoo.ooGGo"];
const PX = { o: '#0d3b1a', G: '#7bd635', y: '#f5e86a', k: '#111', p: '#ff6b6b' }, SZ = 20, SPR = {};
const SK = [
    { id: 'bugapo', n: 'SAPO PIXEL', p: 0 },
    { id: 'curupu', n: 'SAPO CURURU', p: 30, img: FOTOS.cururu },
    { id: 'saponoia', n: 'SAPO MISTERIOSO', p: 60, img: FOTOS.misterioso },
    { id: 'girassapo', n: 'SAPO GIRASSOL', p: 100, img: FOTOS.girassol },
    { id: 'fasapo', n: 'SAPO FADA', p: 150, img: FOTOS.fada }
];

SK.forEach(s => {
    if (!s.img)
        return;
    const im = new Image();
    im.onload = () => {
        const o = document.createElement('canvas');
        o.width = o.height = SZ;
        const x = o.getContext('2d');
        x.imageSmoothingQuality = 'high';
        x.fillStyle = '#0d3b1a';
        x.beginPath();
        x.arc(10, 10, 10, 0, 7);
        x.fill();
        x.beginPath();
        x.arc(10, 10, 8.5, 0, 7);
        x.clip();
        x.drawImage(im, 1.5, 1.5, 17, 17);
        SPR[s.id] = o;
    };
    im.src = s.img;
});
const cur_skin = () => SK.find(s => s.id === D.sel) || SK[0];

function thumb(s, w) {
    return s.img ? '<img src="' + s.img + '" width="' + w + '" height="' + w + '" alt="' + s.n + '" style="border:3px solid #0d3b1a;border-radius:10px;object-fit:cover">'
        : '<svg viewBox="0 0 11 8" width="' + w + '" shape-rendering="crispEdges">' + FG.map((row, y) => [...row].map((ch, x) => PX[ch] ? '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + PX[ch] + '"/>' : '').join('')).join('') + '</svg>';
}

function fdim() {
    const s = cur_skin();
    return s.img && SPR[s.id] ? [SZ, SZ] : [11, 8];
}

function drawFrog(x, y) {
    const s = cur_skin();
    if (s.img && SPR[s.id])
        c.drawImage(SPR[s.id], Math.round(x), Math.round(y));
    else
        FG.forEach((row, j) => [...row].forEach((ch, i) => {
            if (PX[ch])
                R(x + i, y + j, 1, 1, PX[ch]);
        }));
}

const BONUS = 50, CASTLE = 25;
let D = { coins: 0, owned: ['pixel'], sel: 'pixel', castles: 0, mute: false };
try {
    const s = JSON.parse(localStorage.getItem('sm2') || 'null');
    if (s && Array.isArray(s.owned))
        D = Object.assign(D, s);
}

catch (e) { }

function save() {
    try {
        localStorage.setItem('sm2', JSON.stringify(D));
    }
    catch (e) { }
}

let t = 0,
    last = 0,
    cam = 0,
    P = 0,
    GP = -GAP,
    f = 0,
    g = -GAP,
    hop = null,
    jy = 0,
    eatT = -1,
    view = 'title',
    G = null,
    cur = null,
    mode = 'mix';
let FX = [], boom = 0, sh = 0, flash = 0, dip = 0;

function resetScene() {
    boom = 0;
    FX = [];
    f = 0;
    g = -GAP;
    P = 0;
    GP = -GAP;
    hop = null;
    jy = 0;
    eatT = -1;
    cam = 20 - CAMX();
}

function cloud(x, y) {
    R(x, y + 2, 22, 5, '#fff');
    R(x + 4, y, 12, 3, '#fff');
    R(x + 14, y + 1, 8, 3, '#fff');
    R(x, y + 6, 22, 1, '#d5dcec');
}

function gator(open) {
    const hx = 20 + GP * PAD - cam + 6, x = hx - 25, y = 60 + Math.sin(t * 2) * 1;
    for (let i = 0; i < 5; i++)
        R(x + 2 + i * 3, y - 1, 2, 1, '#1f5a2a');
    R(x, y, 16, 4, '#2f7a3a');
    R(x, y + 3, 16, 1, '#245f2e');
    R(x - 6, y + 1, 6, 2, '#2f7a3a');
    R(x - 9, y + 2, 3, 1, '#2f7a3a');
    R(x + 16, y - open, 9, 2, '#2f7a3a');
    R(x + 16, y + 2 + open, 9, 2, '#4f9a4a');
    for (let i = 0; i < 4; i++) {
        R(x + 17 + i * 2, y + 2 - open, 1, 1, '#fff');
        R(x + 18 + i * 2, y + 1 + open, 1, 1, '#fff');
    }
    R(x + 14, y - 2, 3, 2, '#ffe14a');
    R(x + 15, y - 2, 1, 1, '#111');
    c.fillStyle = 'rgba(36,128,192,.55)';
    c.fillRect(Math.round(x - 9), Math.round(y + 2), 36, 5);
}

function draw() {
    ['#4db8ff', '#5cc1ff', '#6ccaff', '#7dd3ff'].forEach((col, i) => R(0, i * 10, W, 10, col));
    {
        const sx = W - 24, sy = 10;
        for (let dy = -6; dy <= 6; dy++) {
            const w = Math.round(Math.sqrt(36 - dy * dy));
            R(sx - w, sy + dy, 2 * w, 1, Math.abs(dy) < 4 ? '#ffe14a' : '#fff3a0');
        }
    }
    for (let i = 0; i < 3; i++)
        cloud((((i * 58 - cam * .1 + t * 3) % (W + 50)) + W + 50) % (W + 50) - 25, 5 + i * 8);
    for (let x = 0; x < W; x++) {
        const m = (x + cam * .15), h = 14 + 8 * Math.abs(Math.sin(m / 14)) + 4 * Math.sin(m / 5);
        R(x, 40 - h, 1, h, '#8fb0dc');
        if (h > 20)
            R(x, 40 - h, 1, 2, '#fff');
        const k = (x + cam * .35), h2 = 8 + 5 * Math.sin(k / 9) + 3 * Math.sin(k / 3.7);
        R(x, 48 - h2, 1, h2 + 2, '#3a9a48');
        R(x, 48 - h2, 1, 2, '#6cc24a');
        R(x, 46, 1, 4, '#2b7a38');
    }
    for (let i = 0; i < 26; i++) {
        const bx = (((i * 17 - cam * .9) % (W + 30)) + W + 30) % (W + 30) - 10, h = 10 + (i * 5) % 7;
        R(bx, 50 - h, 1, h + 2, '#e0b93a');
        R(bx + 1, 50 - h + 3, 1, h - 1, '#8a6f1a');
        R(bx, 50 - h - 1, 1, 2, '#6a9a2a');
    }
    {
        const dx = ((t * 12) % (W + 30)) - 15, dy = 34 + Math.sin(t * 3) * 4;
        R(dx, dy, 4, 1, '#ff6b6b');
        R(dx + 1, dy - 1, 2, 1, 'rgba(255,255,255,.8)');
        R(dx + 1, dy + 1, 2, 1, 'rgba(255,255,255,.8)');
    }
    ['#2f9fe0', '#2a8ed0', '#2480c0', '#1f72b0'].forEach((col, i) => R(0, 50 + i * 9, W, 9, col));
    R(0, 86, W, Math.max(0, H - 86), '#1f72b0');
    for (let k = 0; k < 14; k++) {
        const rx = (((k * 29 + t * 6 * (k % 2 ? 1 : -1) - cam * .9) % W) + W) % W;
        R(rx, 54 + (k * 7) % (H - 56), 5, 1, 'rgba(255,255,255,.35)');
    }
    const bx = 20 + GOAL * PAD - cam;
    R(bx - 12, 60, 70, H - 60, '#3c9a3a');
    R(bx - 12, 60, 70, 2, '#7bd635');
    R(bx - 12, 76, 70, H - 76, '#7a5230');
    const q = bx + 10;
    R(q, 40, 22, 20, '#d8cfc0');
    R(q - 4, 34, 7, 26, '#cfc6b4');
    R(q + 19, 34, 7, 26, '#cfc6b4');
    R(q - 5, 30, 9, 4, '#c0392b');
    R(q + 18, 30, 9, 4, '#c0392b');
    R(q + 8, 52, 6, 8, '#5a3a22');
    R(q + 10, 28, 1, 12, '#333');
    R(q + 11, 28, 5, 3, '#e74c3c');
    for (let i = 0; i < GOAL; i++) {
        const x = 20 + i * PAD - cam, y = 64 + Math.sin(t * 2 + i) * .7 + (i === f ? dip * 2 : 0);
        for (let dy = -2; dy <= 2; dy++) {
            const w = Math.round(12 * Math.sqrt(1 - (dy / 3) ** 2));
            R(x - w, y + dy, 2 * w, 1, dy < 0 ? '#3fae4a' : '#2e8a3c');
        }
        R(x - 12, y, 24, 1, '#1f6b2b');
        if (i % 3 === 1) {
            R(x + 3, y - 3, 3, 2, '#ff8ab8');
            R(x + 4, y - 4, 1, 1, '#ff5c9a');
        }
    }
    const open = eatT >= 0 ? (eatT < .55 ? 3 : 0) : (P - GP < 1.5 ? 2 : 0), gulp = eatT > .5, fx = 20 + P * PAD - cam - fdim()[0] / 2, fy = 63 - fdim()[1] + jy + (hop || eatT >= 0 ? 0 : Math.sin(t * 3) * .5);
    if (eatT >= 0) {
        if (!gulp)
            drawFrog(fx, fy);
        gator(open);
        if (gulp && !boom)
            explode(fx + fdim()[0] / 2, fy + fdim()[1] / 2);
    }
    else {
        gator(open);
        drawFrog(fx, fy);
    }
    drawFx();
}

let AC = null;

function snd(k) {
    if (D.mute)
        return;
    try {
        AC = AC || new (window.AudioContext || window.webkitAudioContext)();
        if (AC.state === 'suspended')
            AC.resume();
        const tone = (f, d, w, v, t0, f2) => {
            const o = AC.createOscillator(), g = AC.createGain(), s = AC.currentTime + (t0 || 0);
            o.type = w || 'square';
            o.frequency.setValueAtTime(f, s);
            if (f2)
                o.frequency.exponentialRampToValueAtTime(f2, s + d);
            g.gain.setValueAtTime(v || .06, s);
            g.gain.exponentialRampToValueAtTime(.001, s + d);
            o.connect(g);
            g.connect(AC.destination);
            o.start(s);
            o.stop(s + d);
        };
        if (k === 'hop')
            tone(300, .18, 'square', .05, 0, 700);
        else if (k === 'ok') {
            tone(660, .1);
            tone(880, .16, 'square', .06, .1);
        }
        else if (k === 'bad')
            tone(220, .35, 'sawtooth', .07, 0, 90);
        else if (k === 'tick')
            tone(900, .04, 'square', .03);
        else if (k === 'coin') {
            tone(988, .08);
            tone(1319, .2, 'square', .05, .08);
        }
        else if (k === 'win')
            [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, 'square', .06, i * .12));
        else if (k === 'boom') {
            const b = AC.createBuffer(1, AC.sampleRate * .6, AC.sampleRate), d = b.getChannelData(0);
            for (let i = 0; i < d.length; i++)
                d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
            const n = AC.createBufferSource(), g = AC.createGain();
            n.buffer = b;
            g.gain.value = .25;
            n.connect(g);
            g.connect(AC.destination);
            n.start();
            tone(90, .5, 'sine', .2, 0, 30);
        }
    }
    catch (e) { }
}

function splash(x, y, n) {
    for (let i = 0; i < (n || 12); i++)
        FX.push({ x: x + r(-6, 6), y, vx: r(-25, 25), vy: -r(30, 70), l: .5 + Math.random() * .3, col: i % 2 ? '#fff' : '#bfe9ff', s: 1 });
}

function explode(x, y) {
    snd('boom');
    boom = 1;
    sh = .5;
    flash = .12;
    const cols = ['#fff', '#ffd54a', '#ff8a2b', '#ff4d3a', '#7bd635'];
    for (let i = 0; i < 70; i++) {
        const a = Math.random() * 6.283, v = 20 + Math.random() * 80;
        FX.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, l: .6 + Math.random() * .7, col: cols[r(0, 4)], s: r(1, 2) });
    }
    FX.push({ ring: 1, x, y, rad: 2, l: .5 });
}

function drawFx() {
    FX.forEach(p => {
        if (p.ring) {
            c.strokeStyle = 'rgba(255,230,120,' + p.l * 2 + ')';
            c.lineWidth = 2;
            c.beginPath();
            c.arc(p.x, p.y, p.rad, 0, 7);
            c.stroke();
        }
        else
            R(p.x, p.y, p.s, p.s, p.col);
    });
    if (flash > 0) {
        c.fillStyle = 'rgba(255,255,255,.8)';
        c.fillRect(0, 0, W, H);
    }
}

function loop(ts) {
    const dt = Math.min(.05, (ts - last) / 1000 || 0);
    last = ts;
    t += dt;
    if (hop) {
        hop.t += dt / .45;
        const e = Math.min(1, hop.t);
        P = hop.a + (hop.b - hop.a) * e;
        jy = -Math.sin(Math.PI * e) * 14;
        if (e >= 1) {
            hop = null;
            jy = 0;
            dip = 1;
            splash(CAMX(), 62);
            if (f >= GOAL)
                snd('win');
        }
    }
    GP += ((eatT >= 0 ? f : g) - GP) * Math.min(1, dt * 2.5);
    cam += ((20 + P * PAD - CAMX()) - cam) * Math.min(1, dt * 4);
    if (eatT >= 0) {
        eatT += dt;
        if (eatT > 2.1) {
            eatT = -2;
            end(false);
        }
    }
    FX.forEach(p => {
        p.l -= dt;
        if (p.ring)
            p.rad += dt * 90;
        else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 160 * dt;
        }
    });
    FX = FX.filter(p => p.l > 0);
    flash -= dt;
    dip = Math.max(0, dip - dt * 4);
    c.save();
    if (sh > 0) {
        sh -= dt;
        c.translate(r(-2, 2), r(-2, 2));
    }
    draw();
    c.restore();
    requestAnimationFrame(loop);
}

function gen(op, l) {
    let a, b, ans;
    if (op === '+') {
        const m = [9, 30, 99, 250, 600][l - 1];
        a = r(1, m);
        b = r(1, m);
        ans = a + b;
    }
    else if (op === '-') {
        const m = [9, 30, 99, 250, 600][l - 1];
        a = r(2, m);
        b = r(1, a);
        ans = a - b;
    }
    else if (op === '*') {
        if (l === 1) {
            a = [2, 5, 10][r(0, 2)];
            b = r(1, 10);
        }
        else {
            a = r(2, [0, 5, 9, 12, 15][l - 1]);
            b = r(2, l > 3 ? 12 : 10);
        }
        ans = a * b;
    }
    else {
        b = l === 1 ? [2, 5, 10][r(0, 2)] : r(2, [0, 5, 9, 12, 12][l - 1]);
        const x = r(l === 1 ? 1 : 2, [10, 10, 10, 12, 15][l - 1]);
        a = b * x;
        ans = x;
    }
    const sp = Math.max(3, Math.round(ans * .2)), set = new Set([ans]);
    while (set.size < 3) {
        const v = ans + r(-sp, sp);
        if (v >= 0)
            set.add(v);
    }
    return { op, a, b, ans, opts: [...set].sort(() => Math.random() - .5) };
}

const why = q => {
    const s = q.a + ' ' + SYM[q.op] + ' ' + q.b + ' = ' + q.ans;
    return q.op === '/' ? s + ' (pois ' + q.b + ' × ' + q.ans + ' = ' + q.a + ')' : s;
};

function show(v) {
    view = v;
    ['title', 'game', 'end', 'shop'].forEach(s => $(s).hidden = s !== v);
    $('stage').hidden = v === 'shop';
    $('ttl').hidden = v !== 'title';
    if (v !== 'game' && G)
        clearInterval(G.iv);
    if (v === 'title') {
        resetScene();
        home();
    }
}

function home() {
    $('tCoins').textContent = '🪙 ' + D.coins;
    $('tWins').textContent = '🏰 ' + D.castles;
    $('ops').innerHTML = '';
    [['mix', 'MIX'], ['+', '+'], ['-', '−'], ['*', '×'], ['/', '÷']].forEach(([k, s]) => {
        const b = document.createElement('button');
        b.className = 'btn pill' + (mode === k ? ' on' : '');
        b.textContent = s;
        b.onclick = () => {
            mode = k;
            home();
        };
        $('ops').appendChild(b);
    });
}

function hud() {
    $('gCoins').textContent = '🪙 ' + D.coins;
    $('prog').textContent = 'PULO ' + f + '/' + GOAL;
    const n = f - g, e = $('gap');
    e.textContent = '🐊 a ' + n + (n === 1 ? ' pulo' : ' pulos');
    e.className = 'tag' + (n <= 2 ? ' danger' : '');
}

function startGame() {
    resetScene();
    G = { earned: 0, miss: 0, bonus: 0, locked: false, t: TIME, iv: 0 };
    show('game');
    nextQ();
}

function nextQ() {
    const op = mode === 'mix' ? ['+', '-', '*', '/'][r(0, 3)] : mode, lvl = Math.min(5, Math.floor(f / 2) + 1);
    cur = gen(op, lvl);
    G.locked = false;
    G.t = TIME;
    $('tab').textContent = 'NÍVEL ' + lvl;
    $('q').textContent = 'Quanto é ' + cur.a + ' ' + SYM[op] + ' ' + cur.b + '?';
    $('ans').innerHTML = '';
    cur.opts.forEach((v, k) => {
        const b = document.createElement('button');
        b.className = 'a';
        b.innerHTML = '<b>' + (k + 1) + '</b>' + v;
        b.onclick = () => answer(k);
        $('ans').appendChild(b);
    });
    $('fb').textContent = '';
    $('cont').hidden = true;
    hud();
    tick();
    clearInterval(G.iv);
    G.iv = setInterval(() => {
        if (G.paused)
            return;
        G.t -= .1;
        if (G.t <= 0) {
            G.t = 0;
            tick();
            answer(-1);
        }
        else
            tick();
    }, 100);
}

function tick() {
    $('bar').style.width = (G.t / TIME * 100) + '%';
    $('bar').style.background = G.t <= 5 ? 'var(--bad)' : 'var(--ok)';
    $('tnum').textContent = '⏱ ' + Math.ceil(G.t) + 's';
    if (G.t <= 5 && G.t > 0 && Math.ceil(G.t) !== G.lt) {
        G.lt = Math.ceil(G.t);
        snd('tick');
    }
}

function answer(k) {
    if (G.locked)
        return;
    G.locked = true;
    clearInterval(G.iv);
    const ok = k >= 0 && cur.opts[k] === cur.ans, bs = [...$('ans').children];
    bs.forEach((b, j) => {
        if (cur.opts[j] === cur.ans)
            b.classList.add('ok');
    });
    if (ok) {
        const gain = 3 + (G.t >= 10 ? 2 : 0);
        G.earned += gain;
        D.coins += gain;
        f++;
        hop = { a: P, b: f, t: 0 };
        snd('ok');
        snd('hop');
        $('fb').textContent = 'CERTO! +' + gain + ' MOEDAS' + (G.t >= 10 ? ' (BÔNUS DE VELOCIDADE)' : '');
        const p = document.createElement('span');
        p.className = 'pop';
        p.textContent = '+' + gain + ' 🪙';
        $('stage').appendChild(p);
        setTimeout(() => p.remove(), 1000);
        hud();
        if (f >= GOAL) {
            D.castles++;
            if (!G.miss) {
                G.bonus = BONUS;
                G.earned += BONUS;
                D.coins += BONUS;
            }
            save();
            setTimeout(() => end(true), 1300);
        }
        else {
            save();
            setTimeout(nextQ, 1100);
        }
    }
    else {
        if (k >= 0)
            bs[k].classList.add('bad');
        g++;
        G.miss++;
        snd('bad');
        splash(20 + GP * PAD - cam + 6, 62, 10);
        const s = $('stage');
        s.classList.remove('hurt');
        void s.offsetWidth;
        s.classList.add('hurt');
        hud();
        if (g >= f) {
            g = f;
            eatT = 0;
            $('fb').textContent = 'NHAC! BUUM! O SAPO EXPLODIU!';
        }
        else {
            $('fb').textContent = (k < 0 ? 'TEMPO ESGOTADO! ' : 'ERROU! ') + why(cur);
            $('cont').hidden = false;
        }
    }
}

function end(win) {
    show('end');
    $('eTitle').textContent = win ? (G.bonus ? 'TRAVESSIA PERFEITA!' : 'TRAVESSIA COMPLETA!') : 'BUUM! FIM DE JOGO';
    $('eTxt').textContent = (win ? 'O sapo chegou ao castelo e você ganhou 1 🏰! ' : 'O jacaré pegou o sapo e ele explodiu! ') + (G.bonus ? 'PERFEITO! Bônus de ' + G.bonus + ' moedas por acertar tudo! ' : '') + 'Você ganhou ' + G.earned + ' moedas nesta partida.';
}

function shop() {
    $('sCoins').textContent = '🪙 ' + D.coins;
    $('items').innerHTML = '';
    $('cast').textContent = '🏰 ' + D.castles + ' castelos (1 = ' + CASTLE + ' 🪙)';
    $('swap1').disabled = $('swapAll').disabled = D.castles < 1;
    SK.forEach(s => {
        const own = D.owned.includes(s.id), eq = D.sel === s.id, d = document.createElement('div');
        d.className = 'item';
        d.innerHTML = thumb(s, 76) + '<div>' + s.n + '</div>';
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = eq ? 'EQUIPADO' : own ? 'USAR' : '🪙 ' + s.p;
        b.disabled = eq;
        b.onclick = () => {
            if (!own) {
                if (D.coins < s.p) {
                    $('sMsg').textContent = 'Faltam ' + (s.p - D.coins) + ' moedas. Jogue mais!';
                    return;
                }
                D.coins -= s.p;
                D.owned.push(s.id);
                snd('coin');
                $('sMsg').textContent = 'Sapo comprado!';
            }
            D.sel = s.id;
            save();
            shop();
        };
        d.appendChild(b);
        $('items').appendChild(d);
    });
}

const openShop = () => {
    show('shop');
    shop();
};

$('start').onclick = startGame;
$('again').onclick = startGame;
$('goShop').onclick = openShop;
$('eShop').onclick = openShop;
$('back').onclick = () => show('title');
$('eMenu').onclick = () => show('title');
$('cont').onclick = nextQ;

function swap(n) {
    if (n < 1)
        return;
    D.castles -= n;
    D.coins += n * CASTLE;
    snd('coin');
    save();
    $('sMsg').textContent = 'Você trocou ' + n + ' 🏰 por ' + n * CASTLE + ' moedas!';
    shop();
}

$('swap1').onclick = () => swap(1);
$('swapAll').onclick = () => swap(D.castles);
document.addEventListener('visibilitychange', () => {
    if (G)
        G.paused = document.hidden;
});
document.addEventListener('keydown', e => {
    if (view !== 'game' || !G)
        return;
    if (e.key >= '1' && e.key <= '3')
        answer(+e.key - 1);
    else if ((e.key === 'Enter' || e.key === ' ') && !$('cont').hidden) {
        e.preventDefault();
        nextQ();
    }
});
const icon = () => $('mute').textContent = D.mute ? '🔇' : '🔊';
$('mute').onclick = () => {
    D.mute = !D.mute;
    save();
    icon();
};

icon();
addEventListener('resize', fit);
new ResizeObserver(fit).observe($('stage'));
fit();
resetScene();
home();
requestAnimationFrame(loop);
