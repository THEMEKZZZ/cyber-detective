/* Cyber Detective v3 — core: renderer, post-process, textures, materials, helpers.
   Continues v2: same globals/naming (T, S, P, COL, DOORS, IT, ROOMS, bx, wall, dr, room, sw). */
const T = THREE, $ = s => document.querySelector(s), rr = (a, b) => a + Math.random() * (b - a), cl = (v, a, b) => Math.max(a, Math.min(b, v));
let OPT = { sens: 5, res: .6, vol: 70, diff: 'normal', micMode: 'ask', micSens: 5 }; try { Object.assign(OPT, JSON.parse(localStorage.getItem('cd4o') || '{}')) } catch (e) { }
function saveOpt() { try { localStorage.setItem('cd4o', JSON.stringify(OPT)) } catch (e) { } }
/* house scale: v2 floor plan (10 x 7.5 m) enlarged x1.3 -> 13 x 9.75 m, taller storeys */
const K = 1.3, HW = 13, HD = 9.75, FY = [0, 2.9], WH = 2.75;
const S = { mode: 'menu', paused: false, power: true, t: 0, key: 0, pc: false, pcK: 0, noLock: false, sel: 0, flick: 0, ended: false, inv: {} };
const COL = [], DOORS = [], IT = [], ROOMS = {}; let locked = false, PY = 0, P = { x: 3.7, z: 8.6, yaw: 0, pitch: 0 };
/* ---------- renderer + low-res render target + analog post pass ---------- */
const cv = $('#g'), ren = new T.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
ren.outputEncoding = T.sRGBEncoding; ren.shadowMap.enabled = false; ren.setPixelRatio(1);
const scene = new T.Scene(); scene.background = new T.Color(0x05070a); scene.fog = new T.FogExp2(0x070908, .06);
const cam = new T.PerspectiveCamera(70, 1, .04, 60); cam.rotation.order = 'YXZ'; scene.add(cam);
const amb = new T.HemisphereLight(0x3a4048, 0x1a140e, .35); scene.add(amb);
const moon = new T.DirectionalLight(0x6f86a8, .25); moon.position.set(-12, 14, 18); scene.add(moon);
const RTM = new T.WebGLRenderTarget(4, 4, { minFilter: T.LinearFilter, magFilter: T.NearestFilter, encoding: T.sRGBEncoding });
const postM = new T.ShaderMaterial({ uniforms: { tD: { value: RTM.texture }, t: { value: 0 }, ca: { value: 1 }, gr: { value: .055 }, res: { value: new T.Vector2(1, 1) } },
  vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader: `uniform sampler2D tD;uniform float t,ca,gr;uniform vec2 res;varying vec2 v;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+t*61.7)*43758.5453);}
  void main(){vec2 c=v-.5;float d=dot(c,c);vec2 o=c*d*.012*ca;
   vec3 col=vec3(texture2D(tD,v+o).r,texture2D(tD,v).g,texture2D(tD,v-o).b);
   col=mix(col,(texture2D(tD,v+vec2(1.5/res.x,0.)).rgb+texture2D(tD,v-vec2(1.5/res.x,0.)).rgb)*.5,.25);
   float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,.78)*vec3(1.05,1.,.9);
   col+=(h(v*res)-.5)*gr;col*=.96+.04*sin(v.y*res.y*3.14159);col*=1.-d*1.25;
   gl_FragColor=vec4(col,1.);}`, depthTest: false, depthWrite: false });
