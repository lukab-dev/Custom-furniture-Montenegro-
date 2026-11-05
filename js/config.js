/*
 * Mjera — business configuration.
 * All prices are PLACEHOLDERS in EUR incl. 21% VAT logic below.
 * Calibrate them against real quotes from your board supplier / CNC shop.
 */
window.MJERA = window.MJERA || {};

MJERA.config = {
  brand: 'Mjera',
  contactEmail: 'orders@mjera.me',      // TODO: real inbox
  whatsapp: '38200000000',              // TODO: real number, digits only, with country code
  checkoutUrl: null,                    // TODO: Stripe Payment Link for the file package. null = demo mode

  limits: {
    width:  { min: 40,  max: 240, step: 1 },   // cm
    height: { min: 30,  max: 240, step: 1 },   // cm (incl. base)
    depths: [24, 32, 40],                      // cm
    rowHeight: { min: 180, max: 450 },         // mm clear height per compartment
    maxSpan: 800                               // mm, warn above this shelf span (18 mm board)
  },

  build: {
    t: 18,            // carcass board thickness (mm)
    kerf: 4,          // saw kerf (mm)
    trim: 10,         // edge trim on each sheet side (mm)
    doorGap: 2,       // gap around inset doors (mm)
    plinthHeight: 80, // mm
    legHeight: 100,   // mm
    connectorInset: 40 // mm from front/back edge for dowels
  },

  styles: [
    { id: 'raster',  name: 'Raster',  desc: 'Calm, even grid. Every column lines up.' },
    { id: 'brick',   name: 'Brick',   desc: 'Rows offset by half a bay, like laid brick.' },
    { id: 'cascade', name: 'Cascade', desc: 'Bays grow from narrow to wide, row by row.' },
    { id: 'mosaic',  name: 'Mosaic',  desc: 'Irregular rhythm. Shuffle until it feels right.' }
  ],

  materials: [
    {
      id: 'ply', name: 'Birch plywood', short: 'Plywood',
      desc: '18 mm birch ply, layered edge left visible, matte lacquer.',
      sheet: [2500, 1250], pricePerSheet: 118, grain: true,
      edgeBanding: false, finishPerM2: 9,
      back: { name: 'Birch plywood 9 mm', t: 9, sheet: [2500, 1250], pricePerSheet: 62 },
      colors: [
        { id: 'natural', name: 'Natural birch', hex: '#e6cfa6', edge: '#d6b886' },
        { id: 'white',   name: 'White laminate', hex: '#f1efe9', edge: '#d9c09a' },
        { id: 'graphite',name: 'Graphite laminate', hex: '#3b3d40', edge: '#cdb08a' }
      ]
    },
    {
      id: 'mdf', name: 'Lacquered MDF', short: 'MDF',
      desc: '18 mm MDF, spray-lacquered all round. Seamless colour.',
      sheet: [2800, 2070], pricePerSheet: 64, grain: false,
      edgeBanding: false, finishPerM2: 26,
      back: { name: 'MDF 8 mm', t: 8, sheet: [2800, 2070], pricePerSheet: 32 },
      colors: [
        { id: 'chalk',  name: 'Chalk white', hex: '#f3f1ec' },
        { id: 'sand',   name: 'Sand',        hex: '#d9c7a8' },
        { id: 'olive',  name: 'Olive',       hex: '#7b7d5a' },
        { id: 'adria',  name: 'Adriatic blue', hex: '#2f5d7c' },
        { id: 'terra',  name: 'Terracotta',  hex: '#b7634a' },
        { id: 'ink',    name: 'Ink',         hex: '#24262a' }
      ]
    },
    {
      id: 'mel', name: 'Melamine chipboard', short: 'Melamine',
      desc: '18 mm melamine-faced board, 1 mm ABS edging on visible edges.',
      sheet: [2800, 2070], pricePerSheet: 52, grain: false,
      edgeBanding: true, edgePerM: 1.4, finishPerM2: 0,
      back: { name: 'HDF 8 mm', t: 8, sheet: [2800, 2070], pricePerSheet: 28 },
      colors: [
        { id: 'white', name: 'Premium white', hex: '#f4f4f1' },
        { id: 'grey',  name: 'Pebble grey',   hex: '#a9a7a1' },
        { id: 'oak',   name: 'Natural oak',   hex: '#c9a679', grain: true },
        { id: 'walnut',name: 'Walnut',        hex: '#6b4a33', grain: true },
        { id: 'black', name: 'Black',         hex: '#2a2a2a' }
      ]
    }
  ],

  pricing: {
    exportPackage: 29,       // flat price for the DIY file package (EUR)
    cutPerMeter: 0.9,        // panel saw / CNC cutting
    drillPerHole: 0.12,
    handlingPerPart: 1.2,    // labelling, sorting
    qcBase: 15, qcPerPart: 0.6,
    hardware: {
      cam: 0.35,             // Minifix cam + bolt + cap
      dowel: 0.03,
      backScrew: 0.03,
      hinge: 4.2,            // clip-on soft-close cup hinge incl. plate
      pushLatch: 3.5,
      leg: 6,
      bracket: 0.4,
      wallFix: 3             // anti-tip wall bracket kit
    },
    preinstallPerFitting: 0.12, // fitting dowels, bolts, cams, hinges before shipping
    margin: 1.3,             // workshop margin on cost
    vat: 0.21,               // Montenegro standard VAT
    assembly: { base: 35, perPart: 1.8 },
    delivery: [
      { id: 'pg',    name: 'Podgorica',                                  price: 25 },
      { id: 'cent',  name: 'Nikšić · Danilovgrad · Cetinje',             price: 45 },
      { id: 'coast', name: 'Coast (Bar → Herceg Novi, Ulcinj)',           price: 55 },
      { id: 'north', name: 'North (Kolašin, Bijelo Polje, Žabljak…)',     price: 70 },
      { id: 'pickup',name: 'Workshop pickup',                            price: 0 }
    ]
  }
};
