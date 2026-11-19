/* ---------- story director: one centralised state machine (section 11 of the brief) ----------
   Every story beat is a state. States only move forward (go() refuses repeats/regressions), each state owns exactly one
   visible objective (or none), and the director only runs while the game is in normal play (no pause, no overlay UI,
   no intro). Checkpoints are taken on entering the states marked cp and restored by re-entering that state. */
const ST = ['ARRIVAL', 'EMPLOYER_CALL', 'ENTER_HOUSE', 'READ_FRIDGE_NOTE', 'FIND_GREY_COAT', 'COLLECT_KEY', 'UNLOCK_OFFICE', 'START_CYBER_WORK', 'PIZZA_MESSAGE', 'PIZZA_BREAK', 'RETURN_TO_WORK',
  'SUSPICIOUS_EMAIL', 'REPORT_EMPLOYER', 'CCTV_INVESTIGATION', 'INTRUDER_APPROACHING', 'POWER_FAILURE', 'BACK_TO_WORK', 'INTRUDER_ENTERED', 'HIDE_FIRST_TIME', 'INTRUDER_SEARCHING', 'INTRUDER_DOWNSTAIRS', 'RETURN_TO_COMPUTER',
  'EMERGENCY_SIGNAL', 'HIDE_SECOND_TIME', 'POLICE_ARRIVAL', 'ENDING'];
