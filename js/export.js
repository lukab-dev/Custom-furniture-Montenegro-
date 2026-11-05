/*
 * Builds the DIY "cut-file package" and order summaries.
 */
(function () {
  const C = MJERA.config;
  const csvCell = v => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

  function cutlistCsv(model) {
    const { design, cut } = model;
    const rows = [['Part IDs', 'Part', 'Qty', 'Length (mm, grain)', 'Width (mm)', 'Thickness (mm)', 'Material', 'Colour', 'Grain matters', 'Edge banding', 'Rotate allowed']];
    MJERA.cutlist.grouped(cut).forEach(g => {
      const mat = g.group === 'back' ? design.material.back.name : design.material.name;
      rows.push([g.ids.join(' '), g.name, g.qty, g.L, g.Wd, g.T, mat, design.color.name,
        cut.grain ? 'yes' : 'no', g.edges.join(' + ') || '-', cut.grain ? 'no' : 'yes']);
    });
    return csv(rows);
  }

  function drillingCsv(model) {
    const rows = [['Part ID', 'Part', 'Face', 'X (mm along length)', 'Y (mm from front / hinge edge)', 'Diameter (mm)', 'Depth (mm)', 'Purpose']];
    model.cut.parts.forEach(p => p.holes.forEach(h => rows.push([p.id, p.name, h.face, h.x, h.y, h.d, h.depth, h.use])));
    return csv(rows);
  }

  function hardwareCsv(model) {
    return csv([['Item', 'Qty']].concat(model.cut.hardware.map(h => [h.name, h.qty])));
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
      `${C.brand} design — ${style.name}`,
      `Outer size: ${state.width} × ${state.height} × ${state.depth} cm (W × H × D)`,
      `Material: ${design.material.name}, ${design.color.name}`,
      `Rows: ${design.R} · Bays: ${design.rows.reduce((n, r) => n + r.cells.length, 0)} · Doors: ${(state.doors || []).length}`,
      `Back panels: ${state.back ? 'yes' : 'no'} · Base: ${state.base}`,
      `Panels: ${cut.parts.length} · Sheets: ${nest.reduce((n, g) => n + g.sheets.length, 0)} · Holes: ${cut.holes}`
    ];
    if (withPrice) {
      lines.push(`Made & checked: €${price.made}`, `Delivery (${price.zone.name}): €${price.delivery}`);
      if (state.assembly) lines.push(`Assembly: €${price.assembly}`);
      lines.push(`Estimated total: €${price.total} incl. VAT`);
    }
    lines.push(`Design link: ${MJERA.app.shareUrl()}`);
    return lines.join('\n');
  }

  function readme(model) {
    return [
      summaryText(model, false), '',
      'FILES',
      '  cutlist.csv          panel list, grouped. Length is along the grain.',
      '  drilling.csv         every hole per part ID. X along length from end 0, Y from front edge.',
      '  hardware.csv         screws, hinges, latches, legs.',
      '  sheets.svg           nesting layout for each stock sheet (open in a browser or Inkscape).',
      '  front-elevation.svg  where each part ID goes.',
      '  project.json         re-open this design on the website.', '',
      'NOTES',
      `  Board ${C.build.t} mm, saw kerf ${C.build.kerf} mm, sheet trim ${C.build.trim} mm each side.`,
      '  Sides run full height; top, bottom and shelves sit between them.',
      '  Dividers stand on shelves and are fixed with confirmat screws through the shelf.',
      '  Fix the unit to the wall with the anti-tip kit. Always.', '',
      'Built with ' + C.brand + ' — cut, drilled and delivered in Montenegro if you would rather not.'
    ].join('\r\n');
  }

  function files(model) {
    return {
      'cutlist.csv': cutlistCsv(model),
      'drilling.csv': drillingCsv(model),
      'hardware.csv': hardwareCsv(model),
      'sheets.svg': sheetsSvg(model),
      'front-elevation.svg': MJERA.preview.shelf(model.design, model.cut, { labels: true, dims: true }),
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
