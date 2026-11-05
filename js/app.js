(function () {
  const C = MJERA.config;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const DEFAULT = {
    style: 'raster', width: 160, height: 120, depth: 32, rows: 3, density: 45,
    material: 'ply', color: 'natural', back: true, base: 'plinth', doors: ['0-0', '0-3'],
    seed: 7, delivery: 'pg', assembly: true
  };

  let state = loadState();
  let model = null;

  // ---------- state & URL ----------
  function encode(s) { return btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/=+$/, ''); }
  function decode(str) { return JSON.parse(decodeURIComponent(escape(atob(str)))); }

  function loadState() {
    const m = location.hash.match(/d=([A-Za-z0-9+/_-]+)/);
    if (m) { try { return sanitize({ ...DEFAULT, ...decode(m[1].replace(/-/g, '+').replace(/_/g, '/')) }); } catch (e) { /* ignore */ } }
    return { ...DEFAULT };
  }
  function sanitize(s) {
    const L = C.limits;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, Number(v) || a));
    s.width = clamp(s.width, L.width.min, L.width.max);
    s.height = clamp(s.height, L.height.min, L.height.max);
    if (!L.depths.includes(Number(s.depth))) s.depth = L.depths[1];
    if (!C.styles.some(x => x.id === s.style)) s.style = 'raster';
    const mat = C.materials.find(m => m.id === s.material) || C.materials[0];
    s.material = mat.id;
    if (!mat.colors.some(c => c.id === s.color)) s.color = mat.colors[0].id;
    if (!['none', 'plinth', 'legs'].includes(s.base)) s.base = 'plinth';
    s.density = clamp(s.density, 0, 100);
    s.doors = Array.isArray(s.doors) ? s.doors.filter(k => typeof k === 'string').slice(0, 200) : [];
    return s;
  }
  function shareUrl() {
    const enc = encode(state).replace(/\+/g, '-').replace(/\//g, '_');
    return location.href.split('#')[0] + '#d=' + enc;
  }

  // ---------- model ----------
  function compute() {
    const range = MJERA.layout.rowRange(state);
    state.rows = Math.min(range.max, Math.max(range.min, state.rows));
    const design = MJERA.layout.build(state);
    const keys = new Set(design.rows.flatMap(r => r.cells.map(c => c.key)));
    state.doors = state.doors.filter(k => keys.has(k));
    design.rows.forEach(r => r.cells.forEach(c => { c.door = state.doors.includes(c.key); }));
    const cut = MJERA.cutlist.build(design);
    const nest = MJERA.nesting.nest(design, cut);
    const price = MJERA.pricing.compute(design, cut, nest, state);
    model = { state, design, cut, nest, price };
    return model;
  }

  // ---------- UI building ----------
  function buildControls() {
    // styles
    $('#styles').innerHTML = C.styles.map(s => {
      const demo = MJERA.layout.build({ ...DEFAULT, style: s.id, width: 140, height: 90, depth: 32, rows: 3, density: 55, base: 'none', doors: [], back: true, material: 'ply', color: 'natural' });
      return `<button type="button" class="style-card" data-style="${s.id}">
        <span class="style-thumb">${MJERA.preview.shelf(demo, null, { mini: true })}</span>
        <span class="style-name">${s.name}</span><span class="style-desc">${s.desc}</span></button>`;
    }).join('');
    $('#styles').addEventListener('click', e => {
      const b = e.target.closest('[data-style]'); if (!b) return;
      set({ style: b.dataset.style });
    });

    const L = C.limits;
    Object.assign($('#width'), { min: L.width.min, max: L.width.max, step: L.width.step });
    Object.assign($('#height'), { min: L.height.min, max: L.height.max, step: L.height.step });
    ['width', 'height', 'rows', 'density'].forEach(id => $('#' + id).addEventListener('input', e => set({ [id]: Number(e.target.value) })));

    $('#depth').innerHTML = L.depths.map(d => `<button type="button" data-v="${d}">${d} cm</button>`).join('');
    seg('#depth', v => set({ depth: Number(v) }));
    $('#material').innerHTML = C.materials.map(m => `<button type="button" data-v="${m.id}">${m.short}</button>`).join('');
    seg('#material', v => {
      const m = C.materials.find(x => x.id === v);
      set({ material: v, color: m.colors.some(c => c.id === state.color) ? state.color : m.colors[0].id });
    });
    seg('#base', v => set({ base: v }));
    $('#colors').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) set({ color: b.dataset.v }); });
    $('#back').addEventListener('change', e => set({ back: e.target.checked }));
    $('#assembly').addEventListener('change', e => set({ assembly: e.target.checked }));
    $('#delivery').innerHTML = C.pricing.delivery.map(z => `<option value="${z.id}">${z.name} — ${z.price ? '€' + z.price : 'free'}</option>`).join('');
    $('#delivery').addEventListener('change', e => set({ delivery: e.target.value }));
    $('#shuffle').addEventListener('click', () => set({ seed: Math.floor(Math.random() * 1e6) }));
    $('#clear-doors').addEventListener('click', () => set({ doors: [] }));

    $('#preview').addEventListener('click', e => {
      const hit = e.target.closest('.hit'); if (!hit) return;
      const k = hit.dataset.key;
      set({ doors: state.doors.includes(k) ? state.doors.filter(x => x !== k) : state.doors.concat(k) });
    });

    $$('.tab').forEach(t => t.addEventListener('click', () => {
      $$('.tab').forEach(x => { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
      $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + t.dataset.view));
    }));

    $('#btn-export').addEventListener('click', openExport);
    $('#btn-pay').addEventListener('click', pay);
    $('#btn-order').addEventListener('click', openOrder);
    $('#btn-share').addEventListener('click', () => copy(shareUrl(), 'Link copied — share or bookmark it.'));
    $('#order-form').addEventListener('submit', submitOrder);
    $$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
    $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

    // Mobile: one option group at a time under the pinned preview
    $('#ctrl-tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-group]'); if (!b) return;
      setGroup(b.dataset.group);
      const top = $('#configure').getBoundingClientRect().top + window.scrollY - headerHeight();
      if (window.scrollY > top + 2) window.scrollTo({ top, behavior: 'smooth' });
    });
    setGroup('style');
    $('#mbar-files').addEventListener('click', openExport);
    $('#mbar-order').addEventListener('click', openOrder);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        $('#mbar').classList.toggle('show', en.isIntersecting);
        $('#mbar').setAttribute('aria-hidden', !en.isIntersecting);
      }, { rootMargin: '-30% 0px -30% 0px' }).observe($('#configure'));
    }

    // Drag handles on the preview
    const pv = $('#preview');
    let drag = null;
    pv.addEventListener('pointerdown', e => {
      const hd = e.target.closest('[data-handle]'); if (!hd) return;
      e.preventDefault();
      const ctm = pv.querySelector('svg').getScreenCTM();
      drag = { k: hd.dataset.handle, x: e.clientX, y: e.clientY, w: state.width, h: state.height, mmPx: 1 / ctm.a };
      pv.setPointerCapture(e.pointerId);
      pv.classList.add('dragging');
    });
    pv.addEventListener('pointermove', e => {
      if (!drag) return;
      const L = C.limits;
      const clamp = (v, a, b) => Math.min(b, Math.max(a, Math.round(v)));
      if (drag.k === 'w') set({ width: clamp(drag.w + 2 * (e.clientX - drag.x) * drag.mmPx / 10, L.width.min, L.width.max) });
      else set({ height: clamp(drag.h - (e.clientY - drag.y) * drag.mmPx / 10, L.height.min, L.height.max) });
    });
    const endDrag = () => { drag = null; pv.classList.remove('dragging'); };
    pv.addEventListener('pointerup', endDrag);
    pv.addEventListener('pointercancel', endDrag);

    const mail = $('#footer-mail'); mail.textContent = C.contactEmail; mail.href = 'mailto:' + C.contactEmail;
    $('#hero-export-price').textContent = C.pricing.exportPackage;
    $('#plan-export-price').textContent = C.pricing.exportPackage;
  }

  function headerHeight() {
    const h = document.querySelector('.site-header');
    return getComputedStyle(h).position === 'sticky' ? h.offsetHeight : 0;
  }
  function setGroup(g) {
    $$('#ctrl-tabs [data-group]').forEach(b => { b.classList.toggle('is-on', b.dataset.group === g); b.setAttribute('aria-selected', b.dataset.group === g); });
    $$('.panel .group').forEach(el => el.classList.toggle('is-current', el.dataset.group === g));
  }

  function seg(sel, onPick) {
    $(sel).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) onPick(b.dataset.v); });
  }
  function markSeg(sel, v) { $$(sel + ' [data-v]').forEach(b => b.classList.toggle('is-on', b.dataset.v === String(v))); }

  // ---------- render ----------
  let raf = 0;
  function set(patch) {
    Object.assign(state, patch);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(render);
  }

  function render() {
    const { design, cut, nest, price } = compute();
    const s = state;

    $$('.style-card').forEach(b => b.classList.toggle('is-on', b.dataset.style === s.style));
    $('#shuffle').hidden = s.style !== 'mosaic';
    $('#width').value = s.width; $('#width-out').textContent = s.width + ' cm';
    $('#height').value = s.height; $('#height-out').textContent = s.height + ' cm';
    Object.assign($('#rows'), { min: design.rowRange.min, max: design.rowRange.max, value: design.R });
    $('#rows').disabled = design.rowRange.min === design.rowRange.max;
    $('#rows-out').textContent = `${design.R} · ${Math.round(design.h / 10)} cm`;
    $('#density').value = s.density;
    const bays = design.rows.reduce((n, r) => n + r.cells.length, 0);
    $('#density-out').textContent = bays + ' bays';
    markSeg('#depth', s.depth); markSeg('#material', s.material); markSeg('#base', s.base);
    $('#material-desc').textContent = design.material.desc;
    $('#colors').innerHTML = design.material.colors.map(c =>
      `<button type="button" class="swatch${c.id === s.color ? ' is-on' : ''}" data-v="${c.id}" style="--c:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`).join('');
    $('#color-name').textContent = design.color.name;
    $('#back').checked = s.back;
    $('#assembly').checked = s.assembly;
    $('#delivery').value = s.delivery;
    $('#clear-doors').hidden = !s.doors.length;

    $('#preview').innerHTML = MJERA.preview.shelf(design, cut, { interactive: true, dims: true });
    $('#readout').textContent = `${s.width} × ${s.height} × ${s.depth} cm`;
    $('#warnings').innerHTML = design.warnings.concat(nest.flatMap(g => g.oversize.map(p => `${p.id} (${p.L}×${p.Wd}) doesn't fit on a stock sheet.`)))
      .map(w => `<li>${w}</li>`).join('');

    renderCutlist(design, cut, nest);
    renderSheets(nest);

    $('#price-export').textContent = price.exportPackage;
    $('#price-made').textContent = price.made;
    $('#breakdown').innerHTML = price.lines.map(l => `<dt>${l.label}</dt><dd>€${l.value}</dd>`).join('');
    $('#assembly-price').textContent = '+€' + Math.round(C.pricing.assembly.base + cut.parts.length * C.pricing.assembly.perPart);
    $('#price-total').textContent = price.total;
    $('#mbar-total').textContent = price.total;
    $('#mbar-asm').textContent = s.assembly ? 'Delivered & assembled' : 'Delivered';
    $('#mbar-files-price').textContent = price.exportPackage;

    try { history.replaceState(null, '', '#d=' + encode(state).replace(/\+/g, '-').replace(/\//g, '_')); } catch (e) { /* file:// */ }
  }

  function renderCutlist(design, cut, nest) {
    const groups = MJERA.cutlist.grouped(cut);
    const sheets = nest.reduce((n, g) => n + g.sheets.length, 0);
    const sw = k => `<i class="kind" style="background:${MJERA.preview.PART_COLORS[k] || '#ddd'}"></i>`;
    const kindOf = name => cut.parts.find(p => p.name === name).kind;
    $('#view-cutlist').innerHTML = `
      <div class="stats">
        <div><strong>${cut.parts.length}</strong><span>panels</span></div>
        <div><strong>${sheets}</strong><span>sheets</span></div>
        <div><strong>${cut.holes}</strong><span>holes</span></div>
        <div><strong>${cut.edgeMeters ? cut.edgeMeters.toFixed(1) + ' m' : '—'}</strong><span>edge banding</span></div>
      </div>
      <div class="table-wrap"><table class="cut-table">
        <thead><tr><th>Part</th><th>IDs</th><th class="num">Qty</th><th class="num">L × W × T (mm)</th></tr></thead>
        <tbody>${groups.map(g => `<tr><td>${sw(kindOf(g.name))}${g.name}</td><td class="ids">${g.ids.join(' ')}</td><td class="num">${g.qty}</td><td class="num">${g.L} × ${g.Wd} × ${g.T}</td></tr>`).join('')}</tbody>
      </table></div>
      <h3 class="sub">Hardware</h3>
      <div class="table-wrap"><table class="cut-table"><tbody>${cut.hardware.map(h => `<tr><td>${h.name}</td><td class="num">${h.qty}</td></tr>`).join('')}</tbody></table></div>
      <p class="note">Length (L) runs along the grain${cut.grain ? ' — grain direction is fixed for this material' : ''}. Full drilling coordinates are in the cut-file package.</p>`;
  }

  function renderSheets(nest) {
    let i = 0;
    $('#view-sheets').innerHTML = nest.map(g => `<h3 class="sub">${g.label} <span class="muted">· ${g.sheets.length} × ${g.sheet[0]}×${g.sheet[1]} mm</span></h3>` +
      g.sheets.map(s => `<div class="sheet">${MJERA.preview.sheet(s, i++, g.label)}</div>`).join('')).join('');
  }

  // ---------- dialogs ----------
  function openExport() {
    const { cut, nest, price } = model;
    $('#x-parts').textContent = `${cut.parts.length} panels`;
    $('#x-holes').textContent = `${cut.holes} holes`;
    $('#x-sheets').textContent = `${nest.reduce((n, g) => n + g.sheets.length, 0)} sheet layouts`;
    $('#x-price').textContent = price.exportPackage;
    $('#demo-note').hidden = !!C.checkoutUrl;
    $('#dlg-export').showModal();
  }

  async function pay() {
    if (C.checkoutUrl) {
      // Real flow: send the customer to checkout; the success page re-opens the design via #d=… and calls downloadPackage.
      localStorage.setItem('mjera-pending-export', shareUrl());
      location.href = C.checkoutUrl + (C.checkoutUrl.includes('?') ? '&' : '?') + 'client_reference_id=' + encodeURIComponent(encode(state).slice(0, 200));
      return;
    }
    await MJERA.exporter.downloadPackage(model);
    $('#dlg-export').close();
    toast('Package downloaded.');
  }

  function openOrder() {
    $('#order-summary').textContent = MJERA.exporter.summaryText(model, true);
    $('#dlg-order').showModal();
  }

  function submitOrder(e) {
    e.preventDefault();
    const via = (e.submitter && e.submitter.dataset.via) || 'email';
    const f = new FormData(e.target);
    const who = ['name', 'phone', 'email', 'city', 'address', 'notes'].map(k => f.get(k) ? `${k[0].toUpperCase() + k.slice(1)}: ${f.get(k)}` : '').filter(Boolean).join('\n');
    const body = `New order request\n\n${MJERA.exporter.summaryText(model, true)}\n\n${who}`;
    const subject = `Order request — ${state.width}×${state.height}×${state.depth} ${state.style}`;
    if (via === 'whatsapp') window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    else location.href = `mailto:${C.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $('#dlg-order').close();
    toast('Thanks! Your request is ready to send.');
  }

  // ---------- helpers ----------
  function copy(text, msg) {
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => toast(msg), () => prompt('Copy this link:', text));
  }
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function heroVisual() {
    const d = MJERA.layout.build({ ...DEFAULT, style: 'cascade', width: 180, height: 150, depth: 32, rows: 4, density: 50, material: 'mdf', color: 'terra', base: 'legs', doors: ['0-1', '2-0', '1-3'] });
    $('#hero-visual').innerHTML = MJERA.preview.shelf(d, null, { mini: true });
  }

  MJERA.app = { shareUrl, get model() { return model; }, get state() { return state; } };

  document.addEventListener('DOMContentLoaded', () => {
    buildControls();
    heroVisual();
    render();
  });
})();