S.st = 'ARRIVAL'; S.stT = 0; S.chapter = 1; S.q = []; S.waveOk = 0; S.tension = 0; S.mailOn = {}; S.upSeen = {}; S.extSeen = {}; S.hides = 0; S.stLog = [];
let GHOST;
const OUT_CAMS = [0, 4, 5, 7, 8];                         // exterior cameras (front yard, side, front door, driveway, backyard)
const UPPER_PLAN = ['comp', 'ward']; /* first hide: two searches upstairs (the computer room, then the bedroom + wardrobe), then he goes back down */
const GROUND_LOOP = ['kitchen', 'living', 'store', 'kit_n', 'bath', 'living', 'kitchen'];
const SECOND_PLAN = ['hall_w', 'bedA', 'ward', 'hall_e', 'bedC', 'bedB', 'hall_m', 'comp', 'bedA', 'ward'];
function after(sec, fn, tag) { S.q.push({ t: S.t + sec, fn, tag, st: S.st }) }
function inside() { return P.x > 0 && P.x < HW && P.z > 0 && P.z < HD }
function stIs(...a) { return a.includes(S.st) }
function stAtLeast(s) { return ST.indexOf(S.st) >= ST.indexOf(s) }
function inSafeRoom() { return PY > 1.6 && roomAt(1, P.x, P.z) === 'bedC' && DOORS[6].lock && !DOORS[6].open } // locked inside the back room
const hidingNow = () => S.hidden || inSafeRoom(), hideDesc = () => S.backKey ? 'ตู้เสื้อผ้าห้องนอนใหญ่ หรือล็อกตัวเองในห้องหลังบ้าน [R]' : 'ตู้เสื้อผ้าในห้องนอนใหญ่ ชั้นบน';
const workT = () => S.t - (S.workT0 || 0); // casesDone()/stepsDone() live in cases3.js
const PZ_TXT = ['', 'พิซซ่าอยู่ในตู้เย็นในครัว ชั้นล่าง', 'หยิบกล่องพิซซ่าออกจากตู้เย็น', 'เปิดไมโครเวฟ แล้วใส่พิซซ่าเข้าไป', 'ปิดประตูไมโครเวฟ แล้วกดอุ่น', 'รอให้ไมโครเวฟอุ่นเสร็จ', 'เปิดไมโครเวฟ แล้วหยิบพิซซ่าออกมา', 'ไปนั่งกินที่โต๊ะในครัว', 'กำลังกิน...'];
/* ---------- state table ---------- */
const DEF = {
  ENTER_HOUSE: { ch: 1, obj: () => ['เข้าไปในบ้าน', 'ประตูหน้าบ้านไม่ได้ล็อก'], done: () => inside(), next: 'READ_FRIDGE_NOTE' },
  READ_FRIDGE_NOTE: { ch: 1, obj: () => ['อ่านโน้ตบนตู้เย็น', 'ริชาร์ดบอกว่าแปะไว้ในห้องครัว'], done: () => S.keyNote, next: 'FIND_GREY_COAT' },
  FIND_GREY_COAT: { ch: 1, cp: 1, obj: () => ['หากุญแจห้องทำงาน', 'อยู่ในกระเป๋าเสื้อโค้ทสีเทา · ตู้เสื้อผ้าห้องนอนใหญ่ ชั้นบน'], done: () => S.key, next: 'COLLECT_KEY' },
  COLLECT_KEY: { ch: 1, enter: () => after(2.6, () => go('UNLOCK_OFFICE')) },
  UNLOCK_OFFICE: { ch: 1, obj: () => ['ไขประตูห้องทำงาน', 'ประตูที่มีป้าย "ห้องทำงาน" ชั้นบน'], done: () => !DOORS[5].lock, next: 'START_CYBER_WORK' },
  START_CYBER_WORK: { ch: 2, cp: 1, enter: () => { S.workT0 = S.t; S.unlockCase = 3 },
    obj: () => !S.read[0] ? ['อ่านอีเมลของมาร์ธา', 'นั่งที่โต๊ะคอมพิวเตอร์ แล้วเปิดแอป "อีเมล"'] : ['ทำ' + INV[0].title, 'แอป "คดี" บนเดสก์ท็อป · ' + INV[0].steps[Math.min(3, invProg(INV[0]))][1], 'ขั้นตอน ' + invProg(INV[0]) + '/4'],
    done: () => !!S.done.C1, next: 'PIZZA_MESSAGE' }, // finishing case 01 moves on immediately (no timer)
  PIZZA_MESSAGE: { ch: 2, enter: () => { msgPush('richard', 'ทำงานไปถึงไหนแล้ว? ถ้าเริ่มหิว ในตู้เย็นมีพิซซ่าอยู่นะ เอาเข้าไมโครเวฟสักหน่อย แล้วไปนั่งกินที่โต๊ะในครัวได้เลย', [['ขอบคุณครับ', 'ขอบคุณครับ กำลังหิวพอดีเลย', [6, 'ตามสบายครับ 🍕']]]); S.pz = Math.max(S.pz, 1); after(.3, () => go('PIZZA_BREAK')) } },
  PIZZA_BREAK: { ch: 2, obj: () => ['พักกินพิซซ่า', S.pz === 8 && S.eat ? (S.eat.n >= EAT_N ? 'อิ่มแล้ว · กด SPACE เพื่อลุกขึ้น' : 'กด E ค้างไว้เพื่อกินทีละชิ้น (' + S.eat.n + '/' + EAT_N + ')') : PZ_TXT[Math.min(8, S.pz)] || '', 'ขั้นที่ ' + Math.max(1, S.pz - 1) + '/7'], done: () => S.pz >= 9, next: 'RETURN_TO_WORK' },
  RETURN_TO_WORK: { ch: 2, cp: 1, enter: () => { S.unlockCase = 6 }, obj: () => ['กลับไปทำงานที่คอมพิวเตอร์', 'ห้องทำงาน ชั้นบน'], done: () => S.pc, next: 'SUSPICIOUS_EMAIL' },
  SUSPICIOUS_EMAIL: { ch: 3, enter: () => { after(8, newMails, 'mail') }, // a short atmospheric beat after sitting back down; never gates progress
    obj: () => !S.mailOn.sus ? ['ทำ' + INV[1].title, 'แอป "คดี" บนเดสก์ท็อป', 'ขั้นตอน ' + invProg(INV[1]) + '/4'] : ['อ่านอีเมลที่เพิ่งเข้ามา', 'มีอีเมลใหม่จากผู้ส่งที่ไม่รู้จัก', 'อ่านแล้ว ' + ((S.read[5] ? 1 : 0) + (S.read[6] ? 1 : 0)) + '/2'],
    done: () => S.mailOn.sus && S.read[5] && S.read[6], next: 'REPORT_EMPLOYER' },
  /* the stalker's photo goes to Richard, who brushes it off and boards his flight; Jake gives the advice that matters later */
  REPORT_EMPLOYER: { ch: 3, enter: reportBegin, obj: () => !S.rpRich ? ['รายงานริชาร์ด', 'กด [P] เปิดแชตริชาร์ด แล้วส่งรูปจากอีเมลให้เขาดู'] : ['ปรึกษาเจค', 'ริชาร์ดขึ้นเครื่องแล้ว · ทักเจคเล่าเรื่องให้ฟัง [P]'], done: () => S.msgs.jake.some(m => m.from === 'them' && m.t.includes('ที่ซ่อน')), next: 'CCTV_INVESTIGATION' },
  CCTV_INVESTIGATION: { ch: 3, enter: () => { after(4, cameraUploads, 'up'); if (GHOST) { GHOST.root.position.set(6.9, 0, -6.6); GHOST.root.rotation.y = Math.atan2(5 - 6.9, 4 + 6.6); GHOST.root.visible = true; S.ghostOn = 1 } },
    obj: () => !S.uploads ? null : !(S.upSeen.up1 && S.upSeen.up2) ? ['ตรวจโฟลเดอร์ "Camera Uploads"', 'มีโฟลเดอร์ใหม่ในแอป "ไฟล์" ที่คุณไม่ได้สร้าง', 'เปิดแล้ว ' + ((S.upSeen.up1 ? 1 : 0) + (S.upSeen.up2 ? 1 : 0)) + '/2'] : ['ตรวจกล้องวงจรปิดภายนอกบ้าน', 'จอข้าง ๆ · กล้องหน้าบ้าน ทางเข้า ทางรถ ข้างบ้าน และหลังบ้าน', 'ตรวจแล้ว ' + OUT_CAMS.filter(i => S.extSeen[i]).length + '/' + OUT_CAMS.length],
    done: () => S.uploads && S.upSeen.up1 && S.upSeen.up2 && OUT_CAMS.every(i => S.extSeen[i]), next: 'INTRUDER_APPROACHING' },
  INTRUDER_APPROACHING: { ch: 4, cp: 1, enter: approach, obj: () => S.apPh === 'gone' || S.apPh === 'cut' ? ['ทำงานต่อ', 'เขาหายไปจากกล้องแล้ว... เคลียร์งานที่ค้างอยู่ก่อน', 'งานที่ทำเพิ่ม ' + Math.min(2, workUnits() - S.gapBase) + '/2'] : S.motionSeen ? ['มีคนแอบอยู่รอบบ้าน', 'เฝ้าดูเขาผ่านกล้องวงจรปิด · สปอตไลท์อาจไล่เขาได้'] : ['เฝ้าดูกล้องวงจรปิด', 'ระบบกล้องตรวจพบความเคลื่อนไหวข้างนอก'] },
  POWER_FAILURE: { ch: 4, cp: 1, enter: () => { S.ups = 1; NPC.root.visible = AI.visible = false; if (S.power) cutPower(); if (S.pc) toast('ไฟดับ! คอมพิวเตอร์สลับไปใช้แบตเตอรี่สำรอง (UPS)'); sub('ไฟดับทั้งบ้าน...') },
    obj: () => ['ไฟดับทั้งบ้าน', 'ซ่อมแผงไฟหลักในห้องเก็บของ ชั้นล่าง · ไฟฉาย [F]'], done: () => S.power, next: 'BACK_TO_WORK' },
  /* someone photographed you through the storeroom window while you fixed the panel; back upstairs, the work never gets finished */
  BACK_TO_WORK: { ch: 4, cp: 1, enter: windowPhoto, obj: () => S.pc ? ['ทำงานต่อ', 'เคลียร์งานที่ค้างอยู่ในคอมพิวเตอร์'] : ['กลับขึ้นไปทำงาน', 'ไฟกลับมาแล้ว · กลับไปที่คอมพิวเตอร์ชั้นบน'], done: () => { if (S.pc && !S.btw0) S.btw0 = S.t; return S.btw0 && S.t - S.btw0 > 10 }, next: 'INTRUDER_ENTERED' },
  INTRUDER_ENTERED: { ch: 5, cp: 1, enter: r => { S.ups = 1; S.hideUnlocked = 1; S.tension = .8;
      if (r) { S.mainCut = 1; S.pickHeard = 1; if (S.power) cutPower(); after(6, intruderEnters, 'enter'); return }
      after(1, () => { S.mainCut = 1; cutPower(); sub('ไฟดับอีกครั้ง... งานยังไม่ทันเสร็จเลย') }, 'cut'); after(4, () => { soundAt(3.7, 1, 10.2, 'pick', 1.6); S.pickHeard = 1; sub('เสียงไขกุญแจ... ที่ประตูหน้าบ้าน!') }, 'pick'); after(7.5, () => subLine('คุณ (ในใจ)', 'ใจเย็นไว้... ทำตามที่เจคบอก อย่าเผชิญหน้า หาที่ซ่อนก่อน', 5), 'self'); after(18, intruderEnters, 'enter') },
    obj: () => S.pickHeard ? ['ซ่อนตัว!', hideDesc()] : ['ไฟดับอีกครั้ง!', 'มีเสียงอะไรที่ประตูหน้าบ้าน?'], done: () => S.pickHeard && hidingNow(), next: 'HIDE_FIRST_TIME' },
  HIDE_FIRST_TIME: { ch: 5, enter: () => { S.hides++ }, obj: () => aiInMyRoom() ? ['อย่าขยับ', 'รอจนกว่าเขาจะออกจากห้อง'] : inSafeRoom() ? ['อยู่เงียบ ๆ ในห้องหลังบ้าน', 'ประตูล็อกอยู่ เขาเข้ามาไม่ได้'] : ['อยู่ให้เงียบที่สุด', MIC.sim ? 'กด [Space] ค้างไว้เพื่อกลั้นหายใจเมื่อเขาเข้าใกล้' : 'เสียงของคุณอาจทำให้เขาได้ยิน'], done: () => S.inHouse, next: 'INTRUDER_SEARCHING' },
  INTRUDER_SEARCHING: { ch: 5, obj: () => aiInMyRoom() ? ['อย่าขยับ', 'รอจนกว่าเขาจะออกจากห้อง'] : ['อย่าออกจากที่ซ่อน', 'รอจนกว่าเขาจะลงไปชั้นล่าง'], done: () => AI.planDone && AI.l === 0 && AI.visible, next: 'INTRUDER_DOWNSTAIRS' },
  INTRUDER_DOWNSTAIRS: { ch: 5, enter: () => { soundAt(6.2, 1.4, 3, 'stair', 1.4); sub('เสียงฝีเท้าลงบันได... เขาลงไปชั้นล่างแล้ว'); after(3.5, () => go('RETURN_TO_COMPUTER')) }, obj: () => ['รอจนกว่าเสียงฝีเท้าจะเงียบลง', 'เขากำลังลงไปชั้นล่าง · อย่าเพิ่งออกจากที่ซ่อน'] },
  RETURN_TO_COMPUTER: { ch: 6, cp: 1, enter: r => { S.sosOn = 1; if (r) restoreDownstairs() }, obj: () => S.hidden ? ['ออกจากที่ซ่อนอย่างระมัดระวัง', 'กด [E] เพื่อออก แล้วกลับไปที่คอมพิวเตอร์'] : ['กลับไปที่คอมพิวเตอร์', 'เดินเบา ๆ (ไม่กด Shift) · เขายังอยู่ชั้นล่าง'], done: () => S.pc, next: 'EMERGENCY_SIGNAL' },
  EMERGENCY_SIGNAL: { ch: 6, obj: () => S.sosSent ? null : ['ส่งสัญญาณฉุกเฉิน', 'เปิดแอป "SOS" บนเดสก์ท็อป', D.app === 'sos' ? (D.sosAddr ? (D.sosType ? 'ขั้นที่ 3/3 · กดปุ่มค้างไว้' : 'ขั้นที่ 2/3') : 'ขั้นที่ 1/3') : ''], done: () => S.sosSent, next: 'HIDE_SECOND_TIME' },
  HIDE_SECOND_TIME: { ch: 6, enter: rush, obj: () => aiInMyRoom() ? ['อย่าขยับ', 'เขาอยู่ในห้องนี้ · รอจนกว่าเขาจะออกไป'] : hidingNow() ? ['อยู่ให้เงียบ รอตำรวจ', S.hideSpot === 'bed' ? 'ใต้เตียง · ตำรวจกำลังมา' : 'ตำรวจกำลังมา'] : ['รีบซ่อนใต้เตียงในห้องนอนใหญ่!', 'เขาจะกลับมาเปิดตู้เสื้อผ้าเพื่อเช็กอีกรอบ · มุดใต้เตียง [E]'], done: () => S.policeT <= 0, next: 'POLICE_ARRIVAL' },
  POLICE_ARRIVAL: { ch: 6, enter: policeArrive, obj: () => S.arrested ? (S.hidden ? [S.hideSpot === 'bed' ? 'ออกจากใต้เตียง' : 'ออกจากตู้เสื้อผ้า', 'ปลอดภัยแล้ว'] : inSafeRoom() ? ['ออกจากห้องหลังบ้าน', 'ปลอดภัยแล้ว'] : null) : ['อยู่ในที่ซ่อนต่อไป', 'เสียงไซเรนดังอยู่หน้าบ้าน'], done: () => S.arrested && !hidingNow() && S.t - S.arrestT > 2, next: 'ENDING' },
  ENDING: { ch: 6, enter: ending },
};
/* ---------- transitions ---------- */
function go(st, restore) { const i = ST.indexOf(st), cur = ST.indexOf(S.st); if (i < 0 || (!restore && i <= cur)) return false;
  const was = S.st; S.st = st; S.stT = S.t; S.chapter = (DEF[st] && DEF[st].ch) || S.chapter; S.stLog.push(st); (window.DBGLOG || []).push('state ' + was + ' -> ' + st);
  objComplete(was); if (DEF[st] && DEF[st].cp && !restore) saveCheckpoint(); if (DEF[st] && DEF[st].enter) DEF[st].enter(restore); if (!restore) beatMsg(st); return true }
