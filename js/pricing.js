/*
 * Price estimate. Costs are net; customer-facing lines include margin + VAT.
 */
(function () {
  const C = MJERA.config;
  const P = C.pricing;

  function compute(design, cut, nest, state) {
    const gross = v => v * P.margin * (1 + P.vat);
    const sheets = nest.reduce((n, g) => n + g.sheets.length, 0);
    const materials = nest.reduce((s, g) => s + g.sheets.length * g.pricePerSheet, 0);
    const finishing = cut.areaM2 * 2 * (design.material.finishPerM2 || 0);
    const cutting = cut.cutMeters * P.cutPerMeter + (design.material.edgeBanding ? cut.edgeMeters * (design.material.edgePerM || 1.4) : 0);
    const drilling = cut.holes * P.drillPerHole;
    const hardware = cut.hardware.reduce((s, h) => s + h.qty * (P.hardware[h.id] || 0), 0);
    const handling = cut.parts.length * P.handlingPerPart + P.qcBase + cut.parts.length * P.qcPerPart + cut.preinstalled * P.preinstallPerFitting;

    const lines = [
      { label: MJERA.t('Boards ({n} sheets)', { n: sheets }), value: gross(materials) },
      design.material.finishPerM2 ? { label: MJERA.t(design.material.id === 'mdf' ? 'Spray lacquer' : 'Lacquer / oil finish'), value: gross(finishing) } : null,
      { label: MJERA.t(design.material.edgeBanding ? 'Cutting & edge banding' : 'Precision cutting'), value: gross(cutting) },
      { label: MJERA.t('Drilling ({n} holes)', { n: cut.holes }), value: gross(drilling) },
      { label: MJERA.t('Hardware'), value: gross(hardware) },
      { label: MJERA.t('Pre-fitted hardware, labels, QC & packing'), value: gross(handling) }
    ].filter(Boolean);

    const made = Math.round(lines.reduce((s, l) => s + l.value, 0));
    const zone = P.delivery.find(z => z.id === state.delivery) || P.delivery[0];
    const delivery = zone.price;
    const assembly = state.assembly ? Math.round(P.assembly.base + cut.parts.length * P.assembly.perPart) : 0;
    return {
      exportPackage: P.exportPackage,
      lines: lines.map(l => ({ ...l, value: Math.round(l.value) })),
      made, delivery, zone, assembly,
      total: made + delivery + assembly
    };
  }

  MJERA.pricing = { compute };
})();
