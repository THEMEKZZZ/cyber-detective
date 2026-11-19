/* ---------- Kenney "Animated Characters Retro" (CC0, models/kenney) dressed onto our procedural rigs ----------
   The procedural rig (J joints, rest pose = identity, arms down) keeps driving every pose (walk, sneak, crouch, startle, sit, type,
   drive, eat). Each frame the skinned Kenney body copies those joint rotations: the bone's rest orientation is conjugated so a
   rotation authored in the rig frame is applied in the same world direction, and T-pose limbs are first swung onto our rest
   direction (arms down). The old procedural meshes are hidden; the intruder's flashlight stays on the hand joint. */
/* the FBX ships as base64 in models/kenney/character.js (same pattern as the other models) */
function kcFbx(cb) { try { const b = atob(window.KENNEY_FBX), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); cb(new T.FBXLoader().parse(u.buffer, 'models/kenney/')) } catch (e) { console.warn('kenney load failed', e) } }
const KC = { list: [], q: new T.Quaternion(), q2: new T.Quaternion(), rootQ: new T.Quaternion(), v: new T.Vector3(), v2: new T.Vector3() };
function kcAttach(r, skinPng, tint, ready) { if (!r || !T.FBXLoader) return; kcFbx(o => {
  const root = r.root, J = r.J; const saved = []; for (const k in J) { const j = J[k]; if (j && j.isObject3D && k !== 'torch' && k !== 'torso') { saved.push([j, j.quaternion.clone(), j.position.clone()]); j.quaternion.identity() } } J.hips.position.y = .95; root.updateMatrixWorld(true); /* measure at the rig's rest pose */ const rq = root.getWorldQuaternion(new T.Quaternion()).invert(), rp = root.matrixWorld.clone().invert();
  const rel = j => j.getWorldPosition(new T.Vector3()).applyMatrix4(rp); let layers = null, h = 0;
  root.traverse(m => { if (m.isMesh && !layers) layers = m.layers.mask });
  const bb = new T.Box3(); root.traverse(m => { if (m.isMesh && m.visible) bb.expandByObject(m) }); bb.applyMatrix4(rp); h = Math.max(1.6, Math.min(1.95, bb.max.y - bb.min.y));
  const s = h / 376.5; o.scale.setScalar(s); const fwd = J.lids && J.lids[0] ? Math.sign(rel(J.lids[0]).z - rel(J.head).z) || 1 : 1; o.rotation.y = fwd > 0 ? 0 : Math.PI; root.add(o); o.updateMatrixWorld(true);
  const tex = new T.TextureLoader().load('models/kenney/' + skinPng); tex.encoding = T.sRGBEncoding; tex.flipY = true;
  const mat = new T.MeshStandardMaterial({ map: tex, skinning: true, color: tint, roughness: .85 });
  o.traverse(m => { if (m.isMesh) { m.material = mat; m.frustumCulled = false; m.castShadow = true; m.userData.kc = 1 } if (layers !== null) m.layers.mask = layers; m.userData.dyn = 1 });
  const keep = new Set(); if (J.torch) J.torch.traverse(x => keep.add(x)); root.traverse(m => { if (m.isMesh && !m.userData.kc && !keep.has(m)) m.visible = false });
  const B = {}; o.traverse(b => { if (b.isBone) B[b.name] = b });
  const side = (a, b) => (rel(a).x > 0) === (B.LeftArm.getWorldPosition(new T.Vector3()).applyMatrix4(rp).x > 0) ? 'Left' : 'Right'; // match sides by position, not by name
  const sl = side(J.shL), hl = (rel(J.hipL).x > 0) === (B.LeftUpLeg.getWorldPosition(new T.Vector3()).applyMatrix4(rp).x > 0) ? 'Left' : 'Right', o2 = n => n === 'Left' ? 'Right' : 'Left';
  const map = [[J.hips, 'Hips'], [J.spine, 'Spine'], [J.neck, 'Neck'], [J.head, 'Head'], [J.shL, sl + 'Arm', J.elL], [J.elL, sl + 'ForeArm'], [J.shR, o2(sl) + 'Arm', J.elR], [J.elR, o2(sl) + 'ForeArm'],
    [J.hipL, hl + 'UpLeg', J.knL], [J.knL, hl + 'Leg'], [J.hipR, o2(hl) + 'UpLeg', J.knR], [J.knR, o2(hl) + 'Leg']].filter(e => e[0] && B[e[1]]);
  const rootQ = o.getWorldQuaternion(new T.Quaternion()); const ent = map.map(([j, bn, jc]) => { const b = B[bn]; const Rb = rq.clone().multiply(b.getWorldQuaternion(new T.Quaternion())); let A = new T.Quaternion();
    const child = b.children.find(c => c.isBone && !/end|Thumb|Index|Toes|Shoulder/.test(c.name)) || null;
    if (jc && child) { const kd = rel(child).sub(rel(b)).normalize(), od = rel(jc).sub(rel(j)).normalize(); A.setFromUnitVectors(kd, od) } return { j, b, Rb, A, bn } });
  ent.forEach(e => { if (/ForeArm|Leg$/.test(e.bn) && !/UpLeg/.test(e.bn)) { const up = ent.find(x => x.bn === e.bn.replace('ForeArm', 'Arm').replace(/Leg$/, 'UpLeg')); if (up) e.A = up.A.clone() } });
  const hips = B.Hips, hipRest = rel(hips), hipY = .95; saved.forEach(([j, q, p]) => { j.quaternion.copy(q); j.position.copy(p) });
  KC.list.push({ root, J, ent, hips, hipRest, hipY, s, o }); if (ready) ready(o) }) }
function kcSync() { for (const k of KC.list) { if (k.root === AV.root) k.o.visible = !(S.mode === 'intro' && INTRO.view === 'pov' && INTRO.phase < 5); /* our own head would fill the in-car POV */ if (!k.root.visible) continue; const rq = k.root.getWorldQuaternion(KC.rootQ).invert();
  const t = KC.v.copy(k.hipRest).add(k.J.hips.position); t.y -= k.hipY; k.root.localToWorld(t); k.hips.parent.updateMatrixWorld(true); k.hips.position.copy(k.hips.parent.worldToLocal(t)); /* hips follow the rig's hip joint (bob, crouch, sit) in root space */
  for (const e of k.ent) { const Qj = KC.q.copy(rq).multiply(e.j.getWorldQuaternion(KC.q2)); const W = Qj.clone().multiply(e.A).multiply(e.Rb); // target, root space
    const pq = rq.clone().multiply(e.b.parent.getWorldQuaternion(new T.Quaternion())); e.b.quaternion.copy(pq.invert().multiply(W)); e.b.updateMatrixWorld(true) } } }
function kcInit() { kcAttach(NPC, 'humanMaleA.png', 0x3a3b42); kcAttach(GHOST, 'humanMaleA.png', 0x3a3b42); /* intruder: same body, darkened */ kcAttach({ root: AV.root, J: AV.J }, 'humanMaleA.png', 0xffffff) }
