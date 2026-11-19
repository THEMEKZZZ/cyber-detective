/* ---------- detailed household furniture: refrigerator with contents, paper note, bedroom wardrobe with clothes + grey coat ---------- */
const inner = MC(0xe8ecea, .35), glassM = new T.MeshStandardMaterial({ color: 0xdfeef0, roughness: .05, transparent: true, opacity: .35, depthWrite: false });
const labelTex = (bg, fg, t1, t2) => M(tex(64, (c, s) => { c.fillStyle = bg; c.fillRect(0, 0, s, s); c.fillStyle = fg; c.font = 'bold 13px sans-serif'; c.fillText(t1, 3, 26); if (t2) { c.font = '10px sans-serif'; c.fillText(t2, 4, 42) } grain(c, s, s, 40, .04) }), .6);
function bottle(h, r, mat, cap = 0x2a2a2a) { const g = G(); P3(g, Lathe([[0, 0], [r, 0], [r, h * .62], [r * .45, h * .82], [r * .35, h * .95], [0, h * .95]], 12), mat); P3(g, Cy(r * .38, h * .06, 10), MC(cap, .4), 0, h * .97, 0); return g }
function milkCarton() { const g = G(); P3(g, Bx(.07, .19, .07), labelTex('#f2f2ee', '#2a5aa8', 'MILK', 'whole · 1 qt')); const s = new T.Shape(); s.moveTo(-.035, 0); s.lineTo(.035, 0); s.lineTo(0, .04); const r = new T.ExtrudeGeometry(s, { depth: .07, bevelEnabled: false }); r.translate(0, 0, -.035); P3(g, r, MC(0xf2f2ee, .6), 0, .095, 0); return g }
function eggTray() { const g = G(); P3(g, Bx(.2, .03, .1), MC(0xc8b890, 1)); for (let i = 0; i < 6; i++) { const e = P3(g, new T.SphereGeometry(.018, 8, 6), MC(0xe8dcc0, .6), -.075 + (i % 3) * .075, .035, -.022 + Math.floor(i / 3) * .044); e.scale.y = 1.3 } return g }
function ftub(w, h, c, lid) { const g = G(); P3(g, RG(w, w * .7, h, .015), MC(c, .5, { transparent: true, opacity: .85 }), 0, h / 2, 0, Math.PI / 2); P3(g, RG(w + .01, w * .7 + .01, .012, .015), MC(lid, .5), 0, h + .006, 0, Math.PI / 2); return g }
function pizzaBox() { const g = G(); const top = M(tex(128, (c, s) => { c.fillStyle = '#d8c8a8'; c.fillRect(0, 0, s, s); c.fillStyle = '#b8261c'; c.beginPath(); c.arc(s / 2, s / 2, 44, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 22px sans-serif'; c.fillText("TONY'S", 26, 62); c.font = 'bold 15px sans-serif'; c.fillText('PIZZA', 42, 82); c.strokeStyle = '#b8261c'; c.lineWidth = 3; c.strokeRect(6, 6, s - 12, s - 12); grain(c, s, s, 120, .05) }), .9);
  P3(g, Bx(.34, .045, .34), MC(0xcfbe9c, .9)); const t = P3(g, new T.PlaneGeometry(.33, .33), top, 0, .0235, 0, -Math.PI / 2); return g }
/* ===================== REFRIGERATOR ===================== */
function buildFridge() {
  const fx = HW - .44, fz = 6.4, g = G(), shell = MC(0xd8d2be, .3), W = .72, H = 1.75, Dp = .66, t = .03;
  // hollow cabinet (the old fridge was a solid block, so the open door showed a white wall)
  P3(g, Bx(W, H, t), shell, 0, H / 2, -Dp / 2 + t / 2); for (const s of [-1, 1]) P3(g, Bx(t, H, Dp), shell, s * (W / 2 - t / 2), H / 2, 0); P3(g, Bx(W, t, Dp), shell, 0, H - t / 2, 0); P3(g, Bx(W, .08, Dp), MC(0x2a2a28, .6), 0, .04, 0);
  P3(g, Bx(W - 2 * t, .02, Dp - t), shell, 0, 1.2, 0); P3(g, Bx(W - 2 * t, H - .1, .005), inner, 0, H / 2, -Dp / 2 + t + .003); for (const s of [-1, 1]) P3(g, Bx(.005, 1.1, Dp - t), inner, s * (W / 2 - t - .003), .65, 0);
  P3(g, Bx(W - 2 * t, .005, Dp - t), inner, 0, .085, 0);
  for (const y of [.45, .8]) { P3(g, Bx(W - 2 * t - .01, .008, Dp - .08), glassM, 0, y, -.02); P3(g, Bx(W - 2 * t - .01, .015, .015), MC(0xc8ccc8, .4), 0, y, Dp / 2 - .06) }
  for (const s of [-1, 1]) { const dr = G(); P3(dr, Bx(.3, .02, .5), MC(0xdde6e4, .2, { transparent: true, opacity: .75 }), 0, 0, 0); P3(dr, Bx(.3, .26, .01), MC(0xdde6e4, .2, { transparent: true, opacity: .45, depthWrite: false }), 0, .13, .25); dr.position.set(s * .165, .1, -.03); g.add(dr) }
  // freezer door (top) with the employer's note
  P3(g, RG(W, .52, .06, .06), shell, 0, 1.47, Dp / 2 + .03); P3(g, Cy(.014, .3, 8), MAT.chrome, .3, 1.45, Dp / 2 + .08);
  const note = P3(g, new T.PlaneGeometry(.17, .22), M(tex(64, (c, s) => { c.fillStyle = '#efe8d2'; c.fillRect(0, 0, s, s); c.strokeStyle = 'rgba(70,90,150,.35)'; for (let y = 8; y < s; y += 5) { c.beginPath(); c.moveTo(2, y); c.lineTo(s - 2, y); c.stroke() } c.strokeStyle = '#223'; for (let y = 10; y < s - 6; y += 5) { c.beginPath(); let x = 6; c.moveTo(x, y); while (x < s - rr(6, 22)) { x += rr(2, 5); c.lineTo(x, y + rr(-1, 1)) } c.stroke() } }), .9), -.05, 1.47, Dp / 2 + .062, 0, 0, .04);
  P3(g, Bx(.05, .015, .002), MC(0xd8d0a0, .6, { transparent: true, opacity: .8 }), -.05, 1.585, Dp / 2 + .064); KIT.noteMesh = note;
  for (let i = 0; i < 4; i++) P3(g, Bx(.05, .05, .008), MC([0xc83a2a, 0x2a6ac8, 0xe8c83a, 0x3aa85a][i], .6), .15 - i * .06 + (i % 2) * .02, 1.32 + (i % 2) * .22, Dp / 2 + .065);
  // contents: the pizza is front and centre on the middle shelf
  const add = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; g.add(o); return o };
  KIT.box = add(pizzaBox(), 0, .475, .02, .08); KIT.box.userData.dyn = 1;
  add(milkCarton(), -.22, .085, .02); add(bottle(.3, .045, MC(0x2a5a2a, .15, { transparent: true, opacity: .85 }), 0x8a6a2a), .2, .09, -.12); add(bottle(.26, .04, MC(0xd8e8f0, .1, { transparent: true, opacity: .5 }), 0x2a6ac8), .24, .09, .08);
  add(ftub(.16, .08, 0xe8e0d0, 0x3a7ac8), -.18, .815, -.08); add(ftub(.13, .07, 0xf0e8d8, 0xc83a2a), -.19, .9, -.08); add(ftub(.14, .1, 0xd8e0d8, 0x2a8a4a), .12, .815, .05); add(eggTray(), .14, .475, -.17);
  { const c = G(); P3(c, Bx(.1, .05, .07), MC(0xe8c840, .6)); P3(c, Bx(.1, .002, .07), MC(0xd8d0b0, .8), 0, .026, 0); add(c, -.2, .51, -.16) }
  { const b = G(); P3(b, Lathe([[0, 0], [.06, 0], [.08, .06], [0, .06]], 12), MC(0xe8e4dc, .3)); P3(b, Cy(.075, .003, 14), MC(0xb8bcc0, .3, { metalness: .8 }), 0, .062, 0); add(b, .18, .815, -.14) }
  for (const [x, c] of [[-.2, 0x5a8a3a], [-.1, 0xd86a2a], [.12, 0x8a2a3a]]) { const v = P3(G(), new T.SphereGeometry(.04, 8, 6), MC(c, .6)); v.children[0] && 0; add(v.parent || v, x, .17, -.05) }
  // main door with door bins (drinks + condiments)
  const doorP = G(); doorP.position.set(W / 2, 0, Dp / 2); g.add(doorP); doorP.userData.dyn = 1;
  P3(doorP, RG(W, 1.12, .06, .06), shell, -W / 2, .64, .03); P3(doorP, Bx(W - .06, 1.04, .005), inner, -W / 2, .64, -.003); P3(doorP, Cy(.014, .5, 8), MAT.chrome, -W + .06, .75, .08);
  for (const [y, items] of [[.25, ['juice', 'soda', 'soda', 'water']], [.62, ['ketchup', 'mustard', 'jar', 'sauce']], [.95, ['butter']]]) { P3(doorP, Bx(W - .1, .1, .09), MC(0xdde6e4, .2, { transparent: true, opacity: .6, depthWrite: false }), -W / 2, y + .05, -.05);
    items.forEach((it, i) => { const x = -W + .12 + i * .15, o = it === 'juice' ? bottle(.26, .04, MC(0xe8a030, .3)) : it === 'soda' ? P3(G(), Cy(.032, .12, 10), MC(0xc82a2a, .3, { metalness: .6 })).parent : it === 'water' ? bottle(.24, .035, MC(0xcfe4f0, .1, { transparent: true, opacity: .5 }), 0x3a8ac8) : it === 'ketchup' ? bottle(.18, .03, MC(0xb81c14, .3), 0xf0f0f0) : it === 'mustard' ? bottle(.17, .028, MC(0xe8c020, .3), 0xc82a2a) : it === 'jar' ? ftub(.07, .09, 0x8a3a2a, 0xd8c040) : it === 'sauce' ? bottle(.16, .025, MC(0x5a2a10, .3), 0x111111) : P3(G(), Bx(.12, .05, .07), MC(0xf0e8a0, .5)).parent; o.position.set(x, y + .005, -.05); doorP.add(o) }) }
  const L = new T.PointLight(0xfff4e0, 0, 1.6, 2); L.position.set(0, 1.05, .1); g.add(L); KIT.flight = L;
  furn(g, fx, 0, fz, -Math.PI / 2, 0, .72, .7); KIT.fdoor = doorP;
  g.traverse(o => { if (o.isMesh && o.parent !== g) o.userData.dyn = o.userData.dyn || 0 }); g.userData.dyn = 1; // fridge stays a live object (door + contents)
  KIT.fcol = col(fx - 1.1, fx - .3, fz + .3, fz + .44, 0); KIT.fcol.off = true; KIT.fcol.furn = 1; // open door blocks the walkway
  const wx = l => fx - l; // local z -> world x (front of fridge faces -x)
  IT.push({ x: wx(.42), y: 1.0, z: fz + .2, l: 0, r: 1.8, lab: () => KIT.open ? '[E] ปิดตู้เย็น' : '[E] เปิดตู้เย็น', act: () => { KIT.open = !KIT.open; KIT.open ? SND.fridgeOpen() : SND.fridgeClose(); noise(fx - .5, fz, 0, .3) } });
  IT.push({ x: wx(0), y: .5, z: fz, l: 0, r: 1.9, lab: () => !KIT.open || !KIT.box.visible ? '' : S.pz === 2 || S.pz === 1 ? "[E] หยิบกล่องพิซซ่า TONY'S" : "[E] ดูกล่องพิซซ่า TONY'S", act: () => { if (S.pz === 1 || S.pz === 2) { S.pz = 3; S.inv.pizza = 'เย็น'; KIT.box.visible = false; SND.wrap(); sub('พิซซ่าเมื่อวาน เย็นชืด... ต้องอุ่นก่อน'); progress('pz_take'); inspectItem('pizza') } else sub("พิซซ่า TONY'S ครึ่งกล่อง... ไว้หิวค่อยกิน") } });
  { const w = new T.Vector3(fx - .4035, 1.36, fz + .02); KIT.fdoor.updateMatrixWorld(true); const q = KIT.fdoor.getWorldQuaternion(new T.Quaternion()).invert(), nq = new T.Quaternion().setFromEuler(new T.Euler(0, -Math.PI / 2, -.04)); /* Richard's note: one sheet held by a magnet on the upper (fridge) door, facing the room */
    const n = noteMesh(.15); KIT.fdoor.worldToLocal(w); n.position.copy(w); n.quaternion.copy(q.clone().multiply(nq)); KIT.fdoor.add(n); KIT.note = n;
    const mg = P3(KIT.fdoor, new T.CylinderGeometry(.016, .016, .01, 14), MC(0xc8282a, .4), 0, 0, 0); mg.position.copy(n.position).add(new T.Vector3(0, .085, 0).applyQuaternion(n.quaternion)).add(new T.Vector3(0, 0, .004).applyQuaternion(n.quaternion)); mg.quaternion.copy(n.quaternion).multiply(new T.Quaternion().setFromEuler(new T.Euler(Math.PI / 2, 0, 0))) }
  IT.push({ x: fx - .43, y: 1.36, z: fz + .02, l: 0, r: 1.8, rad: .09, lab: () => KIT.open ? '' : '[E] อ่านโน้ตของริชาร์ด', act: () => { progress('note'); inspectItem('note') } });
}
function fridgeTick(dt) { if (!KIT.fdoor) return; KIT.fdoor.rotation.y += ((KIT.open ? 1.65 : 0) - KIT.fdoor.rotation.y) * Math.min(1, dt * 5); KIT.fcol.off = KIT.fdoor.rotation.y < .5; KIT.flight.intensity = KIT.open && S.power ? .8 : 0 }
/* ===================== THE NOTE (close-up paper) ===================== */
const NOTE_HTML = `<div class="paper"><div class="tape"></div><div class="ph">ถึงคนที่มาทำงานกะดึกคืนนี้</div>
<p>ขอบคุณมากที่รับงานกระชั้นชิดนะครับ ผมต้องบินไปประชุมด่วน จะกลับมาพรุ่งนี้เช้า</p>
<ol><li>ห้องทำงานอยู่<b>ชั้นบน</b> ประตูที่มีป้าย "ห้องทำงาน" ผมล็อกไว้</li>
<li>กุญแจอยู่ใน<b>กระเป๋าเสื้อโค้ทสีเทา</b> ในตู้เสื้อผ้าห้องนอนใหญ่ชั้นบน</li>
<li>เปิดคอมแล้วอ่านอีเมลของมาร์ธาก่อน งานคืนนี้อยู่ในนั้นทั้งหมด</li>
<li>จอข้าง ๆ เป็นกล้องวงจรปิดของบ้าน ดูไว้บ้างก็ดี แถวนี้เงียบมาก</li></ol>
<p>ห้องเล็กด้านหลังไม่ต้องเข้าไปนะครับ ของของผู้เช่าคนก่อนยังเก็บไม่เสร็จ</p>
<p class="sig">— ริชาร์ด</p></div><div class="ptip">[E] หรือ คลิก เพื่อวางกระดาษ</div>`;
function showNote() { S.ui = 'note'; const o = $('#paperov'); o.innerHTML = NOTE_HTML; o.style.display = 'flex'; SND.wrap(); o.onclick = closeNote; progress('note') }
function closeNote() { if (S.ui !== 'note') return; S.ui = null; $('#paperov').style.display = 'none'; S.keyNote = 1; progress('note_closed'); if (!locked && !S.noLock && S.mode === 'play') pause(true) }
/* ===================== BEDROOM WARDROBE (louvered, ref image 1) with clothes + grey coat ===================== */
HIDE.x = .4; HIDE.z = .78; HIDE.ry = Math.PI / 2; HIDE.room = 'bedA';
const hideFwd = () => [Math.sin(HIDE.ry), Math.cos(HIDE.ry)], hideAt = d => { const [fx, fz] = hideFwd(); return [HIDE.x + fx * d, HIDE.z + fz * d] };
/* clothes with real volume (oval cross-section, shoulders, sleeves, collar) and fabric textures with fold shading,
   because inside a wardrobe you mostly see garments edge-on */
const FABC = {};
function fabricTex(c, pat) { const k = c + pat; if (FABC[k]) return FABC[k]; const hex = '#' + c.toString(16).padStart(6, '0');
  return FABC[k] = M(tex(64, (g, w) => { g.fillStyle = hex; g.fillRect(0, 0, w, w); if (pat === 1) { g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 1.5, w) } if (pat === 2) { g.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 0; x < w; x += 12) g.fillRect(x, 0, 4, w); for (let y = 0; y < w; y += 12) g.fillRect(0, y, w, 4) }
    for (let x = 0; x < w; x++) { const f = Math.sin(x / w * Math.PI * 6 + 1.3) * .5 + Math.sin(x / w * Math.PI * 13) * .2; g.fillStyle = f > 0 ? `rgba(255,255,255,${f * .08})` : `rgba(0,0,0,${-f * .16})`; g.fillRect(x, 0, 1, w) } grain(g, w, w, 260) }), .95) }
function garmentBody(m, w, t, h, top = .9) { const gm = new T.CylinderGeometry(top, 1, h, 16, 3); gm.scale(w, 1, t); const pos = gm.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), x = pos.getX(i); pos.setZ(i, pos.getZ(i) * (1 + .25 * Math.sin(x * 20 + y * 7))) } gm.computeVertexNormals(); return new T.Mesh(gm, m) }
function shirt(c, long) { const g = G(), m = fabricTex(c, long ? 0 : (c % 3)), h = long ? .86 : .62, t = long ? .06 : .042;
  const b = garmentBody(m, .2, t, h); b.position.y = -.08 - h / 2; g.add(b); const sh = new T.Mesh(new T.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); sh.scale.set(.18, .055, t); sh.position.y = -.085; g.add(sh);
  for (const s of [-1, 1]) { const sl = P3(g, Cy(.034, long ? .62 : .5, 10, .044), m, s * .2, -.1 - (long ? .31 : .25), 0, 0, 0, s * .1); sl.scale.z = .85 } // sleeves
  P3(g, new T.TorusGeometry(.045, .012, 6, 14), m, 0, -.06, .0, Math.PI / 2).scale.set(1, 1, .7); // collar
  if (long) P3(g, Bx(.012, h * .8, t * 2.02), MC(Math.max(0, c - 0x0a0a0a), 1), 0, -.12 - h * .4, 0); // lapel / front edge
  else for (let i = 0; i < 5; i++) P3(g, Cy(.006, .004, 6), MC(0xe8e4d8, .4), 0, -.13 - i * .1, t + .002, Math.PI / 2);
  return g }
