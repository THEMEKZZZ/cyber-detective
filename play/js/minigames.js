/* ---------- overlay helpers: free the mouse while a 2D panel is open, re-lock on close ---------- */
function uiOpen(kind, html) { S.ui = kind; const o = $('#ui'); o.innerHTML = html; o.style.display = 'flex'; if (document.pointerLockElement) document.exitPointerLock(); }
function uiClose() { S.ui = null; const o = $('#ui'); o.style.display = 'none'; o.innerHTML = ''; if (!locked && !S.noLock && S.mode === 'play') pause(true) }
/* ===================== ELECTRICAL PANEL: wire connection minigame ===================== */
const WIRE = { cols: [['#d23a2a', 'แดง'], ['#2a5ad8', 'น้ำเงิน'], ['#e8c83a', 'เหลือง'], ['#3aa84a', 'เขียว'], ['#e8e8e0', 'ขาว']] };
function wireOpen() {
  uiOpen('wire', `<div class="panel" style="width:min(720px,94vw)"><h2>แผงไฟฟ้าหลัก</h2><p class="small" style="margin:2px 0 6px">ลากสายจากขั้วซ้ายไปยังขั้วสีเดียวกันทางขวา ต่อครบ 5 เส้นแล้วดันคันโยก</p>
  <canvas id="wc" width="640" height="400" style="display:block;margin:0 auto;width:min(100%,calc((86vh - 150px) * 1.6));background:#1a1c1c;border:2px solid #555;touch-action:none;cursor:crosshair"></canvas>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span id="wst">วงจร 0/5</span><span><button id="wlever" disabled>ดันคันโยกจ่ายไฟ</button><button id="wx">ออก (Esc)</button></span></div></div>`);
  const c = $('#wc'), g = c.getContext('2d'), N = 5, Lo = [...Array(N).keys()].sort(() => Math.random() - .5), Ro = [...Array(N).keys()].sort(() => Math.random() - .5);
  const st = { done: {}, drag: null, mx: 0, my: 0, sparks: [], flash: 0, lever: 0, mistakes: 0 }; WIRE.st = st;
  const LP = i => [90, 70 + Lo.indexOf(i) * 62], RP = i => [550, 70 + Ro.indexOf(i) * 62]; window.__wirePos = () => [...Array(N).keys()].map(i => [LP(i), RP(i), RP((i + 1) % N)]);
  const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 640, (e.clientY - r.top) / r.height * 400] };
  c.onpointerdown = e => { const [x, y] = pos(e); for (let i = 0; i < N; i++) { const [lx, ly] = LP(i); if (!st.done[i] && Math.hypot(x - lx, y - ly) < 24) { st.drag = i; st.mx = x; st.my = y; c.setPointerCapture(e.pointerId) } } };
  c.onpointermove = e => { [st.mx, st.my] = pos(e) };
  c.onpointerup = e => { if (st.drag === null) return; const [x, y] = pos(e); let tgt = null; for (let i = 0; i < N; i++) { const [rx, ry] = RP(i); if (Math.hypot(x - rx, y - ry) < 26) tgt = i }
    if (tgt !== null) { if (tgt === st.drag) { st.done[tgt] = 1; SND.zap(); spark(RP(tgt), '#ffe080'); const n = Object.keys(st.done).length; $('#wst').textContent = `วงจร ${n}/5`; if (n === N) { $('#wlever').disabled = false; $('#wst').textContent = 'ต่อครบแล้ว ดันคันโยก!' } } else { st.mistakes++; st.flash = 1; SND.buzz(); spark(RP(tgt), '#ff4030'); $('#wst').textContent = 'ผิดขั้ว! สี' + WIRE.cols[st.drag][1] + ' ต้องไปขั้วสี' + WIRE.cols[st.drag][1]; if (AI.visible) noise(p(4.2) - .3, 2.08, 0, .5) } } st.drag = null };
  const spark = ([x, y], col) => { for (let k = 0; k < 18; k++) st.sparks.push({ x, y, vx: rr(-140, 140), vy: rr(-180, 60), t: rr(.3, .7), col }) };
  $('#wx').onclick = () => { cancelAnimationFrame(st.raf); uiClose() };
  $('#wlever').onclick = () => { st.lever = .01; SND.lever(); setTimeout(() => { cancelAnimationFrame(st.raf); uiClose(); restorePower() }, 900) };
  let last = performance.now(); const draw = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; g.fillStyle = '#202322'; g.fillRect(0, 0, 640, 400); g.fillStyle = '#2c302e'; g.fillRect(40, 20, 560, 360); g.strokeStyle = '#555'; g.strokeRect(40.5, 20.5, 559, 359);
    for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect((k * 97) % 560 + 40, (k * 53) % 360 + 20, 30, 12) }
    g.font = '13px ' + TF; g.fillStyle = '#aaa'; g.fillText('อินพุตจากมิเตอร์', 50, 44); g.fillText('วงจรในบ้าน', 520, 44);
    for (let i = 0; i < N; i++) { const [lx, ly] = LP(i), [rx, ry] = RP(i), col = WIRE.cols[i][0];
      g.fillStyle = col; g.fillRect(40, ly - 6, lx - 40, 12); g.beginPath(); g.arc(lx, ly, 14, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(lx, ly, 5, 0, 7); g.fill();
      g.fillStyle = '#7a7c78'; g.beginPath(); g.arc(rx, ry, 16, 0, 7); g.fill(); g.fillStyle = col; g.globalAlpha = .55; g.fillRect(rx + 22, ry - 9, 34, 18); g.globalAlpha = 1; g.fillStyle = '#ddd'; g.fillText(WIRE.cols[i][1], rx + 22, ry + 30);
      if (st.done[i]) { g.strokeStyle = col; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx, ly); g.bezierCurveTo(lx + 180, ly, rx - 180, ry, rx, ry); g.stroke(); g.lineWidth = 1; g.fillStyle = '#7f7'; g.beginPath(); g.arc(rx, ry - 22, 4, 0, 7); g.fill() } }
    if (st.drag !== null) { const [lx, ly] = LP(st.drag); g.strokeStyle = WIRE.cols[st.drag][0]; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx, ly); g.bezierCurveTo(lx + 120, ly, st.mx - 120, st.my, st.mx, st.my); g.stroke(); g.lineWidth = 1 }
    st.sparks = st.sparks.filter(s => (s.t -= dt) > 0); for (const s of st.sparks) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 500 * dt; g.fillStyle = s.col; g.fillRect(s.x, s.y, 3, 3) }
    const n = Object.keys(st.done).length; g.fillStyle = '#111'; g.fillRect(250, 360, 140, 10); g.fillStyle = '#4c4'; g.fillRect(250, 360, 140 * n / N, 10);
    if (st.lever) st.lever = Math.min(1, st.lever + dt * 2.5); g.save(); g.translate(320, 200); g.rotate(-.7 + st.lever * 1.4); g.fillStyle = '#888'; g.fillRect(-6, -60, 12, 60); g.fillStyle = '#c33'; g.beginPath(); g.arc(0, -64, 12, 0, 7); g.fill(); g.restore(); g.fillStyle = '#444'; g.fillRect(296, 196, 48, 20);
    if (st.flash > 0) { st.flash -= dt * 3; g.fillStyle = `rgba(255,40,30,${st.flash * .35})`; g.fillRect(0, 0, 640, 400) } st.raf = requestAnimationFrame(draw) }; st.raf = requestAnimationFrame(draw);
}
function restorePower() { S.panelBroken = false; setPower(true); SND.powerUp(); sub('ไฟกลับมาแล้ว'); if (window.onPowerRestored) onPowerRestored() }
/* ===================== KITCHEN: fridge, cold pizza, microwave, eat ===================== */
const KIT = {}; S.pz = 0; S.inv = {};
/* a real round pizza: 6 wedges sharing one top texture (cheese, sauce, pepperoni, herbs) mapped across the whole pie, with a baked crust rim */
const PZR = .15, PZN = 6, PZTEX = {};
function pizzaTopTex(hot) { if (PZTEX[hot]) return PZTEX[hot]; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#b8742c'; g.fillRect(0, 0, 256, 256);
  g.beginPath(); g.arc(128, 128, 116, 0, 7); g.fillStyle = hot ? '#b83a1c' : '#9a3a22'; g.fill(); // sauce
  for (let i = 0; i < 70; i++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 104, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r; g.beginPath(); g.ellipse(x, y, rr(8, 18), rr(6, 14), rr(0, 3), 0, 7); g.fillStyle = hot ? `rgba(${248},${rr(200, 222) | 0},${rr(110, 140) | 0},.92)` : `rgba(230,${rr(196, 212) | 0},${rr(140, 160) | 0},.9)`; g.fill() } // melted cheese
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28 + rr(0, .3), r = 30 + (i % 3) * 30 + rr(-6, 6), x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r; const gr = g.createRadialGradient(x - 3, y - 3, 1, x, y, 13); gr.addColorStop(0, '#d0503a'); gr.addColorStop(.75, '#9a2618'); gr.addColorStop(1, '#5a1208'); g.beginPath(); g.arc(x, y, 12, 0, 7); g.fillStyle = gr; g.fill(); if (hot) { g.fillStyle = 'rgba(255,200,120,.35)'; g.beginPath(); g.arc(x - 4, y - 4, 3, 0, 7); g.fill() } } // pepperoni
  for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28, r = Math.random() * 100; g.fillStyle = '#2f5a22'; g.fillRect(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 3, 2) } // herbs
  grain(g, 256, 256, 400); const t = new T.CanvasTexture(c); PZTEX[hot] = t; return t }
