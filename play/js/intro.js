/* Opening cinematic: night drive through the suburb, park at the kerb in front of 1407, employer phone call, step out.
   Runs in S.mode === 'intro'. Uses the real scene (same street, same house), so what the player sees here is the world they then walk into. */
const INTRO = { t: 0, phase: 0, car: null, eng: null, ring: 0, answered: 0, line: -1, lineT: 0, skipHold: 0, done: 0, lookX: 0, lookY: 0 };
const PARK = { x: 3.0, z: 18.05 };            // kerb in front of the gate (heading -x so the house is on the driver's right)
const CALL = [ // [speaker, text, seconds]
  ['ริชาร์ด', 'ฮัลโหล ถึงแล้วใช่ไหม? บ้านเลขที่ 1407 หลังที่เปิดไฟหน้าบ้านไว้น่ะ', 4.6],
  ['คุณ', 'ครับ เพิ่งจอดหน้าบ้านพอดีเลย', 2.8],
  ['ริชาร์ด', 'ดีเลย ขอบคุณมากที่รับงานกะดึกนี้นะ คืนนี้ผมไม่อยู่บ้าน ต้องฝากคุณทำงานแทนจนถึงเช้า', 5.4],
  ['ริชาร์ด', 'งานทั้งหมดอยู่ในคอมพิวเตอร์ของผม เป็นเคสตรวจสอบอีเมลกับไฟล์ ต้องเคลียร์ให้เสร็จก่อนเช้า', 5.4],
  ['ริชาร์ด', 'ประตูหน้าบ้านไม่ได้ล็อก เข้าไปได้เลย ผมแปะกระดาษโน้ตไว้ที่ตู้เย็นในครัว อ่านก่อนนะ', 5.2],
  ['คุณ', 'โน้ตบนตู้เย็น... โอเคครับ', 2.6],
  ['ริชาร์ด', 'ทำตามที่เขียนไว้ทีละขั้นก็พอ ถ้ามีอะไรสงสัยส่งอีเมลมาได้ตลอด ขอให้คืนนี้เงียบ ๆ นะ', 5.2],
];
function playerCar() { // our own car: detailed front, see-through glass and a full interior for the in-car shot
  const g = G(), paint = MC(0x1c2430, .5, { metalness: .3 }), trim = MC(0x111214, .6), chrome = MC(0xc8ccd0, .2, { metalness: .9 }), rub = MC(0x0c0c0d, .9),
    glass = new T.MeshBasicMaterial({ color: 0x7890a4, transparent: true, opacity: .14, depthWrite: false }), dashM = MC(0x0b0c0e, .9), seatM = fabT('#2c2d33'), plastic = MC(0x24262a, .7);
  // body: the shared old-sedan shell (hollow cabin so the interior shows through the glass)
  const gl = new T.MeshStandardMaterial({ color: 0x2a3440, roughness: .05, metalness: .85, transparent: true, opacity: .32, depthWrite: false }); { const sd = sedan(0x1c2a36, { hollow: 1, glass: gl }); g.add(sd); g.userData.door = sd.userData.door } P3(g, Bx(3.2, .03, 1.62), MC(0x16171a, .95), -.3, .31, 0); /* cabin floor/carpet: the hollow shell had none */
  const hm = new T.MeshBasicMaterial({ color: 0xfff4d0 }), tm = new T.MeshBasicMaterial({ color: 0xff2a1a }), am = new T.MeshBasicMaterial({ color: 0xffa020 });
  for (const sz of [-1, 1]) P3(g, Bx(.045, .22, .15), tm, -2.69, .64, sz * .74); // our own tail lamps (they flash when the car locks)
  const pc2 = document.createElement('canvas'); pc2.width = 128; pc2.height = 64; const px = pc2.getContext('2d'); px.fillStyle = '#f2f0e8'; px.fillRect(0, 0, 128, 64); px.fillStyle = '#1a3a8a'; px.font = 'bold 30px monospace'; px.fillText('7KXD412', 6, 44); px.fillStyle = '#b02020'; px.font = '10px sans-serif'; px.fillText('California', 40, 12);
  for (const [sx, y] of [[2.81, .43], [-2.69, .54]]) { const pl = P3(g, new T.PlaneGeometry(.3, .15), new T.MeshBasicMaterial({ map: new T.CanvasTexture(pc2) }), sx, y, 0); pl.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2 }
  // interior: dash, cluster, wheel, radio, vents, console, seats, door cards, mirror, visors
  P3(g, Bx(.44, .2, 1.58), dashM, .66, .92, 0); P3(g, RG(.3, .06, 1.56, .03), dashM, .6, 1.03, 0);
  const gc = document.createElement('canvas'); gc.width = 256; gc.height = 96; const gx = gc.getContext('2d'); gx.fillStyle = '#050608'; gx.fillRect(0, 0, 256, 96);
  for (const [cx, lab, a] of [[64, 'km/h', .25], [192, 'x1000', .15]]) { gx.strokeStyle = '#3a6aa0'; gx.lineWidth = 3; gx.beginPath(); gx.arc(cx, 54, 38, Math.PI * .8, Math.PI * 2.2); gx.stroke(); gx.fillStyle = '#9ac8f0'; for (let k = 0; k <= 8; k++) { const t = Math.PI * .8 + k / 8 * Math.PI * 1.4; gx.fillRect(cx + Math.cos(t) * 32 - 1, 54 + Math.sin(t) * 32 - 1, 3, 3) } gx.strokeStyle = '#ff6040'; gx.lineWidth = 2; gx.beginPath(); gx.moveTo(cx, 54); const t = Math.PI * .8 + a * Math.PI * 1.4; gx.lineTo(cx + Math.cos(t) * 30, 54 + Math.sin(t) * 30); gx.stroke(); gx.font = '10px sans-serif'; gx.fillText(lab, cx - 12, 82) }
  gx.fillStyle = '#ffb040'; gx.font = 'bold 13px monospace'; gx.fillText('⛽ ▮▮▮▯', 98, 20);
  const cl = P3(g, Bx(.1, .12, .44), dashM, .52, 1.06, -.38); const gp = P3(g, new T.PlaneGeometry(.38, .14), new T.MeshBasicMaterial({ map: new T.CanvasTexture(gc) }), .468, 1.06, -.38); gp.rotation.y = -Math.PI / 2;
  const wheel = G(); wheel.position.set(.34, 1.0, -.38); wheel.rotation.z = .42; g.add(wheel); P3(wheel, new T.TorusGeometry(.17, .02, 8, 28), rub).rotation.y = Math.PI / 2; P3(wheel, Cy(.055, .05, 14), plastic, 0, 0, 0, 0, 0, Math.PI / 2);
  for (const a of [0, 2.1, 4.2]) { const sp = P3(wheel, Bx(.02, .16, .03), plastic, 0, 0, 0); sp.rotation.x = a; sp.translateY(.08) } P3(g, Cy(.035, .3, 8), plastic, .5, .94, -.38, 0, 0, Math.PI / 2 - .42);
  const rc = document.createElement('canvas'); rc.width = 128; rc.height = 48; const rx = rc.getContext('2d'); rx.fillStyle = '#04080a'; rx.fillRect(0, 0, 128, 48); rx.fillStyle = '#6aff9a'; rx.font = 'bold 15px monospace'; rx.fillText('FM 98.5', 8, 20); rx.font = '13px monospace'; rx.fillText('23:58', 70, 40);
  const rp = P3(g, new T.PlaneGeometry(.2, .075), new T.MeshBasicMaterial({ map: new T.CanvasTexture(rc) }), .445, .93, -.02); rp.rotation.y = -Math.PI / 2;
  for (const z of [-.66, -.12, .12, .6]) { P3(g, Bx(.02, .06, .14), rub, .445, 1.0, z); for (let k = 0; k < 3; k++) P3(g, Bx(.025, .006, .13), plastic, .44, .985 + k * .016, z) }
  P3(g, Bx(.8, .2, .24), plastic, -.08, .7, 0); P3(g, Cy(.012, .14, 6), chrome, .12, .85, 0); P3(g, new T.SphereGeometry(.03, 10, 8), rub, .12, .93, 0); P3(g, Cy(.04, .1, 12), MC(0xe8e2d4, .6), -.2, .84, .06); // gear lever + coffee cup
  for (const sz of [-1, 1]) { P3(g, Bx(.52, .12, .5), seatM, -.12, .5, sz * .4); const bk = P3(g, Bx(.12, .66, .48), seatM, -.42, .88, sz * .4); bk.rotation.z = .14; P3(g, Bx(.1, .16, .26), seatM, -.5, 1.32, sz * .4).rotation.z = .14;
    P3(g, Bx(1.7, .42, .04), plastic, .05, .86, sz * .84); P3(g, Bx(.5, .05, .1), dashM, -.05, .92, sz * .8); const v = P3(g, Bx(.3, .02, .32), plastic, .62, 1.55, sz * .38); v.rotation.z = .2 }
  P3(g, Bx(.3, .26, .22), MC(0x4a3a2a, .9), -.12, .69, .4); // backpack on the passenger seat
  P3(g, Bx(.025, .07, .22), plastic, .66, 1.45, 0); P3(g, Bx(.01, .055, .2), chrome, .645, 1.45, 0);
  P3(g, Bx(2.0, .04, 1.7), rub, -.1, .34, 0);
  const pc = document.createElement('canvas'); pc.width = 128; pc.height = 224; const ptex = new T.CanvasTexture(pc);
  const phone = P3(g, Bx(.012, .14, .075), new T.MeshBasicMaterial({ map: ptex }), .5, 1.1, -.08); phone.rotation.z = -.3; phone.layers.enable(2); P3(g, Bx(.03, .03, .05), plastic, .53, 1.04, -.08);
  // lights
  const heads = []; for (const s of [-1, 1]) { const L = new T.SpotLight(0xfff0d0, 3.2, 34, .42, .5, 1.2), tg = new T.Object3D(); L.position.set(2.72, .66, s * .7); tg.position.set(12, -.6, s * .9); g.add(L); g.add(tg); L.target = tg; heads.push(L) }
  const dash = new T.PointLight(0x7aa8ff, .5, 1.6, 2); dash.position.set(.3, 1.08, -.2); g.add(dash);
  g.traverse(o => o.userData.dyn = 1); scene.add(g); g.userData = { heads, tm, dash, ptex, pc, phone, dyn: 1, door: g.userData.door }; return g
}
function drawPhone(state) { const c = INTRO.car.userData.pc, x = c.getContext('2d'); x.fillStyle = '#0a0e14'; x.fillRect(0, 0, 128, 224);
  x.fillStyle = '#cfd8e0'; x.font = '12px sans-serif'; x.textAlign = 'center'; x.fillText('23:58', 64, 18);
  if (state) { x.fillStyle = state === 'ring' ? '#3ad06a' : state === 'call' ? '#2a8aff' : '#666'; x.beginPath(); x.arc(64, 90, 30, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 15px sans-serif'; x.fillText('RICHARD', 64, 150); x.font = '11px sans-serif'; x.fillText(state === 'ring' ? 'incoming call' : state === 'call' ? 'on call' : 'call ended', 64, 168) }
  INTRO.car.userData.ptex.needsUpdate = true }
function engineOn() { if (!AC) return; const o = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 260; g.gain.value = 0;
  o.connect(f); o2.connect(f); f.connect(g); g.connect(SFX); o.start(); o2.start(); g.gain.linearRampToValueAtTime(.16, AC.currentTime + .6); INTRO.eng = { o, o2, g, f } }
function engineSet(rpm) { const e = INTRO.eng; if (!e) return; const t = AC.currentTime; e.o.frequency.setTargetAtTime(28 + rpm * 40, t, .2); e.o2.frequency.setTargetAtTime(14 + rpm * 20, t, .2); e.f.frequency.setTargetAtTime(180 + rpm * 300, t, .2) }
function engineOff() { const e = INTRO.eng; if (!e) return; const t = AC.currentTime; e.g.gain.setTargetAtTime(0, t, .25); e.o.stop(t + 1.5); e.o2.stop(t + 1.5); INTRO.eng = null; burst(300, 120, .25, .25, 'lowpass', 1); tone(1200, .04, 'square', .05, .4) }
function ringOnce() { // North-American ring cadence (440 + 480 Hz), as heard through a car speaker
  for (const f of [440, 480]) tone(f, 1.6, 'sine', .07); tone(880, .05, 'square', .02) }
function phoneVoice(sec, who) { if (!AC) return; // the employer is only a muffled voice in the phone; the player's own lines are silent (subtitled)
  if (who !== 'ริชาร์ด') return; const t0 = AC.currentTime, s = AC.createBufferSource(); s.buffer = NOISEBUF; s.loop = true; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 3; const g = AC.createGain(); g.gain.value = 0;
  s.connect(bp); bp.connect(g); g.connect(SFX); s.start(t0); for (let t = 0; t < sec - .3; t += .11) { const on = Math.random() < .78 ? .05 + Math.random() * .06 : 0; g.gain.setTargetAtTime(on, t0 + t, .03); bp.frequency.setTargetAtTime(600 + Math.random() * 900, t0 + t, .05) } g.gain.setTargetAtTime(0, t0 + sec - .3, .05); s.stop(t0 + sec) }
function callUI(html) { const el = $('#call'); if (!html) { el.style.display = 'none'; return } el.innerHTML = html; el.style.display = 'block' }
function startIntro() {
  if (!INTRO.car) INTRO.car = playerCar(); NARR.forEach(n => n.done = 0); Object.assign(INTRO, { arm: 0, view: 'pov', reach: undefined, answering: 0, inHand: 0, dipT: 0, swap: null, passT: 0, camInit: 0, t3: 0, shut: 0, beep: 0, t: 0, phase: 0, ring: 0, answered: 0, line: -1, lineT: 0, skipHold: 0, done: 0, lookX: 0, lookY: 0 });
  S.mode = 'intro'; S.intro = 1; $('#hud').style.display = 'none'; $('#cr').style.display = 'none'; $('#skip').style.display = 'block'; $('#skip').innerHTML = 'กด <b>Space</b> ค้างไว้เพื่อข้าม<i></i>';
  if (INTRO.car.userData.col) INTRO.car.userData.col.off = 1; INTRO.car.visible = true; INTRO.car.userData.heads.forEach(h => h.intensity = 3.2); engineOn(); sub('');
  $('#fade').style.transition = 'none'; $('#fade').style.opacity = 1; setTimeout(() => { $('#fade').style.transition = 'opacity 2s'; $('#fade').style.opacity = 0 }, 50);
  
}
const DRIVE = 24;
/* inner monologue while driving: who he is, what the job is, why he is here */
const NARR = [[1.4, 'อีกไม่กี่บล็อกก็ถึงแล้ว... เมเปิลฮอลโลว์ เงียบกว่าที่คิดแฮะ', 3.6], [5.4, 'งานผมคือนั่งไล่ตรวจบัญชีออนไลน์ หาว่าใครปลอมตัว ใครหลอกใคร', 3.8],
  [9.6, 'ปกติก็ทำจากห้องเช่าตัวเองนั่นแหละ แต่คืนนี้หัวหน้าส่งมาทำที่บ้านลูกค้า', 3.9], [13.9, 'ริชาร์ด... เจ้าของบ้าน ต้องบินไปต่างเมืองคืนนี้ เลยอยากให้มีคนอยู่บ้านด้วย', 4.0],
  [18.3, 'ได้ที่เงียบ ๆ ทำงานกับค่าจ้างสองเท่า... ก็ไม่เลวนะ', 3.2], [21.8, 'หลังที่เปิดไฟหน้าบ้านไว้... 1407 นั่นไง', 2.8]];
const SHOT_CUTS = [8, 16];   // shot changes happen through a short dip to black, never a hard cut
function carPose(t) { const u = Math.min(1, t / DRIVE), e = 1 - Math.pow(1 - u, 1.7); const x = 64 - (64 - PARK.x) * e, z = 19.0 - Math.max(0, (u - .8) / .2) * (19.0 - PARK.z); return [x, z, u] }
const ss = (a, b, t) => { const k = cl((t - a) / (b - a), 0, 1); return k * k * (3 - 2 * k) };
/* right-arm phone animation: k 0 = hands on wheel, 1 = hand on the phone in its mount, 2 = phone at the ear */
function armPhone(k) { const J = AV.J; if (!J) return; const a = Math.min(1, k), b = Math.max(0, k - 1), L = (x, y, t) => x + (y - x) * t;
  J.shR.rotation.x = L(L(-1.05, -1.3, a), -1.85, b); J.shR.rotation.z = L(L(-.25, .05, a), .62, b); J.elR.rotation.x = L(L(-.55, -.15, a), -2.35, b); J.elR.rotation.z = L(0, .2, b) }
function phoneToHand(on) { const c = INTRO.car, ph = c.userData.phone; if (!ph || !AV.J) return; if (on) { AV.J.handR.add(ph); ph.position.set(0, -.07, .035); ph.rotation.set(0, Math.PI / 2, .2) } else { c.add(ph); ph.position.set(.5, 1.1, -.08); ph.rotation.set(0, 0, -.3) } }
function introTick(dt) {
  const I = INTRO, c = I.car; I.t += dt; const [x, z, u] = carPose(I.t); c.position.set(x, 0, z); c.rotation.y = Math.PI + (u > .8 && u < 1 ? Math.sin((u - .8) / .2 * Math.PI) * -.06 : 0); c.updateMatrixWorld(true); // cameras attached to the car must use this frame's pose
  if (I.eng) engineSet(u < 1 ? 1.4 * (1 - u) + .3 : .2);
  // skip (hold Space)
  if (keys.Space && I.phase < 4) { I.skipHold += dt; if (I.skipHold > 1.1) { finishIntro(true); return } } else I.skipHold = Math.max(0, I.skipHold - dt * 2);
  $('#skip i').style.width = (I.skipHold / 1.1 * 100) + '%';
  if (AV.root && I.phase < 5) { const a = vtmp.set(-.2, .07, -.4).applyMatrix4(c.matrixWorld); AV.root.position.copy(a); AV.root.scale.setScalar(.78); /* seated in the car: a touch smaller so head and feet stay inside the cabin */ AV.root.rotation.y = c.rotation.y + Math.PI / 2; AV.root.visible = true; avPose('drive', 0, dt);
    armPhone(I.arm || 0); AV.J.head.visible = I.view !== 'pov' } // the driver: us
  if (I.phase === 6) { exitShot(dt); return }
  cam.layers.enable(2); let dip = 0;
  if (I.phase === 0) { // the drive: in-car POV -> tracking shot along the pavement -> wide crane as he pulls up
    for (const n of NARR) if (!n.done && I.t >= n[0]) { n.done = 1; subLine('คุณ (ในใจ)', n[1], n[2]) }
    for (const b of SHOT_CUTS) dip = Math.max(dip, 1 - Math.abs(I.t - b) / .45);
    if (I.t < SHOT_CUTS[0]) { I.view = 'pov'; const e = vtmp.set(-.08, 1.36, -.38).applyMatrix4(c.matrixWorld); cam.position.copy(e); cam.rotation.set(-.06 + Math.sin(I.t * 1.3) * .006, Math.PI / 2 - .05 + Math.sin(I.t * .4) * .04, 0, 'YXZ'); cam.fov = 62 }
    else if (I.t < SHOT_CUTS[1]) { I.view = 'side'; const k = (I.t - SHOT_CUTS[0]) / (SHOT_CUTS[1] - SHOT_CUTS[0]); const tgt = vtmp.set(x - 1.2 - k * 1.2, 1.5, z - 5.6 + k * .8); cam.position.lerp(tgt, I.camInit ? Math.min(1, dt * 3) : 1); I.camInit = 1; cam.lookAt(x - 1.2, .95, z); cam.fov = 50 }
    else { I.view = 'wide'; const k = ss(SHOT_CUTS[1], DRIVE + 1, I.t); cam.position.set(-7 + k * 3.2, 3.4 - k * 1.8, 26.5 - k * 2.6); cam.lookAt(x - .5 + k * .2, .9 + k * .3, z - .8 - k * 1.5); cam.fov = 52 }
    dip = Math.max(dip, 1 - I.t / 1.6); cam.updateProjectionMatrix(); $('#fade').style.transition = 'none'; $('#fade').style.opacity = dip;
    if (I.t >= DRIVE + 1.2) { I.phase = 1; engineOff(); c.userData.heads.forEach(h => h.intensity = 0); I.t2 = 0; I.dipT = .8; I.swap = 'spy1'; drawPhone(null) } /* arrival: someone across the street is watching */
    return }
  // parked. POV from the driver's seat, except during the call: a slow push-in from the passenger seat on us holding the phone
  I.t2 += dt; if (I.dipT > 0) { I.dipT -= dt; dip = Math.min(1, 1 - Math.abs(I.dipT - .4) / .4); if (I.dipT <= .4 && I.swap) { I.view = I.swap; I.swap = null } } if (I.phase < 5) { $('#fade').style.transition = 'none'; $('#fade').style.opacity = Math.max(0, dip) }
  if (I.reach !== undefined && I.reach < 1.6) { I.reach += dt; I.arm = I.answering ? cl(I.reach / .7, 0, 1) + cl((I.reach - .8) / .7, 0, 1) : 2 - cl(I.reach / .7, 0, 1) - cl((I.reach - .8) / .7, 0, 1); if (I.answering && I.reach > .7 && !I.inHand) { I.inHand = 1; phoneToHand(true) } if (!I.answering && I.reach > .8 && I.inHand) { I.inHand = 0; phoneToHand(false) }
    if (I.answering && I.reach >= 1.6) { I.dipT = .8; I.swap = 'pass' } if (!I.answering && I.reach >= 1.6) { I.dipT = .8; I.swap = 'pov' } }
  if (I.phase === 1 && I.view === 'spy1' && I.t2 > SPY1 && !I.swap) { I.dipT = .8; I.swap = 'pov' }
  if (I.phase === 3 && I.view === 'pass' && !I.spied && (I.callT = (I.callT || 0) + dt) > 4.5 && !I.swap) { I.spied = 1; I.dipT = .8; I.swap = 'spy2' } /* mid-call: cut to the watcher behind the tree */
  if (I.phase >= 5) { spyOverlay(null); return } /* leaving the intro: never re-arm the voyeur overlay */
  spyOverlay(I.view); if (I.view === 'spy1' || I.view === 'spy2') spyCam(I.view, c);
  else if (I.view === 'pass') { const k = Math.min(1, (I.t2 - (I.passT || (I.passT = I.t2))) / 30); const e = vtmp.set(.05 - k * .12, 1.24, .5 - k * .1).applyMatrix4(c.matrixWorld); cam.position.copy(e); const h = new T.Vector3(-.12, 1.32, -.4).applyMatrix4(c.matrixWorld); cam.lookAt(h); if (cam.fov !== 48) { cam.fov = 48; cam.updateProjectionMatrix() } }
  else { I.view = 'pov'; const seat = vtmp.set(-.08, 1.36, -.38).applyMatrix4(c.matrixWorld); cam.position.copy(seat); const look = I.reach !== undefined && I.reach < 1.6 && I.answering ? Math.sin(Math.min(1, I.reach / 1.2) * Math.PI) : 0;
    cam.rotation.set(-.2 + I.lookY - look * .25, Math.PI / 2 - .45 + I.lookX - look * .5, 0, 'YXZ'); if (cam.fov !== 62) { cam.fov = 62; cam.updateProjectionMatrix() } }
  if (I.phase === 1) { if (!I.chatDone) { if (I.t2 > SPY1 + 1.4) chatTick(dt); return } if (I.t2 > 1.0) { I.phase = 2; I.ringT = 0; drawPhone('ring'); callUI('<div class="cn">ริชาร์ด (ผู้ว่าจ้าง)</div><div class="cs">สายเรียกเข้า…</div><div class="ck">[E] รับสาย</div>') } return }
  if (I.phase === 2) { I.ringT -= dt; if (I.ringT <= 0) { ringOnce(); I.ringT = 3; I.ring++ } if (I.ring > 4) answerCall(); return }
  if (I.phase === 3) { if (I.reach < 1.6) return; I.lineT -= dt; if (I.lineT <= 0) { I.line++; if (I.line >= CALL.length) { I.phase = 4; drawPhone('end'); tone(480, .25, 'sine', .06); tone(620, .25, 'sine', .06, .3); I.reach = 0; I.answering = 0; callUI('<div class="cn">ริชาร์ด</div><div class="cs">วางสายแล้ว · 0:' + String(Math.round(CALL.reduce((a, l) => a + l[2], 0))).padStart(2, '0') + '</div>'); setTimeout(() => { callUI(null); if (S.mode === 'intro') { sub(''); $('#hint').textContent = '[E] ลงจากรถ'; $('#hint').style.display = 'block' } }, 2000); sub(''); return }
      const [who, txt, sec] = CALL[I.line]; I.lineT = sec; phoneVoice(sec, who); subLine(who, txt, sec) } }
}
function answerCall() { if (INTRO.phase !== 2) return; INTRO.phase = 3; S.st = 'EMPLOYER_CALL'; INTRO.lineT = 1.0; INTRO.reach = 0; INTRO.answering = 1; INTRO.inHand = 0; drawPhone('call'); tone(900, .06, 'sine', .05); callUI('<div class="cn">ริชาร์ด (ผู้ว่าจ้าง)</div><div class="cs">กำลังสนทนา</div>') }
function introKey(e) { if (INTRO.phase === 1 && INTRO.chat && /^Digit[12]$/.test(e.code)) { chatPick(+e.code.slice(5)); return } if (e.code !== 'KeyE' && e.code !== 'Enter') return; if (INTRO.phase === 2) answerCall(); else if (INTRO.phase === 4) finishIntro(false) }
function introLook(e) { if (S.mode !== 'intro' || INTRO.phase < 1) return; if (locked || S.noLock) { const k = .0006 * OPT.sens; INTRO.lookX = cl(INTRO.lookX - e.movementX * k, -1.4, 1.1); INTRO.lookY = cl(INTRO.lookY - e.movementY * k, -.5, .4) } }
addEventListener('mousemove', introLook);
function parkCar() { const c = INTRO.car || (INTRO.car = playerCar()); c.position.set(PARK.x, 0, PARK.z); c.rotation.y = Math.PI; c.userData.heads.forEach(h => h.intensity = 0); if (!c.userData.col) { col(PARK.x - 2.75, PARK.x + 2.75, PARK.z - 1.0, PARK.z + 1.0, 0, 1); c.userData.col = COL[COL.length - 1] } c.userData.col.off = 0 }
/* third-person exit: we see ourselves get out, shut the door and walk round the front of the car towards the gate */
const EXITP = [[PARK.x + .1, PARK.z + 1.25], [PARK.x - 1.4, PARK.z + 1.2], [PARK.x - 2.6, PARK.z + .9], [PARK.x - 2.75, PARK.z + .7]];
function exitShot(dt) { const I = INTRO; I.t3 += dt; const c = INTRO.car, dr = c && c.userData.door, OUT = 1.7, op = I.t3 < 1.75 ? Math.min(1, I.t3 / .5) : Math.max(0, 1 - (I.t3 - 1.75) / .35); if (dr) dr.rotation.y = -1.05 * (op * op * (3 - 2 * op));
  if (I.t3 < OUT) { /* getting out: from the seat, swivel towards the open door, plant the feet, stand up beside the car */ const k = Math.min(1, I.t3 / OUT), e = k * k * (3 - 2 * k), seat = vtmp.set(-.2, .07, -.4).applyMatrix4(c.matrixWorld), sx = seat.x, sz = seat.z, ox = EXITP[0][0], oz = EXITP[0][1];
    AV.root.visible = true; AV.J.head.visible = true; AV.root.scale.setScalar(.78 + .22 * e); AV.root.position.set(sx + (ox - sx) * e, seat.y * (1 - e), sz + (oz - sz) * e); AV.root.rotation.y = c.rotation.y + Math.PI / 2 + (-Math.PI / 2) * Math.min(1, k * 1.6);
    avPose(k < .55 ? 'drive' : 'stand', 0, dt); if (k >= .55) { const r = (k - .55) / .45; AV.J.hips.position.y = .8 + .15 * r; AV.J.hipL.rotation.x = AV.J.hipR.rotation.x = -1.2 * (1 - r); AV.J.knL.rotation.x = AV.J.knR.rotation.x = 1.6 * (1 - r); AV.J.spine.rotation.x = .35 * (1 - r) }
    cam.layers.enable(2); cam.position.set(PARK.x + 3.4, 1.65, PARK.z + 4.4); cam.lookAt(AV.root.position.x - .2, 1.0, AV.root.position.z - .4); if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix() } return }
  const T3 = 3.8, t3w = I.t3 - OUT, u = Math.min(1, t3w / T3), seg = u * (EXITP.length - 1), k = Math.min(EXITP.length - 2, Math.floor(seg)), f = seg - k, a = EXITP[k], b = EXITP[k + 1];
  const x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f; AV.root.visible = true; AV.J.head.visible = true; AV.root.scale.setScalar(1); AV.root.position.set(x, 0, z); AV.root.rotation.y = u < 1 ? Math.atan2(b[0] - a[0], b[1] - a[1]) : Math.atan2(3.7 - x, 15 - z); avPose(u < 1 ? 'stand' : 'stand', u < 1 ? 1.3 : 0, dt);
  if (!I.shut && I.t3 > 2.0) { I.shut = 1; tone(140, .1, 'square', .07); burst(700, 200, .15, .15, 'bandpass', 2) } if (!I.beep && I.t3 > 2.9) { I.beep = 1; tone(1500, .06, 'square', .04); tone(1500, .06, 'square', .04, .12); c_lights(INTRO.car, 1) }
  cam.layers.enable(2); cam.position.set(PARK.x + 3.4, 1.65, PARK.z + 4.4); cam.lookAt(x - .4, 1.1, z - .6); if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix() } if (t3w > T3 + .7) enterPlay() }
