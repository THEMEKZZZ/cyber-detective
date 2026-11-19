/* ---------- procedural sound design (all sounds synthesized in WebAudio: original, no licensing needed) ---------- */
let AC, MG, AMB, SFX, NOISEBUF; const AUD = { hums: [], tension: null, tensionG: null, fan: null, fridge: null, breath: null, ok: false };
function initAudio() {
  if (AC) return; try {
    AC = new (window.AudioContext || window.webkitAudioContext)(); MG = AC.createGain(); MG.gain.value = OPT.vol / 100; MG.connect(AC.destination); AMB = AC.createGain(); AMB.connect(MG); SFX = AC.createGain(); SFX.connect(MG);
    const L = AC.sampleRate * 2; NOISEBUF = AC.createBuffer(1, L, AC.sampleRate); const d = NOISEBUF.getChannelData(0); for (let i = 0; i < L; i++) d[i] = Math.random() * 2 - 1;
    const loopN = (type, f, q, g, dest = AMB) => { const s = AC.createBufferSource(); s.buffer = NOISEBUF; s.loop = true; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const gn = AC.createGain(); gn.gain.value = g; s.connect(fl); fl.connect(gn); gn.connect(dest); s.start(); return gn };
    const osc = (f, g, type = 'sine', dest = AMB) => { const o = AC.createOscillator(); o.type = type; o.frequency.value = f; const gn = AC.createGain(); gn.gain.value = g; o.connect(gn); gn.connect(dest); o.start(); return gn };
    // room tone + wind with slow gusts
    loopN('lowpass', 220, .5, .035); const wind = loopN('bandpass', 380, .6, .0); const lfo = AC.createOscillator(); lfo.frequency.value = .07; const lg = AC.createGain(); lg.gain.value = .02; lfo.connect(lg); lg.connect(wind.gain); wind.gain.value = .025; lfo.start();
    // electrical: AC unit + mains hum (stop on blackout)
    AUD.hums.push(osc(60, .012), osc(120, .006), loopN('bandpass', 700, 1.2, .012));
    // spatial: fridge, computer fan, breaker hum
    AUD.fridge = spatialLoop(HW - .5, .9, 6.4, () => { const g = AC.createGain(); g.gain.value = .07; const o = AC.createOscillator(); o.frequency.value = 100; o.connect(g); o.start(); const n = AC.createBufferSource(); n.buffer = NOISEBUF; n.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 300; const g2 = AC.createGain(); g2.gain.value = .5; n.connect(f); f.connect(g2); g2.connect(g); n.start(); return g });
    AUD.fan = spatialLoop(2.3, FY[1] + .3, 6.2, () => { const n = AC.createBufferSource(); n.buffer = NOISEBUF; n.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 650; f.Q.value = .8; const g = AC.createGain(); g.gain.value = .03; /* PC/CCTV fan: was a loud 1.8 kHz hiss */ n.connect(f); f.connect(g); n.start(); return g });
    AUD.panel = spatialLoop(p(4.2) - .2, 1.4, 2.08, () => { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180; const g = AC.createGain(); g.gain.value = .05; o.connect(f); f.connect(g); o.start(); return g });
    // tension drone (director-controlled)
    AUD.tensionG = AC.createGain(); AUD.tensionG.gain.value = 0; AUD.tensionG.connect(MG); for (const [f, t] of [[41, 'sine'], [43.5, 'sine'], [82, 'triangle']]) { const o = AC.createOscillator(); o.type = t; o.frequency.value = f; const g = AC.createGain(); g.gain.value = t === 'sine' ? .5 : .12; o.connect(g); g.connect(AUD.tensionG); o.start() }
    AUD.ok = true; setInterval(ambientEvents, 1000);
  } catch (e) { console.warn('audio', e) }
}
function spatialLoop(x, y, z, make) { const pn = AC.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 1; pn.rolloffFactor = 1.6; pn.positionX.value = x; pn.positionY.value = y; pn.positionZ.value = z; const g = AC.createGain(); make().connect(g); g.connect(pn); pn.connect(AMB); return g }
function audioTick(dt) { if (!AUD.ok) return; const l = AC.listener, fw = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion), up = new T.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  if (l.positionX) { l.positionX.value = cam.position.x; l.positionY.value = cam.position.y; l.positionZ.value = cam.position.z; l.forwardX.value = fw.x; l.forwardY.value = fw.y; l.forwardZ.value = fw.z; l.upX.value = up.x; l.upY.value = up.y; l.upZ.value = up.z } else { l.setPosition(cam.position.x, cam.position.y, cam.position.z); l.setOrientation(fw.x, fw.y, fw.z, up.x, up.y, up.z) }
  const pw = S.power ? 1 : 0, sm = (g, v) => g.gain.setTargetAtTime(v, AC.currentTime, .4); for (const h of AUD.hums) sm(h, pw * (h._v ?? (h._v = h.gain.value))); sm(AUD.fridge, pw); sm(AUD.fan, pw); sm(AUD.panel, pw);
  // ducking: ordinary ambience dips as the intruder gets close; drone rises with director tension
  const near = AI.visible ? cl(1 - Math.hypot(AI.x - P.x, AI.z - P.z) / 14, 0, 1) : 0; sm(AMB, 1 - near * .7 - (S.silence ? .85 : 0)); sm(AUD.tensionG, (S.tension || 0) * .09 * (S.silence ? 0 : 1));
  // clock ticks near clocks
  AUD.tk = (AUD.tk || 0) + dt; if (AUD.tk > 1) { AUD.tk = 0; let dmin = 99; for (const c of CLOCKS) { const v = new T.Vector3(); c.hh.getWorldPosition(v); dmin = Math.min(dmin, v.distanceTo(cam.position)) } if (dmin < 6) tone(2400, .015, 'square', .05 * (1 - dmin / 6)) } }
