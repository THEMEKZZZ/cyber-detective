/* ---------- exterior: quiet American suburb at dusk (ref: purple/orange sky, white siding houses, sidewalks, path lights, power pole) ---------- */
const EXT = { spots: {}, pathLights: [], streetLamps: [], trees: [], meter: null, poleWire: null };
function skyDome() { // sky follows the camera and stays inside the 60 m far plane (the old 90 m dome was clipped -> dark circle)
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d'), gd = g.createLinearGradient(0, 0, 0, 256);
  gd.addColorStop(0, '#15112a'); gd.addColorStop(.3, '#2e2346'); gd.addColorStop(.42, '#5a3452'); gd.addColorStop(.49, '#9a5246'); gd.addColorStop(.52, '#3a2630'); gd.addColorStop(1, '#0c0a0e'); g.fillStyle = gd; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 420; i++) { const x = rr(0, 1024), y = rr(40, 124), r = rr(3, 13); g.fillStyle = `rgba(${200 + rr(0, 55) | 0},${100 + rr(0, 60) | 0},${85 + rr(0, 40) | 0},${rr(.06, .3) * Math.pow(y / 124, 2)})`; g.beginPath(); g.ellipse(x, y, r * 3, r * .6, 0, 0, 7); g.fill() }
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; const m = new T.Mesh(new T.SphereGeometry(48, 32, 16), new T.MeshBasicMaterial({ map: t, side: T.BackSide, fog: false, depthWrite: false, depthTest: false }));
  m.renderOrder = -10; m.frustumCulled = false; m.userData.dyn = 1; m.onBeforeRender = (r, sc, c2) => m.position.copy(c2.position); scene.add(m); EXT.sky = m;
}
const siding = c => M(tex(64, (g, w) => { g.fillStyle = c; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 8) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, y, w, 1); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, y + 1, w, 1) } grain(g, w, w, 260); stains(g, w, w, 5) }));
const asphalt = M(tex(128, (g, w) => { g.fillStyle = '#26262a'; g.fillRect(0, 0, w, w); grain(g, w, w, 1600, .08); for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(10,10,10,.6)'; g.beginPath(); let x = rr(0, w), y = rr(0, w); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rr(-20, 20); y += rr(-20, 20); g.lineTo(x, y) } g.stroke() } }), .9);
const walkM = M(tex(64, (g, w) => { g.fillStyle = '#6a6460'; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, w); grain(g, w, w, 500, .07); stains(g, w, w, 4) }), .95);
const NBM = { side: {}, on: new T.MeshBasicMaterial({ color: 0xd8a860, fog: true }), off: new T.MeshBasicMaterial({ color: 0x141820, fog: true }), frame: MC(0xd8d4c8, .7), cur: MC(0x6a2a20, 1), door: MC(0x3a2a1c, .7) };
const WM = { body: {}, glass: null, tyre: null, tail: null, leaf: null, bush: null, picket: null };
/* ---------- V6 environment pass: procedural trees, houses, fences, street lamps, lawn and road details.
   Everything is generated in code (no downloaded assets), shares a handful of canvas textures and is merged by mergeStatic. ---------- */
const ENVM = {};
function envMats() { if (ENVM.bark) return ENVM;
  ENVM.bark = M(tex(64, (g, w, h) => { g.fillStyle = '#3a2f26'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${rr(8, 34) | 0},${rr(6, 26) | 0},${rr(4, 18) | 0},${rr(.35, .8)})`; g.fillRect(rr(0, w), rr(0, h), rr(1, 3), rr(10, 46)) } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(120,110,90,${rr(.05, .15)})`; g.fillRect(rr(0, w), rr(0, h), 1, rr(6, 20)) } grain(g, w, h, 300, .1) }, 128), .95);
  ENVM.leaf = M(tex(128, (g, w) => { g.fillStyle = '#18220f'; g.fillRect(0, 0, w, w); const C = ['#2a3a1e', '#34482a', '#22301a', '#3e5230', '#2e4022', '#4a5e38', '#3a3c20', '#56683e']; for (let i = 0; i < 1300; i++) { g.fillStyle = C[i % C.length]; g.beginPath(); g.ellipse(rr(0, w), rr(0, w), rr(1.5, 4.5), rr(1, 2.5), rr(0, 3.2), 0, 7); g.fill() } }), .85, { vertexColors: true });
  ENVM.pine = M(tex(64, (g, w) => { g.fillStyle = '#0e160f'; g.fillRect(0, 0, w, w); for (let i = 0; i < 500; i++) { g.strokeStyle = ['#1a2a1c', '#223424', '#142016', '#2a3c2a'][i % 4]; g.beginPath(); const x = rr(0, w), y = rr(0, w); g.moveTo(x, y); g.lineTo(x + rr(-3, 3), y + rr(3, 7)); g.stroke() } }), .9, { vertexColors: true });
  const shTex = () => tex(128, (g, w) => { g.fillStyle = '#141312'; g.fillRect(0, 0, w, w); const rh = 10; for (let y = 0; y < w; y += rh) { const off = (y / rh) % 2 ? 9 : 0; for (let x = -18 + off; x < w; x += 18) { const v = rr(24, 48) | 0; g.fillStyle = `rgb(${v},${v - 3},${v - 6})`; g.fillRect(x + 1, y + 1, 16, rh - 2) } g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(0, y + rh - 1, w, 1) } stains(g, w, w, 7, '30,42,22') }); ENVM.shingle = M(shTex(), .95); ENVM.shTex = shTex;
  ENVM.brick = M(tex(64, (g, w) => { g.fillStyle = '#4e4a46'; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 8) for (let x = (y / 8) % 2 ? -8 : 0; x < w; x += 16) { const r = rr(80, 122) | 0; g.fillStyle = `rgb(${r},${r * .46 | 0},${r * .36 | 0})`; g.fillRect(x + 1, y + 1, 14, 6) } grain(g, w, w, 200, .1); stains(g, w, w, 3) }), .95);
  ENVM.trim = MC(0xd6d0c0, .7); ENVM.found = M(fill('#45433f', 360), 1); ENVM.gutter = MC(0x4a4a48, .5, { metalness: .4 });
  ENVM.shut = [MC(0x1e2a24, .7), MC(0x2c1e1a, .7), MC(0x1c2230, .7), MC(0x34322c, .7)]; ENVM.glass = MC(0x0b0f15, .22, { metalness: .65 }); ENVM.porchL = new T.MeshBasicMaterial({ color: 0xffc27a });
  ENVM.plank = M(tex(32, (g, w, h) => { g.fillStyle = '#3e2e22'; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${rr(10, 30) | 0},${rr(6, 20) | 0},4,${rr(.3, .7)})`; g.fillRect(rr(0, w), 0, 1, h) } g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h); stains(g, w, h, 3) }, 128), .9);
  ENVM.metal = MC(0x2e3032, .45, { metalness: .6 }); ENVM.manhole = M(tex(64, (g, w) => { g.fillStyle = '#242322'; g.fillRect(0, 0, w, w); g.strokeStyle = '#141413'; for (let i = 4; i < w; i += 6) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke() } grain(g, w, w, 200, .12) }), .6, { metalness: .5 });
  ENVM.patch = MC(0x1c1c1f, .95); ENVM.halo = new T.SpriteMaterial({ map: tex(64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,190,110,.9)'); gr.addColorStop(.25, 'rgba(255,160,80,.35)'); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w) }), color: 0xffffff, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: .75, fog: true });
  ENVM.halo.map.magFilter = T.LinearFilter; return ENVM }
/* merge geometries keeping vertex colours (crowns) */
function mergeC(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), C = new Float32Array(n * 3); let o = 0;
  for (const g of list) { const c = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2); if (g.attributes.color) C.set(g.attributes.color.array, o * 3); else C.fill(1, o * 3, (o + c) * 3); o += c; g.dispose() }
  const r = new T.BufferGeometry(); r.setAttribute('position', new T.BufferAttribute(P, 3)); r.setAttribute('normal', new T.BufferAttribute(N, 3)); r.setAttribute('uv', new T.BufferAttribute(U, 2)); r.setAttribute('color', new T.BufferAttribute(C, 3)); r.computeBoundingSphere(); return r }
/* a lumpy foliage blob: icosahedron (non-indexed) displaced by a position hash so shared corners stay closed; soft normals from the
   centre (reads as foliage, not facets); vertex colour darkens towards the underside (self-shadowing) */
function blob(geo, r, jit, cx, cy, cz, tint, sy = .85) { const g = geo.index ? geo.toNonIndexed() : geo, p = g.attributes.position, n = g.attributes.normal, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453, f = 1 + ((h - Math.floor(h)) - .5) * 2 * jit; x *= f; y *= f * sy; z *= f;
    const l = Math.hypot(x, y, z) || 1; n.setXYZ(i, x / l, y / l + .25, z / l); const sh = .42 + .58 * Math.min(1, Math.max(0, (y / r + 1) / 2)); col[i * 3] = tint[0] * sh; col[i * 3 + 1] = tint[1] * sh; col[i * 3 + 2] = tint[2] * sh; p.setXYZ(i, x + cx, y + cy, z + cz) }
  g.setAttribute('color', new T.BufferAttribute(col, 3)); return g }
const leafTint = () => { const v = rr(.78, 1.12); return [v * rr(.9, 1.1), v, v * rr(.85, 1.05)] };
function tree(x, z, s = 1, kind) { const E = envMats(), g = G(); kind = kind || (Math.random() < .2 ? 'pine' : 'oak'); const crown = G(); g.add(crown); const parts = [], near = x > -14 && x < 26 && z > -12 && z < 28, det = near ? 2 : 1;
  if (kind === 'pine') { P3(g, Cy(.09 * s, 2.2 * s, 7, .17 * s), E.bark, 0, 1.1 * s, 0); crown.position.y = 1.2 * s; const t0 = leafTint();
    for (let k = 0; k < 5; k++) { const r = (1.55 - k * .26) * s, h = 1.7 * s; parts.push(blob(new T.ConeGeometry(r, h, 10, 2), r, .16, rr(-.05, .05) * s, (k * .78 + .6) * s, rr(-.05, .05) * s, t0.map(v => v * (.85 + k * .06)), 1)) }
    P3(crown, mergeC(parts), E.pine) }
  else { P3(g, Cy(.12 * s, 2.9 * s, 8, .22 * s), E.bark, 0, 1.45 * s, 0); P3(g, Cy(.22 * s, .35 * s, 8, .34 * s), E.bark, 0, .17 * s, 0); // trunk + root flare
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + rr(-.4, .4), b = P3(g, Cy(.045 * s, 1.6 * s, 6, .085 * s), E.bark, Math.sin(a) * .45 * s, 2.75 * s, Math.cos(a) * .45 * s); b.rotation.set(Math.cos(a) * .7, 0, -Math.sin(a) * .7) } // main limbs into the crown
    crown.position.y = 3.5 * s; const n = 7 + (Math.random() * 3 | 0);
    for (let k = 0; k < n; k++) { const a = k / n * 6.283 + rr(-.3, .3), d = rr(.6, 1.35) * s, r = rr(.85, 1.3) * s; parts.push(blob(new T.IcosahedronGeometry(r, det), r, .2, Math.sin(a) * d, rr(-.35, 1.1) * s, Math.cos(a) * d, leafTint())) }
    parts.push(blob(new T.IcosahedronGeometry(1.15 * s, det), 1.15 * s, .2, 0, 1.5 * s, 0, leafTint())); P3(crown, mergeC(parts), E.leaf) }
  furn(g, x, 0, z, rr(0, 6), 0, .5, .5); if (near) { crown.userData.dyn = 1; EXT.trees.push({ c: crown, ph: rr(0, 6) }) } return g } // only trees near the house sway
function bush(x, z, s = 1) { const E = envMats(), g = G(), parts = []; for (let k = 0; k < 4; k++) { const r = rr(.32, .52) * s; parts.push(blob(new T.IcosahedronGeometry(r, 1), r, .22, rr(-.45, .45) * s, .3 * s, rr(-.3, .3) * s, leafTint().map(v => v * .9))) } P3(g, mergeC(parts), E.leaf); furn(g, x, 0, z); return g }
/* picket fence: pointed pickets on posts and two rails; privacy fence: textured boards, posts every 2.4 m and a cap rail */
let PICKET_G = null;
function fence(x0, z0, x1, z1, picket = 1) { const E = envMats(), len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0), g = G(), wm = picket ? (WM.picket || (WM.picket = MC(0xcfc8b8, .8))) : E.plank; const n = Math.floor(len / (picket ? .16 : .2));
  if (picket) { for (const y of [.33, .8]) P3(g, Bx(.05, .08, len), wm, -.02, y, len / 2); for (let k = 0; k <= Math.max(1, Math.round(len / 2.4)); k++) P3(g, Bx(.09, 1.1, .09), wm, -.03, .55, Math.min(len - .05, k * len / Math.max(1, Math.round(len / 2.4)))); P3(g, Cy(.035, .06, 6), wm, -.03, 1.13, 0);
    if (!PICKET_G) { const s = new T.Shape(); s.moveTo(-.045, 0); s.lineTo(.045, 0); s.lineTo(.045, .95); s.lineTo(0, 1.05); s.lineTo(-.045, .95); s.lineTo(-.045, 0); PICKET_G = new T.ExtrudeGeometry(s, { depth: .022, bevelEnabled: false }); PICKET_G.rotateY(Math.PI / 2); } }
  else { for (const y of [.3, 1.5]) P3(g, Bx(.06, .1, len), MAT.woodM, -.05, y, len / 2); P3(g, Bx(.12, .05, len), MAT.woodM, 0, 1.83, len / 2); const np = Math.max(1, Math.round(len / 2.4)); for (let k = 0; k <= np; k++) P3(g, Bx(.1, 1.9, .1), MAT.woodM, -.06, .95, Math.min(len - .05, k * len / np)) }
  const pg = picket ? PICKET_G : new T.BoxGeometry(.03, 1.8, .19); const im = new T.InstancedMesh(pg, wm, n), d = new T.Object3D();
  for (let i = 0; i < n; i++) { d.position.set(.03, picket ? 0 : .9, (i + .5) * len / n); d.rotation.z = picket ? 0 : rr(-.01, .01); d.updateMatrix(); im.setMatrixAt(i, d.matrix) } im.castShadow = true; g.add(im); g.position.set(x0, 0, z0); g.rotation.y = a; scene.add(g);
  col(Math.min(x0, x1) - .06, Math.max(x0, x1) + .06, Math.min(z0, z1) - .06, Math.max(z0, z1) + .06, 0); return g }
/* cobra-head street lamp with a soft halo (the halo follows the lamp's on/off state) */
function streetLamp(x, z, ry, light) { const E = envMats(), g = G(); P3(g, Cy(.07, 5.2, 8, .12), E.metal, 0, 2.6, 0); P3(g, Cy(.16, .5, 8, .2), E.metal, 0, .25, 0); const arm = P3(g, Cy(.035, 1.5, 6), E.metal, 0, 5.22, .7, Math.PI / 2 - .12);
  const head = P3(g, new T.SphereGeometry(.3, 10, 6), E.metal, 0, 5.18, 1.38); head.scale.set(.75, .32, 1.25); const lm = new T.MeshBasicMaterial({ color: 0xffb060 }); const b = P3(g, Bx(.34, .02, .5), lm, 0, 5.08, 1.38); b.userData.dyn = 1;
  const halo = new T.Sprite(E.halo.clone()); halo.scale.set(1.1, 1.1, 1); halo.position.set(0, 5.0, 1.38); halo.userData.dyn = 1; g.add(halo); furn(g, x, 0, z, ry, 0, .24, .24);
  let L = null; if (light) { L = new T.SpotLight(0xffa850, 3.2, 18, .9, .6, 1.6); const wp = new T.Vector3(0, 5, 1.38).applyAxisAngle(new T.Vector3(0, 1, 0), ry).add(new T.Vector3(x, 0, z)); L.position.copy(wp); L.target.position.set(wp.x, 0, wp.z); scene.add(L, L.target) }
  EXT.streetLamps.push({ b, lm, L, base: L ? L.intensity : 0, halo }); return g }
/* neighbour house: foundation, siding with corner boards, shingled roof with overhang + fascia + gutters, brick chimney, framed windows
   with sills, mullions and shutters, a covered front stoop with a porch light; some houses are single-storey ranches */
function nbHouse(x, z, ry, colr, lit, w = 10, d = 8) { const E = envMats(), g = G(), ranch = Math.random() < .3, H = ranch ? 3.1 : 5.4, wm = NBM.side[colr] || (NBM.side[colr] = photoSiding(colr)), shut = E.shut[Math.random() * 4 | 0];
  P3(g, uvBox(Bx(w, H, d), w, H, d), wm, 0, H / 2, 0); P3(g, uvBox(Bx(w + .12, .5, d + .12), w, .5, d), E.found, 0, .25, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P3(g, Bx(.14, H - .5, .14), E.trim, sx * (w / 2 + .01), (H + .5) / 2, sz * (d / 2 + .01));
  const rise = ranch ? 1.7 : 2.4, run = d / 2 + .45, L = Math.hypot(run, rise), ang = Math.atan2(rise, run);
  for (const s of [-1, 1]) { const r = P3(g, uvBox(Bx(w + .8, .12, L), w + .8, .12, L), E.shingle, 0, H + rise / 2 - .02, s * run / 2); r.rotation.x = s * ang; const f = P3(g, Bx(w + .84, .2, .05), E.trim, 0, H - .06, s * (run + .02)); P3(g, Bx(w + .8, .1, .12), E.gutter, 0, H - .14, s * (run + .08)) }
  P3(g, Bx(w + .84, .1, .3), E.shingle, 0, H + rise + .02, 0); // ridge cap
  const gs = new T.Shape(); gs.moveTo(-d / 2, 0); gs.lineTo(d / 2, 0); gs.lineTo(0, rise - .1); gs.lineTo(-d / 2, 0); const gg = new T.ExtrudeGeometry(gs, { depth: .05, bevelEnabled: false }); gg.rotateY(Math.PI / 2); // gable ends
  for (const sx of [-1, 1]) P3(g, gg, wm, sx * w / 2 - (sx > 0 ? 0 : .05), H, 0);
  P3(g, uvBox(Bx(.9, rise + 1.6, .9), .9, rise + 1.6, .9), E.brick, w / 2 - 1.5, H + (rise + 1.6) / 2 - .4, -d / 4); P3(g, Bx(1.0, .1, 1.0), MAT.conc, w / 2 - 1.5, H + rise + 1.2, -d / 4);
  P3(g, Cy(.04, H, 6), E.gutter, w / 2 + .05, H / 2, d / 2 + .1); P3(g, Cy(.04, H, 6), E.gutter, -w / 2 - .05, H / 2, -d / 2 - .1); // downspouts
  const doorX = -w / 2 + 1.3 + (w - 2.6) / 3, win = (wx, y, face, on) => { const zz = face * (d / 2), o = face * .03; const gm = on ? NBM.on : E.glass;
    P3(g, Bx(1.22, 1.46, .06), E.trim, wx, y, zz + o); P3(g, Bx(1.0, 1.24, .06), gm, wx, y, zz + o * 1.7); P3(g, Bx(.05, 1.24, .07), E.trim, wx, y, zz + o * 2); P3(g, Bx(1.0, .05, .07), E.trim, wx, y + .1, zz + o * 2);
    P3(g, Bx(1.4, .07, .18), E.trim, wx, y - .76, zz + face * .08); if (face > 0) for (const s of [-1, 1]) P3(g, Bx(.4, 1.42, .05), shut, wx + s * .84, y, zz + o); if (on) P3(g, Bx(.22, 1.2, .03), NBM.cur, wx - .36, y, zz + o * 2.3) };
  for (let fl = 0; fl < (ranch ? 1 : 2); fl++) for (let i = 0; i < 4; i++) { const wx = -w / 2 + 1.3 + i * (w - 2.6) / 3, y = 1.6 + fl * 2.5; if (fl === 0 && i === 1) continue; win(wx, y, 1, lit && Math.random() < .55) }
  for (let i = 0; i < 4; i += ranch ? 2 : 1) win(-w / 2 + 1.3 + i * (w - 2.6) / 3, ranch ? 1.6 : 4.1, -1, lit && Math.random() < .35);
  for (const s of [-1, 1]) for (let fl = 0; fl < (ranch ? 1 : 2); fl++) { const on = lit && Math.random() < .3; P3(g, Bx(.06, 1.24, 1.0), on ? NBM.on : E.glass, s * (w / 2 + .03), 1.6 + fl * 2.5, 0); P3(g, Bx(.05, 1.46, 1.22), E.trim, s * (w / 2 + .015), 1.6 + fl * 2.5, 0) }
  P3(g, Bx(1.0, 2.1, .06), NBM.door, doorX, 1.05 + .3, d / 2 + .03); P3(g, Bx(1.2, 2.25, .05), E.trim, doorX, 1.1 + .3, d / 2 + .015); // door raised on the foundation
  P3(g, Bx(2.6, .3, 1.7), MAT.conc, doorX, .15, d / 2 + .85); P3(g, Bx(2.0, .15, .4), MAT.conc, doorX, .075, d / 2 + 1.9); // stoop + step
  for (const s of [-1, 1]) P3(g, Cy(.07, 2.5, 8), E.trim, doorX + s * 1.1, 1.55, d / 2 + 1.5); const pr = P3(g, Bx(2.7, .12, 1.8), E.shingle, doorX, 2.86, d / 2 + .9); pr.rotation.x = .12; P3(g, Bx(2.75, .16, .05), E.trim, doorX, 2.76, d / 2 + 1.8);
  if (lit) P3(g, Bx(.12, .2, .1), E.porchL, doorX + .75, 2.1, d / 2 + .07);
  furn(g, x, 0, z, ry, 0, w + .2, d + .2); const cs = Math.cos(ry), sn = Math.sin(ry); for (const sd of [-1, 1]) { const lx = doorX + sd * 1.1, lz = d / 2 + 1.5, wx = x + lx * cs + lz * sn, wz = z - lx * sn + lz * cs; col(wx - .1, wx + .1, wz - .1, wz + .1, 0, 1) } return g } /* porch columns are solid */
/* lawn texture (blades + dry patches) replaces the flat green; road gets manholes, storm drains and asphalt patches */
/* CC0 photo textures from Poly Haven (see CREDITS.md), downscaled to 512 px; loaded once and shared */
const PTX = {}; function ptx(n, rx = 1, ry = rx, rot = 0) { const k = n + rx + '_' + ry + rot; if (PTX[k]) return PTX[k]; const t = new T.TextureLoader().load('tex/' + n + '.jpg'); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); if (rot) { t.center.set(.5, .5); t.rotation = rot } t.anisotropy = 4; t.encoding = T.sRGBEncoding; return PTX[k] = t }
const photoMat = (n, rx, ry, color = 0xffffff, rough = .9, rot = 0) => { const m = new T.MeshStandardMaterial({ map: ptx(n, rx, ry, rot), color, roughness: rough }); return m };
function photoSiding(c) { return photoMat('planks', 1, 1, new T.Color(c).lerp(new T.Color(0xffffff), .25).getHex(), .85) }
function envGround() { const E = envMats();
  /* swap the procedural canvases for photo textures where they read best */
  const sw = (m, t, c) => { m.map = t; if (c !== undefined) m.color.setHex(c); m.needsUpdate = true };
  sw(E.bark, ptx('bark', 1, 2), 0x9a9a9a); sw(E.shingle, ptx('roof', .35), 0xb0b0b0); sw(E.brick, ptx('brick', 1), 0xa8a8a8); sw(E.plank, ptx('siding', 1, 1, Math.PI / 2), 0xb0b0b0);
  sw(asphalt, ptx('asphalt', .5), 0x8a8a8a); sw(walkM, ptx('concrete', .7), 0x9a9a9a); sw(MAT.conc, ptx('concrete', 1), 0xa0a0a0);
  { MAT.roof.map = ptx('roof', .22); MAT.roof.color.setHex(0xb0b0b0); MAT.roof.needsUpdate = true; // our house: shingles, fascia, gutters, corner boards, chimney, shutters
    const top = FY[1] + WH + .12; for (const zz of [-.52, HD + .52]) { bx(HW / 2, top - .05, zz, HW + .84, .2, .05, E.trim, true); bx(HW / 2, top - .14, zz + (zz < 0 ? -.06 : .06), HW + .8, .1, .12, E.gutter, false) }
    for (const [cx, cz] of [[0, 0], [HW, 0], [0, HD], [HW, HD]]) bx(cx + (cx ? .01 : -.01), top / 2, cz + (cz ? .01 : -.01), .16, top, .16, E.trim, false);
    { const ch = bx(HW - 2.2, top + 1.3, HD * .3, .95, 3.0, .95, E.brick, true); ch.geometry = uvBox(Bx(.95, 3.0, .95), .95, 3.0, .95); bx(HW - 2.2, top + 2.85, HD * .3, 1.05, .1, 1.05, MAT.conc, false) }
    const sh = E.shut[0]; for (const [c, w] of [[1.3, 1.4], [4.5, 1.2], [7, 1.4], [8.9, 1.2]]) for (const sd of [-1, 1]) bx(p(c) + sd * (w / 2 + .24), 1.55, HD + .06, .4, 1.36, .05, sh, false) }
  MAT.grass.map = ptx('lawn', .6); MAT.grass.color.setHex(0x9aa08a); MAT.grass.needsUpdate = true; if (0) tex(128, (g, w) => { g.fillStyle = '#1b2614'; g.fillRect(0, 0, w, w); for (let i = 0; i < 1800; i++) { g.strokeStyle = ['#223018', '#18220f', '#2a381c', '#1e2a12', '#30361c', '#262a14'][i % 6]; const x = rr(0, w), y = rr(0, w); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-1.5, 1.5), y - rr(2, 5)); g.stroke() } for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(70,60,30,.12)'; g.beginPath(); g.ellipse(rr(0, w), rr(0, w), rr(8, 22), rr(6, 14), 0, 0, 7); g.fill() } }); MAT.grass.needsUpdate = true;
  for (const x of [-36, -8, 20, 46]) { const m = P3(scene, new T.CylinderGeometry(.34, .34, .03, 16), E.manhole, x, .0, 19.4 + rr(-.6, .6)); m.receiveShadow = true }
  for (let x = -48; x < 62; x += 14) for (const z of [16.78, 22.72]) { const gr = P3(scene, Bx(.8, .02, .22), E.manhole, x + rr(-2, 2), .005, z) }
  for (let i = 0; i < 9; i++) { const pw = rr(1.2, 3.5), pd = rr(.8, 2.2), m = P3(scene, Bx(pw, .006, pd), E.patch, rr(-45, 60), .004, rr(17.5, 22)); m.receiveShadow = true } }

function mergeG(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0; for (const g of list) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count } const r = new T.BufferGeometry(); r.setAttribute('position', new T.BufferAttribute(P, 3)); r.setAttribute('normal', new T.BufferAttribute(N, 3)); r.setAttribute('uv', new T.BufferAttribute(U, 2)); return r }
/* ---------- old American sedan (late-70s/80s full-size): extruded side profile with real wheel arches, a separate greenhouse,
   chrome bumpers and trim, quad headlamps, tall tail lamps, whitewall tyres. One builder for every car in the game. ---------- */
const SED = { L: 5.2, W: 1.9, arch: [[-1.55, .37], [1.55, .37]], ar: .45 };
function grimeTex() { if (WM.grime) return WM.grime; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${90 + Math.random() * 40 | 0},${80 + Math.random() * 30 | 0},70,${Math.random() * .08})`; g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2) }
  const gr = g.createLinearGradient(0, 128, 0, 60); gr.addColorStop(0, 'rgba(80,70,55,.35)'); gr.addColorStop(1, 'rgba(80,70,55,0)'); g.fillStyle = gr; g.fillRect(0, 60, 128, 68);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(.6, 1.1); return WM.grime = t }