function c_lights(c, on) { c.userData.tm.color.setHex(on ? 0xffa020 : 0xff2a1a); setTimeout(() => c.userData.tm.color.setHex(0xff2a1a), 450) } // lock flash
function finishIntro(skipped) { const I = INTRO; if (I.done) return; I.done = 1; spyOverlay(null); I.view = 'pov'; I.swap = null; if (!I.chatDone) chatSkipAll(); if (I.eng) engineOff(); callUI(null); $('#skip').style.display = 'none'; $('#hint').style.display = 'none'; sub('');
  if (!skipped) { I.phase = 6; I.t3 = 0; I.shut = 0; I.beep = 0; parkCar(); tone(160, .12, 'square', .06); burst(900, 300, .12, .12, 'bandpass', 2, null, .1); return } // door opens -> exit shot
  I.phase = 5; enterPlay(true) }
function enterPlay(skipped) { const I = INTRO; if (I.phase === 7) return; I.phase = 7;
  if (skipped && I.t < DRIVE) { burst(400, 150, .3, .2, 'lowpass', 1) } if (AV.J) { AV.J.head.visible = true; if (I.inHand) { I.inHand = 0; phoneToHand(false) } }
  const f = $('#fade'); f.style.transition = 'opacity .45s'; f.style.opacity = 1; tone(160, .12, 'square', .06, .2); burst(900, 300, .12, .12, 'bandpass', 2, null, .25); // door
  setTimeout(() => { parkCar(); drawPhone(null);
    P = { x: PARK.x - 2.75, z: PARK.z + .7, yaw: -.75, pitch: -.04 }; PY = 0; S.mode = 'play'; S.intro = 0; cam.layers.disable(2); $('#hud').style.display = 'block';
    tone(140, .1, 'square', .07); burst(700, 200, .15, .15, 'bandpass', 2); // door shut
    storyBegin(); f.style.transition = 'opacity 1.2s'; f.style.opacity = 0; if (!locked) lock() }, 520)
}
function subLine(who, txt, sec) { const e = $('#sub'); clearTimeout(sub.t); e.innerHTML = ''; const b = document.createElement('b'); b.style.color = who.startsWith('คุณ') ? '#a8c8e8' : '#f0c870'; if (who.includes('ในใจ')) e.style.fontStyle = 'italic'; else e.style.fontStyle = ''; b.textContent = who + ': '; e.append(b, document.createTextNode(txt)); e.style.display = 'block'; sub.t = setTimeout(() => e.style.display = 'none', sec * 1000 - 150) }

