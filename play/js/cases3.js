/* ---------- Cyber Detective v6: three investigations, four steps each ----------
   Every case says WHY it exists and who asked; every step says what to look for. The step list shows progress and status.
   Steps reuse the existing activities (profile check, account comparison, post history, chat analysis, CCTV timeline,
   evidence linking) and add new ones (scam text red flags, URL analysis, sender check, risk type, severity rating, verdict). */
const INV = [
  { id: 'C1', title: 'คดี 01 · บัญชีปลอม', en: 'Fake Account Investigation', who: 'ผู้ร้องเรียน: สมาคมเพื่อนบ้านเมเปิลฮอลโลว์',
    why: 'ลูกบ้านหลายคนถูกบัญชี @quiet_neighbor_77 ทักมาขอดูบ้าน อ้างว่าเป็นเพื่อนบ้านใหม่ สมาคมฯ อยากรู้ว่าบัญชีนี้เป็นของจริงหรือไม่',
    steps: [['M02', 'ตรวจโปรไฟล์', 'ดูวันที่สร้างบัญชี ที่อยู่ อีเมล และผู้ติดตาม ข้อมูลไหนไม่ชอบมาพากล'], ['M06', 'เปรียบเทียบสองบัญชี', 'บัญชีนี้กับ @elmst_gardens ใช้อุปกรณ์และสำนวนเดียวกันไหม'], ['M07', 'ตรวจประวัติการโพสต์', 'หาโพสต์ที่อ้างข้อมูลขัดแย้งกันเอง'], ['V1', 'สรุปผล', 'จากหลักฐานทั้งหมด บัญชีนี้คืออะไร']] },
  { id: 'C2', title: 'คดี 02 · หลอกลวงออนไลน์', en: 'Online Scam Investigation', who: 'ผู้ร้องเรียน: คุณมาร์จ (บ้านเลขที่ 1402)',
    why: 'คุณมาร์จได้รับข้อความให้ "ยืนยันพัสดุ" และเกือบกรอกเลขบัตรเครดิต หัวหน้าขอให้ตรวจว่าเป็นการหลอกลวงแบบไหน เพื่อเตือนลูกบ้านคนอื่น',
    steps: [['S1', 'อ่านข้อความที่ได้รับ', 'เลือกประโยคที่เป็นสัญญาณหลอกลวงให้ครบ 3 จุด'], ['S2', 'วิเคราะห์ URL', 'ลิงก์ไหนไม่ใช่เว็บไซต์ของไปรษณีย์จริง'], ['S3', 'ตรวจข้อมูลผู้ส่ง', 'เลือกข้อมูลผู้ส่งที่ผิดปกติให้ครบ'], ['S4', 'ประเมินความเสี่ยงและส่งรายงาน', 'เลือกประเภทความเสี่ยงที่ตรงที่สุด']] },
  { id: 'C3', title: 'คดี 03 · การคุกคามทางออนไลน์', en: 'Online Harassment', who: 'ผู้ร้องเรียน: ริชาร์ด โอคาฟอร์ (เจ้าของบ้านหลังนี้)',
    why: 'ริชาร์ดได้รับข้อความแปลก ๆ และมีคนโพสต์รูปบ้านเขาตอนกลางคืน เขาขอให้รวบรวมหลักฐานว่าใครเป็นคนทำ ก่อนแจ้งตำรวจ',
    steps: [['M03', 'อ่านแชตที่กู้คืนได้', 'เลือกข้อความที่แสดงพฤติกรรมคุกคามให้ครบ 3 ข้อความ'], ['M05', 'ตรวจประวัติการติดต่อ', 'เทียบเวลาโพสต์กับภาพกล้องวงจรปิด'], ['H3', 'จัดระดับความรุนแรง', 'ให้ระดับความรุนแรงกับข้อความแต่ละข้อ'], ['M04', 'สรุปหลักฐานและส่งรายงาน', 'จับคู่หลักฐานกับข้อสรุป แล้วส่งให้ผู้ว่าจ้าง']] }];