function storyBegin() { phoneInit(); S.st = 'EMPLOYER_CALL'; go('ENTER_HOUSE') }
/* phone messages tied to story beats (natural chatter from the people in the player's life, not only instructions) */
const BEAT_MSG = {
  START_CYBER_WORK: [5, 'marta', 'เริ่มงานได้แล้วใช่ไหม? เคสแรกเป็นโปรไฟล์ปลอม ดูรูปให้ละเอียดนะ อย่าเชื่อแค่ชื่อกับรูปโปรไฟล์', [['เริ่มแล้วครับ', 'เริ่มแล้วครับ กำลังดูเคสแรกอยู่', [8, 'โอเค ติดอะไรทักมาได้เลย']]]],
  RETURN_TO_WORK: [12, 'jake', 'ยังไม่นอนอีกเหรอ บ้านลูกค้าเป็นไงมั่ง', [['เงียบดี', 'เงียบดี มีพิซซ่าฟรีด้วย 555', [7, 'โคตรดี เก็บไว้ให้ชิ้นนึงด้วย']], ['น่ากลัวนิดหน่อย', 'บ้านเงียบจนน่ากลัวนิดนึงว่ะ', [7, 'อย่าคิดมาก บ้านเก่าก็มีเสียงแปลก ๆ เป็นธรรมดา']]]],
  POWER_FAILURE: [7, 'unknown', 'มืดแล้วเนอะ'],
};
function beatMsg(st) { const m = BEAT_MSG[st]; if (m) after(m[0], () => { if (S.st === st || m[1] !== 'marta') msgPush(m[1], m[2], m[3]) }, 'msg') } /* a work instruction from Marta is dropped if the player has already moved past that beat */
function chapterStart() { storyBegin() } // kept for older callers
function storyTick(dt) { if (S.flick > 0) S.flick = Math.max(0, S.flick - dt); /* flicker is a timed effect: it used to never count down, so the lights flickered forever */
  if (S.mode !== 'play') return; for (const e of S.q.slice()) if (S.t >= e.t) { S.q.splice(S.q.indexOf(e), 1); e.fn() }
  const d = DEF[S.st]; if (d && d.done && !S.ui && d.done()) go(d.next);
  if (S.st === 'HIDE_SECOND_TIME' && S.policeT > 0) S.policeT -= dt;
  if (S.st === 'HIDE_SECOND_TIME' && !S.ws && S.hidden && S.hideSpot === 'bed' && AI.visible) wardScript();
  if (S.st === 'INTRUDER_APPROACHING' && S.apPh === 'gone' && (workUnits() - S.gapBase >= 2 || S.t - S.gapT0 > 360)) cutApproach();
  if (S.st === 'INTRUDER_APPROACHING' && S.defense) { const z = motionZone(); if (z && !S.waveAlert) { S.waveAlert = 1; S.motionSeen = 1; tone(1500, .1, 'square', .1); tone(1500, .1, 'square', .1, .2); if (!S.pc) sub('เสียงแจ้งเตือนจากคอมพิวเตอร์ชั้นบน...') } if (!z) S.waveAlert = 0; S.motion = z;
    if (AI.st === 'POWER_INTERFERENCE') { AI.ivT -= dt; S.flick = Math.max(S.flick || 0, .3); if (AI.ivT <= 0) { S.motion = null; S.defense = 0; aiSet('OUTSIDE'); go('POWER_FAILURE') } } } else S.motion = null;
  if (S.pz === 8 && !PHOTO.up2) snapEating();
  if (window.compTick) compTick(dt); evTick(dt); qteTick(dt);
  S.tension = stAtLeast('INTRUDER_ENTERED') && AI.visible ? cl(1 - Math.hypot(AI.x - P.x, AI.z - P.z) / 12, .4, 1) : stAtLeast('INTRUDER_APPROACHING') ? .45 : stAtLeast('SUSPICIOUS_EMAIL') ? .2 : 0;
  storyHud() }
/* ---------- objective HUD: only the current objective, a subtle completion line, then the next one ---------- */
const HUDS = { done: null, doneUntil: 0, last: '' }; // completion line timed in real time, so it reads the same at any frame rate
function objComplete(st) { const d = DEF[st]; if (!d || !d.obj) return; const o = d.obj(); if (!o) return; HUDS.done = o[0]; HUDS.doneUntil = performance.now() + 2400; tone(740, .08, 'triangle', .06); tone(1110, .12, 'triangle', .05, .08) }
function storyHud() { let h = ''; if (performance.now() < HUDS.doneUntil) { h = `<div class="ok">✓ ${HUDS.done}</div>` }
  else { const d = DEF[S.st], o = d && d.obj && d.obj(); if (o) h = `<div class="ot">${o[0]}</div>${o[1] ? `<div class="od">${o[1]}</div>` : ''}${o[2] ? `<div class="op">${o[2]}</div>` : ''}` }
  if (h !== HUDS.last) { const newObj = h.includes('class="ot"') && (!HUDS.last.includes('class="ot"') || HUDS.last.split('</div>')[0] !== h.split('</div>')[0]); HUDS.last = h; $('#obj').innerHTML = h; if (newObj && S.mode === 'play') { tone(523, .07, 'triangle', .05); tone(784, .1, 'triangle', .05, .07) } $('#obj').classList.remove('in'); void $('#obj').offsetWidth; $('#obj').classList.add('in') }
  phoneHud(); const inv = []; if (S.key && DOORS[5].lock) inv.push('กุญแจห้องทำงาน'); if (S.inv.pizza) inv.push('พิซซ่า (' + S.inv.pizza + ')'); const iv = inv.length ? 'ของที่ถือ: ' + inv.join(' · ') : ''; if ($('#inv').textContent !== iv) $('#inv').textContent = iv }
