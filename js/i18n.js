/*
 * Two languages: English and "Naš jezik" — the local language, written in Latin script,
 * ijekavian, using wording common in Montenegro. Deliberately not labelled with a
 * national name; the switch shows "EN | NAŠ".
 *
 * How it works
 *  - Static HTML stays in English. On switching, every text node / title / aria-label /
 *    placeholder whose English text is a key in LOCAL is swapped (and restored on switching back).
 *  - JS-generated text calls MJERA.t('English text with {vars}', { vars }).
 *  - Add a translation by adding an entry to LOCAL. Missing keys simply stay in English.
 */
window.MJERA = window.MJERA || {};

(function () {
  const LOCAL = {
    // ---------- page ----------
    'Mjera — shelving made to measure in Montenegro': 'Mjera — police po mjeri u Crnoj Gori',
    'Design your own shelving online. Download the cut files and build it yourself, or let us cut, drill, check, deliver and assemble it anywhere in Montenegro.':
      'Dizajnirajte svoju policu na internetu. Preuzmite fajlove za krojenje i sklopite je sami, ili prepustite nama krojenje, bušenje, kontrolu, dostavu i montažu bilo gdje u Crnoj Gori.',
    'Mjera home': 'Mjera početna',
    'Design': 'Dizajn',
    'How it works': 'Kako funkcioniše',
    'Pricing': 'Cijene',
    'FAQ': 'Pitanja',
    'Start designing': 'Počnite dizajn',
    'Language': 'Jezik',

    // hero
    'Po mjeri · made to measure · Montenegro': 'Namještaj po mjeri · Crna Gora',
    'Shelving you design.': 'Vi dizajnirate policu.',
    'Cut, drilled and built': 'Mi je krojimo, bušimo',
    'by us.': 'i sklapamo.',
    'Pick a style, drag it to fit your wall, and see the price change as you go. Download the cut files and build it yourself, or let our workshop cut, drill, check, deliver and assemble it anywhere from Herceg Novi to Žabljak.':
      'Izaberite stil, prilagodite policu svom zidu i pratite kako se cijena mijenja. Preuzmite fajlove za krojenje i sklopite je sami, ili neka naša radionica iskroji, izbuši, provjeri, dostavi i sklopi policu bilo gdje od Herceg Novog do Žabljaka.',
    'Design your shelf': 'Dizajnirajte policu',
    'See how it works': 'Pogledajte kako funkcioniše',
    'cut & drilled panels': 'krojene i bušene ploče',
    '2–3 weeks': '2–3 sedmice',
    'from order to your door': 'od narudžbe do vaših vrata',
    'Free': 'Besplatno',
    'free': 'besplatno',
    'DIY cut files': 'fajlovi za samostalnu izradu',

    // configurator
    'Shelf designer': 'Dizajner polica',
    'Cut list': 'Lista krojenja',
    'Sheets': 'Ploče',
    'Person for scale': 'Osoba za poređenje veličine',
    'Show person for scale': 'Prikaži osobu za poređenje veličine',
    'Dimensions': 'Dimenzije',
    'Show dimensions': 'Prikaži dimenzije',
    'Cut list & sheets': 'Lista krojenja i ploče',
    'Show cut list and sheets': 'Prikaži listu krojenja i ploče',
    'Copy link': 'Kopiraj link',
    'Copy link to this design': 'Kopiraj link ovog dizajna',
    'Tap a compartment to add or remove a door. Drag the round handles to resize.': 'Dodirnite odjeljak da dodate ili uklonite vrata. Povucite okrugle ručice da promijenite veličinu.',
    'Design options': 'Opcije dizajna',
    'Width': 'Širina',
    'Height': 'Visina',
    'Depth': 'Dubina',
    'Style': 'Stil',
    'Density': 'Gustina',
    'Rows': 'Redovi',
    'Material': 'Materijal',
    'Colour': 'Boja',
    'Extras': 'Dodaci',
    'Delivery': 'Dostava',
    'Size': 'Veličina',
    '↻ Shuffle pattern': '↻ Promiješaj raspored',
    'Narrower': 'Uže',
    'Wider': 'Šire',
    'Lower': 'Niže',
    'Taller': 'Više',
    'Fewer rows': 'Manje redova',
    'More rows': 'Više redova',
    'Fewer bays': 'Manje odjeljaka',
    'More bays': 'Više odjeljaka',
    'Details': 'Detalji',
    'Back panels': 'Leđa',
    'Base': 'Postolje',
    'None': 'Bez',
    'Plinth': 'Sokla',
    'Legs': 'Nogice',
    'Tap a compartment on the shelf to add or remove a door.': 'Dodirnite odjeljak na polici da dodate ili uklonite vrata.',
    'Remove all doors': 'Ukloni sva vrata',
    'Build it yourself': 'Sklopite sami',
    'Cut list, drilling map, sheet layouts & hardware list. Take them to any panel shop.': 'Lista krojenja, plan bušenja, raspored na pločama i spisak okova. Odnesite ih bilo kojem stolaru ili servisu za krojenje ploča.',
    'Get cut files': 'Preuzmi fajlove',
    'Made for you': 'Izrađeno za vas',
    'We order the boards, CNC cut & drill, check every part and pack it labelled.': 'Nabavljamo ploče, CNC-om krojimo i bušimo, provjeravamo svaki dio i pakujemo ga označenog.',
    'Price breakdown': 'Struktura cijene',
    'Assembly at your home': 'Montaža kod vas',
    'Total incl. VAT': 'Ukupno sa PDV-om',
    'Order this shelf': 'Naruči ovu policu',

    // how it works / pricing / faq
    'From slider to wall in four steps': 'Od klizača do zida u četiri koraka',
    'Choose a style and adjust width, height, depth, rows and density. Add doors where you want them. The price updates live.': 'Izaberite stil i podesite širinu, visinu, dubinu, broj redova i gustinu. Dodajte vrata gdje želite. Cijena se računa odmah.',
    'Cut & drill': 'Krojenje i bušenje',
    'Your design becomes a precise cut list and drilling map. We order the boards and machine every panel on CNC.': 'Vaš dizajn postaje precizna lista krojenja i plan bušenja. Nabavljamo ploče i svaki dio obrađujemo na CNC mašini.',
    'Check & pre-fit': 'Kontrola i priprema',
    'Each part is measured and labelled with its ID, package and an arrow to its front edge. Dowels, cam bolts and hinges are fitted, and you get a manual made for your shelf.': 'Svaki dio se izmjeri i označi oznakom, brojem paketa i strelicom prema prednjoj ivici. Tiple, vijci ekscentara i šarke se ugrade unaprijed, a dobijate i uputstvo napravljeno baš za vašu policu.',
    'Deliver & assemble': 'Dostava i montaža',
    'We bring it to your door anywhere in Montenegro, and can assemble it and fix it to the wall.': 'Donosimo je na vašu adresu bilo gdje u Crnoj Gori, a možemo je i sklopiti i pričvrstiti za zid.',
    'Two ways to get your shelf': 'Dva načina da dobijete policu',
    'Cut files': 'Fajlovi za krojenje',
    'per design': 'po dizajnu',
    'Cut list (CSV) with grain direction & edging': 'Lista krojenja (CSV) sa smjerom godova i kantiranjem',
    'Drilling map for every hole': 'Plan bušenja za svaku rupu',
    'Optimised sheet layouts': 'Optimizovan raspored na pločama',
    'Assembly drawing with part IDs': 'Crtež sklapanja s oznakama dijelova',
    'Hardware shopping list': 'Spisak okova za kupovinu',
    'Design & download': 'Dizajniraj i preuzmi',
    'Live quote': 'Cijena odmah',
    'shown as you design': 'dok dizajnirate',
    'Boards, finish & hardware included': 'Ploče, završna obrada i okovi uključeni',
    'CNC cutting & drilling': 'CNC krojenje i bušenje',
    'Quality check & labelled parts': 'Kontrola kvaliteta i označeni dijelovi',
    'Delivery from €0 (pickup) to €70 (north)': 'Dostava od 0 € (preuzimanje) do 70 € (sjever)',
    'Optional assembly & wall fixing': 'Po želji montaža i pričvršćivanje za zid',
    'Get your price': 'Saznajte cijenu',
    'Questions': 'Pitanja',
    'Good to know': 'Dobro je znati',
    'Can I take the cut files to my own carpenter?': 'Mogu li fajlove odnijeti svom stolaru?',
    "Yes, that's what they're for. The CSV opens in Excel and imports into most panel-saw optimisers. The drilling map gives every hole relative to the part's front edge.":
      'Da, za to i služe. CSV se otvara u Excelu i može se uvesti u većinu programa za optimizaciju krojenja. Plan bušenja daje položaj svake rupe u odnosu na prednju ivicu dijela.',
    'How accurate is the online price?': 'Koliko je tačna cijena na sajtu?',
    "It's calculated from the actual sheets, cut length, holes and hardware your design needs. We confirm the final price before you pay. It only changes if something in the design has to change.":
      'Računa se iz stvarnog broja ploča, dužine rezova, rupa i okova koje vaš dizajn zahtijeva. Konačnu cijenu potvrđujemo prije plaćanja. Mijenja se samo ako nešto u dizajnu mora da se promijeni.',
    'How long does it take?': 'Koliko traje izrada?',
    'Usually 2–3 weeks: about a week for boards and machining, a few days for checking and packing, then delivery on a date that suits you.':
      'Obično 2–3 sedmice: oko sedmicu za ploče i obradu, nekoliko dana za kontrolu i pakovanje, a onda dostava kada vama odgovara.',
    'How hard is it to assemble?': 'Koliko je teško sklapanje?',
    'About an hour for two people with a screwdriver and a rubber mallet. Every shelf comes with its own step-by-step manual, and every part is labelled. You build it face-down next to the wall, one row at a time: push the panels onto their pre-fitted dowels, turn the cam locks, screw on the pre-drilled back, then stand it up and fix it to the wall. No screw heads show on the outside.':
      'Oko sat vremena za dvije osobe, uz odvijač i gumeni čekić. Svaka polica dolazi sa svojim uputstvom korak po korak, a svaki dio je označen. Policu sklapate okrenutu licem prema podu, pored zida, red po red: nataknete ploče na ugrađene tiple, okrenete ekscentre, zašrafite izbušena leđa, pa je podignete i pričvrstite za zid. Spolja se ne vidi nijedan šraf.',
    'Is it safe for tall shelves?': 'Jesu li visoke police sigurne?',
    'Every order includes an anti-tip wall bracket kit. If we assemble, we fix it to the wall for you.': 'Uz svaku narudžbu dobijate nosače za zid koji sprečavaju prevrtanje. Ako mi sklapamo, policu odmah pričvrstimo za zid.',
    'Do you deliver outside Montenegro?': 'Dostavljate li van Crne Gore?',
    'Not yet. Cut files work anywhere, though.': 'Još ne. Fajlovi za krojenje se mogu koristiti bilo gdje.',
    'Furniture made to measure, from Montenegro. ·': 'Namještaj po mjeri, iz Crne Gore. ·',

    // dialogs
    'Close': 'Zatvori',
    'Your cut-file package': 'Vaš paket fajlova',
    'assembly drawing with part IDs': 'crtež sklapanja s oznakama dijelova',
    'screws, hinges, latches': 'šrafovi, šarke, otvarači',
    'step-by-step manual for this exact shelf': 'uputstvo korak po korak baš za ovu policu',
    'part stickers with IDs and FRONT arrows': 'naljepnice s oznakama i strelicama za prednju ivicu',
    're-open this design any time': 'ponovo otvorite ovaj dizajn kad god želite',
    'Free during our test phase. No payment needed.': 'Besplatno tokom probnog perioda. Plaćanje nije potrebno.',
    'Download': 'Preuzmi',
    'Request your order': 'Zahtjev za narudžbu',
    'Name': 'Ime i prezime',
    'Phone': 'Telefon',
    'Email': 'Email',
    'Town': 'Grad',
    'Address': 'Adresa',
    'Notes': 'Napomena',
    'Floor, lift, skirting board, wall type…': 'Sprat, lift, lajsne, vrsta zida…',
    "No payment now. We'll confirm the final price and delivery date within one working day.": 'Sada ništa ne plaćate. Konačnu cijenu i datum dostave potvrđujemo u roku od jednog radnog dana.',
    'Send by email': 'Pošalji emailom',
    'Send on WhatsApp': 'Pošalji na WhatsApp',
    'Files ·': 'Fajlovi ·',
    'Order · €': 'Naruči · €',
    'Your design': 'Vaš dizajn',

    // ---------- dynamic UI ----------
    'Raster': 'Raster',
    'Calm, even grid. Every column lines up.': 'Miran, pravilan raster. Sve kolone su u liniji.',
    'Brick': 'Cigla',
    'Rows offset by half a bay, like laid brick.': 'Redovi pomjereni za pola odjeljka, kao zidana cigla.',
    'Cascade': 'Kaskada',
    'Bays grow from narrow to wide, row by row.': 'Odjeljci rastu od uskih ka širokim, red po red.',
    'Mosaic': 'Mozaik',
    'Irregular rhythm. Shuffle until it feels right.': 'Nepravilan ritam. Miješajte dok vam se ne svidi.',
    'Plywood': 'Šperploča',
    'MDF': 'MDF',
    'Melamine': 'Iverica',
    'Birch plywood': 'Brezova šperploča',
    'Lacquered MDF': 'Lakirani MDF',
    'Melamine chipboard': 'Oplemenjena iverica',
    '18 mm birch ply, layered edge left visible, matte lacquer.': 'Brezova šperploča 18 mm, slojevi na ivici ostaju vidljivi, mat lak.',
    '18 mm MDF, spray-lacquered all round. Seamless colour.': 'MDF 18 mm, lakiran sa svih strana. Ujednačena boja bez spojeva.',
    '18 mm melamine-faced board, 1 mm ABS edging on visible edges.': 'Oplemenjena iverica 18 mm, ABS kant traka 1 mm na vidljivim ivicama.',
    'Birch plywood 9 mm': 'Brezova šperploča 9 mm',
    'Natural birch': 'Prirodna breza',
    'White laminate': 'Bijeli laminat',
    'Graphite laminate': 'Grafitni laminat',
    'Chalk white': 'Kredasto bijela',
    'Sand': 'Pijesak',
    'Olive': 'Maslina',
    'Adriatic blue': 'Jadransko plava',
    'Terracotta': 'Terakota',
    'Ink': 'Antracit',
    'Premium white': 'Premium bijela',
    'Pebble grey': 'Kamena siva',
    'Natural oak': 'Prirodni hrast',
    'Walnut': 'Orah',
    'Black': 'Crna',
    'Coast (Bar → Herceg Novi, Ulcinj)': 'Primorje (Bar → Herceg Novi, Ulcinj)',
    'North (Kolašin, Bijelo Polje, Žabljak…)': 'Sjever (Kolašin, Bijelo Polje, Žabljak…)',
    'Workshop pickup': 'Preuzimanje u radionici',
    'Bays: {n}': 'Odjeljaka: {n}',
    'delivered & assembled': 's dostavom i montažom',
    'delivered': 's dostavom',
    'Widest bay is {w} cm — shelves over {m} cm may sag under books. Increase density.': 'Najširi odjeljak ima {w} cm — police šire od {m} cm mogu se ugnuti pod knjigama. Povećajte gustinu.',
    'Width exceeds a single {mat} sheet. Reduce width or split into two units.': 'Širina je veća od jedne ploče ({mat}). Smanjite širinu ili podijelite policu na dva elementa.',
    'Without back panels the shelf is braced only at its ends. For a unit this tall we recommend back panels.': 'Bez leđa je polica ukrućena samo na krajevima. Za ovako visoku policu preporučujemo leđa.',
    'Some bays are only {w} cm wide. Reduce density.': 'Neki odjeljci su široki samo {w} cm. Smanjite gustinu.',
    "{id} ({L}×{W}) doesn't fit on a stock sheet.": '{id} ({L}×{W}) ne staje na standardnu ploču.',
    'Panels': 'Dijelovi',
    'Holes': 'Rupe',
    'Edge banding': 'Kantiranje',
    'Part': 'Dio',
    'IDs': 'Oznake',
    'Qty': 'Kom.',
    'L × W × T (mm)': 'D × Š × deb. (mm)',
    'Hardware': 'Okovi',
    'Length (L) runs along the grain{fixed}. Full drilling coordinates are in the cut-file package.': 'Dužina (D) ide u smjeru godova{fixed}. Tačne koordinate bušenja su u paketu fajlova.',
    ' — grain direction is fixed for this material': ' — kod ovog materijala smjer godova je obavezan',
    'Open assembly manual': 'Otvori uputstvo za sklapanje',
    'Part labels': 'Naljepnice za dijelove',
    'Sheet {n} · {label} · {w}×{h} mm · {p}% used': 'Ploča {n} · {label} · {w}×{h} mm · iskorišćeno {p}%',
    'Sheet {n}': 'Ploča {n}',
    'Shelf preview {w} by {h} by {d} cm': 'Pregled police {w} × {h} × {d} cm',
    'Add door': 'Dodaj vrata',
    'Remove door': 'Ukloni vrata',
    'Drag to change width': 'Povucite da promijenite širinu',
    'Drag to change height': 'Povucite da promijenite visinu',
    'Boards ({n} sheets)': 'Ploče (komada: {n})',
    'Spray lacquer': 'Lakiranje',
    'Lacquer / oil finish': 'Lak / uljna obrada',
    'Cutting & edge banding': 'Krojenje i kantiranje',
    'Precision cutting': 'Precizno krojenje',
    'Drilling ({n} holes)': 'Bušenje (rupa: {n})',
    'Pre-fitted hardware, labels, QC & packing': 'Ugradnja okova, naljepnice, kontrola i pakovanje',
    'Package downloaded.': 'Paket je preuzet.',
    'Thanks! Your request is ready to send.': 'Hvala! Vaš zahtjev je spreman za slanje.',
    'Link copied — share or bookmark it.': 'Link je kopiran — podijelite ga ili sačuvajte.',
    'Copy this link:': 'Kopirajte ovaj link:',
    'Panels: {n}': 'Dijelova: {n}',
    'Holes: {n}': 'Rupa: {n}',
    'Sheet layouts: {n}': 'Rasporeda na pločama: {n}',
    'Download for free': 'Preuzmi besplatno',
    'Pay €{p} & download': 'Plati €{p} i preuzmi',
    "Demo mode: payment isn't connected yet, so the download is free.": 'Probni režim: plaćanje još nije povezano, pa je preuzimanje besplatno.',
    'New order request': 'Novi zahtjev za narudžbu',
    'Order request — {dims} {style}': 'Zahtjev za narudžbu — {dims} {style}',

    // parts & hardware
    'Bottom': 'Dno',
    'Shelf': 'Polica',
    'Top': 'Vrh',
    'End left': 'Lijeva stranica',
    'End right': 'Desna stranica',
    'Divider': 'Pregrada',
    'Door': 'Vrata',
    'Back panel': 'Leđa',
    'End brace': 'Bočno ukrućenje',
    'Plinth front': 'Sokla prednja',
    'Plinth back': 'Sokla zadnja',
    'Plinth return': 'Sokla bočna',
    'Shelves': 'Police',
    'Ends & dividers': 'Stranice i pregrade',
    'Back': 'Leđa',
    'Doors': 'Vrata',
    'Minifix 15 cam + bolt + cover cap': 'Minifix 15 ekscentar + vijak + kapica',
    'Beech dowel Ø8×35': 'Bukova tipla Ø8×35',
    'Back screw 3.5×16 countersunk': 'Šraf za leđa 3,5×16, upušteni',
    'Clip-on cup hinge 35 mm, inset, soft-close (with plate)': 'Šarka 35 mm na klik, unutrašnja, s usporivačem (s podloškom)',
    'Push-to-open latch': 'Push-to-open otvarač',
    'Steel leg {h} mm': 'Čelična nogica {h} mm',
    'Angle bracket 30 mm + screws (plinth to bottom)': 'Ugaonik 30 mm + šrafovi (sokla za dno)',
    'Wall L-bracket + screw + universal plug': 'L-nosač za zid + šraf + univerzalni tipl za zid',
    '{name} 18 mm · {color}': '{name} 18 mm · {color}',

    // order summary
    '{brand} design — {style}': '{brand} dizajn — {style}',
    'Outer size: {w} × {h} × {d} cm (W × H × D)': 'Spoljne mjere: {w} × {h} × {d} cm (Š × V × D)',
    'Material: {m}, {c}': 'Materijal: {m}, {c}',
    'Rows: {r} · Bays: {b} · Doors: {d}': 'Redova: {r} · Odjeljaka: {b} · Vrata: {d}',
    'Back panels: {yes} · Base: {base}': 'Leđa: {yes} · Postolje: {base}',
    'yes': 'da',
    'no': 'ne',
    'Panels: {p} · Sheets: {s} · Holes: {h}': 'Dijelova: {p} · Ploča: {s} · Rupa: {h}',
    'Made & checked: €{x}': 'Izrada i kontrola: €{x}',
    'Delivery ({zone}): €{x}': 'Dostava ({zone}): €{x}',
    'Assembly: €{x}': 'Montaža: €{x}',
    'Estimated total: €{x} incl. VAT': 'Procijenjeno ukupno: €{x} sa PDV-om',
    'Design link: {url}': 'Link dizajna: {url}',

    // export files
    'Part IDs': 'Oznake dijelova',
    'Length (mm, grain)': 'Dužina (mm, smjer godova)',
    'Width (mm)': 'Širina (mm)',
    'Thickness (mm)': 'Debljina (mm)',
    'Grain matters': 'Smjer godova bitan',
    'Rotate allowed': 'Rotacija dozvoljena',
    'Part ID': 'Oznaka',
    'Face': 'Strana',
    'X (mm along length)': 'X (mm po dužini)',
    'Y (mm from front / hinge edge)': 'Y (mm od prednje ivice / ivice šarke)',
    'Diameter (mm)': 'Prečnik (mm)',
    'Depth (mm)': 'Dubina (mm)',
    'Purpose': 'Namjena',
    'Item': 'Stavka',
    'top': 'gornja',
    'underside': 'donja',
    'edge end 0 (bottom)': 'čelo, kraj 0 (dolje)',
    'edge end 1 (top)': 'čelo, kraj 1 (gore)',
    'edge end 0': 'čelo, kraj 0',
    'edge end 1': 'čelo, kraj 1',
    'right face (inside)': 'desna strana (unutra)',
    'left face (inside)': 'lijeva strana (unutra)',
    'right face': 'desna strana',
    'inside': 'unutrašnja',
    'rear': 'zadnja',
    'inner': 'unutrašnja',
    'dowel': 'tipla',
    'dowel (end panel)': 'tipla (stranica)',
    'dowel (divider)': 'tipla (pregrada)',
    'dowel (glue)': 'tipla (lijepi se)',
    'Minifix bolt': 'Minifix vijak',
    'Minifix bolt passage': 'Minifix prolaz vijka',
    'Minifix cam': 'Minifix ekscentar',
    'hinge plate': 'podloška šarke',
    'hinge cup (y from hinge edge)': 'čašica šarke (y od ivice šarke)',
    'back screw': 'šraf za leđa',
    'through + countersink': 'prolazno + upuštanje',

    'FILES': 'FAJLOVI',
    'panel list, grouped. Length is along the grain.': 'lista dijelova, grupisana. Dužina je u smjeru godova.',
    'every hole per part ID. X along length from end 0, Y from front edge.': 'svaka rupa po oznaci dijela. X po dužini od kraja 0, Y od prednje ivice.',
    'screws, hinges, latches, legs.': 'šrafovi, šarke, otvarači, nogice.',
    'nesting layout for each stock sheet (open in a browser or Inkscape).': 'raspored dijelova na svakoj ploči (otvorite u pregledaču ili Inkscape-u).',
    'where each part ID goes.': 'gdje ide koji dio.',
    'step-by-step manual for this exact shelf (open in a browser, print or save as PDF).': 'uputstvo korak po korak baš za ovu policu (otvorite u pregledaču, štampajte ili sačuvajte kao PDF).',
    'part stickers: ID, package, FRONT and LEFT/BOTTOM arrows.': 'naljepnice za dijelove: oznaka, paket, strelice za prednju ivicu i lijevi/donji kraj.',
    're-open this design on the website.': 'ponovo otvorite ovaj dizajn na sajtu.',
    'CONSTRUCTION': 'KONSTRUKCIJA',
    'Board {t} mm, saw kerf {k} mm, sheet trim {tr} mm each side.': 'Ploča {t} mm, širina reza {k} mm, obrez ploče {tr} mm sa svake strane.',
    'Bottom, shelves and top run the full width. Each row has its own end panels and dividers standing between two shelves.': 'Dno, police i vrh idu cijelom širinom. Svaki red ima svoje stranice i pregrade koje stoje između dvije police.',
    'End panel joints: 2 dowels Ø8 + Minifix 15 cam lock(s); cam on the inside face, bolt in the shelf. Divider joints: dowels only.': 'Spoj stranice: 2 tiple Ø8 + Minifix 15 ekscentar; ekscentar na unutrašnjoj strani, vijak u polici. Spoj pregrade: samo tiple.',
    'The back (or the end braces when there is no back) overlays the carcass, so carcass parts are shallower by its thickness.': 'Leđa (ili bočna ukrućenja kad nema leđa) naliježu preko korpusa, pa su dijelovi korpusa plići za debljinu leđa.',
    'Drilling X runs from end 0 (LEFT end of shelves, BOTTOM end of verticals). Y is measured from the FRONT edge (from the bottom edge on back panels).': 'X za bušenje se mjeri od kraja 0 (LIJEVI kraj polica, DONJI kraj vertikala). Y se mjeri od PREDNJE ivice (kod leđa od donje ivice).',
    'Hinge plate holes assume inset clip-on hinges (37 mm system line + door thickness). Check against your hinge spec.': 'Rupe za podloške šarki su za unutrašnje šarke na klik (sistemska linija 37 mm + debljina vrata). Provjerite prema specifikaciji vaših šarki.',
    'ASSEMBLY: see assembly-manual.html. In short: build face-down next to the wall, bottom towards the wall, one row at a time from the bottom; lock the cams; screw on the back; stand it up; fix it to the wall.': 'SKLAPANJE: pogledajte assembly-manual.html. Ukratko: sklapajte licem prema podu pored zida, dnom prema zidu, red po red odozdo; pritegnite ekscentre; zašrafite leđa; podignite policu; pričvrstite je za zid.',
    'Built with {brand} — cut, drilled and delivered in Montenegro if you would rather not.': 'Dizajn napravljen na sajtu {brand} — ako ne želite sami, mi krojimo, bušimo i dostavljamo u Crnoj Gori.',

    // ---------- manual ----------
    'Your shelf manual': 'Uputstvo za vašu policu',
    '{rows} rows · {bays} bays · {doors} doors': 'Redova: {rows} · Odjeljaka: {bays} · Vrata: {doors}',
    '{panels} panels in {pkgs} packages': 'Dijelova: {panels}, paketa: {pkgs}',
    'Design code {code}. Keep this manual: it is made for this shelf only.': 'Šifra dizajna {code}. Sačuvajte uputstvo: napravljeno je samo za ovu policu.',
    'Read before you start': 'Pročitajte prije početka',
    'Two people.': 'Dvije osobe.',
    'Building takes one person; lifting takes two.': 'Sklapanje može jedna osoba, a za podizanje su potrebne dvije.',
    'Build next to the wall.': 'Sklapajte pored zida.',
    'Protect the floor with the cardboard or a rug, right where the shelf will stand.': 'Zaštitite pod kartonom ili tepihom, tačno tamo gdje će polica stajati.',
    'Face-down, bottom to the wall.': 'Licem prema podu, dnom prema zidu.',
    'Leave a gap of about one shelf depth ({d} cm) between the bottom edge and the wall, so it stands up in place.': 'Ostavite razmak od otprilike jedne dubine police ({d} cm) između dna i zida, da bi polica stala tačno na mjesto kad je podignete.',
    'Read the stickers.': 'Čitajte naljepnice.',
    'Each part has an ID. ▼ FRONT marks the edge that goes on the floor. ◀ LEFT / ◀ BOTTOM marks the end that points left or down.': 'Svaki dio ima oznaku. ▼ NAPRIJED označava ivicu koja ide na pod. ◀ LIJEVO / ◀ DOLJE označava kraj koji ide lijevo ili dolje.',
    'Start with the lowest row.': 'Počnite od najnižeg reda.',
    'Then work towards yourself, one row at a time, exactly as the steps show.': 'Zatim nastavite prema sebi, red po red, tačno kako pokazuju koraci.',
    'Tools.': 'Alat.',
    'PH2 screwdriver, rubber mallet (tap through a scrap of board), drill for the wall plugs.': 'Odvijač PH2, gumeni čekić (kucajte preko komada daske), bušilica za tiplove u zidu.',
    '⚠ Fix it to the wall.': '⚠ Pričvrstite policu za zid.',
    'The wall brackets are in the hardware bag. An unfixed shelf can tip over.': 'Nosači za zid su u kesi s okovima. Nepričvršćena polica se može prevrnuti.',
    'What is in the boxes': 'Šta je u paketima',
    'Package': 'Paket',
    'Size (mm)': 'Mjere (mm)',
    '#6 Hardware': '#6 Okovi',
    'Dowels, cam bolts, cams and hinge cups come already fitted to the panels.': 'Tiple, vijci ekscentara, ekscentri i čašice šarki su već ugrađeni u ploče.',
    'The bottom': 'Dno',
    'Stand {id} on its front edge (▼ FRONT on the floor), close to the wall and parallel to it, with ◀ LEFT to your left.': 'Postavite {id} na prednju ivicu (▼ NAPRIJED na podu), blizu zida i paralelno s njim, tako da ◀ LIJEVO bude s vaše lijeve strane.',
    'Row {n}: ends and dividers': 'Red {n}: stranice i pregrade',
    'Push the end panels {ends} onto the dowels of {h}, ◀ BOTTOM towards {h}, cam holes facing inwards.': 'Nataknite stranice {ends} na tiple ploče {h}, s ◀ DOLJE prema {h} i otvorima ekscentara okrenutim unutra.',
    'Push in the dividers {ids} the same way.': 'Na isti način nataknite pregrade {ids}.',
    'Check every front edge is flat on the floor. If a part is tight, tap it with the mallet through a scrap of board.': 'Provjerite da svaka prednja ivica leži ravno na podu. Ako dio ide teško, lagano ga kucnite čekićem preko komada daske.',
    'The top': 'Vrh',
    'Shelf {id}': 'Polica {id}',
    'Lay {id} onto the row, ◀ LEFT to your left, front edge on the floor.': 'Položite {id} na red, s ◀ LIJEVO na vašoj lijevoj strani i prednjom ivicom na podu.',
    'Press it down onto all the dowels, starting at one end.': 'Pritisnite je na sve tiple, počevši od jednog kraja.',
    'Turn the cams in {ends} a quarter turn clockwise (PH2) until the joint pulls tight. Do not over-tighten.': 'Okrenite ekscentre u {ends} za četvrt kruga u smjeru kazaljke na satu (PH2) dok se spoj ne pritegne. Ne zatežite previše.',
    'The back': 'Leđa',
    'End braces': 'Bočna ukrućenja',
    'Lay the back panel on, ◀ BOTTOM towards the wall.': 'Položite leđa, s ◀ DOLJE prema zidu.',
    'Lay the back panels on, ◀ BOTTOM towards the wall.': 'Položite dijelove leđa, s ◀ DOLJE prema zidu.',
    'Lay a brace on each end of every row, ◀ BOTTOM towards the wall.': 'Položite po jedno ukrućenje na oba kraja svakog reda, s ◀ DOLJE prema zidu.',
    'Line the edges up with the outside of the shelf. The pre-drilled holes sit right over the shelves and panels.': 'Poravnajte ivice sa spoljnim ivicama police. Izbušene rupe padaju tačno iznad polica i stranica.',
    'Screw down with the 3.5×16 screws, corners first. This squares the shelf.': 'Zašrafite šrafovima 3,5×16, prvo uglove. Tako se polica ispravlja pod pravim uglom.',
    'The plinth': 'Sokla',
    'The legs': 'Nogice',
    'Glue the dowels and push the plinth frame together: returns between the front and back rail.': 'Namažite tiple ljepilom i sklopite okvir sokle: bočne dijelove između prednje i zadnje letve.',
    'Place it against the outside of {id}, set back 40 mm from the front and fixed with the angle brackets.': 'Postavite ga uz spoljnu stranu ploče {id}, 40 mm uvučeno od prednje ivice, i pričvrstite ugaonicima.',
    'Screw the {n} legs to the outside of {id}, about 50 mm in from each corner{mid}.': 'Zašrafite {n} nogice na spoljnu stranu ploče {id}, oko 50 mm od svakog ugla{mid}.',
    ' plus two in the middle': ' i dvije na sredini',
    'Stand it up and fix it to the wall': 'Podignite policu i pričvrstite je za zid',
    'With two people, lift the shelf by the vertical panels, as close to the middle as possible. It pivots on its bottom edge and ends up against the wall.': 'U dvoje podignite policu držeći je za vertikalne ploče, što bliže sredini. Okreće se oko donje ivice i završava uz zid.',
    'Screw the {n} L-brackets to the top of {id}, then mark, drill and plug the wall. Use plugs that suit your wall.': 'Zašrafite {n} L-nosača na vrh ploče {id}, pa označite, izbušite zid i stavite tiplove. Koristite tiplove koji odgovaraju vašem zidu.',
    'Never use the shelf before it is fixed to the wall.': 'Nikada ne koristite policu prije nego što je pričvršćena za zid.',
    'Hook each hinge onto its mounting plate at the front, then press the back until it clicks.': 'Zakačite svaku šarku na podlošku sprijeda, pa pritisnite zadnji dio dok ne klikne.',
    'Fit the push latch on the side opposite the hinges, so a push opens the door.': 'Postavite push-to-open otvarač na stranu suprotnu od šarki, da se vrata otvaraju pritiskom.',
    'Door crooked? Adjust the hinge screws with a PH2: front screw = depth, middle = height, rear = side to side.': 'Vrata nisu prava? Podesite šrafove na šarki odvijačem PH2: prednji = dubina, srednji = visina, zadnji = lijevo-desno.',
    'Looking after it': 'Održavanje',
    'Wipe spills quickly.': 'Prolivenu tečnost obrišite odmah.',
    "Don't let water stand on the surface.": 'Ne ostavljajte vodu na površini.',
    'Soft, damp cloth.': 'Meka, vlažna krpa.',
    'Mild cleaners only, no scourers.': 'Samo blaga sredstva, bez abrazivnih sunđera.',
    'Away from heat.': 'Dalje od toplote.',
    'Keep it clear of radiators and open flame.': 'Držite je dalje od radijatora i otvorenog plamena.',
    'Moving house?': 'Selite se?',
    'Turn the cams back and it comes apart the same way it went together.': 'Vratite ekscentre i polica se rastavlja istim redom kojim se sklapala.',
    'Something not right?': 'Nešto nije u redu?',
    '{email} · quote {code}': '{email} · navedite šifru {code}',
    'WALL': 'ZID',
    ' and ': ' i ',
    '◀ LEFT': '◀ LIJEVO',
    'front faces the floor · you stand here': 'prednja strana je na podu · vi stojite ovdje',
    '{brand} assembly manual for {code}': '{brand} uputstvo za sklapanje {code}',
    'Print / save PDF': 'Štampaj / sačuvaj PDF',
    '{brand} manual {code}': '{brand} uputstvo {code}',
    '{size} mm · package #{pkg}': '{size} mm · paket #{pkg}',
    '◀ LEFT end': '◀ LIJEVI kraj',
    '◀ BOTTOM end': '◀ DONJI kraj',
    '◀ HINGE side': '◀ strana ŠARKE',
    '▼ FRONT edge': '▼ PREDNJA ivica',
    '▼ FLOOR edge': '▼ ivica na PODU',
    'countersinks face out': 'upuštene rupe spolja',
    '{brand} labels {code}': '{brand} naljepnice {code}',
    'Print on A4 label sheets (3 × 8, 70 × 37 mm). Stick each label on the inside face near the front edge, with ▼ FRONT pointing at that edge.': 'Štampajte na A4 tabake naljepnica (3 × 8, 70 × 37 mm). Zalijepite naljepnicu na unutrašnju stranu blizu prednje ivice, sa ▼ strelicom prema toj ivici.'
  };

  const LANGS = ['en', 'nas'];
  const HTML_LANG = { en: 'en', nas: 'hbs-Latn' };   // umbrella code, no national label
  const LOCAL_PREFIXES = ['sr', 'hr', 'bs', 'cnr', 'sh', 'hbs', 'me'];

  function detect() {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (LANGS.includes(q)) return q;
      const saved = localStorage.getItem('mjera-lang');
      if (LANGS.includes(saved)) return saved;
    } catch (e) { /* ignore */ }
    const prefs = (navigator.languages || [navigator.language || 'en']).map(l => String(l).toLowerCase().split('-')[0]);
    return LOCAL_PREFIXES.includes(prefs[0]) ? 'nas' : 'en';
  }

  let lang = detect();

  function t(en, vars) {
    let s = lang === 'nas' && LOCAL[en] != null ? LOCAL[en] : en;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }

  // ---- static DOM translation (text nodes + a few attributes) ----
  const textOrig = new WeakMap();
  const attrOrig = new WeakMap();
  const ATTRS = ['title', 'aria-label', 'placeholder'];
  const norm = s => s.replace(/\s+/g, ' ').trim();

  function apply(root) {
    root = root || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let node;
    while ((node = walker.nextNode())) {
      const orig = textOrig.has(node) ? textOrig.get(node) : node.nodeValue;
      const key = norm(orig);
      if (!key || LOCAL[key] == null) continue;
      textOrig.set(node, orig);
      const lead = orig.match(/^\s*/)[0], trail = orig.match(/\s*$/)[0];
      node.nodeValue = lang === 'nas' ? lead + LOCAL[key] + trail : orig;
    }
    root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(el => {
      const saved = attrOrig.get(el) || {};
      ATTRS.forEach(a => {
        if (!el.hasAttribute(a)) return;
        const orig = saved[a] != null ? saved[a] : el.getAttribute(a);
        if (LOCAL[orig] == null) return;
        saved[a] = orig;
        el.setAttribute(a, lang === 'nas' ? LOCAL[orig] : orig);
      });
      attrOrig.set(el, saved);
    });
    // document title + description
    if (!apply.title) apply.title = document.title;
    document.title = t(apply.title);
    const meta = document.querySelector('meta[name=description]');
    if (meta) { if (!apply.desc) apply.desc = meta.content; meta.content = t(apply.desc); }
  }

  function setLang(l) {
    if (!LANGS.includes(l)) return;
    lang = l;
    try { localStorage.setItem('mjera-lang', l); } catch (e) { /* ignore */ }
    document.documentElement.lang = HTML_LANG[l];
    apply(document.body);
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
    document.dispatchEvent(new CustomEvent('mjera:lang', { detail: l }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) setLang(b.dataset.lang); });
    setLang(lang);
  });

  MJERA.t = t;
  MJERA.i18n = { t, setLang, apply, get lang() { return lang; }, htmlLang: () => HTML_LANG[lang], LOCAL };
})();