/* ---------- parked, before Richard calls: texting Mom and Jake (2-3 exchanges each; the player picks the replies with 1/2) ----------
   Natural chatter that tells who you are (a night-shift freelancer for Halden Security, close to your mom, a friend who teases you)
   and why you're here (one well-paid night working on Richard's computer). The messages stay in the phone's history. */
const CHAT_SEQ = [
  ['mom', [['ถึงหรือยังลูก ดึกแล้วนะ', [['ถึงแล้วครับ', 'เพิ่งถึงครับแม่ จอดหน้าบ้านลูกค้าแล้ว'], ['ใกล้ถึงแล้ว', 'อีกนิดเดียวครับ กำลังหาบ้านเลขที่']]],
    ['งานเฝ้าบ้านอีกแล้วเหรอ ทำงานกลางวันแล้วยังรับกะดึกอีก ไม่เหนื่อยเหรอ', [['ค่าจ้างดีครับ', 'คืนนี้ค่าจ้างดีครับแม่ แค่นั่งตรวจข้อมูลในคอมให้บริษัททั้งคืน'], ['ไม่เหนื่อยครับ', 'ไม่เหนื่อยหรอกครับ งานแค่นั่งหน้าคอม เจ้าของบ้านไม่อยู่']]],
    ['โอเคจ้ะ ล็อกประตูดี ๆ นะ เช้าแล้วโทรหาแม่ด้วย ❤️', null]]],
  ['jake', [['เฮ้ ตกลงไปจริงเหรอ งานที่มาร์ธาแนะนำน่ะ', [['ไปแล้ว', 'ถึงแล้ว บ้านใหญ่ใช้ได้ เจ้าของบินไปชิคาโก'], ['ไปสิ', 'ไปสิ คืนเดียวได้เท่าค่าเช่าครึ่งเดือนเลยนะเว้ย']]],
    ['เจ๋ง แต่อยู่บ้านคนอื่นคนเดียวทั้งคืนเนี่ยนะ ข้าไม่เอาด้วยหรอก 555', [['ขี้ขลาด', 'ขี้ขลาดจริง ๆ มีอะไรเดี๋ยวทักไป'], ['ไม่มีอะไรหรอก', 'ไม่มีอะไรหรอก แค่นั่งทำงานในคอมของเขา']]],
    ['โอเค ถ้าเจอผีถ่ายรูปมาด้วย 👻', null]]]];