const invOf = sid => INV.find(c => c.steps.some(s => s[0] === sid));
const invOpen = i => i === 0 || !!S.done[INV[i - 1].id];
const invProg = c => c.steps.filter(s => S.done[s[0]]).length;
function casesDone() { return INV.filter(c => S.done[c.id]).length }
function stepsDone() { return INV.reduce((a, c) => a + invProg(c), 0) }
/* called from caseDone(): move to the next step of the same investigation, or close the investigation */
function invAdvance(id) { const c = invOf(id); if (!c) return; const nx = c.steps.find(s => !S.done[s[0]]);
  if (nx) { D.cs = nx[0]; D.inv = c.id; toast('ขั้นตอนเสร็จแล้ว · ต่อไป: ' + nx[1]) } else { S.done[c.id] = fmt(); D.cs = null; D.inv = null; tone(660, .12, 'triangle', .08); tone(990, .2, 'triangle', .08, .14); toast('ปิด' + c.title + ' เรียบร้อย'); if (window.onInvDone) onInvDone(c.id) } D.dirty = 1 }
/* ---------- the case list ---------- */
function invList(g, X, Y, W, H, L, TOP, RW) { g.fillStyle = '#111'; g.font = FB; g.fillText('งานคืนนี้ · ทำทีละคดี (คดีถัดไปจะเปิดเมื่อปิดคดีก่อนหน้า)', L, TOP);
  INV.forEach((c, i) => { const y = TOP + 14 + i * 142, open = invOpen(i), done = S.done[c.id], n = invProg(c), cur = open && !done;
    g.fillStyle = done ? '#e2f0dc' : cur ? '#fffbe8' : '#e4e4e4'; g.fillRect(L, y, RW, 130); g.strokeStyle = done ? '#4a8a3a' : cur ? '#c8a020' : '#aaa'; g.lineWidth = cur ? 2 : 1; g.strokeRect(L + .5, y + .5, RW - 1, 129); g.lineWidth = 1;
    g.fillStyle = open ? '#111' : '#888'; g.font = 'bold 18px ' + TF; g.fillText(c.title, L + 14, y + 26); g.font = '12px ' + TF; g.fillStyle = '#777'; g.fillText(c.en + '  ·  ' + c.who, L + 14, y + 44);
    g.fillStyle = open ? '#333' : '#999'; wrap(c.why, L + 14, y + 66, RW - 200, 19, FS);
    g.font = FB; g.fillStyle = done ? '#2a6a2a' : cur ? '#8a6a00' : '#888'; g.fillText(done ? '✓ ปิดคดีแล้ว' : cur ? 'กำลังดำเนินการ' : '🔒 ยังไม่เปิด', L + RW - 170, y + 26);
    for (let k = 0; k < 4; k++) { g.fillStyle = k < n ? '#3a8a3a' : '#c8c8c8'; g.fillRect(L + RW - 170 + k * 40, y + 44, 34, 8) } g.fillStyle = '#555'; g.font = '12px ' + TF; g.fillText('ขั้นตอน ' + n + '/4', L + RW - 170, y + 70);
    if (cur) btn(L + RW - 170, y + 86, 150, 32, n ? 'ทำต่อ >' : 'เริ่มคดี >', () => { D.inv = c.id; D.cs = c.steps.find(s => !S.done[s[0]])[0] }, 0) }) }
/* header + stepper inside a case */
function invHeader(g, X, Y, W, L, TOP, RW) { const c = INV.find(c => c.id === D.inv) || invOf(D.cs); if (!c) return TOP; const si = c.steps.findIndex(s => s[0] === D.cs), st = c.steps[si];
  g.fillStyle = '#1a3a9a'; g.font = FB; g.fillText(c.title, L, TOP - 6); btn(X + W - 130, Y + 36, 110, 28, '< รายการคดี', () => { D.cs = null; D.inv = null }); { const hs = HINTS[D.cs] || []; if (hs.length) btn(X + W - 232, Y + 36, 94, 28, 'คำใบ้ ?', () => { D.hintN = (D.hintN || 0) % hs.length; toast('คำใบ้: ' + hs[D.hintN++]) }) }
  c.steps.forEach((s, k) => { const x = L + k * (RW / 4), w = RW / 4 - 6, dn = S.done[s[0]], on = k === si; g.fillStyle = dn ? '#d6ead0' : on ? '#ffe9a0' : '#ececec'; g.fillRect(x, TOP + 2, w, 26); g.fillStyle = dn ? '#2a6a2a' : on ? '#5a4200' : '#888'; g.font = '12px ' + TF; g.fillText((dn ? '✓ ' : (k + 1) + '. ') + s[1], x + 6, TOP + 20) });
  g.fillStyle = '#333'; g.font = FS; g.fillText('ขั้นที่ ' + (si + 1) + '/4 · ' + st[2], L, TOP + 48); return TOP + 30 } // the step activity draws from (TOP + 30)
