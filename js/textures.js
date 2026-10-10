/* Canvas-drawn textures: signs, stickers, posters, floors. Exposed as window.TX. */
(function () {
  'use strict';

  var F_DISPLAY = '"Bricolage Grotesque", "Arial Black", sans-serif';
  var F_HAND = '"Caveat", "Segoe Print", "Comic Sans MS", cursive';
  var F_UI = '"Manrope", system-ui, sans-serif';

  var C = {
    plum: '#1b1030',
    neon: '#ff3d7f',
    neonSoft: '#ffb3cf',
    mint: '#6ef2d0',
    sun: '#ffc531',
    paper: '#fbf7ef',
    cream: '#fff3e2'
  };

  function make(w, h, draw, opts) {
    opts = opts || {};
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var g = c.getContext('2d');
    draw(g, w, h);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    if (opts.repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(opts.repeat[0], opts.repeat[1]);
    }
    return t;
  }

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
    // centered text with manual letter spacing
    var total = 0, i, widths = [];
    for (i = 0; i < text.length; i++) { widths.push(g.measureText(text[i]).width); total += widths[i]; }
    total += spacing * (text.length - 1);
    var cx = x - total / 2;
    var prev = g.textAlign;
    g.textAlign = 'left';
    for (i = 0; i < text.length; i++) { g.fillText(text[i], cx, y); cx += widths[i] + spacing; }
    g.textAlign = prev;
  }

  function noise(g, w, h, alpha, n) {
    for (var i = 0; i < n; i++) {
      g.fillStyle = 'rgba(0,0,0,' + (Math.random() * alpha) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
  }

  function neonText(g, text, x, y, font, glow, core) {
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = glow;
    g.shadowBlur = 46;
    g.fillStyle = glow;
    g.fillText(text, x, y);
    g.shadowBlur = 22;
    g.fillText(text, x, y);
    g.shadowBlur = 8;
    g.fillStyle = core;
    g.fillText(text, x, y);
    g.shadowBlur = 0;
  }

  var TX = {};

  TX.openFront = function () {
    return make(640, 360, function (g, w, h) {
      rr(g, 14, 14, w - 28, h - 28, 46);
      g.fillStyle = C.plum;
      g.fill();
      g.lineWidth = 8;
      g.strokeStyle = '#3d2a66';
      g.stroke();
      neonText(g, 'OPEN', w / 2, h / 2 - 22, '800 172px ' + F_DISPLAY, C.neon, '#fff2f7');
      g.font = '700 34px ' + F_UI;
      g.fillStyle = C.mint;
      g.shadowColor = C.mint;
      g.shadowBlur = 14;
      g.textBaseline = 'middle';
      spaced(g, 'DESCHIS · NON-STOP', w / 2, h - 66, 5);
      g.shadowBlur = 0;
    });
  };

  TX.openBack = function () {
    return make(640, 360, function (g, w, h) {
      rr(g, 14, 14, w - 28, h - 28, 46);
      g.fillStyle = C.plum;
      g.fill();
      g.lineWidth = 8;
      g.strokeStyle = '#3d2a66';
      g.stroke();
      neonText(g, 'MEREU', w / 2, h / 2 - 66, '800 96px ' + F_DISPLAY, C.mint, '#effffa');
      neonText(g, 'DESCHIS', w / 2, h / 2 + 30, '800 96px ' + F_DISPLAY, C.mint, '#effffa');
      g.font = '700 34px ' + F_UI;
      g.fillStyle = C.sun;
      g.textBaseline = 'middle';
      spaced(g, '24 / 7 · ONLINE', w / 2, h - 58, 5);
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

  TX.schedule = function () {
    return make(560, 460, function (g, w, h) {
      rr(g, 6, 6, w - 12, h - 12, 34);
      g.fillStyle = 'rgba(27,16,48,.78)';
      g.fill();
      g.fillStyle = '#f6f2ff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.shadowColor = 'rgba(0,0,0,.35)';
      g.shadowBlur = 4;
      g.font = '800 54px ' + F_DISPLAY;
      spaced(g, 'PROGRAM', w / 2, 52, 10);
      g.fillRect(w / 2 - 150, 100, 300, 4);
      g.font = '700 40px ' + F_UI;
      spaced(g, 'LUNI – DUMINICĂ', w / 2, 160, 3);
      g.font = '800 84px ' + F_DISPLAY;
      g.fillText('00:00 – 24:00', w / 2, 256);
      g.fillStyle = C.mint;
      g.font = '700 36px ' + F_UI;
      spaced(g, 'NON-STOP · ONLINE', w / 2, 346, 4);
      g.fillStyle = '#f6f2ff';
      g.font = '700 40px ' + F_HAND;
      g.fillText('intră oricând, te așteptăm', w / 2, 414);
    });
  };

  TX.skipSticker = function () {
    return make(512, 512, function (g, w, h) {
      var cx = w / 2, cy = h / 2;
      g.save();
      g.translate(cx, cy);
      g.rotate(-0.12);
      g.beginPath();
      g.arc(0, 0, 240, 0, Math.PI * 2);
      g.fillStyle = '#ffffff';
      g.fill();
      g.beginPath();
      g.arc(0, 0, 226, 0, Math.PI * 2);
      g.fillStyle = C.neon;
      g.fill();
      g.beginPath();
      g.arc(0, 0, 196, 0, Math.PI * 2);
      g.setLineDash([14, 12]);
      g.lineWidth = 5;
      g.strokeStyle = 'rgba(255,255,255,.75)';
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = '#ffffff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 86px ' + F_DISPLAY;
      g.fillText('SARI', 0, -96);
      g.fillText('PESTE', 0, -12);
      g.fillStyle = C.sun;
      g.fillText('INTRO', 0, 72);
      // arrow
      g.strokeStyle = '#ffffff';
      g.lineWidth = 12;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(-46, 148); g.lineTo(40, 148);
      g.moveTo(16, 124); g.lineTo(42, 148); g.lineTo(16, 172);
      g.stroke();
      // sheen
      var gr = g.createLinearGradient(-200, -200, 120, 120);
      gr.addColorStop(0, 'rgba(255,255,255,.35)');
      gr.addColorStop(0.4, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(0, 0, 226, 0, Math.PI * 2);
      g.fill();
      g.restore();
    });
  };

  TX.legalPoster = function () {
    return make(440, 620, function (g, w, h) {
      g.fillStyle = C.paper;
      g.fillRect(10, 18, w - 20, h - 28);
      noise(g, w, h, 0.05, 2500);
      g.fillStyle = C.plum;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 50px ' + F_DISPLAY;
      g.fillText('INFO LEGALE', w / 2, 92);
      g.fillStyle = C.neon;
      g.fillRect(w / 2 - 120, 128, 240, 6);
      g.fillStyle = '#2a2140';
      g.textAlign = 'left';
      g.font = '700 42px ' + F_HAND;
      var lines = ['Termeni și condiții', 'Confidențialitate', 'Retur în 14 zile', 'ANPC · SAL'];
      lines.forEach(function (t, i) {
        var y = 200 + i * 78;
        g.beginPath();
        g.arc(50, y, 8, 0, Math.PI * 2);
        g.fillStyle = C.neon;
        g.fill();
        g.fillStyle = '#2a2140';
        g.fillText(t, 72, y + 2);
      });
      g.textAlign = 'center';
      g.font = '700 26px ' + F_UI;
      g.fillStyle = '#7a6f8f';
      g.fillText('atinge pentru detalii', w / 2, h - 48);
      // tape strips
      function tape(x, y, r) {
        g.save();
        g.translate(x, y);
        g.rotate(r);
        g.fillStyle = 'rgba(255, 214, 102, .8)';
        g.fillRect(-48, -16, 96, 32);
        g.restore();
      }
      tape(70, 22, -0.35);
      tape(w - 70, 22, 0.32);
    });
  };

  TX.shopSign = function () {
    return make(1024, 256, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#fffaf1');
      gr.addColorStop(1, '#ffe7c9');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      g.fillStyle = C.plum;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 150px ' + F_DISPLAY;
      spaced(g, 'UMERAȘ', w / 2 - 70, 112, 14);
      // little hanger mark
      g.strokeStyle = C.neon;
      g.lineWidth = 12;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      var hx = w / 2 + 330, hy = 112;
      g.arc(hx, hy - 52, 16, Math.PI, Math.PI * 2.5);
      g.lineTo(hx, hy - 26);
      g.lineTo(hx + 70, hy + 34);
      g.lineTo(hx - 70, hy + 34);
      g.lineTo(hx, hy - 26);
      g.stroke();
      g.font = '700 38px ' + F_HAND;
      g.fillStyle = '#c2185b';
      g.fillText('second-hand · haine cu poveste', w / 2, 212);
    });
  };

  TX.doormat = function () {
    return make(512, 280, function (g, w, h) {
      rr(g, 0, 0, w, h, 26);
      g.fillStyle = '#3a2a1f';
      g.fill();
      rr(g, 18, 18, w - 36, h - 36, 16);
      g.fillStyle = '#7a5434';
      g.fill();
      for (var i = 0; i < 9000; i++) {
        g.fillStyle = Math.random() < 0.5 ? 'rgba(60,35,20,.35)' : 'rgba(170,120,70,.3)';
        g.fillRect(18 + Math.random() * (w - 36), 18 + Math.random() * (h - 36), 1.5, 3);
      }
      g.fillStyle = '#f3d9a8';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 70px ' + F_DISPLAY;
      spaced(g, 'BUN VENIT', w / 2, h / 2, 8);
    });
  };

  TX.wood = function () {
    return make(512, 512, function (g, w, h) {
      var cols = ['#c98f5a', '#d39a63', '#bd8350', '#cf9560', '#c48a55'];
      var pw = 64;
      for (var x = 0; x < w; x += pw) {
        var offset = Math.random() * h;
        for (var y = -h; y < h * 2; y += 256) {
          g.fillStyle = cols[Math.floor(Math.random() * cols.length)];
          g.fillRect(x, y + offset, pw, 256);
          g.fillStyle = 'rgba(80,45,20,.35)';
          g.fillRect(x, y + offset, pw, 2);
        }
        g.fillStyle = 'rgba(80,45,20,.4)';
        g.fillRect(x, 0, 2, h);
        for (var k = 0; k < 14; k++) {
          g.strokeStyle = 'rgba(120,70,30,' + (0.05 + Math.random() * 0.1) + ')';
          g.lineWidth = 1;
          g.beginPath();
          var sx = x + 6 + Math.random() * (pw - 12);
          g.moveTo(sx, 0);
          g.bezierCurveTo(sx + 6, h * 0.3, sx - 6, h * 0.6, sx + 3, h);
          g.stroke();
        }
      }
    }, { repeat: [5, 7] });
  };

  TX.pavement = function () {
    return make(512, 512, function (g, w, h) {
      g.fillStyle = '#20284a';
      g.fillRect(0, 0, w, h);
      var s = 128;
      for (var y = 0; y < h; y += s) {
        for (var x = 0; x < w; x += s) {
          var l = 34 + Math.random() * 8;
          g.fillStyle = 'hsl(228, 24%, ' + l + '%)';
          g.fillRect(x + 3, y + 3, s - 6, s - 6);
        }
      }
      noise(g, w, h, 0.18, 6000);
    }, { repeat: [10, 4] });
  };

  TX.awning = function () {
    return make(256, 64, function (g, w, h) {
      for (var i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? '#fff1e0' : '#ff5a5f';
        g.fillRect(i * 32, 0, 32, h);
      }
    }, { repeat: [3, 1] });
  };

  TX.banner = function (title, sub, bg, fg) {
    return make(1024, 220, function (g, w, h) {
      rr(g, 0, 0, w, h, 24);
      g.fillStyle = bg;
      g.fill();
      g.fillStyle = fg;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 104px ' + F_DISPLAY;
      spaced(g, title, w / 2, sub ? 92 : h / 2, 6);
      if (sub) {
        g.font = '700 52px ' + F_HAND;
        g.fillText(sub, w / 2, 172);
      }
    });
  };

  TX.foldedStack = function () {
    return make(128, 128, function (g, w, h) {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 16) {
        g.fillStyle = 'rgba(0,0,0,.22)';
        g.fillRect(0, y, w, 2);
        g.fillStyle = 'rgba(255,255,255,.5)';
        g.fillRect(0, y + 2, w, 2);
      }
    });
  };

  TX.ring = function () {
    return make(256, 256, function (g, w, h) {
      g.strokeStyle = '#ffc531';
      g.lineWidth = 10;
      g.shadowColor = '#ffc531';
      g.shadowBlur = 18;
      g.beginPath();
      g.arc(w / 2, h / 2, 96, 0, Math.PI * 2);
      g.stroke();
    });
  };

  TX.streak = function () {
    return make(128, 512, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, w, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(0.5, 'rgba(255,255,255,.55)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    });
  };

  TX.C = C;
  window.TX = TX;
})();
