/* Garments (from real photos or clean placeholder shapes), hangers, price tags and
   the smooth mannequin-like silhouettes of the people on the site. Exposed as window.FIG. */
(function () {
  'use strict';

  var C = TX.C;
  var matCache = {};
  function mat(color, rough, extra) {
    var key = color + '|' + rough + '|' + JSON.stringify(extra || {});
    if (!matCache[key]) {
      var o = { color: color, roughness: rough == null ? 0.7 : rough, metalness: 0 };
      if (extra) for (var k in extra) o[k] = extra[k];
      matCache[key] = new THREE.MeshStandardMaterial(o);
    }
    return matCache[key];
  }

  /* ---------------- placeholder garment outlines (metres, y down) ---------------- */
  var SHAPES = {
    tshirt: { w: 0.6, top: 0, h: 0.68, path: function (p) {
      p.moveTo(-0.07, 0); p.lineTo(-0.17, 0.025); p.lineTo(-0.29, 0.11); p.lineTo(-0.24, 0.215);
      p.lineTo(-0.172, 0.175); p.lineTo(-0.182, 0.665); p.quadraticCurveTo(0, 0.68, 0.182, 0.665);
      p.lineTo(0.172, 0.175); p.lineTo(0.24, 0.215); p.lineTo(0.29, 0.11); p.lineTo(0.17, 0.025);
      p.lineTo(0.07, 0); p.quadraticCurveTo(0, 0.075, -0.07, 0);
    } },
    shirt: { w: 0.62, top: 0, h: 0.76, path: function (p) {
      p.moveTo(-0.065, 0); p.lineTo(-0.185, 0.03); p.lineTo(-0.27, 0.2); p.lineTo(-0.3, 0.63);
      p.lineTo(-0.235, 0.645); p.lineTo(-0.205, 0.27); p.lineTo(-0.185, 0.73);
      p.quadraticCurveTo(-0.09, 0.69, 0, 0.75); p.quadraticCurveTo(0.09, 0.69, 0.185, 0.73);
      p.lineTo(0.205, 0.27); p.lineTo(0.235, 0.645); p.lineTo(0.3, 0.63); p.lineTo(0.27, 0.2);
      p.lineTo(0.185, 0.03); p.lineTo(0.065, 0); p.quadraticCurveTo(0, 0.05, -0.065, 0);
    }, seams: [[[0, 0.05], [0, 0.72]]] },
    hoodie: { w: 0.66, top: -0.08, h: 0.8, path: function (p) {
      p.moveTo(-0.1, 0.01); p.quadraticCurveTo(-0.12, -0.08, 0, -0.08); p.quadraticCurveTo(0.12, -0.08, 0.1, 0.01);
      p.lineTo(0.2, 0.04); p.lineTo(0.29, 0.22); p.lineTo(0.32, 0.6); p.lineTo(0.245, 0.62); p.lineTo(0.215, 0.29);
      p.lineTo(0.205, 0.7); p.lineTo(-0.205, 0.7); p.lineTo(-0.215, 0.29); p.lineTo(-0.245, 0.62);
      p.lineTo(-0.32, 0.6); p.lineTo(-0.29, 0.22); p.lineTo(-0.2, 0.04); p.closePath();
    }, seams: [[[-0.13, 0.62], [-0.11, 0.44], [0.11, 0.44], [0.13, 0.62]]] },
    dress: { w: 0.6, top: 0, h: 0.98, path: function (p) {
      p.moveTo(-0.06, 0); p.lineTo(-0.12, 0.01); p.lineTo(-0.14, 0.2); p.lineTo(-0.12, 0.33);
      p.quadraticCurveTo(-0.22, 0.6, -0.29, 0.95); p.quadraticCurveTo(0, 0.99, 0.29, 0.95);
      p.quadraticCurveTo(0.22, 0.6, 0.12, 0.33); p.lineTo(0.14, 0.2); p.lineTo(0.12, 0.01);
      p.lineTo(0.06, 0); p.quadraticCurveTo(0, 0.09, -0.06, 0);
    }, seams: [[[-0.12, 0.33], [0.12, 0.33]]] },
    jeans: { w: 0.46, top: 0, h: 0.98, path: function (p) {
      p.moveTo(-0.18, 0); p.lineTo(0.18, 0); p.lineTo(0.21, 0.97); p.lineTo(0.035, 0.97);
      p.lineTo(0, 0.3); p.lineTo(-0.035, 0.97); p.lineTo(-0.21, 0.97); p.closePath();
    }, seams: [[[-0.18, 0.05], [0.18, 0.05]], [[0, 0.05], [0, 0.24]]] }
  };

  var PX = 360;   // texture pixels per metre for placeholder garments
  function shapeCanvas(kind) {
    var k = SHAPES[kind];
    var W = Math.round(k.w * PX), H = Math.round(k.h * PX);
    var c = TX.canvas(W, H), g = c.getContext('2d');
    function T(x, y) { return [(x + k.w / 2) * PX, (y - k.top) * PX]; }
    var adapter = {
      moveTo: function (x, y) { var q = T(x, y); g.moveTo(q[0], q[1]); },
      lineTo: function (x, y) { var q = T(x, y); g.lineTo(q[0], q[1]); },
      quadraticCurveTo: function (a, b, x, y) { var p = T(a, b), q = T(x, y); g.quadraticCurveTo(p[0], p[1], q[0], q[1]); },
      closePath: function () { g.closePath(); }
    };
    g.beginPath(); k.path(adapter); g.closePath();
    g.fillStyle = '#ffffff'; g.fill();
    g.save(); g.clip();
    var sh = g.createLinearGradient(0, 0, W, 0);
    sh.addColorStop(0, 'rgba(0,0,0,.07)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.07)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    (k.seams || []).forEach(function (s) {
      g.beginPath();
      s.forEach(function (pt, i) { var q = T(pt[0], pt[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
      g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,.16)'; g.stroke();
    });
    g.restore();
    return { canvas: c, width: k.w, topOffset: k.top };
  }

  /* ---------------- garment geometry from a silhouette ---------------- */
  function alphaSampler(src) {
    var sw = 160, sh = Math.round(src.height * sw / src.width);
    var c = TX.canvas(sw, sh), g = c.getContext('2d');
    g.drawImage(src, 0, 0, sw, sh);
    var d = g.getImageData(0, 0, sw, sh).data;
    return function (u, v) {
      var x = Math.round(u * (sw - 1)), y = Math.round(v * (sh - 1));
      if (x < 0 || y < 0 || x >= sw || y >= sh) return 0;
      return d[(y * sw + x) * 4 + 3] > 127 ? 1 : 0;
    };
  }

  /* front/back pillow mesh; puff fades to zero at the outline so the two sides meet */
  function pillowGeometry(frontCanvas, width, puff) {
    var aspect = frontCanvas.height / frontCanvas.width;
    var height = width * aspect;
    var inside = alphaSampler(frontCanvas);
    var nx = 30, ny = Math.round(30 * aspect);
    var verts = [], uvs = [], idx = [];
    var rad = 0.07 / width;   // sampling radius in u units (~7 cm): rounder, softer volume
    for (var side = 0; side < 2; side++) {
      for (var j = 0; j <= ny; j++) {
        for (var i = 0; i <= nx; i++) {
          var u = i / nx, v = j / ny;
          var acc = 0, n = 0;
          for (var a = 0; a < 14; a++) {
            var ang = (a / 14) * Math.PI * 2, cu = Math.cos(ang) * rad, cv = Math.sin(ang) * rad / aspect;
            acc += inside(u + cu, v + cv) + inside(u + cu * 0.5, v + cv * 0.5);
            n += 2;
          }
          var f = inside(u, v) ? acc / n : 0;
          var s = Math.max(0, Math.min(1, (f - 0.3) / 0.7));
          s = s * s * (3 - 2 * s);
          var x = -width / 2 + u * width, y = -v * height;
          // soft body volume + a gentle curve around the torso, like a garment on a mannequin-less hanger
          var dz = puff * s * (side ? -0.8 : 1) - x * x * BEND;
          verts.push(x, y, dz);
          uvs.push(side ? 1 - u : u, 1 - v);
        }
      }
    }
    var row = nx + 1, off = row * (ny + 1);
    var front = [], back = [];
    for (var jj = 0; jj < ny; jj++) {
      for (var ii = 0; ii < nx; ii++) {
        var a0 = jj * row + ii, b0 = a0 + 1, c0 = a0 + row, d0 = c0 + 1;
        front.push(a0, c0, b0, b0, c0, d0);
        back.push(off + a0, off + b0, off + c0, off + b0, off + d0, off + c0);
      }
    }
    idx = front.concat(back);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.addGroup(0, front.length, 0);
    geo.addGroup(front.length, back.length, 1);
    geo.computeVertexNormals();
    geo.userData = { width: width, height: height, shoulder: shoulderFit(inside, width, height) };
    return geo;
  }

  /* Where the hanger sits inside the garment: fit a smooth arc a + b·x² just under the shoulder
     line, and find how far the hanger can reach before it would poke out (straps, narrow tops). */
  var BEND = 0.2;
  function shoulderFit(inside, width, height) {
    function top(x) {
      var u = 0.5 + x / width;
      if (u < 0 || u > 1) return null;
      for (var j = 0; j <= 240; j++) { var v = j / 240; if (inside(u, v)) return -v * height; }
      return null;
    }
    var half = 0.2;
    for (var hx = 0.2; hx > 0.06; hx -= 0.005) {
      var l = top(-hx), r = top(hx);
      if (l !== null && r !== null && -Math.min(l, r) < 0.2) { half = hx; break; }
      half = hx;
    }
    var inner = Math.min(0.09, half * 0.5);
    var yi = (top(-inner) + top(inner)) / 2, yo = (top(-half) + top(half)) / 2;
    if (isNaN(yi) || isNaN(yo)) { yi = 0; yo = -0.04; }
    var b = (yo - yi) / (half * half - inner * inner);
    b = Math.max(-1.4, Math.min(-0.15, b));
    // run the bar at least 3.5 cm under the top edge everywhere along it, so it stays hidden in the garment
    var a = yi - b * inner * inner - 0.035;
    for (var sx = -half; sx <= half + 1e-6; sx += half / 12) {
      var tp = top(sx);
      if (tp !== null) a = Math.min(a, tp - b * sx * sx - 0.035);
    }
    // but the garment may not ride up over the hook (hoods): keep its top within ~5 cm of the bar,
    // and shorten the bar instead where it would then show
    var t0 = top(0);
    if (t0 !== null && a < t0 - 0.05) {
      a = t0 - 0.05;
      for (var hx2 = half; hx2 > 0.07; hx2 -= 0.005) {
        var ok = true;
        for (var k = -12; k <= 12; k++) { var px = hx2 * k / 12, tp2 = top(px); if (tp2 !== null && tp2 - (a + b * px * px) < 0.018) { ok = false; break; } }
        half = hx2;
        if (ok) break;
      }
    }
    return { a: a, b: b, half: Math.max(0.045, half - 0.025) };
  }

  var GEO = {};
  function placeholderAssets(kind) {
    if (GEO[kind]) return GEO[kind];
    var sc = shapeCanvas(kind);
    var map = TX.tex(sc.canvas);
    var geo = pillowGeometry(sc.canvas, sc.width, 0.035);
    geo.translate(0, -sc.topOffset, 0);
    geo.userData.shoulder.a -= sc.topOffset;
    GEO[kind] = { geo: geo, map: map, mats: {} };
    return GEO[kind];
  }

  /* real photos: fill the transparent background with the garment's own colour so edges never show a halo */
  function photoCanvas(img) {
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    var c = TX.canvas(w, h), g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    var small = TX.canvas(32, Math.round(32 * h / w)), sg = small.getContext('2d');
    sg.drawImage(img, 0, 0, small.width, small.height);
    var d = sg.getImageData(0, 0, small.width, small.height).data, r = 0, gg = 0, b = 0, n = 0;
    for (var i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
    var fill = TX.canvas(w, h), fg = fill.getContext('2d');
    fg.fillStyle = n ? 'rgb(' + (r / n | 0) + ',' + (gg / n | 0) + ',' + (b / n | 0) + ')' : '#222';
    fg.fillRect(0, 0, w, h);
    fg.drawImage(c, 0, 0);
    return { alpha: c, filled: fill };
  }
  function loadImage(src) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = src;
    });
  }
  var PHOTO = {};
  function photoAssets(product) {
    if (PHOTO[product.id]) return PHOTO[product.id];
    PHOTO[product.id] = Promise.all([loadImage(product.texture.front), product.texture.back ? loadImage(product.texture.back) : null]).then(function (ims) {
      var f = photoCanvas(ims[0]), b = ims[1] ? photoCanvas(ims[1]) : f;
      var geo = pillowGeometry(f.alpha, product.texture.width, 0.045);
      return { geo: geo, front: TX.tex(f.filled), back: TX.tex(b.filled), alpha: TX.tex(f.alpha) };
    });
    return PHOTO[product.id];
  }

  /* ---------------- cloth: the fabric moves like fabric ----------------
     Every garment gets its own material whose vertex shader bends the cloth: the top is held
     by the hanger, the hem trails behind when the hanger swings, and soft folds ripple across
     it (stronger while it moves). Normals are bent too, so the folds catch the light. */
  var CLOTH_HEAD = [
    'uniform float uTime; uniform float uVel; uniform float uH; uniform float uPhase; uniform float uFlutter;',
    'float clothT(vec3 p) { return clamp(-p.y / uH, 0.0, 1.0); }'
  ].join('\n');
  function clothMaterial(opts) {
    var u = {
      uTime: { value: 0 }, uVel: { value: 0 }, uH: { value: opts.height || 0.7 },
      uPhase: { value: Math.random() * 6.28 }, uFlutter: { value: 0 },
      silhouette: { value: opts.alpha || null }, mirror: { value: opts.mirror || 0 }
    };
    var m = new THREE.MeshStandardMaterial({
      map: opts.map, color: opts.color || '#ffffff', roughness: 0.9, alphaTest: 0.5,
      emissive: opts.photo ? '#ffffff' : '#000000', emissiveMap: opts.photo ? opts.map : null, emissiveIntensity: opts.photo ? 0.35 : 1
    });
    m.userData.u = u;
    m.onBeforeCompile = function (sh) {
      for (var k in u) sh.uniforms[k] = u[k];
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\n' + CLOTH_HEAD)
        .replace('#include <begin_vertex>', [
          '#include <begin_vertex>',
          // the shoulders stay on the hanger; lower down the fabric lags behind the swing (a smooth curve,
          // no ripples), billows back a touch while it moves, and settles with the slightest sway at rest
          '{ float tt = clothT(position); float w = tt * tt;',
          '  float lag = clamp(-uVel, -3.0, 3.0) * 0.035;',
          '  transformed.x += lag * w * uH;',
          '  transformed.z += (-min(abs(uVel), 3.0) * 0.012 + sin(uTime * 0.8 + uPhase) * 0.002) * w;',
          '  transformed.z += uFlutter * sin(tt * 2.4 + uTime * 5.0) * 0.035 * tt; }'
        ].join('\n'));
      if (opts.alpha) {
        sh.fragmentShader = 'uniform sampler2D silhouette;\nuniform float mirror;\n' + sh.fragmentShader.replace(
          '#include <alphatest_fragment>',
          'vec2 suv = vUv; if (mirror > 0.5) suv.x = 1.0 - suv.x;\n' +
          'if (texture2D(silhouette, suv).a < 0.5) discard;\n#include <alphatest_fragment>');
      }
    };
    m.customProgramCacheKey = function () { return 'cloth' + (opts.alpha ? '-photo' : '-plain'); };
    return m;
  }

  /* ---------------- hanger & price tag ---------------- */
  var HG = null;
  function hangerGeo() {
    if (HG) return HG;
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, -0.055, 0), new THREE.Vector3(-0.11, -0.012, 0), new THREE.Vector3(0, 0.004, 0),
      new THREE.Vector3(0.11, -0.012, 0), new THREE.Vector3(0.22, -0.055, 0)
    ]);
    HG = {
      bar: new THREE.TubeGeometry(curve, 28, 0.01, 10, false),
      hook: new THREE.TorusGeometry(0.03, 0.004, 8, 20, Math.PI * 1.35),
      neck: new THREE.CylinderGeometry(0.004, 0.004, 0.05, 8),
      cap: new THREE.SphereGeometry(0.01, 10, 8)
    };
    return HG;
  }
  /* Wooden hanger. With a shoulder fit, the bar follows the garment's shoulders and sits inside it
     (between the front and back of the cloth), so only the hook shows above the collar —
     and the whole hanger shows once the garment is taken off. */
  function hanger(fit) {
    var H = hangerGeo(), g = new THREE.Group();
    var wood = mat('#dcc6a6', 0.5), metal = mat('#c9ced4', 0.3, { metalness: 0.8 });
    var half = fit ? Math.min(0.21, fit.half) : 0.22, b = fit ? fit.b : -0.9;
    var pts = [];
    for (var i = 0; i <= 10; i++) {
      var x = -half + (2 * half * i) / 10;
      pts.push(new THREE.Vector3(x, 0.012 + b * x * x, -x * x * BEND));
    }
    var bar = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.008, 10, false), wood);
    g.add(bar);
    [-half, half].forEach(function (x) { var c = new THREE.Mesh(H.cap, wood); c.scale.setScalar(0.85); c.position.set(x, 0.012 + b * x * x, -x * x * BEND); g.add(c); });
    var hook = new THREE.Mesh(H.hook, metal); hook.position.y = 0.075; hook.rotation.z = -Math.PI * 0.18; g.add(hook);
    var neck = new THREE.Mesh(H.neck, metal); neck.position.y = 0.035; g.add(neck);
    g.traverse(function (n) { if (n.isMesh) n.castShadow = true; });
    return g;
  }

  var tagCache = {};
  function priceTag(price, size, scale) {
    var key = price + '|' + size;
    if (!tagCache[key]) {
      var t = TX.priceTag(price, size);
      tagCache[key] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, side: THREE.DoubleSide, transparent: true, alphaTest: 0.1 });
    }
    var pivot = new THREE.Group();
    var len = 0.11;
    var string = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, len, 4), mat('#b9a07a', 0.9));
    string.position.y = -len / 2;
    pivot.add(string);
    var s = scale || 1;
    var card = new THREE.Mesh(new THREE.PlaneGeometry(0.085 * s, 0.119 * s), tagCache[key]);
    card.position.y = -len - 0.119 * s / 2 + 0.012 * s;
    pivot.add(card);
    pivot.userData = { swing: 0, vel: 0, phase: Math.random() * 6 };
    return pivot;
  }

  /* Garment on its hanger. Origin = top of the hook (where it sits on the rail).
     body (swings on the rail)
       ├─ hangerObj (hanger, or clip hanger for trousers and skirts)
       └─ cloth (the garment mesh + price tag; can be lifted off the hanger)
     userData.ready resolves when built. */
  function garment(product, opts) {
    opts = opts || {};
    var root = new THREE.Group();
    var body = new THREE.Group();
    body.position.y = -0.1;
    root.add(body);
    var cloth = new THREE.Group();
    root.userData = { product: product, body: body, cloth: cloth, phase: Math.random() * 6, swing: 0, vel: 0, mats: [], flutter: 0 };
    var kind = product.kind || 'tshirt';
    var finish = function (geo, mats) {
      var m = new THREE.Mesh(geo, mats);
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData.garmentRoot = root;
      cloth.add(m);
      root.userData.mesh = m;
      root.userData.mats = mats;
      var fit = geo.userData.shoulder;
      var clipKind = kind === 'jeans' || kind === 'skirt';
      // hang the garment so its shoulders rest on the hanger bar (trousers and skirts: waistband in the clip)
      m.position.y = clipKind ? -0.002 : 0.012 - fit.a;
      var h;
      if (!clipKind) h = hanger(fit);
      else {
        h = hanger();
        h.children[0].visible = false; h.children[1].visible = false; h.children[2].visible = false;
        var clip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.022, 0.03), mat('#dcc6a6', 0.5));
        clip.position.y = 0.008;
        clip.castShadow = true;
        h.add(clip);
      }
      body.add(h);
      root.userData.hangerObj = h;
      // a full-size hanger to show once the garment is gone (the fitted one can be short, e.g. inside a hood)
      if (!clipKind) {
        var full = hanger({ a: 0, b: -0.9, half: 0.21 });
        full.visible = false;
        body.add(full);
        root.userData.fullHanger = full;
      }
      body.add(cloth);
      if (opts.tag !== false) {
        var tag = priceTag(product.price, product.size, opts.tagScale);
        var w = geo.userData.width, tx = Math.min(w * 0.28, fit.half * 0.85);
        var ty = clipKind ? -0.01 : 0.012 + fit.b * tx * tx - 0.03;
        tag.position.set(tx, ty, 0.055 - tx * tx * BEND);
        tag.rotation.z = 0.08;
        cloth.add(tag);
        root.userData.tag = tag;
      }
      return root;
    };
    if (product.real) {
      root.userData.ready = photoAssets(product).then(function (a) {
        var H = a.geo.userData.height;
        return finish(a.geo, [
          clothMaterial({ map: a.front, alpha: a.alpha, mirror: 0, photo: true, height: H }),
          clothMaterial({ map: a.back, alpha: a.alpha, mirror: 1, photo: true, height: H })
        ]);
      });
    } else {
      var A = placeholderAssets(kind);
      var H = A.geo.userData.height;
      var cm = clothMaterial({ map: A.map, color: product.color, height: H });
      finish(A.geo, [cm, cm]);
      root.userData.ready = Promise.resolve(root);
    }
    return root;
  }

  /* hide or show the garment, leaving the hanger (an empty hanger keeps swinging) */
  function setEmpty(root, empty) {
    var u = root.userData, c = u.cloth;
    if (c && c.parent === u.body) c.visible = !empty;
    if (u.fullHanger) { u.fullHanger.visible = !!empty; u.hangerObj.visible = !empty; }
  }
  function kick(root, v) { root.userData.vel += v; }

  /* swing the hanger on the rail (a damped pendulum) and let the fabric follow */
  function swing(root, dt, push, t, turn) {
    var u = root.userData;
    var breeze = Math.sin(t * 0.45 + u.phase * 2.1) * 0.45;   // a little air moving through the shop
    u.vel += (-u.swing * 38 - u.vel * 4.2 + (push || 0) + breeze) * dt;
    u.swing += u.vel * dt;
    var idle = Math.sin(t * 0.8 + u.phase) * 0.012;
    u.body.rotation.z = u.swing + idle;
    u.body.rotation.x = Math.sin(t * 0.6 + u.phase * 1.3) * 0.01 + Math.abs(u.swing) * 0.15;
    u.flutter = Math.max(0, (u.flutter || 0) - dt * 0.8);
    var v = u.vel * 0.9 + (turn || 0);
    for (var i = 0; i < u.mats.length; i++) {
      var U = u.mats[i].userData.u;
      if (!U) continue;
      U.uTime.value = t;
      U.uVel.value += (v - U.uVel.value) * Math.min(1, dt * 6);
      U.uFlutter.value = u.flutter;
    }
    if (u.tag) {
      var tg = u.tag.userData;
      tg.vel += (-tg.swing * 30 - tg.vel * 3.2 - u.vel * 0.9) * dt;
      tg.swing += tg.vel * dt;
      u.tag.rotation.z = 0.08 + tg.swing + Math.sin(t * 1.1 + tg.phase) * 0.04;
      u.tag.rotation.y = Math.sin(t * 0.7 + tg.phase) * 0.35;
    }
  }

  /* ---------------- people: smooth mannequins, no faces ---------------- */
  var BODY = null;
  function bodyGeo() {
    if (BODY) return BODY;
    function lathe(pts, seg) { return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 28); }
    BODY = {
      torso: lathe([[0.001, 0], [0.13, 0.01], [0.15, 0.12], [0.142, 0.26], [0.16, 0.42], [0.182, 0.55], [0.17, 0.62], [0.12, 0.67], [0.055, 0.69], [0.001, 0.69]]),
      leg: new THREE.CapsuleGeometry(0.062, 0.78, 8, 16),
      arm: new THREE.CapsuleGeometry(0.044, 0.56, 8, 14),
      head: new THREE.SphereGeometry(0.105, 28, 20),
      neck: new THREE.CylinderGeometry(0.042, 0.05, 0.1, 16)
    };
    return BODY;
  }
  var blobMat = null;
  function person(isMe) {
    var B = bodyGeo();
    var m = isMe ? mat(C.amber, 0.55) : mat('#dfe4e8', 0.6);
    var root = new THREE.Group(), body = new THREE.Group();
    root.add(body);
    function leg(x) {
      var hip = new THREE.Group(); hip.position.set(x, 0.86, 0); body.add(hip);
      var l = new THREE.Mesh(B.leg, m); l.position.y = -0.43; hip.add(l);
      return hip;
    }
    var hipL = leg(-0.075), hipR = leg(0.075);
    var torso = new THREE.Mesh(B.torso, m); torso.position.y = 0.82; torso.scale.z = 0.68; body.add(torso);
    function arm(x) {
      var sh = new THREE.Group(); sh.position.set(x, 1.44, 0); body.add(sh);
      var a = new THREE.Mesh(B.arm, m); a.position.y = -0.3; sh.add(a);
      sh.rotation.z = x < 0 ? 0.08 : -0.08;
      return sh;
    }
    var armL = arm(-0.2), armR = arm(0.2);
    var neck = new THREE.Mesh(B.neck, m); neck.position.y = 1.55; body.add(neck);
    var head = new THREE.Mesh(B.head, m); head.position.y = 1.7; head.scale.set(0.92, 1.1, 0.98); body.add(head);
    body.traverse(function (n) { if (n.isMesh) n.castShadow = true; });
    blobMat = blobMat || new THREE.MeshBasicMaterial({ map: TX.blob(), transparent: true, depthWrite: false });
    var blob = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), blobMat);
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.004;
    root.add(blob);
    if (isMe) {
      var lbl = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.label('Tu', C.amber, C.ink), depthTest: false, transparent: true }));
      lbl.scale.set(0.5, 0.22, 1);
      lbl.position.y = 2.15;
      lbl.renderOrder = 10;
      root.add(lbl);
      root.userData.label = lbl;
    }
    return { root: root, body: body, hipL: hipL, hipR: hipR, armL: armL, armR: armR, head: head };
  }

  function angleLerp(a, b, k) { var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * k; }

  /* A visitor's figure. setTarget({x,z,face}) and it walks there, avoiding round obstacles. */
  function Walker(p, obstacles) {
    this.p = p; this.obs = obstacles || [];
    this.target = null; this.state = 'idle'; this.phase = 0; this.t = Math.random() * 10;
    this.fade = 0;
  }
  Walker.prototype.place = function (s) {
    this.p.root.position.set(s.x, 0, s.z);
    this.p.root.rotation.y = s.face;
    this.target = s; this.state = 'idle';
  };
  Walker.prototype.setTarget = function (s) { this.target = s; this.state = 'walk'; };
  Walker.prototype.update = function (dt) {
    var r = this.p.root, s = this.target;
    this.t += dt;
    this.fade = Math.min(1, this.fade + dt * 1.5);
    r.scale.setScalar(0.85 + 0.15 * this.fade);
    if (!s) return;
    if (this.state === 'walk') {
      var dx = s.x - r.position.x, dz = s.z - r.position.z, dist = Math.hypot(dx, dz);
      if (dist < 0.05) { this.state = 'idle'; }
      else {
        var vx = dx / dist, vz = dz / dist;
        for (var i = 0; i < this.obs.length; i++) {
          var o = this.obs[i], ox = r.position.x - o.x, oz = r.position.z - o.z, od = Math.hypot(ox, oz) || 0.001, R = o.r + 0.3;
          if (od < R && dist > 0.3) {
            var k = (R - od) / R * 2.4, side = (ox * vz - oz * vx) >= 0 ? 1 : -1;
            vx += (ox / od) * k + (-oz / od) * side * k;
            vz += (oz / od) * k + (ox / od) * side * k;
          }
        }
        var vl = Math.hypot(vx, vz) || 1; vx /= vl; vz /= vl;
        var step = Math.min(dist, 0.75 * dt);
        r.position.x += vx * step; r.position.z += vz * step;
        r.rotation.y = angleLerp(r.rotation.y, Math.atan2(vx, vz), Math.min(1, dt * 6));
        this.phase += dt * 7.5;
      }
    } else {
      r.rotation.y = angleLerp(r.rotation.y, s.face, Math.min(1, dt * 3));
      this.phase *= (1 - Math.min(1, dt * 8));
    }
    var w = this.state === 'walk' ? 1 : 0, sn = Math.sin(this.phase);
    var p = this.p;
    p.hipL.rotation.x = -sn * 0.38 * w;
    p.hipR.rotation.x = sn * 0.38 * w;
    p.armL.rotation.x = sn * 0.3 * w;
    p.armR.rotation.x = -sn * 0.3 * w - (1 - w) * (0.55 + Math.sin(this.t * 1.7) * 0.08);
    p.body.position.y = Math.abs(Math.cos(this.phase)) * 0.02 * w;
    p.head.rotation.y = Math.sin(this.t * 0.5) * 0.3 * (1 - w);
    if (r.userData.label) r.userData.label.position.y = 2.15 + Math.sin(this.t * 2.2) * 0.04;
  };

  window.FIG = { mat: mat, garment: garment, swing: swing, setEmpty: setEmpty, kick: kick, priceTag: priceTag, hanger: hanger, person: person, Walker: Walker, photoAssets: photoAssets };
})();
