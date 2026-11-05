/*
 * Builds the DIY "cut-file package" and order summaries.
 */
(function () {
  const C = MJERA.config;
  const t = (...a) => MJERA.t(...a);
  const csvCell = v => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

  function cutlistCsv(model) {
    const { design, cut } = model;
    const rows = [['Part IDs', 'Part', 'Qty', 'Length (mm, grain)', 'Width (mm)', 'Thickness (mm)', 'Material', 'Colour', 'Grain matters', 'Edge banding', 'Rotate allowed'].map(x => t(x))];
    MJERA.cutlist.grouped(cut).forEach(g => {
      const mat = t(g.group === 'back' ? design.material.back.name : design.material.name);
      rows.push([g.ids.join(' '), t(g.name), g.qty, g.L, g.Wd, g.T, mat, t(design.color.name),
        t(cut.grain ? 'yes' : 'no'), g.edges.join(' + ') || '-', t(cut.grain ? 'no' : 'yes')]);
    });
    return csv(rows);
  }

  function drillingCsv(model) {
    const rows = [['Part ID', 'Part', 'Face', 'X (mm along length)', 'Y (mm from front / hinge edge)', 'Diameter (mm)', 'Depth (mm)', 'Purpose'].map(x => t(x))];
    model.cut.parts.forEach(p => p.holes.forEach(h => rows.push([p.id, t(p.name), t(h.face), h.x, h.y, h.d, t(String(h.depth)), t(h.use)])));
    return csv(rows);
  }

  function hardwareCsv(model) {
    return csv([[t('Item'), t('Qty')]].concat(model.cut.hardware.map(h => [t(h.name, h.vars), h.qty])));
  }

  function sheetsSvg(model) {
    // stack all sheets vertically in one printable SVG
    const svgs = [];
    model.nest.forEach(g => g.sheets.forEach(s => svgs.push({ s, label: g.label })));
    let y = 0; const W = Math.max(...svgs.map(o => o.s.size[0])) + 40;
    const body = svgs.map((o, i) => {
      const inner = MJERA.preview.sheet(o.s, i, o.label).replace('<svg ', `<svg x="0" y="${y}" width="${o.s.size[0] + 40}" height="${o.s.size[1] + 90}" `);
      y += o.s.size[1] + 140;
      return inner;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${y}" width="${W / 4}mm" height="${y / 4}mm"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`;
  }

  function summaryText(model, withPrice) {
    const { state, design, cut, price, nest } = model;
    const style = C.styles.find(s => s.id === state.style);
    const lines = [
      t('{brand} design — {style}', { brand: C.brand, style: t(style.name) }),
      t('Outer size: {w} × {h} × {d} cm (W × H × D)', { w: state.width, h: state.height, d: state.depth }),
      t('Material: {m}, {c}', { m: t(design.material.name), c: t(design.color.name) }),
      t('Rows: {r} · Bays: {b} · Doors: {d}', { r: design.R, b: design.rows.reduce((n, r) => n + r.cells.length, 0), d: (state.doors || []).length }),
      t('Back panels: {yes} · Base: {base}', { yes: t(state.back ? 'yes' : 'no'), base: t({ none: 'None', plinth: 'Plinth', legs: 'Legs' }[state.base]) }),
      t('Panels: {p} · Sheets: {s} · Holes: {h}', { p: cut.parts.length, s: nest.reduce((n, g) => n + g.sheets.length, 0), h: cut.holes })
    ];
    if (withPrice) {
      lines.push(t('Made & checked: €{x}', { x: price.made }), t('Delivery ({zone}): €{x}', { zone: t(price.zone.name), x: price.delivery }));
      if (state.assembly) lines.push(t('Assembly: €{x}', { x: price.assembly }));
      lines.push(t('Estimated total: €{x} incl. VAT', { x: price.total }));
    }
    lines.push(t('Design link: {url}', { url: MJERA.app.shareUrl() }));
    return lines.join('\n');
  }

  function readme(model) {
    const b = C.build;
    return [
      summaryText(model, false), '',
      t('FILES'),
      '  cutlist.csv          ' + t('panel list, grouped. Length is along the grain.'),
      '  drilling.csv         ' + t('every hole per part ID. X along length from end 0, Y from front edge.'),
      '  hardware.csv         ' + t('screws, hinges, latches, legs.'),
      '  sheets.svg           ' + t('nesting layout for each stock sheet (open in a browser or Inkscape).'),
      '  front-elevation.svg  ' + t('where each part ID goes.'),
      '  assembly-manual.html ' + t('step-by-step manual for this exact shelf (open in a browser, print or save as PDF).'),
      '  labels.html          ' + t('part stickers: ID, package, FRONT and LEFT/BOTTOM arrows.'),
      '  project.json         ' + t('re-open this design on the website.'), '',
      t('CONSTRUCTION'),
      '  ' + t('Board {t} mm, saw kerf {k} mm, sheet trim {tr} mm each side.', { t: b.t, k: b.kerf, tr: b.trim }),
      '  ' + t('Bottom, shelves and top run the full width. Each row has its own end panels and dividers standing between two shelves.'),
      '  ' + t('End panel joints: 2 dowels Ø8 + Minifix 15 cam lock(s); cam on the inside face, bolt in the shelf. Divider joints: dowels only.'),
      '  ' + t('The back (or the end braces when there is no back) overlays the carcass, so carcass parts are shallower by its thickness.'),
      '  ' + t('Drilling X runs from end 0 (LEFT end of shelves, BOTTOM end of verticals). Y is measured from the FRONT edge (from the bottom edge on back panels).'),
      '  ' + t('Hinge plate holes assume inset clip-on hinges (37 mm system line + door thickness). Check against your hinge spec.'), '',
      t('ASSEMBLY: see assembly-manual.html. In short: build face-down next to the wall, bottom towards the wall, one row at a time from the bottom; lock the cams; screw on the back; stand it up; fix it to the wall.'), '',
      t('Built with {brand} — cut, drilled and delivered in Montenegro if you would rather not.', { brand: C.brand })
    ].join('\r\n');
  }

  function files(model) {
    return {
      'cutlist.csv': cutlistCsv(model),
      'drilling.csv': drillingCsv(model),
      'hardware.csv': hardwareCsv(model),
      'sheets.svg': sheetsSvg(model),
      'front-elevation.svg': MJERA.preview.shelf(model.design, model.cut, { labels: true, dims: true }),
      'assembly-manual.html': MJERA.manual.manualHtml(model),
      'labels.html': MJERA.manual.labelsHtml(model),
      'project.json': JSON.stringify({ app: 'mjera', version: 1, design: model.state }, null, 2),
      'README.txt': readme(model)
    };
  }

  function download(name, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type || 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function downloadPackage(model) {
    const f = files(model);
    const stamp = `mjera-${model.state.width}x${model.state.height}x${model.state.depth}`;
    if (window.JSZip) {
      const zip = new JSZip();
      const dir = zip.folder(stamp);
      Object.entries(f).forEach(([n, c]) => dir.file(n, c));
      download(stamp + '.zip', await zip.generateAsync({ type: 'blob' }));
    } else {
      Object.entries(f).forEach(([n, c], i) => setTimeout(() => download(`${stamp}-${n}`, c), i * 300));
    }
  }

  MJERA.exporter = { files, downloadPackage, summaryText, download };
})();
