/* Shop catalogue. The first item is a real product; the rest are SAMPLE items for the preview
   only (photos from open-source demo shops and the CC0 "Clothing dataset"), not for sale.
   Exposed as window.CATALOG. */
(function () {
  'use strict';

  var real = [
    {
      id: 'tricou-pb-ny',
      section: 'tb',
      kind: 'tshirt',
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
      texture: { front: 'assets/products/tricou-pb-ny/front.webp', back: 'assets/products/tricou-pb-ny/back.webp', width: 0.6 },
      photos: [
        { src: 'assets/products/tricou-pb-ny/photo-front.jpg', alt: 'Tricoul văzut din față' },
        { src: 'assets/products/tricou-pb-ny/photo-back.jpg', alt: 'Tricoul văzut din spate' },
        { src: 'assets/products/tricou-pb-ny/photo-d_print.jpg', alt: 'Imprimeul din față de aproape' },
        { src: 'assets/products/tricou-pb-ny/photo-d_back_text.jpg', alt: 'Textul de pe spate, stânga' },
        { src: 'assets/products/tricou-pb-ny/photo-d_back_neck.jpg', alt: 'Textul de pe spate, dreapta, și gulerul' },
        { src: 'assets/products/tricou-pb-ny/photo-d_label.jpg', alt: 'Eticheta cu mărimea' }
      ]
    }
  ];

  var samples = [
    {
      "id": "tee-ascii",
      "section": "tb",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou albastru „Truly open”",
      "brand": "Saleor (demo)",
      "price": 39,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Albastru"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "100% bumbac"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "55 × 72 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/tee-ascii-front.webp",
        "back": "assets/demo/tee-ascii-back.webp",
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-ascii-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/tee-ascii-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "tee-dark-poly",
      "section": "tb",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou bleumarin cu poligon",
      "brand": "Saleor (demo)",
      "price": 35,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Bleumarin"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "100% bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "52 × 70 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/tee-dark-poly-front.webp",
        "back": "assets/demo/tee-dark-poly-back.webp",
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-dark-poly-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/tee-dark-poly-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "tee-dash",
      "section": "tb",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou gri cu imprimeu",
      "brand": "Saleor (demo)",
      "price": 32,
      "size": "XL",
      "details": [
        [
          "Culoare",
          "Gri melanj"
        ],
        [
          "Mărime",
          "XL"
        ],
        [
          "Material",
          "Bumbac, poliester"
        ],
        [
          "Grad de uzură",
          "Bun, ușor decolorat"
        ],
        [
          "Dimensiuni",
          "58 × 75 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/tee-dash-front.webp",
        "back": "assets/demo/tee-dash-back.webp",
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-dash-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/tee-dash-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "tee-solidus",
      "section": "tb",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou negru cu logo",
      "brand": "Solidus (demo)",
      "price": 29,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Negru"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "100% bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "52 × 71 cm"
        ]
      ],
      "source": "magazinul demo open-source Solidus",
      "texture": {
        "front": "assets/demo/tee-solidus-front.webp",
        "back": null,
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-solidus-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "tee-mono",
      "section": "tf",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou alb cu pătrat albastru",
      "brand": "Saleor (demo)",
      "price": 35,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Alb, imprimeu albastru"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "100% bumbac"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "48 × 64 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/tee-mono-front.webp",
        "back": "assets/demo/tee-mono-back.webp",
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-mono-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/tee-mono-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "tee-cubes",
      "section": "tf",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou alb cu cuburi",
      "brand": "Saleor (demo)",
      "price": 33,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Alb"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "100% bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "50 × 66 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/tee-cubes-front.webp",
        "back": "assets/demo/tee-cubes-back.webp",
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-cubes-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/tee-cubes-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "tee-blue-poly",
      "section": "tf",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou albastru cu poligon",
      "brand": "Saleor (demo)",
      "price": 30,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Albastru"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Bumbac organic"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "47 × 63 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/tee-blue-poly-front.webp",
        "back": "assets/demo/tee-blue-poly-back.webp",
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-blue-poly-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/tee-blue-poly-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "tee-team",
      "section": "tf",
      "kind": "tshirt",
      "real": true,
      "sample": true,
      "name": "Tricou albastru „Team”",
      "brand": "Saleor (demo)",
      "price": 28,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Albastru"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "100% bumbac"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "50 × 65 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/tee-team-front.webp",
        "back": "assets/demo/tee-team-back.webp",
        "width": 0.6
      },
      "photos": [
        {
          "src": "assets/demo/tee-team-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/tee-team-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "shirt-plaid",
      "section": "cb",
      "kind": "shirt",
      "real": true,
      "sample": true,
      "name": "Cămașă în carouri",
      "brand": "—",
      "price": 55,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Gri, carouri"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "56 × 76 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/shirt-plaid-front.webp",
        "back": null,
        "width": 0.62
      },
      "photos": [
        {
          "src": "assets/demo/shirt-plaid-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "shirt-check-red",
      "section": "cb",
      "kind": "shirt",
      "real": true,
      "sample": true,
      "name": "Cămașă carouri roșii",
      "brand": "—",
      "price": 49,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Roșu, alb, bleumarin"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "54 × 74 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/shirt-check-red-front.webp",
        "back": null,
        "width": 0.62
      },
      "photos": [
        {
          "src": "assets/demo/shirt-check-red-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "shirt-denim",
      "section": "cb",
      "kind": "shirt",
      "real": true,
      "sample": true,
      "name": "Cămașă denim",
      "brand": "—",
      "price": 65,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Albastru denim"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "100% bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "57 × 78 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/shirt-denim-front.webp",
        "back": null,
        "width": 0.62
      },
      "photos": [
        {
          "src": "assets/demo/shirt-denim-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "shirt-stripes",
      "section": "cb",
      "kind": "shirt",
      "real": true,
      "sample": true,
      "name": "Cămașă albă cu dungi fine",
      "brand": "—",
      "price": 59,
      "size": "XL",
      "details": [
        [
          "Culoare",
          "Alb, dungi roșii"
        ],
        [
          "Mărime",
          "XL"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "60 × 80 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/shirt-stripes-front.webp",
        "back": null,
        "width": 0.62
      },
      "photos": [
        {
          "src": "assets/demo/shirt-stripes-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "polo-navy",
      "section": "cb",
      "kind": "shirt",
      "real": true,
      "sample": true,
      "name": "Tricou polo bleumarin",
      "brand": "Saleor (demo)",
      "price": 45,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Bleumarin"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Bumbac piqué"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "53 × 72 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/polo-navy-front.webp",
        "back": "assets/demo/polo-navy-back.webp",
        "width": 0.62
      },
      "photos": [
        {
          "src": "assets/demo/polo-navy-photo.jpg",
          "alt": "Poza produsului din față"
        },
        {
          "src": "assets/demo/polo-navy-photo-back.jpg",
          "alt": "Poza produsului din spate"
        }
      ]
    },
    {
      "id": "dress-red",
      "section": "rf",
      "kind": "dress",
      "real": true,
      "sample": true,
      "name": "Rochie roșie midi",
      "brand": "—",
      "price": 89,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Roșu"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Poliester, elastan"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Lungime 98 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/dress-red-front.webp",
        "back": null,
        "width": 0.56
      },
      "photos": [
        {
          "src": "assets/demo/dress-red-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "dress-black",
      "section": "rf",
      "kind": "dress",
      "real": true,
      "sample": true,
      "name": "Rochie neagră evazată",
      "brand": "—",
      "price": 79,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Negru"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Viscoză"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "Lungime 90 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/dress-black-front.webp",
        "back": null,
        "width": 0.56
      },
      "photos": [
        {
          "src": "assets/demo/dress-black-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "dress-green",
      "section": "rf",
      "kind": "dress",
      "real": true,
      "sample": true,
      "name": "Rochie verde oliv",
      "brand": "—",
      "price": 95,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Verde oliv"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "Lungime 102 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/dress-green-front.webp",
        "back": null,
        "width": 0.56
      },
      "photos": [
        {
          "src": "assets/demo/dress-green-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "dress-floral",
      "section": "rf",
      "kind": "dress",
      "real": true,
      "sample": true,
      "name": "Rochie cu flori",
      "brand": "—",
      "price": 85,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Albastru, flori"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Lungime 100 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/dress-floral-front.webp",
        "back": null,
        "width": 0.56
      },
      "photos": [
        {
          "src": "assets/demo/dress-floral-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "dress-pink",
      "section": "rf",
      "kind": "dress",
      "real": true,
      "sample": true,
      "name": "Rochie roz cu nasturi",
      "brand": "—",
      "price": 75,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Roz"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Poliester"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "Lungime 94 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/dress-pink-front.webp",
        "back": null,
        "width": 0.56
      },
      "photos": [
        {
          "src": "assets/demo/dress-pink-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "skirt-navy",
      "section": "rf",
      "kind": "skirt",
      "real": true,
      "sample": true,
      "name": "Fustă plisată bleumarin",
      "brand": "—",
      "price": 49,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Bleumarin"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Poliester"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Lungime 55 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/skirt-navy-front.webp",
        "back": null,
        "width": 0.5
      },
      "photos": [
        {
          "src": "assets/demo/skirt-navy-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "jeans-w1",
      "section": "bf",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Blugi drepți albastru",
      "brand": "—",
      "price": 89,
      "size": "28",
      "details": [
        [
          "Culoare",
          "Albastru"
        ],
        [
          "Mărime",
          "28"
        ],
        [
          "Material",
          "Denim, bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Talie 72 cm, lungime 102 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/jeans-w1-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/jeans-w1-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "jeans-w2",
      "section": "bf",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Blugi skinny deschiși",
      "brand": "—",
      "price": 75,
      "size": "27",
      "details": [
        [
          "Culoare",
          "Albastru deschis"
        ],
        [
          "Mărime",
          "27"
        ],
        [
          "Material",
          "Denim stretch"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "Talie 70 cm, lungime 98 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/jeans-w2-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/jeans-w2-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "jeans-w3",
      "section": "bf",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Blugi bleumarin",
      "brand": "—",
      "price": 69,
      "size": "29",
      "details": [
        [
          "Culoare",
          "Bleumarin"
        ],
        [
          "Mărime",
          "29"
        ],
        [
          "Material",
          "Denim stretch"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Talie 74 cm, lungime 100 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/jeans-w3-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/jeans-w3-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "jeans-w4",
      "section": "bf",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Blugi rupți la genunchi",
      "brand": "—",
      "price": 99,
      "size": "28",
      "details": [
        [
          "Culoare",
          "Albastru deschis"
        ],
        [
          "Mărime",
          "28"
        ],
        [
          "Material",
          "Denim"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "Talie 72 cm, lungime 101 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/jeans-w4-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/jeans-w4-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "skirt-denim",
      "section": "bf",
      "kind": "skirt",
      "real": true,
      "sample": true,
      "name": "Fustă denim",
      "brand": "—",
      "price": 55,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Albastru"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Denim"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Lungime 60 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/skirt-denim-front.webp",
        "back": null,
        "width": 0.5
      },
      "photos": [
        {
          "src": "assets/demo/skirt-denim-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "pants-grey",
      "section": "pb",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Blugi gri slim",
      "brand": "—",
      "price": 85,
      "size": "32",
      "details": [
        [
          "Culoare",
          "Gri"
        ],
        [
          "Mărime",
          "32"
        ],
        [
          "Material",
          "Denim"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Talie 82 cm, lungime 106 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/pants-grey-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/pants-grey-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "pants-black",
      "section": "pb",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Blugi negri drepți",
      "brand": "—",
      "price": 79,
      "size": "34",
      "details": [
        [
          "Culoare",
          "Negru"
        ],
        [
          "Mărime",
          "34"
        ],
        [
          "Material",
          "Denim"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "Talie 86 cm, lungime 108 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/pants-black-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/pants-black-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "pants-dark",
      "section": "pb",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Blugi bleumarin închis",
      "brand": "—",
      "price": 89,
      "size": "33",
      "details": [
        [
          "Culoare",
          "Bleumarin"
        ],
        [
          "Mărime",
          "33"
        ],
        [
          "Material",
          "Denim"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Talie 84 cm, lungime 107 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/pants-dark-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/pants-dark-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "pants-khaki",
      "section": "pb",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Pantaloni kaki",
      "brand": "—",
      "price": 69,
      "size": "32",
      "details": [
        [
          "Culoare",
          "Kaki"
        ],
        [
          "Mărime",
          "32"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "Talie 82 cm, lungime 104 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/pants-khaki-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/pants-khaki-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "pants-track",
      "section": "pb",
      "kind": "jeans",
      "real": true,
      "sample": true,
      "name": "Pantaloni de trening",
      "brand": "—",
      "price": 59,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Negru"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "Poliester"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Talie 80 cm, lungime 105 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/pants-track-front.webp",
        "back": null,
        "width": 0.44
      },
      "photos": [
        {
          "src": "assets/demo/pants-track-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "hoodie-blue",
      "section": "gh",
      "kind": "hoodie",
      "real": true,
      "sample": true,
      "name": "Hanorac albastru cu fermoar",
      "brand": "Saleor (demo)",
      "price": 119,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Albastru"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "Bumbac, poliester"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "60 × 70 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/hoodie-blue-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/hoodie-blue-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "hoodie-grey",
      "section": "gh",
      "kind": "hoodie",
      "real": true,
      "sample": true,
      "name": "Hanorac gri cu glugă",
      "brand": "Saleor (demo)",
      "price": 109,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Gri melanj"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "58 × 68 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/hoodie-grey-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/hoodie-grey-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "hoodie-black",
      "section": "gh",
      "kind": "hoodie",
      "real": true,
      "sample": true,
      "name": "Hanorac negru",
      "brand": "Solidus (demo)",
      "price": 99,
      "size": "XL",
      "details": [
        [
          "Culoare",
          "Negru"
        ],
        [
          "Mărime",
          "XL"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "62 × 72 cm"
        ]
      ],
      "source": "magazinul demo open-source Solidus",
      "texture": {
        "front": "assets/demo/hoodie-black-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/hoodie-black-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "jacket-leather",
      "section": "gh",
      "kind": "jacket",
      "real": true,
      "sample": true,
      "name": "Geacă din piele",
      "brand": "—",
      "price": 249,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Negru"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Piele"
        ],
        [
          "Grad de uzură",
          "Bun, urme fine de purtare"
        ],
        [
          "Dimensiuni",
          "58 × 66 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/jacket-leather-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/jacket-leather-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "coat-red",
      "section": "gh",
      "kind": "jacket",
      "real": true,
      "sample": true,
      "name": "Palton roșu scurt",
      "brand": "—",
      "price": 189,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Roșu"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Lână, poliester"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "52 × 74 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/coat-red-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/coat-red-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "puffer-navy",
      "section": "gh",
      "kind": "jacket",
      "real": true,
      "sample": true,
      "name": "Geacă matlasată bleumarin",
      "brand": "—",
      "price": 159,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Bleumarin"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "Poliester, puf"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "60 × 70 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/puffer-navy-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/puffer-navy-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "hoodie-red",
      "section": "red",
      "kind": "hoodie",
      "real": true,
      "sample": true,
      "name": "Hanorac roșu",
      "brand": "Solidus (demo)",
      "price": 59,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Roșu"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "57 × 68 cm"
        ]
      ],
      "source": "magazinul demo open-source Solidus",
      "texture": {
        "front": "assets/demo/hoodie-red-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/hoodie-red-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "skirt-red",
      "section": "red",
      "kind": "skirt",
      "real": true,
      "sample": true,
      "name": "Fustă roșie creion",
      "brand": "—",
      "price": 25,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Roșu"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Poliester"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "Lungime 58 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/skirt-red-front.webp",
        "back": null,
        "width": 0.5
      },
      "photos": [
        {
          "src": "assets/demo/skirt-red-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "skirt-yellow",
      "section": "red",
      "kind": "skirt",
      "real": true,
      "sample": true,
      "name": "Fustă plisată muștar",
      "brand": "—",
      "price": 29,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Galben muștar"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Poliester"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Lungime 62 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/skirt-yellow-front.webp",
        "back": null,
        "width": 0.5
      },
      "photos": [
        {
          "src": "assets/demo/skirt-yellow-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "dress-black-short",
      "section": "red",
      "kind": "dress",
      "real": true,
      "sample": true,
      "name": "Rochie neagră scurtă",
      "brand": "—",
      "price": 39,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Negru"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Viscoză"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "Lungime 84 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/dress-black-short-front.webp",
        "back": null,
        "width": 0.56
      },
      "photos": [
        {
          "src": "assets/demo/dress-black-short-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "longsleeve-red",
      "section": "red",
      "kind": "shirt",
      "real": true,
      "sample": true,
      "name": "Bluză roșie cu mânecă lungă",
      "brand": "Solidus (demo)",
      "price": 25,
      "size": "L",
      "details": [
        [
          "Culoare",
          "Roșu"
        ],
        [
          "Mărime",
          "L"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Bun"
        ],
        [
          "Dimensiuni",
          "55 × 72 cm"
        ]
      ],
      "source": "magazinul demo open-source Solidus",
      "texture": {
        "front": "assets/demo/longsleeve-red-front.webp",
        "back": null,
        "width": 0.62
      },
      "photos": [
        {
          "src": "assets/demo/longsleeve-red-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "hoodie-white",
      "section": "nou",
      "kind": "hoodie",
      "real": true,
      "sample": true,
      "name": "Hanorac alb cu glugă",
      "brand": "Saleor (demo)",
      "price": 139,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Alb"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "58 × 68 cm"
        ]
      ],
      "source": "magazinul demo open-source Saleor",
      "texture": {
        "front": "assets/demo/hoodie-white-front.webp",
        "back": null,
        "width": 0.64
      },
      "photos": [
        {
          "src": "assets/demo/hoodie-white-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "skirt-plaid",
      "section": "nou",
      "kind": "skirt",
      "real": true,
      "sample": true,
      "name": "Fustă în carouri",
      "brand": "—",
      "price": 65,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Negru, gri"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Lână, poliester"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "Lungime 50 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/skirt-plaid-front.webp",
        "back": null,
        "width": 0.5
      },
      "photos": [
        {
          "src": "assets/demo/skirt-plaid-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "shirt-white",
      "section": "nou",
      "kind": "shirt",
      "real": true,
      "sample": true,
      "name": "Cămașă albă cu mânecă scurtă",
      "brand": "—",
      "price": 55,
      "size": "M",
      "details": [
        [
          "Culoare",
          "Alb"
        ],
        [
          "Mărime",
          "M"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Ca nou"
        ],
        [
          "Dimensiuni",
          "54 × 72 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/shirt-white-front.webp",
        "back": null,
        "width": 0.62
      },
      "photos": [
        {
          "src": "assets/demo/shirt-white-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    },
    {
      "id": "dress-paisley",
      "section": "nou",
      "kind": "dress",
      "real": true,
      "sample": true,
      "name": "Rochie cu model paisley",
      "brand": "—",
      "price": 69,
      "size": "S",
      "details": [
        [
          "Culoare",
          "Albastru, alb"
        ],
        [
          "Mărime",
          "S"
        ],
        [
          "Material",
          "Bumbac"
        ],
        [
          "Grad de uzură",
          "Foarte bun"
        ],
        [
          "Dimensiuni",
          "Lungime 88 cm"
        ]
      ],
      "source": "setul gratuit „Clothing dataset” (CC0)",
      "texture": {
        "front": "assets/demo/dress-paisley-front.webp",
        "back": null,
        "width": 0.56
      },
      "photos": [
        {
          "src": "assets/demo/dress-paisley-photo.jpg",
          "alt": "Poza produsului"
        }
      ]
    }
  ];

  var items = real.concat(samples);
  window.CATALOG = {
    items: items,
    bySection: function (id) { return items.filter(function (p) { return p.section === id; }); },
    get: function (id) { return items.filter(function (p) { return p.id === id; })[0] || null; }
  };
})();
