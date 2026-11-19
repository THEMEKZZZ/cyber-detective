/* ---------- interior layout, room by room (coordinates in metres, 13 x 9.75 m plan) ---------- */
const F = (g, x, z, ry, l, w, d, y = 0) => furn(g, x, FY[l] + y, z, ry, l, w, d);
const WOOD_DK = 0x6a4a30, WOOD_MD = 0x9a7048;
function curtains(l, filter, mat) { for (const w of WINDOWS) { if (w.l !== l || !filter(w)) continue; const H = w.top - FY[l] - w.s + .45, y = w.top + .12 - H / 2, inward = w.x < .5 ? 1 : w.x > HW - .5 ? -1 : w.z < .5 ? 1 : -1, off = .13 * inward;
  for (const s of [-1, 1]) { const m = new T.Mesh(curtainGeo(.42, H), mat); m.castShadow = true; if (w.alongZ) { m.position.set(w.x + off, y, w.z + s * (w.W / 2 + .1)); m.rotation.y = Math.PI / 2 } else { m.position.set(w.x + s * (w.W / 2 + .1), y, w.z + off) } scene.add(m) }
  const r = w.alongZ ? bx(w.x + off, w.top + .16, w.z, .025, .025, w.W + .7, MAT.brass, false) : bx(w.x, w.top + .16, w.z + off, w.W + .7, .025, .025, MAT.brass, false) } }
