/*
 * Panels, drilling, hardware and packing for a design.
 *
 * Construction (knock-down, built face-down row by row, nothing visible from outside):
 *  - Horizontals (bottom, shelves, top) run the full width in one piece.
 *  - Each row has its own verticals: two end panels plus the dividers. They stand between
 *    two horizontals on Ø8 dowels. End panels also get a Minifix 15 cam lock per joint
 *    (cam on the inside face, bolt in the horizontal), which ties the stack together;
 *    dividers are held captive once both shelves around them are locked.
 *  - Back: one overlay back, split on shelf lines when taller than a sheet, pre-drilled so the
 *    screw holes double as a template. Without backs, every row gets an end brace on each side.
 *    Carcass parts are shallower by the back thickness, so the outer depth stays as designed.
 *  - Inset doors: 35 mm clip-on cup hinges, plate on the left wall of the bay, push latch.
 *  - Wall fixing: L-brackets on top of the top shelf.
 *
 * Part: { id, name, kind, L (along grain / long axis), Wd, T, group: 'carcass'|'back', edges, holes, pkg }
 * Hole: { face, x (mm along L from end 0 = LEFT/BOTTOM end), y (mm across, from the FRONT edge;
 *         back panels: from the bottom edge), d, depth, use }
 */
(function () {
  const C = MJERA.config;
  const CAM_X = 34;      // Minifix: cam centre from the panel end
  const r1 = v => Math.round(v * 10) / 10;

  // Package numbers printed on labels and in the manual
  const PKG = { horizontal: 1, end: 2, divider: 2, back: 3, brace: 3, door: 4, plinth: 5 };
  const PKG_NAMES = { 1: 'Shelves', 2: 'Ends & dividers', 3: 'Back', 4: 'Doors', 5: 'Base', 6: 'Hardware' };

  function endJoint(depth) {
    const cams = depth <= 330 ? [Math.round(depth / 2)] : [Math.round(depth / 3), Math.round(depth * 2 / 3)];
    return { dowels: [40, depth - 40], cams };
  }
  function dividerDowels(depth) {
    return depth > 330 ? [40, Math.round(depth / 2), depth - 40] : [40, depth - 40];
  }

  function build(design) {
    const { t, D, Hb, R, h, rows, material, color, backT, state, W, base } = design;
    const Dc = D - backT;
    const banded = material.edgeBanding;
    const parts = [];
    const counters = {};
    const nextId = p => (counters[p] = (counters[p] || 0) + 1, p + counters[p]);
    const add = part => { part.pkg = PKG[part.kind]; parts.push(part); return part; };
    const hcY = i => i * (h + t) + t / 2;  // centre line of horizontal i (body coords)
    const ej = endJoint(Dc);
    const dd = dividerDowels(Dc);
    let cams = 0, dowels = 0;

    // Verticals of a row, left to right: [x, kind]
    const rowVerticals = row => [[0, 'end']].concat(row.dividers.map(x => [x, 'divider']), [[W - t, 'end']]);

    // Horizontals (full width). Index i: 0 = bottom … R = top.
    for (let i = 0; i <= R; i++) {
      const holes = [];
      const drill = (verts, face) => verts.forEach(([vx, kind]) => {
        const x = r1(vx + t / 2);
        if (kind === 'end') {
          ej.dowels.forEach(y => holes.push({ face, x, y, d: 8, depth: 12, use: 'dowel (end panel)' }));
          ej.cams.forEach(y => holes.push({ face, x, y, d: 5, depth: 11, use: 'Minifix bolt' }));
        } else {
          dd.forEach(y => holes.push({ face, x, y, d: 8, depth: 12, use: 'dowel (divider)' }));
        }
      });
      if (i < R) drill(rowVerticals(rows[i]), 'top');
      if (i > 0) drill(rowVerticals(rows[i - 1]), 'underside');
      const name = i === 0 ? 'Bottom' : i === R ? 'Top' : 'Shelf';
      add({ id: nextId('H'), name, kind: 'horizontal', L: W, Wd: Dc, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)', 'W1 (left)', 'W2 (right)'] : [], holes, level: i });
    }

    // Verticals per row
    const verticalAt = {};
    rows.forEach(row => rowVerticals(row).forEach(([vx, kind]) => {
      const holes = [];
      const ends = [[0, 'end 0 (bottom)'], [r1(h), 'end 1 (top)']];
      if (kind === 'end') {
        const inner = vx === 0 ? 'right face (inside)' : 'left face (inside)';
        ends.forEach(([xe, face]) => {
          ej.dowels.forEach(y => holes.push({ face: 'edge ' + face, x: xe, y, d: 8, depth: 25, use: 'dowel' }));
          ej.cams.forEach(y => {
            holes.push({ face: 'edge ' + face, x: xe, y, d: 8, depth: CAM_X, use: 'Minifix bolt passage' });
            holes.push({ face: inner, x: xe ? r1(h - CAM_X) : CAM_X, y, d: 15, depth: 13.5, use: 'Minifix cam' });
          });
        });
        cams += 2 * ej.cams.length; dowels += 2 * ej.dowels.length;
      } else {
        ends.forEach(([xe, face]) => dd.forEach(y => holes.push({ face: 'edge ' + face, x: xe, y, d: 8, depth: 25, use: 'dowel' })));
        dowels += 2 * dd.length;
      }
      const p = add({ id: nextId('V'), name: kind === 'end' ? (vx === 0 ? 'End left' : 'End right') : 'Divider', kind,
        L: r1(h), Wd: Dc, T: t, group: 'carcass',
        edges: banded ? ['L1 (front)'] : [],
        holes, row: row.r, x: vx });
      verticalAt[row.r + ':' + vx] = p;
    }));

    // Doors (hinged on the left wall of their bay)
    let hinges = 0, latches = 0;
    const g = C.build.doorGap;
    rows.forEach(row => row.cells.forEach(c => {
      if (!c.door) return;
      const L = r1(c.h - 2 * g), Wd = r1(c.w - 2 * g);
      const xs = L > 900 ? [100, r1(L / 2), r1(L - 100)] : [100, r1(L - 100)];
      hinges += xs.length; latches += 1;
      add({ id: nextId('D'), name: 'Door', kind: 'door', L, Wd, T: t, group: 'carcass',
        edges: banded ? ['L1', 'L2', 'W1', 'W2'] : [],
        holes: xs.map(x => ({ face: 'inside', x, y: 22.5, d: 35, depth: 13, use: 'hinge cup (y from hinge edge)' })), cell: c.key, row: row.r });
      const wall = verticalAt[row.r + ':' + (c.j === 0 ? 0 : row.dividers[c.j - 1])];
      const face = c.j === 0 ? 'right face (inside)' : 'right face';
      xs.forEach(xh => [37 + t, 69 + t].forEach(y => wall.holes.push({ face, x: r1(g + xh), y, d: 5, depth: 12, use: 'hinge plate' })));
    }));

    // Back: full overlay (split on shelf lines), or an end brace on each side of every row
    let backScrews = 0;
    const along = (a, b, max) => { const n = Math.max(2, Math.ceil((b - a) / max) + 1); return Array.from({ length: n }, (_, q) => a + (b - a) * q / (n - 1)); };
    const backPanel = (name, kind, x0, x1, y0, y1, first, last) => {
      const off0 = first ? 0 : 0.5, off1 = last ? 0 : 0.5;
      const holes = [];
      const screw = (x, y) => holes.push({ face: 'rear', x: r1(x - x0), y: r1(Math.min(y1 - 5, Math.max(y0 + 5, y)) - y0 - off0), d: 4, depth: 'through + countersink', use: 'back screw' });
      for (let i = 0; i <= R; i++) { const y = hcY(i); if (y >= y0 - 0.1 && y <= y1 + 0.1) along(x0 + 40, x1 - 40, 250).forEach(x => screw(x, y)); }
      rows.forEach(row => {
        if (row.y0 < y0 - 0.1 || row.y1 > y1 + 0.1) return;
        const ys = h > 300 ? [row.y0 + h / 3, row.y0 + 2 * h / 3] : [row.y0 + h / 2];
        rowVerticals(row).forEach(([vx]) => { const cx = vx + t / 2; if (cx > x0 && cx < x1) ys.forEach(y => screw(cx, y)); });
      });
      backScrews += holes.length;
      return add({ id: nextId('B'), name, kind, L: r1(x1 - x0), Wd: r1(y1 - y0 - off0 - off1), T: backT, group: 'back', edges: [], holes, x0, y0 });
    };
    if (state.back) {
      const limit = material.back.sheet[1] - 2 * C.build.trim;
      const cuts = [0];
      let start = 0;
      while (Hb - start > limit) {
        let best = null;
        for (let i = 1; i < R; i++) { const y = hcY(i); if (y > start && y - start <= limit) best = y; }
        if (best === null) break;
        cuts.push(best); start = best;
      }
      cuts.push(Hb);
      for (let k = 0; k < cuts.length - 1; k++) backPanel('Back panel', 'back', 0, W, cuts[k], cuts[k + 1], k === 0, k === cuts.length - 2);
    } else {
      rows.forEach(row => {
        const y0 = row.r === 0 ? 0 : hcY(row.r), y1 = row.r === R - 1 ? Hb : hcY(row.r + 1);
        const wl = Math.min(300, row.cells[0].w + t), wr = Math.min(300, row.cells[row.cells.length - 1].w + t);
        backPanel('End brace', 'brace', 0, wl, y0, y1, row.r === 0, row.r === R - 1).row = row.r;
        backPanel('End brace', 'brace', W - wr, W, y0, y1, row.r === 0, row.r === R - 1).row = row.r;
      });
    }

    // Base
    let legs = 0, brackets = 0;
    if (state.base === 'plinth') {
      const railL = W - 80;
      const ret = D - 2 * t - 40 - backT;
      const retX = [t / 2, railL - t / 2].concat(W > 1200 ? [railL / 2] : []);
      const railHoles = retX.flatMap(x => [20, base - 20].map(y => ({ face: 'inner', x: r1(x), y, d: 8, depth: 12, use: 'dowel (glue)' })));
      add({ id: nextId('P'), name: 'Plinth front', kind: 'plinth', L: railL, Wd: base, T: t, group: 'carcass', edges: banded ? ['L1'] : [], holes: railHoles });
      add({ id: nextId('P'), name: 'Plinth back', kind: 'plinth', L: railL, Wd: base, T: t, group: 'carcass', edges: [], holes: railHoles.map(x => ({ ...x })) });
      retX.forEach(() => add({ id: nextId('P'), name: 'Plinth return', kind: 'plinth', L: ret, Wd: base, T: t, group: 'carcass', edges: [],
        holes: [[0, 'end 0'], [ret, 'end 1']].flatMap(([xe, f]) => [20, base - 20].map(y => ({ face: 'edge ' + f, x: xe, y, d: 8, depth: 25, use: 'dowel (glue)' }))) }));
      dowels += retX.length * 4;
      brackets = retX.length * 2;
    } else if (state.base === 'legs') {
      legs = W > 1200 ? 6 : 4;
    }
    const wallBrackets = W > 1600 ? 3 : 2;

    const hardware = [
      { id: 'cam', name: 'Minifix 15 cam + bolt + cover cap', qty: cams },
      { id: 'dowel', name: 'Beech dowel Ø8×35', qty: dowels },
      { id: 'backScrew', name: 'Back screw 3.5×16 countersunk', qty: backScrews },
      { id: 'hinge', name: 'Clip-on cup hinge 35 mm, inset, soft-close (with plate)', qty: hinges },
      { id: 'pushLatch', name: 'Push-to-open latch', qty: latches },
      { id: 'leg', name: 'Steel leg {h} mm', vars: { h: C.build.legHeight }, qty: legs },
      { id: 'bracket', name: 'Angle bracket 30 mm + screws (plinth to bottom)', qty: brackets },
      { id: 'wallFix', name: 'Wall L-bracket + screw + universal plug', qty: wallBrackets }
    ].filter(x => x.qty > 0);

    const edgeMeters = parts.reduce((m, p) => m + p.edges.reduce((s, e) => s + (e[0] === 'L' ? p.L : p.Wd), 0), 0) / 1000;
    const holes = parts.reduce((n, p) => n + p.holes.length, 0);
    const cutMeters = parts.reduce((m, p) => m + p.L + p.Wd, 0) / 1000;
    const areaM2 = parts.filter(p => p.group === 'carcass').reduce((a, p) => a + p.L * p.Wd, 0) / 1e6;
    const preinstalled = cams * 2 + dowels / 2 + hinges + latches;   // fittings we fit before shipping

    const grain = !!(material.grain || color.grain);
    return { parts, hardware, edgeMeters, holes, cutMeters, areaM2, grain, preinstalled, wallBrackets, PKG_NAMES };
  }

  function grouped(cut) {
    const map = new Map();
    cut.parts.forEach(p => {
      const k = [p.group, p.name, p.L, p.Wd, p.T].join('|');
      if (!map.has(k)) map.set(k, { name: p.name, kind: p.kind, group: p.group, L: p.L, Wd: p.Wd, T: p.T, edges: p.edges, pkg: p.pkg, ids: [], qty: 0 });
      const g = map.get(k); g.ids.push(p.id); g.qty++;
    });
    return [...map.values()];
  }

  MJERA.cutlist = { build, grouped, PKG_NAMES };
})();
