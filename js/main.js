/* UMERAȘ storefront: the door scene (step 1). */
(function () {
  'use strict';

  var P = window.PARTS, TX = window.TX;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  var canvas = $('scene'), loader = $('loader'), hintEl = $('hint');
  var legalEl = $('legal'), insideEl = $('inside');

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    loader.hidden = true;
    $('nowebgl').hidden = false;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d1430');

  var camera = new THREE.PerspectiveCamera(40, 1, 0.05, 80);
  var LOOK = new THREE.Vector3(0, 1.42, 0);
  var camHome = new THREE.Vector3(0, 1.48, 6);
  var camLook = LOOK.clone();

  var clickables = [];
  var animated = [];      // functions(t, dt)
  var walkers = [];
  var door = {};          // references for the door rig

  /* ---------------- helpers ---------------- */
  function std(color, o) {
    o = o || {};
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: o.rough != null ? o.rough : 0.6,
      metalness: o.metal || 0,
      emissive: o.emissive || '#000000',
      emissiveIntensity: o.ei != null ? o.ei : 1,
      map: o.map || null,
      emissiveMap: o.emissiveMap || null,
      transparent: !!o.transparent,
      opacity: o.opacity != null ? o.opacity : 1,
      side: o.side || THREE.FrontSide
    });
  }
  function box(w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); }
  function plane(w, h, m) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); }
  function at(o, x, y, z) { o.position.set(x, y, z); return o; }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  /* ---------------- environment + lights ---------------- */
  function buildEnv() {
    var pm = new THREE.PMREMGenerator(renderer);
    var env = new THREE.Scene();
    env.background = new THREE.Color('#0f1538');
    var g = new THREE.BoxGeometry(1, 1, 1);
    function lamp(col, k, pos, sc) {
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k) }));
      m.position.fromArray(pos);
      m.scale.fromArray(sc);
      env.add(m);
    }
    lamp('#ffd9a8', 1.8, [0, 2, -6], [9, 3, 0.1]);
    lamp('#9fb4ff', 0.9, [-6, 4, 4], [0.1, 4, 7]);
    lamp('#ff7ab0', 0.9, [6, 1.5, 3], [0.1, 2, 4]);
    lamp('#ffffff', 1.2, [0, 8, 0], [6, 0.1, 6]);
    scene.environment = pm.fromScene(env, 0.04).texture;
    pm.dispose();
  }

  function buildLights() {
    scene.add(new THREE.HemisphereLight('#7083d8', '#1a1426', 0.38));
    var moon = new THREE.DirectionalLight('#aab9ff', 0.55);
    moon.position.set(-4, 7, 7);
    scene.add(moon);
    var porch = new THREE.PointLight('#ffcf8f', 1.0, 6, 2);
    porch.position.set(0, 2.7, 0.9);
    scene.add(porch);
    var spill = new THREE.PointLight('#ffd7a3', 0.9, 6, 2);
    spill.position.set(0, 1.9, -1.0);
    scene.add(spill);
    [-3.2, -8.0].forEach(function (z) {
      var l = new THREE.PointLight('#ffe4c6', 1.1, 11, 1.3);
      l.position.set(0, 3.5, z);
      scene.add(l);
    });
  }

  /* ---------------- street ---------------- */
  function buildStreet() {
    var walk = plane(16, 7, std('#ffffff', { map: TX.pavement(), rough: 0.9 }));
    walk.rotation.x = -Math.PI / 2;
    at(walk, 0, 0, 3.5);
    scene.add(walk);

    var curb = box(16, 0.14, 0.3, std('#3a4372', { rough: 0.8 }));
    at(curb, 0, 0.07, 7);
    scene.add(curb);

    // warm light pool from the shop on the pavement
    var poolMat = new THREE.MeshBasicMaterial({ map: TX.glow('rgba(255,190,120,0.55)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    var pool = plane(4.2, 3.2, poolMat);
    pool.rotation.x = -Math.PI / 2;
    at(pool, 0, 0.004, 1.1);
    scene.add(pool);

    var mat = plane(1.0, 0.55, std('#ffffff', { map: TX.doormat(), rough: 1 }));
    mat.rotation.x = -Math.PI / 2;
    at(mat, 0, 0.008, 0.42);
    scene.add(mat);

    // potted plants
    [-1.05, 1.05].forEach(function (x) {
      var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.42, 20), std('#ff5a5f', { rough: 0.5 }));
      at(pot, x, 0.21, 0.42);
      scene.add(pot);
      var leaves = new THREE.Group();
      for (var i = 0; i < 6; i++) {
        var b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + Math.random() * 0.06, 1), std('#2ec4b6', { rough: 0.8 }));
        b.position.set((Math.random() - 0.5) * 0.25, 0.55 + i * 0.07, (Math.random() - 0.5) * 0.2);
        leaves.add(b);
      }
      at(leaves, x, 0, 0.42);
      scene.add(leaves);
      animated.push(function (t) { leaves.rotation.z = Math.sin(t * 0.9 + x) * 0.025; });
    });
  }

  /* ---------------- facade ---------------- */
  function buildFacade() {
    var fw = 16, fh = 8;
    var s = new THREE.Shape();
    s.moveTo(-fw / 2, -0.3); s.lineTo(fw / 2, -0.3); s.lineTo(fw / 2, fh); s.lineTo(-fw / 2, fh); s.closePath();
    function hole(x0, y0, x1, y1) {
      var h = new THREE.Path();
      h.moveTo(x0, y0); h.lineTo(x0, y1); h.lineTo(x1, y1); h.lineTo(x1, y0); h.closePath();
      s.holes.push(h);
    }
    hole(-0.65, 0, 0.65, 2.5);
    hole(-3.7, 0.62, -1.3, 2.36);
    hole(1.3, 0.62, 3.7, 2.36);
    var geo = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
    geo.translate(0, 0, -0.3);
    var wall = new THREE.Mesh(geo, std('#2350b8', { rough: 0.85 }));
    scene.add(wall);

    var trim = std('#ffc531', { rough: 0.45 });
    // plinth
    [[-4.375, 7.25], [4.375, 7.25]].forEach(function (p) {
      scene.add(at(box(p[1], 0.36, 0.06, std('#17337d', { rough: 0.8 })), p[0], 0.18, 0.03));
    });
    // door casing
    scene.add(at(box(0.1, 2.62, 0.08, trim), -0.7, 1.31, 0.02));
    scene.add(at(box(0.1, 2.62, 0.08, trim), 0.7, 1.31, 0.02));
    scene.add(at(box(1.5, 0.12, 0.08, trim), 0, 2.56, 0.02));
    // reveal lining inside the opening
    var reveal = std('#e8ad1f', { rough: 0.5 });
    scene.add(at(box(0.04, 2.5, 0.3, reveal), -0.63, 1.25, -0.15));
    scene.add(at(box(0.04, 2.5, 0.3, reveal), 0.63, 1.25, -0.15));
    scene.add(at(box(1.3, 0.04, 0.3, reveal), 0, 2.48, -0.15));
    // threshold
    scene.add(at(box(1.3, 0.03, 0.42, std('#c9ccd8', { metal: 0.8, rough: 0.3 })), 0, 0.015, -0.1));

    // side display windows
    [-2.5, 2.5].forEach(function (cx) {
      scene.add(at(box(2.56, 0.08, 0.08, trim), cx, 0.6, 0.02));
      scene.add(at(box(2.56, 0.08, 0.08, trim), cx, 2.38, 0.02));
      scene.add(at(box(0.08, 1.86, 0.08, trim), cx - 1.24, 1.49, 0.02));
      scene.add(at(box(0.08, 1.86, 0.08, trim), cx + 1.24, 1.49, 0.02));
      scene.add(at(box(0.05, 1.74, 0.05, trim), cx, 1.49, -0.1));
      var gl = plane(2.4, 1.74, glassMat());
      at(gl, cx, 1.49, -0.1);
      scene.add(gl);
      addStreaks(gl, 2.4, 1.74);
      // striped awning
      var aw = box(2.7, 0.04, 0.75, std('#ffffff', { map: TX.awning(), rough: 0.7 }));
      aw.rotation.x = 0.42;
      at(aw, cx, 2.72, 0.33);
      scene.add(aw);
      var val = box(2.7, 0.16, 0.02, std('#ff5a5f', { rough: 0.7 }));
      at(val, cx, 2.5, 0.68);
      scene.add(val);
    });

    // shop sign lightbox above the door
    var signTex = TX.shopSign();
    var signFace = new THREE.MeshStandardMaterial({ map: signTex, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: 0.9, roughness: 0.5 });
    var sideMat = std('#1b1030', { rough: 0.4 });
    var sign = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.44, 0.12), [sideMat, sideMat, sideMat, sideMat, signFace, sideMat]);
    at(sign, 0, 2.95, 0.08);
    scene.add(sign);

    // sconces
    [-0.98, 0.98].forEach(function (x) {
      var sc = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.22, 16), std('#1b1030', { emissive: '#ffcf8f', ei: 0.0, metal: 0.4, rough: 0.4 }));
      at(sc, x, 2.2, 0.08);
      scene.add(sc);
      var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), new THREE.MeshBasicMaterial({ color: '#ffe2b0' }));
      at(bulb, x, 2.08, 0.1);
      scene.add(bulb);
      var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow('rgba(255,200,130,0.9)'), blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
      halo.scale.set(0.7, 0.7, 1);
      at(halo, x, 2.1, 0.12);
      scene.add(halo);
    });
  }

  var _glass = null;
  function glassMat() {
    if (!_glass) {
      _glass = new THREE.MeshPhysicalMaterial({
        color: '#cfefff', transparent: true, opacity: 0.17, roughness: 0.04, metalness: 0.1,
        envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false
      });
    }
    return _glass;
  }
  var _streakTex = null;
  function addStreaks(parent, w, h) {
    _streakTex = _streakTex || TX.streak();
    var m = new THREE.MeshBasicMaterial({ map: _streakTex, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false });
    [[-0.18, 0.16], [0.12, 0.07]].forEach(function (s) {
      var p = plane(w * s[1] + 0.05, h * 1.25, m);
      p.rotation.z = -0.5;
      p.position.set(w * s[0], 0, 0.004);
      parent.add(p);
      // clip to pane by scaling inside the frame
      p.scale.y = 0.78;
    });
  }

  /* ---------------- the door ---------------- */
  function buildDoor() {
    var W = 1.1, H = 2.4;
    var pivot = new THREE.Group();
    at(pivot, -0.55, 0, -0.12);
    scene.add(pivot);
    door.pivot = pivot;

    var frame = std('#ffc531', { rough: 0.42 });
    pivot.add(at(box(0.09, H, 0.05, frame), 0.045, H / 2, 0));
    pivot.add(at(box(0.09, H, 0.05, frame), W - 0.045, H / 2, 0));
    pivot.add(at(box(W, 0.1, 0.05, frame), W / 2, H - 0.05, 0));
    pivot.add(at(box(W, 0.38, 0.05, frame), W / 2, 0.19, 0));
    var kick = box(W - 0.24, 0.24, 0.006, std('#d8dce6', { metal: 0.9, rough: 0.28 }));
    pivot.add(at(kick, W / 2, 0.19, 0.027));

    var gw = W - 0.18, gh = H - 0.48;
    var glass = plane(gw, gh, glassMat());
    at(glass, W / 2, 0.38 + gh / 2, 0);
    pivot.add(glass);
    addStreaks(glass, gw, gh);

    // --- schedule vinyl
    var sched = plane(0.42, 0.345, new THREE.MeshBasicMaterial({ map: TX.schedule(), transparent: true, depthWrite: false }));
    pivot.add(at(sched, W / 2, 1.42, 0.004));

    // --- legal poster (clickable)
    var posterMat = new THREE.MeshStandardMaterial({ map: TX.legalPoster(), roughness: 0.9, transparent: true });
    var poster = plane(0.27, 0.38, posterMat);
    poster.rotation.z = 0.035;
    pivot.add(at(poster, 0.29, 0.78, 0.006));
    clickables.push({ mesh: poster, action: openLegal, hover: function (on) { poster.scale.setScalar(on ? 1.06 : 1); } });

    // --- skip intro sticker (clickable)
    var stickerMat = new THREE.MeshStandardMaterial({ map: TX.skipSticker(), roughness: 0.35, transparent: true, alphaTest: 0.05 });
    var sticker = plane(0.25, 0.25, stickerMat);
    pivot.add(at(sticker, 0.66, 0.71, 0.006));
    clickables.push({ mesh: sticker, action: skipIntro, hover: function (on) { sticker.scale.setScalar(on ? 1.1 : 1); } });
    animated.push(function (t) { if (!sticker.userData.hover) sticker.rotation.z = Math.sin(t * 1.3) * 0.03; });

    // --- pull handle
    var chrome = new THREE.MeshStandardMaterial({ color: '#e6e9f0', metalness: 1, roughness: 0.18, emissive: '#ffc531', emissiveIntensity: 0 });
    var handle = new THREE.Group();
    at(handle, W - 0.045, 1.08, 0.025);
    var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.6, 20), chrome);
    bar.position.z = 0.075;
    handle.add(bar);
    [-0.22, 0.22].forEach(function (y) {
      var st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.075, 12), chrome);
      st.rotation.x = Math.PI / 2;
      st.position.set(0, y, 0.037);
      handle.add(st);
      var rose = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.01, 18), chrome);
      rose.rotation.x = Math.PI / 2;
      rose.position.set(0, y, 0.004);
      handle.add(rose);
    });
    pivot.add(handle);
    door.handle = handle;
    door.chrome = chrome;

    var hit = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.8, 0.22), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(-0.03, 0, 0.08);
    handle.add(hit);
    clickables.push({ mesh: hit, action: enterShop, hover: function (on) { chrome.emissiveIntensity = on ? 0.35 : 0; } });

    // pulsing ring on the handle
    var ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.ring(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    ring.position.set(0, 0, 0.09);
    handle.add(ring);
    door.ring = ring;
    animated.push(function (t) {
      var k = (t * 0.8) % 1;
      ring.scale.setScalar(0.22 + k * 0.42);
      ring.material.opacity = (1 - k) * 0.9 * (door.ringOn ? 1 : 0);
    });

    // --- OPEN sign hanging inside the glass
    var hook = new THREE.Group();
    at(hook, W / 2, 2.2, -0.05);
    pivot.add(hook);
    var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.012, 16), new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.6, roughness: 0.1 }));
    cup.rotation.x = Math.PI / 2;
    cup.position.z = 0.02;
    hook.add(cup);

    var swing = new THREE.Group();
    hook.add(swing);
    var cordMat = new THREE.MeshBasicMaterial({ color: '#2a2140' });
    [-1, 1].forEach(function (sx) {
      var len = Math.hypot(0.2, 0.17);
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, len, 5), cordMat);
      c.position.set(sx * 0.1, -0.085, 0);
      c.rotation.z = sx * Math.atan2(0.2, 0.17);
      swing.add(c);
    });
    var flip = new THREE.Group();
    flip.position.y = -0.33;
    swing.add(flip);
    var fTex = TX.openFront(), bTex = TX.openBack();
    var front = plane(0.5, 0.28, new THREE.MeshStandardMaterial({ map: fTex, emissive: '#ffffff', emissiveMap: fTex, emissiveIntensity: 1, roughness: 0.6 }));
    front.position.z = 0.003;
    var back = plane(0.5, 0.28, new THREE.MeshStandardMaterial({ map: bTex, emissive: '#ffffff', emissiveMap: bTex, emissiveIntensity: 1, roughness: 0.6 }));
    back.rotation.y = Math.PI;
    back.position.z = -0.003;
    flip.add(front, back);
    var glowMat = new THREE.SpriteMaterial({ map: TX.glow('rgba(255,255,255,1)'), color: '#ff3d7f', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 });
    var glow = new THREE.Sprite(glowMat);
    glow.scale.set(1.0, 0.75, 1);
    glow.position.set(0, -0.33, -0.03);
    swing.add(glow);

    var pink = new THREE.Color('#ff3d7f'), mint = new THREE.Color('#6ef2d0');
    var flipT = 0, flipFrom = 0, flipTo = 0, flipping = false, nextFlip = 6;
    var flicker = 0;
    animated.push(function (t, dt) {
      var sway = reduce ? 0.2 : 1;
      swing.rotation.z = Math.sin(t * 1.7) * 0.07 * sway + Math.sin(t * 0.63) * 0.03 * sway;
      swing.rotation.x = Math.sin(t * 1.1 + 1) * 0.04 * sway;
      nextFlip -= dt;
      if (!flipping && nextFlip <= 0) {
        flipping = true; flipT = 0; flipFrom = flip.rotation.y; flipTo = flipFrom + Math.PI;
      }
      if (flipping) {
        flipT += dt / 1.1;
        var p = Math.min(1, flipT);
        // a little overshoot so it feels like a real sign spun on its string
        var e = ease(p) + Math.sin(p * Math.PI) * 0.08;
        flip.rotation.y = flipFrom + (flipTo - flipFrom) * e;
        if (p >= 1) {
          flip.rotation.y = flipTo; flipping = false;
          var showingFront = Math.round(flipTo / Math.PI) % 2 === 0;
          nextFlip = showingFront ? 7 : 3.5;
        }
      }
      var facing = Math.cos(flip.rotation.y);   // 1 = OPEN side out
      glowMat.color.copy(mint).lerp(pink, (facing + 1) / 2);
      // neon flicker now and then
      if (Math.random() < 0.004) flicker = 0.25;
      flicker = Math.max(0, flicker - dt);
      var f = flicker > 0 ? (Math.random() < 0.5 ? 0.25 : 1) : 1;
      glowMat.opacity = 0.55 * f;
      front.material.emissiveIntensity = back.material.emissiveIntensity = 0.65 + 0.35 * f;
    });
  }

  /* ---------------- interior ---------------- */
  function buildInterior() {
    var ROOM = { x0: -4, x1: 4, z0: -0.3, z1: -11, h: 4 };
    var floor = plane(8, 10.7, std('#ffffff', { map: TX.wood(), rough: 0.55 }));
    floor.rotation.x = -Math.PI / 2;
    at(floor, 0, 0.001, (ROOM.z0 + ROOM.z1) / 2);
    scene.add(floor);

    var wallM = std('#ffd2b5', { rough: 0.9 });
    var left = plane(10.7, ROOM.h, wallM); left.rotation.y = Math.PI / 2; at(left, ROOM.x0, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2); scene.add(left);
    var right = plane(10.7, ROOM.h, wallM); right.rotation.y = -Math.PI / 2; at(right, ROOM.x1, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2); scene.add(right);
    var backW = plane(8, ROOM.h, std('#ffbf9a', { rough: 0.9 })); at(backW, 0, ROOM.h / 2, ROOM.z1); scene.add(backW);
    var ceil = plane(8, 10.7, std('#fff1e6', { rough: 1 })); ceil.rotation.x = Math.PI / 2; at(ceil, 0, ROOM.h, (ROOM.z0 + ROOM.z1) / 2); scene.add(ceil);

    // light strips in the ceiling
    var stripM = new THREE.MeshBasicMaterial({ color: '#fff4e0' });
    [-1.6, 1.6].forEach(function (x) { scene.add(at(box(0.08, 0.03, 9.6, stripM), x, ROOM.h - 0.02, -5.8)); });

    var PAL = P.PALETTE;
    function pick() { return PAL[Math.floor(Math.random() * PAL.length)]; }
    var kinds = ['tshirt', 'tshirt', 'hoodie', 'dress', 'pants'];
    function pickKind() { return kinds[Math.floor(Math.random() * kinds.length)]; }
    var chrome = new THREE.MeshStandardMaterial({ color: '#dfe3ec', metalness: 1, roughness: 0.22 });
    var swaying = [];

    // back wall: face-out display, three rows
    var rows = [3.15, 2.2, 1.25];
    rows.forEach(function (y, ri) {
      var rail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 6.4, 10), chrome);
      rail.rotation.z = Math.PI / 2;
      at(rail, 0, y, ROOM.z1 + 0.12);
      scene.add(rail);
      for (var i = 0; i < 9; i++) {
        var kind = ri === 2 ? (i % 2 ? 'pants' : 'dress') : (i % 3 === 0 ? 'hoodie' : 'tshirt');
        var g = P.garment(kind, pick(), { noHanger: true });
        g.scale.setScalar(kind === 'pants' || kind === 'dress' ? 0.8 : 1);
        at(g, -2.8 + i * 0.7, y + 0.02, ROOM.z1 + 0.16);
        scene.add(g);
        swaying.push(g);
      }
    });
    // neon hanger on the back wall
    var hangerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 3.72, 0), new THREE.Vector3(0.1, 3.82, 0), new THREE.Vector3(0.0, 3.92, 0),
      new THREE.Vector3(-0.1, 3.84, 0), new THREE.Vector3(0, 3.62, 0), new THREE.Vector3(0.55, 3.38, 0),
      new THREE.Vector3(-0.55, 3.38, 0), new THREE.Vector3(0, 3.62, 0)
    ], false, 'catmullrom', 0.1);
    var neonM = new THREE.MeshBasicMaterial({ color: '#ff3d7f' });
    var neon = new THREE.Mesh(new THREE.TubeGeometry(hangerCurve, 120, 0.016, 8, false), neonM);
    at(neon, 0, 0, ROOM.z1 + 0.05);
    scene.add(neon);
    var nGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.glow('rgba(255,61,127,0.8)'), blending: THREE.AdditiveBlending, depthWrite: false }));
    nGlow.scale.set(2.2, 1.4, 1);
    at(nGlow, 0, 3.6, ROOM.z1 + 0.1);
    scene.add(nGlow);

    // round rack in the middle of the aisle
    var rack = new THREE.Group();
    at(rack, 0, 0, -6.1);
    scene.add(rack);
    var ringR = 0.55;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.015, 8, 48), chrome);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.5;
    rack.add(ring);
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 10), chrome);
    pole.position.y = 0.75;
    rack.add(pole);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.05, 24), chrome);
    base.position.y = 0.025;
    rack.add(base);
    for (var i = 0; i < 14; i++) {
      var a = (i / 14) * Math.PI * 2;
      var g = P.garment(pickKind(), pick());
      g.position.set(Math.cos(a) * ringR, 1.5, Math.sin(a) * ringR);
      g.rotation.y = -a;   // hanger arms point out from the ring
      rack.add(g);
      swaying.push(g);
    }
    animated.push(function (t) { rack.rotation.y = Math.sin(t * 0.12) * 0.15; });

    // two straight rails along the aisle (garments face the door)
    [-0.95, 0.95].forEach(function (x) {
      var r = new THREE.Group();
      at(r, x, 0, -3.1);
      scene.add(r);
      var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 10), chrome);
      bar.rotation.x = Math.PI / 2;
      bar.position.y = 1.55;
      r.add(bar);
      [-0.75, 0.75].forEach(function (z) {
        var post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.55, 10), chrome);
        post.position.set(0, 0.775, z);
        r.add(post);
        var foot = box(0.4, 0.03, 0.05, chrome);
        foot.position.set(0, 0.015, z);
        r.add(foot);
      });
      for (var k = 0; k < 8; k++) {
        var g = P.garment(pickKind(), pick());
        g.position.set(0, 1.55, -0.62 + k * 0.17);
        g.rotation.y = (Math.random() - 0.5) * 0.25;
        r.add(g);
        swaying.push(g);
      }
    });

    // wall shelving with folded stacks + banners
    var stackGeo = new THREE.BoxGeometry(0.34, 1, 0.38);
    var stackMat = new THREE.MeshStandardMaterial({ map: TX.foldedStack(), roughness: 0.85 });
    var wood = std('#f4e3d0', { rough: 0.7 });
    var banners = {
      left: [['TRICOURI', 'femei', '#ff3d7f', '#ffffff'], ['BLUGI', 'femei', '#3a86ff', '#ffffff'], ['ROCHII', 'de toate', '#ffc531', '#1b1030']],
      right: [['TRICOURI', 'bărbați', '#06d6a0', '#1b1030'], ['PANTALONI', 'bărbați', '#8338ec', '#ffffff'], ['GECI', 'și hanorace', '#ff5a5f', '#ffffff']]
    };
    var units = [];
    [-1, 1].forEach(function (side) {
      [-2.6, -5.3, -8.0].forEach(function (z, ui) {
        units.push({ side: side, z: z, b: banners[side < 0 ? 'left' : 'right'][ui] });
      });
    });
    var stacks = new THREE.InstancedMesh(stackGeo, stackMat, units.length * 4 * 6);
    var mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    var si = 0;
    units.forEach(function (u) {
      var x = u.side * 3.72;
      var grp = new THREE.Group();
      at(grp, x, 0, u.z);
      grp.rotation.y = -u.side * Math.PI / 2;   // faces the aisle
      scene.add(grp);
      grp.add(at(box(2.4, 2.4, 0.04, wood), 0, 1.2, -0.25));
      grp.add(at(box(0.05, 2.4, 0.5, wood), -1.2, 1.2, 0));
      grp.add(at(box(0.05, 2.4, 0.5, wood), 1.2, 1.2, 0));
      [0.1, 0.65, 1.2, 1.75, 2.38].forEach(function (y) { grp.add(at(box(2.4, 0.04, 0.5, wood), 0, y, 0)); });
      var bt = TX.banner(u.b[0], u.b[1], u.b[2], u.b[3]);
      var ban = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.5, 0.05), [wood, wood, wood, wood, new THREE.MeshStandardMaterial({ map: bt, emissive: '#ffffff', emissiveMap: bt, emissiveIntensity: 0.25, roughness: 0.6 }), wood]);
      grp.add(at(ban, 0, 2.72, 0.02));
      grp.updateMatrixWorld(true);
      [0.12, 0.67, 1.22, 1.77].forEach(function (y) {
        for (var c = 0; c < 6; c++) {
          var hgt = 0.18 + Math.random() * 0.24;
          pos.set(-1.0 + c * 0.4, y + hgt / 2, 0.02);
          pos.applyMatrix4(grp.matrixWorld);
          q.setFromEuler(new THREE.Euler(0, grp.rotation.y + (Math.random() - 0.5) * 0.12, 0));
          sc.set(1, hgt, 1);
          mtx.compose(pos, q, sc);
          stacks.setMatrixAt(si, mtx);
          stacks.setColorAt(si, col.set(pick()));
          si++;
        }
      });
    });
    stacks.instanceMatrix.needsUpdate = true;
    if (stacks.instanceColor) stacks.instanceColor.needsUpdate = true;
    scene.add(stacks);

    // display platforms behind the side windows
    [-2.5, 2.5].forEach(function (cx, i) {
      var plat = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.22, 32), std(i ? '#8338ec' : '#ff3d7f', { rough: 0.5 }));
      at(plat, cx, 0.72, -1.1);
      scene.add(plat);
      var stand = new THREE.Group();
      at(stand, cx, 0.83, -1.1);
      scene.add(stand);
      var p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8), chrome);
      p.position.y = 0.6;
      stand.add(p);
      var tbar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8), chrome);
      tbar.rotation.z = Math.PI / 2;
      tbar.position.y = 1.2;
      stand.add(tbar);
      var g = P.garment(i ? 'hoodie' : 'dress', i ? '#ffc531' : '#06d6a0');
      g.position.y = 1.22;
      stand.add(g);
      animated.push(function (t) { stand.rotation.y = t * 0.35 + i * 2; });
    });

    animated.push(function (t) {
      for (var i = 0; i < swaying.length; i++) {
        var g = swaying[i];
        g.userData.body.rotation.z = Math.sin(t * 0.9 + g.userData.phase) * 0.018;
        g.userData.body.rotation.x = Math.sin(t * 0.7 + g.userData.phase * 1.3) * 0.012;
      }
    });

    return { obstacles: [{ x: 0, z: -6.1, r: 0.7 }, { x: -0.95, z: -2.6, r: 0.25 }, { x: -0.95, z: -3.6, r: 0.25 }, { x: 0.95, z: -2.6, r: 0.25 }, { x: 0.95, z: -3.6, r: 0.25 }] };
  }

  /* ---------------- shoppers ---------------- */
  function buildPeople(obstacles) {
    function spot(x, z, tx, tz) { return { x: x, z: z, face: Math.atan2(tx - x, tz - z) }; }
    var spots = [
      spot(-0.4, -2.8, -0.95, -2.8),
      spot(0.42, -3.4, 0.95, -3.4),
      spot(-0.85, -5.6, 0, -6.1),
      spot(0.9, -6.5, 0, -6.1),
      spot(0.1, -5.15, 0, -6.1),
      spot(-0.7, -10.0, -0.7, -11),
      spot(0.8, -9.9, 0.8, -11),
      spot(-3.0, -3.3, -3.7, -3.3),
      spot(3.0, -5.6, 3.7, -5.6),
      spot(-2.9, -7.8, -3.7, -7.8),
      spot(2.9, -2.4, 3.7, -2.4)
    ];
    var cast = [
      { shirt: '#ff5a5f', pants: '#1d3557', longHair: true, bag: '#ffc531', scale: 0.97 },
      { shirt: '#3a86ff', pants: '#2b2d42', scale: 1.04 },
      { shirt: '#06d6a0', pants: '#3a3a52', longHair: true, scale: 0.95 },
      { shirt: '#fee440', pants: '#264653', bag: '#8338ec', scale: 1.0 },
      { shirt: '#9b5de5', pants: '#1d3557', scale: 1.02 }
    ];
    var starts = [0, 4, 6, 2, 8];
    cast.forEach(function (c, i) {
      var p = P.person(c);
      scene.add(p.root);
      walkers.push(new P.Walker(p, spots, starts[i], obstacles));
    });
  }

  /* ---------------- tweens + state ---------------- */
  var tweens = [];
  function tween(dur, fn, opts) {
    opts = opts || {};
    return new Promise(function (res) {
      tweens.push({ t: -(opts.delay || 0), dur: reduce ? Math.min(dur, 0.35) : dur, fn: fn, ease: opts.ease || ease, res: res });
    });
  }
  function runTweens(dt) {
    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i];
      tw.t += dt;
      if (tw.t < 0) continue;
      var p = Math.min(1, tw.t / tw.dur);
      tw.fn(tw.ease(p));
      if (p >= 1) { tweens.splice(i, 1); tw.res(); }
    }
  }

  var state = 'loading';   // loading | intro | idle | opening | inside | closing
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var camPose = { pos: new THREE.Vector3(), look: new THREE.Vector3() };

  var curtain = document.createElement('div');
  curtain.style.cssText = 'position:fixed;inset:0;background:#0d1430;opacity:0;pointer-events:none;z-index:12;transition:opacity .45s ease';
  document.body.appendChild(curtain);
  function setCurtain(on) {
    curtain.style.opacity = on ? '1' : '0';
    return new Promise(function (r) { setTimeout(r, reduce ? 50 : 470); });
  }

  var actx = null;
  function chime() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var now = actx.currentTime;
      [[1318.5, 0], [1046.5, 0.16]].forEach(function (n) {
        [1, 2.76].forEach(function (h, hi) {
          var o = actx.createOscillator(), g = actx.createGain();
          o.type = 'sine';
          o.frequency.value = n[0] * h;
          var peak = hi ? 0.015 : 0.07;
          g.gain.setValueAtTime(0.0001, now + n[1]);
          g.gain.exponentialRampToValueAtTime(peak, now + n[1] + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, now + n[1] + (hi ? 0.5 : 1.4));
          o.connect(g); g.connect(actx.destination);
          o.start(now + n[1]); o.stop(now + n[1] + 1.5);
        });
      });
    } catch (e) { /* sound is optional */ }
  }

  function showHint(on) {
    door.ringOn = on;
    if (on) { hintEl.hidden = false; requestAnimationFrame(function () { hintEl.classList.remove('is-fading'); }); }
    else { hintEl.classList.add('is-fading'); setTimeout(function () { if (!door.ringOn) hintEl.hidden = true; }, 350); }
  }

  function setInside(on) {
    insideEl.hidden = !on;
    if (on) $('exit-btn').focus({ preventScroll: true });
  }

  var INSIDE_POS = new THREE.Vector3(0, 1.5, -1.5);
  var INSIDE_LOOK = new THREE.Vector3(0, 1.45, -8);

  function enterShop() {
    if (state !== 'idle') return;
    state = 'opening';
    showHint(false);
    chime();
    var p0 = camera.position.clone(), l0 = camLook.clone();
    // tug on the handle, then swing the door in and walk through
    tween(0.18, function (e) { door.handle.position.z = 0.025 + Math.sin(e * Math.PI) * 0.012; }, { ease: function (p) { return p; } });
    tween(1.6, function (e) { door.pivot.rotation.y = 1.42 * e; }, { delay: 0.15 });
    tween(2.3, function (e) {
      camera.position.lerpVectors(p0, INSIDE_POS, e);
      camLook.lerpVectors(l0, INSIDE_LOOK, e);
    }, { delay: 0.55 }).then(function () {
      state = 'inside';
      setInside(true);
    });
  }

  function skipIntro() {
    if (state !== 'idle') return;
    state = 'opening';
    showHint(false);
    setCurtain(true).then(function () {
      door.pivot.rotation.y = 1.42;
      camera.position.copy(INSIDE_POS);
      camLook.copy(INSIDE_LOOK);
      return setCurtain(false);
    }).then(function () {
      state = 'inside';
      setInside(true);
    });
  }

  function exitShop() {
    if (state !== 'inside') return;
    state = 'closing';
    setInside(false);
    var p0 = camera.position.clone(), l0 = camLook.clone();
    tween(2.0, function (e) {
      camera.position.lerpVectors(p0, camHome, e);
      camLook.lerpVectors(l0, LOOK, e);
    });
    tween(1.3, function (e) { door.pivot.rotation.y = 1.42 * (1 - e); }, { delay: 1.0 }).then(function () {
      state = 'idle';
      showHint(true);
      canvas.focus({ preventScroll: true });
    });
  }

  var lastFocus = null;
  function openLegal() {
    if (state !== 'idle' && state !== 'inside') return;
    lastFocus = document.activeElement;
    legalEl.hidden = false;
    $('legal-close').focus({ preventScroll: true });
  }
  function closeLegal() {
    legalEl.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------------- input ---------------- */
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(clickables.map(function (c) { return c.mesh; }), false);
    if (!hits.length) return null;
    for (var i = 0; i < clickables.length; i++) if (clickables[i].mesh === hits[0].object) return clickables[i];
    return null;
  }
  var hovered = null, down = null;
  canvas.addEventListener('pointermove', function (e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    if (e.pointerType !== 'mouse') return;
    var c = state === 'idle' ? pick(e.clientX, e.clientY) : null;
    if (c !== hovered) {
      if (hovered) { hovered.hover(false); hovered.mesh.userData.hover = false; }
      hovered = c;
      if (c) { c.hover(true); c.mesh.userData.hover = true; }
      canvas.classList.toggle('is-pointer', !!c);
    }
  });
  canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', function (e) {
    if (!down) return;
    var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 12 || state !== 'idle') return;
    var c = pick(e.clientX, e.clientY);
    if (c) c.action();
  });
  canvas.addEventListener('pointerleave', function () { pointer.tx = pointer.ty = 0; });

  $('exit-btn').addEventListener('click', exitShop);
  $('legal-close').addEventListener('click', closeLegal);
  legalEl.addEventListener('click', function (e) { if (e.target === legalEl) closeLegal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !legalEl.hidden) closeLegal(); });
  $('kbd-enter').addEventListener('click', enterShop);
  $('kbd-skip').addEventListener('click', skipIntro);
  $('kbd-legal').addEventListener('click', openLegal);

  /* ---------------- layout ---------------- */
  function fitDistance() {
    var t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    var halfW = 0.98, halfH = 1.86;
    return Math.min(9, Math.max(halfH / t, halfW / (t * camera.aspect)));
  }
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camHome.set(0, 1.48, fitDistance());
    if (state === 'idle') camera.position.copy(camHome);
  }
  window.addEventListener('resize', resize);

  var handleWorld = new THREE.Vector3();
  function placeHint() {
    if (hintEl.hidden) return;
    door.handle.getWorldPosition(handleWorld);
    handleWorld.y += 0.0;
    handleWorld.project(camera);
    var x = (handleWorld.x + 1) / 2 * window.innerWidth;
    var y = (1 - handleWorld.y) / 2 * window.innerHeight;
    var w = hintEl.offsetWidth, h = hintEl.offsetHeight;
    var left = Math.max(12, x - w - 26);
    hintEl.style.transform = 'translate(' + left.toFixed(1) + 'px,' + (y - h / 2).toFixed(1) + 'px)';
  }

  /* ---------------- loop ---------------- */
  var clock = new THREE.Clock();
  var time = 0;
  function frame() {
    var dt = Math.min(0.05, clock.getDelta());
    time += dt;
    runTweens(dt);
    for (var i = 0; i < animated.length; i++) animated[i](time, dt);
    for (var j = 0; j < walkers.length; j++) walkers[j].update(dt);

    // gentle parallax while standing at the door
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    if (state === 'idle') {
      var drift = reduce ? 0 : 1;
      camera.position.set(
        camHome.x + pointer.x * 0.28 * drift + Math.sin(time * 0.25) * 0.05 * drift,
        camHome.y - pointer.y * 0.12 * drift + Math.sin(time * 0.33) * 0.03 * drift,
        camHome.z
      );
    }
    camera.lookAt(camLook);
    placeHint();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  /* ---------------- boot ---------------- */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var faces = ['800 60px "Bricolage Grotesque"', '700 40px "Caveat"', '700 30px "Manrope"'];
    var all = Promise.all(faces.map(function (f) { return document.fonts.load(f, 'UMERAȘ ăâîșț'); }));
    return Promise.race([all, new Promise(function (r) { setTimeout(r, 2500); })]).catch(function () {});
  }

  fontsReady().then(function () {
    buildEnv();
    buildLights();
    buildStreet();
    buildFacade();
    buildDoor();
    var interior = buildInterior();
    buildPeople(interior.obstacles);
    resize();

    camera.position.set(0, 2.4, camHome.z + 2.6);
    camLook.copy(LOOK);
    state = 'intro';
    requestAnimationFrame(frame);
    loader.classList.add('is-done');
    setTimeout(function () { loader.hidden = true; }, 700);

    var from = camera.position.clone();
    tween(reduce ? 0.01 : 1.9, function (e) { camera.position.lerpVectors(from, camHome, e); }, { ease: easeOut }).then(function () {
      state = 'idle';
      showHint(true);
    });
  });
})();