/* ---------- gameplay hooks ---------- */
function storyEvent(ev) { }
window.onMailRead = i => { };
window.onCaseDone = id => { }; // Marta only writes when work starts (no repeated messages per case)
window.onCamSel = i => { if (OUT_CAMS.includes(i) && stIs('CCTV_INVESTIGATION')) S.extSeen[i] = 1; if (i === 8 && S.ghostOn === 1) { S.ghostOn = 2; after(2.6, () => { GHOST.root.visible = false; VHS.uniforms.fl.value = 1.6; tone(90, .4, 'sawtooth', .05); toast('...เมื่อกี้มีคนยืนอยู่หลังต้นไม้หรือเปล่า?') }, 'ghost') } };
window.onReport = k => { S.suspect = k; S.reportSent = 1; toast('บันทึกรายงานแล้ว ระบบจะแนบไปกับการแจ้งเหตุ') };
window.onPowerRestored = () => { };
function phoneMsg(who, txt) { tone(1320, .07, 'sine', .06); tone(1760, .09, 'sine', .06, .1); burst(160, 90, .35, .12, 'lowpass', 1, null, .25); // buzz
  callUI('<div class="cn">ข้อความใหม่ · ' + who + '</div><div class="cm"></div>'); $('#call .cm').textContent = txt; clearTimeout(phoneMsg.t); phoneMsg.t = setTimeout(() => callUI(null), 11000) }
/* ---------- SUSPICIOUS_EMAIL / CCTV_INVESTIGATION: evidence that ties back to the real house ---------- */
function newMails() { if (S.mailOn.sus) return;  snapPhoto('mail', [-5, 2.6, 24], [2.0, 4.6, 9.75], { fov: 34, stamp: 1 }); S.mailOn.sus = 1; tone(880, .08, 'sine', .07); tone(1320, .1, 'sine', .07, .12); toast('อีเมลใหม่ (2)'); D.dirty = 1 }
function cameraUploads() { snapPhoto('up1', CAMS[0][1], CAMS[0][2], { fov: 80, cctv: 'CAM 1  หน้าบ้าน', figure: [16, 0, 22.2], figYaw: Math.atan2(3.7 - 16, 9 - 22.2) }); if (!PHOTO.up2) snapEating(); S.uploads = 1; toast('มีโฟลเดอร์ใหม่ใน "ไฟล์": Camera Uploads'); D.dirty = 1; after(25, () => msgPush('unknown', 'ไฟห้องครัวสวยดีนะ'), 'msg') }
function snapEating() { S.eatTime = S.eatTime || fmt(); snapPhoto('up2', [HW + 1.7, 1.45, 4.3], [9.25, .95, 4.9], { fov: 50, stamp: 1, time: S.eatTime }) }
/* ---------- INTRUDER_APPROACHING: he is first seen on the exterior cameras ---------- */
/* he lurks in cover at three spots, each seen by a different exterior camera, then disappears; the power is cut only
   after the player has done two more pieces of work (or 6 minutes pass) */
const LURK = [['lurk_a', 12], ['lurk_b', 10], ['lurk_c', 10]]; // short appearances: he never stands still on camera for long
function workUnits() { return stepsDone() + Object.keys(S.mv).length + (S.quar ? 1 : 0) }
function lurkAt(node) { const n = NAV.n[node]; aiSet('OBSERVING'); AI.lurk = 1; AI.sneak = 0; AI.yaw = Math.atan2(4 - n.x, 5 - n.z) }
function approach() { S.defense = 1; S.motionSeen = 0; S.apPh = 'lurk'; S.lurkI = 0; AI.searchMode = 0; aiPlace('lurk_a'); lurkAt('lurk_a'); after(LURK[0][1], nextLurk, 'walk') }
function nextLurk() { if (!stIs('INTRUDER_APPROACHING') || S.apPh !== 'lurk') return; S.lurkI++; if (S.lurkI >= LURK.length) return leaveLurk(); const [node, t] = LURK[S.lurkI]; AI.lurk = 0; AI.sneak = 1; aiSet('APPROACHING'); aiGo(node, 1.15, () => { lurkAt(node); after(t, nextLurk, 'walk') }) }
function leaveLurk() { S.apPh = 'leaving'; AI.lurk = 0; aiSet('APPROACHING'); aiGo('street', 1.2, () => { NPC.root.visible = AI.visible = false; aiSet('OUTSIDE'); S.apPh = 'gone'; S.gapBase = workUnits(); S.gapT0 = S.t; after(10, () => msgPush('richard', 'ทุกอย่างโอเคไหมครับ? แอปกล้องเด้งแจ้งเตือนเข้ามือถือผมหลายรอบเลย', [['มีคนเดินวนรอบบ้าน', 'มีคนแปลกหน้าเดินวนอยู่รอบบ้านครับ ตอนนี้หายไปแล้ว', [8, 'อาจเป็นคนแถวนี้... ล็อกประตูไว้นะครับ ผมกำลังจะขึ้นเครื่อง ติดต่อยากหน่อย']], ['ไม่มีอะไรครับ', 'ไม่มีอะไรครับ น่าจะเป็นแมว', [8, 'โอเคครับ ผมกำลังจะขึ้นเครื่องแล้ว']]]), 'msg') }) }
function cutApproach() { S.apPh = 'cut'; AI.lurk = 0; aiPlace('corner_ne'); aiSet('APPROACHING'); aiGo('meter', 1.1, () => { aiSet('POWER_INTERFERENCE', { wait: 0 }); AI.ivT = 6; S.flick = 2; sub('ไฟกะพริบ...') }) }
function deter(kind) { if (kind !== 'spot') return; if (!S.defense) { toast('ยังไม่มีอะไรต้องไล่'); return } const k = OUTDOOR_CAM[S.sel]; if (!k) { toast('กล้องตัวนี้ไม่มีสปอตไลท์'); return } EXT.spots[k].t = 20; tone(1800, .05, 'square', .08);
  S.spotLog = S.spotLog || []; const zone = motionZone(), hitIt = zone && OUTDOOR_CAM[zone.cam] === k && S.apPh === 'lurk' && ['OBSERVING', 'APPROACHING'].includes(AI.st);
  S.spotLog.push({ t: fmt(), cam: S.sel + 1, hit: !!hitIt }); if (!hitIt) { toast(zone ? 'สปอตไลท์ส่องผิดจุด เขาไม่ได้อยู่ในมุมนี้' : 'ไม่มีใครอยู่ในมุมนี้'); return }
  startle() }
/* spotlight caught him: flinch (arms up, half a step back), then sprint out of the camera's view and away from the house */
function startle() { S.waveOk = 1; S.q = S.q.filter(e => e.tag !== 'walk'); AI.lurk = 0; AI.sneak = 0; aiSet('STARTLED'); AI.path = []; AI.yaw += Math.PI * .15; burst(900, 400, .2, .18, 'bandpass', 3); toast('โดนแสงเข้าเต็มหน้า! เขาสะดุ้งแล้ววิ่งหนี'); sting();
  after(.8, () => { S.apPh = 'leaving'; aiSet('RETREAT'); aiGo('street', 3.4, () => { NPC.root.visible = AI.visible = false; aiSet('OUTSIDE'); S.apPh = 'gone'; S.gapBase = workUnits(); S.gapT0 = S.t }) }, 'flee') }
