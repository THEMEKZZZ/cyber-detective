/* ---------- UI helpers ---------- */
function sub(t) { const e = $('#sub'); e.textContent = t; e.style.display = t ? 'block' : 'none'; clearTimeout(sub.t); if (t) sub.t = setTimeout(() => e.style.display = 'none', 4800) }
const fmt = () => { const m = 23 * 60 + 58 + Math.floor(S.t / 12), h = Math.floor(m / 60) % 24, mm = m % 60; return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0') };
const L = k => ({ 'ai.seen': 'เขาเห็นคุณแล้ว! หนีไป!' })[k] || k;
const plLevel = () => PY > 1.6 ? 1 : 0;
/* ---------- input ---------- */
const keys = {}; let near = null;
addEventListener('keydown', e => {
  keys[e.code] = 1; if (S.mode === 'menu') { menuKey(e); return } if (S.mode === 'intro') { if (e.code === 'Space') e.preventDefault(); introKey(e); return } if (S.mode !== 'play') return;
  if (e.code === 'Space' || e.code === 'Tab') e.preventDefault(); if (S.ui === 'phone') { e.preventDefault(); phoneKey(e); return } if (e.code === 'KeyP' && !S.ui && !(S.pc && D.inp) && !S.paused && S.mode === 'play') { phoneOpen(); return } // the phone also works while seated at the computer
  if (S.ui) { if (e.code === 'Escape' && S.ui === 'wire') $('#wx').click(); if (S.ui === 'note' && (e.code === 'KeyE' || e.code === 'Escape' || e.code === 'Space')) closeNote(); if (S.ui === 'insp' && (e.code === 'KeyE' || e.code === 'Escape' || e.code === 'Space')) closeInspect(); return }
  if (S.pc) { pcKey(e); return }
  if (S.hidden) { if (e.code === 'KeyE') exitHide(); return } if (S.seated) { if (e.code === 'Space') { e.preventDefault(); eatStand() } return }
  if (e.code === 'KeyE' && !S.paused && near) near.act();
  if (e.code === 'KeyR' && !S.paused && near && near.door) lockToggle(near.door);
  if (e.code === 'KeyF' && !S.paused) { S.flash = !S.flash; tone(1400, .03, 'square', .1); noise(P.x, P.z, plLevel(), .15) }
  if (e.code === 'Escape' && S.noLock) pause(!S.paused);
});
addEventListener('keyup', e => keys[e.code] = 0);
function pcKey(e) {
  if (D.inp && S.pcView === 1) { const k = D.inp; if (e.key === 'Enter') { if (k === 'ip') runTrace(); else D.inp = null } else if (e.key === 'Backspace') D[k] = (D[k] || '').slice(0, -1); else if (e.key.length === 1 && (D[k] || '').length < 30) D[k] = (D[k] || '') + e.key; else if (e.key === 'Escape' || e.key === 'Tab') D.inp = null; e.preventDefault(); D.dirty = 1; drawDesk(); if (e.key !== 'Tab') return }
  if (e.code === 'Tab') { e.preventDefault(); S.pcView = S.pcView === 1 ? 2 : 1 }
  else if (e.code === 'Escape') { exitPC() } // Esc always stands up (same result whether or not the browser also drops pointer lock)
  else if (e.code === 'KeyQ' || e.code === 'Backspace') { if (S.pcView) S.pcView = 0; else exitPC() }
  else if (S.pcView === 2 && /^Digit[0-9]$/.test(e.code)) { const n = +e.code.slice(5), i = n === 0 ? 9 : n - 1; if (camList().includes(i)) camSel(i) }
}
/* virtual cursor in seated mode: pointer lock stays engaged, so leaving the computer never strands the mouse */
const VC = { x: 0, y: 0 }, rc = new T.Raycaster(), mv = new T.Vector2();
addEventListener('mousemove', e => {
  if (S.mode !== 'play' || S.ui) return;
  if (S.pc) { if (locked) { VC.x = cl(VC.x + e.movementX / innerWidth * 2 * (.5 + OPT.sens / 10), -1, 1); VC.y = cl(VC.y - e.movementY / innerHeight * 2 * (.5 + OPT.sens / 10), -1, 1) } else { VC.x = e.clientX / innerWidth * 2 - 1; VC.y = -(e.clientY / innerHeight) * 2 + 1 } return }
  if (S.paused) return; if (locked || S.noLock) { const k = .0006 * OPT.sens;
    if (S.hidden) { P.yawH = cl((P.yawH || 0) - e.movementX * k * .6, S.hideSpot === 'bed' ? -.95 : -.4, S.hideSpot === 'bed' ? .95 : .4); P.pitchH = cl((P.pitchH || 0) - e.movementY * k * .6, -.3, .25) } else { P.yaw -= e.movementX * k; P.pitch = cl(P.pitch - e.movementY * k, -1.35, 1.35) } }
});
function screenHit() { mv.set(VC.x, VC.y); rc.setFromCamera(mv, cam); const h = rc.intersectObjects([scMain, scCam])[0]; if (!h || !h.uv) return null; return { which: h.object === scMain ? 1 : 2, u: h.uv.x, v: 1 - h.uv.y } }
function pcPointer() { const h = screenHit(); D.over = h ? h.which : 0; if (h && h.which === 1) { const nx = h.u * 800, ny = h.v * 600; if (Math.abs(nx - D.cx) + Math.abs(ny - D.cy) > .5) D.dirty = 1; D.cx = nx; D.cy = ny } if (!h !== !D.lastOver) D.dirty = 1; D.lastOver = h ? h.which : 0; if (h && h.which === 2) { D.cx2 = h.u * 512; D.cy2 = h.v * 384 } const c = $('#vc'); c.style.display = h ? 'none' : 'block'; c.style.left = (VC.x + 1) / 2 * innerWidth + 'px'; c.style.top = (1 - VC.y) / 2 * innerHeight + 'px'; return h }
addEventListener('mouseup', () => { D.mdown = 0 });
addEventListener('mousedown', e => {
  if (S.mode !== 'play' || S.ui) return; if (!S.pc) { if (!locked && !S.noLock && !S.paused) lock(); return } if (e.button === 0) D.mdown = 1;
  if (e.button === 2) { if (S.pcView) S.pcView = 0; else exitPC(); return }
  const h = pcPointer(); if (!h) { if (S.pcView) S.pcView = 0; return }
  if (S.pcView !== h.which) { S.pcView = h.which; tone(900, .03, 'square', .06); return }
  const Lh = h.which === 1 ? HR : CHR, x = h.which === 1 ? D.cx : D.cx2, y = h.which === 1 ? D.cy : D.cy2; let hit = 0;
  for (let i = Lh.length - 1; i >= 0; i--) { const r = Lh[i]; if (x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3]) { hit = 1; r[4](); tone(1200, .03, 'square', .08); break } }
  if (h.which === 1 && !hit) D.inp = null; D.dirty = 1; drawDesk(); drawOV(performance.now());
});
addEventListener('contextmenu', e => e.preventDefault());
let lockFails = 0; const canLock = 'requestPointerLock' in HTMLCanvasElement.prototype;
function lock() { if (!canLock) { S.noLock = true; return } try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(lockErr) } catch (e) { lockErr() } }
function lockErr() { lockFails++; if (lockFails >= 3) { S.noLock = true; pause(false); sub('เบราว์เซอร์ไม่อนุญาตให้ล็อกเมาส์ ขยับเมาส์เพื่อมองรอบ ๆ ได้เลย') } else if (S.mode === 'play') { pause(true); $('#pause .sub').textContent = 'คลิกอีกครั้งเพื่อเล่นต่อ' } }
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === cv; for (const k in keys) keys[k] = 0; VX = VZ = 0;
  if (locked) { lockFails = 0; S.noLock = false; pause(false); $('#pause .sub').textContent = 'คลิกเพื่อเล่นต่อ' } else if (S.mode === 'play' && !S.noLock && !S.ended && !S.ui) { if (S.pc) exitPC(); pause(true) } }); // Esc at the computer = stand up