/* ---------- generic step activities ---------- */
function pickStep(g, cs, items, L, y0, RW, H, Y, label, id, rowH = 36) { cs.sel = cs.sel || {};
  items.forEach((it, i) => { const y = y0 + i * rowH, sel = cs.sel[i]; g.fillStyle = sel ? '#ffe08a' : i % 2 ? '#f6f6f6' : '#fff'; g.fillRect(L, y, RW, rowH - 4); g.strokeStyle = sel ? '#c80' : '#ccc'; g.strokeRect(L + .5, y + .5, RW - 1, rowH - 5);
    g.fillStyle = '#111'; g.font = FS; g.fillText((sel ? '☑  ' : '☐  ') + it[0], L + 10, y + rowH / 2 + 3); if (it[3]) { g.fillStyle = '#555'; g.fillText(it[3], L + 300, y + rowH / 2 + 3) } HR.push([L, y, RW, rowH - 4, () => { cs.sel[i] = !cs.sel[i]; tone(700, .03, 'square', .04) }, id + ':' + i]) });
  btn(L, Y + H - 44, 220, 30, label, () => { const need = items.filter(x => x[1]).length, good = items.filter((x, i) => x[1] && cs.sel[i]).length, bad = items.filter((x, i) => !x[1] && cs.sel[i]).length;
    if (good === need && !bad) caseDone(id); else toast(bad ? `มี ${bad} ข้อที่ไม่ใช่สัญญาณผิดปกติ ลองดูใหม่` : `เจอแล้ว ${good}/${need} จุด ยังขาดอยู่`) }) }
function choiceStep(g, cs, opts, correct, L, y0, RW, H, Y, label, id, hint) { opts.forEach((o, i) => { const y = y0 + i * 46, sel = cs.ans === i; g.fillStyle = sel ? '#dfe8ff' : '#fff'; g.fillRect(L, y, RW, 40); g.strokeStyle = sel ? '#2a5ab0' : '#bbb'; g.lineWidth = sel ? 2 : 1; g.strokeRect(L + .5, y + .5, RW - 1, 39); g.lineWidth = 1;
    g.fillStyle = '#111'; g.font = FS; g.fillText((sel ? '◉  ' : '○  ') + o, L + 12, y + 25); HR.push([L, y, RW, 40, () => { cs.ans = i; tone(700, .03, 'square', .04) }, id + ':' + i]) });
  btn(L, Y + H - 44, 220, 30, label, () => { if (cs.ans === correct) caseDone(id); else toast(cs.ans === undefined || cs.ans === null ? 'เลือกคำตอบก่อน' : hint) }) }