function motionZone() { if (!AI.visible || !['OBSERVING', 'APPROACHING', 'POWER_INTERFERENCE', 'RETREAT', 'STARTLED'].includes(AI.st)) return null; const x = AI.x, z = AI.z;
  if (z < 0) return { cam: 8 }; if (x > HW - .2 && z < 9.75) return { cam: 4 }; if (z > 9.75 && z < 11.8 && x > 1.8 && x < 5.6) return { cam: 5 }; if (x > 8.5 && x < 15.6 && z > 9.75 && z < 17) return { cam: 7 }; if (z > 9.75 && x > -3 && x < 22) return { cam: 0 }; return null }
function cutPower() { setPower(false); S.panelBroken = true; SND.powerDown(); S.silence = 1; after(2.5, () => S.silence = 0) }
/* ---------- the house search ---------- */
function intruderEnters() { aiPlace('porch'); aiSet('ENTERING_HOUSE'); AI.speed = 1.1; AI.searchMode = 1; AI.plan = UPPER_PLAN.slice(); AI.loop = GROUND_LOOP; AI.planDone = 0; AI.wait = 3;
  after(3.2, () => { const d = DOORS[0]; d.open = true; soundAt(d.x, 1, d.z, 'creak', 1.6); aiSet('SEARCHING'); AI.searched = {}; S.inHouse = 1; sub('ประตูหน้าบ้านเปิดออก...') }, 'door') }
function restoreDownstairs() { if (S.power) setPower(false); S.panelBroken = true; S.mainCut = 1; S.pickHeard = 1; S.ups = 1; S.hideUnlocked = 1; S.inHouse = 1; DOORS[0].open = true; DOORS[0].a = 1; aiPlace('kitchen'); aiSet('SEARCHING'); AI.searched = {}; AI.searchMode = 1; AI.plan = GROUND_LOOP.slice(); AI.loop = GROUND_LOOP; AI.planDone = 1; AI.speed = 1.1;
  [P.x, P.z] = hideAt(1.1); PY = FY[1]; P.yaw = HIDE.ry + Math.PI }
function rush() { S.policeT = 70; S.sosOn = 1; S.bedHide = 1; AI.forceWard = 1; after(4, () => subLine('คุณ (ในใจ)', 'เขาต้องกลับไปเช็กตู้นั้นแน่... ต้องซ่อนที่อื่น ใต้เตียง!', 4.5), 'self2'); sub('เสียงยืนยันดังลั่นบ้าน... ชั้นล่างเงียบไปทันที'); S.tension = 1;
  after(2.2, () => { if (S.ws) return; sub('ฝีเท้าวิ่งขึ้นบันได!'); AI.lastHeard = null; AI.plan = SECOND_PLAN.slice(); AI.loop = SECOND_PLAN; AI.planDone = 1; aiSet('INVESTIGATING_SOUND'); aiGo('comp', 2.5, () => aiSet('CHECKING_ROOM', { wait: 3.5 })) }, 'rush') }
/* second hide, player under the bed: he walks straight in (opening the door if it is shut), taunts the wardrobe as if he knows,
   yanks it open once, finds nothing, grumbles and leaves the room -- then the police arrive */
const STRANGER = 'ชายแปลกหน้า';
function wardScript() { S.ws = 1; S.policeT = Math.max(S.policeT, 40); AI.forceWard = 0; AI.plan = null; AI.loop = null; AI.lastHeard = null; AI.searchMode = 0; S.q = S.q.filter(e => e.tag !== 'rush');
  aiSet('STALK'); AI.speed = 1.6; sub('ฝีเท้าตรงมาที่ห้องนอน...');
  aiGo('ward_t', 1.6, () => { aiSet('TAUNT'); AI.yaw = Math.atan2(HIDE.x - AI.x, HIDE.z - AI.z); AI.wait = 99;
    const T = [[STRANGER, 'ชู่ว... ได้ยินนะ เสียงหายใจน่ะ'], [STRANGER, 'รู้อยู่แล้วว่าแกซ่อนอยู่ในตู้นี้... บ้านนี้ฉันรู้จักทุกซอก'], [STRANGER, 'ออกมาดี ๆ เถอะ... ไม่งั้นฉันเปิดเอง']];
    T.forEach(([w, t], i) => after(i * 3.1, () => subLine(w, t, 3), 'ws'));
    after(9.6, () => { aiSet('OPENING_WARDROBE'); AI.wait = 99; HIDE.open = 1; creakAt(HIDE.x, HIDE.z, 1); sting(); sub('เขากระชากตู้เสื้อผ้าเปิด... ว่างเปล่า') }, 'ws');
    after(11.8, () => { aiSet('TAUNT'); subLine(STRANGER, 'อะไรวะ... ไม่มีใคร?', 2.6) }, 'ws');
    after(14.6, () => subLine(STRANGER, 'ชิ... หูฝาดไปเองรึไง บ้านเก่าบ้าบอ', 2.8), 'ws');
    after(17.4, () => { aiSet('STALK'); AI.wait = 0; aiGo('hall_m', 1.4, () => { aiSet('TAUNT'); AI.wait = 99; S.ws = 2; S.policeT = Math.min(S.policeT, 2.5) }) }, 'ws') }) }
function sosSend() { if (S.sosSent) return; S.sosSent = fmt(); D.sosHold = 1; D.dirty = 1; [0, .35, .7, 1.05].forEach(w => tone(1760, .22, 'square', .14, w)); tone(2200, .6, 'square', .12, 1.4); toast('ส่งสัญญาณแล้ว — ตำรวจกำลังเดินทาง (ประมาณ 1 นาที)') }
/* ---------- POLICE_ARRIVAL: sirens, red/blue through the windows, scripted (non-graphic) arrest ---------- */
function policeCar(x, z) { const g = sedan(0x101317), wh = MC(0xe8e8e8, .5); for (const sz of [-1, 1]) P3(g, Bx(2.0, .34, .02), wh, -.25, .62, sz * .975); P3(g, Bx(.3, .1, 1.1), MC(0x222222, .5), -.3, 1.53, 0); const r = P3(g, Bx(.26, .1, .5), new T.MeshBasicMaterial({ color: 0xff2020 }), -.3, 1.6, -.28), b = P3(g, Bx(.26, .1, .5), new T.MeshBasicMaterial({ color: 0x2040ff }), -.3, 1.6, .28);
  g.position.set(x, 0, z); g.rotation.y = Math.PI; g.traverse(o => o.userData.dyn = 1); scene.add(g); return { g, r, b } }
function policeArrive(restore) { SND.police(); after(2.5, () => SND.police()); const cars = [policeCar(7.2, 19.6), policeCar(-1.5, 20.1)], Ls = [];
  for (const [x, y, z] of [[3.7, 2.2, 13], [9, 2.2, 13.5], [1.5, 4.5, 12.5], [7, 4.8, 13], [HW + 2.5, 2.5, 5]]) { const L = new T.PointLight(Ls.length % 2 ? 0x2040ff : 0xff2020, 0, 26, 1.4); L.position.set(x, y, z); scene.add(L); Ls.push(L) } LB.n = -1; // refresh the light budget list
  let k = 0; S.policeFx = setInterval(() => { k++; Ls.forEach((L, i) => L.intensity = (k + i) % 2 ? 5 : 0); cars.forEach(c => { c.r.visible = k % 2 === 0; c.b.visible = k % 2 === 1 }) }, 260);
  S.q = S.q.filter(e => e.tag !== 'ws'); sub('ไซเรน! ตำรวจมาถึงแล้ว'); S.tension = .6; AI.searchMode = 0; AI.plan = null; aiSet('LEAVING'); AI.wait = 1.4; AI.speed = 3; // he freezes, then bolts for the stairs
  after(1.5, () => aiGo('entry', 3.0, arrest), 'flee') }
