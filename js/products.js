/* Shop catalogue. Real products have photos; the rest are placeholders that fill the shelves
   until real stock is added. Exposed as window.CATALOG. */
(function () {
  'use strict';

  var BASE = 'assets/products/';

  var real = [
    {
      id: 'tricou-pb-ny',
      section: 'tb',
      real: true,
      name: 'Tricou oversize negru „New York”',
      brand: 'Pull&Bear',
      price: 49,
      size: 'L',
      details: [
        ['Culoare', 'Negru, imprimeu alb'],
        ['Mărime', 'L (EUR L · USA L · MEX 40)'],
        ['Croială', 'Oversize, mânecă scurtă'],
        ['Imprimeu', 'Față: grafică „New York” · Spate: „Williamsburg/Brooklyn”, „3743 Number Room”'],
        ['Material', 'de completat'],
        ['Grad de uzură', 'de completat'],
        ['Dimensiuni', 'de completat (lățime la subraț, lungime)']
      ],
      texture: { front: BASE + 'tricou-pb-ny/front.webp', back: BASE + 'tricou-pb-ny/back.webp', width: 0.6 },
      photos: [
        { src: BASE + 'tricou-pb-ny/photo-front.jpg', alt: 'Tricoul văzut din față' },
        { src: BASE + 'tricou-pb-ny/photo-back.jpg', alt: 'Tricoul văzut din spate' },
        { src: BASE + 'tricou-pb-ny/photo-d_print.jpg', alt: 'Imprimeul din față de aproape' },
        { src: BASE + 'tricou-pb-ny/photo-d_back_text.jpg', alt: 'Textul de pe spate, stânga' },
        { src: BASE + 'tricou-pb-ny/photo-d_back_neck.jpg', alt: 'Textul de pe spate, dreapta, și gulerul' },
        { src: BASE + 'tricou-pb-ny/photo-d_label.jpg', alt: 'Eticheta cu mărimea' }
      ]
    }
  ];

  /* placeholder stock: [section, kind, colour, price, size] */
  var demo = [
    ['tf', 'tshirt', '#e7c3b0', 35, 'S'], ['tf', 'tshirt', '#2f6f78', 29, 'M'], ['tf', 'tshirt', '#f2efe9', 25, 'M'], ['tf', 'tshirt', '#9db4c0', 32, 'L'], ['tf', 'tshirt', '#e8735a', 30, 'S'],
    ['rf', 'dress', '#d98f6f', 79, 'M'], ['rf', 'dress', '#2f6f78', 95, 'S'], ['rf', 'dress', '#efe1c6', 69, 'M'], ['rf', 'dress', '#7d8fa3', 85, 'L'],
    ['bf', 'jeans', '#3b5b7a', 89, '28'], ['bf', 'jeans', '#5a7593', 75, '30'], ['bf', 'jeans', '#2c3e55', 99, '27'], ['bf', 'jeans', '#9db4c0', 69, '29'],
    ['tb', 'tshirt', '#f2efe9', 29, 'L'], ['tb', 'tshirt', '#5d7f78', 35, 'XL'], ['tb', 'tshirt', '#34405e', 32, 'M'], ['tb', 'tshirt', '#c9b48a', 27, 'L'],
    ['cb', 'shirt', '#f2efe9', 55, 'M'], ['cb', 'shirt', '#9db4c0', 59, 'L'], ['cb', 'shirt', '#c9b48a', 49, 'XL'], ['cb', 'shirt', '#5d7f78', 65, 'L'],
    ['pb', 'jeans', '#253246', 85, '32'], ['pb', 'jeans', '#c9b48a', 79, '34'], ['pb', 'jeans', '#3b5b7a', 89, '31'], ['pb', 'jeans', '#5d6b60', 75, '33'],
    ['gh', 'hoodie', '#2f6f78', 119, 'L'], ['gh', 'hoodie', '#e9dfd1', 99, 'M'], ['gh', 'hoodie', '#34405e', 129, 'XL'], ['gh', 'hoodie', '#e8735a', 109, 'S'], ['gh', 'hoodie', '#7d8fa3', 115, 'L'],
    ['red', 'tshirt', '#e8735a', 19, 'M'], ['red', 'shirt', '#f2efe9', 25, 'L'], ['red', 'dress', '#9db4c0', 39, 'S'], ['red', 'jeans', '#5a7593', 45, '30'],
    ['nou', 'hoodie', '#5d7f78', 139, 'M'], ['nou', 'dress', '#2f6f78', 99, 'M'], ['nou', 'tshirt', '#1d2b30', 45, 'L'], ['nou', 'shirt', '#e9dfd1', 69, 'M']
  ];
  var KIND_NAME = { tshirt: 'Tricou', shirt: 'Cămașă', dress: 'Rochie', jeans: 'Blugi', hoodie: 'Hanorac' };

  var items = real.slice();
  demo.forEach(function (d, i) {
    items.push({
      id: 'demo-' + i,
      section: d[0],
      real: false,
      kind: d[1],
      color: d[2],
      name: KIND_NAME[d[1]] + ' (exemplu)',
      brand: '—',
      price: d[3],
      size: d[4],
      details: [
        ['Mărime', d[4]],
        ['Notă', 'Produs demonstrativ. Aici apar pozele și detaliile reale când adaugi marfa.']
      ],
      photos: []
    });
  });

  window.CATALOG = {
    items: items,
    bySection: function (id) { return items.filter(function (p) { return p.section === id; }); },
    get: function (id) { return items.filter(function (p) { return p.id === id; })[0] || null; }
  };
})();
