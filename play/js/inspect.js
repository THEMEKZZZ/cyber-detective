/* ---------- 360° item inspection ----------
   The item is a real 3D model in its own small scene, rendered by the game renderer through the same VHS post pass.
   Mouse (still pointer-locked, so control is never lost) or WASD/arrows rotate it in any direction, the wheel or +/- zoom,
   [E] / [Space] / [Esc] / the ✕ button close it and the game continues exactly where it was. */
const INS = { scene: null, cam: null, obj: null, rx: .4, ry: .6, vx: 0, vy: 0, dist: .45, id: null, t: 0 };
const ITEMS = {
  office: { name: 'กุญแจห้องทำงาน', desc: 'กุญแจทองเหลืองเก่า ห้อยป้ายหนังสีแดงที่เขียนว่า "OFFICE" พบในกระเป๋าเสื้อโค้ทสีเทาของริชาร์ด ใช้ไขห้องทำงานชั้นบน', build: () => keyModel(0xa01818, 'OFFICE') },
  back: { name: 'กุญแจห้องหลังบ้าน', desc: 'กุญแจเก่าสำหรับเปิดประตูห้องที่ถูกล็อกไว้ชั้นบน ป้ายสีเหลืองเขียนว่า "ห้องหลัง" ใช้ล็อกประตูจากด้านในได้ด้วย', build: () => keyModel(0xe0c050, 'ห้องหลัง') },
  note: { name: 'โน้ตของริชาร์ด', desc: 'กระดาษที่แปะไว้บนตู้เย็น · หมุนดูได้รอบทิศ (WASD/ลากเมาส์) · พลิกดูด้านหลังได้', rx: 0, ry: 0, build: () => { const g = new T.Group(), m = noteMesh(.21); g.add(m); return g } },
  pizza: { name: 'พิซซ่า TONY\'S', desc: 'พิซซ่าเปปเปอโรนีที่เหลือจากเมื่อวาน ริชาร์ดบอกให้เอาเข้าไมโครเวฟก่อนกิน', build: () => pizzaBoxModel() },
};
function keyModel(tagCol, tagTxt) { const g = new T.Group(), brass = new T.MeshStandardMaterial({ color: 0xc8a050, metalness: .85, roughness: .32 });
  const bow = new T.Mesh(new T.TorusGeometry(.03, .009, 12, 28), brass); g.add(bow);
  const shank = new T.Mesh(new T.CylinderGeometry(.0065, .0065, .1, 12), brass); shank.position.y = -.075; g.add(shank);
  for (const [y, h] of [[-.105, .018], [-.118, .01], [-.128, .014]]) { const bit = new T.Mesh(new T.BoxGeometry(.022, h * .8, .006), brass); bit.position.set(.013, y, 0); g.add(bit) }
  const collar = new T.Mesh(new T.CylinderGeometry(.01, .01, .008, 12), brass); collar.position.y = -.026; g.add(collar);
  const ring = new T.Mesh(new T.TorusGeometry(.024, .0025, 8, 30), new T.MeshStandardMaterial({ color: 0xb8b8b8, metalness: .9, roughness: .25 })); ring.position.y = .045; ring.rotation.y = Math.PI / 2; g.add(ring);
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#' + tagCol.toString(16).padStart(6, '0'); x.fillRect(0, 0, 256, 128); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 6; x.strokeRect(6, 6, 244, 116);
  x.fillStyle = tagCol === 0xa01818 ? '#f4e8d0' : '#2a1a08'; x.font = 'bold 54px "Loma","Tahoma",sans-serif'; x.textAlign = 'center'; x.fillText(tagTxt, 128, 84); x.beginPath(); x.arc(28, 64, 10, 0, 7); x.fillStyle = '#222'; x.fill();
  const tag = new T.Mesh(new T.BoxGeometry(.075, .036, .002), [0, 0, 0, 0, 1, 1].map(i => i ? new T.MeshStandardMaterial({ map: new T.CanvasTexture(c), roughness: .8 }) : new T.MeshStandardMaterial({ color: tagCol, roughness: .8 })));
  tag.position.set(.03, .082, 0); tag.rotation.z = -.35; g.add(tag); return g }