function arrest() { aiSet('ARRESTED'); AI.path = []; const lines = [['ตำรวจ', 'ตำรวจ! หยุดอยู่ตรงนั้น!'], ['ตำรวจ', 'หมอบลงกับพื้น! มือไว้ข้างหลัง!'], ['ตำรวจ', 'ได้ตัวแล้ว... พาออกไปที่รถ'], ['ตำรวจ', 'มีใครอยู่ในบ้านไหมครับ? ปลอดภัยแล้ว ออกมาได้เลย']];
  lines.forEach(([w, t], i) => after(i * 2.8, () => { subLine(w, t, 2.7); soundAt(3.7, 1.4, 8.5, i === 1 ? 'knock' : 'step', 1.2); if (i === 2) { NPC.root.visible = AI.visible = false; S.arrested = 1; S.arrestT = S.t } }, 'arrest')) }
function ending() { if (S.ended) return; S.ended = true; const ev = Object.keys(S.clues).length, good = S.suspect === 'voss' || (S.done.C3 && ev >= 6);
  const right = MAILS.filter((m, i) => S.mv[i] === m.v).length; $('#endTitle').textContent = 'ฉากจบ: รุ่งสาง';
  $('#endText').textContent = 'ตำรวจควบคุมตัวชายสวมหน้ากากออกจากบ้านเลขที่ 1407 ได้ก่อนรุ่งเช้า สัญญาณฉุกเฉินที่คุณเสี่ยงออกไปส่งคือเหตุผลที่พวกเขามาทัน ' + (good ? 'หลักฐานจากคดี MH-0412 ที่คุณรวบรวมไว้ยืนยันว่าเขาคือแดเนียล วอสส์ ผู้เช่าคนก่อนที่เฝ้าดูบ้านหลังนี้มาตลอด' : 'แต่ใครคือคนที่เฝ้าดูบ้านหลังนี้มาหลายสัปดาห์ ตำรวจยังต้องสืบต่อ หลักฐานในคอมพิวเตอร์อาจมีคำตอบมากกว่านี้') + (S.laptopUnplugged ? ' แล็ปท็อปในห้องหลังบ้านที่คุณถอดปลั๊กไว้ ถูกเก็บเป็นหลักฐานด้วย' : '');
  $('#endstats').innerHTML = `คดีที่ปิดได้: <b>${casesDone()}/3</b> (ขั้นตอน ${stepsDone()}/12)<br>อีเมลที่คัดแยกถูก: <b>${right}/${mailsVisible().length}</b><br>หลักฐานทั้งหมด: <b>${Object.keys(S.clues).length}/${Object.keys(CLUES).length}</b><br>ซ่อนตัวในตู้: <b>${S.hides} ครั้ง</b><br>เวลาในเกม: <b>${fmt()}</b>`;
  epilogue(good, () => { clearInterval(S.policeFx); $('#end').style.display = 'flex'; S.mode = 'end'; document.exitPointerLock && document.exitPointerLock(); try { localStorage.removeItem('cd4s'); localStorage.removeItem('cd4cp') } catch (e) { } }) }
/* ---------- checkpoints ---------- */
function snapshot() { return { v: 5, st: S.st, t: S.t, power: S.power, ups: S.ups, panel: S.panelBroken, key: S.key, keyNote: S.keyNote, x: P.x, z: P.z, yaw: P.yaw, py: PY, d: DOORS.map(d => [d.open, d.lock]), r: Object.values(ROOMS).map(r => r.on),
    clues: S.clues, mv: S.mv, read: S.read, quar: S.quar, cam7: S.cam7, camSeen: S.camSeen, done: S.done, cs: S.cs, pz: S.pz, waveOk: S.waveOk, lap: [S.laptopDone, S.laptopUnplugged, S.camTrack], mailOn: S.mailOn, uploads: S.uploads, upSeen: S.upSeen, extSeen: S.extSeen, workT0: S.workT0, eatTime: S.eatTime, hides: S.hides, suspect: S.suspect, unlockCase: S.unlockCase, backKey: S.backKey, msgs: S.msgs, unread: S.unread, ts: Date.now() } }
function saveCheckpoint() { try { localStorage.setItem('cd4cp', JSON.stringify(snapshot())) } catch (e) { } }
function applySnapshot(d) { if (d.v !== 5) { storyBegin(); return }
  Object.assign(S, { t: d.t, key: d.key, keyNote: d.keyNote, clues: d.clues || {}, mv: d.mv || {}, read: d.read || {}, quar: d.quar, cam7: d.cam7, camSeen: d.camSeen || {}, done: d.done || {}, pz: d.pz >= 1 && d.pz < 9 ? 1 : d.pz, waveOk: d.waveOk || 0, panelBroken: d.panel, ups: d.ups,
    mailOn: d.mailOn || {}, uploads: d.uploads, upSeen: d.upSeen || {}, extSeen: d.extSeen || {}, workT0: d.workT0, eatTime: d.eatTime, hides: d.hides || 0, suspect: d.suspect, unlockCase: d.unlockCase, backKey: d.backKey }); if (d.msgs) { S.msgs = d.msgs; S.unread = d.unread || {} } else phoneInit(); if (S.backKey && KIT.backKey) KIT.backKey.visible = false; if (d.cs) S.cs = Object.assign(csDefault(), d.cs); [S.laptopDone, S.laptopUnplugged, S.camTrack] = d.lap || [];
  P.x = d.x; P.z = d.z; P.yaw = d.yaw; PY = d.py; d.d.forEach((o, i) => { if (DOORS[i]) { DOORS[i].open = o[0]; DOORS[i].a = o[0] ? 1 : 0; DOORS[i].lock = o[1] } }); Object.values(ROOMS).forEach((r, i) => r.on = d.r[i]); setPower(d.power);
  if (S.key && KIT.keyMesh) KIT.keyMesh.visible = false; if (S.pz >= 3 && KIT.box) KIT.box.visible = false; if (S.laptopUnplugged && LAPTOP) LAPTOP.userData.scr.material.color.setHex(0);
  if (S.mailOn.sus) snapPhoto('mail', [-5, 2.6, 24], [2.0, 4.6, 9.75], { fov: 34, stamp: 1 }); if (S.uploads) { const u = S.uploads; S.uploads = 0; cameraUploads(); S.uploads = u }
  S.q = []; go(d.st, true) }

/* ---------- Event Manager: conditional, controlled-random unease while you work ----------
   Each event has a story condition, fires at most once, and the manager keeps a minimum quiet gap between events
   (so the player is never interrupted constantly). Objective progress never waits for these: they only set the mood. */