/* ---------- step data ---------- */
const SCAM_SMS = ['[US-Post] พัสดุของคุณ #US88120 ไม่สามารถจัดส่งได้', 'เนื่องจากที่อยู่ไม่ครบถ้วน', 'กรุณายืนยันภายใน 2 ชั่วโมง', 'มิฉะนั้นพัสดุจะถูกตีกลับและทำลาย', 'ชำระค่าจัดส่งใหม่เพียง $1.99', 'ผ่านลิงก์: usps.com.tracking-help.info/pay', 'ขอบคุณที่ใช้บริการ'];
const SCAM_PICK = [['"กรุณายืนยันภายใน 2 ชั่วโมง"', 1, 0, 'เร่งให้รีบตัดสินใจ'], ['"เนื่องจากที่อยู่ไม่ครบถ้วน"', 0, 0, ''], ['"มิฉะนั้นพัสดุจะถูกตีกลับและทำลาย"', 1, 0, 'ขู่ให้กลัวเสียของ'], ['"ชำระค่าจัดส่งใหม่เพียง $1.99"', 1, 0, 'ขอเงินจำนวนน้อยเพื่อเอาเลขบัตร'], ['"ขอบคุณที่ใช้บริการ"', 0, 0, ''], ['"พัสดุของคุณ #US88120"', 0, 0, '']].map(x => [x[0], x[1], 0, '']);
const URLS = [['https://www.usps.com/manage/', 'โดเมนจริง: usps.com'], ['https://tools.usps.com/go/TrackConfirmAction', 'โดเมนจริง: usps.com (โดเมนย่อย tools)'], ['https://usps.com.tracking-help.info/pay', 'โดเมนจริงคือ tracking-help.info · คำว่า usps.com เป็นแค่ส่วนหน้า'], ['https://www.usps.com/track', 'โดเมนจริง: usps.com']];
const SENDER = [['ชื่อผู้ส่งที่แสดง', 0, 0, 'US-Post'], ['เบอร์ที่ส่งมา', 1, 0, '+63 917 555 0142 (ฟิลิปปินส์)'], ['ลงทะเบียนเบอร์', 1, 0, '2 วันก่อน'], ['คำขึ้นต้นข้อความ', 1, 0, '"เรียน ลูกค้า" (ไม่ระบุชื่อ)'], ['เวลาส่ง', 0, 0, '23:12 น.'], ['ภาษาที่ใช้', 0, 0, 'ไทย']];
const RISK = ['ฟิชชิง: หลอกให้กดลิงก์ปลอมเพื่อขโมยข้อมูลบัตร', 'หลอกให้ลงทุน', 'หลอกขายสินค้าออนไลน์', 'สแปมโฆษณาทั่วไป ไม่มีความเสี่ยง'];
const VERDICT = ['บัญชีปลอม: เป็นคนเดียวกับ @elmst_gardens ปลอมตัวเป็นเพื่อนบ้านเพื่อสอดแนม', 'บัญชีจริงของเพื่อนบ้านใหม่', 'หลักฐานยังไม่พอ ปิดคดีไม่ได้'];
const SEV = [['"สวัสดีครับ ผมเพิ่งย้ายมาอยู่แถวนี้"', 0], ['"ทำไมไม่ตอบข้อความผมเลย ผมเห็นว่าอ่านแล้ว"', 1], ['"บ้านคุณสวยนะ อยากเข้าไปดูข้างในจัง"', 2], ['"ไฟชั้นบนยังเปิดอยู่ ผมเห็นคุณนะ"', 2]], SEVL = ['ต่ำ', 'กลาง', 'สูง'];
function smsPic() { return pic('sms', 300, 330, (g, w, h) => { g.fillStyle = '#f2f2f6'; g.fillRect(0, 0, w, h); g.fillStyle = '#ddd'; g.fillRect(0, 0, w, 44); g.fillStyle = '#111'; g.font = 'bold 15px ' + TF; g.fillText('US-Post', 12, 28); g.fillStyle = '#777'; g.font = '11px ' + TF; g.fillText('+63 917 555 0142', 140, 28);
  g.fillStyle = '#e2e2e8'; g.fillRect(12, 58, 270, 230); g.fillStyle = '#111'; let y = 82; for (const l of SCAM_SMS) { g.font = '14px ' + TF; g.fillText(l, 22, y); y += 28 } g.fillStyle = '#999'; g.font = '11px ' + TF; g.fillText('เมื่อวาน 23:12', 12, 308) }) }
