/*
 * Panels, drilling and hardware for a design.
 *
 * Construction (knock-down, no visible screws on the outside):
 *  - Sides run full height. Bottom, shelves and top sit between them.
 *    Joint = 2 × Ø8 dowels + 1–2 Minifix 15 cam locks (cam on the underside of the shelf).
 *  - Dividers stand between two shelves on Ø8 dowels only. They are held captive
 *    once the shelf above is locked to the sides, and screwed through the back.
 *  - One overlay back (split at shelf lines if taller than a sheet), pre-drilled so the
 *    screw holes double as a template. It squares the carcass and stops racking.
 *  - Inset doors: 35 mm clip-on cup hinges, plate on the left wall of the bay, push latch.
 *
 * Part: { id, name, kind, L (along grain / long axis), Wd, T, group: 'carcass'|'back', edges, holes }
 * Hole: { part face, x (mm along L from end 0), y (mm across, from FRONT edge, or from the
 *         bottom edge for back panels), d, depth, use }
 */
(function () {
  const C = MJERA.config;
  const CAM_X = 34;      // Minifix: cam centre from the shelf end
  const r1 = v => Math.round(v * 10) / 10;

  function sideJoint(depth) {
    const cams = depth <= 330 ? [Math.round(depth / 2)] : [Math.round(depth / 3), Math.round(depth * 2 / 3)];
    return { dowels: [40, depth - 40], cams };
  }
  function dividerDowels(depth) {
    return depth > 330 ? [40, Math.round(depth / 2), depth - 40] : [40, depth - 40];
  }

  function build(design) {
    const { t, D, Hb, Wi, R, h, rows, material, color, backT, state, W, base } = design;
    const Dc = D - backT;                 // all carcass parts stop short so the back overlays them
    const banded = material.edgeBanding;
    const parts = [];
    const counters = {};
    const nextId = p => (counters[p] = (counters[p] || 0) + 1, p + counters[p]);
    const hcY = i => i * (h + t) + t / 2;  // centre line of horizontal i (body coords)
    const sj = sideJoint(Dc);
    const dd = dividerDowels(Dc);
    let cams = 0, dowels = 0;

    // Sides
    const sides = [0, 1].map(s => {
      const holes = [];
      for (let i = 0; i <= R; i++) {
        const x = r1(hcY(i));
        sj.dowels.forEach(y => holes.push({ face: 'inner', x, y, d: 8, depth: 12, use: 'dowel' }));
        sj.cams.forEach(y => holes.push({ face: 'inner', x, y, d: 5, depth: 11, use: 'Minifix bolt' }));
      }
      const p = { id: nextId('S'), name: s ? 'Side right' : 'Side left', kind: 'side', L: Hb, Wd: Dc, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)', 'W1 (top)'] : [], holes };
      parts.push(p);
      return p;
    });

    // Horizontals
    for (let i = 0; i <= R; i++) {
      const holes = [];
      [[0, 'end 0'], [Wi, 'end 1']].forEach(([xe, face]) => {
        sj.dowels.forEach(y => holes.push({ face: 'edge ' + face, x: xe, y, d: 8, depth: 25, use: 'dowel' }));
        sj.cams.forEach(y => {
          holes.push({ face: 'edge ' + face, x: xe, y, d: 8, depth: CAM_X, use: 'Minifix bolt passage' });
          holes.push({ face: 'underside', x: xe ? Wi - CAM_X : CAM_X, y, d: 15, depth: 13.5, use: 'Minifix cam' });
        });
      });
      cams += 2 * sj.cams.length; dowels += 2 * sj.dowels.length;
      const above = i < R ? rows[i].dividers : [];
      const below = i > 0 ? rows[i - 1].dividers : [];
      above.forEach(dx => dd.forEach(y => holes.push({ face: 'top', x: r1(dx - t + t / 2), y, d: 8, depth: 12, use: 'dowel (divider)' })));
      below.forEach(dx => dd.forEach(y => holes.push({ face: 'underside', x: r1(dx - t + t / 2), y, d: 8, depth: 12, use: 'dowel (divider)' })));
      const name = i === 0 ? 'Bottom' : i === R ? 'Top' : 'Shelf';
      parts.push({ id: nextId('H'), name, kind: 'horizontal', L: Wi, Wd: Dc, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)'] : [], holes, level: i });
    }

    // Dividers
    const dividerAt = {};
    rows.forEach(row => row.dividers.forEach(dx => {
      const holes = [];
      [[0, 'end 0'], [r1(h), 'end 1']].forEach(([xe, face]) => dd.forEach(y => holes.push({ face: 'edge ' + face, x: xe, y, d: 8, depth: 25, use: 'dowel' })));
      dowels += 2 * dd.length;
      const p = { id: nextId('V'), name: 'Divider', kind: 'divider', L: r1(h), Wd: Dc, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)'] : [], holes, row: row.r, x: dx };
      dividerAt[row.r + ':' + dx] = p;
      parts.push(p);
    }));

    // Doors (hinged on the left wall of their bay)
    let hinges = 0, latches = 0;
    const g = C.build.doorGap;
    rows.forEach(row => row.cells.forEach(c => {
      if (!c.door) return;
      const L = r1(c.h - 2 * g), Wd = r1(c.w - 2 * g);
      const xs = L > 900 ? [100, r1(L / 2), r1(L - 100)] : [100, r1(L - 100)];
      hinges += xs.length; latches += 1;
      parts.push({ id: nextId('D'), name: 'Door', kind: 'door', L, Wd, T: t, group: 'carcass',
        edges: banded ? ['L1', 'L2', 'W1', 'W2'] : [],
        holes: xs.map(x => ({ face: 'inside', x, y: 22.5, d: 35, depth: 13, use: 'hinge cup (y from hinge edge)' })), cell: c.key });
      // mounting plates on the wall to the left of the bay
      const wall = c.j === 0 ? sides[0] : dividerAt[row.r + ':' + row.dividers[c.j - 1]];
      const x0 = c.j === 0 ? c.y0 : 0;           // side x runs from body bottom, divider x from its own bottom
      xs.forEach(xh => [37 + t, 69 + t].forEach(y => wall.holes.push({ face: c.j === 0 ? 'inner' : 'right', x: r1(x0 + g + xh), y, d: 5, depth: 12, use: 'hinge plate' })));
    }));

    // Overlay back, split on shelf lines so each piece fits a sheet
    let backScrews = 0;
    if (state.back) {
      const limit = material.back.sheet[1] - 2 * C.build.trim;
      const cuts = [0];
      let start = 0;
      while (Hb - start > limit) {
        let best = null;
        for (let i = 1; i < R; i++) { const y = hcY(i); if (y > start && y - start <= limit) best = y; }
        if (best === null) break;                // cannot split further; nesting will flag oversize
        cuts.push(best); start = best;
      }
      cuts.push(Hb);
      for (let k = 0; k < cuts.length - 1; k++) {
        const y0 = cuts[k], y1 = cuts[k + 1];
        const off0 = k > 0 ? 0.5 : 0, off1 = k < cuts.length - 2 ? 0.5 : 0;
        const holes = [];
        const screw = (x, y) => holes.push({ face: 'rear', x: r1(x), y: r1(Math.min(y1 - 5, Math.max(y0 + 5, y)) - y0 - off0), d: 4, depth: 'through + countersink', use: 'back screw' });
        const along = (a, b, max) => { const n = Math.max(2, Math.ceil((b - a) / max) + 1); return Array.from({ length: n }, (_, q) => a + (b - a) * q / (n - 1)); };
        for (let i = 0; i <= R; i++) { const y = hcY(i); if (y >= y0 - 0.1 && y <= y1 + 0.1) along(60, W - 60, 250).forEach(x => screw(x, y)); }
        [t / 2, W - t / 2].forEach(x => along(y0 + 80, y1 - 80, 250).forEach(y => { if (y1 - y0 > 200) screw(x, y); }));
        rows.forEach(row => { if (row.y0 >= y0 && row.y1 <= y1) row.dividers.forEach(dx => (h > 300 ? [row.y0 + h / 3, row.y0 + 2 * h / 3] : [row.y0 + h / 2]).forEach(y => screw(dx + t / 2, y))); });
        backScrews += holes.length;
        parts.push({ id: nextId('B'), name: 'Back panel', kind: 'back', L: W, Wd: r1(y1 - y0 - off0 - off1), T: backT, group: 'back', edges: [], holes });
      }
    }

    // Base
    let legs = 0, brackets = 0;
    if (state.base === 'plinth') {
      const railL = W - 80;
      const ret = D - 2 * t - 40 - backT;
      const retX = [t / 2, railL - t / 2].concat(W > 1200 ? [railL / 2] : []);
      const railHoles = retX.flatMap(x => [20, base - 20].map(y => ({ face: 'inner', x: r1(x), y, d: 8, depth: 12, use: 'dowel (glue)' })));
      parts.push({ id: nextId('P'), name: 'Plinth front', kind: 'plinth', L: railL, Wd: base, T: t, group: 'carcass', edges: banded ? ['L1'] : [], holes: railHoles });
      parts.push({ id: nextId('P'), name: 'Plinth back', kind: 'plinth', L: railL, Wd: base, T: t, group: 'carcass', edges: [], holes: railHoles.map(x => ({ ...x })) });
      retX.forEach(() => parts.push({ id: nextId('P'), name: 'Plinth return', kind: 'plinth', L: ret, Wd: base, T: t, group: 'carcass', edges: [],
        holes: [[0, 'end 0'], [ret, 'end 1']].flatMap(([xe, f]) => [20, base - 20].map(y => ({ face: 'edge ' + f, x: xe, y, d: 8, depth: 25, use: 'dowel (glue)' }))) }));
      dowels += retX.length * 4;
      brackets = retX.length * 2;
    } else if (state.base === 'legs') {
      legs = W > 1200 ? 6 : 4;
    }

    const hardware = [
      { id: 'cam', name: 'Minifix 15 cam + bolt + cover cap', qty: cams },
      { id: 'dowel', name: 'Beech dowel Ø8×35', qty: dowels },
      { id: 'backScrew', name: 'Back screw 3.5×16 countersunk', qty: backScrews },
      { id: 'hinge', name: 'Clip-on cup hinge 35 mm, inset, soft-close (with plate)', qty: hinges },
      { id: 'pushLatch', name: 'Push-to-open latch', qty: latches },
      { id: 'leg', name: `Steel leg ${C.build.legHeight} mm`, qty: legs },
      { id: 'bracket', name: 'Angle bracket 30 mm + screws (plinth to bottom)', qty: brackets },
      { id: 'wallFix', name: 'Anti-tip wall bracket kit', qty: 1 }
    ].filter(x => x.qty > 0);

    const edgeMeters = parts.reduce((m, p) => m + p.edges.reduce((s, e) => s + (e[0] === 'L' ? p.L : p.Wd), 0), 0) / 1000;
    const holes = parts.reduce((n, p) => n + p.holes.length, 0);
    const cutMeters = parts.reduce((m, p) => m + p.L + p.Wd, 0) / 1000;
    const areaM2 = parts.filter(p => p.group === 'carcass').reduce((a, p) => a + p.L * p.Wd, 0) / 1e6;
    const preinstalled = cams * 2 + dowels / 2 + hinges + latches;   // fittings we fit before shipping

    const grain = !!(material.grain || color.grain);
    return { parts, hardware, edgeMeters, holes, cutMeters, areaM2, grain, preinstalled };
  }

  function grouped(cut) {
    const map = new Map();
    cut.parts.forEach(p => {
      const k = [p.group, p.name, p.L, p.Wd, p.T].join('|');
      if (!map.has(k)) map.set(k, { name: p.name, kind: p.kind, group: p.group, L: p.L, Wd: p.Wd, T: p.T, edges: p.edges, ids: [], qty: 0 });
      const g = map.get(k); g.ids.push(p.id); g.qty++;
    });
    return [...map.values()];
  }

  MJERA.cutlist = { build, grouped };
})();