document.addEventListener('pointerlockerror', lockErr); // transient refusal (e.g. clicking within ~1 s of Esc) no longer flips the game into drag-to-look mode
function pause(v) { S.paused = v; $('#pause').style.display = v ? 'flex' : 'none' }
/* ---------- seated computer mode ---------- */
const SEAT = { pos: new T.Vector3(), look: new T.Vector3(), fov: 52 };
function seatTarget() { const v = S.pcView || 0; if (v === 0) return [[DX, DY + 1.2, MZ + .9], [DX, DY + 1.05, MZ], 50]; const m = v === 1 ? MON.main : MON.cctv, cx = m.x + Math.sin(m.ry) * .092, cz = MZ + Math.cos(m.ry) * .092, d = v === 1 ? .5 : .54; return [[cx + Math.sin(m.ry) * d, DY + 1.07, cz + Math.cos(m.ry) * d], [cx, DY + 1.07, cz], 42] }
function enterPC() { S.prePC = { x: P.x, z: P.z, yaw: P.yaw, pitch: P.pitch }; for (const k in keys) keys[k] = 0; S.pc = true; S.pcView = 0; VC.x = 0; VC.y = -.1; const [p_, l_] = seatTarget(); SEAT.pos.set(...p_); SEAT.look.set(...l_); sub(''); D.inp = null; drawDesk(); setRS(Math.max(OPT.res, .8)) }
function exitPC() { if (!S.pc) return; S.pc = false; S.pcView = 0; D.inp = null; const q = S.prePC; if (q && !hit(q.x, q.z) && Math.hypot(q.x - DX, q.z - 7.6) < 2.5) { P.x = q.x; P.z = q.z; P.yaw = q.yaw; P.pitch = cl(q.pitch, -.5, .5) } else { P.x = DX; P.z = 7.75; P.yaw = 0; P.pitch = -.12 } PY = FY[1]; VX = VZ = 0; for (const k in keys) keys[k] = 0; $('#vc').style.display = 'none'; setRS(OPT.res); if (!locked && !S.noLock && S.mode === 'play') pause(true) }
function setRS(v) { if (RS !== v) { RS = v; size() } }
/* ---------- save / continue / checkpoints ---------- */
function save(q) { if (S.mode !== 'play') return; if (stAtLeast('INTRUDER_APPROACHING')) { if (!q) sub('บันทึกเกมไม่ได้ในตอนนี้ (มีจุดเช็กพอยต์อัตโนมัติ)'); return } try { localStorage.setItem('cd4s', JSON.stringify(snapshot())); if (!q) sub('บันทึกเกมแล้ว') } catch (e) { } }
const rd = k => { try { return JSON.parse(localStorage.getItem(k || 'cd4s')) } catch (e) { return null } };
function begin(mode) {
  initAudio(); menuStop(); $('#menu').style.display = 'none'; $('#hud').style.display = 'block'; S.mode = 'play'; S.flash = false;
  const d = mode === 'save' ? rd('cd4s') : mode === 'cp' ? rd('cd4cp') : null;
  if (d) { applySnapshot(d); if (INTRO.car) parkCar() } else { P = { x: 3.7, z: 17.4, yaw: 0, pitch: -.05 }; PY = 0; lights(); lock(); startIntro(); return }
  lights(); lock()
}
/* ---------- movement, stairs, interaction ---------- */
const hit = (x, z) => { if (x < -9 || x > 22 || z < -9 || z > 26) return true; const r = .22, Lv = plLevel(); return COL.some(c => !c.off && c.l === Lv && x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) };
let VX = 0, VZ = 0, stp = 0, bob = 0;
function freeSpot(x, z) { if (!hit(x, z)) return [x, z]; for (let r = .15; r < 3; r += .15) for (let a = 0; a < 6.28; a += .35) { const nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (!hit(nx, nz)) return [nx, nz] } return [x, z] }
function move(dt) { if (S.ui) { VX = VZ = 0; return } /* no walking while any overlay (note, inspection, wiring...) is open */ if (hit(P.x, P.z)) { [P.x, P.z] = freeSpot(P.x, P.z); VX = VZ = 0 } // safety net: never leave the player trapped inside a collider
  const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), r = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), l = Math.hypot(f, r) || 1, run = keys.ShiftLeft || keys.ShiftRight, tv = (run ? 3.6 : 2.2) * (f || r ? 1 : 0);
  const tx = (-Math.sin(P.yaw) * f + Math.cos(P.yaw) * r) / l * tv, tz = (-Math.cos(P.yaw) * f - Math.sin(P.yaw) * r) / l * tv, k = Math.min(1, dt * 8); VX += (tx - VX) * k; VZ += (tz - VZ) * k;
  const dx = VX * dt, dz = VZ * dt; if (!hit(P.x + dx, P.z)) P.x += dx; else VX = 0; if (!hit(P.x, P.z + dz)) P.z += dz; else VZ = 0; const sp = Math.hypot(VX, VZ); bob += sp * dt * 2.6; stp += sp * dt;
  const st = STAIR, inS = P.x > st.x0 && P.x < st.x1 && P.z > st.z0 && P.z < st.z1;
  if (stp > (run ? 1.0 : .7)) { stp = 0; const rm = roomAt(plLevel(), P.x, P.z), kind = inS ? 'stair' : rm === 'ext' ? 'out' : (rm === 'store' || rm === 'bath' || rm === 'kitchen') ? 'hard' : 'wood'; stepSound(kind, run); noise(P.x, P.z, plLevel(), run ? .75 : inS ? .4 : .25) }
  const tg = inS ? cl(FY[1] * (st.z1 - P.z) / (st.z1 - st.z0), 0, FY[1]) : (PY > 1.6 ? FY[1] : 0); PY += (tg - PY) * Math.min(1, dt * 14);
}
function pickIT() { let b = null, bs = .74; const ex = P.x, ey = PY + 1.62, ez = P.z, fx = -Math.sin(P.yaw) * Math.cos(P.pitch), fy = Math.sin(P.pitch), fz = -Math.cos(P.yaw) * Math.cos(P.pitch); for (const it of IT) { if (it.l !== plLevel()) continue; const dx = it.x - ex, dy = it.y - ey, dz = it.z - ez, d = Math.hypot(dx, dy, dz); if (d > it.r) continue; const dot = (dx * fx + dy * fy + dz * fz) / d, a0 = Math.acos(Math.min(1, dot)), ang0 = a0 - Math.atan((it.rad || .12) / Math.max(d, .2)), ang = ang0 < 0 ? -10 + a0 : ang0; /* hit = crosshair inside the object's angular size; among hits the most centred wins, otherwise the nearest edge */ if (it.tol !== undefined && ang0 > it.tol) continue; /* small items (key) have a tight aim tolerance */ if (ang < bs && it.lab()) { bs = ang; b = it } } return b }
/* ---------- main loop ---------- */
let last = performance.now(), rtT = 0, dkT = 0, lbT = 0, autoT = 0, lapT = 0, frames = 0, fpsT = 0; window.FPS = 0;
const fl = new T.SpotLight(0xfff0d0, 2.2, 16, .45, .9, 1.6); fl.position.set(.2, -.2, -.1); cam.add(fl); cam.add(fl.target); fl.target.position.set(0, 0, -5); fl.visible = true; fl.intensity = 0; fl.castShadow = false; /* always "visible" (constant light count, no shader recompiles); F toggles its intensity */ // shadows off: the ceiling fixture on the beam axis threw a black disc onto the ceiling
const IRL = new T.PointLight(0xd8ffd8, 0, 14, 1.2); scene.add(IRL);
const vtmp = new T.Vector3(), Q0 = new T.Quaternion(), Q1 = new T.Quaternion(), M4 = new T.Matrix4();
/* light budget: every MeshStandardMaterial pixel loops over every active light. Keep a constant small set active (nearest to the rendering camera) */
const LB = { pts: [], spots: [], n: -1 };
function lightBudget(pos, K = 6, KS = 2) { if (LB.n !== scene.children.length) { LB.n = scene.children.length; LB.pts = []; LB.spots = []; scene.traverse(o => { if (o.isPointLight) LB.pts.push(o); else if (o.isSpotLight && o !== fl && !(NPC && o === NPC.J.torch)) LB.spots.push(o) }) }
  for (const [list, n] of [[LB.pts, K], [LB.spots, KS]]) { for (const l of list) { l.getWorldPosition(vtmp); l._d = l.intensity > 0.001 ? vtmp.distanceTo(pos) : 1e6 + Math.random() } list.sort((a, b) => a._d - b._d); list.forEach((l, i) => l.visible = i < n) } } window.PROF = { f: 0, main: 0, cctv: 0, nc: 0, desk: 0, nd: 0, ov: 0, total: 0, reset() { Object.assign(this, { f: 0, main: 0, cctv: 0, nc: 0, desk: 0, nd: 0, ov: 0, total: 0 }) } }; const pnow = () => performance.now();
