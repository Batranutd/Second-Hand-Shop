/* Canvas-drawn textures: brick, wood, signs, stickers, posters, boards. Exposed as window.TX. */
(function () {
  'use strict';

  var F_DISPLAY = '"Bricolage Grotesque", "Arial Black", sans-serif';
  var F_HAND = '"Caveat", "Segoe Print", "Comic Sans MS", cursive';
  var F_UI = '"Manrope", system-ui, sans-serif';

  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c, o) {
    o = o || {};
    var t = new THREE.CanvasTexture(c);
    if (!o.linear) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    if (o.repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(o.repeat[0], o.repeat[1]);
    }
    return t;
  }
  function make(w, h, draw, o) { var c = canvas(w, h); draw(c.getContext('2d'), w, h); return tex(c, o); }

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
  function noise(g, w, h, alpha, n, light) {
    for (var i = 0; i < n; i++) {
      g.fillStyle = (light && Math.random() < 0.5 ? 'rgba(255,255,255,' : 'rgba(0,0,0,') + (Math.random() * alpha) + ')';
      g.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
    }
  }
  function grain(g, x, y, w, h, color, n) {
    g.save();
    g.beginPath(); g.rect(x, y, w, h); g.clip();
    for (var k = 0; k < n; k++) {
      g.strokeStyle = color.replace('A', (0.04 + Math.random() * 0.1).toFixed(3));
      g.lineWidth = 0.6 + Math.random() * 1.6;
      g.beginPath();
      var sy = y + Math.random() * h, amp = 2 + Math.random() * 6, ph = Math.random() * 6;
      g.moveTo(x, sy);
      for (var s = 0; s <= 12; s++) {
        var px = x + (w * s) / 12;
        g.lineTo(px, sy + Math.sin(ph + s * 0.7) * amp);
      }
      g.stroke();
    }
    g.restore();
  }

  var TX = {};

  /* Brick wall around the door: colour map + bump map */
  TX.brick = function () {
    var w = 1024, h = 1024, c = canvas(w, h), b = canvas(w, h);
    var g = c.getContext('2d'), gb = b.getContext('2d');
    g.fillStyle = '#5a463b';
    g.fillRect(0, 0, w, h);
    gb.fillStyle = '#1e1e1e';
    gb.fillRect(0, 0, w, h);
    var bw = 256, bh = 64, m = 9;
    var cols = ['#94442f', '#a04c33', '#86392a', '#ab5a3c', '#8f4834', '#9b553c', '#7b372a', '#b2623f'];
    for (var row = 0; row < h / bh; row++) {
      var off = row % 2 ? bw / 2 : 0;
      for (var x = -bw; x < w + bw; x += bw) {
        var bx = x + off + m / 2, by = row * bh + m / 2, ww = bw - m, hh = bh - m;
        g.fillStyle = cols[(Math.random() * cols.length) | 0];
        rr(g, bx, by, ww, hh, 7);
        g.fill();
        var gr = g.createLinearGradient(0, by, 0, by + hh);
        gr.addColorStop(0, 'rgba(255,214,170,.16)');
        gr.addColorStop(0.5, 'rgba(0,0,0,0)');
        gr.addColorStop(1, 'rgba(30,10,0,.22)');
        g.fillStyle = gr;
        rr(g, bx, by, ww, hh, 7);
        g.fill();
        for (var k = 0; k < 70; k++) {
          g.fillStyle = Math.random() < 0.5 ? 'rgba(40,15,5,.25)' : 'rgba(255,200,160,.12)';
          g.fillRect(bx + Math.random() * ww, by + Math.random() * hh, 2 + Math.random() * 3, 2);
        }
        var v = 170 + Math.random() * 50;
        gb.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
        rr(gb, bx, by, ww, hh, 9);
        gb.fill();
      }
    }
    noise(g, w, h, 0.12, 9000, true);
    noise(gb, w, h, 0.25, 9000, true);
    return { map: tex(c, { repeat: [1, 1] }), bump: tex(b, { repeat: [1, 1], linear: true }) };
  };

  /* Oak plank floor */
  TX.floor = function () {
    return make(1024, 1024, function (g, w, h) {
      var cols = ['#b77a45', '#c4864f', '#a96e3d', '#bf8250', '#b27646', '#c98e58'];
      var pw = 128;
      for (var x = 0; x < w; x += pw) {
        var offset = Math.random() * h;
        for (var y = -h; y < h * 2; y += 512) {
          var py = y + offset;
          g.fillStyle = cols[(Math.random() * cols.length) | 0];
          g.fillRect(x, py, pw, 512);
          grain(g, x, py, pw, 512, 'rgba(90,45,15,A)', 26);
          g.fillStyle = 'rgba(60,30,10,.55)';
          g.fillRect(x, py, pw, 3);
        }
        g.fillStyle = 'rgba(55,28,10,.6)';
        g.fillRect(x, 0, 3, h);
        g.fillStyle = 'rgba(255,220,180,.08)';
        g.fillRect(x + 3, 0, 2, h);
      }
      noise(g, w, h, 0.08, 8000, true);
    }, { repeat: [3, 10] });
  };

  /* Generic wood grain, tinted by the material colour */
  TX.wood = function (repeat, base, n) {
    return make(512, 512, function (g, w, h) {
      g.fillStyle = base || '#e8d2b8';
      g.fillRect(0, 0, w, h);
      grain(g, 0, 0, w, h, 'rgba(110,60,25,A)', n || 120);
      noise(g, w, h, 0.06, 4000);
    }, { repeat: repeat || [1, 1] });
  };

  /* Painted plaster */
  TX.plaster = function (repeat) {
    return make(512, 512, function (g, w, h) {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, w, h);
      for (var i = 0; i < 260; i++) {
        var x = Math.random() * w, y = Math.random() * h, r = 10 + Math.random() * 40;
        var gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(0,0,0,' + (Math.random() * 0.035) + ')');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      noise(g, w, h, 0.05, 6000, true);
    }, { repeat: repeat || [2, 2] });
  };

  /* Gold-leaf shop name painted on the door glass */
  TX.goldName = function () {
    return make(1024, 340, function (g, w, h) {
      var gold = g.createLinearGradient(0, 40, 0, 230);
      gold.addColorStop(0, '#fff3c4');
      gold.addColorStop(0.42, '#efc356');
      gold.addColorStop(0.55, '#a8721c');
      gold.addColorStop(1, '#f6d77c');
      var text = 'UMERAȘ', R = 980, cx = w / 2, cy = 1150;
      g.font = '800 156px ' + F_DISPLAY;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      var widths = [], total = 0, sp = 16, i;
      for (i = 0; i < text.length; i++) { widths.push(g.measureText(text[i]).width); total += widths[i] + (i ? sp : 0); }
      function each(fn) {
        var acc = 0;
        for (var j = 0; j < text.length; j++) {
          var a = (-total / 2 + acc + widths[j] / 2) / R;
          g.save();
          g.translate(cx + R * Math.sin(a), cy - R * Math.cos(a));
          g.rotate(a);
          fn(text[j]);
          g.restore();
          acc += widths[j] + sp;
        }
      }
      // shadow / outline / fill / highlight, like real sign-painter gilding
      each(function (ch) { g.fillStyle = 'rgba(20,10,0,.45)'; g.fillText(ch, 6, 8); });
      each(function (ch) { g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#3b230a'; g.strokeText(ch, 0, 0); });
      each(function (ch) { g.fillStyle = gold; g.fillText(ch, 0, 0); });
      each(function (ch) { g.lineWidth = 2; g.strokeStyle = 'rgba(255,250,220,.7)'; g.strokeText(ch, -2, -2); });
      g.font = '700 58px ' + F_HAND;
      g.fillStyle = '#3b230a';
      g.fillText('second-hand · haine cu poveste', cx + 3, 300 + 3);
      g.fillStyle = '#f0c75e';
      g.fillText('second-hand · haine cu poveste', cx, 300);
    });
  };

  /* Painted wooden OPEN sign, both faces */
  function boardBase(g, w, h, base) {
    rr(g, 8, 8, w - 16, h - 16, 34);
    g.fillStyle = base;
    g.fill();
    g.save();
    rr(g, 8, 8, w - 16, h - 16, 34);
    g.clip();
    grain(g, 0, 0, w, h, 'rgba(120,70,30,A)', 60);
    noise(g, w, h, 0.07, 3000);
    g.restore();
    rr(g, 26, 26, w - 52, h - 52, 22);
    g.lineWidth = 6;
    g.strokeStyle = 'rgba(160,40,30,.85)';
    g.stroke();
  }
  TX.openFront = function () {
    return make(640, 320, function (g, w, h) {
      boardBase(g, w, h, '#f3e4c6');
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 150px ' + F_DISPLAY;
      g.fillStyle = 'rgba(80,10,5,.35)';
      g.fillText('OPEN', w / 2 + 4, h / 2 - 22 + 5);
      g.fillStyle = '#c4362a';
      g.fillText('OPEN', w / 2, h / 2 - 22);
      g.font = '700 50px ' + F_HAND;
      g.fillStyle = '#23394d';
      g.fillText('deschis non-stop', w / 2, h - 62);
    });
  };
  TX.openBack = function () {
    return make(640, 320, function (g, w, h) {
      boardBase(g, w, h, '#f3e4c6');
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 86px ' + F_DISPLAY;
      g.fillStyle = '#1e6b70';
      g.fillText('MEREU', w / 2, 104);
      g.fillText('DESCHIS', w / 2, 188);
      g.font = '700 46px ' + F_HAND;
      g.fillStyle = '#c4362a';
      g.fillText('24 / 7 · online', w / 2, h - 52);
    });
  };

  /* Engraved brass plaque with the opening hours */
  TX.plaque = function () {
    return make(640, 280, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#b8872e');
      gr.addColorStop(0.35, '#f1d48a');
      gr.addColorStop(0.6, '#c99a3e');
      gr.addColorStop(1, '#e7c66f');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      for (var i = 0; i < 400; i++) {
        g.strokeStyle = 'rgba(255,255,255,' + (Math.random() * 0.08) + ')';
        g.beginPath();
        var y = Math.random() * h;
        g.moveTo(0, y); g.lineTo(w, y + (Math.random() - 0.5) * 4);
        g.stroke();
      }
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      function engrave(t, y, font, sp) {
        g.font = font;
        g.fillStyle = 'rgba(255,245,210,.6)';
        sp ? spaced(g, t, w / 2 + 2, y + 2, sp) : g.fillText(t, w / 2 + 2, y + 2);
        g.fillStyle = '#4b3310';
        sp ? spaced(g, t, w / 2, y, sp) : g.fillText(t, w / 2, y);
      }
      engrave('PROGRAM', 58, '700 40px ' + F_UI, 12);
      engrave('NON-STOP · 00:00 – 24:00', 132, '800 50px ' + F_DISPLAY);
      engrave('magazin online, mereu deschis', 206, '700 44px ' + F_HAND);
      [[26, 26], [w - 26, 26], [26, h - 26], [w - 26, h - 26]].forEach(function (p) {
        g.beginPath(); g.arc(p[0], p[1], 9, 0, Math.PI * 2);
        g.fillStyle = '#6b4a15'; g.fill();
        g.beginPath(); g.moveTo(p[0] - 6, p[1]); g.lineTo(p[0] + 6, p[1]);
        g.strokeStyle = '#f4dc9a'; g.lineWidth = 2; g.stroke();
      });
    });
  };

  TX.skipSticker = function () {
    return make(512, 512, function (g, w, h) {
      g.save();
      g.translate(w / 2, h / 2);
      g.rotate(-0.12);
      g.beginPath(); g.arc(0, 0, 240, 0, Math.PI * 2); g.fillStyle = '#fff8ec'; g.fill();
      g.beginPath(); g.arc(0, 0, 224, 0, Math.PI * 2); g.fillStyle = '#e8553e'; g.fill();
      g.beginPath(); g.arc(0, 0, 196, 0, Math.PI * 2);
      g.setLineDash([14, 12]); g.lineWidth = 5; g.strokeStyle = 'rgba(255,248,236,.8)'; g.stroke(); g.setLineDash([]);
      g.fillStyle = '#fff8ec';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 86px ' + F_DISPLAY;
      g.fillText('SARI', 0, -96);
      g.fillText('PESTE', 0, -12);
      g.fillStyle = '#ffd36a';
      g.fillText('INTRO', 0, 72);
      g.strokeStyle = '#fff8ec'; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(-46, 148); g.lineTo(40, 148);
      g.moveTo(16, 124); g.lineTo(42, 148); g.lineTo(16, 172);
      g.stroke();
      var gr = g.createLinearGradient(-200, -200, 120, 120);
      gr.addColorStop(0, 'rgba(255,255,255,.35)');
      gr.addColorStop(0.4, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.beginPath(); g.arc(0, 0, 224, 0, Math.PI * 2); g.fill();
      g.restore();
    });
  };

  TX.legalPoster = function () {
    return make(440, 620, function (g, w, h) {
      g.fillStyle = '#fbf7ef';
      g.fillRect(10, 18, w - 20, h - 28);
      noise(g, w, h, 0.05, 2500);
      g.fillStyle = '#1b1030';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 50px ' + F_DISPLAY;
      g.fillText('INFO LEGALE', w / 2, 92);
      g.fillStyle = '#c4362a';
      g.fillRect(w / 2 - 120, 128, 240, 6);
      g.textAlign = 'left';
      g.font = '700 42px ' + F_HAND;
      ['Termeni și condiții', 'Confidențialitate', 'Retur în 14 zile', 'ANPC · SAL'].forEach(function (t, i) {
        var y = 200 + i * 78;
        g.beginPath(); g.arc(50, y, 8, 0, Math.PI * 2); g.fillStyle = '#c4362a'; g.fill();
        g.fillStyle = '#2a2140';
        g.fillText(t, 72, y + 2);
      });
      g.textAlign = 'center';
      g.font = '700 26px ' + F_UI;
      g.fillStyle = '#7a6f8f';
      g.fillText('atinge pentru detalii', w / 2, h - 48);
      function tape(x, y, r) {
        g.save(); g.translate(x, y); g.rotate(r);
        g.fillStyle = 'rgba(255, 224, 140, .8)'; g.fillRect(-48, -16, 96, 32);
        g.restore();
      }
      tape(70, 22, -0.35);
      tape(w - 70, 22, 0.32);
    });
  };

  /* Header board on top of each shelf unit */
  TX.board = function (title, sub, bg, fg) {
    return make(1024, 224, function (g, w, h) {
      rr(g, 0, 0, w, h, 26);
      g.fillStyle = bg;
      g.fill();
      g.save();
      rr(g, 0, 0, w, h, 26);
      g.clip();
      grain(g, 0, 0, w, h, 'rgba(0,0,0,A)', 70);
      var sh = g.createLinearGradient(0, 0, 0, h);
      sh.addColorStop(0, 'rgba(255,255,255,.14)');
      sh.addColorStop(1, 'rgba(0,0,0,.18)');
      g.fillStyle = sh;
      g.fillRect(0, 0, w, h);
      g.restore();
      rr(g, 16, 16, w - 32, h - 32, 16);
      g.lineWidth = 4;
      g.strokeStyle = 'rgba(255,240,215,.55)';
      g.stroke();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 96px ' + F_DISPLAY;
      g.fillStyle = 'rgba(0,0,0,.25)';
      spaced(g, title, w / 2 + 3, (sub ? 92 : h / 2) + 4, 6);
      g.fillStyle = fg;
      spaced(g, title, w / 2, sub ? 92 : h / 2, 6);
      if (sub) {
        g.font = '700 56px ' + F_HAND;
        g.fillText(sub, w / 2, 172);
      }
    });
  };

  TX.casaSign = function () {
    return make(1024, 260, function (g, w, h) {
      rr(g, 0, 0, w, h, 30);
      g.fillStyle = '#1e6b70';
      g.fill();
      g.save(); rr(g, 0, 0, w, h, 30); g.clip();
      grain(g, 0, 0, w, h, 'rgba(0,0,0,A)', 60);
      g.restore();
      rr(g, 18, 18, w - 36, h - 36, 18);
      g.lineWidth = 6;
      g.strokeStyle = '#e2b955';
      g.stroke();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 96px ' + F_DISPLAY;
      g.fillStyle = '#fff3dc';
      spaced(g, 'CASA DE MARCAT', w / 2, 108, 6);
      g.font = '700 54px ' + F_HAND;
      g.fillStyle = '#f0c75e';
      g.fillText('aici plătești și pleci cu ele acasă', w / 2, 196);
    });
  };

  TX.topper = function (title, bg, fg) {
    return make(512, 512, function (g, w, h) {
      g.beginPath(); g.arc(w / 2, h / 2, 244, 0, Math.PI * 2); g.fillStyle = '#e2b955'; g.fill();
      g.beginPath(); g.arc(w / 2, h / 2, 228, 0, Math.PI * 2); g.fillStyle = bg; g.fill();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = fg;
      g.font = '800 ' + (title.length > 7 ? 74 : 90) + 'px ' + F_DISPLAY;
      g.fillText(title, w / 2, h / 2 - 10);
      g.font = '700 50px ' + F_HAND;
      g.fillText('stand', w / 2, h / 2 + 76);
    });
  };

  TX.registerDisplay = function () {
    return make(256, 96, function (g, w, h) {
      g.fillStyle = '#0b1d16';
      g.fillRect(0, 0, w, h);
      g.font = '700 56px ' + F_UI;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.shadowColor = '#5dffa6';
      g.shadowBlur = 16;
      g.fillStyle = '#9dffc8';
      g.fillText('0,00 LEI', w / 2, h / 2 + 2);
    });
  };

  TX.foldedStack = function () {
    return make(256, 256, function (g, w, h) {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 32) {
        var gr = g.createLinearGradient(0, y, 0, y + 32);
        gr.addColorStop(0, 'rgba(255,255,255,.4)');
        gr.addColorStop(0.75, 'rgba(0,0,0,0)');
        gr.addColorStop(1, 'rgba(0,0,0,.35)');
        g.fillStyle = gr;
        g.fillRect(0, y, w, 32);
        g.fillStyle = 'rgba(0,0,0,.25)';
        g.fillRect(0, y + 30, w, 2);
      }
      noise(g, w, h, 0.08, 3000, true);
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
      g.strokeStyle = '#ffd36a';
      g.lineWidth = 10;
      g.shadowColor = '#ffd36a';
      g.shadowBlur = 18;
      g.beginPath(); g.arc(w / 2, h / 2, 96, 0, Math.PI * 2); g.stroke();
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

  TX.canvas = canvas;
  TX.tex = tex;
  TX.noise = noise;
  window.TX = TX;
})();
