/* ---------- phone: real message threads with history, notifications, unread badges and quick replies ----------
   [P] opens/closes · W/S (↑/↓) choose a chat · E/Enter open · Q/Backspace back · 1/2 quick reply · wheel scrolls.
   Pointer lock is kept the whole time, so closing the phone gives control straight back. */
const THREADS = [
  { id: 'richard', name: 'ริชาร์ด (ผู้ว่าจ้าง)', av: '#8a6a4a', ini: 'R' },
  { id: 'marta', name: 'มาร์ธา · หัวหน้า Halden', av: '#4a6a8a', ini: 'M' },
  { id: 'mom', name: 'แม่', av: '#a05a6a', ini: 'แม่' },
  { id: 'jake', name: 'เจค', av: '#5a8a5a', ini: 'J' },
  { id: 'unknown', name: '+1 (555) 014-0412', av: '#3a3a3a', ini: '?' }];
const PH = { open: 0, sel: 0, thread: null, scroll: 0, replies: {} };
function phoneInit() { if (S.msgs) return; S.msgs = {}; S.unread = {}; THREADS.forEach(t => { S.msgs[t.id] = []; S.unread[t.id] = 0 });
  const H = (id, from, t, time) => S.msgs[id].push({ from, t, time, old: 1 });
  H('richard', 'them', 'สวัสดีครับ ผมริชาร์ด โอคาฟอร์ ได้เบอร์มาจากมาร์ธา', 'เมื่อวาน 18:02'); H('richard', 'them', 'คืนพรุ่งนี้ผมต้องบินไปชิคาโก อยากได้คนมาอยู่บ้านและทำงานในคอมผมจนถึงเช้า สะดวกไหมครับ', 'เมื่อวาน 18:03');
  H('richard', 'me', 'สะดวกครับ น่าจะถึงราว ๆ เที่ยงคืน', 'เมื่อวาน 18:20'); H('richard', 'them', 'เยี่ยมเลย เดี๋ยวผมโทรหาตอนคุณถึงนะ ค่าจ้างโอนให้ตอนเช้า 👍', 'เมื่อวาน 18:21');
  H('marta', 'them', 'คืนนี้มีคิวตรวจ 3 เคส ลูกค้าคือคุณริชาร์ด ใช้คอมที่บ้านเขาได้เลย ระบบเราลงไว้ให้แล้ว', '20:41'); H('marta', 'me', 'รับทราบครับ', '20:44'); H('marta', 'them', 'อ้อ ถ้าเจออะไรแปลก ๆ ในเคส จดไว้ในกระดานหลักฐานนะ', '20:45');
  H('jake', 'them', 'คืนนี้ออนเกมไหม', '21:10'); H('jake', 'me', 'ไม่ได้ว่ะ รับงานกะดึก', '21:32');
  H('mom', 'them', 'ขับรถดี ๆ นะลูก', '23:31') /* the rest of the Mom/Jake conversation happens live in the car (intro.js CHAT_SEQ) */ }
/* push a message into a thread (from story beats). quick: [[label, replyText, followUp?]] */
function msgPush(id, text, quick, silent) { phoneInit(); const th = THREADS.find(t => t.id === id); S.msgs[id].push({ from: 'them', t: text, time: fmt() }); if (quick) PH.replies[id] = quick;
  if (!(PH.open && PH.thread === id)) S.unread[id] = (S.unread[id] || 0) + 1; if (silent) return phoneHud();
  notify(th, text, id); phoneHud(); (window.DBGLOG || []).push('msg ' + id) }
/* Windows/phone-style notification toasts: right edge, avatar, sender, 2-line preview, time; slide in, stack (max 3), short chime.
   Click a toast (or press [P]) to open that conversation. */
function notify(th, text, threadId) { const box = $('#ntf'); if (!box) return; const t = document.createElement('div'); t.className = 'nt';
  t.innerHTML = `<i style="background:${th.av}">${th.ini}</i><div><b></b><p></p><small>${fmt()} · [P] เปิดอ่าน</small></div>`; t.querySelector('b').textContent = th.name; t.querySelector('p').textContent = text;
  t.onclick = () => { if (S.paused && S.mode === 'play') { pause(false); lock() } /* mouse was free: the game was paused; resume and open */ if (S.ui) return; phoneOpen(); if (threadId) { PH.thread = threadId; S.unread[threadId] = 0; phoneDraw() } }; box.prepend(t); while (box.children.length > 3) box.lastChild.remove();
  requestAnimationFrame(() => t.classList.add('in')); tone(988, .06, 'sine', .07); tone(1319, .1, 'sine', .06, .08); setTimeout(() => { t.classList.remove('in'); t.classList.add('out'); setTimeout(() => t.remove(), 450) }, 8000) }