function loop(now) {
  requestAnimationFrame(loop); const t0f = pnow(); const dtr = Math.min(.25, (now - last) / 1000), dt = Math.min(.05, dtr); last = now; frames++; if (now - fpsT > 1000) { window.FPS = frames * 1000 / (now - fpsT); frames = 0; fpsT = now }
  const play = S.mode === 'play' && !S.paused && !(S.ui && S.ui !== 'wire' && S.ui !== 'phone'); /* the world keeps running while you look at your phone */
  if (play) for (let si = 0, sn = window.SIMSTEPS || 1; si < sn && S.mode === 'play'; si++) { S.t += dt; storyTick(dt); doors(dt); aiStep(dt); kitchenTick(dt); hideTick(dt); micTick(dt); } // SIMSTEPS: test-only fast-forward of the simulation (renders once)
  if (play) { if (!S.pc && !S.hidden && !S.seated && S.pcK <= .01 && !S.ui) move(dt); autoT += dt; if (autoT > 20 && S.chapter <= 3) { autoT = 0; save(true) } }
  if (S.mode === 'dead') { hideTick(dt); aiPose(dt, false) }
  extTick(dt, now); breathTick(dt); if (WARD) for (const d of WARD.userData.doors) d.piv.rotation.y += ((WARD.userData.open ? d.sx * 1.7 : 0) - d.piv.rotation.y) * Math.min(1, dt * 4);
  S.pcK = cl(S.pcK + (S.pc ? dtr / .7 : -dtr / .7), 0, 1); const k = S.pcK * S.pcK * (3 - 2 * S.pcK); S.lampFlicker = Math.max(0, (S.lampFlicker || 0) - dt);
  if (S.mode === 'menu') { const t = now / 1000; cam.position.set(3.7 + Math.sin(t * .1) * 1.2, 1.6, 18.5); cam.lookAt(3.7 + Math.sin(t * .13) * 2, 2.2, 6); if (cam.fov !== 62) { cam.fov = 62; cam.updateProjectionMatrix() } }
  else if (S.mode === 'play' || S.mode === 'dead') {
    const mvg = Math.hypot(VX, VZ); let py = PY + 1.62 + Math.sin(bob) * .014 * Math.min(1, mvg) + Math.sin(now / 1700) * .003, fov = 70;
    if (S.seated) py -= .45; cam.position.set(P.x, py, P.z); cam.rotation.set(P.pitch, P.yaw, 0);
    if (S.hidden || S.hideAnim > 0) { const a = S.hidden ? Math.min(1, (S.hideAnim = Math.min(1, (S.hideAnim || 0) + dtr * 1.6))) : 0; const bedH = S.hideSpot === 'bed', [hx, hz] = bedH ? [BEDH.x, BEDH.z] : hideAt(.2), hy = bedH ? BEDH.yaw : HIDE.ry + Math.PI, hp = vtmp.set(hx, FY[1] + (bedH ? .16 : 1.55), hz); cam.position.lerp(hp, S.hidden ? a : .5); if (S.hidden) cam.rotation.set((P.pitchH || 0) * a, hy + (P.yawH || 0) * a + (1 - a) * lerpA(0, P.yaw - hy, 1), 0); fov = bedH ? 70 + 8 * a : 70 - 18 * a }
    if (typeof EPI !== 'undefined' && EPI.cam) EPI.cam(); /* ending cinematic drives the camera */
    if (S.mode === 'dead') { cam.position.x += rr(-.01, .01); cam.position.y += rr(-.01, .01); const hd = new T.Vector3(); NPC.J.head.getWorldPosition(hd); cam.lookAt(hd) }
    if (k > 0) { const [tp, tl, tf] = seatTarget(), a = Math.min(1, dtr * 6); SEAT.pos.lerp(vtmp.set(...tp), a); SEAT.look.lerp(vtmp.set(...tl), a); SEAT.fov += (tf - SEAT.fov) * a; Q0.copy(cam.quaternion); cam.position.lerp(SEAT.pos, k); M4.lookAt(SEAT.pos, SEAT.look, cam.up); Q1.setFromRotationMatrix(M4); cam.quaternion.copy(Q0.slerp(Q1, k)); fov = 70 + (SEAT.fov - 70) * k }
    if (Math.abs(cam.fov - fov) > .01) { cam.fov = fov; cam.updateProjectionMatrix() }
    near = (S.pc || S.paused || S.hidden || S.ui || S.seated) ? null : pickIT(); const h = $('#hint'), t = near ? near.lab() : (S.hidden ? '' : ''); h.textContent = t; h.style.display = t && !S.pc ? 'block' : 'none';
    $('#cr').style.display = S.pc || S.hidden ? 'none' : 'block'; $('#hidefx').style.opacity = S.hidden ? 1 : 0; $('#hud').style.display = S.mode !== 'play' ? 'none' : 'block';
    $('#pchint').style.display = S.pc ? 'block' : 'none'; $('#pchint').textContent = S.pcView === 0 ? 'คลิกที่จอเพื่อใช้งาน   ·   Q / Esc / คลิกขวา: ลุกจากโต๊ะ' : S.pcView === 1 ? 'จอหลัก · คลิกเพื่อใช้งาน พิมพ์ในช่องข้อความได้   ·   Tab: จอกล้อง   ·   Q / คลิกขวา: ถอยกลับ' : 'กล้องวงจรปิด · คลิก ◀ ▶ หรือตัวเลข หรือกดปุ่ม 1–9, 0   ·   Tab: จอหลัก   ·   Q / คลิกขวา: ถอยกลับ';
    if (S.pc) pcPointer();
  } else if (S.mode === 'intro') { introTick(dtr); if (INTRO.phase === 4) { $('#hint').textContent = '[E] ลงจากรถ'; $('#hint').style.display = 'block' } else $('#hint').style.display = 'none' }
  else $('#hint').style.display = 'none';
  lights(); audioTick(dt); loopsTick(); avatarTick(dtr); kcSync();
  for (const c of CLOCKS) { const m = S.t / 12 + 22 * 60; c.mh.rotation.z = -(m % 60) / 60 * Math.PI * 2; c.hh.rotation.z = -(m / 60 % 12) / 12 * Math.PI * 2 }
  if (ROUTER) ROUTER.userData.leds.forEach((l, i) => l.visible = S.power && !S.laptopUnplugged && Math.random() > .3 * (i % 3));
  if (window.HCAM && !S.laptopUnplugged) HCAM.visible = (now / 700 | 0) % 2 === 0;
  if (TVSCR) TVSCR.material.color.setHex(S.power ? (Math.random() < .5 ? 0x26302a : 0x1e2822) : 0x050505);
  /* CCTV: real cameras in the scene rendered into the CRT (ghost sightings live on layer 1 = cameras only) */
  rtT += dtr; VHS.uniforms.t.value = now / 1000; VHS.uniforms.fl.value *= .9;
  const camVisible = S.pc ? S.pcView !== 1 : (plLevel() === 1 && roomAt(1, P.x, P.z) === 'comp'); fl.intensity = S.flash ? 2.8 : 0;
  if (rtT > (S.pc ? (S.pcView === 2 ? (window.FPS > 45 ? 1 / 30 : 1 / 20) : 1 / 12) : .35) && camVisible && (S.mode === 'play' || S.mode === 'menu') && pcOn()) { rtT = 0; const fv = fl.intensity; fl.intensity = 0; IRL.position.copy(CC[S.sel].position); IRL.intensity = S.power ? 0 : 1.8; lightBudget(CC[S.sel].position, 4, 1); /* night-vision: each camera has its own IR illuminator, so the feed still works when the house is dark */ const ai = amb.intensity; amb.intensity = .9; scCam.visible = false; if (LAPTOP) LAPTOP.userData.scr.visible = false; const tc = pnow(); irOn(true); ren.setRenderTarget(RT); ren.render(scene, CC[S.sel]); irOn(false); IRL.intensity = 0; PROF.cctv += pnow() - tc; PROF.nc++; amb.intensity = ai; fl.intensity = fv; scCam.visible = true; if (LAPTOP) LAPTOP.userData.scr.visible = true; ren.setRenderTarget(null) }
  lapT += dt; if (lapT > .3 && S.mode === 'play' && plLevel() && roomAt(1, P.x, P.z) === 'bedC' && !S.laptopUnplugged) { lapT = 0; LAPTOP.userData.scr.visible = false; scCam.visible = false; lightBudget(CC[6].position); ren.setRenderTarget(LAPRT); ren.render(scene, CC[6]); LAPTOP.userData.scr.visible = true; scCam.visible = true; ren.setRenderTarget(null) }
  lbT += dt; if (lbT > .25 && camVisible) { lbT = 0; const to = pnow(); drawOV(now); PROF.ov += pnow() - to } dkT += dt; if (S.pc && dkT > .05 && (D.dirty || D.outN < D.out.length || (D.toast && D.toast.t < Date.now() && !D.toastGone) || Math.floor(S.t / 12) !== D.lastMin)) { dkT = 0; D.dirty = 0; D.lastMin = Math.floor(S.t / 12); if (D.toast && D.toast.t < Date.now()) D.toastGone = 1; if (D.outN < D.out.length) D.outN += 1; const td = pnow(); drawDesk(); PROF.desk += pnow() - td; PROF.nd++ }
  const pc = S.pcK > .5; postM.uniforms.t.value = now / 1000; postM.uniforms.ca.value = pc ? .2 : 1; postM.uniforms.gr.value = pc ? .025 : .06;
  if (S.ui === 'insp') inspectRender(dtr); else { lightBudget(cam.position); const tm = pnow(); ren.setRenderTarget(RTM); ren.render(scene, cam); PROF.main += pnow() - tm; window.RINFO = { calls: ren.info.render.calls, tris: ren.info.render.triangles }; ren.setRenderTarget(null); ren.render(postS, postC) } PROF.f++; PROF.total += pnow() - t0f;
}
/* ---------- CRT terminal main menu ---------- */
const MENU = { items: [['NEW GAME', 'เริ่มเกมใหม่', () => begin('new')], ['CONTINUE', 'เล่นต่อจากที่บันทึกไว้', () => rd('cd4s') && begin('save')], ['OPTIONS', 'ตัวเลือก', () => menuPanel('opt')], ['CREDITS', 'เครดิต', () => menuPanel('cred')], ['QUIT', 'ออกจากเกม', () => menuPanel('quit')]], sel: 0, panel: null };
function menuRender() { const el = $('#mlist'); el.innerHTML = MENU.items.map((m, i) => { const dis = i === 1 && !rd('cd4s'); return `<div class="mi ${i === MENU.sel ? 'on' : ''} ${dis ? 'dis' : ''}" data-i="${i}">${i === MENU.sel ? '&gt;' : '&nbsp;'} ${m[0]} <span>${m[1]}</span></div>` }).join('');
  el.querySelectorAll('.mi').forEach(d => { d.onmouseenter = () => { if (MENU.sel === +d.dataset.i) return; MENU.sel = +d.dataset.i; menuHi(); tone(170, .05, 'sine', .04) }; d.onclick = () => { initAudio(); menuFan(); MENU.items[+d.dataset.i][2]() } }) }