function trousers(c) { const g = G(), m = fabricTex(c, 0); for (const s of [-1, 1]) { const leg = garmentBody(m, .16, .022, .42, 1); leg.position.set(0, -.23, s * .026); g.add(leg) } // folded over the bar: two layers
  const fold = new T.Mesh(new T.TorusGeometry(.027, .012, 6, 12, Math.PI), m); fold.rotation.set(0, Math.PI / 2, 0); fold.scale.set(1, 1, 6); fold.position.y = -.01; g.add(fold); return g }
function hanger() { const g = G(); P3(g, new T.TorusGeometry(.025, .004, 4, 10, Math.PI * 1.4), MAT.chrome, 0, .035, 0); const bar = P3(g, Cy(.006, .4, 6), MC(0x6a4a2a, .6), 0, 0, 0, 0, 0, Math.PI / 2); return g }
function greyCoat() { const g = G(), wool = M(tex(64, (c, s) => { c.fillStyle = '#7c7e80'; c.fillRect(0, 0, s, s); for (let i = 0; i < 900; i++) { const v = rr(90, 150) | 0; c.fillStyle = `rgba(${v},${v},${v + 4},.35)`; c.fillRect(rr(0, s), rr(0, s), 1, 2) } }), 1);
  P3(g, cloth(.46, .03, 1.05, .012, 8, 14), wool, 0, -.53, 0, Math.PI / 2); for (const s of [-1, 1]) { P3(g, Cy(.045, .62, 8, .055), wool, s * .24, -.33, 0, 0, 0, s * .16); P3(g, Bx(.12, .3, .01), MC(0x6a6c6e, 1), s * .07, -.15, .02, 0, 0, s * .3) }
  for (let i = 0; i < 3; i++) P3(g, Cy(.012, .008, 10), MC(0x1a1a1a, .4), .035, -.32 - i * .16, .025, Math.PI / 2);
  P3(g, Bx(.15, .045, .012), MC(0x6e7072, 1), .12, -.66, .026); // pocket flap
  const key = G(); key.position.set(.12, -.69, .036); g.add(key); P3(key, new T.TorusGeometry(.018, .003, 6, 14), MAT.brass); P3(key, Bx(.012, .05, .003), MAT.brass, 0, -.04, 0); P3(key, Bx(.016, .008, .003), MAT.brass, .007, -.06, 0); P3(key, Bx(.03, .02, .002), MC(0xb02020, .7), -.025, -.01, 0, 0, 0, .3);
  key.traverse(o => o.userData.dyn = 1); key.userData.dyn = 1; KIT.keyMesh = key; return g }