const postS = new T.Scene(), postC = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1); postS.add(new T.Mesh(new T.PlaneGeometry(2, 2), postM));
let RS = OPT.res;
function size() { ren.setSize(innerWidth, innerHeight, false); RTM.setSize(Math.max(2, innerWidth * RS | 0), Math.max(2, innerHeight * RS | 0)); postM.uniforms.res.value.set(innerWidth * RS, innerHeight * RS); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() }
addEventListener('resize', size); size();
/* ---------- procedural low-fi textures (canvas) ---------- */
function tex(w, fn, h) { const c = document.createElement('canvas'); c.width = w; c.height = h || w; fn(c.getContext('2d'), w, h || w); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.magFilter = T.NearestFilter; t.minFilter = T.LinearMipmapLinearFilter; t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t }
const grain = (g, w, h, n, a = .07) => { for (let i = 0; i < n; i++) { const v = Math.random() < .5 ? 0 : 255; g.fillStyle = `rgba(${v},${v},${v},${rr(.01, a)})`; g.fillRect(Math.random() * w, Math.random() * h, rr(1, w / 6), rr(1, h / 6)) } };
const stains = (g, w, h, n, col = '60,40,20') => { for (let i = 0; i < n; i++) { const x = rr(0, w), y = rr(0, h), r = rr(6, w / 3), gd = g.createRadialGradient(x, y, 0, x, y, r); gd.addColorStop(0, `rgba(${col},${rr(.05, .18)})`); gd.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gd; g.fillRect(x - r, y - r, 2 * r, 2 * r) } };
const fill = (c, n = 260, w = 64) => tex(w, (g, s) => { g.fillStyle = c; g.fillRect(0, 0, s, s); grain(g, s, s, n) });
/* wallpaper: 128 x 256 texture mapped to full storey height (skirting at bottom, cornice at top) */
function paper(base, ink, kind, opt = {}) {
  return tex(128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = ink; g.fillStyle = ink;
    if (kind === 'stripe') for (let x = 0; x < w; x += 16) { g.globalAlpha = .55; g.fillRect(x, 0, 5, h); g.globalAlpha = .25; g.fillRect(x + 8, 0, 1, h) }
    if (kind === 'damask') for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 16; x < w; x += 32) { g.globalAlpha = .45; g.beginPath(); g.moveTo(x, y - 9); g.quadraticCurveTo(x + 8, y, x, y + 9); g.quadraticCurveTo(x - 8, y, x, y - 9); g.fill(); g.globalAlpha = .3; g.fillRect(x - 1, y - 13, 2, 26) }
    if (kind === 'floral') for (let y = 6; y < h; y += 22) for (let x = (y % 44 ? 11 : 0); x < w; x += 22) { g.globalAlpha = .45; for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.arc(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.2, 0, 7); g.fill() } g.globalAlpha = .25; g.fillRect(x + 3, y + 4, 1, 7) }
    if (kind === 'plaster') { grain(g, w, h, 900, .05) }
    g.globalAlpha = 1;
    if (opt.wains) { g.fillStyle = opt.wains; g.fillRect(0, h * .64, w, h * .36); g.fillStyle = 'rgba(0,0,0,.35)'; for (let x = 0; x < w; x += 32) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeRect(x + 4, h * .68, 24, h * .26) } g.fillStyle = '#2c1d12'; g.fillRect(0, h * .63, w, 4) }
    g.fillStyle = opt.skirt || '#2e2015'; g.fillRect(0, h - 12, w, 12); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, h - 12, w, 1);
    g.fillStyle = opt.cornice || 'rgba(225,215,190,.9)'; g.fillRect(0, 0, w, 5); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 5, w, 2);
    stains(g, w, h, opt.st || 10); g.fillStyle = 'rgba(40,30,15,.18)'; g.fillRect(0, h * .55, w, h * .45 - 12); grain(g, w, h, 500, .05);
    if (opt.peel) for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(90,85,70,.8)'; g.beginPath(); const x = rr(0, w), y = rr(20, h - 40); g.moveTo(x, y); for (let k = 0; k < 6; k++)g.lineTo(x + rr(-14, 14), y + rr(-14, 14)); g.fill() }
  }, 256);
}
const planks = (c1, c2) => tex(128, (g, w) => { const n = 8; for (let i = 0; i < n; i++) { const off = rr(0, w); g.fillStyle = i % 2 ? c1 : c2; g.fillRect(0, i * w / n, w, w / n); g.fillStyle = `rgba(0,0,0,${rr(0, .25)})`; g.fillRect(0, i * w / n, w, w / n); for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(20,10,0,${rr(.05, .2)})`; g.fillRect(0, i * w / n + rr(1, w / n - 1), w, 1) } g.fillStyle = 'rgba(8,4,0,.8)'; g.fillRect(0, i * w / n, w, 1); g.fillRect(off, i * w / n, 1, w / n); g.fillRect((off + w / 2) % w, i * w / n, 1, w / n) } grain(g, w, w, 500); stains(g, w, w, 4) });
const tiles = (a, b, s = 8, gr = '#3a3a36') => tex(128, (g, w) => { const z = w / s; for (let i = 0; i < s; i++)for (let j = 0; j < s; j++) { g.fillStyle = (i + j) % 2 && b ? b : a; g.fillRect(i * z, j * z, z, z); g.fillStyle = `rgba(0,0,0,${rr(0, .12)})`; g.fillRect(i * z, j * z, z, z) } g.strokeStyle = gr; for (let i = 0; i <= s; i++) { g.fillStyle = gr; g.fillRect(i * z, 0, 1, w); g.fillRect(0, i * z, w, 1) } stains(g, w, w, 6); grain(g, w, w, 400) });
const woodT = (c) => tex(64, (g, w) => { g.fillStyle = c; g.fillRect(0, 0, w, w); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${rr(0, 30) | 0},${rr(0, 15) | 0},0,${rr(.08, .3)})`; g.fillRect(0, rr(0, w), w, rr(.5, 2)) } grain(g, w, w, 200, .05) });
const fabric = (c, n = 400) => tex(64, (g, w) => { g.fillStyle = c; g.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 2) { g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(i, 0, 1, w); g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, i, w, 1) } grain(g, w, w, n, .06) });
const M = (map, r = .9, x = {}) => new T.MeshStandardMaterial(Object.assign({ map, roughness: r }, x));
const MC = (c, r = .8, x = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, x));
/* materials */
const MAT = {
  living: M(paper('#5d6346', '#3e4430', 'damask', { st: 14 })), kitchen: M(paper('#b9ac83', '#8a7d58', 'stripe', { wains: '#6a5a40', st: 16 })),
  bath: M(tiles('#9fa8a0', '#8e978f', 8, '#5a605a')), store: M(paper('#6a685e', '#555', 'plaster', { st: 26, skirt: '#3a3a36' })),
  bedA: M(paper('#8d7468', '#6a4a44', 'floral', { st: 12 })), bedB: M(paper('#5f6b72', '#46525a', 'stripe', { st: 12 })),
  bedC: M(paper('#4c5a44', '#36402f', 'damask', { st: 30, peel: 1 })), hall: M(paper('#7a6a4c', '#5b4c34', 'stripe', { wains: '#3d2a1b' })),
  comp: M(paper('#56604f', '#424b3c', 'plaster', { st: 18 })), ext: M(tex(64, (g, w) => { g.fillStyle = '#b8b4a6'; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 8) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, y, w, 1); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, y + 1, w, 1) } grain(g, w, w, 300); stains(g, w, w, 6) })),
  floor: M(planks('#5a3f28', '#4b3421'), .55), floorUp: M(planks('#634630', '#563c27'), .6), ktile: M(tiles('#8c8a78', '#4e4c42', 8), .4), btile: M(tiles('#c2c4bc', null, 12, '#7a7c76'), .3),
  conc: M(fill('#575650', 600), 1), ceil: M(fill('#9a9480', 200), 1), grass: M(fill('#202c1a', 700), 1), roof: M(fill('#2c2926', 400)),
  dark: MC(0x1c1d1f, .5), metal: MC(0x80847f, .35, { metalness: .6 }), brass: MC(0xa8853f, .35, { metalness: .8 }), chrome: MC(0xb8bcc0, .2, { metalness: .9 }),
  wood: M(woodT('#3b2618'), .55), woodM: M(woodT('#5a3d26'), .6), woodL: M(woodT('#7a5838'), .6), doorM: M(woodT('#43301f'), .6),
  white: MC(0xd8d4c8, .5), porcelain: MC(0xe8e6de, .15), sheet: M(fabric('#b4ab98'), 1), sheetG: M(fabric('#56644a'), 1), sheetB: M(fabric('#4c3f3a'), 1),
  fab: M(fabric('#4d5448'), 1), fabR: M(fabric('#6a3a2c'), 1), rug: null, glass: new T.MeshStandardMaterial({ color: 0x6a8a9a, transparent: true, opacity: .18, roughness: .05, depthWrite: false }),
  paper: MC(0xd9d2bf, .9), card: M(tex(64, (g, w) => { g.fillStyle = '#8a6a44'; g.fillRect(0, 0, w, w); g.fillStyle = '#a0814f'; g.fillRect(0, w * .45, w, w * .1); grain(g, w, w, 200) }), 1),
};
/* ---------- geometry helpers ---------- */
const G = () => new T.Group(), Bx = (w, h, d) => new T.BoxGeometry(w, h, d), Cy = (r, h, n = 12, r2) => new T.CylinderGeometry(r, r2 === undefined ? r : r2, h, n);
function uvBox(g, w, h, d) { const u = g.attributes.uv, Sx = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++)for (let i = 0; i < 4; i++) { const k = f * 4 + i; u.setXY(k, u.getX(k) * Sx[f][0] / 1.5, u.getY(k) * Sx[f][1] / 1.5) } return g }
function bx(x, y, z, w, h, d, m, sh = true, par = scene) { const o = new T.Mesh(uvBox(new T.BoxGeometry(w, h, d), w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = sh; par.add(o); return o }
function RG(w, h, d, r, seg = 4) { const s = new T.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2 - .001, h / 2 - .001); s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); const g = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: Math.min(.012, d / 4), bevelSize: Math.min(.01, r / 2), bevelSegments: 2, curveSegments: seg }); g.translate(0, 0, -d / 2); return g }
/* lathe from [r,y] profile (turned legs, lamps, pots, toilets) */
const Lathe = (pts, n = 14) => new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), n);
function P3(g, geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = o.receiveShadow = true; g.add(o); return o }
const col = (x0, x1, z0, z1, l, furnF) => { const c = { x0, x1, z0, z1, l, furn: furnF }; COL.push(c); return c };
/* place a group; collider from local footprint (w along local x, d along local z) rotated by ry */
function furn(g, x, y, z, ry, l, w, d) { g.position.set(x, y, z); g.rotation.y = ry || 0; scene.add(g); if (w) { const sw = Math.abs(Math.sin(ry || 0)) > .5; const W2 = (sw ? d : w) / 2, D2 = (sw ? w : d) / 2; col(x - W2, x + W2, z - D2, z + D2, l, 1) } return g }