function furnishAll() {
  const U = 1, L0 = 0, PI = Math.PI;
  /* ===== LIVING ROOM (x 0-6.9, z 3.4-9.75) ===== */
  place('sideboard', { x: 1.55, z: 3.69, l: L0, s: .75, tint: { '*': 0x4a3020 }, cw: 1.83, cd: .42 });
  { const tv = crtTV(); F(tv, 1.45, 3.7, 0, L0, 0, 0, .51); TVSCR = tv.userData.sc }
  place('sofa_wood_leather', { x: 1.6, z: 7.45, ry: PI, l: L0, s: .86, cw: 2.3, cd: .85 });
  F(coffeeTable(), 1.6, 5.85, 0, L0, 1.1, .6); rug(1.6, 5.9, 2.8, 1.9, L0, rugTex('#5a2a22', '#a8804a', '#2a3a4a'));
  place('armchair-lounge', { x: 3.55, z: 5.55, ry: -2.25, l: L0, h: 1.0, tint: { modern_arm_chair_01_pillow: 0x3e4028, modern_arm_chair_01_legs: WOOD_DK }, cw: .85, cd: .85 });
  place('ottoman', { x: 4.25, z: 7.1, ry: .4, l: L0, h: .44, cw: .75, cd: .55 });
  F(lampFloor(), .38, 8.0, 0, L0, .3, .3); F(table(.45, .45, .58, MAT.wood), 3.15, 7.65, 0, L0, .45, .45); F(lampTable(1, .45), 3.15, 7.65, 0, L0, 0, 0, .58);
  F(bookshelf(1.3, 1.9, .34), .26, 4.55, PI / 2, L0, 1.3, .34);
  place('plant-large', { x: .45, z: 9.25, l: L0, h: 1.25, tint: { potted_plant_01_pot: 0x9a5a3a }, cw: .5, cd: .5 });
  { const c = clock(.17); F(c, 1.55, 3.48, 0, L0, 0, 0, 2.05) }
  for (const [z, w, h, k] of [[6.7, .45, .55, 'photo'], [7.5, .35, .45, 'photo'], [8.3, .6, .45, 'paint']]) F(frame(w, h, k), p(5.3) - .09, z, -PI / 2, L0, 0, 0, 1.65);
  F(frame(.8, .55, 'paint'), .1, 4.55, PI / 2, L0, 0, 0, 2.25);
  // entry: coat rack, shoes, mat
  { const g = G(); P3(g, Lathe([[0, 0], [.18, 0], [.18, .03], [.03, .05], [.025, 1.75], [0, 1.8]], 10), MAT.wood); for (let i = 0; i < 4; i++) { const a = i * PI / 2; P3(g, Cy(.01, .16, 6), MAT.wood, Math.sin(a) * .07, 1.65, Math.cos(a) * .07, Math.cos(a) * .7, 0, -Math.sin(a) * .7) } P3(g, cloth(.4, .02, .9, .02, 6, 10), MC(0x3a3a30, 1), .12, 1.2, 0, 0, 0, 1.4); F(g, 4.9, 9.4, 0, L0, .35, .35) }
  rug(3.7, 9.3, 1.1, .6, L0, tex(32, (g, w) => { g.fillStyle = '#4a3a28'; g.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 3) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i, 0, 1, w) } }));
  for (const [x, z, r] of [[3.35, 9.2, .2], [3.55, 9.25, .1], [4.15, 9.15, -.3]]) { const sh = G(); P3(sh, RG(.1, .27, .07, .04), MC(0x2a1e16, .4), 0, .04, 0, PI / 2); P3(sh, RG(.1, .12, .06, .04), MC(0x2a1e16, .4), 0, .09, -.07, PI / 2 - .3); F(sh, x, z, r, L0) }
  curtains(L0, w => roomAt(0, w.x + (w.alongZ ? .3 : 0), w.z - (w.alongZ ? 0 : .3)) === 'living' || (w.alongZ && w.x < 1 && w.z > p(2.6)), M(fabric('#5a2622'), 1, { side: T.DoubleSide }));
  /* ===== KITCHEN (x 6.9-13, z 2.3-9.75) ===== */
  const kz = HD - .08 - .3;
  F(baseCab(.6), 7.3, kz, PI, L0, .6, .6); F(stove(), 7.95, kz, PI, L0, .68, .6); F(baseCab(2.0), 9.3, kz, PI, L0, 2.0, .6); F(baseCab(.75, 1), 10.68, kz, PI, L0, .75, .6); F(baseCab(1.5), 11.8, kz, PI, L0, 1.5, .6);
  bx(9.95, 1.1, HD - .09, 5.5, .4, .015, M(tiles('#d8d4c0', '#c8c4b0', 8, '#8a8670')), false);
  { const w = wallCab(1.2); F(w, 7.6, HD - .26, PI, L0, 0, 0, 1.85) }
  { const sh = G(); P3(sh, Bx(.9, .025, .22), MAT.woodM); P3(sh, Bx(.9, .025, .22), MAT.woodM, 0, .32, 0); for (let i = 0; i < 6; i++) P3(sh, plateG, MC(0xe0dcd0, .3), -.32 + i * .07, .14, -.05, PI / 2 - .2); for (let i = 0; i < 5; i++) P3(sh, cupG, MC([0xd8d0c0, 0x8a3a2a, 0x3a5a6a, 0xd8d0c0, 0xc8a050][i], .3), -.3 + i * .15, .335, 0); F(sh, 12.4, HD - .2, PI, L0, 0, 0, 1.55) }
  buildKitchenInteractive();
  F(kettle(), 7.8, kz - .1, 0, L0, 0, 0, .89); { const pot = G(); P3(pot, Lathe([[0, 0], [.12, 0], [.12, .14], [.115, .14], [.115, .01], [0, .01]], 16), MAT.chrome); P3(pot, Cy(.01, .16, 6), MAT.dark, .2, .12, 0, 0, 0, PI / 2); F(pot, 8.12, kz + .12, .5, L0, 0, 0, .89) }
  { const g = G(); P3(g, Lathe([[0, 0], [.06, 0], [.065, .14], [.06, .15], [0, .15]], 12), MC(0x6a7a5a, .4)); for (let i = 0; i < 5; i++) P3(g, Cy(.006, .28, 5), i % 2 ? MAT.woodL : MAT.chrome, rr(-.02, .02), .16, rr(-.02, .02), rr(-.2, .2), 0, rr(-.2, .2)); F(g, 9.0, kz - .12, 0, L0, 0, 0, .9) }
  F(P3(G(), Bx(.4, .02, .28), MAT.woodL), 9.5, kz, .1, L0, 0, 0, .9); for (let i = 0; i < 3; i++) F(P3(G(), Lathe([[0, 0], [.05, 0], [.05, .16], [.045, .17], [.045, .2], [0, .2]], 10), MC([0xd8c8a0, 0xb8b0a0, 0x9a8a6a][i], .3, { transparent: true, opacity: .85 })), 12.3 + i * .13, kz - .15, 0, L0, 0, 0, .9);
  F(table(1.6, .9, .76, MAT.woodM), 9.6, 5.3, 0, L0, 1.6, .9);
  for (const [x, z, r] of [[9.2, 4.55, 0], [10.05, 4.55, 0], [9.2, 6.05, PI], [10.05, 6.05, PI + .15]]) place('dining-chair-leather', { x, z, ry: r, l: L0, h: .95, cw: .45, cd: .5 });
  { const g = G(); P3(g, Lathe([[0, 0], [.08, 0], [.15, .06], [.16, .08], [.14, .08], [.07, .02], [0, .02]], 16), MC(0xc8c0a8, .3)); for (const [x, z, c] of [[-.04, 0, 0xc83a2a], [.05, .03, 0xc83a2a], [0, -.05, 0xd8b83a]]) P3(g, new T.SphereGeometry(.04, 8, 6), MC(c, .5), x, .07, z); F(g, 9.45, 5.25, 0, L0, 0, 0, .76) }
  for (const [x, z] of [[9.95, 5.1], [9.25, 5.5]]) F(P3(G(), cupG, MC(0xd8d0c0, .3)), x, z, 0, L0, 0, 0, .76);
  { const c = clock(.15); F(c, 10.6, p(1.8) + .09, 0, L0, 0, 0, 2.0) }
  { const cal = G(); P3(cal, Bx(.3, .42, .005), MAT.paper); P3(cal, new T.PlaneGeometry(.26, .2), M(picTex('paint')), 0, .09, .004); for (let i = 0; i < 20; i++) P3(cal, Bx(.03, .025, .002), MC(i == 13 ? 0xb02020 : 0x8a8a7a, 1), -.1 + (i % 5) * .05, -.04 - Math.floor(i / 5) * .035, .004); F(cal, HW - .09, 3.4, -PI / 2, L0, 0, 0, 1.55) }
  ROOMS.kitchen.l.position.set(9.6, FY[0] + WH - .55, 5.3); ROOMS.kitchen.fx.position.set(9.6, WH, 5.3);
  curtains(L0, w => (w.z > HD - .5 && w.x > p(5.3)) || (w.x > HW - .5 && w.z > p(1.8)), M(tex(32, (g, w) => { for (let i = 0; i < 4; i++)for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#c8c0a8' : '#8a3a30'; g.fillRect(i * 8, j * 8, 8, 8) } grain(g, w, w, 100) }), 1, { side: T.DoubleSide }));
  /* ===== BATHROOM (x 6.9-13, z 0-2.3) ===== */
  F(toilet(), 10.0, .4, 0, L0, .45, .65); F(basin(), 11.4, .32, 0, L0, .55, .45);
  { const g = G(); P3(g, Bx(.5, .6, .14), MAT.white); const mi = P3(g, new T.PlaneGeometry(.44, .54), MC(0x9ab0b8, .05, { metalness: .95 }), 0, 0, .072); P3(g, Bx(.52, .03, .16), MAT.white, 0, -.31, 0); F(g, 11.4, .1, 0, L0, 0, 0, 1.55) }
  F(tub(), 12.45, 1.1, 0, L0, .9, 1.8);
  { const g = G(); P3(g, Cy(.012, .6, 6), MAT.chrome, 0, 0, 0, 0, 0, PI / 2); for (const [x, c] of [[-.12, 0xc8b8a0], [.14, 0x6a8a8a]]) P3(g, cloth(.24, .02, .5, .01, 6, 8, .0), MC(c, 1), x, -.25, .02, PI / 2); F(g, p(5.3) + .1, 1.2, PI / 2, L0, 0, 0, 1.15) }
  rug(10.6, 1.1, .8, .5, L0, tex(16, (g, w) => { g.fillStyle = '#6a8a8a'; g.fillRect(0, 0, w, w); grain(g, w, w, 80) }));
  { const g = G(); P3(g, Lathe([[0, 0], [.16, 0], [.19, .5], [.17, .5], [.14, .02], [0, .02]], 12), MC(0x8a6a40, .9)); P3(g, cloth(.3, .05, .3, .02, 6, 6), MC(0x5a6a7a, 1), 0, .5, 0); F(g, 7.3, .35, 0, L0, .4, .4) }
  /* ===== STORAGE ROOM (x 0-5.5, z 0-3.4) — breaker gameplay preserved ===== */
  place('shelving-wide', { x: 1.6, z: .4, l: L0, s: .86, sz: .6, tint: { '*': 0x9a8060 }, cw: 2.0, cd: .45 });
  for (const [x, y, z, w, h, d] of [[1.0, .62, .4, .45, .35, .3], [1.6, .62, .4, .4, .3, .3], [2.2, 1.18, .42, .5, .32, .32], [1.3, 1.62, .4, .36, .28, .28]]) F(cardbox(w, h, d), x, z, rr(-.1, .1), L0, 0, 0, y);
  for (const [x, z, y, w, h, d] of [[.42, 2.0, 0, .55, .45, .45], [.42, 2.0, .45, .5, .4, .42], [.45, 2.6, 0, .6, .5, .5], [.95, 2.85, 0, .45, .35, .4]]) F(cardbox(w, h, d), x, z, rr(-.15, .15), L0, y ? 0 : w, y ? 0 : d, y);
  F(bin(.55, .32, .38, 0x9aa0a8), 2.2, 3.05, 0, L0, .55, .38); F(bin(.55, .32, .38, 0x9aa0a8), 2.2, 3.05, .05, L0, 0, 0, .32);
  F(heater(), 4.95, .45, 0, L0, .55, .55); F(workbench(), 3.5, .4, 0, L0, 1.5, .6); F(toolbox(), 3.2, .4, .2, L0, 0, 0, .9);
  F(bucketMop(), 4.95, 3.0, 0, L0, .35, .35); F(papers(3), 3.8, .45, 0, L0, 0, 0, .91);
  { const g = G(); for (let i = 0; i < 3; i++) P3(g, new T.TorusGeometry(.12 + i * .01, .008, 4, 18), MC(i % 2 ? 0x1a1a1a : 0x8a2a1a, .6), 0, .02 + i * .015, 0, PI / 2); F(g, 4.1, .4, 0, L0, 0, 0, .91) }
  /* ===================== UPPER FLOOR ===================== */
  /* ===== MAIN BEDROOM (x 0-5.6, z 0-4.2) ===== */
  F(bed(1.6, 2.1, MAT.sheetB, { posts: 1, blanket: MAT.fabR }), p(4.3) - 1.16, 2.0, -PI / 2, U, 2.2, 1.7);
  for (const z of [.85, 3.15]) place('side-table', { x: p(4.3) - .32, z, l: U, h: .55, tint: { '*': WOOD_DK }, cw: .5, cd: .5 });
  F(lampTable(1, .4), p(4.3) - .32, .85, 0, U, 0, 0, .55); F(P3(G(), mugG(), MC(0xd8d0c0, .3)), p(4.3) - .25, 3.1, 0, U, 0, 0, .55); F(P3(G(), Bx(.14, .03, .2), MC(0x4a2a1a, .8)), p(4.3) - .35, 3.2, .3, U, 0, 0, .55);
  buildHideSpot(); // louvered wardrobe with clothes + grey coat (also the hiding place later in the story)
  F(vanity(), .3, 3.45, PI / 2, U, .45, 1.0); place('dining-chair-leather', { x: .95, z: 3.45, ry: -PI / 2, l: U, h: .95, cw: .45, cd: .45 });
  rug(3.0, 2.0, 2.4, 1.7, U, rugTex('#4a2a2a', '#8a6a4a', '#3a2a1a'));
  { const c = clock(.14); F(c, p(1.95), p(3.2) - .09, PI, U, 0, 0, 2.38) }
  F(frame(.7, .5, 'photo'), p(4.3) - .09, 2.0, -PI / 2, U, 0, 0, 1.75); F(frame(.3, .4, 'photo'), 1.4, .09, 0, U, 0, 0, 1.6);
  { const s = G(); for (let i = 0; i < 2; i++) { P3(s, RG(.1, .26, .07, .04), MC(0x5a2a2a, .4), i * .12, .04, 0, PI / 2); P3(s, Cy(.012, .1, 6), MC(0x5a2a2a, .4), i * .12, .07, .1) } F(s, .9, 1.55, PI / 2, U) }
  curtains(U, w => w.l === U && roomAt(U, w.x + (w.alongZ ? .3 : 0), w.z + (w.alongZ ? 0 : .3)) === 'bedA', M(fabric('#8a6a6a'), 1, { side: T.DoubleSide }));
  /* ===== SPARE BEDROOM (x 8.2-13, z 0-4.2) — the door that creaks open ===== */
  F(bed(1.0, 2.0, MAT.sheet, {}), 11.9, 1.1, 0, U, 1.15, 2.1); place('side-table', { x: 11.05, z: .35, l: U, h: .5, tint: { '*': WOOD_DK }, cw: .5, cd: .45 });
  F(wardrobe(.9, 1.9, .55), HW - .36, 3.4, -PI / 2, U, .9, .55);
  for (const [x, z, y, w, h, d] of [[8.75, 3.6, 0, .5, .4, .4], [8.75, 3.6, .4, .45, .35, .38], [9.35, 3.7, 0, .55, .45, .45]]) F(cardbox(w, h, d), x, z, rr(-.2, .2), U, y ? 0 : w, y ? 0 : d, y);
  { const g = G(); P3(g, cloth(.85, .5, .8, .03, 10, 10, .45), MAT.sheet, 0, .5, 0); F(g, 9.6, .7, .3, U, .85, .8) } // dust-sheet covered armchair
  curtains(U, w => roomAt(U, w.x - (w.alongZ ? .3 : 0), w.z + (w.alongZ ? 0 : .3)) === 'bedB', M(fabric('#5a6470'), 1, { side: T.DoubleSide }));
  /* ===== HALLWAY + LANDING ===== */
  rug(2.6, 4.94, 4.6, .8, U, rugTex('#3a2a20', '#7a5a3a', '#2a2018')); rug(9.6, 4.94, 5.6, .8, U, rugTex('#3a2a20', '#7a5a3a', '#2a2018'));
  place('side-table', { x: .35, z: 4.94, l: U, h: .7, sx: .5, tint: { '*': WOOD_DK }, cw: .35, cd: .55, ry: PI / 2 });
  place('vase_flowers', { x: .33, z: 5.05, l: U, y: .7, h: .26, only: ['Flowers2', 'GlassTransmission'], mat: { GlassTransmission: MC(0xc8c0a8, .25) } });
  F(frame(.18, .24, 'photo'), .3, 4.75, PI / 2 - .3, U, 0, 0, .82);
  for (const [x, z, ry, w, h, k] of [[1.2, p(3.2) + .09, 0, .5, .4, 'paint'], [4.4, p(3.2) + .09, 0, .35, .45, 'photo'], [1.5, p(4.4) - .09, PI, .4, .5, 'photo'], [5.6, p(4.4) - .09, PI, .6, .4, 'paint'], [7.9, p(4.4) - .09, PI, .35, .45, 'photo'], [11.6, p(4.4) - .09, PI, .5, .4, 'paint'], [10.6, p(3.2) + .09, 0, .45, .35, 'photo']]) F(frame(w, h, k), x, z, ry, U, 0, 0, 1.65);
  { const c = clock(.15); F(c, HW - .09, 4.94, -PI / 2, U, 0, 0, 2.0) }
  for (const [x, z, ry] of [[4.9, p(4.4) - .1, PI], [8.4, p(3.2) + .1, 0]]) { const g = G(); P3(g, Bx(.1, .16, .03), MAT.brass); const sm = new T.MeshStandardMaterial({ color: 0xe8d8b0, emissive: 0 }); P3(g, Lathe([[.03, 0], [.07, .1], [.065, .12], [.025, .02]], 10), sm, 0, .05, .1); LMP.push({ l: new T.Object3D(), m: { color: { setHex: v => sm.emissive.setHex(v === 0xffd9a0 ? 0x6a5a30 : 0) } }, on: 1, I: 0 }); F(g, x, z, ry, U, 0, 0, 1.75) }
  place('plant-large', { x: 7.9, z: .45, l: U, h: 1.15, tint: { potted_plant_01_pot: 0x5a6a5a }, cw: .5, cd: .5 });
  /* ===== COMPUTER ROOM (x 0-6.9, z 5.7-9.75) — see computer.js for desk + monitors ===== */
  place('chest-tall', { x: p(5.3) - .33, z: 7.4, ry: -PI / 2, l: U, h: 1.85, tint: { '*': 0xa07a58 }, cw: 1.14, cd: .5 });
  place('plant-small', { x: 6.35, z: 9.25, l: U, h: .8, tint: { potted_plant_02_pot: 0x8a4a30 }, cw: .55, cd: .55 });
  F(bookshelf(1.2, 1.6, .32), 3.7, HD - .26, PI, U, 1.2, .32); F(corkBoard(), .1, 6.4, PI / 2, U, 0, 0, 1.55);
  rug(1.6, 6.9, 1.6, 1.3, U, rugTex('#2a3a2a', '#5a6a4a', '#1a2018'));
  { const g = G(); P3(g, Lathe([[0, 0], [.12, 0], [.14, .32], [.13, .32], [.11, .01], [0, .01]], 12), MC(0x3a3a38, .6)); for (let i = 0; i < 4; i++) P3(g, new T.IcosahedronGeometry(.04, 0), MAT.paper, rr(-.05, .05), .3 + rr(0, .05), rr(-.05, .05)); F(g, 2.95, 6.1, 0, U, .3, .3) }
  curtains(U, w => roomAt(U, w.x + (w.alongZ ? .3 : 0), w.z - (w.alongZ ? 0 : .3)) === 'comp', M(fabric('#3a4232'), 1, { side: T.DoubleSide }));
  /* ===== BACK BEDROOM (locked) — someone has been living here ===== */
  { const g = G(); P3(g, RG(.9, 1.95, .16, .05), MC(0xb8b0a0, .9), 0, .08, 0, PI / 2); P3(g, cloth(.85, .06, 1.3, .03, 12, 14, .05), MAT.sheetG, 0, .18, .25); P3(g, pillow(.5, .13, .34), MC(0xa8a090, 1), 0, .22, -.7); F(g, 11.85, 9.05, PI / 2, U, .95, 2.0) } 
  F(table(1.0, .6, .74, MAT.woodL, MAT.dark), 8.2, HD - .45, 0, U, 1.0, .6);
  { const lp = laptop(); F(lp, 8.2, HD - .5, PI, U, 0, 0, .74); LAPTOP = lp }
  place('dining-chair-leather', { x: 8.2, z: HD - 1.05, ry: PI, l: U, h: .95, cw: .45, cd: .45 });
  { const r = router(); F(r, 7.2, 6.0, .3, U); ROUTER = r; bx(7.0, FY[1] + .2, 5.81, .08, .12, .02, MAT.white, false) }
  for (let i = 0; i < 7; i++) F(can(), rr(10.4, 10.9), rr(8.0, 8.6), 0, U);
  for (let i = 0; i < 10; i++) F(P3(G(), new T.PlaneGeometry(.2, .15), M(picTex(i % 3 ? 'cctv' : 'photo'))), 7.05 + (i % 5) * .38 + rr(-.06, .06), /* evidence board stays on the wall between the room corner and the light switch, clear of the doorway */ p(4.4) + .09, 0, U, 0, 0, 1.3 + Math.floor(i / 5) * .35 + rr(-.05, .05));
  { const pts = []; for (let i = 0; i < 10; i++) pts.push(new T.Vector3(7.05 + (i % 5) * .38, FY[1] + 1.38 + Math.floor(i / 5) * .35, p(4.4) + .1)); scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0xa01818 }))) }
  F(cardbox(.5, .3, .4), 7.4, 9.2, .4, U, .5, .4);
}
let TVSCR = null, WARD = null, LAPTOP = null, ROUTER = null;