function chatBegin() { phoneInit(); delete PH.replies.mom; S.unread.mom = 0; INTRO.chat = { th: 0, ln: 0, wait: .4, picking: 0 }; PH.thread = CHAT_SEQ[0][0]; $('#phone').style.display = 'flex'; phoneDraw() }
function chatTick(dt) { const I = INTRO; if (!I.chat) chatBegin(); const c = I.chat; if (c.picking) { c.auto = (c.auto || 0) + dt; if (c.auto > 14) chatPick(1); return }
  c.wait -= dt; if (c.wait > 0) return; const [th, lines] = CHAT_SEQ[c.th], L = lines[c.ln];
  if (!L) { c.th++; c.ln = 0; c.wait = .8; if (c.th >= CHAT_SEQ.length) { $('#phone').style.display = 'none'; PH.thread = null; I.chatDone = 1; I.t2 = 0; return } PH.thread = CHAT_SEQ[c.th][0]; phoneDraw(); return }
  S.msgs[th].push({ from: 'them', t: L[0], time: '23:5' + (7 + c.th) }); tone(1320, .05, 'sine', .05); burst(160, 90, .25, .1, 'lowpass', 1);
  if (L[1]) { PH.replies[th] = L[1].map(r => [r[0], r[1]]); c.picking = 1; c.auto = 0 } else { c.ln++; c.wait = 2.2 } phoneDraw() }