function sedanPaint(c) { return WM.body[c] || (WM.body[c] = new T.MeshStandardMaterial({ color: c, map: grimeTex(), roughness: .52, metalness: .28 })) }
function sedShape(x0, x1, hollow) { const s = new T.Shape(), A = SED.arch, r = SED.ar; // side outline between x0..x1 (front = +x)
  const top = x => x > 1.05 ? .93 - (x - 1.05) * .055 : x < -1.5 ? .93 - (-1.5 - x) * .03 : .93;
  s.moveTo(x0, .3); for (const [cx, cy] of A) { if (cx - r > x0 && cx + r < x1) { s.lineTo(cx - r - .04, .3); s.absarc(cx, cy, r + .04, Math.PI, 0, true); } } s.lineTo(x1, .3);
  if (x1 > 2.5) { s.lineTo(2.63, .38); s.lineTo(2.66, .62); s.quadraticCurveTo(2.65, .8, 2.5, .855) } else s.lineTo(x1, top(x1));
  if (x0 < -2.5) { s.lineTo(-2.48, .88); s.quadraticCurveTo(-2.64, .84, -2.66, .64); s.lineTo(-2.62, .38) } else s.lineTo(x0, top(x0)); s.lineTo(x0, .3); return s }
function extr(shape, depth, mat, z = 0, bevel = .035) { const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 }); g.translate(0, 0, -depth / 2 + z); return new T.Mesh(g, mat) }
function sedan(c, o = {}) { const g = G(), paint = o.paint || sedanPaint(c); WM.chrome = WM.chrome || MC(0xd0d4d8, .18, { metalness: .95 }); WM.rub = WM.rub || MC(0x0f0f10, .92); WM.ww = WM.ww || MC(0xe8e6de, .7);
  WM.tail = WM.tail || new T.MeshBasicMaterial({ color: 0x7a1410 }); WM.lamp = WM.lamp || new T.MeshBasicMaterial({ color: 0xd8d4c0 }); WM.grill = WM.grill || MC(0x141516, .5, { metalness: .6 });
  const glass = o.glass || (WM.glass2 = WM.glass2 || new T.MeshStandardMaterial({ color: 0x1c2630, roughness: .08, metalness: .9, transparent: true, opacity: .78 })), W = SED.W - .08;
  if (o.hollow) { // our car: open cabin so the interior is visible through the glass
    g.add(extr(sedShape(1.0, 2.66), W, paint)); g.add(extr(sedShape(-2.66, -1.0), W, paint)); { const sp = extr(sedShape(-1.0, 1.0), .05, paint, W / 2 - .02, .015); g.add(sp); g.add(extr(sedShape(-1.0, -.05), .05, paint, -(W / 2 - .02), .015));
      const dp = G(); dp.position.set(1.0, 0, -(W / 2 - .02)); dp.userData.dyn = 1; const dm = extr(sedShape(-.05, 1.0), .05, paint, 0, .015); dm.geometry.translate(-1.0, 0, 0); dp.add(dm); g.add(dp); g.userData.door = dp } /* driver door hinged at its front edge so it can swing open in the exit cutscene */
  } else g.add(extr(sedShape(-2.66, 2.66), W, paint));
  const gh = new T.Shape(); gh.moveTo(1.08, .93); gh.lineTo(.3, 1.44); gh.lineTo(-.95, 1.44); gh.lineTo(-1.52, .93); gh.lineTo(1.08, .93); g.add(extr(gh, W - .2, glass, 0, .02));
  const rf = new T.Shape(); rf.moveTo(.32, 1.43); rf.lineTo(-.97, 1.43); rf.lineTo(-.95, 1.48); rf.lineTo(.3, 1.48); g.add(extr(rf, W - .14, paint, 0, .02));
  for (const s of [-1, 1]) { const z = s * (W / 2 - .09); for (const [x0, y0, x1, y1] of [[1.08, .93, .3, 1.44], [-.95, 1.44, -1.52, .93]]) { const l = Math.hypot(x1 - x0, y1 - y0), p = P3(g, Bx(.07, l, .06), paint, (x0 + x1) / 2, (y0 + y1) / 2, z); p.rotation.z = Math.atan2(x0 - x1, y1 - y0) } P3(g, Bx(.08, .5, .06), paint, -.32, 1.18, z) } // A, C and B pillars
  for (const s of [-1, 1]) { P3(g, Bx(4.9, .03, .02), WM.chrome, 0, .72, s * (W / 2 + .045)); P3(g, Bx(2.5, .022, .02), WM.chrome, -.22, .935, s * (W / 2 - .085)); P3(g, Bx(.16, .03, .03), WM.chrome, .35, .82, s * (W / 2 + .05)); P3(g, Bx(.16, .03, .03), WM.chrome, -.75, .82, s * (W / 2 + .05)) } // trim, handles
  for (const x of [2.72, -2.72]) P3(g, RG(.16, .17, 1.98, .06), WM.chrome, x, .43, 0); // bumpers
  P3(g, Bx(.05, .22, 1.02), WM.grill, 2.66, .62, 0); for (let k = 0; k < 4; k++) P3(g, Bx(.02, .012, 1.0), WM.chrome, 2.69, .54 + k * .055, 0); P3(g, Bx(.03, .26, .03), WM.chrome, 2.69, .62, 0);
  for (const s of [-1, 1]) { for (const z of [.6, .79]) { P3(g, Cy(.072, .04, 14), WM.chrome, 2.66, .66, s * z, 0, 0, Math.PI / 2); P3(g, Cy(.06, .045, 14), WM.lamp, 2.67, .66, s * z, 0, 0, Math.PI / 2) } P3(g, Bx(.04, .24, .16), WM.tail, -2.67, .64, s * .74); P3(g, Bx(.035, .06, .1), WM.lamp, -2.67, .5, s * .74) }
  for (const s of [-1, 1]) { const m = P3(g, Bx(.12, .07, .05), WM.chrome, .9, 1.0, s * (W / 2 + .07)); P3(g, Cy(.012, .07, 6), WM.chrome, .9, .96, s * (W / 2 + .03)) } // mirrors
  for (const [wx, wz] of [[1.55, 1], [-1.55, 1], [1.55, -1], [-1.55, -1]]) { const z = wz * (SED.W / 2 - .07); P3(g, Cy(.37, .24, 20), WM.rub, wx, .37, z, Math.PI / 2); const ww = new T.Mesh(new T.TorusGeometry(.26, .045, 6, 20), WM.ww); ww.position.set(wx, .37, z + wz * .12); g.add(ww); P3(g, Cy(.19, .02, 16), WM.chrome, wx, .37, z + wz * .125, Math.PI / 2); P3(g, Cy(.05, .03, 10), WM.chrome, wx, .37, z + wz * .14, Math.PI / 2) }
  return g }