function louverWardrobe() { const g = G(), w = 1.3, h = 2.05, d = .6, wd = MC(0xd8d0bc, .7), dark = MC(0x241c16, .9); P3(g, Bx(w, h, .03), wd, 0, h / 2, -d / 2 + .015); for (const s of [-1, 1]) P3(g, Bx(.03, h, d), wd, s * (w / 2 - .015), h / 2, 0); P3(g, Bx(w + .06, .06, d + .04), wd, 0, h + .02, 0); P3(g, Bx(w, .08, d), wd, 0, .04, 0);
  P3(g, Bx(w - .06, h - .1, .005), dark, 0, h / 2, -d / 2 + .035); P3(g, Bx(w - .06, .02, d - .04), wd, 0, h - .32, 0); P3(g, Bx(w - .06, .02, d - .04), wd, 0, .32, 0);
  // folded clothes on the top shelf, shoe boxes at the bottom
  for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) P3(g, RG(.26, .05, .3, .02), MC([0x8a3a3a, 0x3a4a6a, 0xd8d0c0, 0x5a6a4a][(i + k) % 4], 1), -.45 + i * .3, h - .29 + k * .055, 0, Math.PI / 2);
  for (let i = 0; i < 3; i++) { P3(g, Bx(.32, .14, .3), MC([0x6a5a48, 0x2a2a2a, 0x8a7a64][i], .9), -.4 + i * .4, .42, -.02); P3(g, Bx(.33, .02, .31), MC(0x3a3028, .9), -.4 + i * .4, .5, -.02) }
  P3(g, Cy(.012, w - .1, 6), MAT.chrome, 0, h - .42, 0, 0, 0, Math.PI / 2);
  const rail = h - .42; KIT.clothes = []; const items = [[-.52, 'shirt', 0xd8d4c8], [-.42, 'shirt', 0x5a7a9a], [-.31, 'trousers', 0x2a2e36], [-.2, 'jacket', 0x3a2a22], [-.05, 'shirt', 0x8a3a3a], [.08, 'trousers', 0x5a5040], [.27, 'coat'], [.45, 'jacket', 0x2a3a2a]];
  for (const [x, k, c] of items) { const hg = hanger(); hg.position.set(x, rail - .05, 0); hg.rotation.y = Math.PI / 2 * 0; g.add(hg); const cl = k === 'coat' ? greyCoat() : k === 'trousers' ? trousers(c) : shirt(c, k === 'jacket'); cl.position.set(x, rail - .06, 0); cl.rotation.y = Math.PI / 2 + rr(-.08, .08); g.add(cl); KIT.clothes.push([x, k]) }
  const dw = (w - .06) / 2; for (const s of [-1, 1]) { const piv = G(); piv.position.set(s * (w / 2 - .02), 0, d / 2 + .01); g.add(piv); piv.userData.dyn = 1; const fr = G(); fr.position.x = -s * dw / 2; piv.add(fr);
    P3(fr, Bx(dw, .08, .03), wd, 0, .1, 0); P3(fr, Bx(dw, .08, .03), wd, 0, h - .06, 0); P3(fr, Bx(.07, h - .1, .03), wd, -dw / 2 + .035, h / 2, 0); P3(fr, Bx(.07, h - .1, .03), wd, dw / 2 - .035, h / 2, 0); P3(fr, Bx(dw, .07, .03), wd, 0, h * .52, 0);
    const sg = new T.BoxGeometry(dw - .14, .045, .008), im = new T.InstancedMesh(sg, wd, 30), o = new T.Object3D(); let k = 0; for (let y = .2; y < h - .12 && k < 30; y += .062) { if (Math.abs(y - h * .52) < .06) continue; o.position.set(0, y, 0); o.rotation.set(.75, 0, 0); o.updateMatrix(); im.setMatrixAt(k++, o.matrix) } im.count = k; fr.add(im);
    P3(fr, new T.TorusGeometry(.025, .006, 6, 12), MAT.brass, s * (-dw / 2 + .08), h * .52, .03); HIDE.doors.push({ piv, s }) }
  return g }