function chatPick(n) { const c = INTRO.chat; if (!c || !c.picking) return; const [th, lines] = CHAT_SEQ[c.th], r = lines[c.ln][1][n - 1]; if (!r) return;
  S.msgs[th].push({ from: 'me', t: r[1], time: '23:5' + (7 + c.th) }); delete PH.replies[th]; c.picking = 0; c.ln++; c.wait = 1.6; tone(1100, .04, 'sine', .04); phoneDraw() }
function chatSkipAll() { const c = INTRO.chat || (chatBegin(), INTRO.chat); while (c.th < CHAT_SEQ.length) { if (c.picking) chatPick(1); const [th, lines] = CHAT_SEQ[c.th], L = lines[c.ln]; if (!L) { c.th++; c.ln = 0; continue } S.msgs[th].push({ from: 'them', t: L[0], time: '23:5' + (7 + c.th) }); if (L[1]) { PH.replies[th] = L[1]; c.picking = 1 } else c.ln++ } $('#phone').style.display = 'none'; PH.thread = null; INTRO.chatDone = 1 }

/* ---------- voyeur shots: handheld, slightly unsteady, from where the intruder watches ----------
   spy1: arrival, from an upstairs window of the house opposite Richard's (curtain edge + window frame in the foreground)
   spy2: during the call, peeking from behind a tree trunk across the street. The player's body (layer 2) is visible in both. */
