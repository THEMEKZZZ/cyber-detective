/* ---------- computer room: desk, two large CRTs (main = CyberOS / Cyber Detective, second = CCTV) ---------- */
const DX = 1.6, DZ = 6.25, DY = FY[1], MZ = 6.3, SW = .48, SH = .36, MON = { main: { x: 1.27, ry: .1 }, cctv: { x: 1.93, ry: -.1 } };
let scMain, scCam, OV, og, OT, DC, dg, DT, RT, LAPRT, deskLed;
const TF = '"Chakra Petch","Sarabun","Loma","Tahoma","Leelawadee UI",sans-serif';
/* ---------- story data (v3 content kept, localised; new case files added) ---------- */
const CLUES = {
  C1: ['โดเมนปลอม', 'ha1den-sec.com ใช้เลข "1" แทนตัว "l" ไม่ใช่โดเมนของบริษัท Halden'],
  C2: ['ส่งมาจากในบ้าน', 'อีเมลฟิชชิงใบแจ้งหนี้ถูกส่งจาก 10.0.0.77 ซึ่งเป็นที่อยู่ในเครือข่ายบ้านของคุณเอง'],
  C3: ['มีคนแอบดูกล้อง', 'อุปกรณ์ LAPTOP-7F2 ถูกจับคู่กับกล้องในบ้านเมื่อเวลา 22:41'],
  C4: ['watcher.log', 'มีเซสชันจากระยะไกลจาก 10.0.0.77 ส่งภาพกล้องทั้งหมดออกไปข้างนอก'],
  C5: ['ช่อง LAN-4', 'TRACE: 10.0.0.77 เสียบสายอยู่ที่ช่อง LAN-4 คือปลั๊กในห้องนอนหลังบ้าน'],
  C6: ['อีเมลจากตัวเอง', 'มีคนส่งข้อความถึงคุณโดยปลอมเป็นที่อยู่อีเมลของคุณ ผ่าน 10.0.0.77'],
  C7: ['กล้องซ่อน', 'กล้องจิ๋วเหนือชั้นวางในห้องคอมพิวเตอร์ หันตรงมาที่โต๊ะของคุณ'],
  C8: ['เงาในกล้อง', 'กล้องจับภาพคนยืนอยู่ในบริเวณบ้าน ทั้งที่ไม่ควรมีใครอยู่'],
  M1: ['ภาพถ่ายจากหน้าบ้านคุณ', 'ภาพที่อ้างว่าถ่ายบนถนนเอล์ม มีป้ายถนนเมเปิลฮอลโลว์ และตู้ไปรษณีย์เลข 1407 ซึ่งเป็นบ้านคุณ'],
  M2: ['บัญชีของผู้เช่าคนก่อน', 'สมัครวันเดียวกับที่ผู้เช่าคนก่อนย้ายออก, อีเมลกู้คืน d.v****, และติดตามบัญชีงานของคุณ'],
  M3: ['แชตลับ', 'เขายังได้ภาพจากกล้องห้องหลัง รู้ว่าคุณทำงานกะดึก และยังมีกุญแจประตูหน้า'],
  M4: ['เชื่อมโยงหลักฐาน', 'ทุกหลักฐานชี้ไปที่ Daniel Voss ผู้เช่าคนก่อนของบ้านหลังนี้'],
  M6: ['สองบัญชี คนเดียวกัน', '@elmst_gardens กับ @quiet_neighbor_77 ล็อกอินจากเครื่อง LAPTOP-7F2 เดียวกัน'], M7: ['เขาโกหกว่าอยู่นอกเมือง', 'โพสต์ภาพบ้าน 1407 และรถของคุณคืนนี้ ทั้งที่อ้างว่าอยู่พอร์ตแลนด์'], M8: ['รายงานถึงหัวหน้าแล้ว', 'มาร์ธาได้รับรายงานบัญชีที่ติดตามบ้าน 1407'],
  M5: ['เขาอยู่หน้าบ้าน', 'โพสต์ล่าสุดตรงกับภาพ CAM 1 เวลา 00:03 มีคนยืนใต้เสาไฟฝั่งตรงข้ามถนน'],
  C9: ['ไฟล์จากแล็ปท็อป', 'สำเนาไฟล์จาก LAPTOP-7F2: ภาพแอบถ่ายนับร้อยภาพของบ้านหลังนี้'],
};
const MAILS = [
  { from: 'Marta Ebert <m.ebert@halden-sec.com>', subj: 'ยินดีต้อนรับสู่กะดึก (อ่านก่อนเริ่มงาน)', time: '21:45', body: 'ยินดีต้อนรับนะ งานของคุณคือ Cyber Detective: ตรวจสอบหลักฐานดิจิทัลให้ลูกค้า คืนนี้มีคดี MH-0412 เรื่องคนแอบโพสต์ภาพบ้านในย่านเมเปิลฮอลโลว์ เปิดแอป "คดี" แล้วทำตามลำดับ M01 ถึง M05 อีเมลแปลก ๆ ให้ตรวจหัวอีเมลก่อนตัดสินใจเสมอ แล้วจอข้าง ๆ คือกล้องวงจรปิดของบ้าน ลองดูให้ครบทุกตัวนะ', hdr: ['Return-Path: <m.ebert@halden-sec.com>', 'Received: from mail.halden-sec.com (52.18.4.20)', 'SPF: PASS   DKIM: PASS'], v: 'safe' },
  { from: 'Halden IT <it-support@ha1den-sec.com>', subj: 'ด่วน: ใบแจ้งหนี้ค้างชำระ #2291', time: '21:52', att: 'invoice_2291.pdf.exe', body: 'บัญชีของคุณจะถูกระงับภายใน 2 ชั่วโมง กรุณาเปิดไฟล์แนบและยืนยันการชำระเงินที่ http://ha1den-sec.com/pay เพื่อไม่ให้บริการหยุดชะงัก', hdr: ['Return-Path: <bounce@ha1den-sec.com>', 'Received: from LAPTOP-7F2 (10.0.0.77)', '   by mail.ha1den-sec.com  21:52', 'SPF: FAIL   DKIM: none', 'X-Mailer: PhishKit 3.1'], v: 'phish', clues: ['C1', 'C2'] },
  { from: 'ParcelPost <delivery@parcelpost-track.co>', subj: 'ไม่สามารถจัดส่งพัสดุของคุณได้', time: '22:05', body: 'เราพยายามจัดส่งพัสดุวันนี้แต่ไม่สำเร็จ ยืนยันที่อยู่และชำระค่าจัดส่งใหม่ 1.99 ดอลลาร์ได้ที่ http://parcelpost-track.co.verify-id.ru/x7', hdr: ['Return-Path: <x@verify-id.ru>', 'Received: from unknown (185.220.101.4)', 'Reply-To: <claims@verify-id.ru>', 'SPF: FAIL'], v: 'phish' },
  { from: 'R. Okafor (เจ้าของบ้าน) <r.okafor@mailbox.net>', subj: 'เรื่องห้องนอนหลังบ้าน', time: '22:11', body: 'ห้องหลังว่างตั้งแต่ผู้เช่าคนก่อน (คุณวอสส์) ย้ายออกเมื่อ 3 มีนาคม ห้องนั้นล็อกไว้ ประตูไม้โอ๊คหนาที่สุดในบ้าน มีกลอนด้านใน ถ้ามีเหตุอะไรให้เข้าไปอยู่ในนั้น กุญแจสำรองผมเขียนโน้ตแปะไว้ที่ตู้เย็นแล้ว', hdr: ['Return-Path: <r.okafor@mailbox.net>', 'Received: from mx.mailbox.net (91.198.174.2)', 'SPF: PASS'], v: 'safe' },
  { from: 'CamLink Cloud <no-reply@camlink-cloud.net>', subj: 'มีอุปกรณ์ใหม่เชื่อมต่อกับกล้องของคุณ', time: '22:41', body: 'มีผู้ชมรายใหม่จับคู่กับระบบกล้องในบ้านของคุณ: LAPTOP-7F2 (เครือข่ายภายใน) หากไม่ใช่คุณ ให้ลบอุปกรณ์นี้ออกจากบัญชี CamLink', hdr: ['Return-Path: <no-reply@camlink-cloud.net>', 'Received: from smtp.camlink-cloud.net (34.90.12.7)', 'SPF: PASS   DKIM: PASS'], v: 'safe', clues: ['C3'] },
  { from: 'คุณ <you@halden-sec.com>', subj: '(ไม่มีหัวเรื่อง)', time: '--:--', body: 'ชอบดูคุณทำงานนะ คุณไม่เคยหันหลังมาดูเลย ลองหันมาสิ', hdr: ['Return-Path: <you@halden-sec.com>', 'Received: from LAPTOP-7F2 (10.0.0.77)', 'SPF: FAIL (ปลอมผู้ส่ง)'], v: 'phish', clues: ['C6'], late: 'sus' },
  { from: 'ไม่ทราบชื่อ <x7f2@0x66-relay.cc>', subj: 'คุณลืมปิดม่านนะ', time: '--:--', body: 'ถ่ายเมื่อกี้นี้เอง จากฝั่งตรงข้ามถนน ห้องชั้นบนที่ไฟยังเปิดอยู่ คือห้องที่คุณนั่งอยู่ตอนนี้ใช่ไหม?', att: 'IMG_0001.jpg', img: 'mail', hdr: ['Return-Path: <x7f2@0x66-relay.cc>', 'Received: from LAPTOP-7F2 (10.0.0.77) via 203.0.113.66', 'X-Device: phone camera, 23 m from 1407 Maple Hollow'], v: 'phish', late: 'sus' },
  { from: '(ไม่มีชื่อผู้ส่ง)', subj: '(ไม่มีหัวเรื่อง)', time: '--:--', body: 'ประตูหลังบ้านล็อกหรือยัง?\n\nไม่ต้องตอบก็ได้ เดี๋ยวไปดูเอง', hdr: ['Return-Path: <>', 'Received: from LAPTOP-7F2 (10.0.0.77)', 'X-Mailer: none'], v: 'phish', late: 'anon' },
];
const DOCS = [
  ['notes.txt', 'บันทึกกะ: สแปมเริ่มส่งเข้ามาตั้งแต่ 21:40 การแจ้งเตือนกล้องเกิดพร้อมกับอีเมลใหม่ หลังเที่ยงคืนให้ดูกล้องโถงชั้นบน เจ้าของบ้านยืนยันว่าห้องหลังว่าง'],
  ['invoice_2291.pdf.exe', 'ไฟล์โปรแกรม (.exe) นามสกุลซ้อน (.pdf.exe) ห้ามเปิด ควรกักกันไฟล์นี้', 'exe'],
  ['watcher.log', '[22:41] remote session opened from 10.0.0.77\n[22:41] CamLink stream x5 -> 203.0.113.66:443\n[22:43] FRONT camera mirrored to external host\n[23:02] stream x7 -> 203.0.113.66 (CAM 7 ???)\nมีคนกำลังดูบ้านหลังนี้อยู่', 'log'],
  ['router_leases.csv', 'IP          HOST           LEASE\n10.0.0.1    GATEWAY        static\n10.0.0.12   WORKSTATION    you\n10.0.0.31   CAMLINK-HUB    static\n10.0.0.77   LAPTOP-7F2     41 days'],
  ['case_MH-0412.txt', 'คดี MH-0412 (ลูกค้า: สมาคมเพื่อนบ้านเมเปิลฮอลโลว์)\nบัญชี @quiet_neighbor_77 โพสต์ภาพบ้านในย่านนี้ตอนกลางคืนมาหลายสัปดาห์ ลูกค้าต้องการรู้ว่าเป็นใคร และภาพถูกถ่ายจากที่ไหน'],
];
DOCS.push(['CAM1_000312.jpg', 'ภาพหน้าจอจากกล้องหน้าบ้าน (CAM 1) ใครเป็นคนบันทึกไว้? ที่มุมขวา ใต้เสาไฟฝั่งตรงข้ามถนน มีคนยืนหันหน้ามาทางบ้าน', 'img', 'up1', 'up'], ['IMG_2231.jpg', 'ภาพถ่ายจากข้างบ้าน ส่องเข้ามาทางหน้าต่างห้องครัว... เวลาในภาพตรงกับตอนที่คุณนั่งกินพิซซ่า', 'img', 'up2', 'up']);
const TRACE = {
  '10.0.0.77': ['Reply from 10.0.0.77: time=1ms', 'Hostname ...... LAPTOP-7F2', 'MAC ........... 3C:52:82:7F:F2:01', 'Switch port ... LAN-4', '  (ปลั๊กผนังห้องนอนหลังบ้าน ชั้นบน)', 'Uplink ........ 203.0.113.66:443 (5 streams)', '>> อุปกรณ์นี้อยู่ในบ้านหลังนี้'],
  '10.0.0.31': ['Reply from 10.0.0.31: time=2ms', 'Hostname ...... CAMLINK-HUB', 'Cameras ....... 11 registered', '  CAM 7 "ห้องคอมพิวเตอร์" (คุณไม่ได้ติดตั้ง)', '>> ปลดล็อก CAM 7 บนจอกล้องวงจรปิดแล้ว'],
  '185.220.101.4': ['Reply from 185.220.101.4: time=88ms', 'Tor exit relay, Frankfurt.', '>> ทางตัน สแปมทั่วไป'], '52.18.4.20': ['mail.halden-sec.com', 'เซิร์ฟเวอร์อีเมลของบริษัท (ปกติ)'],
  '203.0.113.66': ['No reverse DNS.', 'รับภาพจากกล้องทุกตัวในบ้านหลังนี้', 'Session owner: LAPTOP-7F2'], '10.0.0.12': ['WORKSTATION', 'นั่นคือเครื่องของคุณเอง'],
};
const CAMS = [ // CAM n = index + 1. CAM 7 (the hidden one in the computer room) only appears after the trace/clue, so the list visibly skips a number until then
  ['สนามหน้าบ้าน', [.2, 2.6, 10.05], [6, .6, 17]], ['ห้องนั่งเล่น', [.3, 2.5, 9.45], [3.5, .4, 4.6]], ['ห้องครัว', [12.7, 2.5, 9.45], [9.2, .6, 4.4]], ['โถงชั้นบน', [.3, DY + 2.45, 4.94], [11, DY + .9, 4.94]],
  ['ข้างบ้าน', [HW + .35, 2.7, 9.95], [HW + 1.2, .4, .3]], ['ประตูหน้าบ้าน', [4.75, 2.5, 9.98], [3.5, .2, 12.6]], ['ห้องคอมพิวเตอร์', [6.65, DY + 2.5, 9.5], [1.6, DY + .9, 6.4]],
  ['ทางรถเข้า', [HW - .15, 2.8, 10.0], [10.6, .3, 16]], ['สนามหลังบ้าน', [HW - .3, 2.7, -.3], [5, .3, -6]], ['โถงชั้นล่าง', [6.75, 2.5, 4.4], [6.0, .5, .9]], ['ห้องนอนใหญ่', [5.35, DY + 2.45, 4.0], [1.5, DY + .5, 1.2]], ['บันได', [6.2, DY + 2.45, .3], [6.2, .9, 4.8]]];
