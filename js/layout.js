/*
 * Turns a user design (state) into geometry: rows, compartments, panels.
 * All geometry in millimetres. Origin = bottom-left of the carcass body (above the base).
 */
(function () {
  const C = MJERA.config;

  function rng(seed) {             // mulberry32
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function baseHeight(base) {
    if (base === 'plinth') return C.build.plinthHeight;
    if (base === 'legs') return C.build.legHeight;
    return 0;
  }

  function rowRange(state) {
    const t = C.build.t;
    const Hb = state.height * 10 - baseHeight(state.base);
    const { min, max } = C.limits.rowHeight;
    let lo = Math.max(1, Math.ceil((Hb - t) / (max + t)));
    let hi = Math.max(1, Math.floor((Hb - t) / (min + t)));
    if (hi < lo) hi = lo;
    return { min: lo, max: hi };
  }

  // Ratios of compartment widths for each row, by style.
  function rowRatios(style, n, r, R, random) {
    switch (style) {
      case 'brick':
        if (r % 2 === 1 && n > 1) return [0.5].concat(Array(n - 1).fill(1), [0.5]);
        return Array(n).fill(1);
      case 'cascade': {
        const g = 1.32;
        const arr = Array.from({ length: n }, (_, i) => Math.pow(g, i));
        return r % 2 === 1 ? arr.reverse() : arr;
      }
      case 'mosaic': {
        const k = Math.max(1, n + Math.round(random() * 2 - 1));
        return Array.from({ length: k }, () => 0.55 + random() * 0.9);
      }
      default:
        return Array(n).fill(1);
    }
  }

  function build(state) {
    const t = C.build.t;
    const material = C.materials.find(m => m.id === state.material) || C.materials[0];
    const color = material.colors.find(c => c.id === state.color) || material.colors[0];
    const backT = state.back ? material.back.t : 0;

    const W = state.width * 10;
    const H = state.height * 10;
    const D = state.depth * 10;
    const base = baseHeight(state.base);
    const Hb = H - base;
    const Wi = W - 2 * t;
    const range = rowRange(state);
    const R = Math.min(range.max, Math.max(range.min, state.rows));
    const h = (Hb - (R + 1) * t) / R;              // clear height of each row

    // Column count from density: sparse = ~75 cm bays, dense = ~28 cm bays.
    const target = 750 - (state.density / 100) * 470;
    const n = Math.max(1, Math.round((Wi + t) / (target + t)));
    const random = rng(state.seed || 1);

    const rows = [];
    for (let r = 0; r < R; r++) {
      const ratios = rowRatios(state.style, n, r, R, random);
      const free = Wi - (ratios.length - 1) * t;
      const sum = ratios.reduce((a, b) => a + b, 0);
      const y0 = t + r * (h + t);
      const cells = [];
      const dividers = [];
      let x = 0;
      ratios.forEach((q, j) => {
        const w = free * q / sum;
        cells.push({ key: r + '-' + j, r, j, x0: t + x, x1: t + x + w, y0, y1: y0 + h, w, h });
        x += w;
        if (j < ratios.length - 1) { dividers.push(t + x); x += t; }   // left edge of divider (body coords)
      });
      rows.push({ r, y0, y1: y0 + h, cells, dividers });
    }

    const doorSet = new Set(state.doors || []);
    rows.forEach(row => row.cells.forEach(c => { c.door = doorSet.has(c.key); }));

    const warnings = [];
    const maxSpan = Math.max(...rows.flatMap(r => r.cells.map(c => c.w)));
    if (maxSpan > C.limits.maxSpan) warnings.push(`Widest bay is ${Math.round(maxSpan / 10)} cm — shelves over ${C.limits.maxSpan / 10} cm may sag under books. Increase density.`);
    if (W > material.sheet[0] - 2 * C.build.trim) warnings.push(`Width exceeds a single ${material.short} sheet. Reduce width or split into two units.`);
    if (Hb > material.sheet[0] - 2 * C.build.trim) warnings.push(`Height exceeds a single ${material.short} sheet length.`);
    if (!state.back && H > 1200) warnings.push('Without back panels a unit this tall relies on the wall fixing alone to stay square. We recommend back panels.');
    const smallBay = Math.min(...rows.flatMap(r => r.cells.map(c => c.w)));
    if (smallBay < 120) warnings.push(`Some bays are only ${Math.round(smallBay / 10)} cm wide. Reduce density.`);

    return { state, material, color, t, backT, W, H, D, base, Hb, Wi, R, h, n, rows, warnings, rowRange: range };
  }

  MJERA.layout = { build, rowRange, baseHeight };
})();