function pizzaBoxModel() { const g = new T.Group(), card = new T.MeshStandardMaterial({ color: 0xc8a878, roughness: .9 }); const b = new T.Mesh(new T.BoxGeometry(.36, .04, .36), card); g.add(b);
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#c8a878'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#b02020'; x.font = 'bold 44px serif'; x.textAlign = 'center'; x.fillText("TONY'S", 128, 120); x.font = '22px serif'; x.fillText('PIZZERIA · 24H', 128, 160); x.beginPath(); x.arc(128, 128, 100, 0, 7); x.strokeStyle = '#b02020'; x.lineWidth = 5; x.stroke();
  const lid = new T.Mesh(new T.PlaneGeometry(.35, .35), new T.MeshStandardMaterial({ map: new T.CanvasTexture(c), roughness: .9 })); lid.rotation.x = -Math.PI / 2; lid.position.y = .0205; g.add(lid); return g }
function insBuild() { if (INS.scene) return; INS.scene = new T.Scene(); INS.scene.background = new T.Color(0x0b0a09); INS.cam = new T.PerspectiveCamera(32, innerWidth / innerHeight, .01, 10);
  INS.scene.add(new T.HemisphereLight(0xfff4e0, 0x202428, .8)); const k = new T.DirectionalLight(0xffe8c8, 1.6); k.position.set(.6, .8, 1); INS.scene.add(k); const r = new T.DirectionalLight(0x88aaff, .7); r.position.set(-1, .3, -.8); INS.scene.add(r);
  const spot = new T.PointLight(0xfff0d8, .8, 2); spot.position.set(0, .2, .5); INS.scene.add(spot) }
function inspectItem(id) { const it = ITEMS[id]; if (!it || S.ui) return; insBuild(); if (INS.obj) { INS.scene.remove(INS.obj); INS.obj.traverse(o => { if (o.geometry) o.geometry.dispose(); [].concat(o.material || []).forEach(m => { if (m.map) m.map.dispose(); m.dispose() }) }) } /* free the previous model's GPU buffers */ INS.cache = INS.cache || {}; if (!INS.cache[id]) { const o = it.build(), bx = new T.Box3().setFromObject(o), c = bx.getCenter(new T.Vector3()); o.children.forEach(k => k.position.sub(c)); INS.cache[id] = o } INS.obj = INS.cache[id]; INS.obj.rotation.set(0, 0, 0); const box = new T.Box3().setFromObject(INS.obj); // each item model is built once and reused (no GPU leak on repeated inspection)
  INS.size = box.getSize(new T.Vector3()).length(); INS.dist = INS.size * 1.9; INS.scene.add(INS.obj); Object.assign(INS, { id, rx: it.rx ?? .35, ry: it.ry ?? .5, vx: 0, vy: 0, t: 0 });
  S.ui = 'insp'; $('#gotit').classList.remove('on'); for (const k in keys) keys[k] = 0; $('#insp').style.display = 'block'; $('#insp .in').textContent = it.name; $('#insp .id').textContent = it.desc; tone(660, .06, 'triangle', .06); (window.DBGLOG || []).push('inspect ' + id) }
function closeInspect() { if (S.ui !== 'insp') return; S.ui = null; if (INS.id === 'note' && !S.keyNote) { S.keyNote = 1; progress('note_closed') } $('#insp').style.display = 'none'; for (const k in keys) keys[k] = 0; tone(440, .05, 'triangle', .05); if (!locked && !S.noLock && S.mode === 'play') pause(true) }
function inspectRender(dt) { INS.t += dt; const kx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), ky = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
  INS.vy += kx * dt * 6; INS.vx += ky * dt * 6; INS.ry += INS.vy * dt; INS.rx += INS.vx * dt; INS.vx *= Math.pow(.02, dt); INS.vy *= Math.pow(.02, dt);
  if (keys.Equal || keys.NumpadAdd) INS.dist *= 1 - dt; if (keys.Minus || keys.NumpadSubtract) INS.dist *= 1 + dt; INS.dist = cl(INS.dist, INS.size * .7, INS.size * 4);
  INS.obj.rotation.set(INS.rx, INS.ry, 0, 'YXZ'); INS.cam.aspect = innerWidth / innerHeight; INS.cam.position.set(0, 0, INS.dist); INS.cam.lookAt(0, 0, 0); INS.cam.updateProjectionMatrix();
  ren.setRenderTarget(RTM); ren.render(INS.scene, INS.cam); ren.setRenderTarget(null); ren.render(postS, postC) }
addEventListener('mousemove', e => { if (S.ui !== 'insp') return; if (locked || S.noLock || e.buttons & 1) { INS.ry += e.movementX * .008; INS.rx = cl(INS.rx + e.movementY * .008, -3.2, 3.2) } });
addEventListener('wheel', e => { if (S.ui !== 'insp') return; INS.dist *= e.deltaY > 0 ? 1.1 : .9 }, { passive: true });