const SECURITY = { name: 'SafeHome · ระบบรักษาความปลอดภัย', av: '#2a6a4a', ini: '🛡' };
const EVENTS = [
  { id: 'friend', w: 3, when: () => stAtLeast('START_CYBER_WORK') && !stAtLeast('INTRUDER_APPROACHING') && S.pc && S.t - (S.workT0 || 0) > 90, fire: () => msgPush('jake', 'งานเสร็จยัง? พรุ่งนี้ตื่นไหวไหม ไปกินมื้อเช้าที่ร้านเดิมกัน', [['ไหวอยู่', 'ไหวอยู่ เจอกันแปดโมง', [6, 'โอเค อย่าเบี้ยวล่ะ']], ['คงไม่ไหว', 'คงไม่ไหวว่ะ งานเยอะ', [6, 'งั้นไว้คราวหน้า']]]) },
  { id: 'flicker', w: 2, when: () => stAtLeast('PIZZA_BREAK') && !stAtLeast('POWER_FAILURE') && S.power, fire: () => { S.flick = .7 } }, // a small oddity: the lights dip for a moment
  { id: 'stranger', w: 3, when: () => stAtLeast('RETURN_TO_WORK') && !stAtLeast('POWER_FAILURE') && S.pc, fire: () => msgPush('unknown', 'ทำงานดึกจังนะ ไฟห้องชั้นบนเปิดทั้งคืนเลย') },
  { id: 'fence', w: 3, when: () => stAtLeast('SUSPICIOUS_EMAIL') && !stAtLeast('INTRUDER_APPROACHING') && S.pc && GHOST, fire: () => { notify(SECURITY, 'ตรวจพบความเคลื่อนไหวบริเวณรั้วหลังบ้าน (CAM 9)'); GHOST.root.position.set(8.6, 0, -7.6); GHOST.root.rotation.y = Math.atan2(5 - 8.6, 4 + 7.6); GHOST.root.visible = true; after(14, () => { if (S.ghostOn !== 1) GHOST.root.visible = false }, 'ev') } },
  { id: 'knock', w: 2, when: () => stAtLeast('RETURN_TO_WORK') && !stAtLeast('INTRUDER_APPROACHING'), fire: () => { soundAt(7, 1.2, -.2, 'knock', .9); if (!S.pc) sub('...เสียงเคาะเบา ๆ ที่ประตูหลังบ้าน') } },
  { id: 'anon', w: 2, when: () => stAtLeast('CCTV_INVESTIGATION') && !stAtLeast('POWER_FAILURE') && S.pc, fire: () => { S.mailOn.anon = 1; toast('อีเมลใหม่ (1)'); D.dirty = 1; tone(880, .08, 'sine', .06) } },
  { id: 'secpush', w: 2, when: () => stAtLeast('INTRUDER_APPROACHING') && S.apPh === 'gone' && !stAtLeast('POWER_FAILURE'), fire: () => notify(SECURITY, 'กล้องหน้าบ้านออฟไลน์ 3 วินาที · กลับมาเชื่อมต่อแล้ว') },
];
const EVM = { gap: 75, last: -1e9, t: 0 };
function evTick(dt) { if (S.mode !== 'play' || S.ui || S.hidden) return; EVM.t += dt; if (EVM.t < 1) return; EVM.t = 0; S.evFired = S.evFired || {};
  if (S.t - EVM.last < EVM.gap) return; const ok = EVENTS.filter(e => !S.evFired[e.id] && e.when()); if (!ok.length) return;
  let r = Math.random() * ok.reduce((a, e) => a + e.w, 0); const e = ok.find(e => (r -= e.w) < 0) || ok[0]; S.evFired[e.id] = fmt(); EVM.last = S.t; EVM.gap = rr(60, 110); e.fire(); (window.DBGLOG || []).push('event ' + e.id) }
window.onInvDone = id => { if (id === 'C2') after(5, () => msgPush('marta', 'มีงานเข้ามาเพิ่มหนึ่งงาน: คุณริชาร์ดร้องเรียนว่าถูกคุกคามออนไลน์ เปิดคดี 03 ได้เลย หลักฐานอยู่ในระบบแล้ว'), 'msg') };

/* ---------- report beat, window photo, epilogue ---------- */
function reportBegin() { S.rpRich = 0; const jake = () => after(4.4, () => { S.rpRich = 1; PH.replies.jake = [['เล่าให้เจคฟัง', 'เจค มีคนส่งรูปบ้านที่ฉันเฝ้าอยู่มา ถ่ายจากถนนเมื่อกี้เลย ริชาร์ดบอกว่าคงเป็นคนแถวนั้นแกล้ง แล้วก็ขึ้นเครื่องไปแล้ว ฉันควรทำไงดีวะ', [5, 'เฮ้ย อย่าชะล่าใจนะเพื่อน ฟังข้า: ล็อกประตูทุกบาน อย่าออกไปเผชิญหน้าเด็ดขาด ถ้ามีใครพยายามเข้าบ้านจริง ๆ ไปหาที่ซ่อนก่อน ตู้เสื้อผ้าหรือใต้เตียงก็ได้ ปิดเสียงมือถือ แล้วกดปุ่ม SOS ของบริษัทแกเรียกตำรวจ อย่าให้เขารู้ว่าแกอยู่ตรงไหน']]] }, 'rp');
  PH.replies.richard = [['ส่งรูปให้ริชาร์ด', 'คุณริชาร์ดครับ มีคนส่งรูปบ้านคุณมาทางอีเมล ถ่ายจากถนนตอนกลางคืนนี้เอง ผมควรทำยังไงดีครับ', [4, 'น่าจะเป็นคนแถวนั้นแหละ เด็กแถวนี้ชอบแกล้งกัน ไม่ต้องห่วง ล็อกประตูไว้ก็พอ... ขอโทษนะ ผมต้องขึ้นเครื่องแล้ว ระหว่างบินผมใช้โทรศัพท์ไม่ได้ เจอกันตอนเช้า'], jake, () => PHOTO.mail ? PHOTO.mail.toDataURL('image/jpeg', .8) : undefined]] }