function ambientEvents() { if (S.mode !== 'play' || !AUD.ok) return; const r = Math.random();
  if (S.chapter <= 3 && r < .02) dogBark(); else if (S.chapter <= 3 && r < .035) carPass(); else if (r < .06 && S.power) { tone(rr(70, 110), rr(.3, .6), 'triangle', .04) } // house settling
}
function burst(f0, f1, dur, vol, type = 'bandpass', q = 1, dest, when = 0) { if (!AC) return; const s = AC.createBufferSource(); s.buffer = NOISEBUF; const fl = AC.createBiquadFilter(); fl.type = type; fl.Q.value = q; const t = AC.currentTime + when; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur); s.connect(fl); fl.connect(g); g.connect(dest || SFX); s.start(t, rr(0, 1)); s.stop(t + dur + .05) }
function tone(f, d, ty = 'sine', v = .2, w = 0, dest) { if (!AC) return; const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + w; o.type = ty; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(dest || SFX); o.start(t); o.stop(t + d + .05) }
function sweep(f0, f1, d, ty = 'sawtooth', v = .2, w = 0) { if (!AC) return; const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + w; o.type = ty; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(SFX); o.start(t); o.stop(t + d + .05) }
function soundAt(x, y, z, kind, vol = 1) { if (!AC) return; const pn = AC.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = 1.2; pn.rolloffFactor = 1.3; pn.positionX.value = x; pn.positionY.value = y; pn.positionZ.value = z; pn.connect(SFX);
  if (kind === 'step') burst(rr(500, 700), 90, .12, .5 * vol, 'lowpass', 1, pn);
  if (kind === 'stair') { burst(320, 70, .16, .7 * vol, 'lowpass', 2, pn); if (Math.random() < .35) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; const t = AC.currentTime; o.frequency.setValueAtTime(rr(160, 240), t); o.frequency.linearRampToValueAtTime(rr(110, 150), t + .3); g.gain.setValueAtTime(.12 * vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); o.connect(g); g.connect(pn); o.start(); o.stop(t + .4) } }
  if (kind === 'creak') { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime; o.type = 'sawtooth'; o.frequency.setValueAtTime(130, t); o.frequency.linearRampToValueAtTime(85, t + .5); const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 4; g.gain.setValueAtTime(.25 * vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(f); f.connect(g); g.connect(pn); o.start(); o.stop(t + .65) }
  if (kind === 'knock') for (let i = 0; i < 3; i++) burst(400, 80, .1, .9, 'lowpass', 2, pn, i * .28);
  if (kind === 'pick') for (let i = 0; i < 6; i++) burst(3500, 2000, .03, .25, 'bandpass', 6, pn, i * rr(.15, .4));
  if (kind === 'drag') burst(200, 120, 1.0, .4, 'lowpass', 1, pn);
}
function stepAt(x, y, z, vol, stairs) { soundAt(x, y, z, stairs ? 'stair' : 'step', vol * 1.4) }
/* one-shots */
const creak = () => { tone(130, .3, 'triangle', .22); tone(95, .35, 'triangle', .18, .12) }, rattle = () => { for (let i = 0; i < 4; i++) tone(90 + i * 7, .06, 'square', .12, i * .07) };
const sting = () => { tone(58, 1.6, 'sawtooth', .22); tone(61.5, 1.6, 'sawtooth', .18); burst(3000, 300, 1.2, .25, 'bandpass', 2) };
function stepSound(kind, run) { const v = run ? .16 : .1; if (kind === 'stair') { burst(300, 80, .14, v * 2.2, 'lowpass', 2); if (Math.random() < .3) sweep(rr(170, 230), rr(110, 140), .3, 'triangle', .05) } else if (kind === 'out') burst(1200, 400, .09, v * 1.2, 'highpass', .7); else if (kind === 'hard') burst(900, 200, .07, v * 1.6, 'bandpass', 1.5); else { burst(500, 90, .1, v * 1.8, 'lowpass', 1); if (Math.random() < .06) sweep(rr(140, 200), rr(90, 120), .45, 'triangle', .05) } }
const SND = {
  fridgeOpen: () => { burst(200, 60, .25, .4, 'lowpass'); burst(2500, 1500, .4, .05, 'bandpass', 2, null, .05) }, fridgeClose: () => burst(160, 50, .2, .6, 'lowpass'),
  wrap: () => { for (let i = 0; i < 7; i++) burst(rr(3000, 6000), 1500, .07, .12, 'highpass', .7, null, i * .06) }, mwDoor: () => { tone(900, .03, 'square', .06); burst(800, 200, .12, .3, 'lowpass') },
  mwBtn: () => tone(2000, .06, 'square', .08), mwBeep: () => { for (let i = 0; i < 3; i++) tone(2100, .18, 'square', .12, i * .35) }, plate: () => { tone(3200, .2, 'sine', .08); tone(4100, .15, 'sine', .05, .02) },
  chew: () => { for (let i = 0; i < 5; i++) burst(rr(600, 1400), 300, .08, .2, 'bandpass', 2, null, i * .22) }, zap: () => { burst(6000, 800, .18, .35, 'highpass', .5); tone(120, .2, 'sawtooth', .1) }, buzz: () => tone(110, .35, 'square', .12),
  lever: () => { burst(300, 80, .15, .8, 'lowpass', 1); tone(60, .3, 'square', .1, .05) }, powerDown: () => { sweep(180, 30, 1.6, 'sawtooth', .25); burst(4000, 200, .4, .3, 'bandpass', 1); burst(200, 40, 1.5, .4, 'lowpass') }, powerUp: () => { sweep(40, 180, 1.2, 'sawtooth', .18); tone(60, 1.5, 'sine', .1, .3) },
  siren: () => { for (let i = 0; i < 8; i++) sweep(i % 2 ? 1400 : 700, i % 2 ? 700 : 1400, .5, 'square', .18, i * .5) }, cloth: () => burst(1800, 600, .3, .18, 'bandpass', .6), police: () => { for (let i = 0; i < 10; i++) sweep(i % 2 ? 900 : 600, i % 2 ? 600 : 900, .45, 'triangle', .06, i * .45) },
  boom: () => { burst(150, 30, 1.4, 1, 'lowpass', 1); tone(45, 1.2, 'sine', .4) },
};
function dogBark() { const x = rr(-30, 40), z = rr(25, 45); for (let i = 0; i < (Math.random() * 3 | 0) + 1; i++) { soundAt(x, 1, z, 'knock', .0001); burst(rr(700, 900), 300, .12, .12, 'bandpass', 4, null, i * .35) } }
function carPass() { burst(300, 900, 2.2, .05, 'bandpass', 1); burst(900, 250, 2.2, .05, 'bandpass', 1, null, 2.2) }
/* breathing loop while hidden (volume follows the noise level) */
function breathTick(dt) { if (!AUD.ok) return; AUD.bt = (AUD.bt || 0) + dt; const rate = S.holdBreath ? 9 : 3.4; if (S.hidden && AUD.bt > rate / 2) { AUD.bt = 0; AUD.inh = !AUD.inh; burst(AUD.inh ? 900 : 600, AUD.inh ? 1400 : 400, rate / 2 * .8, S.holdBreath ? .01 : .05 + (S.noiseLvl || 0) * .08, 'bandpass', .8) } }
/* ---------- continuous positional sounds: appliances and the night outside (distance + direction follow the listener) ---------- */
const LOOPS = { list: [], ok: 0 };
function loopAt(x, y, z, kind) { const pn = AC.createPanner(); pn.panningModel = 'HRTF'; pn.distanceModel = 'inverse'; pn.refDistance = kind === 'night' ? 3 : .7; pn.rolloffFactor = kind === 'night' ? 1 : 1.8; pn.positionX.value = x; pn.positionY.value = y; pn.positionZ.value = z; const g = AC.createGain(); g.gain.value = 0; g.connect(pn); pn.connect(SFX);
  if (kind === 'fridge' || kind === 'mw') { const o = AC.createOscillator(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = kind === 'mw' ? 120 : 58; f.type = 'lowpass'; f.frequency.value = kind === 'mw' ? 420 : 160; o.connect(f); f.connect(g); o.start() }
  if (kind === 'fan' || kind === 'mw') { const s = AC.createBufferSource(); s.buffer = NOISEBUF; s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kind === 'mw' ? 900 : 380; f.Q.value = .8; const k = AC.createGain(); k.gain.value = kind === 'mw' ? .5 : .3; s.connect(f); f.connect(k); k.connect(g); s.start() }
  if (kind === 'night') { const o = AC.createOscillator(); o.frequency.value = 4100 + Math.random() * 500; const am = AC.createGain(); am.gain.value = 0; const lfo = AC.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 28; const lg = AC.createGain(); lg.gain.value = .5; lfo.connect(lg); lg.connect(am.gain); const slow = AC.createOscillator(); slow.frequency.value = .35 + Math.random() * .3; const sg = AC.createGain(); sg.gain.value = .5; slow.connect(sg); sg.connect(am.gain); o.connect(am); am.connect(g); o.start(); lfo.start(); slow.start() }
  const L = { g, kind, x, z }; LOOPS.list.push(L); return L }
function loopsTick() { if (!AC || !AUD.ok) return; if (!LOOPS.ok) { LOOPS.ok = 1; loopAt(11.6, 1, 6.4, 'fridge'); loopAt(2.3, FY[1] + .3, 6.2, 'fan'); LOOPS.mw = loopAt(9.9, 1.05, HD - .4, 'mw'); for (const [x, z] of [[6, -9], [-5, 13], [18, 7], [8, 27], [-12, -3]]) loopAt(x, .3, z, 'night') }
  const inside = P.x > 0 && P.x < HW && P.z > 0 && P.z < HD, t = AC.currentTime;
  for (const L of LOOPS.list) { const v = L.kind === 'fridge' ? (S.power ? .045 : 0) : L.kind === 'fan' ? (S.power || S.ups ? .02 : 0) : L.kind === 'mw' ? (S.pz === 5 && S.power ? .07 : 0) : (S.mode === 'menu' ? 0 : inside ? .012 : .035); L.g.gain.setTargetAtTime(S.mode === 'play' || S.mode === 'intro' ? v : 0, t, .4) } }