function phoneHud() { const n = Object.values(S.unread || {}).reduce((a, b) => a + b, 0); const e = $('#phb'); if (!e) return; e.style.display = S.mode === 'play' ? 'block' : 'none'; e.innerHTML = '📱 [P]' + (n ? ' <b>' + n + '</b>' : '') }
function phoneOpen() { if (S.ui || S.mode !== 'play') return; phoneInit(); PH.open = 1; PH.thread = null; S.ui = 'phone'; for (const k in keys) keys[k] = 0; $('#ntf').innerHTML = ''; tone(900, .03, 'square', .03); phoneDraw(); $('#phone').style.display = 'flex' }
function phoneClose() { if (S.ui !== 'phone') return; PH.open = 0; S.ui = null; $('#phone').style.display = 'none'; for (const k in keys) keys[k] = 0; phoneHud(); if (!locked && !S.noLock && S.mode === 'play') pause(true) }
function esc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) }
function phoneDraw() { const el = $('#phone .ps'); let h = '<div class="pt">' + fmt() + '<span>▂▄▆ ' + (S.power === false && !S.ups ? '' : '') + '78%</span></div>';
  if (!PH.thread) { h += '<div class="ph">ข้อความ</div>'; THREADS.forEach((t, i) => { const m = S.msgs[t.id], last = m[m.length - 1]; if (!m.length) return;
      h += `<div class="pr${i === PH.sel ? ' on' : ''}"><i style="background:${t.av}">${t.ini}</i><div><b>${esc(t.name)}</b><small>${last.from === 'me' ? 'คุณ: ' : ''}${esc(last.t.slice(0, 34))}${last.t.length > 34 ? '…' : ''}</small></div><em>${last.time.replace('เมื่อวาน ', '')}</em>${S.unread[t.id] ? '<u>' + S.unread[t.id] + '</u>' : ''}</div>` });
    h += '<div class="pk">W/S เลือก · E เปิด · P ปิด</div>' }
  else { const t = THREADS.find(x => x.id === PH.thread); h += `<div class="ph2">‹ ${esc(t.name)}</div><div class="pm">`; let lastDay = '';
    for (const m of S.msgs[t.id]) { const day = m.time.startsWith('เมื่อวาน') ? 'เมื่อวาน' : 'วันนี้'; if (day !== lastDay) { h += `<div class="pd">${day}</div>`; lastDay = day } h += `<div class="b ${m.from}">${m.img ? '<img src="' + m.img + '">' : ''}${esc(m.t)}<small>${m.time.replace('เมื่อวาน ', '')}</small></div>` }
    h += '</div>'; const q = PH.replies[t.id]; h += q ? '<div class="pq">' + q.map((r, i) => `<span>[${i + 1}] ${esc(r[0])}</span>`).join('') + '</div>' : '<div class="pk">Q ย้อนกลับ · ล้อเมาส์ เลื่อน · P ปิด</div>' }
  el.innerHTML = h; const pm = el.querySelector('.pm'); if (pm) pm.scrollTop = pm.scrollHeight - PH.scroll }
function phoneKey(e) { if (e.code === 'KeyP' || e.code === 'Escape') { phoneClose(); return } const vis = THREADS.filter(t => S.msgs[t.id].length);
  if (!PH.thread) { if (e.code === 'KeyW' || e.code === 'ArrowUp') PH.sel = (PH.sel + THREADS.length - 1) % THREADS.length; if (e.code === 'KeyS' || e.code === 'ArrowDown') PH.sel = (PH.sel + 1) % THREADS.length;
    while (!S.msgs[THREADS[PH.sel].id].length) PH.sel = (PH.sel + 1) % THREADS.length;
    if (e.code === 'KeyE' || e.code === 'Enter') { PH.thread = THREADS[PH.sel].id; S.unread[PH.thread] = 0; PH.scroll = 0; tone(700, .03, 'square', .03) } }
  else { if (e.code === 'KeyQ' || e.code === 'Backspace') PH.thread = null; const q = PH.replies[PH.thread], n = +e.code.replace('Digit', '');
    if (q && n >= 1 && n <= q.length) { const r = q[n - 1]; delete PH.replies[PH.thread]; S.msgs[PH.thread].push({ from: 'me', t: r[1], time: fmt(), img: r[4] ? r[4]() : undefined }); tone(1100, .04, 'sine', .04); const th = PH.thread; if (r[2]) after(r[2][0], () => msgPush(th, r[2][1], r[2][2])); if (r[3]) r[3]() } }
  phoneDraw() }
addEventListener('wheel', e => { if (S.ui !== 'phone' || !PH.thread) return; PH.scroll = Math.max(0, PH.scroll + (e.deltaY < 0 ? 60 : -60)); phoneDraw() }, { passive: true });

/* a message with a picture (the stalker's photos) */
function msgImg(id, text, img) { msgPush(id, text); const m = S.msgs[id]; m[m.length - 1].img = img; if (S.ui === 'phone') phoneDraw() }