function pizzaMat(hot) { return new T.MeshStandardMaterial({ map: pizzaTopTex(hot ? 1 : 0), roughness: hot ? .55 : .8 }) }
const crustM = MC(0xa8682c, .85);
function pizzaWedge(i, hot) { const a0 = i / PZN * Math.PI * 2, a1 = (i + 1) / PZN * Math.PI * 2, s = new T.Shape(); s.moveTo(0, 0); s.absarc(0, 0, PZR, a0, a1, false); s.lineTo(0, 0);
  const g = new T.ExtrudeGeometry(s, { depth: .01, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 1, curveSegments: 8 }); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, uv = g.attributes.uv; for (let k = 0; k < p.count; k++) uv.setXY(k, p.getX(k) / (2 * PZR * 1.1) + .5, -p.getZ(k) / (2 * PZR * 1.1) + .5); // planar map across the whole pie
  const w = new T.Group(), top = new T.Mesh(g, pizzaMat(hot)); w.add(top); const rim = new T.Mesh(new T.TorusGeometry(PZR, .011, 6, 6, a1 - a0), crustM); rim.rotation.x = -Math.PI / 2; rim.rotation.z = a0; rim.position.y = .011; rim.scale.z = .9; w.add(rim);
  w.userData.mid = (a0 + a1) / 2; return w }
