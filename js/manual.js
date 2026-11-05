/*
 * Personal assembly manual + part labels, generated for each design.
 * Both are standalone, printable HTML documents (A4 landscape / A4 label sheet).
 *
 * Drawings show the shelf the way you see it while building: lying face-down,
 * bottom towards the wall (top of the page), growing towards you row by row.
 */
(function () {
  const C = MJERA.config;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const n1 = v => Math.round(v * 10) / 10;

  function designCode(state) {
    const str = JSON.stringify(state);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 'MJ-' + (h >>> 0).toString(36).toUpperCase().slice(0, 6);
  }

  // Isometric drawing of the shelf lying face-down: bottom towards the wall (back, top-right),
  // rows growing towards you. built/fresh: Sets of part ids; fresh parts are highlighted + labelled.
  function stepSvg(model, built, fresh, opts = {}) {
    const { design, cut } = model;
    const { W, Hb, t, h, rows, D, backT, base } = design;
    const Dc = D - backT;
    const P = (x, y, z) => [0.94 * x - 0.55 * y, 0.25 * x + 0.45 * y - 0.85 * z];
    const pts = arr => arr.map(q => { const [a, b] = P(...q); return n1(a) + ',' + n1(b); }).join(' ');
    const m = Math.max(W, Hb) * 0.06, gap = Math.max(D, 250);
    const fs = Math.max(24, Math.max(W, Hb) * 0.028);
    const items = [];
    const box = (id, x0, x1, y0, y1, z0, z1, kind) => items.push({ id, x0, x1, y0, y1, z0, z1, kind, isNew: kind === 'p' });
    const vis = id => built.has(id) || fresh.has(id);

    cut.parts.forEach(p => {
      if (!vis(p.id)) return;
      if (p.kind === 'horizontal') box(p.id, 0, W, p.level * (h + t), p.level * (h + t) + t, 0, Dc, 'c');
      else if (p.kind === 'end' || p.kind === 'divider') { const row = rows[p.row]; box(p.id, p.x, p.x + t, row.y0, row.y1, 0, Dc, 'c'); }
      else if (p.kind === 'back' || p.kind === 'brace') box(p.id, p.x0 || 0, (p.x0 || 0) + p.L, p.y0 || 0, (p.y0 || 0) + p.Wd, Dc, Dc + backT, 'b');
      else if (p.kind === 'plinth') { /* drawn as one frame below */ }
    });
    if (opts.plinth) box('plinth', 40, W - 40, -base, 0, 40, Dc, 'p');
    if (opts.legs) (W > 1200 ? [50, W / 2, W - 80] : [50, W - 80]).forEach((x, i) => { box('leg' + i, x, x + 30, -base, 0, 40, 70, 'p'); box('legb' + i, x, x + 30, -base, 0, Dc - 70, Dc - 40, 'p'); });
    items.sort((a, b) => (a.kind === 'b') - (b.kind === 'b') || a.y0 - b.y0 || a.x0 - b.x0);

    // extents
    const ext = [[-m, -gap - m, 0], [W + m, -gap - m, 0], [W + m, Hb + m, 0], [-m, Hb + m, 0], [-m, -gap - m, Dc * 2], [W + m, -gap - m, Dc * 2]].map(q => P(...q));
    const xs = ext.map(q => q[0]), ys = ext.map(q => q[1]);
    const vb = [Math.min(...xs) - m, Math.min(...ys) - m, Math.max(...xs) - Math.min(...xs) + 2 * m, Math.max(...ys) - Math.min(...ys) + 2 * m];
    const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(n1).join(' ')}" class="step-svg" stroke-linejoin="round">`];
    // floor + wall
    out.push(`<polygon points="${pts([[-m, -gap, 0], [W + m, -gap, 0], [W + m, Hb + m, 0], [-m, Hb + m, 0]])}" fill="#f4f1ea" stroke="#d6cfc2" stroke-width="${n1(fs * 0.05)}" stroke-dasharray="${n1(fs * 0.4)}"/>`);
    out.push(`<polygon points="${pts([[-m, -gap, 0], [W + m, -gap, 0], [W + m, -gap, Dc * 2], [-m, -gap, Dc * 2]])}" fill="#e6e0d5"/>`);
    const [wx, wy] = P(W / 2, -gap, Dc * 1.1);
    out.push(`<text x="${n1(wx)}" y="${n1(wy)}" font-size="${n1(fs * 0.8)}" fill="#8a857b" font-weight="600" letter-spacing="4" text-anchor="middle">WALL</text>`);

    const col = (isNew, kind) => kind === 'b'
      ? (isNew ? ['#f0c4b2', '#dd9f88', '#cc8b73'] : ['#ebe5db', '#d6cec0', '#c8bfaf'])
      : isNew ? ['#f2c9b8', '#e0a68f', '#cf8f77'] : ['#f3efe8', '#ddd5c7', '#cbc2b2'];
    const sw = n1(fs * 0.05);
    items.forEach(it => {
      const isNew = fresh.has(it.id) || it.isNew;
      const [cTop, cFront, cRight] = col(isNew, it.kind);
      const { x0, x1, y0, y1, z0, z1 } = it;
      const stroke = isNew ? '#8f4834' : '#7d776c';
      out.push(`<g stroke="${stroke}" stroke-width="${sw}">` +
        `<polygon points="${pts([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="${cRight}"/>` +
        `<polygon points="${pts([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" fill="${cFront}"/>` +
        `<polygon points="${pts([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])}" fill="${cTop}"/></g>`);
    });
    // cams to turn
    if (opts.cams) opts.cams.forEach(([x, y]) => { const [a, b] = P(x, y, Dc); out.push(`<text x="${n1(a)}" y="${n1(b)}" font-size="${n1(fs * 1.1)}" text-anchor="middle" dominant-baseline="central" fill="#8f4834" font-weight="700">↻</text>`); });
    // labels for new parts
    items.filter(it => fresh.has(it.id) && cut.parts.some(p => p.id === it.id)).forEach(it => {
      const [a, b] = P((it.x0 + it.x1) / 2, (it.y0 + it.y1) / 2, it.z1);
      out.push(`<circle cx="${n1(a)}" cy="${n1(b - fs * 1.2)}" r="${n1(fs * 0.85)}" fill="#1f1e1b"/><text x="${n1(a)}" y="${n1(b - fs * 1.2)}" font-size="${n1(fs * 0.7)}" fill="#fff" font-weight="700" text-anchor="middle" dominant-baseline="central">${esc(it.id)}</text>` +
        `<line x1="${n1(a)}" y1="${n1(b - fs * 0.35)}" x2="${n1(a)}" y2="${n1(b)}" stroke="#1f1e1b" stroke-width="${n1(fs * 0.08)}"/>`);
    });
    const [lx, ly] = P(-m * 0.6, Hb + m * 0.9, 0);
    out.push(`<text x="${n1(lx)}" y="${n1(ly)}" font-size="${n1(fs * 0.75)}" fill="#6b675f" font-weight="600">◀ LEFT</text>`);
    const [rx, ry] = P(W, Hb + m * 0.9, 0);
    out.push(`<text x="${n1(rx)}" y="${n1(ry + fs)}" font-size="${n1(fs * 0.65)}" fill="#8a857b" text-anchor="end">front faces the floor · you stand here</text>`);
    out.push('</svg>');
    return out.join('');
  }

  function partsList(cut, ids) {
    const list = cut.parts.filter(p => ids.includes(p.id));
    return '<ul class="parts">' + list.map(p => `<li><span class="id">${esc(p.id)}</span><span>${esc(p.name)}<small>${p.L} × ${p.Wd} mm · package #${p.pkg}</small></span></li>`).join('') + '</ul>';
  }

  function manualHtml(model) {
    const { state, design, cut } = model;
    const { R, rows, t, h, W, Hb } = design;
    const code = designCode(state);
    const style = C.styles.find(s => s.id === state.style);
    const H = cut.parts.filter(p => p.kind === 'horizontal').sort((a, b) => a.level - b.level);
    const vertsOf = r => cut.parts.filter(p => (p.kind === 'end' || p.kind === 'divider') && p.row === r).sort((a, b) => a.x - b.x);
    const pages = [];
    const page = (title, body, n) => pages.push(`<section class="page"><header><h2>${n ? `<span class="n">${String(n).padStart(2, '0')}</span>` : ''}${title}</h2><span class="code">${C.brand} · ${code}</span></header>${body}<footer>${pages.length + 1}</footer></section>`);

    // Cover
    page('Your shelf manual', `<div class="cover"><div><p class="big">${esc(style.name)} · ${state.width} × ${state.height} × ${state.depth} cm</p>
      <p>${esc(design.material.name)}, ${esc(design.color.name)}<br>${R} rows · ${rows.reduce((n, r) => n + r.cells.length, 0)} bays · ${cut.parts.filter(p => p.kind === 'door').length} doors<br>${cut.parts.length} panels in ${new Set(cut.parts.map(p => p.pkg)).size + 1} packages</p>
      <p class="muted">Design code ${code}. Keep this manual: it is made for this shelf only.</p></div>
      <div class="drawing">${MJERA.preview.shelf(design, cut, { labels: true, dims: true })}</div></div>`);

    // Tips
    page('Read before you start', `<div class="tips">
      <div><b>Two people.</b><p>Building takes one person; lifting takes two.</p></div>
      <div><b>Build next to the wall.</b><p>Protect the floor with the cardboard or a rug, right where the shelf will stand.</p></div>
      <div><b>Face-down, bottom to the wall.</b><p>Leave a gap of about one shelf depth (${state.depth} cm) between the bottom edge and the wall, so it stands up in place.</p></div>
      <div><b>Read the stickers.</b><p>Each part has an ID. <b>▼ FRONT</b> marks the edge that goes on the floor. <b>◀ LEFT</b> / <b>◀ BOTTOM</b> marks the end that points left or down.</p></div>
      <div><b>Start with the lowest row.</b><p>Then work towards yourself, one row at a time, exactly as the steps show.</p></div>
      <div><b>Tools.</b><p>PH2 screwdriver, rubber mallet (tap through a scrap of board), drill for the wall plugs.</p></div>
      <div class="warn"><b>⚠ Fix it to the wall.</b><p>The wall brackets are in the hardware bag. An unfixed shelf can tip over.</p></div>
    </div>`);

    // Parts & hardware
    const groups = MJERA.cutlist.grouped(cut).sort((a, b) => a.pkg - b.pkg);
    page('What is in the boxes', `<div class="two"><table><thead><tr><th>Package</th><th>IDs</th><th>Part</th><th>Size (mm)</th></tr></thead><tbody>
      ${groups.map(g => `<tr><td>#${g.pkg} ${esc(cut.PKG_NAMES[g.pkg])}</td><td>${g.ids.join(' ')}</td><td>${esc(g.name)}</td><td>${g.L} × ${g.Wd}</td></tr>`).join('')}
      </tbody></table><table><thead><tr><th>#6 Hardware</th><th>Qty</th></tr></thead><tbody>
      ${cut.hardware.map(x => `<tr><td>${esc(x.name)}</td><td>${x.qty}</td></tr>`).join('')}</tbody></table></div>
      <p class="muted">Dowels, cam bolts, cams and hinge cups come already fitted to the panels.</p>`);

    // Build steps
    let n = 1;
    const built = new Set();
    page('The bottom', `<div class="step"><div class="text">${partsList(cut, [H[0].id])}
      <p>Stand <b>${H[0].id}</b> on its front edge (▼ FRONT on the floor), close to the wall and parallel to it, with ◀ LEFT to your left.</p></div>
      <div class="drawing">${stepSvg(model, built, new Set([H[0].id]))}</div></div>`, n++);
    built.add(H[0].id);
    for (let r = 0; r < R; r++) {
      const vs = vertsOf(r);
      const ends = vs.filter(p => p.kind === 'end'), divs = vs.filter(p => p.kind === 'divider');
      page(`Row ${r + 1}: ends and dividers`, `<div class="step"><div class="text">${partsList(cut, vs.map(p => p.id))}
        <ol><li>Push the end panels <b>${ends.map(p => p.id).join(' and ')}</b> onto the dowels of <b>${H[r].id}</b>, ◀ BOTTOM towards ${H[r].id}, cam holes facing inwards.</li>
        ${divs.length ? `<li>Push in the dividers <b>${divs.map(p => p.id).join(', ')}</b> the same way.</li>` : ''}
        <li>Check every front edge is flat on the floor. If a part is tight, tap it with the mallet through a scrap of board.</li></ol></div>
        <div class="drawing">${stepSvg(model, built, new Set(vs.map(p => p.id)))}</div></div>`, n++);
      vs.forEach(p => built.add(p.id));
      const top = H[r + 1];
      const cams = ends.flatMap(p => [[p.x + t / 2, rows[r].y0 + 40], [p.x + t / 2, rows[r].y1 - 40]]);
      page(r + 1 === R ? 'The top' : `Shelf ${top.id}`, `<div class="step"><div class="text">${partsList(cut, [top.id])}
        <ol><li>Lay <b>${top.id}</b> onto the row, ◀ LEFT to your left, front edge on the floor.</li>
        <li>Press it down onto all the dowels, starting at one end.</li>
        <li>Turn the cams in <b>${ends.map(p => p.id).join(' and ')}</b> a quarter turn clockwise (PH2) until the joint pulls tight. Do not over-tighten.</li></ol></div>
        <div class="drawing">${stepSvg(model, built, new Set([top.id]), { cams })}</div></div>`, n++);
      built.add(top.id);
    }

    // Back or braces
    const backs = cut.parts.filter(p => p.kind === 'back' || p.kind === 'brace');
    if (backs.length) {
      page(state.back ? 'The back' : 'End braces', `<div class="step"><div class="text">${partsList(cut, backs.map(p => p.id))}
        <ol><li>Lay ${state.back ? 'the back panel' + (backs.length > 1 ? 's' : '') : 'a brace on each end of every row'} on, ◀ BOTTOM towards the wall.</li>
        <li>Line the edges up with the outside of the shelf. The pre-drilled holes sit right over the shelves and panels.</li>
        <li>Screw down with the 3.5×16 screws, corners first. This squares the shelf.</li></ol></div>
        <div class="drawing">${stepSvg(model, built, new Set(backs.map(p => p.id)))}</div></div>`, n++);
      backs.forEach(p => built.add(p.id));
    }

    // Base
    if (state.base !== 'none') {
      const plinth = cut.parts.filter(p => p.kind === 'plinth');
      page(state.base === 'plinth' ? 'The plinth' : 'The legs', `<div class="step"><div class="text">${plinth.length ? partsList(cut, plinth.map(p => p.id)) : ''}
        ${state.base === 'plinth'
          ? `<ol><li>Glue the dowels and push the plinth frame together: returns between the front and back rail.</li><li>Place it against the outside of <b>${H[0].id}</b>, set back 40 mm from the front and fixed with the angle brackets.</li></ol>`
          : `<ol><li>Screw the ${cut.hardware.find(x => x.id === 'leg').qty} legs to the outside of <b>${H[0].id}</b>, about 50 mm in from each corner${W > 1200 ? ' plus two in the middle' : ''}.</li></ol>`}</div>
        <div class="drawing">${stepSvg(model, built, new Set(), { plinth: state.base === 'plinth', legs: state.base === 'legs' })}</div></div>`, n++);
    }

    // Lift and fix
    page('Stand it up and fix it to the wall', `<div class="step"><div class="text">
      <ol><li>With two people, lift the shelf by the vertical panels, as close to the middle as possible. It pivots on its bottom edge and ends up against the wall.</li>
      <li>Screw the ${cut.wallBrackets} L-brackets to the top of <b>${H[R].id}</b>, then mark, drill and plug the wall. Use plugs that suit your wall.</li>
      <li class="warn">Never use the shelf before it is fixed to the wall.</li></ol></div>
      <div class="drawing">${MJERA.preview.shelf(design, cut, { dims: true })}</div></div>`, n++);

    // Doors
    const doors = cut.parts.filter(p => p.kind === 'door');
    if (doors.length) {
      page('Doors', `<div class="step"><div class="text">${partsList(cut, doors.map(p => p.id))}
        <ol><li>Hook each hinge onto its mounting plate at the front, then press the back until it clicks.</li>
        <li>Fit the push latch on the side opposite the hinges, so a push opens the door.</li>
        <li>Door crooked? Adjust the hinge screws with a PH2: front screw = depth, middle = height, rear = side to side.</li></ol></div>
        <div class="drawing">${MJERA.preview.shelf(design, cut, { labels: true })}</div></div>`, n++);
    }

    // Care
    page('Looking after it', `<div class="tips">
      <div><b>Wipe spills quickly.</b><p>Don't let water stand on the surface.</p></div>
      <div><b>Soft, damp cloth.</b><p>Mild cleaners only, no scourers.</p></div>
      <div><b>Away from heat.</b><p>Keep it clear of radiators and open flame.</p></div>
      <div><b>Moving house?</b><p>Turn the cams back and it comes apart the same way it went together.</p></div>
      <div><b>Something not right?</b><p>${esc(C.contactEmail)} · quote ${code}</p></div>
    </div>`);

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${C.brand} manual ${code}</title><style>
      @page { size: A4 landscape; margin: 12mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font: 14px/1.5 "Inter", Arial, sans-serif; color: #1f1e1b; background: #ebe6dd; }
      .page { background: #fff; width: 100%; max-width: 1100px; margin: 16px auto; padding: 28px 36px 18px; min-height: 700px; display: flex; flex-direction: column; break-after: page; position: relative; }
      header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #e4ded3; margin-bottom: 18px; }
      h2 { font: 400 30px/1.2 Georgia, serif; margin: 0 0 10px; }
      .n { display: inline-block; min-width: 54px; color: #b7634a; font-weight: 600; }
      .code { color: #8a857b; font-size: 12px; }
      footer { margin-top: auto; text-align: right; color: #8a857b; font-size: 12px; }
      .cover { display: grid; grid-template-columns: 1fr 1.3fr; gap: 32px; align-items: center; flex: 1; }
      .big { font: 400 26px/1.25 Georgia, serif; }
      .muted { color: #6b675f; font-size: 13px; }
      .drawing svg { width: 100%; height: auto; max-height: 520px; display: block; }
      .tips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .tips div { background: #f6f3ee; border-radius: 12px; padding: 16px 18px; }
      .tips p { margin: 6px 0 0; color: #4a463f; }
      .warn { background: #fbf0e3 !important; color: #7a4a1d; }
      .two { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; align-items: start; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { text-align: left; color: #6b675f; font-weight: 600; border-bottom: 1px solid #e4ded3; padding: 6px; }
      td { padding: 6px; border-bottom: 1px solid #f0ebe3; vertical-align: top; }
      .step { display: grid; grid-template-columns: 1fr 1.6fr; gap: 28px; flex: 1; align-items: center; }
      .step ol { padding-left: 20px; } .step li { margin-bottom: 8px; }
      .parts { list-style: none; padding: 0; margin: 0 0 14px; display: grid; gap: 8px; }
      .parts li { display: flex; gap: 12px; align-items: center; }
      .parts .id { background: #1f1e1b; color: #fff; border-radius: 999px; min-width: 42px; height: 42px; display: grid; place-items: center; font-weight: 700; font-size: 14px; }
      .parts small { display: block; color: #6b675f; }
      li.warn { padding: 8px 10px; border-radius: 8px; list-style: none; margin-left: -20px; }
      .printbar { position: sticky; top: 0; background: #1f1e1b; color: #fff; padding: 10px 16px; text-align: center; font-size: 14px; }
      .printbar button { margin-left: 10px; padding: 6px 14px; border-radius: 999px; border: 0; cursor: pointer; }
      @media print { body { background: #fff; } .page { margin: 0; max-width: none; min-height: 0; height: 185mm; padding: 0; } .printbar { display: none; } }
      @media (max-width: 760px) { .page { padding: 18px; min-height: 0; } .cover, .step, .two { grid-template-columns: 1fr; } .tips { grid-template-columns: 1fr; } }
    </style></head><body><div class="printbar">${C.brand} assembly manual for ${code}<button onclick="print()">Print / save PDF</button></div>${pages.join('')}</body></html>`;
  }

  function labelsHtml(model) {
    const { state, cut } = model;
    const code = designCode(state);
    const arrow = p => p.kind === 'horizontal' ? '◀ LEFT end' : (p.kind === 'back' || p.kind === 'brace' || p.kind === 'end' || p.kind === 'divider') ? '◀ BOTTOM end' : p.kind === 'door' ? '◀ HINGE side' : '';
    const edge = p => (p.kind === 'back' || p.kind === 'brace') ? 'countersinks face out' : p.kind === 'plinth' ? '▼ FLOOR edge' : '▼ FRONT edge';
    const cells = cut.parts.map(p => `<div class="lbl"><div class="top"><span class="id">${esc(p.id)}</span><span class="pkg">#${p.pkg}</span></div>
      <div class="name">${esc(p.name)} · ${p.L}×${p.Wd}×${p.T}</div><div class="arrows"><span>${arrow(p)}</span><span>${edge(p)}</span></div>
      <div class="code">${C.brand} ${code}</div></div>`).join('');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${C.brand} labels ${code}</title><style>
      @page { size: A4; margin: 8mm 6mm; }
      body { margin: 0; font: 11px/1.3 Arial, sans-serif; color: #111; }
      .sheet { display: grid; grid-template-columns: repeat(3, 66mm); grid-auto-rows: 35mm; gap: 2mm 3mm; justify-content: center; }
      .lbl { border: 0.3mm dashed #bbb; padding: 2.5mm 3mm; display: flex; flex-direction: column; justify-content: space-between; break-inside: avoid; }
      .top { display: flex; justify-content: space-between; align-items: baseline; }
      .id { font-size: 26px; font-weight: 700; } .pkg { font-size: 14px; font-weight: 700; }
      .arrows { display: flex; justify-content: space-between; font-weight: 700; font-size: 11px; }
      .code { color: #666; font-size: 9px; }
      .note { font: 12px Arial; margin: 6mm; }
      @media print { .note { display: none; } }
    </style></head><body><p class="note">Print on A4 label sheets (3 × 8, 70 × 37 mm). Stick each label on the inside face near the front edge, with ▼ FRONT pointing at that edge.</p><div class="sheet">${cells}</div></body></html>`;
  }

  function open(html) {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const w = window.open(url, '_blank');
    if (!w) location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  MJERA.manual = { manualHtml, labelsHtml, designCode, open, stepSvg };
})();
