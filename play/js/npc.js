/* ---------- intruder: original masked adult male (ref: CCTV night-vision still), animated, state-machine AI ---------- */
/* night-vision CCTV: clothing reflects the IR illuminator, so a figure reads as a grey silhouette (and the eyes shine) */
const IR = { mats: null };
function irOn(on) { if (!IR.mats) { IR.mats = new Set(); for (const r of [NPC, GHOST]) if (r) r.root.traverse(o => { if (o.isMesh && o.material.emissive) IR.mats.add(o.material) }) } for (const m of IR.mats) { if (on) { m.userData.e0 = m.emissive.getHex(); m.emissive.setHex(0x3c403c) } else if (m.userData.e0 !== undefined) m.emissive.setHex(m.userData.e0) } }
function knitTex() { return tex(128, (g, w) => { g.fillStyle = '#16171a'; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 3) for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(255,255,255,${rr(.02, .07)})`; g.fillRect(x + (y % 6 ? 2 : 0), y, 2, 2) }
  // face openings of a three-hole balaclava (texture u wraps around the head, front at u=.75)
  const fx = w * .75; g.fillStyle = '#7a5848'; g.beginPath(); g.ellipse(fx, w * .44, w * .12, w * .045, 0, 0, 7); g.fill(); g.fillStyle = '#5a3a32'; g.beginPath(); g.ellipse(fx, w * .64, w * .045, w * .022, 0, 0, 7); g.fill(); g.fillStyle = '#2a1414'; g.fillRect(fx - w * .03, w * .637, w * .06, 2);
  g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.beginPath(); g.ellipse(fx, w * .44, w * .125, w * .05, 0, 0, 7); g.stroke() }) }
function fabT(c, n = 300) { return M(fabric(c, n), 1) }
function buildIntruder() {
  const root = G(), J = {}, jacket = fabT('#1d2024'), jeans = M(tex(64, (g, w) => { g.fillStyle = '#1e2633'; g.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 2) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(i, 0, 1, w) } grain(g, w, w, 300) }), 1), glove = MC(0x0d0d0e, .6), boot = MC(0x17120e, .5), skin = MC(0x8a6450, .7);
  const hips = G(); hips.position.y = .95; root.add(hips); J.hips = hips;
  P3(hips, RG(.36, .18, .22, .07), jeans, 0, 0, 0); P3(hips, Bx(.37, .04, .23), MC(0x1a1410, .5), 0, .08, 0);
  const spine = G(); spine.position.y = .06; hips.add(spine); J.spine = spine;
  const torso = P3(spine, Lathe([[0, 0], [.18, 0], [.2, .1], [.21, .28], [.23, .42], [.22, .5], [.12, .56], [0, .57]], 14), jacket); torso.scale.z = .62; J.torso = torso;
  P3(spine, Bx(.012, .48, .01), MC(0x3a3a3a, .3, { metalness: .6 }), 0, .26, .142); for (const s of [-1, 1]) P3(spine, Bx(.12, .1, .02), jacket, s * .1, .12, .135);
  P3(spine, new T.TorusGeometry(.12, .045, 6, 14, Math.PI), jacket, 0, .54, -.06, -.5);
  const neck = G(); neck.position.y = .57; spine.add(neck); J.neck = neck; P3(neck, Cy(.055, .1, 10), MC(0x16171a, .9), 0, .04, 0);
  const head = G(); head.position.y = .1; neck.add(head); J.head = head;
  const hm = new T.MeshStandardMaterial({ map: knitTex(), roughness: 1 }); const hd = P3(head, Lathe([[0, -.02], [.06, -.015], [.085, .02], [.095, .08], [.1, .14], [.095, .2], [.07, .25], [0, .265]], 18), hm); hd.scale.set(1, 1, 1.12); hd.rotation.y = 0;
  P3(head, new T.ConeGeometry(.018, .05, 6), hm, 0, .1, .11, Math.PI / 2 + .3); P3(head, Bx(.1, .018, .03), hm, 0, .155, .095); // nose + brow ridge under the knit
  J.eyes = []; for (const s of [-1, 1]) { const e = G(); e.position.set(s * .033, .145, .093); head.add(e); P3(e, new T.SphereGeometry(.014, 10, 8), MC(0xd8d2c4, .3)); const ir = P3(e, new T.SphereGeometry(.0075, 8, 6), MC(0x241810, .2), 0, 0, .009); ir.userData.iris = 1; J.eyes.push(e) }
  J.lids = []; for (const s of [-1, 1]) { const l = P3(head, Bx(.034, .012, .01), MC(0x6a4838, .8), s * .033, .158, .104); J.lids.push(l) }
  // arms
  for (const s of [-1, 1]) { const sh = G(); sh.position.set(s * .225, .48, 0); spine.add(sh); P3(sh, new T.SphereGeometry(.07, 10, 8), jacket); const up = P3(sh, Cy(.058, .3, 10, .05), jacket, 0, -.16, 0);
    const el = G(); el.position.y = -.31; sh.add(el); P3(el, Cy(.05, .27, 10, .042), jacket, 0, -.14, 0); const hand = G(); hand.position.y = -.29; el.add(hand); P3(hand, RG(.07, .1, .035, .015), glove, 0, -.04, 0); P3(hand, Bx(.02, .05, .02), glove, s * -.035, -.02, .02);
    J[s < 0 ? 'shL' : 'shR'] = sh; J[s < 0 ? 'elL' : 'elR'] = el; J[s < 0 ? 'handL' : 'handR'] = hand }
  for (const s of [-1, 1]) { const hp = G(); hp.position.set(s * .1, -.06, 0); hips.add(hp); P3(hp, Cy(.085, .44, 10, .065), jeans, 0, -.22, 0); const kn = G(); kn.position.y = -.45; hp.add(kn); P3(kn, Cy(.062, .42, 10, .05), jeans, 0, -.21, 0);
    const ft = G(); ft.position.y = -.44; kn.add(ft); P3(ft, RG(.1, .1, .26, .04), boot, 0, -.01, .05); J[s < 0 ? 'hipL' : 'hipR'] = hp; J[s < 0 ? 'knL' : 'knR'] = kn }
  // hand torch (used while searching inside)
  const tl = P3(J.handR, Cy(.02, .16, 8), MAT.dark, 0, -.08, .05, Math.PI / 2); const torch = new T.SpotLight(0xfff2d8, 0, 12, .38, .6, 1.4); torch.position.set(0, -.08, .12); J.handR.add(torch); const tt = new T.Object3D(); tt.position.set(0, -.6, 3); J.handR.add(tt); torch.target = tt; J.torch = torch;
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.userData.npc = 1 } }); root.userData.dyn = 1; root.visible = false; scene.add(root); return { root, J };
}
/* ---------- navigation graph (rooms, stairs, doors) ---------- */
const NAV = { n: {}, e: {} };
function navBuild() {
  const N = (id, x, z, l, room) => NAV.n[id] = { id, x, z, l, room }, E = (a, b, door) => { (NAV.e[a] = NAV.e[a] || []).push({ to: b, door }); (NAV.e[b] = NAV.e[b] || []).push({ to: a, door }) };
  // exterior (all routes go round the house, through the driveway gap and the gate - never through fences or walls)
  N('street', 18, 20, 0, 'ext'); N('street_w', -8, 20, 0, 'ext'); N('light_x', 16, 22.2, 0, 'ext'); N('lurk_a', 6.2, 18.95, 0, 'ext'); N('gate', 3.7, 16.2, 0, 'ext'); N('yard', 3.7, 12.5, 0, 'ext'); N('yard_e', 6.5, 13.9, 0, 'ext'); N('porch', 3.7, 10.6, 0, 'ext');
  N('drive', 12.2, 16.3, 0, 'ext'); N('drive_in', 13.9, 14.3, 0, 'ext'); N('lurk_b', 11.0, 14.2, 0, 'ext'); N('side_s', 14.4, 11, 0, 'ext'); N('side_n', 14.4, 3, 0, 'ext'); N('meter', HW + .6, 1.5, 0, 'ext'); N('corner_ne', 14.4, -1.6, 0, 'ext'); N('back', 7, -3, 0, 'ext'); N('lurk_c', 8.6, -6.8, 0, 'ext'); N('win_liv', 1.7, 10.4, 0, 'ext');
  // ground floor (door-aligned nodes so every segment passes through a doorway, around furniture)
  N('entry', 3.7, 9.1, 0, 'living'); N('liv_m', 4.9, 8.3, 0, 'living'); N('liv_e', 5.0, 5.0, 0, 'living'); N('living', 2.7, 4.7, 0, 'living'); N('st_door', 3.97, 4.1, 0, 'living'); N('store', 3.9, 2.0, 0, 'store');
  N('kit_w', 7.4, 5.0, 0, 'kitchen'); N('kitchen', 9.0, 7.6, 0, 'kitchen'); N('kit_n', 8.4, 3.5, 0, 'kitchen'); N('bath', 8.4, 1.2, 0, 'bath'); N('stair_b', 6.2, 5.0, 0, 'hall');
  // upper floor
  N('stair_t', 6.2, .6, 1, 'hall'); N('land', 7.25, .8, 1, 'hall'); N('land_s', 7.5, 3.6, 1, 'hall'); N('land_n', 7.5, 4.94, 1, 'hall'); N('hall_m', 6.2, 4.94, 1, 'hall'); N('hall_w', 2.6, 4.94, 1, 'hall'); N('hall_e', 10.5, 4.94, 1, 'hall');
  N('bB_d', 7.6, 1.89, 1, 'hall'); N('bedB', 10.4, 2.3, 1, 'bedB'); N('bedA', 3.2, 2.2, 1, 'bedA'); N('ward', 1.3, .78, 1, 'bedA'); N('ward_t', 1.35, 1.2, 1, 'bedA'); N('comp_h', 3.44, 4.94, 1, 'hall'); N('comp_d', 3.45, 6.5, 1, 'comp'); N('comp', 2.6, 8.3, 1, 'comp'); N('bc_h', 9.69, 4.94, 1, 'hall'); N('bedC_d', 9.7, 6.5, 1, 'bedC'); N('bedC', 10.2, 7.8, 1, 'bedC');
  E('street', 'gate'); E('street_w', 'gate'); E('street', 'light_x'); E('street', 'lurk_a'); E('street_w', 'lurk_a'); E('street', 'drive'); E('drive', 'drive_in'); E('drive_in', 'lurk_b'); E('drive_in', 'side_s'); E('gate', 'yard'); E('yard', 'porch'); E('yard', 'win_liv'); E('yard', 'yard_e'); E('yard_e', 'drive_in');
  E('side_s', 'side_n'); E('side_n', 'meter'); E('side_n', 'corner_ne'); E('corner_ne', 'back'); E('back', 'lurk_c');
  E('porch', 'entry', 0); E('entry', 'liv_m'); E('liv_m', 'liv_e'); E('liv_e', 'living'); E('liv_e', 'st_door'); E('st_door', 'store', 1); E('liv_e', 'kit_w'); E('kit_w', 'kitchen'); E('kit_w', 'kit_n'); E('kit_n', 'bath', 2); E('liv_e', 'stair_b');
  E('stair_b', 'stair_t'); E('stair_t', 'land'); E('land', 'land_s'); E('land_s', 'land_n'); E('land_n', 'hall_m'); E('land', 'bB_d'); E('bB_d', 'bedB', 4); E('hall_m', 'hall_w'); E('hall_m', 'hall_e'); E('hall_w', 'bedA', 3); E('bedA', 'ward'); E('bedA', 'ward_t'); E('ward_t', 'ward');
  E('hall_w', 'comp_h'); E('comp_h', 'hall_m'); E('comp_h', 'comp_d', 5); E('comp_d', 'comp'); E('hall_e', 'bc_h'); E('bc_h', 'hall_m'); E('bc_h', 'bedC_d', 6); E('bedC_d', 'bedC');
}
function navPath(a, b) { if (a === b) return [a]; const prev = { [a]: null }, q = [a]; while (q.length) { const c = q.shift(); if (c === b) break; for (const e of NAV.e[c] || []) if (!(e.to in prev)) { prev[e.to] = c; q.push(e.to) } } if (!(b in prev)) return [a]; const p = []; for (let c = b; c; c = prev[c]) p.unshift(c); return p }
function navNearest(x, z, l) { const c = []; for (const k in NAV.n) { const n = NAV.n[k]; if (n.l !== l) continue; c.push([Math.hypot(n.x - x, n.z - z), k]) } c.sort((a, b) => a[0] - b[0]); for (const [, k] of c.slice(0, 8)) { const n = NAV.n[k]; if (losClear(x, z, n.x, n.z, l)) return k } return c.length ? c[0][1] : null } // nearest node he can actually walk to (no wall in between)
function navDoor(a, b) { const e = (NAV.e[a] || []).find(e => e.to === b); return e && e.door !== undefined ? DOORS[e.door] : null }
/* ---------- line of sight on the 2D plan (walls + closed doors block) ---------- */
function losClear(x0, z0, x1, z1, l) { for (const c of COL) { if (c.l !== l || c.off || c.furn) continue; // slab test
    let t0 = 0, t1 = 1; const dx = x1 - x0, dz = z1 - z0; for (const [p, d, lo, hi] of [[x0, dx, c.x0, c.x1], [z0, dz, c.z0, c.z1]]) { if (Math.abs(d) < 1e-6) { if (p < lo || p > hi) { t0 = 2; break } } else { let a = (lo - p) / d, b = (hi - p) / d; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) break } } if (t0 <= t1 && t0 < 1 && t1 > 0) return false } return true }
/* ---------- AI ---------- */
const AI = { st: 'IDLE', x: 18, z: 20, l: 0, y: 0, yaw: 0, path: [], goal: null, speed: 1.3, t: 0, ph: 0, wait: 0, look: 0, alert: 0, susp: 0, lastHeard: null, lastSeen: null, searched: {}, door: null, anim: 'idle', reach: 0, visible: false, ghost: false, onDone: null, lostT: 0 };
let NPC; const DIFF = { easy: { hear: .7, sight: .7, det: .6, chase: 2.9, win: 40 }, normal: { hear: 1, sight: 1, det: 1, chase: 3.25, win: 28 }, hard: { hear: 1.35, sight: 1.2, det: 1.4, chase: 3.5, win: 18 } };
const dif = () => DIFF[OPT.diff || 'normal'];
function aiSet(st, extra = {}) { if (AI.st !== st) { AI.st = st; AI.t = 0; if (window.DBGLOG) DBGLOG.push(st) } Object.assign(AI, extra) }
function aiPlace(node, vis = true) { const n = NAV.n[node]; AI.x = n.x; AI.z = n.z; AI.l = n.l; AI.y = FY[n.l]; AI.path = []; AI.node = node; NPC.root.visible = vis; AI.visible = vis }
function aiGo(node, speed = 1.3, onDone) { const from = navNearest(AI.x, AI.z, AI.l), fn = NAV.n[from], pth = navPath(from, node); AI.path = fn && Math.hypot(fn.x - AI.x, fn.z - AI.z) > .35 ? pth : pth.slice(1); if (fn && AI.path[0] === from) AI.node = from; if (!AI.path.length) AI.path = [node]; AI.speed = speed; AI.goal = node; AI.onDone = onDone || null }
/* noise events from the player/world: radius scales with loudness; floors attenuate */
function noise(x, z, l, loud, src = '') { if (!NPC || !AI.visible) return; const inside = AI.st === 'SEARCHING' || AI.st === 'CHECKING_ROOM' || AI.st === 'INVESTIGATING_SOUND'; if (!inside) return;
  const d = Math.hypot(x - AI.x, z - AI.z) + (l !== AI.l ? 4 : 0), r = loud * 10 * dif().hear; if (d > r) return; AI.susp = Math.min(1.5, AI.susp + (1 - d / r) * .6 * loud); AI.lastHeard = { x, z, l, src };
  if (AI.st === 'CHASE' || AI.st === 'FOUND_PLAYER' || AI.st === 'OPENING_WARDROBE') return; const tgt = src === 'ward' ? 'ward' : navNearest(x, z, l);
  if (AI.st === 'CHECKING_ROOM' && AI.node === tgt) { if (src === 'ward' && AI.susp > .9 && !firstHide() && !S.ws) { aiSet('OPENING_WARDROBE'); AI.wait = 1.1 } else AI.wait = Math.max(AI.wait, 2.5); return } // already here: listen harder
  if (AI.st === 'INVESTIGATING_SOUND' && AI.goal === tgt && AI.path.length) return; // keep the current route (re-planning every noise made him oscillate)
  aiSet('INVESTIGATING_SOUND'); aiGo(tgt, 1.6, () => { aiSet('CHECKING_ROOM', { wait: src === 'ward' ? 6 : 3.5 }) }) }
function playerVisibleTo() { if (S.hidden || S.mode !== 'play') return 0; const pl = PY > 1.6 ? 1 : 0; if (pl !== AI.l) return 0; const dx = P.x - AI.x, dz = P.z - AI.z, d = Math.hypot(dx, dz); const lit = (ROOMS_ON_AT(pl, P.x, P.z) || S.flash) ? 1 : .5, range = (AI.torch ? 9 : 6) * lit * dif().sight; if (d > range) return 0;
  const fwdX = Math.sin(AI.yaw + AI.look), fwdZ = Math.cos(AI.yaw + AI.look), dot = (dx * fwdX + dz * fwdZ) / (d || 1); if (dot < Math.cos(1.0) && d > 1.2) return 0; if (!losClear(AI.x, AI.z, P.x, P.z, pl)) return 0; return 1 - d / range }
function ROOMS_ON_AT(l, x, z) { if (!S.power) return false; const r = roomAt(l, x, z), map = { living: 'living', kitchen: 'kitchen', bath: 'bath', store: 'store', bedA: 'bedA', bedB: 'bedB', bedC: 'bedC', comp: 'comp', hall: 'hall' }; return map[r] && ROOMS[map[r]] && ROOMS[map[r]].on }
function aiStep(dt) {
  if (!NPC || !AI.visible && !AI.path.length) return; AI.t += dt;
  // walk along path; open doors on the way
  let moving = false;
  if (AI.wait > 0) { AI.wait -= dt } else if (AI.door) { AI.reach = Math.min(1, AI.reach + dt * 2); if (AI.reach >= 1 && !AI.door.opening && AI.door.lock && AI.door.keyId === 'back') { const d = AI.door; soundAt(d.x, FY[d.l] + 1, d.z, 'knock', 1.3); if (roomAt(1, P.x, P.z) === 'bedC' && PY > 1.6) sub('เขาบิดลูกบิดประตูห้องนี้... ล็อกอยู่'); AI.door = null; AI.path = []; AI.onDone = null; AI.searched.bedC = 1; aiSet('CHECKING_ROOM', { wait: 2.5 }) } // a locked back room is a real refuge
    else if (AI.reach >= 1 && !AI.door.opening) { AI.door.opening = 1; if (AI.door.lock) AI.door.lock = 0; AI.door.open = true; creakAt(AI.door.x, AI.door.z, AI.door.l); noiseOut() } if (AI.door && AI.door.a > .8) { AI.door.opening = 0; AI.door = null } }
  else if (AI.path.length) { const nn = NAV.n[AI.path[0]], from = AI.node; const dr_ = navDoor(from, AI.path[0]); if (dr_ && !dr_.open) { AI.door = dr_; AI.reach = 0; AI.yaw = Math.atan2(dr_.x - AI.x, dr_.z - AI.z) } else {
      const dx = nn.x - AI.x, dz = nn.z - AI.z, d = Math.hypot(dx, dz), sp = AI.speed * dt; AI.yaw = lerpA(AI.yaw, Math.atan2(dx, dz), Math.min(1, dt * 6)); moving = true;
      if (d <= sp) { AI.x = nn.x; AI.z = nn.z; AI.node = AI.path.shift(); AI.l = nn.l; if (!AI.path.length) { const f = AI.onDone; AI.onDone = null; f && f() } } else { AI.x += dx / d * sp; AI.z += dz / d * sp }
      // stairs height
      const st = STAIR; if (AI.x > st.x0 - .3 && AI.x < st.x1 + .3 && AI.z > st.z0 && AI.z < st.z1 && (AI.node === 'stair_b' || AI.node === 'stair_t' || AI.path[0] === 'stair_t' || AI.path[0] === 'stair_b')) { AI.y = cl(FY[1] * (st.z1 - AI.z) / (st.z1 - st.z0), 0, FY[1]); AI.l = AI.y > 1.6 ? 1 : 0 } else AI.y = FY[AI.l] } }
  else AI.reach = Math.max(0, AI.reach - dt * 2);
  // footsteps (spatial)
  if (moving && AI.visible) { AI.ph += dt * AI.speed * 4.2; if (Math.floor(AI.ph / Math.PI) !== AI.lastStep) { AI.lastStep = Math.floor(AI.ph / Math.PI); stepAt(AI.x, AI.y, AI.z, AI.speed > 2.5 ? 1 : .55, AI.y > .2 && AI.y < 2.7) } } else AI.ph *= .9;
  aiBrain(dt, moving); aiPose(dt, moving);
}
function lerpA(a, b, t) { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * t }
function aiBrain(dt, moving) {
  const st = AI.st;
  // look-around while checking
  AI.look = st === 'CHECKING_ROOM' || st === 'OBSERVING' ? Math.sin(AI.t * 1.1) * .9 : AI.look * .9;
  if (['SEARCHING', 'CHECKING_ROOM', 'INVESTIGATING_SOUND', 'CHASE'].includes(st)) {
    const v = playerVisibleTo(); if (v > 0) { AI.alert = Math.min(1.2, AI.alert + dt * (0.8 + v * 2.5) * dif().det); AI.lastSeen = { x: P.x, z: P.z, l: PY > 1.6 ? 1 : 0 }; AI.lostT = 0 } else AI.alert = Math.max(0, AI.alert - dt * .25);
    if (st !== 'CHASE' && AI.alert >= 1) { aiSet('FOUND_PLAYER'); AI.wait = .6; sting(); sub(L('ai.seen')) }
    AI.susp = Math.max(0, AI.susp - dt * .05);
  }
  if (st === 'FOUND_PLAYER' && AI.wait <= 0) aiSet('CHASE', { speed: dif().chase });
  if (st === 'CHASE') { const pl = PY > 1.6 ? 1 : 0; AI.lostT += playerVisibleTo() > 0 ? -AI.lostT : dt; const d = Math.hypot(P.x - AI.x, P.z - AI.z);
    if (d < .85 && pl === AI.l && !S.hidden) return jumpscare('caught');
    if (AI.lostT > 6 || S.hidden) { aiSet('SEARCHING'); AI.alert = .4; const ls = AI.lastSeen; if (ls) aiGo(navNearest(ls.x, ls.z, ls.l), 1.5, () => aiSet('CHECKING_ROOM', { wait: 4 })); return }
    if (!AI.path.length || AI.t > .7) { AI.t = 0; const tn = navNearest(P.x, P.z, pl), cur = navNearest(AI.x, AI.z, AI.l); if (tn === cur && pl === AI.l && losClear(AI.x, AI.z, P.x, P.z, pl)) { AI.path = []; const dx = P.x - AI.x, dz = P.z - AI.z, dd = Math.hypot(dx, dz); AI.x += dx / dd * AI.speed * dt; AI.z += dz / dd * AI.speed * dt; AI.yaw = Math.atan2(dx, dz) } else aiGo(tn, dif().chase) } }
  if (st === 'CHECKING_ROOM') { if (AI.wait <= 0) { AI.searched[navNearest(AI.x, AI.z, AI.l)] = 1;
      if (AI.node === 'ward' && !S.ws && (AI.forceWard || (!firstHide() && (AI.susp > .9 || (S.hidden && S.noiseLvl > (OPT.diff === 'hard' ? .45 : .6)))))) { aiSet('OPENING_WARDROBE'); AI.wait = AI.forceWard ? 2.2 : 1.1; return } /* the first visit never opens it; after the SOS he comes back to check it */
      aiSet(AI.searchMode ? 'SEARCHING' : 'LEAVING') } }
  if (st === 'OPENING_WARDROBE' && AI.wait <= 0) { if (S.hidden && S.hideSpot !== 'bed') return jumpscare('wardrobe'); if (AI.forceWard) { AI.forceWard = 0; sub('เขากระชากตู้เสื้อผ้าเปิด... ว่างเปล่า') } aiSet('SEARCHING') }
  if (st === 'SEARCHING' && !AI.path.length && !AI.door && AI.wait <= 0) { // pick a room: noise > tracked camera position > unsearched
    let tgt = null; if (AI.lastHeard) { tgt = navNearest(AI.lastHeard.x, AI.lastHeard.z, AI.lastHeard.l); AI.lastHeard = null }
    else if (S.camTrack && !S.laptopUnplugged && Math.random() < .5) tgt = navNearest(P.x, P.z, PY > 1.6 ? 1 : 0);
    if (!tgt && AI.plan) { if (!AI.plan.length) { AI.planDone = 1; AI.plan = AI.loop ? AI.loop.slice() : null } if (AI.plan && AI.plan.length) tgt = AI.plan.shift() } // scripted search route from the director
    if (!tgt) { const rooms = ['living', 'store', 'kitchen', 'bath', 'bedA', 'bedB', 'comp', 'bedC', 'ward', 'hall_w', 'hall_e']; const un = rooms.filter(r => !AI.searched[r]); const pool = un.length ? un : rooms; tgt = pool[(Math.random() * pool.length) | 0] }
    aiGo(tgt, 1.25, () => aiSet('CHECKING_ROOM', { wait: rr(2.5, 5) })) }
  if (st === 'LEAVING' && !AI.path.length && !AI.door) { aiGo('street', 1.5, () => { aiSet('OUTSIDE'); NPC.root.visible = AI.visible = false; if (S.onLeave) { const f = S.onLeave; S.onLeave = null; f() } }) }
  AI.torch = ['STALK', 'TAUNT', 'SEARCHING', 'CHECKING_ROOM', 'INVESTIGATING_SOUND', 'CHASE', 'FOUND_PLAYER', 'OPENING_WARDROBE', 'ENTERING_HOUSE', 'LEAVING'].includes(st) && !S.power;
}
function aiPose(dt, moving) {
  const J = NPC.J, r = NPC.root; r.position.set(AI.x, AI.y, AI.z); r.rotation.y = AI.yaw; const sp = moving ? Math.min(1, AI.speed / 1.4) : 0, ph = AI.ph, run = AI.speed > 2.5 ? 1 : 0;
  J.hipL.rotation.x = Math.sin(ph) * .55 * sp; J.hipR.rotation.x = -Math.sin(ph) * .55 * sp; J.knL.rotation.x = Math.max(0, -Math.sin(ph - .9)) * (.9 + run * .4) * sp; J.knR.rotation.x = Math.max(0, Math.sin(ph - .9)) * (.9 + run * .4) * sp;
  J.shL.rotation.x = -Math.sin(ph) * .45 * sp; J.elL.rotation.x = -(.15 + .25 * sp + run * .6); J.hips.position.y = .95 + Math.abs(Math.cos(ph)) * .03 * sp - run * .04; J.spine.rotation.x = .05 + run * .18 + (AI.st === 'CHECKING_ROOM' ? .08 : 0);
  if (AI.st === 'STARTLED') { J.shL.rotation.x = J.shR.rotation.x = -2.1; J.elL.rotation.x = J.elR.rotation.x = -.7; J.shL.rotation.z = .3; J.shR.rotation.z = -.3; J.spine.rotation.x = -.28; J.neck.rotation.x = -.2 } // flinch
  if (AI.sneak && moving) { J.hips.position.y -= .16; J.spine.rotation.x += .3; J.knL.rotation.x += .4; J.knR.rotation.x += .4 } // sneaking, bent low between hiding spots
  if (AI.lurk && !moving) { J.hips.position.y = .74; J.hipL.rotation.x = J.hipR.rotation.x = -.75; J.knL.rotation.x = J.knR.rotation.x = 1.2; J.spine.rotation.x = .35 } // half-crouched, lurking in cover
  // right arm: torch forward when searching, reach for doors / wardrobe
  const reach = Math.max(AI.reach, AI.st === 'OPENING_WARDROBE' ? 1 : 0), hold = AI.torch ? .9 : 0; J.shR.rotation.x = -Math.max(hold, reach * 1.35, Math.sin(ph) * .45 * sp); J.elR.rotation.x = -(.2 + (hold ? .25 : 0)); J.torch.intensity = AI.torch ? 2.6 : 0;
  // breathing + head look + eyes + blink
  J.torso.scale.x = 1 + Math.sin(performance.now() / 900) * .012; const lookYaw = AI.look + (AI.st === 'OBSERVING' && AI.watchPlayer ? cl(Math.atan2(P.x - AI.x, P.z - AI.z) - AI.yaw, -1, 1) : 0); J.neck.rotation.y = lerpA(J.neck.rotation.y, lookYaw * .6, Math.min(1, dt * 4)); J.head.rotation.y = J.neck.rotation.y * .6; J.head.rotation.x = AI.st === 'CHECKING_ROOM' ? Math.sin(AI.t * .7) * .15 : 0;
  for (const e of J.eyes) e.rotation.y = cl(lookYaw * .5, -.4, .4); const blink = (performance.now() % 4200) < 120; for (const l of J.lids) l.scale.y = blink ? 2.4 : 1;
}
function creakAt(x, z, l) { soundAt(x, FY[l] + 1, z, 'creak') } function noiseOut() { }

const firstHide = () => ['INTRUDER_ENTERED', 'HIDE_FIRST_TIME', 'INTRUDER_SEARCHING', 'INTRUDER_DOWNSTAIRS'].includes(S.st);