const camList = () => [0, 1, 2, 3, 4, 5].concat(S.cam7 ? [6] : [], [7, 8, 9, 10, 11]);
const pcOn = () => S.power || S.ups;
const OUTDOOR_CAM = { 0: 'front', 4: 'side', 7: 'drive', 8: 'back' }; // every exterior camera with a lurk spot has its own spotlight
const CC = CAMS.map(a => { const c = new T.PerspectiveCamera(80, 4 / 3, .08, 60); c.position.set(...a[1]); c.lookAt(...a[2]); c.layers.enable(1); c.layers.enable(2); c.far = [0, 4, 5, 7, 8].includes(CAMS.indexOf(a)) ? 45 : 16; c.updateProjectionMatrix(); return c });
const D = { app: null, mail: null, hdr: false, doc: null, inp: null, q: '', ip: '', out: [], outN: 0, rep: 0, cx: 400, cy: 300, over: 0, cs: null, sub: null };
/* ---------- case files: procedural evidence images ---------- */
const IMG = {}; function pic(key, w, h, fn) { if (!IMG[key]) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); IMG[key] = c } return IMG[key] }
function duskScene(g, w, h, o = {}) { const gd = g.createLinearGradient(0, 0, 0, h); gd.addColorStop(0, '#231c38'); gd.addColorStop(.5, '#6a3a4a'); gd.addColorStop(.62, '#a0584a'); gd.addColorStop(.63, '#201a20'); gd.addColorStop(1, '#141214'); g.fillStyle = gd; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(230,150,110,${rr(.05, .2)})`; g.beginPath(); g.ellipse(rr(0, w), rr(10, h * .45), rr(10, 30), rr(2, 5), 0, 0, 7); g.fill() }
  const hz = h * .62; (o.houses || [[.12, .3], [.55, .35]]).forEach(([x, s]) => { const hx = x * w, hw = s * w, hh = hw * .45; g.fillStyle = '#c8c4b8'; g.globalAlpha = .55; g.fillRect(hx, hz - hh, hw, hh); g.beginPath(); g.moveTo(hx - 6, hz - hh); g.lineTo(hx + hw / 2, hz - hh - hw * .3); g.lineTo(hx + hw + 6, hz - hh); g.fill(); g.globalAlpha = 1; for (let i = 0; i < 3; i++) { g.fillStyle = Math.random() < .5 ? '#e0a860' : '#2a2a34'; g.fillRect(hx + hw * (.15 + i * .3), hz - hh * .7, hw * .12, hh * .25) } });
  for (let i = 0; i < 3; i++) { const tx = rr(0, w); g.fillStyle = '#0c0e0c'; g.fillRect(tx, hz - h * .35, 4, h * .35); g.beginPath(); g.arc(tx + 2, hz - h * .38, rr(20, 34), 0, 7); g.fill() }
  g.fillStyle = '#5a5450'; g.beginPath(); g.moveTo(w * .35, h); g.lineTo(w * .48, hz); g.lineTo(w * .52, hz); g.lineTo(w * .65, h); g.fill();
  for (let i = 0; i < 2000; i++) { const v = Math.random() * 255 | 0; g.fillStyle = `rgba(${v},${v},${v},.05)`; g.fillRect(rr(0, w), rr(0, h), 1, 1) } }
const CPHOTOS = [
  ['IMG_0388.jpg', 'ทางเดินกับต้นไม้ยามเย็น', (g, w, h) => { duskScene(g, w, h); g.fillStyle = '#2a2a2a'; g.fillRect(w * .8, h * .2, 5, h * .5); g.fillStyle = '#ffb060'; g.fillRect(w * .78, h * .2, 26, 6) }],
  ['IMG_0391.jpg', 'มุมถนนตอนพระอาทิตย์ตก', (g, w, h) => { duskScene(g, w, h, { houses: [[.6, .3]] }); g.fillStyle = '#2a2a2a'; g.fillRect(w * .2, h * .3, 5, h * .4); g.fillStyle = '#1e5a32'; g.fillRect(w * .12, h * .3, 110, 22); g.fillStyle = '#eef'; g.font = 'bold 13px monospace'; g.fillText('MAPLE HOLLOW', w * .12 + 6, h * .3 + 16) }],
  ['IMG_0394.jpg', 'รั้วกับตู้ไปรษณีย์', (g, w, h) => { duskScene(g, w, h, { houses: [[.3, .45]] }); g.fillStyle = '#d8d0c0'; for (let x = 0; x < w * .45; x += 12) g.fillRect(x, h * .62, 7, 45); g.fillRect(0, h * .66, w * .45, 4); g.fillStyle = '#3a2a1c'; g.fillRect(w * .62, h * .55, 6, 70); g.fillStyle = '#1c2a3a'; g.fillRect(w * .58, h * .5, 50, 26); g.fillStyle = '#e8e2d0'; g.fillRect(w * .6, h * .52, 36, 14); g.fillStyle = '#111'; g.font = 'bold 12px monospace'; g.fillText('1407', w * .6 + 3, h * .52 + 12) }],
  ['IMG_0397.jpg', 'หน้าต่างชั้นบนที่ยังเปิดไฟ', (g, w, h) => { duskScene(g, w, h, { houses: [[.25, .5]] }); g.fillStyle = '#ffd890'; g.fillRect(w * .32, h * .28, 22, 18); g.strokeStyle = '#fff'; g.strokeRect(w * .32, h * .28, 22, 18) }],
];
const PHOTO_HOT = { 1: [.1, .25, .45, .42, 'ป้ายถนนเขียนว่า MAPLE HOLLOW ไม่ใช่ถนนเอล์มตามที่อ้าง'], 2: [.55, .45, .78, .66, 'ตู้ไปรษณีย์เลข 1407 คือบ้านที่คุณอยู่ตอนนี้'] };
const PROFILE = [['ชื่อที่แสดง', 'Danny V.', 0], ['สมัครสมาชิก', '3 มีนาคม 2026', 1], ['ตำแหน่ง', 'Elm St.', 0], ['อีเมลกู้คืน', 'd.v****@mailbox.net', 1], ['ผู้ติดตาม', '3 คน', 0], ['กำลังติดตาม', '@halden_nightshift (บัญชีงานของคุณ)', 1], ['คำอธิบาย', 'แค่เพื่อนบ้านที่สังเกตทุกอย่าง', 0], ['โพสต์ล่าสุด', '2 ชั่วโมงก่อน', 0]];
const CHAT = [['k_relay', 'ภาพชุดใหม่มายัง', 0], ['quiet_neighbor_77', 'คืนนี้ส่ง หมอกลงเยอะ ถ่ายยาก', 0], ['k_relay', 'คนที่ย้ายเข้ามาใหม่ล่ะ', 0], ['quiet_neighbor_77', 'กล้องในห้องหลังบ้านยังส่งภาพมาให้ฉันอยู่ เขาไม่รู้ด้วยซ้ำ', 1], ['k_relay', 'lol', 0], ['quiet_neighbor_77', 'ค่าเช่าที่นั่นแพงขึ้นอีกแล้ว ดีที่ฉันออกมาก่อน', 0], ['quiet_neighbor_77', 'เขาทำงานกะดึก เปิดคอมทั้งคืน ไฟชั้นบนไม่เคยดับ', 1], ['k_relay', 'แมวบ้านข้าง ๆ ร้องอีกแล้ว', 0], ['quiet_neighbor_77', 'ฉันยังเก็บกุญแจสำรองประตูหน้าไว้ เจ้าของบ้านไม่เคยเปลี่ยนกุญแจ', 1], ['k_relay', 'เจอกันที่เดิมนะ', 0], ['quiet_neighbor_77', 'ลบแชตนี้ด้วย', 0]];
const LINK_L = ['ตู้ไปรษณีย์ 1407 ในภาพ', 'อีเมลกู้คืน d.v****', 'IP 10.0.0.77 ในหัวอีเมล', 'แชต: "กล้องในห้องหลังบ้าน"'], LINK_R = ['กล้องที่ถูกซ่อนไว้ในบ้าน', 'บ้านที่คุณอาศัยอยู่', 'อุปกรณ์ที่ต่ออยู่ในบ้านนี้', 'Daniel Voss ผู้เช่าคนก่อน (D.V.)'], LINK_OK = [1, 3, 2, 0];
const SNAPS = [['CAM 1 หน้าบ้าน', '23:58', 0], ['CAM 5 ข้างบ้าน', '00:03', 0], ['CAM 1 หน้าบ้าน', '00:03', 1], ['CAM 2 ห้องนั่งเล่น', '00:03', 0], ['CAM 1 หน้าบ้าน', '00:12', 0]];
function snapImg(i) { return pic('snap' + i, 200, 150, (g, w, h) => { g.fillStyle = '#0c1a10'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a9a6a'; if (SNAPS[i][0].includes('หน้าบ้าน')) { g.beginPath(); g.moveTo(0, h * .8); g.lineTo(w, h * .62); g.stroke(); g.fillStyle = '#4a7a4a'; g.fillRect(w * .7, h * .2, 3, h * .45); g.fillStyle = '#cfe8b0'; g.fillRect(w * .67, h * .2, 14, 3); if (SNAPS[i][2]) { g.fillStyle = '#081008'; g.fillRect(w * .695, h * .43, 9, 22); g.beginPath(); g.arc(w * .695 + 4.5, h * .41, 4.5, 0, 7); g.fill() } } else if (SNAPS[i][0].includes('ข้าง')) { g.strokeRect(w * .2, h * .2, w * .25, h * .6); g.beginPath(); g.moveTo(w * .5, h); g.lineTo(w * .6, 0); g.stroke() } else { g.strokeRect(w * .1, h * .3, w * .5, h * .35); g.strokeRect(w * .7, h * .2, w * .15, h * .5) }
  for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(160,255,160,${rr(0, .12)})`; g.fillRect(rr(0, w), rr(0, h), 1, 1) } g.fillStyle = '#cfc'; g.font = '10px monospace'; g.fillText(SNAPS[i][1], 6, h - 6) }) }