function wholePizza(hot) { const g = new T.Group(); g.userData.wedges = []; for (let i = 0; i < PZN; i++) { const w = pizzaWedge(i, hot); w.position.y = .012; g.add(w); g.userData.wedges.push(w) } return g }
function pizzaSlice(m) { const s = new T.Shape(); s.moveTo(0, 0); s.lineTo(.16, -.05); s.quadraticCurveTo(.17, 0, .16, .05); s.lineTo(0, 0); const g = new T.ExtrudeGeometry(s, { depth: .012, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return new T.Mesh(g, m) }
function pizzaMat(hot) { return M(tex(64, (g, w) => { g.fillStyle = hot ? '#e0a040' : '#c89a5a'; g.fillRect(0, 0, w, w); for (let i = 0; i < 9; i++) { g.fillStyle = '#8a2a1a'; g.beginPath(); g.arc(rr(8, 56), rr(8, 56), rr(3, 5), 0, 7); g.fill() } grain(g, w, w, 100) }), .7) }
function buildKitchenInteractive() {
  buildFridge();
  // microwave on the counter (door, window, turntable, display)
  const kz = HD - .38, mw = G(), shell = MC(0xcfcabc, .4), cav = MC(0xa8a69c, .6); // hollow shell: a real cavity you can see into when the door is open
  P3(mw, Bx(.5, .02, .38), shell, 0, .14, 0); P3(mw, Bx(.5, .02, .38), shell, 0, -.14, 0); P3(mw, Bx(.5, .3, .02), shell, 0, 0, -.18); P3(mw, Bx(.02, .3, .38), shell, -.24, 0, 0); P3(mw, Bx(.13, .3, .38), shell, .185, 0, 0);
  P3(mw, Bx(.35, .005, .34), cav, -.06, .127, 0); P3(mw, Bx(.35, .005, .34), cav, -.06, -.127, 0); P3(mw, Bx(.35, .26, .005), cav, -.06, 0, -.167); P3(mw, Bx(.005, .26, .34), cav, -.227, 0, 0); P3(mw, Bx(.005, .26, .34), cav, .118, 0, 0); P3(mw, Bx(.12, .26, .01), MC(0x2a2a2a, .4), .18, 0, .195); const dispC = document.createElement('canvas'); dispC.width = 64; dispC.height = 24; const dTex = new T.CanvasTexture(dispC); P3(mw, new T.PlaneGeometry(.1, .035), new T.MeshBasicMaterial({ map: dTex }), .18, .08, .2);
  for (let i = 0; i < 6; i++) P3(mw, Bx(.022, .016, .006), MC(0x8a8a80, .5), .155 + (i % 2) * .05, .02 - Math.floor(i / 2) * .03, .2);
  const md = G(); md.position.set(-.25, 0, .19); mw.add(md); P3(md, Bx(.36, .28, .02), MC(0xcfcabc, .4), .18, 0, 0); const win = P3(md, Bx(.26, .18, .005), MC(0x101010, .1, { transparent: true, opacity: .75 }), .18, 0, .012); md.userData.dyn = 1;
  const inL = new T.PointLight(0xffd890, 0, .9, 2); inL.position.set(-.05, .1, 0); mw.add(inL); const tt = G(); tt.position.set(-.06, -.118, 0); mw.add(tt); P3(tt, Cy(.13, .01, 18), MC(0xd8e0e0, .1, { transparent: true, opacity: .7 })); tt.userData.dyn = 1;
  const plate = G(); P3(plate, plateG, MC(0xe8e4d8, .3)); const pzc = wholePizza(0); plate.add(pzc); plate.userData.pizza = pzc; plate.visible = false; tt.add(plate); plate.userData.dyn = 1;
  furn(mw, 9.9, .9 + .15, kz - .04, Math.PI, 0); KIT.mw = { door: md, light: inL, tt, plate, dispC, dTex, t: 0, open: 0 };
  IT.push({ x: 9.9, y: 1.05, z: kz - .3, l: 0, r: 1.6, lab: () => { const m = KIT.mw; if (S.pz === 5) return 'กำลังอุ่น... ' + Math.ceil(m.t) + ' วิ'; if (S.pz === 3) return m.open ? '[E] ใส่พิซซ่าเข้าไมโครเวฟ' : '[E] เปิดประตูไมโครเวฟ'; if (S.pz === 4) return m.open ? '[E] ปิดประตูไมโครเวฟ' : '[E] กดปุ่มอุ่น 30 วินาที'; if (S.pz === 6) return m.open ? '[E] หยิบพิซซ่าร้อน' : '[E] เปิดประตูไมโครเวฟ'; return m.open ? '[E] ปิดประตูไมโครเวฟ' : '[E] เปิดประตูไมโครเวฟ' },
    act: () => { const m = KIT.mw; if (S.pz === 5) return; if (!m.open && S.pz === 4) { SND.mwBtn(); S.pz = 5; m.t = 30; progress('pz_heat'); return } if (S.pz === 3 && m.open) { S.pz = 4; delete S.inv.pizza; m.plate.visible = true; SND.plate(); return } if (S.pz === 6 && m.open) { S.pz = 7; m.plate.visible = false; S.inv.pizza = 'ร้อน'; SND.plate(); sub('ร้อนกำลังดี ไปนั่งกินที่โต๊ะ'); return } m.open = !m.open; SND.mwDoor() } });
  // dining table: sit and eat
  const tp = G(); P3(tp, plateG, MC(0xe8e4d8, .3)); const tpz = wholePizza(1); tp.add(tpz); KIT.slices = tpz.userData.wedges; tp.visible = false; tp.userData.dyn = 1; furn(tp, 9.25, .77, 5.0, 0, 0); KIT.tplate = tp;
  IT.push({ x: 9.4, y: .9, z: 5.2, l: 0, r: 1.8, lab: () => S.pz === 7 ? '[E] นั่งกินพิซซ่าที่โต๊ะ' : '', act: () => { if (S.pz === 7) eatPizza() } });
}
/* eating: hold [E] to fill the ring -> one slice is lifted, bitten (chewing synced to the animation) and gone; 3 of the 6 slices, then [Space] to get up */
const EAT_N = 3;
function eatPizza() { S.pz = 8; delete S.inv.pizza; KIT.tplate.visible = true; KIT.slices.forEach(w => { w.visible = true; w.position.set(0, .012, 0); w.scale.setScalar(1) }); SND.plate(); S.eat = { t: 0, x: P.x, z: P.z, n: 0, h: 0, arm: 0, anim: 0 }; P.x = 9.25; P.z = 4.45; P.yaw = Math.PI; P.pitch = -.62; S.seated = 1; eatHud() }
function eatHud() { const e = S.eat, el = $('#eatr'); if (!e || S.pz !== 8) { el.style.display = 'none'; return } el.style.display = 'block'; const done = e.n >= EAT_N;
  el.querySelector('circle.p').style.strokeDashoffset = (1 - (done ? 1 : e.h)) * 188.5; el.querySelector('.t').textContent = done ? '[SPACE] ลุกขึ้น' : (e.anim ? 'กำลังกิน...' : '[E ค้าง] กินพิซซ่า'); el.querySelector('.n').textContent = 'กินแล้ว ' + e.n + '/' + EAT_N + ' ชิ้น · เหลือบนจาน ' + (PZN - e.n) }
function eatTick(dt) { const e = S.eat; if (S.pz !== 8 || !e) return; if (!keys.KeyE) e.arm = 1;
  if (e.anim) { e.anim -= dt; const w = KIT.slices[e.n - 1], k = 1 - Math.max(0, e.anim) / 1.4; // lift towards the mouth, then the bites shrink it away
    w.position.set(Math.cos(w.userData.mid) * .05 * k, .012 + k * .22, -Math.sin(w.userData.mid) * .05 * k - k * .18); w.scale.setScalar(Math.max(.01, 1 - Math.max(0, k - .45) * 1.8)); if (e.anim <= 0) { e.anim = 0; w.visible = false; e.h = 0 } }
  else if (e.n < EAT_N) { if (keys.KeyE && e.arm && !S.paused) e.h = Math.min(1, e.h + dt / 1.6); else e.h = Math.max(0, e.h - dt * 1.5);
    if (e.h >= 1) { e.n++; e.anim = 1.4; e.h = 1; SND.chew(); (window.DBGLOG || []).push('eat slice ' + e.n) } }
  eatHud() }
function eatStand() { const e = S.eat; if (S.pz !== 8 || !e || e.n < EAT_N || e.anim > 0) return;
  { let k = 0; const step = () => { if (k < 0) { } else { S.seated = 0; S.pz = 9; P.pitch = 0; [P.x, P.z] = freeSpot(S.eat.x, S.eat.z); P.yaw = Math.atan2(-(9.25 - P.x), -(5.0 - P.z)) + Math.PI; VX = VZ = 0; /* stand up where you sat down from (never inside the chair/table) */ sub('อิ่มแล้ว... กลับไปทำงานต่อดีกว่า'); $('#eatr').style.display = 'none'; progress('pz_eat') } }; step() } }
function kitchenTick(dt) { if (!KIT.mw) return; const m = KIT.mw; fridgeTick(dt); eatTick(dt); m.door.rotation.y += ((m.open ? -1.6 : 0) - m.door.rotation.y) * Math.min(1, dt * 6);
  if (S.pz === 5) { m.t -= dt; m.tt.rotation.y += dt * 1.2; m.light.intensity = S.power ? 1.2 : 0; if (!S.power) m.t += dt; /* the hum is now a positional loop at the microwave (loopsTick) */ if (m.t <= 0) { S.pz = 6; m.light.intensity = 0; m.plate.userData.pizza.userData.wedges.forEach(w => w.children[0].material = pizzaMat(1)); KIT.steam = 8; SND.mwBeep(); noise(9.9, HD - .4, 0, .6); sub('ติ๊ง ติ๊ง ติ๊ง') } } else m.light.intensity = 0;
  KIT.dt = (KIT.dt || 0) + dt; if (KIT.dt > .25) { KIT.dt = 0; const c = m.dispC.getContext('2d'); c.fillStyle = '#061008'; c.fillRect(0, 0, 64, 24); c.fillStyle = S.power ? '#5aff7a' : '#061008'; c.font = 'bold 18px monospace'; c.fillText(S.pz === 5 ? '0:' + String(Math.max(0, Math.ceil(m.t))).padStart(2, '0') : S.pz === 6 ? 'END' : fmt(), 4, 19); m.dTex.needsUpdate = true } }
/* ===================== HIDING: louvered wardrobe in the back bedroom ===================== */
const HIDE = { x: 11.9, z: 6.06, doors: [], open: 0 };
function louverWardrobe() { const g = G(), w = 1.3, h = 2.05, d = .6, wd = MC(0xd8d0bc, .7); P3(g, Bx(w, h, .03), wd, 0, h / 2, -d / 2 + .015); for (const s of [-1, 1]) P3(g, Bx(.03, h, d), wd, s * (w / 2 - .015), h / 2, 0); P3(g, Bx(w + .06, .06, d + .04), wd, 0, h + .02, 0); P3(g, Bx(w, .08, d), wd, 0, .04, 0); P3(g, Bx(w - .06, .02, d - .04), MC(0x2a221c, .9), 0, h - .1, 0);
  P3(g, Cy(.012, w - .1, 6), MAT.chrome, 0, h - .3, 0, 0, 0, Math.PI / 2); for (let i = 0; i < 5; i++) P3(g, Bx(.04, rr(.7, 1.0), .4), MC([0x3a3430, 0x5a5048, 0x2a2e36, 0x4a3a32, 0x6a6458][i], 1), -.45 + i * .12, h - .75, 0, 0, rr(-.1, .1));
  const dw = (w - .06) / 2; for (const s of [-1, 1]) { const piv = G(); piv.position.set(s * (w / 2 - .02), 0, d / 2 + .01); g.add(piv); piv.userData.dyn = 1; const fr = G(); fr.position.x = -s * dw / 2; piv.add(fr);
    P3(fr, Bx(dw, .08, .03), wd, 0, .1, 0); P3(fr, Bx(dw, .08, .03), wd, 0, h - .06, 0); P3(fr, Bx(.07, h - .1, .03), wd, -dw / 2 + .035, h / 2, 0); P3(fr, Bx(.07, h - .1, .03), wd, dw / 2 - .035, h / 2, 0); P3(fr, Bx(dw, .07, .03), wd, 0, h * .52, 0);
    const sg = new T.BoxGeometry(dw - .14, .045, .008), im = new T.InstancedMesh(sg, wd, 30), o = new T.Object3D(); let k = 0; for (let y = .2; y < h - .12 && k < 30; y += .062) { if (Math.abs(y - h * .52) < .06) continue; o.position.set(0, y, 0); o.rotation.set(.75, 0, 0); o.updateMatrix(); im.setMatrixAt(k++, o.matrix) } im.count = k; fr.add(im);
    P3(fr, new T.TorusGeometry(.025, .006, 6, 12), MAT.brass, s * (-dw / 2 + .08), h * .52, .03); HIDE.doors.push({ piv, s }) }
  return g }
function buildHideSpot() { const wd = louverWardrobe(); F(wd, HIDE.x, HIDE.z, 0, 1, 1.3, .62);
  IT.push({ x: HIDE.x, y: FY[1] + 1.2, z: HIDE.z + .5, l: 1, r: 1.9, lab: () => '[E] ซ่อนในตู้เสื้อผ้า', act: () => enterHide() }) }
function hideTick(dt) { const inW = S.hidden && S.hideSpot !== 'bed', tgt = inW ? (S.hideAnim < 1 ? .9 : .14) : (S.hideAnim < 1 && S.hideAnim > 0 ? .9 : HIDE.open ? 1.5 : 0); for (const d of HIDE.doors) d.piv.rotation.y += ((d.s * (AI.st === 'OPENING_WARDROBE' || S.mode === 'dead' ? 1.6 : tgt)) - d.piv.rotation.y) * Math.min(1, dt * 7) }
function enterHide(spot) { if (S.hidden) return; { const rm = ROOMS[roomAt(1, P.x, P.z)]; if (S.flash) return sub('ปิดไฟฉายก่อน [F] — แสงจะทำให้เขารู้ว่ามีคนซ่อนอยู่'); if (S.power && rm && rm.on) return sub('ปิดไฟในห้องก่อน — แสงจะทำให้เขารู้ว่ามีคนซ่อนอยู่') } /* lights off before any hiding place */ if (spot !== 'bed' && S.bedHide && S.st === 'HIDE_SECOND_TIME') return sub('ไม่ได้... เขาต้องกลับมาเปิดตู้นี้แน่ ต้องซ่อนใต้เตียง'); S.hideSpot = spot || 'ward'; S.hidden = true; S.hideAnim = 0; SND.cloth(); creak(); P.yawH = 0; P.pitchH = 0; progress('hide'); micStart(); }
function exitHide(force) { if (!S.hidden) return; if (!force && !S.arrested && AI.visible && roomAt(AI.l, AI.x, AI.z) === HIDE.room && AI.l === 1) { sub('ยังไม่ปลอดภัย... เขายังอยู่ในห้อง'); return } S.hidden = false; S.hideAnim = .5; micStop(); SND.cloth(); if (S.hideSpot === 'bed') { P.x = BEDH.x - .75; P.z = BEDH.z; P.yaw = BEDH.yaw } else { [P.x, P.z] = hideAt(.95); P.yaw = HIDE.ry + Math.PI } PY = FY[1]; P.pitch = 0; HIDE.open = 0; setTimeout(() => S.hideAnim = 0, 500); progress('unhide') }
/* ===================== MICROPHONE: consent, local analysis only, simulated fallback ===================== */
const MIC = { stream: null, an: null, src: null, buf: null, active: false, floor: -58, lvl: 0, sim: false, breath: 1, msg: '' };
function micStart() { if (OPT.micMode === 'sim') { MIC.sim = true; return micHud(true) } if (OPT.micMode === 'mic' && MIC.ok) return micOpen(); micAsk() }
function micAsk() { uiOpen('mic', `<div class="panel" style="max-width:560px"><h2>ระบบตรวจจับเสียงขณะซ่อนตัว</h2>
  <p>ขณะซ่อนในตู้ เกมสามารถฟังเสียงจาก <b>ไมโครโฟนจริง</b> ของคุณ ถ้าคุณส่งเสียงดัง ผู้บุกรุกอาจได้ยิน</p>
  <ul class="small"><li>ไมโครโฟนทำงาน <b>เฉพาะตอนอยู่ในตู้</b> และปิดทันทีเมื่อออกจากตู้</li><li>ประมวลผลระดับเสียงในเครื่องของคุณเท่านั้น ไม่บันทึก ไม่ส่งข้อมูลออกไปไหน</li><li>ไม่อยากใช้ไมค์? เลือกโหมดจำลอง (กด Space ค้างเพื่อกลั้นหายใจ)</li></ul>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><button id="mOk">อนุญาตไมโครโฟน</button><button id="mSim">โหมดจำลอง (ไม่ใช้ไมค์)</button></div><p class="small" id="mMsg"></p></div>`);
  $('#mOk').onclick = () => { $('#mMsg').textContent = 'กำลังขอสิทธิ์จากเบราว์เซอร์...'; micOpen(true) }; $('#mSim').onclick = () => { OPT.micMode = 'sim'; saveOpt(); MIC.sim = true; uiClose(); micHud(true) } }
async function micOpen(fromDialog) {
  try { if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('unsupported');
    const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    if (!S.hidden) { st.getTracks().forEach(t => t.stop()); if (fromDialog) uiClose(); return } // left the closet while the prompt was open
    initAudio(); MIC.stream = st; MIC.src = AC.createMediaStreamSource(st); MIC.an = AC.createAnalyser(); MIC.an.fftSize = 1024; MIC.buf = new Float32Array(MIC.an.fftSize); MIC.src.connect(MIC.an); // analyser only: never routed to speakers or recorded
    MIC.active = true; MIC.ok = true; MIC.sim = false; OPT.micMode = 'mic'; saveOpt(); if (fromDialog) uiClose(); micHud(true);
  } catch (e) { MIC.msg = 'ใช้ไมโครโฟนไม่ได้บนแพลตฟอร์มนี้ (' + (e.name || e.message) + ') เปลี่ยนเป็นโหมดจำลอง'; MIC.sim = true; if (fromDialog) { $('#mMsg').textContent = MIC.msg; setTimeout(() => { uiClose(); micHud(true) }, 1800) } else micHud(true) }
}
function micStop() { if (MIC.stream) MIC.stream.getTracks().forEach(t => t.stop()); if (MIC.src) MIC.src.disconnect(); MIC.stream = MIC.src = MIC.an = null; MIC.active = false; MIC.lvl = 0; S.noiseLvl = 0; micHud(false); if (S.ui === 'mic') uiClose() }
function micCalibrate() { if (!MIC.active) return; let n = 0, sum = 0; sub('กำลังปรับเทียบ... เงียบไว้ 2 วินาที'); const iv = setInterval(() => { sum += micDb(); n++; if (n >= 20) { clearInterval(iv); MIC.floor = sum / n; OPT.micFloor = MIC.floor; saveOpt(); sub('ปรับเทียบแล้ว ระดับเสียงพื้นหลัง ' + MIC.floor.toFixed(0) + ' dB') } }, 100) }
function micDb() { if (!MIC.an) return -100; MIC.an.getFloatTimeDomainData(MIC.buf); let s = 0; for (const v of MIC.buf) s += v * v; return 10 * Math.log10(s / MIC.buf.length + 1e-10) }
let simMouse = 0; addEventListener('mousemove', e => { if (S.hidden) simMouse += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) });
addEventListener('keydown', e => { if (S.hidden && !e.repeat && /Key[WASD]|ShiftLeft/.test(e.code)) simMouse += 220; if (S.hidden && e.code === 'KeyC') micCalibrate() });
function micTick(dt) {
  if (!S.hidden) { S.noiseLvl = 0; return } let lvl;
  if (MIC.active) { const db = micDb(), range = 46 - (OPT.micSens || 5) * 3.2; lvl = cl((db - (OPT.micFloor ?? MIC.floor) - 4) / range, 0, 1) }
  else { // simulated: breathing baseline, cloth noise from moving, hold breath with Space (limited)
    S.holdBreath = keys.Space && MIC.breath > 0; MIC.breath = cl(MIC.breath + (S.holdBreath ? -dt / 7 : dt / 5), 0, 1); let base = S.holdBreath ? .03 : .16 + Math.sin(performance.now() / 600) * .04; if (!S.holdBreath && MIC.breath < .15 && MIC.gasp == null) { MIC.gasp = 1 } if (MIC.gasp > 0) { base = .75 * MIC.gasp; MIC.gasp -= dt * 1.5; if (MIC.gasp <= 0) MIC.gasp = null }
    lvl = cl(base + simMouse / 900, 0, 1); simMouse *= Math.pow(.02, dt) }
  MIC.lvl += (lvl - MIC.lvl) * Math.min(1, dt * (lvl > MIC.lvl ? 12 : 3)); S.noiseLvl = MIC.lvl; micHud(true);
  MIC.nt = (MIC.nt || 0) + dt; if (MIC.nt > .3) { MIC.nt = 0; if (MIC.lvl > .3) { const [nx, nz] = hideAt(.3); noise(nx, nz, 1, MIC.lvl * 1.25, 'ward') } }
}
function micHud(on) { const h = $('#mic'); if (!on) { h.style.display = 'none'; return } h.style.display = 'block'; const l = MIC.lvl || 0, c = l < .3 ? '#5ad05a' : l < .6 ? '#e8c840' : '#ff4a3a', st = l < .3 ? 'เงียบ' : l < .6 ? 'ระวัง' : 'ดังเกินไป!';
  // transparent sound meter only (no panel): sits at the left edge so it never covers subtitles or the view through the slats
  h.innerHTML = `<div class="mt">${MIC.active ? '🎙' : '◌'} เสียงของคุณ <b style="color:${c}">${st}</b></div><div class="mb"><div style="height:${(l * 100).toFixed(0)}%;background:${c}"></div><i style="bottom:30%"></i><i style="bottom:60%"></i></div>` +
    `<div class="mk"><kbd>SPACE</kbd> ค้าง = กลั้นหายใจ${MIC.active ? '' : ' ' + Math.round(MIC.breath * 100) + '%'}</div><div class="mk"><kbd>E</kbd> ออกจากที่ซ่อน${MIC.active ? ' · <kbd>C</kbd> ปรับเทียบไมค์' : ''}</div>` + (MIC.msg ? `<div class="mk" style="color:#f9b">${MIC.msg}</div>` : '') }
/* ===================== LAPTOP decision ===================== */
function laptopDialog() { uiOpen('lap', `<div class="panel" style="max-width:600px"><h2>LAPTOP-7F2</h2><p>หน้าจอเปิดค้างอยู่: ภาพสดจากกล้องห้องคอมพิวเตอร์ของคุณ โฟลเดอร์ "1407" มีภาพแอบถ่ายนับร้อย สาย LAN เสียบอยู่กับปลั๊ก LAN-4</p>
  <p class="small">ตัดสินใจได้ครั้งเดียว:</p><div style="display:flex;flex-direction:column;gap:8px"><button id="lCopy">คัดลอกไฟล์เป็นหลักฐาน (เขาอาจรู้ตัวว่ามีคนเข้าเครื่อง)</button><button id="lPull">ถอดปลั๊กและดึงสาย LAN (ตัดสิทธิ์ดูกล้องของเขา แต่ไฟล์จะหายไป)</button><button id="lNo">ยังไม่ตัดสินใจ</button></div></div>`);
  $('#lCopy').onclick = () => { S.laptopDone = 1; S.camTrack = 1; clue('C9'); uiClose(); sub('คัดลอกเสร็จ... ไฟกล้องที่แล็ปท็อปกะพริบสามครั้ง'); progress('laptop') };
  $('#lPull').onclick = () => { S.laptopDone = 1; S.laptopUnplugged = 1; LAPTOP.userData.scr.material.color.setHex(0x000000); if (window.HCAM) HCAM.material.color.setHex(0x200000); uiClose(); sub('ดึงสายออกแล้ว เขามองไม่เห็นคุณผ่านกล้องอีกต่อไป'); progress('laptop') }; $('#lNo').onclick = () => uiClose() }
/* ===================== JUMPSCARE + GAME OVER ===================== */
function jumpscare(kind) { if (S.mode !== 'play') return; S.mode = 'dead'; micStop(); S.silence = 1; aiSet('JUMPSCARE'); const v = new T.Vector3(); cam.getWorldDirection(v); v.y = 0; v.normalize();
  if (kind === 'wardrobe') { [AI.x, AI.z] = hideAt(.62); AI.yaw = HIDE.ry + Math.PI; AI.l = 1; AI.y = FY[1] } else { AI.x = cam.position.x + v.x * .65; AI.z = cam.position.z + v.z * .65; AI.yaw = Math.atan2(-v.x, -v.z); AI.y = PY; AI.l = PY > 1.6 ? 1 : 0 }
  NPC.root.visible = true; AI.reach = 1; aiPose(0, false); NPC.J.shL.rotation.x = -1.4; NPC.J.shR.rotation.x = -1.4; NPC.J.neck.rotation.y = 0; NPC.J.head.rotation.x = .25;
  setTimeout(() => { SND.boom(); sting(); $('#flash').style.opacity = 1; setTimeout(() => $('#flash').style.opacity = 0, 120) }, 260);
  setTimeout(() => { aiSet('GAME_OVER'); $('#goReason').textContent = kind === 'wardrobe' ? 'เขาได้ยินเสียงของคุณจากในตู้' : 'เขามองเห็นคุณ'; $('#gameover').style.display = 'flex'; document.exitPointerLock && document.exitPointerLock() }, 1900) }
function restartFrom(mode) { try { sessionStorage.setItem('cd4boot', mode) } catch (e) { } location.reload() }
/* ===================== objective progress hook (story.js consumes) ===================== */
function progress(ev) { if (window.storyEvent) storyEvent(ev) }

/* second hiding place: under the bed in the main bedroom (camera on the floor, looking out past the bed frame) */
const BEDH = { x: 3.52, z: 2.2, yaw: 1.78 }; /* at the foot end, eye on the floor: the wardrobe (left) and the bedroom door (right) are both in view */
