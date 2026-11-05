/*
 * Guillotine shelf nesting of panels onto stock sheets.
 * Sheet coords: x along sheet length (grain), y across. Parts with grain keep L along x.
 */
(function () {
  const C = MJERA.config;

  function packGroup(parts, sheet, allowRotate) {
    const { kerf, trim } = C.build;
    const UW = sheet[0] - 2 * trim, UH = sheet[1] - 2 * trim;
    const sheets = [];
    const oversize = [];

    // Shelf height of an item: its width across the sheet (fixed grain) or its short side (free rotation)
    const items = parts.map(p => ({ p, a: p.L, b: p.Wd, sh: allowRotate ? Math.min(p.L, p.Wd) : p.Wd }))
      .sort((m, n) => n.sh - m.sh || Math.max(n.a, n.b) - Math.max(m.a, m.b));

    const orients = it => {
      const o = [{ w: it.a, h: it.b, rot: false }];
      if (allowRotate && it.a !== it.b) o.push({ w: it.b, h: it.a, rot: true });
      return o.filter(q => q.w <= UW && q.h <= UH);
    };

    function tryPlace(s, it) {
      let best = null;
      for (const o of orients(it)) {
        for (const sh of s.shelves) {
          if (o.h <= sh.h && sh.x + o.w <= UW) {
            const waste = sh.h - o.h;
            if (!best || waste < best.waste) best = { sh, o, waste };
          }
        }
      }
      if (best) {
        s.placed.push({ part: it.p, x: trim + best.sh.x, y: trim + best.sh.y, w: best.o.w, h: best.o.h, rot: best.o.rot });
        best.sh.x += best.o.w + kerf;
        return true;
      }
      // open a new shelf: prefer orientation with lowest height that fits
      const os = orients(it).sort((m, n) => m.h - n.h);
      for (const o of os) {
        if (s.y + o.h <= UH) {
          const sh = { y: s.y, h: o.h, x: o.w + kerf };
          s.shelves.push(sh); s.y += o.h + kerf;
          s.placed.push({ part: it.p, x: trim, y: trim + sh.y, w: o.w, h: o.h, rot: o.rot });
          return true;
        }
      }
      return false;
    }

    for (const it of items) {
      if (!orients(it).length) { oversize.push(it.p); continue; }
      let ok = sheets.some(s => tryPlace(s, it));
      if (!ok) {
        const s = { shelves: [], y: 0, placed: [] };
        sheets.push(s);
        tryPlace(s, it);
      }
    }

    const sheetArea = sheet[0] * sheet[1];
    sheets.forEach(s => {
      s.size = sheet;
      s.used = s.placed.reduce((a, q) => a + q.w * q.h, 0) / sheetArea;
    });
    return { sheets, oversize };
  }

  function nest(design, cut) {
    const m = design.material;
    const groups = [];
    const carcass = cut.parts.filter(p => p.group === 'carcass');
    const backs = cut.parts.filter(p => p.group === 'back');
    const a = packGroup(carcass, m.sheet, !cut.grain);
    groups.push({ id: 'carcass', label: `${m.name} 18 mm · ${design.color.name}`, sheet: m.sheet, pricePerSheet: m.pricePerSheet, ...a });
    if (backs.length) {
      const b = packGroup(backs, m.back.sheet, !m.grain);
      groups.push({ id: 'back', label: m.back.name, sheet: m.back.sheet, pricePerSheet: m.back.pricePerSheet, ...b });
    }
    return groups;
  }

  MJERA.nesting = { nest };
})();