function car(x, z, ry, c) { const g = sedan(c); const across = Math.abs(Math.sin(ry)) > .5; furn(g, x, 0, z, ry, 0, across ? 1.95 : 5.4, across ? 5.4 : 1.95); return g }
function mailbox(x, z, num, ry = 0) { const g = G(); P3(g, Bx(.08, 1.05, .08), MAT.woodM, 0, .52, 0); P3(g, RG(.22, .24, .48, .1), MC(0x1c2a3a, .5, { metalness: .4 }), 0, 1.15, 0); P3(g, new T.PlaneGeometry(.3, .1), M(tex(64, (c, s) => { c.fillStyle = '#e8e2d0'; c.fillRect(0, 0, s, s); c.fillStyle = '#111'; c.font = 'bold 34px monospace'; c.fillText(num, 2, 44) }, 32)), .115, 1.15, 0, 0, Math.PI / 2); furn(g, x, 0, z, ry, 0, .2, .2); return g }
/* one neighbour lot: driveway, front path, mailbox, picket fence, a tree or two, sometimes a car in the driveway (side: 1 = our side of the street, -1 = across) */
function lot(x, side) { const zf = side > 0 ? 8 : 27, zs = side > 0 ? 15.6 : 23.9, dx = x + (side > 0 ? 3.6 : -3.6);
  bx(dx, .01, (zf + zs) / 2, 3, .02, Math.abs(zs - zf), MAT.conc, false); bx(x - (side > 0 ? 1.4 : -1.4), .01, (zf + zs) / 2, 1.1, .02, Math.abs(zs - zf), MAT.conc, false);
  mailbox(x - (side > 0 ? 2.6 : -2.6), side > 0 ? 15.5 : 24.1, String(1400 + Math.round(x / 2) * 2 + (side > 0 ? 1 : 0)), side > 0 ? 0 : Math.PI);
  const fz = side > 0 ? 15.0 : 24.6; fence(x - 9, fz, x - 2.2, fz); fence(x - .6, fz, dx - 1.8, fz); fence(x - 9, side > 0 ? -8 : fz, x - 9, side > 0 ? fz : 36, 0);
  tree(x + (side > 0 ? -6 : 6), side > 0 ? 12 : 26.5, rr(.9, 1.3)); bush(x - 3, side > 0 ? 8.6 : 26.6); bush(x + 2, side > 0 ? 8.6 : 26.6);
  if (Math.random() < .55) car(dx, side > 0 ? 11.5 : 29.5, Math.PI / 2, [0x2a3440, 0x4a2a24, 0x5a5a54, 0x1e2a22, 0x6a6a64][Math.floor(Math.random() * 5)]) }