/* ---------- draw a new-type step ---------- */
function invStep(g, X, Y, W, H, L, TOP, RW) { const id = D.cs; S.cs[id] = S.cs[id] || {}; const cs = S.cs[id], y0 = TOP + 66;
  if (id === 'S1') { g.drawImage(smsPic(), L, y0, 270, 297); pickStep(g, cs, SCAM_PICK, L + 290, y0, RW - 290, H, Y, 'ส่งผลการวิเคราะห์', id, 40) }
  if (id === 'S2') { g.fillStyle = '#333'; g.font = FS; g.fillText('อ่านโดเมนจากขวาไปซ้ายก่อนเครื่องหมาย / ตัวแรก: ส่วนที่อยู่ติดกับ .com/.info คือเจ้าของเว็บจริง', L, y0 - 2);
    choiceStep(g, cs, URLS.map(u => u[0]), 2, L, y0 + 12, RW, H, Y, 'ยืนยัน: นี่คือลิงก์ปลอม', id, 'ลิงก์นี้เป็นของ usps.com จริง ลองดูโดเมนหลักอีกครั้ง'); if (cs.ans !== undefined && cs.ans !== null) { g.fillStyle = '#7a1a1a'; g.font = FS; g.fillText('↳ ' + URLS[cs.ans][1], L, y0 + 12 + 4 * 46 + 20) } }
  if (id === 'S3') { g.drawImage(pic('snd', 80, 80, (c, w) => { c.fillStyle = '#5a5a5a'; c.fillRect(0, 0, w, w); c.fillStyle = '#ddd'; c.font = 'bold 34px sans-serif'; c.fillText('?', 28, 52) }), L, y0, 64, 64); g.fillStyle = '#111'; g.font = FB; g.fillText('ข้อมูลผู้ส่งข้อความถึงคุณมาร์จ', L + 80, y0 + 28); g.font = FS; g.fillStyle = '#555'; g.fillText('เลือกข้อมูลที่ผิดปกติ (ไปรษณีย์จริงไม่ส่งแบบนี้)', L + 80, y0 + 50);
    pickStep(g, cs, SENDER, L, y0 + 78, RW, H, Y, 'ส่งผลการตรวจ', id, 40) }
  if (id === 'S4') { choiceStep(g, cs, RISK, 0, L, y0, RW, H, Y, 'ส่งรายงานให้หัวหน้า', id, 'ลองนึกถึงสิ่งที่ข้อความต้องการจากเหยื่อ: ลิงก์ปลอม + ค่าธรรมเนียมเล็กน้อย'); g.fillStyle = '#555'; g.font = FS; wrap('สรุปที่จะส่ง: ข้อความเร่งรีบ + ขู่ + ขอเงินเล็กน้อย · ลิงก์ปลอม tracking-help.info · เบอร์ต่างประเทศอายุ 2 วัน', L, y0 + 4 * 46 + 24, RW, 20, FS) }
  if (id === 'V1') { g.fillStyle = '#333'; g.font = FS; wrap('หลักฐานที่คุณพบ: โปรไฟล์อ้างว่าอยู่ถนนเอล์มแต่อีเมลกู้คืนตรงกับอีกบัญชี · ใช้เครื่อง LAPTOP-7F2 เดียวกัน · โพสต์อ้างว่าอยู่พอร์ตแลนด์แต่ถ่ายรูปถนนนี้คืนนี้', L, y0, RW, 20, FS);
    choiceStep(g, cs, VERDICT, 0, L, y0 + 50, RW, H, Y, 'ยืนยันข้อสรุป', id, 'ทบทวนหลักฐานอีกครั้ง: อุปกรณ์เดียวกัน + ข้อมูลขัดแย้ง') }
  if (id === 'H3') { cs.r = cs.r || {}; SEV.forEach(([t], i) => { const y = y0 + i * 62; g.fillStyle = '#e2e2e8'; g.fillRect(L, y, RW - 300, 50); g.fillStyle = '#111'; g.font = FS; wrap(t, L + 12, y + 30, RW - 320, 18, FS);
      SEVL.forEach((lv, k) => { const x = L + RW - 290 + k * 96, on = cs.r[i] === k; g.fillStyle = on ? ['#5a9a4a', '#d0a020', '#c03a2a'][k] : '#ddd'; g.fillRect(x, y + 8, 88, 34); g.fillStyle = on ? '#fff' : '#333'; g.font = FB; g.fillText(lv, x + 30, y + 31); HR.push([x, y + 8, 88, 34, () => { cs.r[i] = k; tone(600 + k * 150, .04, 'square', .04) }, 'sev:' + i + ':' + k]) }) });
    btn(L, Y + H - 44, 220, 30, 'บันทึกระดับความรุนแรง', () => { const ok = SEV.filter(([, lv], i) => cs.r[i] === lv).length; if (ok === SEV.length) caseDone('H3'); else toast(`ถูก ${ok}/${SEV.length} ข้อ · ข้อความที่บอกว่ากำลังเฝ้ามองหรืออยากเข้าบ้านคือระดับสูง`) }) } }

/* hints point at where to look, never at the answer */
const HINTS = { M02: ['ดูวันที่สมัครเทียบกับเวลาที่โพสต์รูปบ้าน', 'บัญชีที่เฝ้าดูใครสักคนมักติดตามบัญชีของคนนั้น', 'อีเมลกู้คืนมักเผยชื่อจริงของเจ้าของ'], M06: ['เทียบชื่อผู้ใช้ วันสมัคร และอีเมลของสองบัญชี'], M07: ['จับคู่โพสต์ที่ถ่ายจากมุมเดียวกันหรือเวลาใกล้กัน'], V1: ['รวมสิ่งที่พบใน 3 ขั้นก่อนหน้าแล้วสรุป'],
  S1: ['มองหาความเร่งรีบ ลิงก์แปลก และการขอข้อมูลส่วนตัว'], S2: ['อ่านชื่อโดเมนทีละตัวอักษร'], S3: ['ชื่อผู้ส่งกับโดเมนอีเมลตรงกันไหม'], S4: ['การขอรหัส OTP คือความเสี่ยงประเภทไหน'],
  M03: ['หาข้อความที่บอกเวลา สถานที่ หรือแผนการ'], M05: ['ดูเวลาในโพสต์ แล้วหาภาพกล้องที่เวลาใกล้กันที่สุด'], H3: ['ขู่หรือบอกที่อยู่ = รุนแรงสูง · คำหยาบทั่วไป = ต่ำ'], M04: ['เชื่อมหลักฐานที่ชี้ไปที่คนเดียวกัน: ชื่อ อีเมล เวลา'] };