function windowPhoto() { S.btw0 = 0; avatarTick(0); const ap = AV.root ? AV.root.position : P; snapPhoto('win', [-1.7, 1.5, 2.3], [ap.x, 1.15, ap.z], { fov: 34, stamp: 1 }); after(3, () => msgImg('unknown', 'ไฟกลับมาแล้วนะ ช่างซ่อมตัวเก่ง 🙂', PHOTO.win ? PHOTO.win.toDataURL('image/jpeg', .8) : undefined), 'wphoto') }
function epilogue(good, done) { const el = document.getElementById('epi') || Object.assign(document.createElement('div'), { id: 'epi' }); document.body.appendChild(el); S.ui = 'epi'; S.hidden = false; S.flash = 0;
  /* the house after: power back on low, front door and wardrobe left open, police lights still washing the front */
  S.power = true; S.mainCut = 0; for (const k of ['living', 'hall', 'bedA', 'comp']) if (ROOMS[k]) ROOMS[k].on = 1; for (const d of DOORS) if (d.l === 0 && d.ax === 'x' && Math.abs(d.z - HD) < .1) { d.open = true; d.lock = 0 } HIDE.open = 1;
  ['#hud', '#obj', '#sub', '#hint', '#ntf', '#phb', '#pchint'].forEach(q => { const e = document.querySelector(q); if (e) e.style.visibility = 'hidden' });
  const F1 = FY[1];
  /* shots: [from, to, look-from, look-to] -- each one drifts slowly while its narration line plays */
  const SH = [[[-3, 2.4, 25], [7.5, 2.1, 23.5], [3.7, 1.6, 9.7], [3.7, 1.9, 9.7]],                // 1 exterior: street, police car, lawn
    [[9.5, 1.5, 17], [5.2, 1.6, 12.6], [3.7, 1.3, 9.7], [3.7, 1.4, 8]],                             // 2 across the lawn to the front door
    [[3.7, 1.6, 11.2], [3.7, 1.6, 8.6], [3.7, 1.4, 6], [2.6, 1.2, 5]],                              // 3 through the front door, into the living room
    [[2.0, 1.5, 7.6], [5.6, 1.5, 7.0], [2.2, .8, 4.6], [3.4, .9, 4.4]],                              // 4 the living room, the furniture you walked past all night
    [[2.6, F1 + 1.5, 8.4], [1.9, F1 + 1.45, 8.0], [1.6, F1 + 1.1, 6.6], [1.5, F1 + 1.05, 6.5]],      // 5 upstairs: the computer that called the police
    [[3.2, F1 + 1.4, 3.9], [2.3, F1 + 1.2, 3.3], [.4, F1 + 1.0, .9], [.5, F1 + .9, .8]],             // 6 the main bedroom: the wardrobe he tore open, the bed you hid under
    [[3.7, 2.6, 21.5], [3.7, 8.5, 25.6], [3.7, 2.8, 9.7], [3.7, 3.6, 9.7]]];                       // 7 crane up and back over the street (stays in front of the houses across the road, z < 26)
  const L = ['คืนนั้นจบลงตอนตีสี่กว่า ๆ ตำรวจพาตัวเขาออกไป ผมนั่งให้ปากคำอยู่ข้างรถตำรวจจนฟ้าเริ่มสาง',
    good ? 'เขาคือแดเนียล วอสส์ ผู้เช่าคนก่อนของบ้านหลังนี้ หลักฐานที่ผมเก็บไว้ในคอมพิวเตอร์ช่วยมัดตัวเขาได้' : 'ตอนนั้นยังไม่มีใครรู้ว่าเขาเป็นใคร ผมได้แต่หวังว่าสิ่งที่ผมเจอในคอมพิวเตอร์จะพอช่วยตำรวจได้บ้าง',
    'มาร์ธา หัวหน้าผม ส่งทนายของบริษัทมานั่งข้างผมตอนให้ปากคำ แล้วสั่งให้ผมหยุดงานหนึ่งสัปดาห์โดยได้เงินเต็ม',
    'คุณริชาร์ดเห็นข้อความตอนเครื่องลง เขาขอโทษซ้ำแล้วซ้ำอีกที่บอกว่าเป็นแค่คนแถวนั้น แล้วไปเป็นพยานให้ผมในศาล',
    'แม่ขับรถมารับผมเอง ส่วนเจคมาพร้อมกาแฟสองแก้ว บอกว่าดีแล้วที่ผมฟังเรื่องหาที่ซ่อน และไปเป็นเพื่อนทุกครั้งที่ต้องไปโรงพัก',
    'ตำรวจบอกว่าผมปลอดภัยแล้ว... แต่ผมไม่เคยมองตู้เสื้อผ้า หรือช่องใต้เตียงแบบเดิมได้อีกเลย',
    'บางคืนผมยังได้ยินเสียงฝีเท้าในความเงียบ ทั้งที่รู้ดีว่าไม่มีใครอยู่ตรงนั้นแล้ว'];
  let i = -1, t = 0, shotT = 0, fading = 0; el.innerHTML = '<div class="el"></div><div class="et"></div><div class="ek">SPACE ถัดไป · ESC ข้าม</div><div class="eb"></div>'; el.style.display = 'block';
  const tx = el.querySelector('.el'), bl = el.querySelector('.eb'), tt = el.querySelector('.et'); const mus = epiMusic();
  const show = () => { if (fading) return; i++; if (i >= L.length) return outro(); tx.style.opacity = 0; setTimeout(() => { tx.innerHTML = '<b>คุณ:</b> ' + L[i]; tx.style.opacity = 1 }, 500); t = 0; shotT = 0; bl.style.opacity = .85; setTimeout(() => bl.style.opacity = 0, 450) };
  const key = e => { if (S.ui !== 'epi') return; if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') show(); else if (e.code === 'Escape') fin(); e.stopPropagation() };
  const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  EPI.cam = () => { if (S.ui !== 'epi' || i < 0) return; const s = SH[Math.min(i, SH.length - 1)], k = Math.min(1, shotT / 11), e = k * k * (3 - 2 * k), p = lerp3(s[0], s[1], e), lk = lerp3(s[2], s[3], e), h = Math.sin(performance.now() / 900) * .01;
    P.x = p[0]; P.z = p[2]; PY = p[1] > FY[1] ? FY[1] : 0; /* light budget + floor culling follow the shot */ cam.position.set(p[0], p[1] + h, p[2]); cam.lookAt(lk[0], lk[1], lk[2]); if (cam.fov !== 55) { cam.fov = 55; cam.updateProjectionMatrix() } };
  const iv = setInterval(() => { t += .05; shotT += .05; if (t > 10.5) show() }, 50);
  function outro() { fading = 1; tx.style.opacity = 0; bl.style.transition = 'opacity 4s'; bl.style.opacity = 1; mus.fade(6);
    setTimeout(() => { tt.innerHTML = '<div style="font-size:34px;letter-spacing:6px;color:#ddd">CYBER DETECTIVE</div><div style="margin-top:14px;color:#9a9a9a;font-size:17px">รอดมาได้... แต่ไม่เคยลืม</div>'; tt.style.opacity = 1 }, 4200);
    setTimeout(() => { tt.style.opacity = 0 }, 10500); setTimeout(fin, 12500) }
  function fin() { if (S.ui !== 'epi') return; clearInterval(iv); removeEventListener('keydown', key, true); mus.stop(); el.style.display = 'none'; S.ui = null; EPI.cam = null; ['#hud', '#obj', '#sub', '#hint', '#ntf', '#phb', '#pchint'].forEach(q => { const e = document.querySelector(q); if (e) e.style.visibility = '' }); done() }
  addEventListener('keydown', key, true); EPI.fin = fin; show() }
/* ending score, made live with Web Audio: wind bed, a police siren fading into the distance, a slow minor piano line over a dark pad.
   Kept well under the narration level (the narration is on screen); everything fades out with the picture */
function epiMusic() { if (!AC) return { fade() { }, stop() { } }; const out = AC.createGain(); out.gain.value = 0; out.connect(SFX); const t0 = AC.currentTime; out.gain.linearRampToValueAtTime(.55, t0 + 4); const nodes = [];
  { const n = AC.createBufferSource(); n.buffer = NOISEBUF; n.loop = true; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; const g = AC.createGain(); g.gain.value = .05; const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = .09; lg.gain.value = .03; lfo.connect(lg); lg.connect(g.gain); n.connect(f); f.connect(g); g.connect(out); n.start(); lfo.start(); nodes.push(n, lfo) } // wind
  { const o = AC.createOscillator(), g = AC.createGain(), lf = AC.createOscillator(), lg = AC.createGain(); o.type = 'triangle'; o.frequency.value = 760; lf.frequency.value = .55; lg.gain.value = 180; lf.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(.022, t0); g.gain.exponentialRampToValueAtTime(.0005, t0 + 22); o.connect(g); g.connect(out); o.start(); lf.start(); o.stop(t0 + 23); lf.stop(t0 + 23) } // siren leaving
  const pad = (fs, at, d) => fs.forEach(f => { for (const det of [-3, 3]) { const o = AC.createOscillator(), fl = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; fl.type = 'lowpass'; fl.frequency.value = 700; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.012, at + 2.5); g.gain.setValueAtTime(.012, at + d - 2.5); g.gain.linearRampToValueAtTime(0, at + d); o.connect(fl); fl.connect(g); g.connect(out); o.start(at); o.stop(at + d + .1) } });
  const note = (f, at, v = .05) => { for (const [m, vv] of [[1, v], [2, v * .3], [3, v * .12]]) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f * m; g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vv, at + .01); g.gain.exponentialRampToValueAtTime(.0004, at + 3.6 / m); o.connect(g); g.connect(out); o.start(at); o.stop(at + 3.8) } };
  const A = 220, Fz = 174.61, C = 261.63, G = 196, E = 329.63, D = 293.66; const prog = [[A / 2, C, E], [Fz / 2, A, C], [C / 2, E / 2, G], [G / 2, D / 2, G]], mel = [[E * 2, C * 2, A], [C * 2, A, Fz * 2 / 2], [G * 2, E * 2, C * 2], [D * 2, G, D * 2]];
  for (let bar = 0; bar < 24; bar++) { const at = t0 + 2 + bar * 4, ch = prog[bar % 4]; pad(ch, at, 4.2); const m = mel[bar % 4]; note(m[0], at + .2, .045); note(m[1], at + 1.6, .035); if (bar % 2) note(m[2], at + 2.8, .03); if (bar % 4 === 0) note(ch[0], at, .05) }
  return { fade(s) { const t = AC.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + s) }, stop() { try { out.disconnect(); nodes.forEach(n => n.stop()) } catch (e) { } } } }
const EPI = {};

/* the intruder is in the room you are hiding in (objective text while hidden) */
function aiInMyRoom() { return S.hidden && AI.visible && AI.l === 1 && roomAt(1, AI.x, AI.z) === 'bedA' }