function buildExterior() {
  skyDome(); envGround(); scene.fog.color.setHex(0x1a1520); scene.fog.density = .028; scene.background.setHex(0x120f1a);
  // our lot: front path with low path lights (ref), porch, driveway, gate in picket fence
  bx(3.7, .01, 12.9, 1.3, .02, 4.3, walkM, false); bx(10.6, .01, 13.2, 3.2, .02, 6.8, MAT.conc, false); bx(3.7, .02, 10.45, 2.6, .06, 1.26, MAT.woodM, true); /* porch deck sits on the ground and stops at the wall line: it used to float at 0.35 m and poke 10 cm through the front doorway */
  for (const sx of [2.6, 4.8]) { P3(scene, Cy(.07, 2.6, 8), MC(0xd8d4c8, .7), sx, 1.3, 11.0) } bx(3.7, 2.62, 10.4, 2.8, .1, 1.5, MC(0xd8d4c8, .7), true);
  for (let i = 0; i < 5; i++) for (const sx of [-.85, .85]) { const g = G(); P3(g, Cy(.025, .3, 6), MAT.dark, 0, .15, 0); const b = P3(g, new T.SphereGeometry(.045, 8, 6), new T.MeshBasicMaterial({ color: 0xffe0a0 }), 0, .32, 0); b.userData.dyn = 1; furn(g, 3.7 + sx, 0, 11.6 + i * .75); EXT.pathLights.push(b) }
  fence(-2.5, 15.0, 2.9, 15.0); fence(4.5, 15.0, 9.0, 15.0); fence(-2.5, -8, 15.5, -8, 0); fence(-2.5, -8, -2.5, 15.0, 0); fence(15.5, -8, 15.5, 6, 0); fence(15.5, 9, 15.5, 15.0, 0);
  mailbox(2.4, 15.5, '1407'); 
  // sidewalks + road + curbs
  bx(6, .02, 15.8, 120, .04, 1.6, walkM, false); bx(6, -.01, 19.8, 120, .02, 6.2, asphalt, false); bx(6, .02, 23.7, 120, .04, 1.6, walkM, false);
  for (const z of [16.62, 22.88]) bx(6, .06, z, 120, .12, .12, MAT.conc, false); for (let x = -50; x < 60; x += 6) bx(x, .005, 19.8, 2.4, .01, .12, new T.MeshBasicMaterial({ color: 0x8a8060 }), false);
  // neighbourhood: every lot along the street is built - same side, across the street, and the row whose backyards meet ours
  const COLS = ['#c8c4b4', '#a8b0ac', '#d0ccc0', '#b8b2a2', '#c8c0b0', '#9aa4a8', '#c0b8a8', '#b4a890', '#a8a4a0', '#c4ccc8', '#d4c8b0', '#98a0a8'];
  let ci = 0; const col_ = () => COLS[(ci++) % COLS.length];
  for (const x of [-50, -31, -12.5, 25.5, 44, 62]) { nbHouse(x, 4, 0, col_(), Math.random() < .8); lot(x, 1) }
  for (const x of [-48, -34, -20, -6, 8, 22, 36, 50, 64]) { nbHouse(x, 31, Math.PI, col_(), Math.random() < .75); lot(x, -1) }
  for (const x of [-40, -22, -4, 14, 32, 50]) { nbHouse(x, -20, Math.PI, col_(), Math.random() < .6, 10, 8); fence(x - 9, -14.5, x + 9, -14.5, 0); tree(x + rr(-6, 6), -12.5 + rr(-1, 1), rr(.9, 1.3)) }
  for (const x of [-40, -22, -4, 14, 32, 50]) { tree(x + 8, -26, 1.2); tree(x - 3, -27, 1) }
  for (const x of [-56, -40, -20, 2, 22, 40, 58]) { tree(x, 36, rr(1, 1.4)); tree(x + 7, 37.5, rr(.9, 1.2)) } // trees behind the far row hide the edge of the world
  for (const z of [-30, -12, 6, 24, 40]) { tree(-62, z, 1.3); tree(74, z, 1.3) }
  for (const [x, z, s] of [[-24, 14, 1.1], [-41, 13, 1], [35, 13.5, 1.2], [53, 12.8, 1], [-28, 26.5, 1.1], [15, 26, 1], [43, 26.2, 1.1], [57, 26.5, 1], [-41, 26, 1.2]]) tree(x, z, s);
  for (const x of [-38, -4, 52]) streetLamp(x, 16.4, 0, 1); for (const x of [-30, 0, 48, 66]) streetLamp(x, 23.2, Math.PI, 1);
  place('covered-car', { x: 10.6, z: 12.6, l: 0, ry: Math.PI / 2, h: 1.4 }); col(9.6, 11.6, 10.0, 15.2, 0); /* Richard's car under a dust cover (Poly Haven CC0), same footprint as the old parked car */ /* street is kept clear: only the player's car drives/parks on it; other cars sit in driveways */
  for (const [x, z, s] of [[-4.5, 13, 1.1], [-6, 2, 1.3], [16.6, 12.5, 1], [17.5, -2, 1.2], [6, -5.5, 1.4], [0, -6, 1], [12, -6.5, 1.1], [19, 24.5, 1.2], [1, 25.2, 1.3], [30, 24.8, 1], [-15, 24.9, 1.1]]) tree(x, z, s); /* no trees on the carriageway (z 16.7-22.9) */
  for (const [x, z] of [[1.5, 10.5], [6, 10.4], [-.5, 10.3], [8, 10.2], [13.6, 8.5], [13.8, 4]]) bush(x, z);
  streetLamp(.5, 16.4, 0, 1); streetLamp(16, 23.2, Math.PI, 1); streetLamp(-22, 16.4, 0, 0); streetLamp(34, 23.2, Math.PI, 0);
  // power pole + service drop to the east wall, and the meter box the intruder tampers with
  { const g = G(); P3(g, Cy(.13, 8.5, 8, .17), MC(0x3a2a1e, .9), 0, 4.25, 0); P3(g, Bx(1.8, .1, .1), MC(0x3a2a1e, .9), 0, 7.9, 0); P3(g, Cy(.25, .6, 10), MC(0x5a5a58, .5), .3, 7.2, 0); furn(g, 17.5, 0, 16.2, 0, 0, .3, .3) }
  { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new T.Vector3(17.5 + (13.1 - 17.5) * t, 7.85 + (4.6 - 7.85) * t - Math.sin(t * Math.PI) * .7, 16.2 + (1.2 - 16.2) * t)) } EXT.poleWire = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x050505 })); scene.add(EXT.poleWire); scene.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-40, 7.9, 16.2), new T.Vector3(17.5, 7.9, 16.2), new T.Vector3(70, 7.9, 16.2)]), new T.LineBasicMaterial({ color: 0x050505 }))) }
  { const g = G(); P3(g, Bx(.1, .5, .38), MC(0x6a6e6a, .5, { metalness: .5 })); P3(g, Cy(.09, .04, 14), MC(0x9ab0b8, .1), .06, .05, 0, 0, 0, Math.PI / 2); P3(g, Cy(.03, 3.2, 6), MAT.dark, 0, 1.85, 0); furn(g, HW + .13, 1.4, 1.2, 0, 0); EXT.meter = { x: HW + .6, z: 1.2 } }
  // security floodlights (CCTV deterrent): front (porch) + east side
  for (const [k, x, y, z, tx, tz] of [['front', 3.7, 2.55, 10.1, 4, 15], ['side', HW + .1, 2.6, 6.5, 14.5, 1], ['drive', HW - .3, 2.7, 9.95, 11, 14.5], ['back', HW - .5, 2.6, -.12, 8.5, -6.8]]) { const L = new T.SpotLight(0xf0f4ff, 0, 22, .7, .35, 1.2); L.position.set(x, y, z); L.target.position.set(tx, 0, tz); scene.add(L, L.target); const g = G(); P3(g, Bx(.22, .14, .14), MAT.dark); const lens = P3(g, Bx(.18, .1, .02), new T.MeshBasicMaterial({ color: 0x202020 }), 0, 0, .08); lens.userData.dyn = 1; furn(g, x, y, z + (k === 'front' ? .05 : 0), { front: 0, side: Math.PI / 2, drive: 0, back: Math.PI }[k], 0); EXT.spots[k] = { L, lens, t: 0 } }
}
function extTick(dt, now) {
  for (const t of EXT.trees) { t.c.rotation.z = Math.sin(now / 1900 + t.ph) * .02; t.c.rotation.x = Math.sin(now / 2300 + t.ph) * .015 }
  if (EXT.sky) EXT.sky.rotation.y += dt * .002;
  EXT.streetLamps.forEach((s, i) => { let on = 1; if (i === 0 && S.lampFlicker > 0) on = Math.random() < .5 ? 1 : 0; if (s.L) s.L.intensity = s.base * on; s.lm.color.setHex(on ? 0xffb060 : 0x2a1a0a); if (s.halo) s.halo.visible = !!on });
  for (const k in EXT.spots) { const s = EXT.spots[k]; s.t = Math.max(0, s.t - dt); s.L.intensity = s.t > 0 ? 4.5 : 0; s.lens.material.color.setHex(s.t > 0 ? 0xffffff : 0x202020) }
  for (const b of EXT.pathLights) b.visible = S.power;
}
