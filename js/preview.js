/*
 * SVG renderers: perspective front view of the shelf, sheet layouts.
 */
(function () {
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(hex, amt) {                 // amt -1..1 (neg = darker)
    const [r, g, b] = hexToRgb(hex);
    const f = v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  let uid = 0;
  const n1 = v => Math.round(v * 10) / 10;
  const pts = arr => arr.map(p => n1(p[0]) + ',' + n1(p[1])).join(' ');

  /**
   * opts: { interactive, dims, labels, mini }
   */
  function shelf(design, cut, opts = {}) {
    const { W, H, D, t, base, rows, R, h, color, material, state } = design;
    const c = color.hex;
    const ply = material.id === 'ply';
    const edge = ply ? (color.edge || '#d6b886') : c;
    const pad = opts.mini ? 40 : Math.max(W, H) * 0.14;
    const vbX = -pad, vbY = -pad, vbW = W + pad * 2, vbH = H + pad * 1.6;
    const Y = y => H - y;                     // floor coords -> svg
    const f = 3400, k = f / (f + D);
    const vx = W / 2, vy = Math.min(1500, H + 350);
    const toBack = (x, y) => [vx + (x - vx) * k, vy + (y - vy) * k];

    const P = 's' + (++uid) + '_';
    const out = [];
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n1(vbX)} ${n1(vbY)} ${n1(vbW)} ${n1(vbH)}" class="shelf-svg" role="img" aria-label="Shelf preview ${W / 10} by ${H / 10} by ${D / 10} cm">`);
    out.push('<defs>');
    if (ply) {
      out.push(`<pattern id="${P}plyH" width="40" height="6" patternUnits="userSpaceOnUse"><rect width="40" height="6" fill="${edge}"/><rect y="2.4" width="40" height="1.2" fill="${shade(edge.startsWith('#') ? edge : '#d6b886', -0.2)}"/></pattern>`);
      out.push(`<pattern id="${P}plyV" width="6" height="40" patternUnits="userSpaceOnUse"><rect width="6" height="40" fill="${edge}"/><rect x="2.4" width="1.2" height="40" fill="${shade(edge.startsWith('#') ? edge : '#d6b886', -0.2)}"/></pattern>`);
    }
    out.push(`<radialGradient id="${P}floorShadow"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`);
    out.push('</defs>');

    if (!opts.mini) out.push(`<ellipse cx="${W / 2}" cy="${Y(0)}" rx="${W * 0.62}" ry="${Math.max(30, D * 0.18)}" fill="url(#${P}floorShadow)"/>`);

    // Base
    if (state.base === 'plinth') {
      out.push(`<rect x="40" y="${Y(base)}" width="${W - 80}" height="${base}" fill="${shade(c, -0.35)}"/>`);
    } else if (state.base === 'legs') {
      const xs = W > 1200 ? [60, W / 2 - 15, W - 90] : [60, W - 90];
      xs.forEach(x => out.push(`<rect x="${n1(x)}" y="${Y(base)}" width="30" height="${base}" rx="3" fill="#2b2b2b"/>`));
    }

    const by = y => y + base;                 // body -> floor coords
    // Compartments with perspective interiors
    let clipId = 0;
    rows.forEach(row => row.cells.forEach(cell => {
      const x0 = cell.x0, x1 = cell.x1, y0 = by(cell.y0), y1 = by(cell.y1);
      const b00 = toBack(x0, y0), b10 = toBack(x1, y0), b11 = toBack(x1, y1), b01 = toBack(x0, y1);
      const id = P + 'c' + (clipId++);
      const sv = p => [p[0], Y(p[1])];
      out.push(`<clipPath id="${id}"><rect x="${n1(x0)}" y="${n1(Y(y1))}" width="${n1(x1 - x0)}" height="${n1(y1 - y0)}"/></clipPath>`);
      out.push(`<g clip-path="url(#${id})">`);
      const backFill = state.back ? shade(c, -0.16) : '#e4ded3';
      out.push(`<polygon points="${pts([b00, b10, b11, b01].map(sv))}" fill="${backFill}"/>`);
      out.push(`<polygon points="${pts([[x0, y0], [x1, y0], b10, b00].map(sv))}" fill="${shade(c, 0.06)}"/>`);   // floor
      out.push(`<polygon points="${pts([[x0, y1], [x1, y1], b11, b01].map(sv))}" fill="${shade(c, -0.32)}"/>`);  // ceiling
      out.push(`<polygon points="${pts([[x0, y0], [x0, y1], b01, b00].map(sv))}" fill="${shade(c, -0.1)}"/>`);   // left wall
      out.push(`<polygon points="${pts([[x1, y0], [x1, y1], b11, b10].map(sv))}" fill="${shade(c, -0.2)}"/>`);   // right wall
      out.push('</g>');
      if (cell.door) {
        const g = 2;
        out.push(`<rect x="${n1(x0 + g)}" y="${n1(Y(y1) + g)}" width="${n1(x1 - x0 - 2 * g)}" height="${n1(y1 - y0 - 2 * g)}" fill="${shade(c, 0.03)}" stroke="${shade(c, -0.25)}" stroke-width="1.5"/>`);
        const gx = x1 - 26;
        out.push(`<rect x="${n1(gx)}" y="${n1(Y(y1) + (y1 - y0) * 0.38)}" width="6" height="${n1((y1 - y0) * 0.24)}" rx="3" fill="${shade(c, -0.22)}"/>`);
      }
    }));

    // Panel front edges
    const panel = (x, y, w, hh, vertical) => {
      const fill = ply ? `url(#${P}${vertical ? 'plyV' : 'plyH'})` : c;
      out.push(`<rect x="${n1(x)}" y="${n1(Y(y + hh))}" width="${n1(w)}" height="${n1(hh)}" fill="${fill}"/>`);
    };
    for (let i = 0; i <= R; i++) panel(t, by(i * (h + t)), W - 2 * t, t, false);
    rows.forEach(row => row.dividers.forEach(dx => panel(dx, by(row.y0), t, row.y1 - row.y0, true)));
    panel(0, base, t, H - base, true);
    panel(W - t, base, t, H - base, true);
    // subtle outline
    out.push(`<rect x="0" y="${Y(H)}" width="${W}" height="${H - base}" fill="none" stroke="${shade(c, -0.35)}" stroke-opacity=".35" stroke-width="1.2"/>`);

    // Click targets
    if (opts.interactive) {
      rows.forEach(row => row.cells.forEach(cell => {
        out.push(`<rect class="hit${cell.door ? ' has-door' : ''}" data-key="${cell.key}" x="${n1(cell.x0)}" y="${n1(Y(by(cell.y1)))}" width="${n1(cell.x1 - cell.x0)}" height="${n1(cell.h)}"><title>${cell.door ? 'Remove door' : 'Add door'}</title></rect>`);
      }));
    }

    // Part labels (technical drawing)
    if (opts.labels && cut) {
      const fs = Math.max(22, Math.min(W, H) * 0.028);
      const label = (x, y, txt, rot) => out.push(`<text x="${n1(x)}" y="${n1(Y(y))}" font-size="${n1(fs)}" font-family="Inter,Arial,sans-serif" font-weight="600" fill="#c0392b" text-anchor="middle" dominant-baseline="middle"${rot ? ` transform="rotate(-90 ${n1(x)} ${n1(Y(y))})"` : ''}>${txt}</text>`);
      cut.parts.forEach(p => {
        if (p.kind === 'side') label(p.id === 'S1' ? t / 2 : W - t / 2, base + (H - base) / 2, p.id, true);
        if (p.kind === 'horizontal') label(W / 2, by(p.level * (h + t) + t / 2) + fs * 0.6, p.id);
        if (p.kind === 'divider') label(p.x + t / 2, by(rows[p.row].y0 + (rows[p.row].y1 - rows[p.row].y0) / 2), p.id, true);
        if (p.kind === 'door') { const cl = rows.flatMap(r => r.cells).find(x => x.key === p.cell); label((cl.x0 + cl.x1) / 2, by((cl.y0 + cl.y1) / 2), p.id); }
      });
    }

    // Dimensions
    if (opts.dims) {
      const fs = Math.max(26, Math.max(W, H) * 0.032);
      const dc = '#6b675f';
      const yy = Y(H) - pad * 0.45;
      out.push(`<g stroke="${dc}" stroke-width="${n1(fs * 0.07)}" fill="none"><line x1="0" y1="${n1(yy)}" x2="${W}" y2="${n1(yy)}"/><line x1="0" y1="${n1(yy - fs * 0.4)}" x2="0" y2="${n1(yy + fs * 0.4)}"/><line x1="${W}" y1="${n1(yy - fs * 0.4)}" x2="${W}" y2="${n1(yy + fs * 0.4)}"/></g>`);
      out.push(`<text x="${W / 2}" y="${n1(yy - fs * 0.45)}" font-size="${n1(fs)}" font-family="Inter,Arial,sans-serif" fill="${dc}" text-anchor="middle">${W / 10} cm</text>`);
      const xx = W + pad * 0.42;
      out.push(`<g stroke="${dc}" stroke-width="${n1(fs * 0.07)}" fill="none"><line x1="${n1(xx)}" y1="${Y(H)}" x2="${n1(xx)}" y2="${Y(0)}"/><line x1="${n1(xx - fs * 0.4)}" y1="${Y(H)}" x2="${n1(xx + fs * 0.4)}" y2="${Y(H)}"/><line x1="${n1(xx - fs * 0.4)}" y1="${Y(0)}" x2="${n1(xx + fs * 0.4)}" y2="${Y(0)}"/></g>`);
      out.push(`<text x="${n1(xx + fs * 0.5)}" y="${n1(Y(H / 2))}" font-size="${n1(fs)}" font-family="Inter,Arial,sans-serif" fill="${dc}" text-anchor="middle" transform="rotate(90 ${n1(xx + fs * 0.5)} ${n1(Y(H / 2))})">${H / 10} cm</text>`);
    }

    out.push('</svg>');
    return out.join('');
  }

  const PART_COLORS = { side: '#d8c3a0', horizontal: '#c9d6c3', divider: '#c7d3de', door: '#e3c6bd', back: '#ddd6ea', plinth: '#d6d2c8' };

  function sheet(s, index, label) {
    const [SL, SW] = s.size;
    const out = [];
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -70 ${SL + 40} ${SW + 90}" class="sheet-svg" role="img" aria-label="Sheet ${index + 1}">`);
    out.push(`<text x="0" y="-25" font-size="44" font-family="Inter,Arial,sans-serif" font-weight="600" fill="#2b2a27">Sheet ${index + 1} · ${label} · ${SL}×${SW} mm · ${Math.round(s.used * 100)}% used</text>`);
    out.push(`<defs><pattern id="w${++uid}" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="30" height="30" fill="#f4f1ea"/><line x1="0" y1="0" x2="0" y2="30" stroke="#ddd6c8" stroke-width="8"/></pattern></defs>`);
    out.push(`<rect x="0" y="0" width="${SL}" height="${SW}" fill="url(#w${uid})" stroke="#8a857b" stroke-width="4"/>`);
    s.placed.forEach(q => {
      const p = q.part;
      const fs = Math.max(18, Math.min(52, Math.min(q.w, q.h) * 0.22));
      out.push(`<rect x="${n1(q.x)}" y="${n1(q.y)}" width="${n1(q.w)}" height="${n1(q.h)}" fill="${PART_COLORS[p.kind] || '#ddd'}" stroke="#5c574e" stroke-width="2.5"/>`);
      const dimTxt = `${p.L}×${p.Wd}`;
      if (q.w > fs * 2 && q.h > fs * 1.2) {
        out.push(`<text x="${n1(q.x + q.w / 2)}" y="${n1(q.y + q.h / 2)}" font-size="${n1(fs)}" font-family="Inter,Arial,sans-serif" font-weight="700" fill="#2b2a27" text-anchor="middle" dominant-baseline="middle">${p.id}</text>`);
        if (q.h > fs * 2.6 && q.w > fs * 5) out.push(`<text x="${n1(q.x + q.w / 2)}" y="${n1(q.y + q.h / 2 + fs * 1.05)}" font-size="${n1(fs * 0.6)}" font-family="Inter,Arial,sans-serif" fill="#4a463f" text-anchor="middle" dominant-baseline="middle">${dimTxt}${q.rot ? ' ↻' : ''}</text>`);
      }
    });
    out.push('</svg>');
    return out.join('');
  }

  MJERA.preview = { shelf, sheet, shade, PART_COLORS };
})();