function buildHideSpot() { const wd = louverWardrobe(); F(wd, HIDE.x, HIDE.z, HIDE.ry, 1, 1.3, .62); HIDE.group = wd;
  const [ix, iz] = hideAt(.55), Y = FY[1];
  IT.push({ x: BEDH.x - .2, y: Y + .4, z: BEDH.z, l: 1, r: 1.9, lab: () => S.bedHide && !S.hidden ? '[E] มุดซ่อนใต้เตียง' : '', act: () => enterHide('bed') });
  IT.push({ x: ix, y: Y + 1.25, z: iz, l: 1, r: 2.0, lab: () => S.hideUnlocked ? '[E] ซ่อนในตู้เสื้อผ้า' : HIDE.open ? '[E] ปิดตู้เสื้อผ้า' : '[E] เปิดตู้เสื้อผ้า', act: () => { if (S.hideUnlocked && S.bedHide && !S.hidden) return sub('ไม่ได้... เขาต้องกลับมาเปิดตู้นี้แน่ ต้องซ่อนใต้เตียง'); if (S.hideUnlocked) return enterHide(); HIDE.open = !HIDE.open; creak(); noise(ix, iz, 1, .3); if (HIDE.open && !S.key) sub('เสื้อผ้าแขวนเต็มตู้... เสื้อเชิ้ต แจ็กเก็ต กางเกง แล้วก็เสื้อโค้ทตัวยาว') } });
  // individual clothes to inspect: the grey coat holds the key (visible ring + red tag sticking out of the pocket)
  const wpos = lx => { const [fx, fz] = hideFwd(); return [HIDE.x + fx * .32 + fz * lx, HIDE.z + fz * .32 - fx * lx] }; // local x along the rail
  const note = { shirt: 'เสื้อเชิ้ตรีดเรียบ ไม่มีอะไรในกระเป๋า', jacket: 'แจ็กเก็ตเก่า กลิ่นบุหรี่จาง ๆ', trousers: 'กางเกงผ้าพับไว้บนไม้แขวน' };
  for (const [x, k] of [[-.47, 'shirt'], [-.2, 'jacket'], [.45, 'jacket']]) { const [px, pz] = wpos(x); IT.push({ x: px, y: Y + 1.3, z: pz, l: 1, r: 1.6, lab: () => HIDE.open && !S.hidden && !S.hideUnlocked ? '[E] ดู' + (k === 'shirt' ? 'เสื้อเชิ้ต' : 'แจ็กเก็ต') : '', act: () => sub(note[k]) }) }
  const [cx, cz] = wpos(.27); IT.push({ x: cx, y: Y + 1.35, z: cz, l: 1, r: 2.3, rad: .08, tol: .1, lab: () => HIDE.open && !S.hideUnlocked && !S.key ? '[E] ดูเสื้อโค้ทสีเทา' : '', act: () => { SND.cloth(); sub('เสื้อโค้ทสีเทา... มีพวงกุญแจห้อยออกมาจากกระเป๋า') } });
  scene.updateMatrixWorld(true); const kp = new T.Vector3(); KIT.keyMesh.getWorldPosition(kp); // the key itself is the target: its own (modest) hit radius, right where it hangs
  IT.push({ x: kp.x, y: kp.y, z: kp.z, l: 1, r: 2.3, rad: .08, tol: .1, lab: () => HIDE.open && !S.hideUnlocked && !S.key ? '[E] เก็บกุญแจ' : '', act: () => { if (S.key) return; S.key = 1; KIT.keyMesh.visible = false; SND.cloth(); tone(1800, .05, 'triangle', .1, .25); keyToast(); progress('key'); if (window.inspectItem) inspectItem('office') } }) }
