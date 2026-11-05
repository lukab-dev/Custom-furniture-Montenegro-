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

## Project layout

| File | What it does |
|---|---|
| `js/config.js` | **Business settings**: materials, sheet sizes, colours, every price, delivery zones, contact details. Start here. |
| `js/layout.js` | Turns the design into rows and compartments (the style algorithms live here). |
| `js/cutlist.js` | Panels, edge banding, drilling coordinates and hardware. |
| `js/nesting.js` | Packs panels onto stock sheets (guillotine shelf packing, kerf + trim aware, respects grain). |
| `js/pricing.js` | Price estimate: sheets, finish, cutting, drilling, hardware, QC, margin and VAT. |
| `js/preview.js` | SVG renderers: perspective front view and sheet layouts. |
| `js/export.js` | Builds the cut-file package (CSV/SVG/JSON in a ZIP). |
| `js/app.js` | UI, state, shareable links (`#d=…`), order and export dialogs. |

## Construction model

Designed so a non-carpenter can build it in about an hour with a screwdriver and a mallet.

- **Board:** 18 mm. Sides run full height; bottom, shelves and top sit between them.
- **Side to shelf joint:** 2 × Ø8 dowels and 1–2 Minifix 15 cam locks. The cam sits on the shelf's underside and the bolt in the side, so no screw heads show on the outside.
- **Dividers:** these stand between shelves on Ø8 dowels only. They're held in place once the shelf above is locked, and screwed through the back.
- **Back:** a single overlay back (split on a shelf line if taller than a sheet) is screwed to every shelf, side and divider. This keeps the unit square and stops it racking sideways. All carcass parts are shallower by the back's thickness, so the outer depth stays as designed. The screw holes are pre-drilled, so the back doubles as a template.
- **Doors:** inset, with 35 mm clip-on cup hinges (plate on the left wall of the bay) and push-to-open latches.
- **Base:** a glued plinth frame with angle brackets, steel legs, or none. An anti-tip wall kit always ships.
- **"Made for you" orders:** we fit the dowels, cam bolts, cams and hinge cups before shipping. The customer pushes, turns and screws.
- **Assembly order:** face-down on a blanket (all front edges flush), left side, then bottom, dividers and shelves upward, then the right side. Turn the cams, screw on the back, fit the base, stand it up and fix it to the wall.

## Before going live

- [ ] **Calibrate every price in `js/config.js`** against real supplier and CNC quotes. The current numbers are placeholders.
- [ ] Set `contactEmail`, `whatsapp` and the domain.
- [ ] Connect payment for the file package: set `checkoutUrl` to a Stripe Payment Link (or similar). Until then the export runs in demo mode and is free.
- [ ] To make the export truly paid, move file generation server-side, or deliver the ZIP from the payment success page. Client-side code can always be bypassed.
- [ ] Replace the mailto/WhatsApp order hand-off with a form backend (e.g. Formspree, a Cloudflare Worker, or a small API) that stores orders.
- [ ] Have your workshop verify a cut list and drilling map on a test build, including the Minifix distance (34 mm) and the hinge plate set-back for your hinge brand.
- [ ] Add a Montenegrin (ME) language version.

## Ideas for later

Drawers, per-row heights, units wider than one sheet (modules), wardrobes and sideboards as extra product types, a real 3D view (three.js), DXF export for CNC, and an admin view of orders.
