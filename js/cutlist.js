/*
 * Panels, drilling and hardware for a design.
 * Each part: { id, name, kind, L (along grain / long axis), Wd, T, group: 'carcass'|'back',
 *              edges: [ 'L1', 'W1', ... ] edge-banded sides, holes: [...] }
 * Hole: { face: 'A'|'B'|'edge-L0'|'edge-L1', x (mm along L), y (mm across, from front/hinge edge), d, depth, use }
 */
(function () {
  const C = MJERA.config;

  function connectorOffsets(depth) {
    const i = C.build.connectorInset;
    return depth > 350 ? [i, Math.round(depth / 2), depth - i] : [i, depth - i];
  }

  function build(design) {
    const { t, D, Hb, Wi, R, h, rows, material, color, backT, state, W, base } = design;
    const Dd = D - backT;                 // dividers/shelves sit in front of an inset back
    const banded = material.edgeBanding;
    const parts = [];
    const counters = {};
    const nextId = p => (counters[p] = (counters[p] || 0) + 1, p + counters[p]);
    const r1 = v => Math.round(v * 10) / 10;

    // Sides
    for (let s = 0; s < 2; s++) {
      const holes = [];
      for (let i = 0; i <= R; i++) {
        const x = r1(i * (h + t) + t / 2);
        connectorOffsets(D).forEach(y => holes.push({ face: s ? 'A' : 'B', x, y, d: 7, depth: t, use: 'confirmat (through)' }));
      }
      parts.push({ id: nextId('S'), name: s ? 'Side right' : 'Side left', kind: 'side', L: Hb, Wd: D, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)', 'W1 (top)'] : [], holes });
    }

    // Horizontals (bottom, shelves, top) — sides sit outside them, so length = Wi
    for (let i = 0; i <= R; i++) {
      const holes = [];
      ['edge-L0', 'edge-L1'].forEach(face => connectorOffsets(D).forEach(y =>
        holes.push({ face, x: face === 'edge-L0' ? 0 : Wi, y, d: 5, depth: 50, use: 'confirmat pilot (edge)' })));
      const above = i < R ? rows[i].dividers : [];
      const below = i > 0 ? rows[i - 1].dividers : [];
      above.forEach(dx => connectorOffsets(Dd).forEach(y => holes.push({ face: 'A (top)', x: r1(dx - t + t / 2), y, d: 7, depth: t, use: 'confirmat (through)' })));
      below.forEach(dx => connectorOffsets(Dd).forEach(y => holes.push({ face: 'B (bottom)', x: r1(dx - t + t / 2), y, d: 7, depth: t, use: 'confirmat (through)' })));
      const name = i === 0 ? 'Bottom' : i === R ? 'Top' : 'Shelf';
      parts.push({ id: nextId('H'), name, kind: 'horizontal', L: Wi, Wd: D, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)'] : [], holes, level: i });
    }

    // Dividers (vertical, between horizontals)
    rows.forEach(row => row.dividers.forEach(dx => {
      const holes = [];
      ['edge-L0', 'edge-L1'].forEach(face => connectorOffsets(Dd).forEach(y =>
        holes.push({ face, x: face === 'edge-L0' ? 0 : r1(h), y, d: 5, depth: 50, use: 'confirmat pilot (edge)' })));
      parts.push({ id: nextId('V'), name: 'Divider', kind: 'divider', L: r1(h), Wd: Dd, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)'] : [], holes, row: row.r, x: dx });
    }));

    // Backs — one per row, inset between sides and horizontals
    if (state.back) {
      rows.forEach(row => parts.push({ id: nextId('B'), name: 'Back panel', kind: 'back', L: Wi, Wd: r1(h), T: backT, group: 'back',
        edges: [], holes: [], row: row.r }));
    }

    // Doors — inset, push-to-open
    let hinges = 0, latches = 0;
    rows.forEach(row => row.cells.filter(c => c.door).forEach(c => {
      const g = C.build.doorGap;
      const L = r1(c.h - 2 * g), Wd = r1(c.w - 2 * g);
      const xs = L > 900 ? [100, r1(L / 2), r1(L - 100)] : [100, r1(L - 100)];
      hinges += xs.length; latches += 1;
      parts.push({ id: nextId('D'), name: 'Door', kind: 'door', L, Wd, T: t, group: 'carcass',
        edges: banded ? ['L1', 'L2', 'W1', 'W2'] : [],
        holes: xs.map(x => ({ face: 'B (inside)', x, y: 22.5, d: 35, depth: 13, use: 'hinge cup' })), cell: c.key });
    }));

    // Base
    let legs = 0;
    if (state.base === 'plinth') {
      const ret = D - 2 * t - 40;                        // plinth set back 40 mm from front
      parts.push({ id: nextId('P'), name: 'Plinth front', kind: 'plinth', L: W - 80, Wd: base, T: t, group: 'carcass', edges: banded ? ['L1'] : [], holes: [] });
      parts.push({ id: nextId('P'), name: 'Plinth back', kind: 'plinth', L: W - 80, Wd: base, T: t, group: 'carcass', edges: [], holes: [] });
      const nRet = 2 + (W > 1200 ? 1 : 0);
      for (let i = 0; i < nRet; i++) parts.push({ id: nextId('P'), name: 'Plinth return', kind: 'plinth', L: ret, Wd: base, T: t, group: 'carcass', edges: [], holes: [] });
    } else if (state.base === 'legs') {
      legs = W > 1200 ? 6 : 4;
    }

    // Joints & hardware
    const connectors = parts.reduce((n, p) => n + p.holes.filter(hh => hh.d === 7).length, 0)
      + (state.base === 'plinth' ? (W > 1200 ? 6 : 4) * 2 : 0);
    const hardware = [
      { id: 'connector', name: 'Confirmat screw 7×50 + cap', qty: connectors },
      { id: 'hinge', name: 'Soft-close cup hinge 35 mm (inset)', qty: hinges },
      { id: 'pushLatch', name: 'Push-to-open latch', qty: latches },
      { id: 'leg', name: `Steel leg ${C.build.legHeight} mm`, qty: legs },
      { id: 'backScrewPack', name: 'Back panel screw pack (20 pcs)', qty: state.back ? R : 0 },
      { id: 'wallFix', name: 'Anti-tip wall bracket kit', qty: 1 }
    ].filter(x => x.qty > 0);

    const edgeMeters = parts.reduce((m, p) => m + p.edges.reduce((s, e) => s + (e[0] === 'L' ? p.L : p.Wd), 0), 0) / 1000;
    const holes = parts.reduce((n, p) => n + p.holes.length, 0);
    const cutMeters = parts.reduce((m, p) => m + p.L + p.Wd, 0) / 1000;
    const areaM2 = parts.filter(p => p.group === 'carcass').reduce((a, p) => a + p.L * p.Wd, 0) / 1e6;

    const grain = !!(material.grain || color.grain);
    return { parts, hardware, edgeMeters, holes, cutMeters, areaM2, grain };
  }

  // Group identical panels for a readable cut list
  function grouped(cut) {
    const map = new Map();
    cut.parts.forEach(p => {
      const k = [p.group, p.name, p.L, p.Wd, p.T].join('|');
      if (!map.has(k)) map.set(k, { name: p.name, group: p.group, L: p.L, Wd: p.Wd, T: p.T, edges: p.edges, ids: [], qty: 0 });
      const g = map.get(k); g.ids.push(p.id); g.qty++;
    });
    return [...map.values()];
  }

  MJERA.cutlist = { build, grouped };
})();