function keyToast() { const t = $('#gotit'); t.innerHTML = '<span>ได้รับไอเทม</span><b>กุญแจห้องทำงาน</b><small>กุญแจทองเหลืองพร้อมป้ายสีแดง เขียนว่า "ห้องทำงาน"</small>'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 3800) }
/* office door: real locked state + name plate */
function setupOfficeDoor() { const d = DOORS[5]; d.lock = 1; d.keyId = 'office'; DOORS[6].keyId = 'back';
  const plate = new T.Mesh(new T.PlaneGeometry(.22, .07), M(tex(64, (c, s) => { c.fillStyle = '#b89a5a'; c.fillRect(0, 0, s, s); c.fillStyle = '#2a1e10'; c.font = 'bold 15px "Loma","Tahoma",sans-serif'; c.fillText('ห้องทำงาน', 2, 22) }, 32), .4, { metalness: .5 })); plate.position.set(.46, 1.6, -.03); plate.rotation.y = Math.PI; d.g.children[0].add(plate) }

/* back-room key: on a hook beside the main breaker panel in the storage room (you pass it during the power repair) */
function buildBackKey() { const g = G(), x = p(4.2) - .03, z = 1.35, y = 1.52;
  P3(g, Bx(.02, .12, .16), MC(0x6a5a40, .7), 0, 0, 0); P3(g, Cy(.006, .05, 6), MAT.brass, -.025, .02, 0, 0, 0, Math.PI / 2);
  const k = G(); k.position.set(-.04, -.02, 0); g.add(k); P3(k, new T.TorusGeometry(.014, .003, 6, 12), MAT.brass, 0, 0, 0, 0, Math.PI / 2); P3(k, Bx(.004, .055, .012), MAT.brass, 0, -.04, 0); P3(k, Bx(.004, .012, .012), MAT.brass, 0, -.06, .008);
  const tag = P3(k, new T.PlaneGeometry(.045, .03), new T.MeshBasicMaterial({ map: tex(64, (c, s) => { c.fillStyle = '#e8d070'; c.fillRect(0, 0, s, s); c.fillStyle = '#3a2a10'; c.font = 'bold 16px "Loma","Tahoma",sans-serif'; c.fillText('ห้องหลัง', 2, 26) }, 32) }), -.003, -.025, .03); tag.rotation.y = -Math.PI / 2;
  g.position.set(x, y, z); g.userData.dyn = 1; scene.add(g); KIT.backKey = k;
  IT.push({ x: x - .08, y, z, l: 0, r: 1.7, lab: () => S.backKey ? '' : '[E] หยิบกุญแจที่แขวนไว้', act: () => { if (S.backKey) return; S.backKey = 1; k.visible = false; tone(1800, .05, 'triangle', .1, .1); const t = $('#gotit'); t.innerHTML = '<span>ได้รับไอเทม</span><b>กุญแจห้องหลังบ้าน</b><small>ป้ายเขียนว่า "ห้องหลัง" ใช้ล็อกประตูจากด้านในได้ด้วย [R]</small>'; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 4200); inspectItem('back') } }) }