/* ---------- static batching: merge non-interactive meshes per material and per 4 m cell (keeps culling, cuts draw calls) ---------- */
function mergeStatic() {
  scene.updateMatrixWorld(true); const buckets = new Map(), kill = [], isDyn = o => { for (let p = o; p; p = p.parent) if (p.userData.dyn) return true; return false };
  const add = (o, mat, geo) => { const wp = new T.Vector3().setFromMatrixPosition(o.matrixWorld), cs = (wp.x < -3 || wp.x > 16.5 || wp.z > 24 || wp.z < -9) ? 16 : 4, key = mat.uuid + '|' + (wp.y > 2.7 ? 1 : 0) + '|' + Math.floor(wp.x / cs) + '|' + Math.floor(wp.z / cs) + '|' + o.castShadow; if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push({ o, mat, geo }) };
  scene.traverse(o => { if (!o.isMesh || o.isInstancedMesh || isDyn(o) || o.layers.mask !== 1) return; const g = o.geometry, a = g.attributes; if (!a.position || !a.normal || !a.uv || a.position.normalized) return;
    if (Array.isArray(o.material)) { if (!g.index) return; for (const gr of g.groups) { const m = o.material[gr.materialIndex]; if (m.isShaderMaterial) continue; const sub = new T.BufferGeometry(); for (const nm of ['position', 'normal', 'uv']) { const at = g.attributes[nm], it = at.itemSize, arr = new Float32Array(gr.count * it); for (let i = 0; i < gr.count; i++) { const vi = g.index.getX(gr.start + i); for (let k = 0; k < it; k++) arr[i * it + k] = at.array[vi * it + k] } sub.setAttribute(nm, new T.BufferAttribute(arr, it)) } add(o, m, sub) } kill.push(o); return }
    if (o.material.isShaderMaterial) return; add(o, o.material, null) });
  let before = 0, after = 0;
  for (const [k, list] of buckets) { before += list.length; if (list.length < 2 && !list[0].geo) { after++; continue }
    let n = 0; const parts = list.map(({ o, geo }) => { let g = geo || (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(o.matrixWorld); n += g.attributes.position.count; return g });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), VC = list[0].mat.vertexColors ? new Float32Array(n * 3) : null; let off = 0; /* vertex colours (foliage) survive merging */
    for (const g of parts) { const c = g.attributes.position.count; P.set(g.attributes.position.array.subarray(0, c * 3), off * 3); N.set(g.attributes.normal.array.subarray(0, c * 3), off * 3); U.set(g.attributes.uv.array.subarray(0, c * 2), off * 2); if (VC) { if (g.attributes.color) VC.set(g.attributes.color.array.subarray(0, c * 3), off * 3); else VC.fill(1, off * 3, (off + c) * 3) } off += c; g.dispose() }
    const mg = new T.BufferGeometry(); if (VC) mg.setAttribute('color', new T.BufferAttribute(VC, 3)); mg.setAttribute('position', new T.BufferAttribute(P, 3)); mg.setAttribute('normal', new T.BufferAttribute(N, 3)); mg.setAttribute('uv', new T.BufferAttribute(U, 2)); mg.computeBoundingSphere();
    const m = new T.Mesh(mg, list[0].mat); m.castShadow = list[0].o.castShadow; m.receiveShadow = true; m.matrixAutoUpdate = false; scene.add(m); after++; for (const { o, geo } of list) if (!geo) kill.push(o) }
  for (const o of new Set(kill)) o.parent && o.parent.remove(o); return { before, after };
}