const SPY1 = 5.5;
function spyOverlay(v) { let o = document.getElementById('spy'); if (!o) { o = document.createElement('div'); o.id = 'spy'; document.body.appendChild(o) } const cls = v === 'spy1' ? 'win' : v === 'spy2' ? 'tree' : ''; if (o.className !== cls) o.className = cls;
  if (cls && INTRO.mask === undefined) { INTRO.mask = cam.layers.mask; cam.layers.enable(2) } else if (!cls && INTRO.mask !== undefined) { cam.layers.mask = INTRO.mask; INTRO.mask = undefined } }
function spyCam(v, c) { const t = INTRO.t2, n = (a, b, d, o = 0) => Math.sin(t * a + o) * .6 + Math.sin(t * b + 1.3 + o) * .3 + Math.sin(t * d + 2.1 + o) * .1; // layered sines = hand tremor + breathing sway
  const look = vtmp.set(0, 1.15, 0).applyMatrix4(c.matrixWorld);
  if (v === 'spy1') { cam.position.set(4.3 + n(.6, 1.7, 4.1) * .03, 4.05 + n(.8, 2.1, 5.3, 1) * .025, 26.86); cam.fov = 30 - Math.min(1, t / SPY1) * 5 } // slow push-in, like zooming a phone camera
  else { const lean = Math.min(1, Math.max(0, (t - (INTRO.leanT || (INTRO.leanT = t))) / 3)) * .08; cam.position.set(.3 - lean + n(.7, 1.9, 4.7) * .035, 1.5 + n(.9, 2.4, 6.1, 2) * .03, 25.95); cam.fov = 40 }
  cam.lookAt(look.x + n(.45, 1.3, 3.7, 3) * .09, look.y + n(.5, 1.6, 4.4, 4) * .06, look.z); cam.rotateZ(n(.35, 1.1, 2.9, 5) * .018); cam.updateProjectionMatrix() }
