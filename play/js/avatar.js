/* ---------- the player's own body: seen by CCTV cameras, photos and cutscenes (layer 2), never by the first-person camera ----------
   Same rig as the intruder (so it animates the same way), re-dressed: grey hoodie, dark-blue jeans, white sneakers, bare head with short hair. */
const AV = { root: null, J: null, ph: 0, mode: 'stand', lx: 0, lz: 0 };
function buildAvatar() {
  const r = buildIntruder(), J = r.J; J.torch.parent.remove(J.torch); scene.remove(r.root); // no torch for us
  const hoodie = fabT('#59616b'), jeans = M(tex(64, (g, w) => { g.fillStyle = '#2c3a52'; g.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 2) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(i, 0, 1, w) } grain(g, w, w, 300) }), 1), skin = MC(0xc8946e, .7), shoe = MC(0xd8d6ce, .6), hair = MC(0x1c1612, .9);
  const under = (o, j) => { for (let q = o; q; q = q.parent) if (q === j) return true; return false };
  r.root.traverse(o => { if (!o.isMesh) return; const m = o.material, hex = m.color && m.color.getHex();
    if (under(o, J.head)) { if (m.map) o.material = skin; return }                 // balaclava -> face
    if (hex === 0x0d0d0e || hex === 0x16171a) { o.material = skin; return }        // gloves, neck
    if (hex === 0x17120e) { o.material = shoe; return }                             // boots -> sneakers
    if (m.map) o.material = under(o, J.spine) ? hoodie : jeans });
  [...J.handR.children].forEach(o => { if (o.isMesh && o.material !== skin) J.handR.remove(o) }); // no flashlight in our hand
  // short hair + ears + hood bunched at the neck
  const hc = P3(J.head, new T.SphereGeometry(.104, 14, 10, 0, Math.PI * 2, 0, Math.PI * .55), hair, 0, .145, -.012); hc.scale.set(1, .9, 1.12);
  for (const s of [-1, 1]) P3(J.head, new T.SphereGeometry(.022, 8, 6), skin, s * .098, .14, 0);
  P3(J.spine, new T.TorusGeometry(.13, .05, 6, 14), hoodie, 0, .56, -.03, Math.PI / 2 + .2);
  J.lids.forEach(l => l.material = MC(0xa8785a, .8));
  r.root.traverse(o => { o.layers.set(2); if (o.isMesh) o.castShadow = false }); r.root.visible = false; r.root.userData.dyn = 1; scene.add(r.root); AV.root = r.root; AV.J = J; return r
}
/* pose: 'stand' (walk cycle from speed), 'sit' (chair), 'type' (sit + hands on keyboard), 'drive' (sit + hands on wheel), 'eat' */
function avPose(mode, speed, dt) { const J = AV.J; if (!J) return; AV.ph += dt * speed * 4.2; const ph = AV.ph, sp = Math.min(1, speed / 1.4);
  const reset = j => j.rotation.set(0, 0, 0); [J.hipL, J.hipR, J.knL, J.knR, J.shL, J.shR, J.elL, J.elR, J.spine, J.neck].forEach(reset);
  if (mode === 'stand') { J.hips.position.y = .95 + Math.abs(Math.cos(ph)) * .03 * sp; J.hipL.rotation.x = Math.sin(ph) * .5 * sp; J.hipR.rotation.x = -Math.sin(ph) * .5 * sp; J.knL.rotation.x = Math.max(0, -Math.sin(ph - .9)) * .9 * sp; J.knR.rotation.x = Math.max(0, Math.sin(ph - .9)) * .9 * sp;
    J.shL.rotation.x = -Math.sin(ph) * .4 * sp; J.shR.rotation.x = Math.sin(ph) * .4 * sp; J.elL.rotation.x = J.elR.rotation.x = -.2 - .2 * sp; J.shL.rotation.z = -.06; J.shR.rotation.z = .06; return }
  J.hips.position.y = .5; J.hipL.rotation.x = J.hipR.rotation.x = -1.45; J.knL.rotation.x = J.knR.rotation.x = 1.45; J.hipL.rotation.z = .05; J.hipR.rotation.z = -.05; J.spine.rotation.x = .08;
  if (mode === 'type') { J.shL.rotation.x = J.shR.rotation.x = -.75; J.elL.rotation.x = J.elR.rotation.x = -.9; J.shL.rotation.z = .12; J.shR.rotation.z = -.12; J.neck.rotation.x = .12; const t = performance.now() / 120; J.elL.rotation.x += Math.sin(t) * .03; J.elR.rotation.x += Math.cos(t * 1.3) * .03 }
  else if (mode === 'drive') { J.hips.position.y = .8; J.hipL.rotation.x = J.hipR.rotation.x = -1.5; J.knL.rotation.x = J.knR.rotation.x = .45; J.spine.rotation.x = -.26; J.neck.rotation.x = .1; /* car seat: higher hips, shins tucked back so the feet stay inside the footwell */ J.shL.rotation.x = J.shR.rotation.x = -1.05; J.elL.rotation.x = J.elR.rotation.x = -.55; J.shL.rotation.z = .25; J.shR.rotation.z = -.25 }
  else if (mode === 'eat') { J.shL.rotation.x = -.6; J.elL.rotation.x = -.8; const t = performance.now() / 900; J.shR.rotation.x = -.7 - Math.max(0, Math.sin(t)) * .5; J.elR.rotation.x = -1.2 - Math.max(0, Math.sin(t)) * .9; J.neck.rotation.x = .2 }
  else { J.shL.rotation.x = J.shR.rotation.x = -.35; J.elL.rotation.x = J.elR.rotation.x = -.6 } }
/* follow the player each frame */
function avatarTick(dt) { if (!AV.root) return; const r = AV.root;
  if (S.mode === 'intro') return; // the intro positions the avatar itself
  if (S.mode !== 'play' || S.hidden || (S.hideAnim > 0 && S.hideAnim < 1)) { r.visible = false; return } r.visible = true;
  if (S.pc) { r.position.set(DX, FY[1], 7.18); r.rotation.y = Math.PI; avPose('type', 0, dt); return }
  if (S.seated) { r.position.set(9.25, 0, 4.42); r.rotation.y = 0; avPose('eat', 0, dt); return }
  const sp = Math.hypot(P.x - AV.lx, P.z - AV.lz) / Math.max(dt, 1e-3); AV.lx = P.x; AV.lz = P.z;
  r.position.set(P.x, PY, P.z); r.rotation.y = P.yaw + Math.PI; avPose('stand', Math.min(sp, 4), dt) }
