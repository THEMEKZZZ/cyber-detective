/* ---------- house shell: v2 floor plan x1.3 (13 x 9.75 m), ground + upper floor ---------- */
const p = v => +(v * K).toFixed(3);
/* which room a point belongs to (drives wallpaper per side of every wall) */
function roomAt(l, x, z) {
  if (x < 0 || x > HW || z < 0 || z > HD) return 'ext';
  if (l === 0) { if (x < p(4.2) && z < p(2.6)) return 'store'; if (x > p(5.3) && z < p(1.8)) return 'bath'; if (x > p(5.3)) return 'kitchen'; if (x > p(4.2) && z < p(3.2)) return 'hall'; return 'living' }
  if (z < p(3.2)) { if (x < p(4.3)) return 'bedA'; if (x > p(6.3)) return 'bedB'; return 'hall' }
  if (z > p(4.4)) return x < p(5.3) ? 'comp' : 'bedC'; return 'hall';
}
const SIDE = MAT.dark;
function wallMesh(l, cx, cy, cz, w, h, d, alongZ) {
  const g = new T.BoxGeometry(w, h, d), pos = g.attributes.position, uv = g.attributes.uv, y0 = FY[l];
  for (let i = 0; i < pos.count; i++) { const wx = pos.getX(i) + cx, wy = pos.getY(i) + cy, wz = pos.getZ(i) + cz; uv.setXY(i, (alongZ ? wz : wx) / 1.6 + (alongZ ? wx : wz) * 0, (wy - y0) / WH) }
  const a = alongZ ? roomAt(l, cx + .3, cz) : roomAt(l, cx, cz + .3), b = alongZ ? roomAt(l, cx - .3, cz) : roomAt(l, cx, cz - .3);
  const mats = alongZ ? [MAT[a], MAT[b], SIDE, SIDE, MAT[a], MAT[a]] : [MAT[a], MAT[a], SIDE, SIDE, MAT[a], MAT[b]];
  const o = new T.Mesh(g, mats); o.position.set(cx, cy, cz); o.castShadow = o.receiveShadow = true; scene.add(o); return o;
}
/* holes: [centre along wall (from min end), width, sill, height]; door when sill==0 */
function wall(l, x0, z0, x1, z1, holes = []) {
  const alongZ = x0 === x1, len = alongZ ? Math.abs(z1 - z0) : Math.abs(x1 - x0), a0 = alongZ ? Math.min(z0, z1) : Math.min(x0, x1), y0 = FY[l], H = WH, t = .16, pcs = [];
  const hs = holes.map(([c, w, s, hh]) => [c - w / 2, c + w / 2, s, hh]).sort((p, q) => p[0] - q[0]); let cur = 0;
  const at = (along, y, w, h, d) => alongZ ? [x0, y, a0 + along, d, h, w] : [a0 + along, y, z0, w, h, d];
  for (const [h0, h1, s, hh] of hs) {
    if (h0 > cur) pcs.push([cur, h0, 0, H]);
    if (s > 0) pcs.push([h0, h1, 0, s]); if (s + hh < H) pcs.push([h0, h1, s + hh, H]); cur = h1;
    const m = (h0 + h1) / 2, W = h1 - h0;
    if (s > 0) { // window: glass, frame, mullions, sill
      const [gx, gy, gz] = at(m, y0 + s + hh / 2), fr = MAT.white;
      bx(gx, gy, gz, alongZ ? .02 : W, hh, alongZ ? W : .02, MAT.glass, false);
      for (const yy of [y0 + s + .03, y0 + s + hh - .03, y0 + s + hh * .62]) { const q = at(m, yy); bx(q[0], q[1], q[2], alongZ ? .09 : W, .05, alongZ ? W : .09, fr, false) }
      for (const aa of [h0 + .03, h1 - .03, m]) { const q = at(aa, y0 + s + hh / 2); bx(q[0], q[1], q[2], .07, hh, .07, fr, false) }
      const sl = at(m, y0 + s - .02); bx(sl[0], sl[1], sl[2], alongZ ? .34 : W + .14, .04, alongZ ? W + .14 : .34, MAT.woodM, false);
      WINDOWS.push({ l, x: gx, z: gz, alongZ, W, top: y0 + s + hh, s });
    } else { // door casing on both faces
      for (const sd of [-1, 1]) {
        const off = sd * (t / 2 + .012);
        for (const aa of [h0 - .04, h1 + .04]) { const q = at(aa, y0 + hh / 2); bx(q[0] + (alongZ ? off : 0), q[1], q[2] + (alongZ ? 0 : off), alongZ ? .025 : .08, hh + .04, alongZ ? .08 : .025, MAT.woodM, false) }
        const q = at(m, y0 + hh + .04); bx(q[0] + (alongZ ? off : 0), q[1], q[2] + (alongZ ? 0 : off), alongZ ? .025 : W + .16, .08, alongZ ? W + .16 : .025, MAT.woodM, false)
      }
    }
  }
  if (cur < len) pcs.push([cur, len, 0, H]);
  // split at room boundaries so each side of a wall gets the right room's wallpaper
  const BND = (alongZ ? [p(1.8), p(2.6), p(3.2), p(4.4), p(4.5)] : [p(4.2), p(4.3), p(5.3), p(6.3)]).map(v => v - a0), sp = [];
  for (const q of pcs) { let s0 = q[0]; for (const b of BND.filter(b => b > q[0] + .01 && b < q[1] - .01).sort((x, y) => x - y)) { sp.push([s0, b, q[2], q[3]]); s0 = b } sp.push([s0, q[1], q[2], q[3]]) }
  for (const [p0, p1, b, c] of sp) { const L = p1 - p0, m = a0 + (p0 + p1) / 2, yy = y0 + (b + c) / 2, hh = c - b; alongZ ? wallMesh(l, x0, yy, m, t, hh, L, true) : wallMesh(l, m, yy, z0, L, hh, t, false); if (b === 0) alongZ ? col(x0 - t / 2, x0 + t / 2, a0 + p0, a0 + p1, l) : col(a0 + p0, a0 + p1, z0 - t / 2, z0 + t / 2, l) }
}
const WINDOWS = [];
/* ---------- doors: panelled leaf, brass knob, hinged + animated, lockable ---------- */
function dr(l, ax, k, c, open = 0, lock = 0, sgn = -1) {
  const g = new T.Group(), W = .92, H = 2.08, leaf = G(); g.add(leaf);
  P3(leaf, Bx(W, H, .045), MAT.doorM, W / 2, H / 2, 0);
  for (const sz of [-1, 1]) for (const [py, ph] of [[.55, .7], [1.5, .85]]) for (const px of [.24, .68]) P3(leaf, Bx(.3, ph, .012), MAT.wood, px, py, sz * .027);
  for (const sz of [-1, 1]) { P3(leaf, Lathe([[0, 0], [.03, 0], [.032, .02], [.012, .03], [.012, .06], [0, .06]], 10), MAT.brass, .82, 1.0, sz * .022, sz * Math.PI / 2); }
  P3(leaf, Bx(.06, .1, .01), MAT.brass, .82, 1.0, .03); P3(leaf, Bx(.06, .1, .01), MAT.brass, .82, 1.0, -.03);
  const base = ax === 'x' ? 0 : -Math.PI / 2, y = FY[l];
  if (ax === 'x') g.position.set(c - W / 2, y, k); else g.position.set(k, y, c - W / 2); g.userData.dyn = 1; scene.add(g);
  const cb = ax === 'x' ? col(c - W / 2, c + W / 2, k - .06, k + .06, l) : col(k - .06, k + .06, c - W / 2, c + W / 2, l),
    d = { g, ax, base, l, sgn, open: !!open, a: open ? 1 : 0, lock, cb, x: ax === 'x' ? c : k, z: ax === 'x' ? k : c }; DOORS.push(d);
  { const th = base + (ax === 'x' ? sgn : 1) * 1.5, hx = g.position.x, hz = g.position.z, ex = hx + Math.cos(th) * W, ez = hz - Math.sin(th) * W; // the leaf when fully open also blocks (no walking through an open door)
    d.co = col(Math.min(hx, ex) - .04, Math.max(hx, ex) + .04, Math.min(hz, ez) - .04, Math.max(hz, ez) + .04, l, 1); d.co.off = !open; d.leafEnd = [ex, ez] }
  IT.push({ x: d.x, y: y + 1.25, z: d.z, l, r: 2.0, door: d, lab: () => d.lock && !hasKeyFor(d) ? (d.keyId === 'office' ? 'ล็อกอยู่ (ต้องใช้กุญแจห้องทำงาน)' : 'ล็อกอยู่') : d.open ? '[E] ปิดประตู' : d.lock ? '[E] ใช้กุญแจไขประตู' : d.keyId === 'back' && S.backKey ? '[E] เปิดประตู   ·   [R] ล็อกประตู' : '[E] เปิดประตู', act: () => doorAct(d) }); return d
}
function hasKeyFor(d) { return (d.keyId === 'office' && S.key) || (d.keyId === 'back' && S.backKey) }
function lockToggle(d) { if (!d || d.keyId !== 'back' || !S.backKey || d.open) return false; d.lock = d.lock ? 0 : 1; tone(900, .05, 'square', .1); tone(600, .08, 'square', .08, .12); sub(d.lock ? 'ล็อกประตูแล้ว... แกร๊ก' : 'ปลดล็อกแล้ว'); noise(d.x, d.z, d.l, .2); return true }
function doorAct(d) { const hasKey = hasKeyFor(d); if (d.lock && !hasKey) { sub('ประตูล็อกอยู่'); rattle(); noise(d.x, d.z, d.l, .4); return } if (d.lock && hasKey) { d.lock = 0; sub('ไขกุญแจได้แล้ว... แกร๊ก'); tone(900, .05, 'square', .1); tone(600, .08, 'square', .08, .12); if (window.progress && d.keyId === 'office') progress('unlock_office') } if (d.open && Math.hypot(P.x - d.x, P.z - d.z) < .7) { sub('มีอะไรขวางอยู่'); return } d.open = !d.open; creak(); noise(d.x, d.z, d.l, .55) }
function doors(dt) { for (const d of DOORS) { d.a += ((d.open ? 1 : 0) - d.a) * Math.min(1, dt * 4); d.g.rotation.y = d.base + (d.ax === 'x' ? d.sgn : 1) * 1.5 * d.a; d.cb.off = d.a > .4; if (d.co) d.co.off = d.a < .7 } }
/* ---------- rooms: ceiling fixture + light, wall switches ---------- */
function room(id, x, l, z, on, I = 1.3, c = 0xffc483, kind = 'shade') {
  const y = FY[l] + WH, li = new T.PointLight(c, I, 9, 2); li.position.set(x, y - .55, z); scene.add(li);
  const fx = G(); fx.position.set(x, y, z); scene.add(fx); P3(fx, Cy(.005, .3, 4), MAT.dark, 0, -.15, 0);
  const bulbM = new T.MeshBasicMaterial({ color: 0xffe2b0 });
  if (kind !== 'shade') P3(fx, Cy(.13, .06, 16), MAT.white, 0, -.33, 0);
  const b = P3(fx, new T.SphereGeometry(.045, 10, 8), bulbM, 0, -.52, 0); b.castShadow = false; b.userData.dyn = 1; ROOMS[id] = { l: li, b, I, on, fx };
  if (kind === 'shade') { b.scale.setScalar(.5); li.position.y = y - .62; /* the ceiling light IS the chandelier (Poly Haven CC0): its shades glow when the switch/power is on */
    glb('chandelier').then(src => { if (!src) return; const m = src.clone(true), bb = new T.Box3().setFromObject(m), sz = bb.getSize(new T.Vector3()), s = (l ? .62 : .72) / sz.y, c = bb.getCenter(new T.Vector3()); m.scale.setScalar(s); m.position.set(-c.x * s, -bb.max.y * s, -c.z * s); const shades = [];
      m.traverse(o => { if (!o.isMesh) return; o.castShadow = false; o.material = o.material.clone(); if (/lamp/i.test(o.material.name)) { o.material.emissive = new T.Color(0xffc070); o.material.emissiveIntensity = 0; shades.push(o.material) } }); m.userData.dyn = 1; fx.add(m); ROOMS[id].shades = shades }) }
}
function sw(id, l, x, z, ry = 0) { const y = FY[l] + 1.3, g = G(); P3(g, RG(.08, .12, .012, .01), MAT.white); const tg = P3(g, Bx(.016, .03, .014), MAT.white, 0, 0, .012); tg.userData.dyn = 1; furn(g, x, y, z, ry, l); ROOMS[id].tg = tg; IT.push({ x, y, z, l, r: 1.7, lab: () => '[E] สวิตช์ไฟ', act: () => { ROOMS[id].on = !ROOMS[id].on; tone(1500, .03, 'square', .1) } }) }
let ledM; const LMP = []; // table/floor lamps follow mains power
function lights() { for (const k in ROOMS) { const r = ROOMS[k], on = S.power && r.on; r.l.intensity = on ? r.I * (S.flick > 0 && Math.random() < .5 ? .1 : 1) : 0; r.b.visible = on; if (r.shades) for (const m of r.shades) m.emissiveIntensity = on ? .9 : 0; if (r.tg) r.tg.rotation.x = r.on ? -.35 : .35 } amb.intensity = S.power ? .35 : .18; for (const L of LMP) { L.l.intensity = S.power && L.on ? L.I : 0; L.m.color.setHex(S.power && L.on ? 0xffd9a0 : 0x2a2420) } if (ledM) ledM.color.setHex(S.power ? 0x40ff70 : 0xff2020); if (window.PCL) PCL(S.power || S.ups) }
function setPower(on) { S.power = on; lights(); tone(on ? 200 : 60, .6, 'sawtooth', .3); if (!on && S.pc && !S.ups) exitPC() }
/* ---------- build ---------- */
function buildHouse() {
  bx(HW / 2, -.12, HD / 2, 80, .1, 80, MAT.grass, false); bx(3.7, .005, 12.4, 1.6, .02, 5, MAT.conc, false); bx(3.7, .08, 10.3, 2.4, .16, 1.1, MAT.conc, true);
  // ground floors per room
  const fl = (x0, x1, z0, z1, m, y = 0) => bx((x0 + x1) / 2, y - .05, (z0 + z1) / 2, x1 - x0, .1, z1 - z0, m, false);
  fl(0, p(4.2), 0, p(2.6), MAT.conc); fl(p(5.3), HW, 0, p(1.8), MAT.btile); fl(p(5.3), HW, p(1.8), HD, MAT.ktile); fl(0, p(5.3), p(2.6), HD, MAT.floor); fl(p(4.2), p(5.3), 0, p(2.6), MAT.floor);
  // upper floor slabs (top = planks, underside = ceiling) with stairwell opening
  const SX0 = p(4.3), SX1 = p(5.3), SZ0 = 1.05, SZ1 = p(3.2);
  const slab = (x0, x1, z0, z1) => { const w = x1 - x0, d = z1 - z0, o = new T.Mesh(uvBox(Bx(w, .15, d), w, .15, d), [MAT.ceil, MAT.ceil, MAT.floorUp, MAT.ceil, MAT.ceil, MAT.ceil]); o.position.set((x0 + x1) / 2, FY[1] - .075, (z0 + z1) / 2); o.receiveShadow = true; scene.add(o) };
  slab(0, SX0, 0, HD); slab(SX1, HW, 0, HD); slab(SX0, SX1, 0, SZ0); slab(SX0, SX1, SZ1, HD);
  bx(HW / 2, FY[1] + WH + .06, HD / 2, HW + .2, .12, HD + .2, MAT.ceil, false);
  { const s = new T.Shape(); s.moveTo(-HD / 2 - .5, 0); s.lineTo(HD / 2 + .5, 0); s.lineTo(0, 2.2); const g = new T.ExtrudeGeometry(s, { depth: HW + .8, bevelEnabled: false }); g.translate(0, 0, -(HW + .8) / 2); g.rotateY(Math.PI / 2); const m = new T.Mesh(g, MAT.roof); m.position.set(HW / 2, FY[1] + WH + .12, HD / 2); scene.add(m) }
  // exterior walls (ground): front z=HD with door + 4 windows
  const Wn = (c, w, s = .9, h = 1.3) => [p(c), w, s, h];
  wall(0, 0, HD, HW, HD, [[p(2.85), 1.0, 0, 2.15], Wn(1.3, 1.4), Wn(4.5, 1.2), Wn(7, 1.4), Wn(8.9, 1.2)]);
  wall(0, 0, 0, HW, 0, [Wn(8, 1.3, 1.45, .7)]); wall(0, 0, 0, 0, HD, [Wn(4.9, 1.4), Wn(1.8, 1.2)]); wall(0, HW, 0, HW, HD, [Wn(3.7, 1.4), Wn(6.1, 1.4)]);
  // interior ground
  wall(0, 0, p(2.6), p(4.2), p(2.6), [[p(3.05), 1.0, 0, 2.15]]); wall(0, p(4.2), 0, p(4.2), p(3.2)); wall(0, p(5.3), 0, p(5.3), p(3.2));
  wall(0, p(5.3), p(1.8), HW, p(1.8), [[p(6.45) - p(5.3), 1.0, 0, 2.15]]); wall(0, p(5.3), p(4.5), p(5.3), HD);
  // upper exterior
  wall(1, 0, HD, HW, HD, [Wn(1.6, 1.4), Wn(4, 1.2), Wn(7.6, 1.4)]); wall(1, 0, 0, HW, 0, [Wn(2.1, 1.4), Wn(7.6, 1.4)]); wall(1, 0, 0, 0, HD, [Wn(1.6, 1.4), Wn(5.8, 1.4)]); wall(1, HW, 0, HW, HD, [Wn(1.6, 1.4), Wn(6.1, 1.4)]);
  // upper interior
  wall(1, 0, p(3.2), p(4.3), p(3.2), [[p(1.95), 1.0, 0, 2.15]]); wall(1, p(4.3), 0, p(4.3), p(3.2)); wall(1, p(6.3), 0, p(6.3), p(3.2), [[p(1.45), 1.0, 0, 2.15]]); wall(1, p(6.3), p(3.2), HW, p(3.2));
  wall(1, 0, p(4.4), p(5.3), p(4.4), [[p(2.65), 1.0, 0, 2.15]]); wall(1, p(5.3), p(4.4), HW, p(4.4), [[p(7.45) - p(5.3), 1.0, 0, 2.15]]); wall(1, p(5.3), p(4.4), p(5.3), HD);
  // doors (same order as v2 so story events still reference DOORS[4] = spare bedroom)
  dr(0, 'x', HD, p(2.85), 0, 0, 1); dr(0, 'x', p(2.6), p(3.05), 1, 0, 1); dr(0, 'x', p(1.8), p(6.45), 0, 0, 1); dr(1, 'x', p(3.2), p(1.95), 1, 0, 1); dr(1, 'z', p(6.3), p(1.45)); dr(1, 'x', p(4.4), p(2.65)); dr(1, 'x', p(4.4), p(7.45), 0, 1);
  // staircase: 15 steps, 19 cm rise, 23 cm going; bottom at z=4.5 (living room), top at z=1.05
  const N = 15, sx = (SX0 + SX1) / 2, sw_ = 1.18, z0 = 4.5, run = z0 - SZ0;
  for (let i = 0; i < N; i++) { const h = (i + 1) * FY[1] / N, zc = z0 - (i + .5) * run / N; bx(sx, h / 2, zc, sw_, h, run / N, MAT.wood); bx(sx, h + .012, zc - .01, sw_ + .03, .025, run / N + .03, MAT.woodM, false) }
  const ang = Math.atan2(FY[1], run), L = Math.hypot(FY[1], run);
  { const r = bx(SX1 - .04, FY[1] / 2 + .95, (z0 + SZ0) / 2, .05, .06, L, MAT.woodM, false); r.rotation.x = ang; for (let i = 0; i < N; i += 2) { const zc = z0 - (i + .5) * run / N, h = (i + 1) * FY[1] / N; const b = P3(scene, Cy(.018, .92, 8), MAT.woodM, SX1 - .04, h + .46, zc) } }
  // upstairs balustrade around stairwell
  for (const [x0, x1, z0_, z1_] of [[SX1, SX1, SZ0, SZ1], [SX0, SX1, SZ1, SZ1]]) { const alongZ = x0 === x1, len = alongZ ? z1_ - z0_ : x1 - x0; bx(alongZ ? x0 : (x0 + x1) / 2, FY[1] + .95, alongZ ? (z0_ + z1_) / 2 : z0_, alongZ ? .07 : len, .06, alongZ ? len : .07, MAT.woodM); for (let s = .1; s < len; s += .2) P3(scene, Lathe([[0, 0], [.025, 0], [.025, .1], [.015, .2], [.022, .5], [.014, .8], [.02, .92], [0, .92]], 8), MAT.woodM, alongZ ? x0 : x0 + s, FY[1], alongZ ? z0_ + s : z0_); col(alongZ ? x0 - .05 : x0, alongZ ? x0 + .05 : x1, alongZ ? z0_ : z0_ - .05, alongZ ? z1_ : z0_ + .05, 1) }
  window.STAIR = { x0: SX0 + .02, x1: SX1 - .02, z0: SZ0, z1: z0 };
  // breaker panel (storage room, east wall)
  { const g = G(); P3(g, Bx(.1, .62, .44), MAT.metal); P3(g, Bx(.012, .56, .38), MC(0x5a5e58, .5, { metalness: .4 }), .056, 0, 0); for (let i = 0; i < 6; i++)P3(g, Bx(.02, .05, .025), MAT.dark, .066, .18 - i * .07, -.08); const led = P3(g, new T.SphereGeometry(.018, 8, 6), new T.MeshBasicMaterial({ color: 0x40ff70 }), .07, .22, .12); ledM = led.material; led.userData.dyn = 1; P3(g, Cy(.02, 1.4, 6), MAT.dark, 0, .95, .1); furn(g, p(4.2) - .13, 1.4, 2.08, Math.PI, 0) }
  IT.push({ x: p(4.2) - .15, y: 1.4, z: 2.08, l: 0, r: 2, lab: () => S.power ? 'แผงไฟหลัก (ทำงานปกติ)' : S.mainCut ? 'แผงไฟหลัก · สายไฟเข้าบ้านถูกตัดจากข้างนอก' : '[E] เปิดแผงไฟหลักเพื่อซ่อม', act: () => { if (S.power) sub('แผงไฟทำงานปกติ ไม่ต้องแตะอะไร'); else if (S.mainCut) sub('ไม่มีไฟเข้ามาที่แผงเลย... เขาตัดสายไฟหลักจากข้างนอก ซ่อมจากตรงนี้ไม่ได้'); else wireOpen() } });
  // room lights + switches (same ids as v2)
  room('living', 2.4, 0, 6.6, 1); room('kitchen', 9.6, 0, 6.2, 0); room('bath', 9.8, 0, 1.2, 0, 1, 0xfff0d8, 'flat'); room('store', 2.5, 0, 1.6, 0, .9, 0xffb070, 'flat'); room('bedA', 2.8, 1, 2.1, 1, 1.1);
  room('bedB', 10.6, 1, 2.1, 0); room('bedC', 10.2, 1, 7.7, 0, 1, 0xd0e0c0, 'flat'); room('comp', 3.4, 1, 7.8, 1, 1.0); room('hall', 3, 1, 4.95, 1, .8); room('hall2', 9.5, 1, 4.95, 0, .7);
  sw('living', 0, p(2.85) + .7, HD - .1, Math.PI); sw('kitchen', 0, p(5.3) + .1, 6.25, Math.PI / 2); sw('bath', 0, p(6.45) - .75, p(1.8) + .1); sw('store', 0, p(3.05) + .7, p(2.6) - .1, Math.PI);
  sw('bedA', 1, p(1.95) + .7, p(3.2) - .1, Math.PI); sw('bedB', 1, p(6.3) + .1, p(1.45) + .75, Math.PI / 2); sw('bedC', 1, p(7.45) - .75, p(4.4) + .1); sw('comp', 1, p(2.65) + .7, p(4.4) + .1); sw('hall', 1, .1, 4.95, Math.PI / 2); sw('hall2', 1, HW - .1, 4.95, -Math.PI / 2);
  const porch = new T.PointLight(0xffc98a, .9, 7, 2); porch.position.set(3.7, 2.4, 10.4); scene.add(porch);
  for (const [x, z] of [[-3, 3], [-4, 10], [17, 2], [17, 11], [6, -4], [-2, 15], [11, 15]]) { const tr = new T.Mesh(Cy(.18, 2.6, 6), MAT.wood); tr.position.set(x, 1.3, z); scene.add(tr); for (let k = 0; k < 3; k++) { const f = new T.Mesh(new T.IcosahedronGeometry(rr(.9, 1.4), 0), M(fill('#1c2a1a', 300), 1)); f.position.set(x + rr(-.5, .5), rr(2.8, 4), z + rr(-.5, .5)); scene.add(f) } col(x - .25, x + .25, z - .25, z + .25, 0) }
}

/* light switches: after every wall exists (and before static merging) push each plate back until it sits flush on the wall
   behind it, so no switch floats in front of a wall whatever wall thickness the room uses */
function snapSwitches() { const rc = new THREE.Raycaster(), o = new THREE.Vector3(), q = new THREE.Quaternion(); scene.updateMatrixWorld(true); const log = [];
  for (const id in ROOMS) { const tg = ROOMS[id].tg; if (!tg) continue; const g = tg.parent; g.getWorldPosition(o); const n = new THREE.Vector3(0, 0, 1).applyQuaternion(g.getWorldQuaternion(q));
    rc.set(o.clone().addScaledVector(n, .3), n.clone().negate()); rc.far = .5; rc.camera = cam;
    const h = rc.intersectObjects(scene.children, true).find(h => { let p = h.object; while (p) { if (p === g) return false; p = p.parent } return h.object.isMesh && h.object.visible });
    if (!h) continue; const gap = h.distance - .3 - .006; if (Math.abs(gap) > .002 && Math.abs(gap) < .08) { g.position.addScaledVector(n, -gap); g.updateMatrixWorld(true); log.push(id + ' ' + gap.toFixed(3)) } }
  window.SWSNAP = log }
