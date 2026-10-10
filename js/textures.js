/* Canvas-drawn textures in the clean style: signs, stickers, pins, price tags. Exposed as window.TX. */
(function () {
  'use strict';

  var F_DISPLAY = '"Bricolage Grotesque", "Arial Black", sans-serif';
  var F_HAND = '"Caveat", "Segoe Print", "Comic Sans MS", cursive';
  var F_UI = '"Manrope", system-ui, sans-serif';

  /* palette shared by the whole shop */
  var C = {
    teal: '#1f6f78',
    tealDark: '#17535a',
    ink: '#1d2b30',
    white: '#f7f6f3',
    paper: '#fbfaf7',
    sand: '#e9dfd1',
    amber: '#f5b841',
    coral: '#e8735a'
  };

  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c, o) {
    o = o || {};
    var t = new THREE.CanvasTexture(c);
    if (!o.linear) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  }
  function make(w, h, draw, o) { var c = canvas(w, h); draw(c.getContext('2d'), w, h); var t = tex(c, o); t.userData = { w: w, h: h }; return t; }
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function spaced(g, text, x, y, spacing) {
    var total = 0, i, widths = [];
    for (i = 0; i < text.length; i++) { widths.push(g.measureText(text[i]).width); total += widths[i]; }
    total += spacing * (text.length - 1);
    var cx = x - total / 2, prev = g.textAlign;
    g.textAlign = 'left';
    for (i = 0; i < text.length; i++) { g.fillText(text[i], cx, y); cx += widths[i] + spacing; }
    g.textAlign = prev;
  }

  var TX = {};

  /* Name lettering on the door glass (white vinyl) */
  TX.glassName = function () {
    return make(1024, 300, function (g, w, h) {
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = C.tealDark;
      g.font = '800 150px ' + F_DISPLAY;
      spaced(g, 'UMERAȘ', w / 2, 118, 18);
      g.font = '700 40px ' + F_UI;
      g.fillStyle = C.ink;
      spaced(g, 'SECOND-HAND · HAINE CU POVESTE', w / 2, 236, 6);
    });
  };

  /* Clean hanging sign, both faces */
  TX.openFront = function () {
    return make(640, 300, function (g, w, h) {
      rr(g, 6, 6, w - 12, h - 12, 40);
      g.fillStyle = C.white; g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.teal;
      g.font = '800 140px ' + F_DISPLAY;
      g.fillText('OPEN', w / 2, 128);
      g.font = '700 36px ' + F_UI;
      g.fillStyle = C.ink;
      spaced(g, 'DESCHIS NON-STOP', w / 2, 232, 5);
    });
  };
  TX.openBack = function () {
    return make(640, 300, function (g, w, h) {
      rr(g, 6, 6, w - 12, h - 12, 40);
      g.fillStyle = C.teal; g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.white;
      g.font = '800 92px ' + F_DISPLAY;
      g.fillText('MEREU', w / 2, 92);
      g.fillText('DESCHIS', w / 2, 180);
      g.font = '700 34px ' + F_UI;
      g.fillStyle = C.amber;
      spaced(g, '24 / 7 · ONLINE', w / 2, 252, 5);
    });
  };

  /* Opening hours plate on the lower door panel */
  TX.plaque = function () {
    return make(640, 240, function (g, w, h) {
      rr(g, 4, 4, w - 8, h - 8, 26);
      g.fillStyle = C.white; g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.teal;
      g.font = '700 30px ' + F_UI;
      spaced(g, 'PROGRAM', w / 2, 56, 12);
      g.fillStyle = C.ink;
      g.font = '800 58px ' + F_DISPLAY;
      g.fillText('00:00 – 24:00', w / 2, 122);
      g.font = '600 32px ' + F_UI;
      g.fillStyle = '#5b6b70';
      g.fillText('non-stop, în fiecare zi', w / 2, 186);
    });
  };

  TX.skipSticker = function () {
    return make(512, 512, function (g, w, h) {
      g.save();
      g.translate(w / 2, h / 2);
      g.beginPath(); g.arc(0, 0, 244, 0, Math.PI * 2); g.fillStyle = C.white; g.fill();
      g.beginPath(); g.arc(0, 0, 228, 0, Math.PI * 2); g.fillStyle = C.coral; g.fill();
      g.fillStyle = C.white;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '800 88px ' + F_DISPLAY;
      g.fillText('SARI', 0, -96);
      g.fillText('PESTE', 0, -10);
      g.fillText('INTRO', 0, 76);
      g.strokeStyle = C.white; g.lineWidth = 13; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(-46, 156); g.lineTo(40, 156);
      g.moveTo(14, 130); g.lineTo(42, 156); g.lineTo(14, 182);
      g.stroke();
      g.restore();
    });
  };

  /* Consumer-information notice taped inside the door glass (A-format sheet) */
  TX.legalPoster = function () {
    return make(600, 820, function (g, w, h) {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#1d2b30'; g.lineWidth = 6;
      g.strokeRect(18, 18, w - 36, h - 36);
      g.lineWidth = 2;
      g.strokeRect(30, 30, w - 60, h - 60);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      // crest-like round seal
      g.beginPath(); g.arc(w / 2, 104, 44, 0, Math.PI * 2); g.fillStyle = '#1f3f6e'; g.fill();
      g.beginPath(); g.arc(w / 2, 104, 36, 0, Math.PI * 2); g.lineWidth = 3; g.strokeStyle = '#f5d36b'; g.stroke();
      g.fillStyle = '#f5d36b'; g.font = '800 30px ' + F_UI; g.fillText('§', w / 2, 106);
      g.fillStyle = '#1d2b30';
      g.font = '800 36px ' + F_UI;
      spaced(g, 'INFORMAȚII', w / 2, 184, 4);
      g.font = '800 30px ' + F_UI;
      spaced(g, 'PENTRU CONSUMATORI', w / 2, 224, 3);
      g.fillStyle = '#1f3f6e'; g.fillRect(70, 254, w - 140, 4);
      g.textAlign = 'left';
      var rows = [
        ['1.', 'Date de identificare vânzător'],
        ['2.', 'Termeni și condiții'],
        ['3.', 'Politica de confidențialitate'],
        ['4.', 'Dreptul de retur în 14 zile'],
        ['5.', 'ANPC · SAL · SOL']
      ];
      rows.forEach(function (r, i) {
        var y = 304 + i * 62;
        g.font = '800 28px ' + F_UI; g.fillStyle = '#1f3f6e'; g.fillText(r[0], 64, y);
        g.font = '600 28px ' + F_UI; g.fillStyle = '#1d2b30'; g.fillText(r[1], 104, y);
        g.fillStyle = 'rgba(29,43,48,.15)'; g.fillRect(64, y + 26, w - 128, 2);
      });
      g.textAlign = 'center';
      // two framed boxes in the style of the ANPC dispute-resolution notices
      [['ANPC', 'SAL'], ['UE', 'SOL']].forEach(function (b, i) {
        var bx = 70 + i * ((w - 140) / 2 + 10), bw = (w - 140) / 2 - 10, by = 628;
        g.lineWidth = 3; g.strokeStyle = '#1f3f6e'; g.strokeRect(bx, by, bw, 70);
        g.fillStyle = '#1f3f6e'; g.fillRect(bx, by, 70, 70);
        g.fillStyle = '#ffffff'; g.font = '800 22px ' + F_UI; g.fillText(b[0], bx + 35, by + 36);
        g.fillStyle = '#1f3f6e'; g.font = '800 30px ' + F_UI; g.fillText(b[1], bx + 70 + (bw - 70) / 2, by + 37);
      });
      g.fillStyle = '#e8735a';
      g.font = '800 24px ' + F_UI;
      g.fillText('ATINGE PENTRU A CITI', w / 2, 748);
      function tape(x, y, r) { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = 'rgba(235, 225, 190, .85)'; g.fillRect(-46, -14, 92, 28); g.restore(); }
      tape(52, 20, -0.5); tape(w - 52, 20, 0.5);
    });
  };

  /* Map pin with a label, used above every section in the overview */
  TX.pin = function (title, sub) {
    return make(640, 360, function (g, w, h) {
      g.font = '800 64px ' + F_DISPLAY;
      var tw = Math.max(g.measureText(title).width, sub ? (g.font = '600 38px ' + F_UI, g.measureText(sub).width) : 0);
      var bw = Math.min(w - 20, tw + 80), bh = sub ? 150 : 110, bx = (w - bw) / 2, by = 18;
      g.shadowColor = 'rgba(15,40,45,.28)';
      g.shadowBlur = 22;
      g.shadowOffsetY = 8;
      rr(g, bx, by, bw, bh, 34);
      g.fillStyle = C.white; g.fill();
      g.shadowColor = 'transparent';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.ink;
      g.font = '800 64px ' + F_DISPLAY;
      g.fillText(title, w / 2, by + (sub ? 56 : bh / 2 + 2));
      if (sub) { g.font = '600 38px ' + F_UI; g.fillStyle = '#5b6b70'; g.fillText(sub, w / 2, by + 112); }
      // pin
      var py = by + bh + 26;
      g.beginPath();
      g.moveTo(w / 2 - 34, py);
      g.quadraticCurveTo(w / 2 - 34, py - 30, w / 2, py - 30);
      g.quadraticCurveTo(w / 2 + 34, py - 30, w / 2 + 34, py);
      g.quadraticCurveTo(w / 2 + 30, py + 34, w / 2, py + 120);
      g.quadraticCurveTo(w / 2 - 30, py + 34, w / 2 - 34, py);
      g.closePath();
      g.fillStyle = C.teal; g.fill();
      g.beginPath(); g.arc(w / 2, py + 2, 13, 0, Math.PI * 2); g.fillStyle = C.white; g.fill();
    });
  };

  /* Header board printed on top of a shelf unit */
  TX.board = function (title, sub) {
    return make(1024, 200, function (g, w, h) {
      rr(g, 0, 0, w, h, 30);
      g.fillStyle = C.teal; g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.white;
      g.font = '800 92px ' + F_DISPLAY;
      spaced(g, title, w / 2, sub ? 82 : h / 2, 8);
      if (sub) { g.font = '600 46px ' + F_UI; g.fillStyle = 'rgba(247,246,243,.8)'; spaced(g, sub.toUpperCase(), w / 2, 156, 6); }
    });
  };

  TX.label = function (text, bg, fg) {
    return make(256, 112, function (g, w, h) {
      rr(g, 4, 4, w - 8, h - 8, 50);
      g.fillStyle = bg; g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = fg;
      g.font = '800 58px ' + F_DISPLAY;
      g.fillText(text, w / 2, h / 2 + 3);
    });
  };

  /* Hand-written price tag (card with a hole for the string) */
  TX.priceTag = function (price, size) {
    return make(300, 420, function (g, w, h) {
      g.beginPath();
      g.moveTo(60, 8); g.lineTo(w - 60, 8); g.lineTo(w - 8, 70); g.lineTo(w - 8, h - 14);
      g.quadraticCurveTo(w - 8, h - 8, w - 14, h - 8); g.lineTo(14, h - 8);
      g.quadraticCurveTo(8, h - 8, 8, h - 14); g.lineTo(8, 70); g.closePath();
      g.fillStyle = '#f3e7d3'; g.fill();
      g.lineWidth = 3; g.strokeStyle = 'rgba(120,90,50,.35)'; g.stroke();
      g.beginPath(); g.arc(w / 2, 50, 16, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
      g.beginPath(); g.arc(w / 2, 50, 21, 0, Math.PI * 2); g.lineWidth = 5; g.strokeStyle = '#c9b48a'; g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.ink;
      g.font = '700 150px ' + F_HAND;
      g.fillText(String(price), w / 2, 196);
      g.font = '700 72px ' + F_HAND;
      g.fillText('lei', w / 2, 296);
      if (size) {
        g.font = '700 46px ' + F_HAND;
        g.fillStyle = C.coral;
        g.fillText('mărimea ' + size, w / 2, 366);
      }
    });
  };

  TX.glow = function (color) {
    return make(256, 256, function (g, w, h) {
      var gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, color);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    });
  };

  TX.ring = function () {
    return make(256, 256, function (g, w, h) {
      g.strokeStyle = C.amber;
      g.lineWidth = 12;
      g.beginPath(); g.arc(w / 2, h / 2, 100, 0, Math.PI * 2); g.stroke();
    });
  };

  /* soft round shadow under people and stands */
  TX.blob = function () {
    return make(128, 128, function (g, w, h) {
      var gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, 'rgba(20,40,45,.35)');
      gr.addColorStop(1, 'rgba(20,40,45,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
  };

  TX.C = C;
  TX.canvas = canvas;
  TX.tex = tex;
  TX.rr = rr;
  TX.F = { display: F_DISPLAY, hand: F_HAND, ui: F_UI };
  window.TX = TX;
})();