/* Richard's note as a real 3D sheet: handwritten front, faint show-through + tape on the back. Used on the fridge and in the 3D inspector */
let NOTE_TEX = null;
function noteTextures() { if (NOTE_TEX) return NOTE_TEX; const W = 512, H = 680, mk = back => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#f1ead6'; x.fillRect(0, 0, W, H); for (let i = 0; i < 2400; i++) { x.fillStyle = `rgba(120,100,60,${Math.random() * .05})`; x.fillRect(Math.random() * W, Math.random() * H, 2, 2) } x.strokeStyle = 'rgba(70,110,170,.28)'; for (let y = 96; y < H - 20; y += 34) { x.beginPath(); x.moveTo(24, y); x.lineTo(W - 24, y); x.stroke() } x.strokeStyle = 'rgba(200,60,60,.35)'; x.beginPath(); x.moveTo(62, 0); x.lineTo(62, H); x.stroke();
    if (back) { x.save(); x.translate(W, 0); x.scale(-1, 1); x.globalAlpha = .12 } x.fillStyle = '#1d2a5a'; x.font = 'bold 30px ' + TF; x.fillText('ถึงคนที่มาทำงานกะดึกคืนนี้', 72, 82); x.font = '23px ' + TF;
    const L = ['ขอบคุณที่รับงานกระชั้นชิดนะครับ ผมต้องบินไป', 'ประชุมด่วน จะกลับมาพรุ่งนี้เช้า', '• ห้องทำงานอยู่ชั้นบน ประตูป้าย "ห้องทำงาน" ล็อกไว้', '• กุญแจอยู่ในกระเป๋าเสื้อโค้ทสีเทา', '   ในตู้เสื้อผ้าห้องนอนใหญ่ ชั้นบน', '• เปิดคอมแล้วอ่านอีเมลของมาร์ธาก่อน', '• จอข้าง ๆ เป็นกล้องวงจรปิดของบ้าน', '• ห้องเล็กด้านหลังไม่ต้องเข้าไปนะครับ', '', '                                   — ริชาร์ด'];
    L.forEach((t, i) => { x.save(); x.translate(72, 124 + i * 34); x.rotate((Math.random() - .5) * .008); x.fillText(t, 0, 0); x.restore() }); if (back) x.restore();
    if (back) { x.fillStyle = 'rgba(230,220,170,.75)'; x.fillRect(W / 2 - 60, 0, 120, 34) } else { x.fillStyle = 'rgba(160,40,40,.5)'; x.font = '18px ' + TF; x.fillText('ห้องหลังบ้าน = ห้ามเข้า', 300, H - 30) }
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t }; return NOTE_TEX = [mk(0), mk(1)] }
function noteMesh(w) { const [f, b] = noteTextures(), h = w * 680 / 512, side = new T.MeshStandardMaterial({ color: 0xe8e0c8, roughness: .95 });
  const m = new T.Mesh(new T.BoxGeometry(w, h, .0012), [side, side, side, side, new T.MeshStandardMaterial({ map: f, roughness: .92 }), new T.MeshStandardMaterial({ map: b, roughness: .92 })]); m.castShadow = false; return m }
