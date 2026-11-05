# Mjera — shelving made to measure

*Mjera* means "measure" (*po mjeri* = made to measure). It's an online shelf designer for Montenegro:

1. **Design** — choose a style (Raster, Brick, Cascade, Mosaic) and set width, height, depth, rows and density. Tap a compartment to add a door. Choose material, colour, back panels and base.
2. **Cut files (flat price)** — download a ZIP with the cut list, drilling map, nested sheet layouts, hardware list and an assembly drawing with part IDs.
3. **Made for you** — order through us: we buy the boards, CNC cut and drill them, check every part, then deliver and (optionally) assemble. The price updates live.

It's a static site with no build step. Open `index.html` through any static server:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

It deploys as-is to GitHub Pages, Netlify, Cloudflare Pages and similar hosts.

## Languages

The site has two languages, switched with **EN | NAŠ** in the header:

- **EN:** English.
- **NAŠ ("Naš jezik"):** the local language, in Latin script and ijekavian, with wording common in Montenegro. It is deliberately not labelled with a national name. The page's `lang` attribute uses the neutral umbrella code `hbs-Latn`.

Browsers set to a regional language (sr, hr, bs, cnr, sh) open in NAŠ automatically; everyone else gets English. The choice is remembered, and `?lang=nas` or `?lang=en` forces one. All translations live in `js/i18n.js`. The site, order message, cut-file package (CSV headers, README), assembly manual and labels all follow the selected language. Any missing translation falls back to English.

## Project layout

| File | What it does |
|---|---|
| `js/i18n.js` | Translations (English → Naš jezik) and the language switch. |
| `js/config.js` | **Business settings**: materials, sheet sizes, colours, every price, delivery zones, contact details. Start here. |
| `js/layout.js` | Turns the design into rows and compartments (the style algorithms live here). |
| `js/cutlist.js` | Panels, edge banding, drilling coordinates and hardware. |
| `js/nesting.js` | Packs panels onto stock sheets (guillotine shelf packing, kerf + trim aware, respects grain). |
| `js/pricing.js` | Price estimate: sheets, finish, cutting, drilling, hardware, QC, margin and VAT. |
| `js/preview.js` | SVG renderers: perspective front view and sheet layouts. |
| `js/export.js` | Builds the cut-file package (CSV/SVG/JSON in a ZIP). |
| `js/app.js` | UI, state, shareable links (`#d=…`), order and export dialogs. |

## Construction model

This follows the same principle as Tylko's system: full-width shelves, short verticals per row, built face-down row by row and labelled parts. It uses standard hardware that any local CNC/panel shop can drill.

- **Horizontals:** bottom, shelves and top run the full width in one piece. The longest part is the width, so units can be up to ceiling height.
- **Verticals per row:** two end panels plus the dividers, standing between two shelves. End panels use 2 × Ø8 dowels and a Minifix 15 cam lock per joint (cam on the inside face, bolt in the shelf). Dividers use dowels only and are held captive between the locked shelves.
- **Back:** an overlay back screwed to every shelf and panel through pre-drilled holes. It's split on a shelf line when taller than a sheet. Without backs, every row gets an end brace on each side to stop racking.
- **Doors:** inset, with 35 mm clip-on cup hinges (plate on the left wall of the bay) and push-to-open latches.
- **Base and wall fixing:** plinth (glued frame with angle brackets), steel legs, or none. Wall L-brackets go on top of the top shelf (2, or 3 over 160 cm).
- **Packages:** #1 shelves, #2 ends & dividers, #3 back, #4 doors, #5 base, #6 hardware.
- **Labels:** each part gets a sticker with its ID, package, ▼ FRONT edge and ◀ LEFT/BOTTOM end (`labels.html`).
- **Manual:** each design generates its own step-by-step manual (`assembly-manual.html`). It covers the bottom, then for every row the ends and dividers, the next shelf and the cams, followed by the back, the base, standing it up and wall fixing, then the doors. Drawings show the shelf as you see it while building: face-down, bottom towards the wall.

## Before going live

- [ ] **Calibrate every price in `js/config.js`** against real supplier and CNC quotes. The current numbers are placeholders.
- [ ] Set `contactEmail`, `whatsapp` and the domain.
- [ ] The file package is **free during the test phase** (`exportPackage: 0`). To charge again, set a price (e.g. 29).
- [ ] Connect payment for the file package: set `checkoutUrl` to a Stripe Payment Link (or similar). Until then the export runs in demo mode and is free.
- [ ] To make the export truly paid, move file generation server-side, or deliver the ZIP from the payment success page. Client-side code can always be bypassed.
- [ ] Replace the mailto/WhatsApp order hand-off with a form backend (e.g. Formspree, a Cloudflare Worker, or a small API) that stores orders.
- [ ] Have your workshop verify a cut list and drilling map on a test build, including the Minifix distance (34 mm) and the hinge plate set-back for your hinge brand.
- [ ] Have a native speaker proofread `js/i18n.js`.

## Ideas for later

Drawers, per-row heights, units wider than one sheet (modules), wardrobes and sideboards as extra product types, a real 3D view (three.js), DXF export for CNC, and an admin view of orders.