const postImg = () => pic('post', 300, 190, (g, w, h) => { duskScene(g, w, h, { houses: [[.3, .45]] }); g.fillStyle = 'rgba(10,10,20,.55)'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd890'; g.fillRect(w * .4, h * .3, 18, 14); g.fillStyle = '#ffb060'; g.globalAlpha = .4; g.beginPath(); g.moveTo(w * .95, 0); g.lineTo(w * .7, h); g.lineTo(w, h); g.fill(); g.globalAlpha = 1 });
const CASES = [['M01', 'ตรวจสอบภาพถ่าย', 'หาจุดที่ขัดกับคำอ้างของผู้โพสต์ 2 จุด'], ['M02', 'ตรวจสอบบัญชีผู้ใช้', 'เลือกข้อมูลที่น่าสงสัยในโปรไฟล์ให้ครบ'], ['M03', 'วิเคราะห์ข้อความ', 'เลือกข้อความสำคัญในแชตให้ครบ 3 ข้อความ'], ['M04', 'เชื่อมโยงหลักฐาน', 'จับคู่หลักฐานกับข้อสรุปให้ถูกทั้งหมด'], ['M05', 'ตรวจสอบเหตุการณ์', 'เทียบเวลาโพสต์กับภาพจากกล้องวงจรปิด']];
CASES.push(['M06', 'เปรียบเทียบสองบัญชี', 'หาหลักฐานว่าสองบัญชีเป็นคนเดียวกัน'], ['M07', 'ประวัติการโพสต์', 'หาโพสต์ที่ข้อมูลขัดแย้งกันเอง 2 คู่'], ['M08', 'คัดกรองบัญชี + รายงานหัวหน้า', 'คัดกรอง 6 บัญชี แล้วส่งรายงานให้มาร์ธา']);
const csDefault = () => ({ M01: { found: {} }, M02: { sel: {} }, M03: { sel: {} }, M04: { pair: {}, pick: null }, M05: { snap: null, ans: null }, M06: { sel: {} }, M07: { pick: null, pairs: [] }, M08: { stage: 0, mark: {}, rep: {} } }); S.cs = csDefault(); S.done = {};
/* ---------- build desk + hardware ---------- */
function buildComputer() {
  F(deskBig(2.1, .9), DX, DZ, 0, 1, 2.1, .9); F(officeChair(), DX, 7.15, 0, 1, .5, .5);
  const tw = pcTower(); F(tw, 2.3, DZ - .05, 0, 1, 0, 0, 0); deskLed = tw.userData.led;
  F(speaker(), .72, MZ, .2, 1, 0, 0, .76); F(speaker(), 2.5, MZ, -.2, 1, 0, 0, .76); F(deskLamp(), .72, 6.55, .6, 1, 0, 0, .76);
  F(keyboard(), 1.5, 6.55, 0, 1, 0, 0, .76); { const g = G(); P3(g, Bx(.24, .004, .2), MC(0x1a2a3a, .9), 0, .002, 0); const ms = P3(g, new T.SphereGeometry(1, 12, 8), MC(0x1a1b1e, .4), 0, .018, 0); ms.scale.set(.032, .018, .05); F(g, 2.05, 6.55, 0, 1, 0, 0, .76) }
  // open notebook with handwriting (ref: desk with notebook)
  { const nb = G(), pg = M(tex(128, (c, s) => { c.fillStyle = '#e4dcc8'; c.fillRect(0, 0, s, s); c.strokeStyle = 'rgba(80,90,140,.35)'; for (let y = 10; y < s; y += 7) { c.beginPath(); c.moveTo(4, y); c.lineTo(s - 4, y); c.stroke() } c.strokeStyle = 'rgba(30,30,60,.8)'; for (let y = 14; y < s - 10; y += 7) { c.beginPath(); let x = 8; c.moveTo(x, y); while (x < s - 20 && Math.random() > .03) { x += rr(2, 6); c.lineTo(x, y + rr(-1.5, 1.5)) } c.stroke() } c.strokeStyle = '#a02020'; c.strokeRect(s * .55, s * .5, 30, 18) }), .9);
    P3(nb, Bx(.42, .012, .29), MC(0x3a2418, .7)); P3(nb, Bx(.2, .004, .28), pg, -.105, .008, 0, 0, 0, .02); P3(nb, Bx(.2, .004, .28), pg, .105, .008, 0, 0, 0, -.02); F(nb, 1.0, 6.62, .15, 1, 0, 0, .76) }
  F(papers(3), .62, 6.35, 0, 1, 0, 0, .76); F(P3(G(), mugG(), MC(0x2a3a5a, .4)), 2.4, 6.4, 0, 1, 0, 0, .76);
  { const tr = G(); P3(tr, Lathe([[0, 0], [.07, 0], [.08, .015], [.075, .015], [.065, .004], [0, .004]], 14), MAT.brass); F(tr, 2.45, 6.58, 0, 1, 0, 0, .76) }
  RT = new T.WebGLRenderTarget(384, 288, { encoding: T.sRGBEncoding }); LAPRT = new T.WebGLRenderTarget(192, 128, { encoding: T.sRGBEncoding });
  OV = document.createElement('canvas'); OV.width = 512; OV.height = 384; og = OV.getContext('2d'); OT = new T.CanvasTexture(OV); OT.encoding = T.sRGBEncoding;
  DC = document.createElement('canvas'); DC.width = 800; DC.height = 600; dg = DC.getContext('2d'); DT = new T.CanvasTexture(DC); DT.encoding = T.sRGBEncoding; DT.anisotropy = 8; DT.minFilter = T.LinearFilter;
  const vhs = new T.ShaderMaterial({ uniforms: { tF: { value: RT.texture }, tO: { value: OT }, t: { value: 0 }, on: { value: 1 }, fl: { value: 0 } }, vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform sampler2D tF,tO;uniform float t,on,fl;varying vec2 v;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+t*41.3)*43758.5453);}
    void main(){vec2 c=v-.5;vec2 u=.5+c*(1.+.09*dot(c,c));if(u.x<0.||u.x>1.||u.y<0.||u.y>1.){gl_FragColor=vec4(0.,0.,0.,1.);return;}
     float band=smoothstep(.0,.04,abs(fract(u.y-t*.07)-.5));vec2 uu=u+vec2((1.-band)*.006*sin(t*30.),0.);
     vec3 f=(texture2D(tF,uu).rgb*.5+texture2D(tF,uu+vec2(.003,0.)).rgb*.25+texture2D(tF,uu-vec2(.003,.002)).rgb*.25);
     float l=dot(f,vec3(.3,.59,.11));l=pow(l,.75)*1.5;vec3 col=vec3(.42,1.,.5)*l;col.r+=texture2D(tF,uu+vec2(.006,0.)).r*.08;
     col+=(h(u*vec2(384.,288.))-.5)*.16;col*=.86+.14*sin(u.y*288.*3.14159);col*=1.-dot(c,c)*1.6;col*=.92+.08*band;col+=fl*.5*h(u*90.);
     col*=on;col+=(1.-on)*(h(u*200.)*.12);vec4 o=texture2D(tO,u);col=mix(col,o.rgb,o.a);gl_FragColor=vec4(col,1.);}` });
  scMain = crt(MON.main.x, MON.main.ry, new T.MeshBasicMaterial({ map: DT, toneMapped: false })); scCam = crt(MON.cctv.x, MON.cctv.ry, vhs); window.VHS = vhs;
  const ml = new T.PointLight(0xb8a0ff, .5, 3, 2), ml2 = new T.PointLight(0x78ffa0, .45, 3, 2); ml.position.set(MON.main.x, DY + 1.1, MZ + .45); ml2.position.set(MON.cctv.x, DY + 1.1, MZ + .45); scene.add(ml, ml2);
  window.PCL = on => { ml.intensity = on ? .5 : 0; ml2.intensity = on ? .45 : 0; vhs.uniforms.on.value = on ? 1 : 0; if (deskLed) deskLed.material.color.setHex(on ? 0x40ff40 : 0x200000) };
  IT.push({ x: DX, y: DY + 1.0, z: 6.8, l: 1, r: 1.9, lab: () => pcOn() ? '[E] นั่งที่โต๊ะคอมพิวเตอร์' : 'คอมพิวเตอร์ดับ (ไม่มีไฟ)', act: () => pcOn() && enterPC() });
  { const g = G(); P3(g, RG(.07, .05, .07, .015), MAT.dark); P3(g, Cy(.015, .02, 10), MC(0x050505, .1), 0, 0, .045, Math.PI / 2); const led = P3(g, new T.SphereGeometry(.006, 6, 4), new T.MeshBasicMaterial({ color: 0xff2020 }), .025, .018, .04); F(g, 6.65, 9.5, -2.5, 1, 0, 0, 2.5); g.lookAt(DX, DY + 1, 6.4); g.userData.dyn = 1; window.HCAM = led }
  IT.push({ x: 6.65, y: DY + 2.5, z: 9.5, l: 1, r: 2.6, lab: () => clue('C7', 1) ? '' : '[E] ไฟสีแดงนั่นคืออะไร?', act: () => { if (clue('C7')) { S.cam7 = 1; sub('กล้องจิ๋ว... หันตรงมาที่เก้าอี้ของคุณ'); sting() } } });
  if (LAPTOP) { LAPTOP.userData.scr.material = new T.MeshBasicMaterial({ map: LAPRT.texture, color: 0xb8ffc0 }); IT.push({ x: 8.2, y: DY + .85, z: HD - .5, l: 1, r: 1.6, lab: () => S.laptopDone ? 'แล็ปท็อป (' + (S.laptopUnplugged ? 'ถอดปลั๊กแล้ว' : 'คัดลอกแล้ว') + ')' : '[E] ตรวจสอบแล็ปท็อป', act: () => !S.laptopDone && laptopDialog() }) }
  drawDesk(); drawOV();
}
function crt(x, ry, sm) { const g = G(), blk = MC(0x15161a, .35, { metalness: .3 }), alu = MC(0x6a6e74, .3, { metalness: .8 }); /* modern flat panel: 6 mm bezel, slim back shell, aluminium stand */
  P3(g, RG(SW + .024, SH + .024, .022, .006), blk, 0, .01, .074); P3(g, RG(SW - .04, SH - .06, .03, .01), blk, 0, .02, .05); P3(g, Bx(.05, .26, .02), alu, 0, -.16, .03); P3(g, RG(.24, .012, .17, .005), alu, 0, -.285, .01); P3(g, Bx(SW * .3, .008, .003), MC(0x2a2c30, .4), 0, -SH / 2 - .002, .0855); const sc = P3(g, new T.PlaneGeometry(SW, SH), sm, 0, .01, .092); sc.castShadow = false; sc.userData.dyn = 1; P3(g, Bx(.012, .004, .004), MC(0xffffff, 1, { emissive: 0xa0c8ff }), SW / 2 - .02, -SH / 2 - .004, .086);
  F(g, x, MZ, ry, 1, 0, 0, .76 + .3); return sc }
/* ---------- clue + mail state ---------- */
S.clues = {}; S.mv = {}; S.read = {}; S.quar = 0; S.cam7 = 0; S.camSeen = {};
function clue(id, peek) { if (peek) return !!S.clues[id]; if (S.clues[id]) return false; S.clues[id] = fmt(); tone(660, .08, 'square', .08); tone(990, .1, 'square', .08, .09); toast('เพิ่มหลักฐาน: ' + CLUES[id][0]); return true }
function mailsVisible() { return MAILS.map((m, i) => [m, i]).filter(([m]) => !m.late || (S.mailOn && S.mailOn[m.late])) }
/* ---------- CyberOS desktop renderer (800 x 600 canvas mapped onto the main CRT) ---------- */
let HR = [];
const FONT = '16px ' + TF, FB = 'bold 16px ' + TF, FS = '14px ' + TF, FT = 'bold 13px ' + TF;
const SEG = window.Intl && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
function words(t) { return SEG ? Array.from(SEG.segment(t), s => s.segment) : Array.from(t) } // Thai has no spaces between words: segment for wrapping
function wrap(t, x, y, w, lh = 21, font = FONT) { dg.font = font; for (const para of String(t).split('\n')) { let l = ''; for (const s of words(para)) { if (dg.measureText(l + s).width > w && l) { dg.fillText(l, x, y); y += lh; l = s.trimStart() } else l += s } dg.fillText(l, x, y); y += lh } return y }
function btn(x, y, w, h, t, fn, hot) { const g = dg, o = D.over === 1 && D.cx >= x && D.cx < x + w && D.cy >= y && D.cy < y + h; g.fillStyle = hot ? '#7a2a2a' : o ? '#3a5a8a' : '#2a3e66'; g.fillRect(x, y, w, h); g.strokeStyle = '#9ab'; g.strokeRect(x + .5, y + .5, w - 1, h - 1); g.fillStyle = '#eef'; g.font = FS; g.fillText(t, x + 8, y + h / 2 + 5); HR.push([x, y, w, h, fn, t]) }
function field(x, y, w, key, ph) { const g = dg, act = D.inp === key; g.fillStyle = '#f4f2e8'; g.fillRect(x, y, w, 28); g.strokeStyle = act ? '#c84' : '#567'; g.lineWidth = act ? 2 : 1; g.strokeRect(x + .5, y + .5, w - 1, 27); g.lineWidth = 1; g.fillStyle = D[key] ? '#111' : '#889'; g.font = FONT; g.fillText((D[key] || (act ? '' : ph)) + (act && (Date.now() / 450 | 0) % 2 ? '_' : ''), x + 6, y + 20); HR.push([x, y, w, 28, () => { D.inp = key }, 'field:' + key]) }
function wallpaper(g) { if (!WALLC) { WALLC = document.createElement('canvas'); WALLC.width = 800; WALLC.height = 600; const w = WALLC.getContext('2d'), bg = w.createLinearGradient(0, 0, 800, 600); bg.addColorStop(0, '#0b1d3f'); bg.addColorStop(.55, '#123a7a'); bg.addColorStop(1, '#0a1530'); w.fillStyle = bg; w.fillRect(0, 0, 800, 600);
    const petal = (cx, cy, rx, ry, a, c0, c1) => { w.save(); w.translate(cx, cy); w.rotate(a); const gr = w.createRadialGradient(0, -ry * .3, 4, 0, 0, ry); gr.addColorStop(0, c0); gr.addColorStop(1, c1); w.fillStyle = gr; w.beginPath(); w.ellipse(0, 0, rx, ry, 0, 0, 7); w.fill(); w.restore() };
    w.globalCompositeOperation = 'lighter'; for (let k = 0; k < 7; k++) petal(470 + Math.cos(k * .9) * 40, 300 + Math.sin(k * .9) * 30, 90, 230, -1.2 + k * .42, 'rgba(120,180,255,.34)', 'rgba(20,60,160,0)'); petal(470, 300, 120, 120, 0, 'rgba(200,230,255,.35)', 'rgba(60,120,255,0)'); w.globalCompositeOperation = 'source-over' }
  g.drawImage(WALLC, 0, 0) }
let WALLC = null;
function drawDesk() {
  const g = dg; HR = []; g.textBaseline = 'alphabetic';
  if (!pcOn()) { g.fillStyle = '#000'; g.fillRect(0, 0, 800, 600); DT.needsUpdate = true; return }
  wallpaper(g); const unread = mailsVisible().filter(([m, i]) => !S.read[i]).length, nextCase = CASES.findIndex(c => !S.done[c[0]]);
  const icons = [['อีเมล', 'mail', '✉'], ['คดี', 'cases', '★'], ['ไฟล์', 'files', '▤'], ['ค้นหา', 'search', '⌕'], ['TRACE', 'trace', '⌖'], ['หลักฐาน', 'evid', '▣']].concat(S.sosOn ? [['SOS', 'sos', '!']] : []), sp = icons.length > 6 ? 78 : 86;
  icons.forEach(([n, id, ic], i) => { const y = 10 + i * sp, o = D.over === 1 && D.cx < 96 && D.cy >= y && D.cy < y + 80; if (o) { g.fillStyle = 'rgba(255,255,255,.16)'; rr8(g, 8, y, 84, 80, 6); g.fill() } appIcon(g, id, ic, 30, y + 6, 40);
    g.font = FT; const tw = g.measureText(n).width; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(n, 51 - tw / 2, y + 69); g.fillStyle = '#fff'; g.fillText(n, 50 - tw / 2, y + 68);
    const badge = id === 'mail' ? unread : id === 'sos' && !S.sosSent ? '!' : id === 'cases' && nextCase >= 0 && caseOpen(nextCase) ? '!' : 0;  if (badge) { g.fillStyle = '#c82a2a'; g.beginPath(); g.arc(74, y + 6, 11, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = FT; g.fillText(badge, 70, y + 11) }
    HR.push([8, y, 84, 80, () => { D.app = id; D.mail = null; D.doc = null; D.hdr = false; D.inp = id === 'search' ? 'q' : id === 'trace' ? 'ip' : null; D.rep = 0; D.cs = null; D.sub = null }, 'app:' + id]) });
  if (D.app) {
    const X = 108, Y = 10, W = 682, H = 546; g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 6; g.fillStyle = '#f3f3f3'; rr8(g, X, Y, W, H, 8); g.fill(); g.restore(); g.fillStyle = '#f9f9f9'; g.fillRect(X + 1, Y + 32, W - 2, H - 33); g.strokeStyle = 'rgba(0,0,0,.12)'; rr8(g, X + .5, Y + .5, W - 1, H - 1, 8); g.stroke();
    appIcon(g, D.app, '', X + 10, Y + 8, 16); g.fillStyle = '#1b1b1b'; g.font = FT; g.fillText({ mail: 'อีเมล - you@halden-sec.com', cases: 'Cyber Detective - คดี MH-0412', files: 'ไฟล์ - C:\\SHIFT', search: 'ค้นหา - อีเมล + ไฟล์', trace: 'TRACE - เครื่องมือเครือข่าย', evid: 'กระดานหลักฐาน', sos: 'SafeHome — แจ้งเหตุฉุกเฉิน' }[D.app], X + 34, Y + 21);
    winCaption(g, X + W, Y); g.fillStyle = '#111'; const L = X + 16, TOP = Y + 56, RW = W - 32;
    if (D.app === 'mail') appMail(g, X, Y, W, H, L, TOP, RW); else if (D.app === 'cases') appCases(g, X, Y, W, H, L, TOP, RW);
    else if (D.app === 'files') {
      if (D.doc === null) { let k = 0; DOCS.forEach((d, i) => { if (d[4] && !S.uploads) return; if (d[4] && k === 5) { g.fillStyle = '#7a1a1a'; g.font = FB; g.fillText('▸ Camera Uploads  (โฟลเดอร์ใหม่ · ไม่ได้สร้างโดยคุณ)', L, TOP - 12 + k * 46 + 10); k += .6 } const yy = TOP - 12 + (k++) * 46; btn(L + (d[4] ? 24 : 0), yy, 460, 36, (d[2] === 'exe' ? '⚠ ' : '  ') + d[0] + (d[2] === 'exe' && S.quar ? '  [กักกันแล้ว]' : ''), () => { D.doc = i; if (d[2] === 'log') clue('C4'); if (d[2] === 'img') S.upSeen[d[3]] = 1 }) }) }
      else { const d = DOCS[D.doc]; g.font = FB; g.fillText(d[0], L, TOP); g.fillStyle = '#111'; if (d[2] === 'img' && PHOTO[d[3]]) { g.drawImage(PHOTO[d[3]], L, TOP + 14, 448, 336); g.strokeRect(L + .5, TOP + 14.5, 447, 335); wrap(d[1], L, TOP + 374, RW, 20, FS) } else wrap(d[1], L, TOP + 30, RW, 22, d[2] === 'log' || d[0].endsWith('.csv') ? '15px monospace' : FONT); btn(L, Y + H - 44, 100, 30, '< กลับ', () => { D.doc = null }); if (d[2] === 'exe' && !S.quar) btn(L + 110, Y + H - 44, 150, 30, 'กักกันไฟล์', () => { S.quar = 1; toast('กักกัน invoice_2291.pdf.exe แล้ว') }, 1) } }
    else if (D.app === 'search') {
      field(L, TOP - 14, 440, 'q', 'พิมพ์คำค้นหรือ IP...'); const q = (D.q || '').toLowerCase().trim(); let y = TOP + 40;
      if (q.length > 1) { const res = []; mailsVisible().forEach(([m, i]) => { if ((m.from + m.subj + m.body + m.hdr.join(' ')).toLowerCase().includes(q)) res.push(['อีเมล', m.subj, () => { D.app = 'mail'; D.mail = i; S.read[i] = 1; D.inp = null }]) }); DOCS.forEach((d, i) => { if ((d[0] + d[1]).toLowerCase().includes(q)) res.push(['ไฟล์', d[0], () => { D.app = 'files'; D.doc = i; D.inp = null; if (d[2] === 'log') clue('C4') }]) });
        g.font = FB; g.fillText('พบ ' + res.length + ' รายการ', L, y); y += 14; res.slice(0, 9).forEach(([k, n, fn], i) => btn(L, y + i * 40, RW, 34, k + '  ' + n, fn)) }
      else { g.font = FONT; g.fillStyle = '#444'; wrap('ค้นหาได้ทั้งอีเมล (รวมหัวอีเมล) และไฟล์ทั้งหมด ลองค้นด้วย IP ที่เคยเห็น', L, y, RW) } }
    else if (D.app === 'trace') {
      field(L, TOP - 14, 300, 'ip', 'ที่อยู่ IP'); btn(L + 312, TOP - 14, 160, 28, 'เริ่ม TRACE', runTrace);
      g.fillStyle = '#20262a'; g.fillRect(L - 4, TOP + 24, RW + 8, 390); g.fillStyle = '#9fe89f'; g.font = '15px ' + TF; D.out.slice(0, D.outN | 0).forEach((l, i) => g.fillText(l, L + 6, TOP + 50 + i * 24));
      g.fillStyle = '#444'; g.font = FS; g.fillText('ที่อยู่ที่รู้จัก: ดูจากหัวอีเมลและไฟล์ router_leases.csv', L, Y + H - 16) }
    else if (D.app === 'evid') appEvid(g, X, Y, W, H, L, TOP, RW);
    else if (D.app === 'sos') appSOS(g, X, Y, W, H, L, TOP, RW);
  }
  taskbar(g, icons);
  if (D.toast && D.toast.t > Date.now()) { g.font = FS; const w = Math.min(560, Math.max(260, g.measureText(D.toast.s).width + 70)); g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 18; g.fillStyle = 'rgba(38,38,42,.97)'; rr8(g, 790 - w, 486, w, 62, 8); g.fill(); g.restore(); appIcon(g, 'sys', 'ⓘ', 802 - w, 498, 18); g.fillStyle = '#ccc'; g.font = '12px ' + TF; g.fillText('การแจ้งเตือน · ตอนนี้', 828 - w, 511); g.fillStyle = '#fff'; g.font = FS; g.fillText(D.toast.s, 802 - w, 536) }
  if (D.over === 1) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(D.cx, D.cy); g.lineTo(D.cx + 13, D.cy + 12); g.lineTo(D.cx + 6, D.cy + 13); g.lineTo(D.cx + 9, D.cy + 21); g.lineTo(D.cx + 6, D.cy + 22); g.lineTo(D.cx + 3, D.cy + 14); g.lineTo(D.cx, D.cy + 19); g.closePath(); g.fill(); g.strokeStyle = '#000'; g.stroke() }
  DT.needsUpdate = true;
}
function appMail(g, X, Y, W, H, L, TOP, RW) {
  if (D.mail === null) { g.font = FB; g.fillText('ผู้ส่ง', L, TOP); g.fillText('หัวเรื่อง', L + 260, TOP); g.fillText('เวลา', L + 590, TOP);
    mailsVisible().forEach(([m, i], k) => { const y = TOP + 12 + k * 42, o = D.over === 1 && D.cy > y && D.cy < y + 38 && D.cx > L && D.cx < L + RW; g.fillStyle = o ? '#c8d4f0' : k % 2 ? '#efebe0' : '#e2ded2'; g.fillRect(L - 4, y, RW + 8, 38); g.fillStyle = S.read[i] ? '#444' : '#000'; g.font = S.read[i] ? FS : 'bold 14px ' + TF; g.fillText(m.from.split('<')[0].slice(0, 22), L, y + 24); g.fillText(m.subj.slice(0, 30), L + 260, y + 24); g.fillText(m.time === '--:--' ? fmt() : m.time, L + 590, y + 24);
      const v = S.mv[i]; if (v) { g.fillStyle = v === 'phish' ? '#a22' : '#262'; g.font = FT; g.fillText(v === 'phish' ? 'ฟิชชิง' : 'ปลอดภัย', L + 520, y + 24) } HR.push([L - 4, y, RW + 8, 38, () => { D.mail = i; D.hdr = false; S.read[i] = 1; (m.clues || []).filter(c => c !== 'C1' && c !== 'C2').forEach(c => clue(c)); if (window.onMailRead) onMailRead(i) }, 'mail:' + i]) });
    g.fillStyle = '#444'; wrap('เปิดอีเมล > ตรวจหัวอีเมล > ตัดสินว่าเป็นฟิชชิงหรือปลอดภัย หัวอีเมลบอกว่าอีเมลมาจากไหนจริง ๆ', L, Y + H - 52, RW, 20, FS) }
  else { const m = MAILS[D.mail]; let y = TOP; g.font = FB; g.fillText('จาก: ', L, y); g.font = FONT; g.fillText(m.from, L + 60, y); y += 24; g.font = FB; g.fillText('เรื่อง: ', L, y); g.font = FONT; g.fillText(m.subj, L + 60, y); y += 12; g.fillStyle = '#999'; g.fillRect(L, y, RW, 1); g.fillStyle = '#111'; y = wrap(m.body, L, y + 28, RW) + 4;
    if (m.att) { g.fillStyle = '#7a1a1a'; g.font = FB; g.fillText('ไฟล์แนบ: ' + m.att, L, y); y += 26 } if (m.img && PHOTO[m.img] && !D.hdr) { g.drawImage(PHOTO[m.img], L, y, 320, 240); g.strokeStyle = '#333'; g.strokeRect(L + .5, y + .5, 319, 239); y += 248 }
    if (D.hdr) { g.fillStyle = '#20262a'; g.fillRect(L - 4, y, RW + 8, m.hdr.length * 21 + 14); g.fillStyle = '#9fe89f'; g.font = '14px monospace'; m.hdr.forEach((h, k) => g.fillText(h, L + 4, y + 22 + k * 21)); g.font = FS; m.hdr.forEach((h, k) => { if (/[ก-๙]/.test(h)) g.fillText(h, L + 4, y + 22 + k * 21) }) }
    const by = Y + H - 44; btn(L, by, 90, 30, '< กลับ', () => { D.mail = null }); btn(L + 100, by, 180, 30, D.hdr ? 'ซ่อนหัวอีเมล' : 'ตรวจหัวอีเมล', () => { D.hdr = !D.hdr; if (D.hdr) (m.clues || []).forEach(c => clue(c)) });
    btn(L + 290, by, 170, 30, 'เป็นฟิชชิง', () => { S.mv[D.mail] = 'phish'; tone(300, .1, 'square', .1); toast(m.v === 'phish' ? 'ถูกต้อง: อีเมลฟิชชิง' : 'แน่ใจหรือ? ลองดูหัวอีเมลอีกที') }, S.mv[D.mail] === 'phish'); btn(L + 470, by, 170, 30, 'ปลอดภัย', () => { S.mv[D.mail] = 'safe'; tone(500, .1, 'square', .1); toast(m.v === 'safe' ? 'ทำเครื่องหมายว่าปลอดภัย' : 'ระวัง: ตรวจหัวอีเมลก่อน') }, S.mv[D.mail] === 'safe') }
}
function caseOpen(i) { return i === 0 || (S.done[CASES[i - 1][0]] && (S.unlockCase || 3) > i) }
function caseDone(id) { if (S.done[id]) return; S.done[id] = fmt(); if (/^M0[1-5]$/.test(id)) clue('M' + (+id.slice(1))); tone(880, .15, 'square', .1); D.cs = null; invAdvance(id); if (window.onCaseDone) onCaseDone(id) }
function appCases(g, X, Y, W, H, L, TOP, RW) {
  if (!D.cs) { invList(g, X, Y, W, H, L, TOP, RW); return }
  TOP = invHeader(g, X, Y, W, L, TOP, RW) + 36; if (!S.cs[D.cs]) S.cs[D.cs] = {}; const cs = S.cs[D.cs]; g.fillStyle = '#111'; if (/^[SVH]/.test(D.cs)) { invStep(g, X, Y, W, H, L, TOP - 66, RW); return }
  if (D.cs === 'M01') { wrap('@quiet_neighbor_77 อ้างว่า "ทุกภาพถ่ายจากสวนบ้านตัวเองบนถนนเอล์ม" คลิกภาพเพื่อขยาย แล้วคลิกจุดที่ขัดกับคำอ้าง (' + Object.keys(cs.found).length + '/2)', L, TOP + 20, RW, 20, FS);
    if (D.sub === null) CPHOTOS.forEach((ph, i) => { const x = L + (i % 2) * 330, y = TOP + 64 + Math.floor(i / 2) * 210, im = pic('ph' + i, 300, 190, ph[2]); g.drawImage(im, x, y, 300, 170); g.strokeStyle = cs.found[i] ? '#2a8a2a' : '#555'; g.lineWidth = cs.found[i] ? 4 : 1; g.strokeRect(x, y, 300, 170); g.lineWidth = 1; g.fillStyle = '#222'; g.font = FS; g.fillText(ph[0] + ' - ' + ph[1], x, y + 190); HR.push([x, y, 300, 170, () => { D.sub = i }, 'photo:' + i]) });
    else { const i = D.sub, im = pic('ph' + i, 300, 190, CPHOTOS[i][2]), x = L + 30, y = TOP + 62, w = 600, h = 380; g.drawImage(im, x, y, w, h); g.strokeStyle = '#333'; g.strokeRect(x, y, w, h); const hs = PHOTO_HOT[i]; if (cs.found[i] && hs) { g.strokeStyle = '#3c3'; g.lineWidth = 3; g.strokeRect(x + hs[0] * w, y + hs[1] * h, (hs[2] - hs[0]) * w, (hs[3] - hs[1]) * h); g.lineWidth = 1; g.fillStyle = '#262'; wrap('✓ ' + hs[4], L, y + h + 22, RW, 20, FS) }
      HR.push([x, y, w, h, () => { const u = (D.cx - x) / w, v = (D.cy - y) / h; if (hs && u > hs[0] && u < hs[2] && v > hs[1] && v < hs[3]) { cs.found[i] = 1; tone(880, .1, 'square', .08); if (Object.keys(cs.found).length >= 2) caseDone('M01') } else { toast('ไม่มีอะไรผิดปกติตรงนี้'); tone(200, .12, 'square', .06) } }, 'photobig']); btn(L, Y + H - 40, 120, 28, '< ภาพทั้งหมด', () => { D.sub = null }) } }
  if (D.cs === 'M02') { const y0 = TOP + 26, LW = Math.round(RW * .6), RX = L + LW + 12, RWW = RW - LW - 12, nSel = PROFILE.filter((p, i) => cs.sel[i]).length;
    g.fillStyle = '#333'; g.font = FS; g.fillText('คลิกเลือก 3 ข้อมูลในโปรไฟล์ที่ผิดปกติ  ·  เลือกแล้ว ' + nSel + '/3', L, TOP + 14);
    /* profile card (left) */ g.fillStyle = '#fff'; g.fillRect(L, y0, LW, 318); g.strokeStyle = '#d8d8d8'; g.strokeRect(L + .5, y0 + .5, LW - 1, 317); g.fillStyle = '#3b5998'; g.fillRect(L, y0, LW, 50);
    g.fillStyle = '#cfd6e2'; g.beginPath(); g.arc(L + 40, y0 + 52, 26, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke(); g.lineWidth = 1; g.fillStyle = '#8a96aa'; g.beginPath(); g.arc(L + 40, y0 + 45, 9, 0, 7); g.fill(); g.beginPath(); g.ellipse(L + 40, y0 + 70, 16, 11, 0, Math.PI, 0); g.fill(); // default avatar (no photo)
    g.fillStyle = '#fff'; g.font = 'bold 17px ' + TF; g.fillText('@quiet_neighbor_77', L + 76, y0 + 30); g.fillStyle = '#666'; g.font = '12px ' + TF; g.fillText('บัญชีส่วนตัว · ไม่มีรูปโปรไฟล์', L + 76, y0 + 68);
    PROFILE.forEach(([k, v], i) => { const y = y0 + 98 + i * 27, sel = cs.sel[i]; g.fillStyle = sel ? '#ffe8a0' : i % 2 ? '#f6f6f6' : '#fff'; g.fillRect(L + 6, y - 19, LW - 12, 25); if (sel) { g.strokeStyle = '#c80'; g.strokeRect(L + 6.5, y - 18.5, LW - 13, 24) }
      g.fillStyle = '#666'; g.font = '13px ' + TF; g.fillText((sel ? '☑ ' : '☐ ') + k, L + 12, y); g.fillStyle = '#111'; g.font = '14px ' + TF; let t = v; while (g.measureText(t).width > LW - 150 && t.length > 4) t = t.slice(0, -2); g.fillText(t === v ? v : t + '…', L + 128, y); HR.push([L + 6, y - 19, LW - 12, 25, () => { cs.sel[i] = !cs.sel[i] }, 'prof:' + i]) });
    /* case file (right): the complaint, the account's recent posts and what to look at */ g.fillStyle = '#f3f6fb'; g.fillRect(RX, y0, RWW, 318); g.strokeStyle = '#d0d8e6'; g.strokeRect(RX + .5, y0 + .5, RWW - 1, 317);
    let yy = y0 + 20; const hd = t => { g.fillStyle = '#1a3a9a'; g.font = 'bold 13px ' + TF; g.fillText(t, RX + 10, yy); yy += 18 }, tx = (t, c = '#222') => { g.fillStyle = c; g.font = '12px ' + TF; yy = wrap(t, RX + 10, yy, RWW - 20, 16, '12px ' + TF) + 2 };
    hd('เรื่องร้องเรียน'); tx('ริชาร์ด (เจ้าของบ้าน 1407) แจ้งว่าบัญชีนี้โพสต์รูปบ้านเขาตอนกลางคืน และดูเหมือนรู้ว่าใครอยู่ในบ้าน'); yy += 4;
    hd('โพสต์ล่าสุดของบัญชีนี้'); tx('00:03 · รูปหน้าบ้าน 1407 "ไฟชั้นบนยังเปิดอยู่"', '#444'); tx('23:41 · "คนเฝ้าบ้านคนใหม่มาแล้ว"', '#444'); tx('22:10 · "บ้านนี้เงียบดีนะ"', '#444'); yy += 4;
    hd('สิ่งที่นักสืบควรตรวจ'); tx('• บัญชีนี้เพิ่งถูกสร้างเมื่อไร'); tx('• อีเมลกู้คืนบอกอะไรเกี่ยวกับเจ้าของ'); tx('• บัญชีนี้กำลังติดตามใครอยู่');
    btn(L, Y + H - 44, 200, 30, 'ส่งผลการตรวจ', () => { const good = PROFILE.filter((p, i) => p[2] && cs.sel[i]).length, bad = PROFILE.filter((p, i) => !p[2] && cs.sel[i]).length; if (good === 3 && !bad) caseDone('M02'); else toast(`ถูก ${good}/3 จุด` + (bad ? `, เลือกผิด ${bad} จุด` : '') + ' · ดูกล่อง "สิ่งที่นักสืบควรตรวจ"') }) }
  if (D.cs === 'M03') { wrap('แชตที่กู้คืนได้จากบัญชี คลิกเลือกข้อความที่เป็นเบาะแสสำคัญ 3 ข้อความ', L, TOP + 20, RW, 20, FS); CHAT.forEach(([who, t], i) => { const y = TOP + 40 + i * 32, me = who === 'quiet_neighbor_77', sel = cs.sel[i]; g.font = FS; const tw = Math.min(RW - 120, g.measureText(t).width + 24), x = me ? L + RW - tw : L;
      g.fillStyle = sel ? '#ffe08a' : me ? '#cfe3ff' : '#ffffff'; g.fillRect(x, y, tw, 28); g.strokeStyle = sel ? '#c80' : '#bbb'; g.strokeRect(x + .5, y + .5, tw - 1, 27); g.fillStyle = '#111'; g.fillText(t, x + 12, y + 19); g.fillStyle = '#777'; g.font = '11px ' + TF; g.fillText(who, x + (me ? -100 : tw + 6), y + 18); HR.push([x, y, tw, 28, () => { cs.sel[i] = !cs.sel[i] }, 'chat:' + i]) });
    btn(L, Y + H - 44, 200, 30, 'ส่งผลวิเคราะห์', () => { const good = CHAT.filter((c, i) => c[2] && cs.sel[i]).length, bad = CHAT.filter((c, i) => !c[2] && cs.sel[i]).length; if (good === 3 && !bad) caseDone('M03'); else toast(`ถูก ${good}/3` + (bad ? ` เลือกเกิน ${bad}` : '') + ' ข้อความไหนบอกว่าเขาเข้าถึงบ้านได้?') }) }
  if (D.cs === 'M04') { wrap('คลิกหลักฐานด้านซ้าย แล้วคลิกข้อสรุปด้านขวาที่ตรงกัน', L, TOP + 20, RW, 20, FS); const pos = (side, i) => [side ? L + RW - 290 : L, TOP + 52 + i * 76];
    for (const [a, b] of Object.entries(cs.pair)) { const [x1, y1] = pos(0, +a), [x2, y2] = pos(1, b); g.strokeStyle = '#b02020'; g.lineWidth = 3; g.beginPath(); g.moveTo(x1 + 290, y1 + 30); g.lineTo(x2, y2 + 30); g.stroke(); g.lineWidth = 1 }
    LINK_L.forEach((t, i) => { const [x, y] = pos(0, i); g.fillStyle = cs.pick === i ? '#ffe08a' : '#fff'; g.fillRect(x, y, 290, 60); g.strokeStyle = '#666'; g.strokeRect(x + .5, y + .5, 289, 59); g.fillStyle = '#111'; wrap(t, x + 10, y + 26, 270, 19, FS); HR.push([x, y, 290, 60, () => { cs.pick = i }, 'linkL:' + i]) });
    LINK_R.forEach((t, i) => { const [x, y] = pos(1, i); g.fillStyle = '#eef'; g.fillRect(x, y, 290, 60); g.strokeStyle = '#666'; g.strokeRect(x + .5, y + .5, 289, 59); g.fillStyle = '#111'; wrap(t, x + 10, y + 26, 270, 19, FS); HR.push([x, y, 290, 60, () => { if (cs.pick !== null) { for (const k in cs.pair) if (cs.pair[k] === i) delete cs.pair[k]; cs.pair[cs.pick] = i; cs.pick = null } }, 'linkR:' + i]) });
    btn(L, Y + H - 44, 200, 30, 'ยืนยันการเชื่อมโยง', () => { const ok = LINK_OK.filter((r, i) => cs.pair[i] === r).length; if (ok === 4) caseDone('M04'); else toast(`ถูก ${ok}/4 คู่ ลองใหม่`) }) }
  if (D.cs === 'M05') { g.drawImage(postImg(), L, TOP + 4, 200, 127); g.fillStyle = '#111'; wrap('@quiet_neighbor_77 โพสต์เมื่อ 00:03 "ไฟชั้นบนยังเปิดอยู่ ฉันเห็นนายนะ"', L + 216, TOP + 22, RW - 226, 20, FS); g.fillStyle = '#555'; wrap('ภาพนี้ถ่ายจากมุมไหน? เลือกภาพจากกล้องที่ตรงกับเวลาและมุมของโพสต์', L + 216, TOP + 82, RW - 226, 19, FS); /* compact layout: the case header now takes 36 px */
    SNAPS.forEach((s, i) => { const x = L + i * 130, y = TOP + 142; g.drawImage(snapImg(i), x, y, 122, 92); g.strokeStyle = cs.snap === i ? '#c80' : '#444'; g.lineWidth = cs.snap === i ? 4 : 1; g.strokeRect(x, y, 122, 92); g.lineWidth = 1; g.fillStyle = '#111'; g.font = '12px ' + TF; g.fillText(s[0], x, y + 108); g.fillText(s[1], x, y + 124); HR.push([x, y, 122, 92, () => { cs.snap = i }, 'snap:' + i]) });
    g.font = FB; g.fillText('ตอนโพสต์ เขาอยู่ที่ไหน?', L, TOP + 290); ['ใต้เสาไฟฝั่งตรงข้ามถนน', 'ในสวนหลังบ้าน', 'ในห้องนั่งเล่น'].forEach((t, i) => btn(L + i * 215, TOP + 300, 205, 32, t, () => { cs.ans = i }, cs.ans === i));
    btn(L, Y + H - 44, 200, 30, 'ยืนยันคำตอบ', () => { if (cs.snap === 2 && cs.ans === 0) caseDone('M05'); else toast(cs.snap !== 2 ? 'ภาพไหนมีเวลาตรงกับโพสต์ และเห็นเสาไฟ?' : 'ดูภาพจากกล้องอีกครั้ง') }) }
  if (D.cs === 'M06') caseM06(g, X, Y, W, H, L, TOP, RW); if (D.cs === 'M07') caseM07(g, X, Y, W, H, L, TOP, RW); if (D.cs === 'M08') caseM08(g, X, Y, W, H, L, TOP, RW);
}
function appEvid(g, X, Y, W, H, L, TOP, RW) {
  const ids = Object.keys(CLUES), got = ids.filter(i => S.clues[i]); let y = TOP - 6;
  if (!D.rep) { g.font = FS; g.fillStyle = '#444'; g.fillText(`หลักฐานที่พบ ${got.length}/${ids.length}`, L, y); y += 22; got.forEach(id => { g.fillStyle = '#111'; g.font = 'bold 14px ' + TF; g.fillText('■ ' + CLUES[id][0], L, y); g.font = '13px ' + TF; g.fillStyle = '#333'; y = wrap(CLUES[id][1], L + 22, y + 18, RW - 30, 17, '13px ' + TF) + 2 });
    if (S.reportSent) { g.fillStyle = '#262'; g.font = FB; g.fillText('บันทึกรายงานแล้ว (แนบไปกับการแจ้งเหตุ)', L, Y + H - 22) } else if (stAtLeast('SUSPICIOUS_EMAIL')) btn(L, Y + H - 46, 300, 32, 'บันทึกรายงานผู้ต้องสงสัย >', () => { D.rep = 1 }, 1); else { g.fillStyle = '#666'; g.font = FS; g.fillText('รวบรวมหลักฐานจากงานในแอป "คดี" และอีเมล', L, Y + H - 22) } }
  else { g.font = FB; g.fillText('ใครอยู่เบื้องหลังการแอบถ่ายและการบุกรุก?', L, TOP); [['บอทสแปมจากต่างประเทศ', 'bot'], ['มาร์ธา เอเบิร์ต (เพื่อนร่วมงาน)', 'marta'], ['อาร์. โอคาฟอร์ (เจ้าของบ้าน)', 'land'], ['แดเนียล วอสส์ (ผู้เช่าคนก่อน)', 'voss']].forEach(([t, k], i) => btn(L, TOP + 30 + i * 52, 480, 40, t, () => { S.reportSent = 1; S.suspect = k; D.rep = 0; if (window.onReport) onReport(k) }));
    btn(L, Y + H - 46, 100, 30, '< กลับ', () => { D.rep = 0 }) }
}
function toast(s) { D.toast = { s, t: Date.now() + 3400 }; D.toastGone = 0; D.dirty = 1; if (!S.pc) sub(s) }
function runTrace() { const ip = (D.ip || '').trim(); D.inp = null; D.out = ['> trace ' + ip, ...(TRACE[ip] || ['หมดเวลา ไม่พบอุปกรณ์ที่ที่อยู่นี้'])]; D.outN = 1; tone(800, .05, 'square', .06); if (ip === '10.0.0.77') clue('C5'); if (ip === '10.0.0.31') S.cam7 = 1 }
/* ---------- CCTV overlay (512 x 384), ref: night-vision frame with corner brackets, battery, REC ---------- */
let CHR = [];
function drawOV(now = 0) {
  const g = og; CHR = []; g.clearRect(0, 0, 512, 384); g.textBaseline = 'alphabetic'; const cl_ = camList(), F2 = 'bold 20px ' + TF;
  const sh = (t, x, y, c = '#e0ffe0', f = F2) => { g.font = f; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(t, x + 2, y + 2); g.fillStyle = c; g.fillText(t, x, y) };
  if (!pcOn()) { sh('ไม่มีสัญญาณ', 196, 200); OT.needsUpdate = true; return }
  if (!S.power) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(24, 262, 176, 24); sh('UPS · แบตเตอรี่สำรอง', 30, 280, '#ffd27a', 'bold 14px ' + TF) }
  g.strokeStyle = 'rgba(230,255,230,.85)'; g.lineWidth = 3; for (const [x, y, dx, dy] of [[14, 14, 1, 1], [498, 14, -1, 1], [14, 370, 1, -1], [498, 370, -1, -1]]) { g.beginPath(); g.moveTo(x, y + dy * 34); g.lineTo(x, y); g.lineTo(x + dx * 34, y); g.stroke() } g.lineWidth = 2; g.strokeRect(244, 180, 24, 24);
  g.strokeRect(28, 26, 30, 14); g.fillStyle = '#e0ffe0'; g.fillRect(58, 30, 3, 6); for (let i = 0; i < 3; i++) g.fillRect(31 + i * 9, 29, 7, 8);
  if ((now / 600 | 0) % 2) { g.fillStyle = '#ff3a3a'; g.beginPath(); g.arc(420, 34, 7, 0, 7); g.fill() } sh('REC', 434, 41);
  sh(`CAM ${S.sel + 1}`, 28, 70); sh(CAMS[S.sel][0], 28, 94, '#c8f0c8', 'bold 17px ' + TF); sh(fmt() + ':' + String((S.t * 20 | 0) % 60).padStart(2, '0'), 340, 362, '#e0ffe0', 'bold 17px monospace');
  const zone = S.motion || (D.qte && !D.qte.ok && D.qte.t > 0 ? { cam: D.qte.cam } : null); if (D.qte) qteDraw(g, sh, now); else if (zone && (now / 400 | 0) % 2) { g.fillStyle = 'rgba(160,0,0,.75)'; g.fillRect(150, 18, 250, 26); sh('! ความเคลื่อนไหว: CAM ' + (zone.cam + 1), 160, 37, '#fff', 'bold 15px ' + TF) }
  for (const [x, t, d] of [[6, '◀', -1], [470, '▶', 1]]) { g.fillStyle = D.over === 2 && D.cx2 >= x && D.cx2 < x + 36 && D.cy2 > 150 && D.cy2 < 234 ? 'rgba(160,255,160,.35)' : 'rgba(0,0,0,.3)'; g.fillRect(x, 150, 36, 84); sh(t, x + 6, 200); CHR.push([x, 150, 36, 84, () => { const k = cl_.indexOf(S.sel); camSel(cl_[((k < 0 ? 0 : k) + d + cl_.length) % cl_.length]) }, d > 0 ? 'next' : 'prev']) }
  cl_.forEach((i, k) => { const x = 16 + k * 40, y = 300; g.fillStyle = i === S.sel ? 'rgba(160,255,160,.6)' : zone && zone.cam === i ? 'rgba(200,40,40,.6)' : 'rgba(0,0,0,.45)'; g.fillRect(x, y, 34, 28); sh(String(i + 1), x + (i > 8 ? 3 : 11), y + 21, '#fff', 'bold 17px monospace'); CHR.push([x, y, 34, 28, () => camSel(i), 'cam' + (i + 1)]) });
  if (S.defense) { const bx_ = (x, y, w, t, fn, hot) => { g.fillStyle = hot ? 'rgba(220,200,80,.75)' : 'rgba(0,0,0,.55)'; g.fillRect(x, y, w, 28); g.strokeStyle = '#cfc'; g.strokeRect(x + .5, y + .5, w - 1, 27); sh(t, x + 8, y + 20, '#fff', 'bold 14px ' + TF); CHR.push([x, y, w, 28, fn, t]) };
    bx_(318, 260, 168, 'สปอตไลท์ (' + (OUTDOOR_CAM[S.sel] ? 'ใช้ได้' : 'ไม่มี') + ')', () => deter('spot'), EXT.spots[OUTDOOR_CAM[S.sel]] && EXT.spots[OUTDOOR_CAM[S.sel]].t > 0) }
  if (D.over === 2) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(D.cx2 - 9, D.cy2); g.lineTo(D.cx2 + 9, D.cy2); g.moveTo(D.cx2, D.cy2 - 9); g.lineTo(D.cx2, D.cy2 + 9); g.stroke() }
  OT.needsUpdate = true;
}
function camSel(i) { S.sel = i; if (D.qte && !D.qte.ok && D.qte.t > 0 && i === D.qte.cam) qteHit(); S.camSeen[i] = 1; tone(1200, .03, 'square', .08); VHS.uniforms.fl.value = 1; if (window.onCamSel) onCamSel(i) }

/* ---------- SOS: SafeHome emergency signal (three real steps; the last is a 3-second hold that beeps through the house) ---------- */
const SOSBTN = [0, 0, 0, 0];
function appSOS(g, X, Y, W, H, L, TOP, RW) { let y = TOP; g.font = FB; g.fillStyle = '#111';
  g.fillText('ที่อยู่: 1407 ถนนเมเปิลฮอลโลว์', L, y); y += 26; g.font = FS; g.fillStyle = S.power ? '#262' : '#8a4a00'; g.fillText(S.power ? 'สถานะ: ไฟฟ้าปกติ' : 'สถานะ: ไฟฟ้าดับ · ทำงานด้วยแบตเตอรี่สำรอง (UPS)', L, y); y += 30;
  if (S.sosSent) { g.fillStyle = '#1a6a2a'; g.fillRect(L, y, RW, 120); g.fillStyle = '#fff'; g.font = 'bold 26px ' + TF; g.fillText('✓ ส่งสัญญาณแล้ว ' + S.sosSent, L + 20, y + 48); g.font = FB; g.fillText('ตำรวจได้รับแจ้งเหตุ "ผู้บุกรุกในบ้าน" แล้ว และกำลังเดินทาง', L + 20, y + 84); return }
  const step = (n, t, ok, fn, en) => { g.fillStyle = ok ? '#1a6a2a' : en ? '#111' : '#999'; g.font = FB; g.fillText((ok ? '☑ ' : '☐ ') + n + '. ' + t, L, y + 20); if (en && !ok) btn(L + 430, y, 190, 30, 'ยืนยัน', fn); y += 46 };
  step(1, 'ยืนยันที่อยู่ที่จะส่งให้ตำรวจ', D.sosAddr, () => { D.sosAddr = 1; tone(700, .05, 'square', .06) }, 1);
  step(2, 'ประเภทเหตุ: ผู้บุกรุกอยู่ในบ้าน', D.sosType, () => { D.sosType = 1; tone(700, .05, 'square', .06) }, D.sosAddr);
  y += 10; const bx = L + 60, bw = RW - 120, bh = 92, en = D.sosAddr && D.sosType; SOSBTN.splice(0, 4, bx, y, bw, bh);
  g.fillStyle = en ? '#a01818' : '#8a8a8a'; g.fillRect(bx, y, bw, bh); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(bx, y + bh - 10, bw * (D.sosHold || 0), 10);
  g.fillStyle = '#fff'; g.font = 'bold 22px ' + TF; const t = en ? (D.sosHold > 0 ? 'กำลังส่ง... อย่าปล่อย' : 'กดค้างไว้ 3 วินาทีเพื่อส่งสัญญาณ') : 'ทำขั้นที่ 1 และ 2 ก่อน'; g.fillText(t, bx + (bw - g.measureText(t).width) / 2, y + 54);
  g.fillStyle = '#7a1a1a'; g.font = FS; wrap('คำเตือน: ระหว่างส่ง เครื่องจะส่งเสียงยืนยันออกลำโพง', L, y + bh + 30, RW, 20, FS); if (en) HR.push([bx, y, bw, bh, () => { }, 'sos:hold']) }
function compTick(dt) { if (!S.pc || D.app !== 'sos' || S.sosSent || !(D.sosAddr && D.sosType)) { if (D.sosHold && !S.sosSent) { D.sosHold = 0; D.dirty = 1 } return }
  const [x, y, w, h] = SOSBTN, on = D.mdown && D.over === 1 && D.cx >= x && D.cx < x + w && D.cy >= y && D.cy < y + h;
  if (on) { const was = D.sosHold || 0; D.sosHold = Math.min(1, was + dt / 3); if (Math.floor(was * 6) !== Math.floor(D.sosHold * 6)) { tone(1200, .07, 'square', .07); noise(DX, MZ, 1, .3) } D.dirty = 1; if (D.sosHold >= 1) sosSend() } else if (D.sosHold) { D.sosHold = Math.max(0, D.sosHold - dt * 2); D.dirty = 1 } }
/* ---------- photos rendered from the live scene (so evidence always shows the real house, at that moment) ---------- */
const PHOTO = {}; let PHRT = null;
function snapPhoto(key, pos, look, o = {}) { const W = 320, H = 240; if (!PHRT) PHRT = new T.WebGLRenderTarget(W, H); const c = new T.PerspectiveCamera(o.fov || 55, W / H, .1, 80); c.position.set(...pos); c.lookAt(...look); c.layers.enable(1); c.layers.enable(2); avatarTick(0);
  const fig = o.figure && GHOST, gPrev = GHOST && [GHOST.root.position.clone(), GHOST.root.rotation.y, GHOST.root.visible]; if (fig) { GHOST.root.position.set(...o.figure); GHOST.root.rotation.y = o.figYaw || 0; GHOST.root.visible = true }
  const fv = fl.intensity; fl.intensity = 0; const nv = NPC && NPC.root.visible; if (NPC) NPC.root.visible = false; lightBudget(c.position); if (o.cctv) irOn(true); ren.setRenderTarget(PHRT); ren.render(scene, c); if (o.cctv) irOn(false); const px = new Uint8Array(W * H * 4); ren.readRenderTargetPixels(PHRT, 0, 0, W, H, px); ren.setRenderTarget(null); fl.intensity = fv; if (NPC) NPC.root.visible = nv; if (fig) { GHOST.root.position.copy(gPrev[0]); GHOST.root.rotation.y = gPrev[1]; GHOST.root.visible = gPrev[2] }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), im = g.createImageData(W, H); const lut = new Uint8Array(256); for (let i = 0; i < 256; i++) lut[i] = Math.min(255, Math.pow(i / 255, 1 / 2.0) * 270);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((H - 1 - y) * W + x) * 4, d = (y * W + x) * 4, n = (Math.random() - .5) * 26; if (o.cctv) { const l = lut[(px[s] * .3 + px[s + 1] * .59 + px[s + 2] * .11) | 0]; im.data[d] = l * .55 + n; im.data[d + 1] = l + n; im.data[d + 2] = l * .55 + n } else { im.data[d] = lut[px[s]] + n; im.data[d + 1] = lut[px[s + 1]] + n; im.data[d + 2] = lut[px[s + 2]] * .9 + n } im.data[d + 3] = 255 }
  g.putImageData(im, 0, 0); g.font = 'bold 15px monospace'; g.fillStyle = o.cctv ? '#dfffdf' : '#ffb040';
  if (o.cctv) { g.fillText(o.cctv, 12, 24); g.fillText('00:03:12', 230, 228); } else g.fillText(o.time || fmt(), W - 70, H - 12);
  PHOTO[key] = cv; return cv }

/* ---------- CCTV quick-time events ----------
   While you sit at the computer and he moves into a different camera's view, an alert names the camera; switch to it
   within the time window to pin down where he is, then decide: lure him away with a sound elsewhere, or kill the lights
   in the room he is in (he searches slower in the dark). Miss it and you lose track of him. Fair timing, never random. */
const CAM_ROOM = { living: 1, kitchen: 2, hall1: 3, comp: 6, bedA: 10, hall0: 9 };
function camOfAI() { if (!AI.visible) return null; const z = motionZone(); if (z) return z.cam; if (AI.x > 5.5 && AI.x < 6.9 && AI.z > .3 && AI.z < 5.2 && (AI.l === 1 ? AI.z < 1.4 : AI.z > 3.4)) return 11; const r = roomAt(AI.l, AI.x, AI.z);
  if (AI.l === 0 && r === 'hall') return 9; if (AI.l === 1 && r === 'hall') return 3; const c = { living: 1, kitchen: 2, comp: 6, bedA: 10 }[r]; return c === 6 && !S.cam7 ? null : c ?? null }
function qteTick(dt) { const active = S.pc && pcOn() && (stIs('INTRUDER_APPROACHING') && S.apPh === 'lurk' || stIs('INTRUDER_SEARCHING', 'INTRUDER_DOWNSTAIRS', 'RETURN_TO_COMPUTER', 'EMERGENCY_SIGNAL', 'HIDE_SECOND_TIME'));
  const c = active ? camOfAI() : null; D.qteCd = Math.max(0, (D.qteCd || 0) - dt);
  if (D.qte) { const q = D.qte; if (!q.ok) { q.t -= dt; if (q.t <= 0 && !q.fail) { q.fail = 1; q.until = 2.5; S.qteMiss = (S.qteMiss || 0) + 1; tone(160, .3, 'sawtooth', .06); toast('พลาด... ไม่รู้แล้วว่าเขาไปไหน') } } else q.until -= dt; if (q.fail) q.until -= dt; if (q.until <= 0 || !active) { D.qte = null; D.qteCd = 6 } D.dirty = 1; $('#qte').style.display = D.qte && !D.qte.ok && !D.qte.fail && S.pcView !== 2 ? 'block' : 'none'; if (D.qte && !D.qte.ok) $('#qte b').textContent = 'CAM ' + (D.qte.cam + 1) + ' · ' + Math.max(0, D.qte.t).toFixed(1) + ' วิ'; return }
  $('#qte').style.display = 'none'; if (c === null || c === D.qteLast) { D.qteLast = c; return } D.qteLast = c; if (D.qteCd > 0 || S.sel === c) return;
  D.qte = { cam: c, t: S.sel === 11 || c === 11 ? 7 : 6, ok: 0, fail: 0, until: 9, room: roomAt(AI.l, AI.x, AI.z), l: AI.l }; S.qteN = (S.qteN || 0) + 1; for (let i = 0; i < 3; i++) tone(1400, .08, 'square', .08, i * .16); (window.DBGLOG || []).push('qte cam' + (c + 1)) }
function qteHit() { const q = D.qte; q.ok = 1; q.until = 9; S.qteHits = (S.qteHits || 0) + 1; tone(990, .08, 'triangle', .08); tone(1320, .12, 'triangle', .08, .1) }
const ROOM_TH = { living: 'ห้องนั่งเล่น', kitchen: 'ห้องครัว', hall: 'โถงทางเดิน', comp: 'ห้องคอมพิวเตอร์', bedA: 'ห้องนอนใหญ่', ext: 'นอกบ้าน', store: 'ห้องเก็บของ', bath: 'ห้องน้ำ', bedB: 'ห้องนอนเล็ก', bedC: 'ห้องหลังบ้าน' };
function qteDraw(g, sh, now) { const q = D.qte, bx = (x, y, w, t, fn, tag) => { g.fillStyle = 'rgba(30,30,10,.85)'; g.fillRect(x, y, w, 30); g.strokeStyle = '#ffd860'; g.strokeRect(x + .5, y + .5, w - 1, 29); sh(t, x + 8, y + 21, '#fff6c8', 'bold 14px ' + TF); CHR.push([x, y, w, 30, fn, tag]) };
  if (!q.ok && !q.fail) { if ((now / 300 | 0) % 2) { g.fillStyle = 'rgba(190,0,0,.85)'; g.fillRect(110, 18, 300, 30); sh('⚠ ตรวจพบความเคลื่อนไหว → CAM ' + (q.cam + 1), 120, 40, '#fff', 'bold 15px ' + TF) } g.fillStyle = 'rgba(255,80,60,.9)'; g.fillRect(110, 50, 300 * Math.max(0, q.t) / 6, 5); return }
  if (q.fail) { g.fillStyle = 'rgba(60,0,0,.8)'; g.fillRect(110, 18, 300, 30); sh('พลาด — ไม่รู้ตำแหน่งเขา', 120, 40, '#fbb', 'bold 15px ' + TF); return }
  g.fillStyle = 'rgba(0,70,0,.8)'; g.fillRect(96, 18, 330, 30); sh('ระบุตำแหน่งได้: ' + (q.l ? 'ชั้นบน · ' : 'ชั้นล่าง · ') + (ROOM_TH[q.room] || q.room || 'นอกบ้าน'), 104, 40, '#dfd', 'bold 15px ' + TF);
  if (q.acted) { sh(q.acted, 104, 76, '#ffe', 'bold 14px ' + TF); return } const inside = q.room && q.room !== 'ext' && AI.searchMode;
  if (inside) { bx(96, 58, 200, 'ส่งเสียงล่อไปห้องอื่น (' + (2 - (S.lures || 0)) + ')', () => qteLure(), 'qte:lure'); if (ROOMS[q.room] && ROOMS[q.room].on !== undefined) bx(304, 58, 122, 'ปิดไฟห้องนั้น', () => { ROOMS[q.room].on = false; lights && lights(); AI.wait = Math.max(AI.wait, 4); q.acted = 'ปิดไฟแล้ว เขาค้นช้าลงในความมืด'; tone(400, .05, 'square', .06) }, 'qte:dark') }
  else if (OUTDOOR_CAM[q.cam]) bx(96, 58, 200, 'เปิดสปอตไลท์ใส่เขา', () => { camSel(q.cam); deter('spot'); q.acted = 'เปิดสปอตไลท์แล้ว' }, 'qte:spot') }
function qteLure() { const q = D.qte; if ((S.lures || 0) >= 2) { toast('ลำโพงล่อเสียงหมดแล้ว'); return } S.lures = (S.lures || 0) + 1; const far = AI.l === 1 ? [9.0, 7.6, 0] : (AI.z < 4 ? [2.7, 6.5, 0] : [3.9, 2.0, 0]); // a sound downstairs, away from where he is
  soundAt(far[0], FY[far[2]] + 1, far[1], 'knock', 1.4); AI.lastHeard = null; aiSet('INVESTIGATING_SOUND'); aiGo(navNearest(far[0], far[1], far[2]), 1.5, () => aiSet('CHECKING_ROOM', { wait: 5 })); q.acted = 'ส่งเสียงล่อแล้ว — เขากำลังไปดูอีกที่'; tone(700, .05, 'square', .06) }

/* ---------- Windows 11 style chrome: rounded rects, app tiles, caption buttons, centred taskbar with tray ---------- */
function rr8(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() }
const APPC = { mail: ['#0f6cbd', '#2b88d8', '✉'], cases: ['#5b2dbd', '#8a5cf0', '★'], files: ['#d9a400', '#ffc83d', '▤'], search: ['#2a2a2a', '#4a4a4a', '⌕'], trace: ['#0b7a5a', '#14b07f', '⌖'], evid: ['#b83a1e', '#e86a3e', '▣'], sos: ['#b4141e', '#e8333d', '!'], sys: ['#0f6cbd', '#2b88d8', 'i'] };
function appIcon(g, id, ic, x, y, s) { const c = APPC[id] || APPC.sys, gr = g.createLinearGradient(x, y, x + s, y + s); gr.addColorStop(0, c[1]); gr.addColorStop(1, c[0]); g.fillStyle = gr; rr8(g, x, y, s, s, s * .22); g.fill(); g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(s * .58) + 'px ' + TF; const t = c[2], tw = g.measureText(t).width; g.fillText(t, x + (s - tw) / 2, y + s * .72) }
function winCaption(g, R, Y) { const b = [['—', () => { D.app = null; D.inp = null }, 'min'], ['▢', () => { }, 'max'], ['✕', () => { D.app = null; D.inp = null }, 'X']];
  b.forEach(([t, f, tag], i) => { const x = R - 46 * (3 - i), o = D.over === 1 && D.cx >= x && D.cx < x + 46 && D.cy >= Y && D.cy < Y + 30; if (o) { g.fillStyle = tag === 'X' ? '#c42b1c' : 'rgba(0,0,0,.07)'; g.fillRect(x, Y + 1, 46, 30) } g.fillStyle = o && tag === 'X' ? '#fff' : '#1b1b1b'; g.font = '14px ' + TF; g.fillText(t, x + 17, Y + 21); HR.push([x, Y, 46, 30, f, tag]) }) }
function taskbar(g, icons) { const y = 556; g.fillStyle = 'rgba(28,30,38,.92)'; g.fillRect(0, y, 800, 44); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, y, 800, 1);
  const n = icons.length + 2, x0 = 400 - n * 21; let x = x0;
  { const o = D.over === 1 && D.cx >= x && D.cx < x + 38 && D.cy >= y; if (o) { g.fillStyle = 'rgba(255,255,255,.1)'; rr8(g, x + 2, y + 4, 36, 36, 5); g.fill() } g.fillStyle = '#3aa0ff'; for (const [dx, dy] of [[0, 0], [10, 0], [0, 10], [10, 10]]) g.fillRect(x + 10 + dx, y + 12 + dy, 9, 9); x += 42 } // start
  g.fillStyle = 'rgba(255,255,255,.1)'; rr8(g, x + 2, y + 9, 36, 26, 13); g.fill(); g.fillStyle = '#ddd'; g.font = '15px ' + TF; g.fillText('⌕', x + 13, y + 28); HR.push([x, y, 40, 44, () => { D.app = 'search'; D.inp = 'q' }, 'tb:search']); x += 42;
  icons.forEach(([nm, id]) => { const on = D.app === id, o = D.over === 1 && D.cx >= x && D.cx < x + 40 && D.cy >= y; if (on || o) { g.fillStyle = on ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.08)'; rr8(g, x + 2, y + 4, 36, 36, 5); g.fill() } appIcon(g, id, '', x + 9, y + 11, 22); if (on) { g.fillStyle = '#4cc2ff'; rr8(g, x + 13, y + 39, 14, 3, 1.5); g.fill() }
    HR.push([x, y, 40, 44, () => { D.app = id; D.mail = null; D.doc = null; D.hdr = false; D.inp = id === 'search' ? 'q' : id === 'trace' ? 'ip' : null; D.rep = 0; D.cs = null; D.sub = null }, 'tb:' + id]); x += 42 });
  // tray: chevron, network, volume, battery (UPS when the power is out), clock + date
  g.fillStyle = '#ddd'; g.font = '13px ' + TF; g.fillText('˄', 590, y + 27); g.fillText('📶', 612, y + 27); g.fillText('🔊', 636, y + 27);
  const ups = !S.power; g.strokeStyle = '#ddd'; g.strokeRect(662.5, y + 16.5, 18, 10); g.fillRect(681, y + 19, 2, 5); g.fillStyle = ups ? '#ffb43a' : '#ddd'; g.fillRect(664, y + 18, ups ? 9 : 15, 7);
  g.fillStyle = '#fff'; g.font = '12px ' + TF; const tm = fmt(); g.fillText(tm, 770 - g.measureText(tm).width, y + 20); const dt = '13/11/2569'; g.fillText(dt, 770 - g.measureText(dt).width, y + 36) }