function menuHi() { document.querySelectorAll('#mlist .mi').forEach((d, i) => { d.classList.toggle('on', i === MENU.sel); d.innerHTML = (i === MENU.sel ? '&gt;' : '&nbsp;') + d.innerHTML.slice(d.innerHTML.indexOf(' ')) }) }
function menuKey(e) { if (MENU.panel) { if (e.code === 'Escape') menuPanel(null); return } if (e.code === 'ArrowDown') MENU.sel = (MENU.sel + 1) % 5; else if (e.code === 'ArrowUp') MENU.sel = (MENU.sel + 4) % 5; else if (e.code === 'Enter') { initAudio(); menuFan(); MENU.items[MENU.sel][2](); return } else return; tone(170, .05, 'sine', .04); menuHi() }
function menuPanel(id) { MENU.panel = id; document.querySelectorAll('.mp').forEach(p => p.style.display = p.id === 'mp_' + id ? 'block' : 'none'); $('#mlist').style.display = id ? 'none' : 'block'; if (id === 'opt') { $('#o1').value = OPT.sens; $('#o2').value = OPT.res; $('#o3').value = OPT.vol; $('#o4').value = OPT.diff; $('#o5').value = OPT.micMode; $('#o6').value = OPT.micSens } }
let FAN; function menuFan() { if (FAN || !AC) return; const s = AC.createBufferSource(); s.buffer = NOISEBUF; s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .7; FAN = AC.createGain(); FAN.gain.value = .05; s.connect(f); f.connect(FAN); FAN.connect(MG); s.start(); const o = AC.createOscillator(); o.frequency.value = 15600; const g = AC.createGain(); g.gain.value = .004; o.connect(g); g.connect(FAN); o.start() }
function menuStop() { if (FAN) { FAN.gain.setTargetAtTime(0, AC.currentTime, .3) } }
function bootText() { const lines = ['HALDEN SECURE TERMINAL v2.3', 'ROM BIOS (C) 1998  ...  RAM 65536K OK', 'กำลังเชื่อมต่อเครือข่ายภายในบ้าน 1407 ...', 'พบกล้องวงจรปิด 6 ตัว ... [OK]', 'พบอุปกรณ์ที่ไม่รู้จัก: LAPTOP-7F2 ... [?]', '']; let i = 0; const el = $('#boot'); el.textContent = ''; const iv = setInterval(() => { if (i >= lines.length) { clearInterval(iv); menuRender(); return } el.textContent += lines[i++] + '\n' }, 280) }
/* ---------- boot ---------- */
function boot() {
  buildHouse(); setupOfficeDoor(); buildBackKey(); buildExterior(); furnishAll(); buildComputer(); snapSwitches(); navBuild(); NPC = buildIntruder(); GHOST = buildIntruder(); buildAvatar(); kcInit(); extraProps(); GHOST.root.traverse(o => o.layers.set(1)); GHOST.root.visible = false; window.MERGE = mergeStatic(); lights();
  $('#sv').onclick = () => { OPT.sens = +$('#o1').value; OPT.res = +$('#o2').value; OPT.vol = +$('#o3').value; OPT.diff = $('#o4').value; OPT.micMode = $('#o5').value; OPT.micSens = +$('#o6').value; saveOpt(); setRS(OPT.res); if (MG) MG.gain.value = OPT.vol / 100; menuPanel(null) };
  document.querySelectorAll('.mback').forEach(b => b.onclick = () => menuPanel(null)); $('#qy').onclick = () => { document.body.innerHTML = '<div style="height:100vh;display:grid;place-items:center;color:#5a8a5a;background:#000;font-family:monospace">SYSTEM HALTED. ปิดแท็บนี้ได้เลย</div>' };
  $('#rs').onclick = e => { e.stopPropagation(); pause(false); if (!locked) lock() }; $('#pause').onclick = e => { if (e.target.id === 'pause' || e.target.tagName === 'H1' || e.target.tagName === 'P') { pause(false); if (!locked) lock() } }; $('#sg').onclick = () => save(); $('#qm').onclick = () => { if (S.chapter <= 3) save(true); restartFrom('menu') };
  $('#goCp').onclick = () => restartFrom('cp'); $('#goNew').onclick = () => restartFrom('new'); $('#goMenu').onclick = () => restartFrom('menu'); $('#em').onclick = () => restartFrom('menu'); $('#eNew').onclick = () => restartFrom('new');
  addEventListener('pointerdown', () => { initAudio() }, { once: true });
  let bootMode = null; try { bootMode = sessionStorage.getItem('cd4boot'); sessionStorage.removeItem('cd4boot') } catch (e) { }
  const lt = setInterval(() => { $('#load').textContent = ASSET.done < ASSET.n ? `กำลังโหลดเฟอร์นิเจอร์ ${ASSET.done}/${ASSET.n}` : (ASSET.fail.length ? `โหลดโมเดลไม่สำเร็จ ${ASSET.fail.length} ชิ้น` : ''); if (ASSET.done >= ASSET.n) { clearInterval(lt); window.READY = 1 } }, 200);
  if (bootMode === 'cp' || bootMode === 'new') { const g = $('#resume'); g.style.display = 'flex'; g.querySelector('p').textContent = bootMode === 'cp' ? 'คลิกเพื่อเริ่มใหม่จากจุดเช็กพอยต์' : 'คลิกเพื่อเริ่มเกมใหม่'; g.onclick = () => { g.style.display = 'none'; begin(bootMode === 'cp' && rd('cd4cp') ? 'cp' : 'new') } } else bootText();
  requestAnimationFrame(loop);
}
window.DBG = { S, get P() { return P }, D, DOORS, IT, COL, ROOMS, AI, MIC, tp: (x, z, l = 0, yaw = 0, pitch = 0) => { P.x = x; P.z = z; PY = FY[l]; P.yaw = yaw; P.pitch = pitch }, get PY() { return PY }, near: () => near && near.lab(), act: () => near && near.act(), vc: (x, y) => { VC.x = x; VC.y = y }, keys, renderInfo: () => ren.info.render, mem: () => ren.info.memory };
window.DBGLOG = [];
boot();
