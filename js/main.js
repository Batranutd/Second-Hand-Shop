/* UMERAȘ — door, shop overview, shelves, live visitors. */
(function () {
  'use strict';

  var C = TX.C;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  var canvas = $('scene'), loader = $('loader'), hintEl = $('hint'), legalEl = $('legal');
  var topbar = $('topbar'), chipsEl = $('chips'), secUI = $('section-ui'), toastEl = $('toast');
  var cartBtn = $('cart-btn'), cartCount = $('cart-count'), casaCard = $('casa-card');

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    loader.hidden = true;
    $('nowebgl').hidden = false;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#d6e0e3');

  var camera = new THREE.PerspectiveCamera(35, 1, 0.05, 120);
  var camLook = new THREE.Vector3();
  var DOOR_LOOK = new THREE.Vector3(0, 1.3, 0);
  var camHome = new THREE.Vector3(0, 1.32, 3);

  var ROOM = { x: 2.6, z0: -0.2, z1: -9.0, h: 2.8 };
  var doorItems = [], sections = [], animated = [], figures = {};
  var door = {}, front = {}, roomMeshes = {};

  /* ---------------- helpers ---------------- */
  var RB = {};
  function rbox(w, h, d, r) {
    var key = [w, h, d, r].map(function (n) { return n.toFixed(4); }).join('|');
    if (RB[key]) return RB[key];
    r = Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005);
    var b = r * 0.6, sw = w - 2 * b, sh = h - 2 * b;
    var cr = Math.min(Math.max(0.0005, r - b), sw / 2 - 0.0002, sh / 2 - 0.0002);
    var s = new THREE.Shape(), x = -sw / 2, y = -sh / 2;
    s.moveTo(x + cr, y); s.lineTo(x + sw - cr, y); s.quadraticCurveTo(x + sw, y, x + sw, y + cr);
    s.lineTo(x + sw, y + sh - cr); s.quadraticCurveTo(x + sw, y + sh, x + sw - cr, y + sh);
    s.lineTo(x + cr, y + sh); s.quadraticCurveTo(x, y + sh, x, y + sh - cr);
    s.lineTo(x, y + cr); s.quadraticCurveTo(x, y, x + cr, y);
    var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.0005, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 5 });
    g.center();
    RB[key] = g;
    return g;
  }
  function mesh(geo, m, x, y, z, o) {
    var me = new THREE.Mesh(geo, m);
    me.position.set(x || 0, y || 0, z || 0);
    me.castShadow = !o || o.cast !== false;
    me.receiveShadow = !o || o.receive !== false;
    return me;
  }
  function std(color, rough, extra) { return FIG.mat(color, rough == null ? 0.7 : rough, extra); }
  function plane(w, h, m) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var M = {};
  function materials() {
    M.teal = std('#17646d', 0.45);
    M.tealDark = std(C.tealDark, 0.5);
    M.white = std('#f1efea', 0.75);
    M.wall = std('#e9e7e1', 0.9);
    M.floor = std('#d9cbb7', 0.8);
    M.ground = std('#cbd7da', 0.95);
    M.sand = std('#e2d4bf', 0.65);
    M.metal = new THREE.MeshStandardMaterial({ color: '#c9ced4', roughness: 0.3, metalness: 0.75 });
    M.handle = new THREE.MeshStandardMaterial({ color: '#ece8df', roughness: 0.25, metalness: 0.3, emissive: '#f5b841', emissiveIntensity: 0 });
    M.glass = new THREE.MeshPhysicalMaterial({ color: '#e8f4f4', transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0.1, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false });
    M.amber = new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.8, depthWrite: false });
  }

  /* ---------------- lights ---------------- */
  function buildEnv() {
    var pm = new THREE.PMREMGenerator(renderer);
    var env = new THREE.Scene();
    env.background = new THREE.Color('#b8c6ca');
    var g = new THREE.BoxGeometry(1, 1, 1);
    [[2.2, [0, 6, 0], [6, 0.1, 6]], [1.2, [-6, 2, 3], [0.1, 3, 5]], [1.0, [5, 2, -3], [0.1, 3, 5]]].forEach(function (l) {
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(l[0]) }));
      m.position.fromArray(l[1]); m.scale.fromArray(l[2]); env.add(m);
    });
    var envTex = pm.fromScene(env, 0.04).texture;
    pm.dispose();
    [M.glass, M.metal, M.handle].forEach(function (m) { m.envMap = envTex; m.envMapIntensity = 0.9; m.needsUpdate = true; });
  }
  function buildLights() {
    scene.add(new THREE.HemisphereLight('#f4f8fa', '#c9b9a2', 0.5));
    var sun = new THREE.DirectionalLight('#fff3e2', 1.05);
    sun.position.set(-5, 11, 6);
    sun.target.position.set(0, 0, -4.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    var s = sun.shadow.camera;
    s.left = -7; s.right = 7; s.top = 8; s.bottom = -8; s.near = 1; s.far = 30;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 3;
    scene.add(sun, sun.target);
    var fill = new THREE.DirectionalLight('#dceef0', 0.22);
    fill.position.set(4, 5, 5);
    scene.add(fill);
  }

  /* ---------------- room ---------------- */
  function buildRoom() {
    var len = ROOM.z0 - ROOM.z1, cz = (ROOM.z0 + ROOM.z1) / 2, T = 0.16;
    var ground = mesh(new THREE.PlaneGeometry(60, 60), M.ground, 0, -0.12, -4, { cast: false });
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    scene.add(mesh(rbox(ROOM.x * 2 + T * 2 + 0.2, 0.12, len + T + 0.9, 0.05), M.white, 0, -0.06, cz + 0.35, { cast: false }));
    var floor = mesh(new THREE.PlaneGeometry(ROOM.x * 2, len), M.floor, 0, 0.001, cz, { cast: false });
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    var lineM = new THREE.MeshBasicMaterial({ color: '#cbbba5' });
    for (var x = -ROOM.x + 0.45; x < ROOM.x; x += 0.45) {
      var l = mesh(new THREE.PlaneGeometry(0.012, len), lineM, x, 0.002, cz, { cast: false, receive: false });
      l.rotation.x = -Math.PI / 2;
      scene.add(l);
    }
    var walls = new THREE.Group();
    walls.add(mesh(rbox(T, ROOM.h, len + T, 0.03), M.wall, -ROOM.x - T / 2, ROOM.h / 2, cz - T / 2));
    walls.add(mesh(rbox(T, ROOM.h, len + T, 0.03), M.wall, ROOM.x + T / 2, ROOM.h / 2, cz - T / 2));
    walls.add(mesh(rbox(ROOM.x * 2 + T * 2, ROOM.h, T, 0.03), M.wall, 0, ROOM.h / 2, ROOM.z1 - T / 2));
    scene.add(walls);
    roomMeshes.walls = walls;
    [-ROOM.x + 0.012, ROOM.x - 0.012].forEach(function (px) {
      scene.add(mesh(new THREE.BoxGeometry(0.02, 0.12, len), M.teal, px, 0.06, cz, { cast: false }));
    });
    scene.add(mesh(new THREE.BoxGeometry(ROOM.x * 2, 0.12, 0.02), M.teal, 0, 0.06, ROOM.z1 + 0.012, { cast: false }));
    var ceil = mesh(new THREE.PlaneGeometry(ROOM.x * 2, len), M.wall, 0, ROOM.h, cz, { cast: false });
    ceil.rotation.x = Math.PI / 2;
    scene.add(ceil);
    roomMeshes.ceiling = ceil;
    var lampM = new THREE.MeshBasicMaterial({ color: '#fffaf0' });
    var lamps = new THREE.Group();
    [-1.2, 1.2].forEach(function (lx) { lamps.add(mesh(new THREE.BoxGeometry(0.1, 0.02, len - 1), lampM, lx, ROOM.h - 0.01, cz, { cast: false })); });
    scene.add(lamps);
    roomMeshes.lamps = lamps;
    var inner = new THREE.PointLight('#fff4e4', 0.3, 12, 1.5);
    inner.position.set(0, 2.4, -3);
    scene.add(inner);
  }

  /* ---------------- front wall + door ---------------- */
  function buildFront() {
    var g = new THREE.Group();
    scene.add(g);
    front.group = g;
    var s = new THREE.Shape();
    s.moveTo(-ROOM.x - 0.16, 0); s.lineTo(ROOM.x + 0.16, 0); s.lineTo(ROOM.x + 0.16, ROOM.h); s.lineTo(-ROOM.x - 0.16, ROOM.h); s.closePath();
    var h = new THREE.Path();
    h.moveTo(-0.64, 0); h.lineTo(-0.64, 2.5); h.lineTo(0.64, 2.5); h.lineTo(0.64, 0); h.closePath();
    s.holes.push(h);
    var geo = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false });
    geo.translate(0, 0, ROOM.z0);
    g.add(mesh(geo, M.wall));
    var fz = ROOM.z0 + 0.23;
    g.add(mesh(rbox(0.12, 2.62, 0.1, 0.03), M.white, -0.7, 1.31, fz));
    g.add(mesh(rbox(0.12, 2.62, 0.1, 0.03), M.white, 0.7, 1.31, fz));
    g.add(mesh(rbox(1.52, 0.12, 0.1, 0.03), M.white, 0, 2.56, fz));
    g.add(mesh(rbox(1.28, 0.025, 0.22, 0.01), M.metal, 0, 0.012, ROOM.z0 + 0.1));

    var W = 1.2, H = 2.45, TD = 0.05;
    var pivot = new THREE.Group();
    pivot.position.set(-0.6, 0.02, ROOM.z0 + 0.1);
    g.add(pivot);
    door.pivot = pivot;
    function P(geo2, m, x, y, z) { var me = mesh(geo2, m, x, y, z); pivot.add(me); return me; }
    P(rbox(0.12, H, TD, 0.015), M.teal, 0.06, H / 2, 0);
    P(rbox(0.12, H, TD, 0.015), M.teal, W - 0.06, H / 2, 0);
    P(rbox(0.96, 0.14, TD, 0.015), M.teal, W / 2, H - 0.07, 0);
    P(rbox(0.96, 0.12, TD, 0.015), M.teal, W / 2, 0.89, 0);
    P(rbox(0.96, 0.84, 0.03, 0.01), M.teal, W / 2, 0.42, 0);
    P(rbox(0.8, 0.62, 0.045, 0.03), M.teal, W / 2, 0.44, 0.004);
    var plaque = plane(0.42, 0.158, new THREE.MeshStandardMaterial({ map: TX.plaque(), roughness: 0.6, transparent: true }));
    plaque.position.set(W / 2, 0.47, 0.028);
    pivot.add(plaque);

    var gw = 0.96, gh = 1.43, gy = 0.95 + gh / 2;
    var glass = plane(gw, gh, M.glass);
    glass.position.set(W / 2, gy, 0);
    pivot.add(glass);
    var name = plane(0.78, 0.229, new THREE.MeshBasicMaterial({ map: TX.glassName(), transparent: true, depthWrite: false }));
    name.position.set(W / 2, 2.15, 0.003);
    pivot.add(name);

    // things you can press: each breathes (push in/out) inside an amber outline
    function pressable(m, w, hh, x, y, round, action) {
      var halo = mesh(round ? new THREE.CircleGeometry(w / 2 + 0.02, 40) : rbox(w + 0.04, hh + 0.04, 0.002, 0.03), M.amber.clone(), x, y, 0.004, { cast: false, receive: false });
      pivot.add(halo);
      var item = mesh(round ? new THREE.CircleGeometry(w / 2, 48) : new THREE.PlaneGeometry(w, hh), m, x, y, 0.007, { cast: false, receive: false });
      pivot.add(item);
      doorItems.push({ mesh: item, halo: halo, action: action, hover: false });
    }
    pressable(new THREE.MeshStandardMaterial({ map: TX.legalPoster(), roughness: 0.8, transparent: true }), 0.36, 0.492, 0.36, 1.3, false, openLegal);
    pressable(new THREE.MeshStandardMaterial({ map: TX.skipSticker(), roughness: 0.5, transparent: true }), 0.22, 0.22, 0.8, 1.16, true, skipIntro);

    var handle = new THREE.Group();
    handle.position.set(W - 0.06, 1.3, 0);
    pivot.add(handle);
    var bar = mesh(new THREE.CapsuleGeometry(0.017, 0.62, 8, 20), M.handle, 0, 0, 0.085);
    handle.add(bar);
    [-0.25, 0.25].forEach(function (y) {
      var st = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 14), M.handle, 0, y, 0.055);
      st.rotation.x = Math.PI / 2;
      handle.add(st);
    });
    var hit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.24), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(-0.04, 0, 0.08);
    handle.add(hit);
    var ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.ring(), transparent: true, depthWrite: false }));
    ring.position.set(0, 0, 0.1);
    handle.add(ring);
    door.handle = handle;
    doorItems.push({ mesh: hit, action: enterShop, handle: true, ring: ring, bar: bar, hover: false });

    // clean OPEN sign hanging inside the glass, flips now and then
    var hook = new THREE.Group();
    hook.position.set(W / 2, 1.98, -0.04);
    pivot.add(hook);
    var swing = new THREE.Group();
    hook.add(swing);
    var cord = std('#9aa6aa', 0.6);
    [-1, 1].forEach(function (sx) {
      var c = mesh(new THREE.CylinderGeometry(0.002, 0.002, Math.hypot(0.16, 0.11), 5), cord, sx * 0.08, -0.055, 0, { cast: false });
      c.rotation.z = sx * Math.atan2(0.16, 0.11);
      swing.add(c);
    });
    var flip = new THREE.Group();
    flip.position.y = -0.22;
    swing.add(flip);
    var f1 = plane(0.42, 0.197, new THREE.MeshStandardMaterial({ map: TX.openFront(), roughness: 0.6, transparent: true }));
    var f2 = plane(0.42, 0.197, new THREE.MeshStandardMaterial({ map: TX.openBack(), roughness: 0.6, transparent: true }));
    f1.position.z = 0.004; f2.position.z = -0.004; f2.rotation.y = Math.PI;
    flip.add(f1, f2);
    var flipT = 0, from = 0, to = 0, flipping = false, next = 6;
    animated.push(function (t, dt) {
      var k = reduce ? 0.2 : 1;
      swing.rotation.z = (Math.sin(t * 1.4) * 0.05 + Math.sin(t * 0.55) * 0.02) * k;
      next -= dt;
      if (!flipping && next <= 0) { flipping = true; flipT = 0; from = flip.rotation.y; to = from + Math.PI; }
      if (flipping) {
        flipT += dt / 1.1;
        var p = Math.min(1, flipT);
        flip.rotation.y = from + (to - from) * (ease(p) + Math.sin(p * Math.PI) * 0.06);
        if (p >= 1) { flip.rotation.y = to; flipping = false; next = Math.round(to / Math.PI) % 2 === 0 ? 7 : 3.5; }
      }
    });

    animated.push(function (t) {
      var on = state === 'door';
      doorItems.forEach(function (d, i) {
        var s2 = (Math.sin(t * 3.2 + i * 1.3) + 1) / 2;
        if (d.handle) {
          d.bar.position.z = 0.085 + (on ? s2 * 0.014 : 0);
          M.handle.emissiveIntensity = on ? 0.1 + s2 * 0.22 + (d.hover ? 0.3 : 0) : 0;
          var k = (t * 0.75) % 1;
          d.ring.scale.setScalar(0.2 + k * 0.42);
          d.ring.material.opacity = on ? (1 - k) * 0.9 : 0;
        } else {
          var sc = on ? 1 + s2 * 0.045 + (d.hover ? 0.05 : 0) : 1;
          d.mesh.scale.setScalar(sc);
          d.halo.scale.setScalar(sc);
          d.halo.material.opacity = on ? 0.35 + s2 * 0.55 : 0;
        }
      });
    });
  }

  /* ---------------- shelves, stands, till ---------------- */
  function inCartHidden(g) { var id = g.userData.product.id; return cart.indexOf(id) >= 0 || sold.indexOf(id) >= 0; }
  function visibleItems(sec) { return sec.items.filter(function (g) { return !inCartHidden(g); }); }

  function addGarments(sec, place) {
    sec.items = [];
    CATALOG.bySection(sec.id).forEach(function (p) {
      var g = FIG.garment(p);
      sec.rack.add(g);
      sec.items.push(g);
    });
    sec.place = place;
    sec.offset = sec.target = 0;
    place(sec, 0);
  }

  function railPlace(sec, dt) {
    var vis = visibleItems(sec);
    sec.count = vis.length;
    var spacing = sec.spacing, half = sec.width / 2 - 0.1;
    var shift = sec.mode === 'overview' ? -(Math.min(vis.length, sec.preview) - 1) * spacing / 2 : 0;
    sec.items.forEach(function (g) {
      if (inCartHidden(g)) { g.visible = false; return; }
      var i = vis.indexOf(g);
      var x = (i - sec.offset) * spacing + shift;
      var fade = clamp((half - Math.abs(x)) / 0.2 + 1, 0, 1);
      g.visible = fade > 0.02;
      var prevX = g.position.x;
      var front = sec.mode === 'section' ? Math.max(0, 1 - Math.abs(i - sec.offset) * 1.6) * 0.07 : 0;
      g.position.set(x, sec.railY, 0.02 + front);
      g.scale.setScalar(0.92 * (0.35 + 0.65 * fade));
      g.userData.push = dt ? (g.position.x - prevX) / dt * -2.2 : 0;
    });
  }
  function ringPlace(sec, dt) {
    var vis = visibleItems(sec);
    sec.count = vis.length;
    var n = Math.max(vis.length, 1), R = sec.radius;
    var prev = sec.rack.rotation.y;
    sec.rack.rotation.y = -sec.offset * (Math.PI * 2 / n);
    var push = dt ? (sec.rack.rotation.y - prev) / dt * 1.4 : 0;
    sec.items.forEach(function (g) {
      if (inCartHidden(g)) { g.visible = false; return; }
      var i = vis.indexOf(g), a = i * (Math.PI * 2 / n);
      g.visible = true;
      g.position.set(Math.sin(a) * R, sec.railY, Math.cos(a) * R);
      g.rotation.y = a;
      g.scale.setScalar(0.86);
      g.userData.push = push;
    });
  }

  function makePin(sec, title, sub, pos) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.pin(title, sub), transparent: true, depthWrite: false, depthTest: false }));
    sp.center.set(0.5, 0.03);
    sp.position.copy(pos);
    var base = camera.aspect < 1 ? 2.0 : 1.8;
    sp.userData.base = base;
    sp.scale.set(base, base * 360 / 640, 1);
    sp.renderOrder = 5;
    scene.add(sp);
    sec.pin = sp;
  }

  function wallUnit(def) {
    var g = new THREE.Group();
    if (def.side === 0) g.position.set(def.x || 0, 0, ROOM.z1 + 0.24);
    else { g.position.set(def.side * (ROOM.x - 0.24), 0, def.z); g.rotation.y = -def.side * Math.PI / 2; }
    scene.add(g);
    var W = def.w || 2.2, Hh = 2.35, D = 0.42;
    g.add(mesh(rbox(W, Hh, 0.04, 0.02), M.teal, 0, Hh / 2, -D / 2 + 0.02));
    g.add(mesh(rbox(0.05, Hh, D, 0.02), M.white, -W / 2, Hh / 2, 0));
    g.add(mesh(rbox(0.05, Hh, D, 0.02), M.white, W / 2, Hh / 2, 0));
    g.add(mesh(rbox(W, 0.05, D, 0.02), M.white, 0, Hh, 0));
    g.add(mesh(rbox(W - 0.06, 0.04, D - 0.04, 0.015), M.white, 0, 0.42, 0));
    g.add(mesh(rbox(W - 0.06, 0.04, D - 0.04, 0.015), M.white, 0, 0.06, 0));
    var rail = mesh(new THREE.CylinderGeometry(0.012, 0.012, W - 0.08, 14), M.metal, 0, 1.86, 0.03);
    rail.rotation.z = Math.PI / 2;
    g.add(rail);
    var cols = CATALOG.bySection(def.id).map(function (p) { return p.real ? '#1d2b30' : p.color; });
    for (var i = 0; i < 5; i++) {
      var hh = 0.12 + (i % 3) * 0.05;
      g.add(mesh(rbox(0.34, hh, 0.3, 0.03), std(cols[i % cols.length] || '#cccccc', 0.85), -0.84 + i * 0.42, 0.44 + hh / 2, 0.02));
    }
    var board = plane(W - 0.1, (W - 0.1) * 200 / 1024, new THREE.MeshStandardMaterial({ map: TX.board(def.title, def.sub), roughness: 0.6, transparent: true }));
    board.position.set(0, 2.17, D / 2 + 0.005);
    g.add(board);
    var rack = new THREE.Group();
    rack.position.z = 0.03;
    g.add(rack);
    var hit = new THREE.Mesh(new THREE.BoxGeometry(W, Hh, D + 0.3), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(0, Hh / 2, 0.1);
    g.add(hit);
    var sec = { id: def.id, short: def.short, group: g, rack: rack, hit: hit, kind: 'rail', width: W, spacing: 0.66, preview: 3, railY: 1.86, mode: 'overview' };
    addGarments(sec, railPlace);
    g.updateMatrixWorld(true);
    makePin(sec, def.title, def.sub, new THREE.Vector3(0, 2.45, def.side === 0 ? 0.1 : 0.75).applyMatrix4(g.matrixWorld));
    sec.view = function () {
      var dist = def.side === 0 ? 1.45 : 1.85;
      return { pos: new THREE.Vector3(0, 1.45, dist).applyMatrix4(g.matrixWorld), look: new THREE.Vector3(0, 1.36, 0).applyMatrix4(g.matrixWorld) };
    };
    var nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
    var tan = new THREE.Vector3(1, 0, 0).applyQuaternion(g.quaternion);
    var c = new THREE.Vector3().setFromMatrixPosition(g.matrixWorld);
    sec.spot = function (k) {
      var side = k % 2 ? 1 : -1, along = 0.8 + (k >> 1) * 0.32;
      var p = c.clone().addScaledVector(nrm, 0.75).addScaledVector(tan, side * along);
      return { x: p.x, z: p.z, face: Math.atan2(-nrm.x, -nrm.z) };
    };
    sections.push(sec);
  }

  function stand(def) {
    var g = new THREE.Group();
    g.position.set(def.x, 0, def.z);
    scene.add(g);
    var R = 0.5;
    g.add(mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.05, 40), M.teal, 0, 0.025, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.0, 14), M.metal, 0, 1.0, 0));
    var ring = mesh(new THREE.TorusGeometry(R, 0.013, 10, 64), M.metal, 0, 1.68, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    g.add(mesh(new THREE.SphereGeometry(0.035, 16, 12), M.teal, 0, 2.02, 0));
    var rack = new THREE.Group();
    g.add(rack);
    var hit = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.1, 16), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 1.05;
    g.add(hit);
    var sec = { id: def.id, short: def.short, group: g, rack: rack, hit: hit, kind: 'ring', radius: R, railY: 1.69, mode: 'overview' };
    addGarments(sec, ringPlace);
    makePin(sec, def.title, def.sub, new THREE.Vector3(def.x, 2.25, def.z));
    sec.view = function () {
      return { pos: new THREE.Vector3(def.x, 1.42, def.z + R + 1.6), look: new THREE.Vector3(def.x, 1.22, def.z + R * 0.5) };
    };
    sec.spot = function (k) {
      var a = Math.PI * 0.5 * (k % 2 ? 1 : -1) + (k >> 1) * 0.5 * (k % 2 ? 1 : -1);
      return { x: def.x + Math.sin(a) * 1.05, z: def.z + Math.cos(a) * 1.05, face: Math.atan2(-Math.sin(a), -Math.cos(a)) };
    };
    sections.push(sec);
    return { x: def.x, z: def.z, r: 0.7 };
  }

  var registerScreen = null;
  function till() {
    var g = new THREE.Group();
    g.position.set(0, 0, -4.75);
    scene.add(g);
    g.add(mesh(rbox(1.7, 0.92, 0.58, 0.05), M.white, 0, 0.46, 0));
    g.add(mesh(rbox(1.72, 0.08, 0.6, 0.04), M.teal, 0, 0.08, 0.005));
    g.add(mesh(rbox(1.82, 0.05, 0.7, 0.025), M.sand, 0, 0.945, 0));
    var reg = new THREE.Group(); reg.position.set(0.35, 0.97, -0.02); g.add(reg);
    reg.add(mesh(rbox(0.42, 0.13, 0.34, 0.04), M.teal, 0, 0.065, 0));
    var keys = mesh(rbox(0.36, 0.05, 0.16, 0.02), M.white, 0, 0.15, 0.06);
    keys.rotation.x = -0.4;
    reg.add(keys);
    var scr = new THREE.Group(); scr.position.set(0, 0.32, -0.08); scr.rotation.x = -0.15; reg.add(scr);
    scr.add(mesh(rbox(0.26, 0.16, 0.03, 0.02), M.tealDark, 0, 0, 0));
    var sc = TX.canvas(256, 160);
    registerScreen = { canvas: sc, tex: TX.tex(sc) };
    var sm = plane(0.23, 0.134, new THREE.MeshBasicMaterial({ map: registerScreen.tex }));
    sm.position.z = 0.016;
    scr.add(sm);
    reg.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 10), M.metal, 0, 0.19, -0.08));
    g.add(mesh(rbox(0.26, 0.3, 0.14, 0.01), M.sand, -0.55, 1.12, -0.05));
    g.add(mesh(rbox(0.22, 0.24, 0.12, 0.01), std('#d9c7ad', 0.8), -0.32, 1.09, 0.02));
    var hit = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.6, 1.0), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 0.8;
    g.add(hit);
    var sec = { id: 'casa', short: 'Casa de marcat', group: g, rack: new THREE.Group(), hit: hit, kind: 'till', items: [], count: 0 };
    makePin(sec, 'CASA', 'plătești aici', new THREE.Vector3(0, 1.7, -4.75));
    sec.view = function () { return { pos: new THREE.Vector3(0.3, 1.6, -3.5), look: new THREE.Vector3(0.3, 0.8, -4.85) }; };
    sec.spot = function (k) { return { x: -0.6 + k * 0.45, z: -3.9 - (k % 2) * 0.25, face: Math.PI }; };
    sections.push(sec);
    drawRegister();
    return { x: 0, z: -4.75, r: 1.0 };
  }
  function drawRegister() {
    if (!registerScreen) return;
    var g = registerScreen.canvas.getContext('2d'), w = 256, h = 160;
    g.fillStyle = '#0f2a2e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#8ff0d4';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 26px ' + TX.F.ui;
    g.fillText(cart.length + (cart.length === 1 ? ' produs' : ' produse'), w / 2, 48);
    g.font = '800 46px ' + TX.F.display;
    g.fillText(cartTotal() + ' LEI', w / 2, 104);
    registerScreen.tex.needsUpdate = true;
  }

  var obstacles = [];
  function buildShop() {
    [
      { id: 'tf', side: -1, z: -2.0, title: 'TRICOURI', sub: 'femei', short: 'Tricouri femei' },
      { id: 'rf', side: -1, z: -4.55, title: 'ROCHII', sub: 'și fuste', short: 'Rochii & fuste' },
      { id: 'bf', side: -1, z: -7.1, title: 'BLUGI', sub: 'femei', short: 'Blugi femei' },
      { id: 'tb', side: 1, z: -2.0, title: 'TRICOURI', sub: 'bărbați', short: 'Tricouri bărbați' },
      { id: 'cb', side: 1, z: -4.55, title: 'CĂMĂȘI', sub: 'bărbați', short: 'Cămăși bărbați' },
      { id: 'pb', side: 1, z: -7.1, title: 'PANTALONI', sub: 'bărbați', short: 'Pantaloni bărbați' },
      { id: 'gh', side: 0, x: 0, w: 2.6, title: 'GECI', sub: 'și hanorace', short: 'Geci & hanorace' }
    ].forEach(wallUnit);
    obstacles.push(stand({ id: 'red', x: 0, z: -2.7, title: 'REDUCERI', sub: 'stand', short: 'Reduceri' }));
    obstacles.push(till());
    obstacles.push(stand({ id: 'nou', x: 0, z: -6.35, title: 'NOUTĂȚI', sub: 'stand', short: 'Noutăți' }));
    var order = ['tb', 'tf', 'red', 'casa', 'cb', 'rf', 'nou', 'pb', 'bf', 'gh'];
    sections.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
  }
  function secById(id) { return sections.filter(function (s) { return s.id === id; })[0] || null; }

  /* ---------------- live visitors (room capability) ---------------- */
  var room = null, myAt = 'usa';
  function spotFor(at, k) {
    var s = secById(at);
    if (s) return s.spot(k);
    return { x: ((k % 3) - 1) * 0.6, z: -0.95 - (k / 3 | 0) * 0.45, face: Math.PI };
  }
  function ensureFigure(key, isMe) {
    if (figures[key]) return figures[key];
    var p = FIG.person(isMe);
    scene.add(p.root);
    var w = new FIG.Walker(p, obstacles);
    w.place(spotFor('intrare', Object.keys(figures).length));
    figures[key] = { walker: w, at: null, isMe: isMe };
    return figures[key];
  }
  function assign(key, at) {
    var f = figures[key];
    if (!f || f.at === at) return;
    f.at = at;
    var where = at === 'usa' ? 'intrare' : at;
    var same = Object.keys(figures).filter(function (k) { return (figures[k].at === 'usa' ? 'intrare' : figures[k].at) === where; }).indexOf(key);
    f.walker.setTarget(spotFor(where, Math.max(0, same)));
  }
  function setMyAt(at) {
    myAt = at;
    assign('me', at);
    if (room) room.presence({ at: at }).catch(function () {});
  }
  function syncPeers(peers) {
    var seen = { me: true };
    peers.forEach(function (p) {
      if (p.kind !== 'viewer' || (p.isMe && p.sameTab)) return;
      seen[p.peer] = true;
      ensureFigure(p.peer, false);
      var at = p.presence && typeof p.presence.at === 'string' ? p.presence.at : 'intrare';
      if (at !== 'usa' && at !== 'intrare' && !secById(at)) at = 'intrare';
      assign(p.peer, at);
    });
    Object.keys(figures).forEach(function (k) {
      if (!seen[k]) { scene.remove(figures[k].walker.p.root); delete figures[k]; }
    });
    var n = Object.keys(figures).length;
    $('live-count').textContent = n === 1 ? 'Doar tu în magazin acum' : n + ' oameni în magazin acum';
  }
  function connectRoom() {
    ensureFigure('me', true);
    setMyAt('usa');
    syncPeers([]);
    if (!window.claude || typeof window.claude.use !== 'function') return;
    window.claude.use('room').then(function (r) {
      if (!r) return;
      room = r;
      r.onPeers(function (ch) { syncPeers(ch.peers); }, function () { room = null; });
      r.presence({ at: myAt }).catch(function () {});
    }).catch(function () {});
  }

  /* ---------------- cart ---------------- */
  var cart = [];
  try { cart = JSON.parse(sessionStorage.getItem('umeras-cart') || '[]'); } catch (e) { cart = []; }
  function saveCart() { try { sessionStorage.setItem('umeras-cart', JSON.stringify(cart)); } catch (e) { /* ignore */ } }
  function cartTotal() { return cart.reduce(function (s, id) { var p = CATALOG.get(id); return s + (p ? p.price : 0); }, 0); }
  function updateCartUI() {
    cartCount.textContent = cart.length;
    cartCount.hidden = cart.length === 0;
    cartBtn.setAttribute('aria-label', 'Coșul tău: ' + cart.length + ' produse, ' + cartTotal() + ' lei');
    drawRegister();
  }
  function addToCart(p) {
    if (cart.indexOf(p.id) >= 0) return;
    cart.push(p.id);
    saveCart();
    updateCartUI();
    toast('Adăugat în coș · ' + p.price + ' lei');
    cartBtn.classList.add('is-bump');
    setTimeout(function () { cartBtn.classList.remove('is-bump'); }, 500);
  }
  // sold items stay off the shelves for this visit
  var sold = [];
  try { sold = JSON.parse(sessionStorage.getItem('umeras-sold') || '[]'); } catch (e) { sold = []; }
  function renderCasa() { CHECKOUT.render(); }
  CHECKOUT.init();
  CHECKOUT.on({
    items: function () { return cart.map(function (id) { return CATALOG.get(id); }).filter(Boolean); },
    remove: function (id) { cart = cart.filter(function (x) { return x !== id; }); saveCart(); updateCartUI(); },
    done: function (ids) {
      sold = sold.concat(ids);
      try { sessionStorage.setItem('umeras-sold', JSON.stringify(sold)); } catch (e) { /* ignore */ }
      cart = []; saveCart(); updateCartUI(); renderCasa();
      toast('Mulțumim! Comanda ta (demo) e plasată.');
    }
  });

  var toastTimer = null;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.hidden = false;
    toastEl.classList.remove('is-out');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add('is-out'); setTimeout(function () { toastEl.hidden = true; }, 300); }, 2400);
  }

  /* ---------------- tweens ---------------- */
  var tweens = [];
  function tween(dur, fn, opts) {
    opts = opts || {};
    return new Promise(function (res) {
      tweens.push({ t: -(opts.delay || 0), dur: reduce ? Math.min(dur, 0.3) : dur, fn: fn, ease: opts.ease || ease, res: res });
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
  function flyTo(pos, look, fov, dur, opts) {
    var p0 = camera.position.clone(), l0 = camLook.clone(), f0 = camera.fov;
    var arc = (opts && opts.arc) || 0;
    return tween(dur, function (e) {
      camera.position.lerpVectors(p0, pos, e);
      camera.position.y += Math.sin(e * Math.PI) * arc;
      camLook.lerpVectors(l0, look, e);
      if (fov) { camera.fov = f0 + (fov - f0) * e; camera.updateProjectionMatrix(); }
    }, opts);
  }

  /* ---------------- views ---------------- */
  var state = 'loading';  // loading | intro | door | moving | overview | section | product
  var current = null;

  /* Top view: fit the floor plan (walls are lowered in this view) between the top bar and the
     chips, then shift the aim so the plan sits in the middle of that free band. */
  function overviewPose() {
    var fov = 30;
    var phone = camera.aspect < 1;
    var yaw = 0, pitch = phone ? 1.2 : 1.0;
    var dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).normalize();
    var pts = [];
    [-ROOM.x - 0.18, ROOM.x + 0.18].forEach(function (x) { [0, 0.6].forEach(function (y) { [ROOM.z0 + 0.3, ROOM.z1 - 0.18].forEach(function (z) { pts.push(new THREE.Vector3(x, y, z)); }); }); });
    sections.forEach(function (s) {
      if (!s.pin) return;
      var half = s.pin.userData.base * 0.36;
      [-half, half].forEach(function (dx) { pts.push(s.pin.position.clone().add(new THREE.Vector3(dx, 1.1, 0))); });
    });
    var H = window.innerHeight || 800;
    var topPx = 76, botPx = 76;                      // top bar and chips
    var yTop = 1 - 2 * topPx / H, yBot = -1 + 2 * botPx / H;
    var side = phone ? 0.96 : 0.9;
    var cam = camera.clone();
    cam.fov = fov; cam.updateProjectionMatrix();
    var target = new THREE.Vector3(0, 0.3, (ROOM.z0 + ROOM.z1) / 2);
    function fit() {
      var lo = 3, hi = 90;
      for (var it = 0; it < 30; it++) {
        var d = (lo + hi) / 2;
        cam.position.copy(target).addScaledVector(dir, d); cam.lookAt(target); cam.updateMatrixWorld();
        var ok = pts.every(function (p) { var v = p.clone().project(cam); return Math.abs(v.x) < side && v.y < yTop - 0.02 && v.y > yBot + 0.02; });
        if (ok) hi = d; else lo = d;
      }
      cam.position.copy(target).addScaledVector(dir, hi); cam.lookAt(target); cam.updateMatrixWorld();
      return hi;
    }
    for (var pass = 0; pass < 3; pass++) {
      var d = fit();
      var minY = 9, maxY = -9, minX = 9, maxX = -9;
      pts.forEach(function (p) { var v = p.clone().project(cam); minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y); minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x); });
      var wantY = (yTop + yBot) / 2, gotY = (minY + maxY) / 2, gotX = (minX + maxX) / 2;
      var halfH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * d;
      var up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
      var right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
      target.addScaledVector(up, (gotY - wantY) * halfH).addScaledVector(right, gotX * halfH * cam.aspect);
    }
    var dist = fit();
    return { pos: target.clone().addScaledVector(dir, dist), look: target.clone(), fov: fov };
  }

  function setInterior(atDoor) {
    roomMeshes.ceiling.visible = atDoor;
    roomMeshes.lamps.visible = atDoor;
    front.group.visible = atDoor;
  }
  var wallH = 1;
  function setWalls(h, dur) {
    var h0 = wallH;
    wallH = h;
    return tween(dur || 0.8, function (e) { roomMeshes.walls.scale.y = h0 + (h - h0) * e; });
  }
  function showPins(on) { sections.forEach(function (s) { s.pin.visible = on; }); }
  function setUI(mode) {
    topbar.hidden = !(mode === 'overview' || mode === 'section');
    chipsEl.hidden = mode !== 'overview';
    $('live-pill').hidden = mode !== 'overview';
    secUI.hidden = mode !== 'section';
    CHECKOUT.show(mode === 'section' && current && current.id === 'casa');
  }

  function enterShop() {
    if (state !== 'door') return;
    state = 'moving';
    showHint(false);
    chime();
    tween(1.5, function (e) { door.pivot.rotation.y = 1.45 * e; }, { delay: 0.1 });
    flyTo(new THREE.Vector3(0, 1.5, -1.1), new THREE.Vector3(0, 1.4, -6), 50, 2.0, { delay: 0.4 }).then(function () {
      setInterior(false);
      setMyAt('intrare');
      var o = overviewPose();
      return flyTo(o.pos, o.look, o.fov, 2.2);
    }).then(toOverviewDone);
  }
  function skipIntro() {
    if (state !== 'door') return;
    state = 'moving';
    showHint(false);
    curtain(true).then(function () {
      door.pivot.rotation.y = 1.45;
      setInterior(false);
      var o = overviewPose();
      camera.position.copy(o.pos); camLook.copy(o.look);
      camera.fov = o.fov; camera.updateProjectionMatrix();
      setMyAt('intrare');
      return curtain(false);
    }).then(toOverviewDone);
  }
  var firstOverview = true;
  function toOverviewDone() {
    state = 'overview';
    setWalls(0.2, 0.9);
    current = null;
    showPins(true);
    sections.forEach(function (s) { s.mode = 'overview'; s.offset = s.target = 0; });
    setUI('overview');
    markChip(null);
    if (firstOverview) { firstOverview = false; toast('Atinge un raft ca să mergi la el'); }
  }
  function openSection(sec) {
    if (!sec || (state !== 'overview' && state !== 'section')) return;
    state = 'moving';
    current = sec;
    showPins(false);
    setUI('none');
    sections.forEach(function (s) { s.mode = s === sec ? 'section' : 'overview'; s.offset = s.target = 0; });
    setMyAt(sec.id);
    markChip(sec.id);
    setWalls(1, 1.2);
    var v = sec.view();
    flyTo(v.pos, v.look, camera.aspect < 1 ? 52 : 46, 1.6, { arc: 0.6 }).then(function () {
      state = 'section';
      $('sec-title').textContent = sec.short;
      if (sec.id === 'casa') renderCasa();
      setUI('section');
      updateSectionUI();
    });
  }
  function backToOverview() {
    if (state !== 'section') return;
    state = 'moving';
    setUI('none');
    var o = overviewPose();
    flyTo(o.pos, o.look, o.fov, 1.5, { arc: 0.4 }).then(function () { setMyAt('intrare'); toOverviewDone(); });
  }
  function leaveShop() {
    if (state !== 'overview' && state !== 'section') return;
    state = 'moving';
    setUI('none');
    showPins(false);
    setInterior(true);
    setWalls(1, 0.8);
    door.pivot.rotation.y = 1.45;
    setMyAt('usa');
    flyTo(camHome.clone(), DOOR_LOOK.clone(), 35, 2.2).then(function () {
      return tween(1.2, function (e) { door.pivot.rotation.y = 1.45 * (1 - e); });
    }).then(function () { state = 'door'; showHint(true); });
  }

  function centerIndex(sec) {
    var n = sec.count || 0;
    if (!n) return -1;
    return sec.kind === 'ring' ? ((Math.round(sec.target) % n) + n) % n : clamp(Math.round(sec.target), 0, n - 1);
  }
  function stepSection(d) {
    if (state !== 'section' || !current || !current.count) return;
    if (current.kind === 'ring') current.target = Math.round(current.target) + d;
    else current.target = clamp(Math.round(current.target) + d, 0, current.count - 1);
    updateSectionUI();
  }
  function updateSectionUI() {
    var sec = current; if (!sec) return;
    var n = sec.count || 0, i = centerIndex(sec), isTill = sec.kind === 'till';
    $('sec-prev').hidden = isTill || n < 2;
    $('sec-next').hidden = isTill || n < 2;
    $('sec-open').hidden = isTill || n === 0;
    $('sec-count').textContent = isTill ? '' : n ? (i + 1) + ' din ' + n : 'Raftul e gol';
    if (sec.kind === 'rail') { $('sec-prev').disabled = i <= 0; $('sec-next').disabled = i >= n - 1; }
    else { $('sec-prev').disabled = false; $('sec-next').disabled = false; }
    var g = visibleItems(sec)[i];
    $('sec-open').textContent = g ? 'Vezi de aproape · ' + g.userData.product.price + ' lei' : 'Vezi de aproape';
  }
  function openProduct(g) {
    if (state !== 'section' || !g) return;
    state = 'product';
    setUI('none');
    if (!STAGE.show(g.userData.product)) { state = 'section'; setUI('section'); }
  }
  function closeProduct() {
    if (state !== 'product') return;
    STAGE.hide().then(function () {
      state = 'section';
      if (current && current.kind === 'rail') current.target = current.offset = clamp(current.target, 0, Math.max(0, visibleItems(current).length - 1));
      setUI('section');
      updateSectionUI();
    });
  }
  STAGE.on({
    inCart: function (id) { return cart.indexOf(id) >= 0; },
    onBack: closeProduct,
    onAdd: function (p) { addToCart(p); setTimeout(closeProduct, 1000); }
  });

  /* ---------------- chips ---------------- */
  function buildChips() {
    sections.forEach(function (sec) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = sec.short;
      b.dataset.id = sec.id;
      b.addEventListener('click', function () { openSection(sec); });
      chipsEl.appendChild(b);
    });
  }
  function markChip(id) {
    Array.prototype.forEach.call(chipsEl.children, function (c) { c.classList.toggle('is-on', c.dataset.id === id); });
  }

  /* ---------------- misc UI ---------------- */
  var curtainEl = document.createElement('div');
  curtainEl.className = 'curtain';
  document.body.appendChild(curtainEl);
  function curtain(on) {
    curtainEl.classList.toggle('is-on', on);
    return new Promise(function (r) { setTimeout(r, reduce ? 40 : 460); });
  }
  var actx = null;
  function chime() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var now = actx.currentTime;
      [[1318.5, 0], [1046.5, 0.16]].forEach(function (n) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, now + n[1]);
        g.gain.exponentialRampToValueAtTime(0.06, now + n[1] + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + n[1] + 1.3);
        o.connect(g); g.connect(actx.destination);
        o.start(now + n[1]); o.stop(now + n[1] + 1.4);
      });
    } catch (e) { /* optional */ }
  }
  var hintOn = false;
  function showHint(on) {
    hintOn = on;
    if (on) { hintEl.hidden = false; requestAnimationFrame(function () { hintEl.classList.remove('is-fading'); }); }
    else { hintEl.classList.add('is-fading'); setTimeout(function () { if (!hintOn) hintEl.hidden = true; }, 300); }
  }
  var lastFocus = null;
  function openLegal() {
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
  function rayAt(x, y) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((x - r.left) / r.width) * 2 - 1;
    ndc.y = -((y - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
  }
  function pickDoor(x, y) {
    rayAt(x, y);
    var hits = ray.intersectObjects(doorItems.map(function (d) { return d.mesh; }), false);
    if (!hits.length) return null;
    return doorItems.filter(function (d) { return d.mesh === hits[0].object; })[0];
  }
  function pickSection(x, y) {
    rayAt(x, y);
    var hp = ray.intersectObjects(sections.map(function (s) { return s.pin; }), false);
    if (hp.length) return sections.filter(function (s) { return s.pin === hp[0].object; })[0];
    var hits = ray.intersectObjects(sections.map(function (s) { return s.hit; }), false);
    if (!hits.length) return null;
    return sections.filter(function (s) { return s.hit === hits[0].object; })[0];
  }
  function pickGarment(x, y) {
    if (!current) return null;
    rayAt(x, y);
    var meshes = [];
    visibleItems(current).forEach(function (g) { if (g.userData.mesh) meshes.push(g.userData.mesh); });
    var hits = ray.intersectObjects(meshes, false);
    return hits.length ? hits[0].object.userData.garmentRoot : null;
  }
  function shortest(a, b, n) { var d = b - a; if (d > n / 2) d -= n; if (d < -n / 2) d += n; return d; }

  var drag = null, hovered = null;
  canvas.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, lx: e.clientX, moved: 0, t0: performance.now(), base: current ? current.target : 0 };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (drag) {
      drag.moved += Math.abs(e.clientX - drag.lx);
      drag.lx = e.clientX;
      if (state === 'section' && current && current.kind !== 'till' && Math.abs(e.clientX - drag.x) > 8) {
        var per = current.kind === 'ring' ? 110 : 130;
        var tgt = drag.base - (e.clientX - drag.x) / per;
        current.target = current.kind === 'ring' ? tgt : clamp(tgt, -0.35, (current.count || 1) - 0.65);
      }
      return;
    }
    if (e.pointerType !== 'mouse') return;
    var h = null;
    if (state === 'door') h = pickDoor(e.clientX, e.clientY);
    else if (state === 'overview') h = pickSection(e.clientX, e.clientY);
    else if (state === 'section') h = pickGarment(e.clientX, e.clientY);
    if (h !== hovered) {
      if (hovered && hovered.hover !== undefined) hovered.hover = false;
      if (hovered && hovered.pin) hovered.pin.userData.hot = false;
      hovered = h;
      if (h && h.hover !== undefined) h.hover = true;
      if (h && h.pin) h.pin.userData.hot = true;
      canvas.classList.toggle('is-pointer', !!h);
    }
  });
  canvas.addEventListener('pointerup', function (e) {
    if (!drag) return;
    var d = drag; drag = null;
    var tap = d.moved < 10 && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10;
    if (state === 'section' && current && !tap && current.kind !== 'till') {
      var vx = (e.clientX - d.x) / Math.max(60, performance.now() - d.t0);
      var t = Math.round(current.target - vx * 0.9);
      current.target = current.kind === 'ring' ? t : clamp(t, 0, (current.count || 1) - 1);
      updateSectionUI();
      return;
    }
    if (!tap) return;
    if (state === 'door') { var di = pickDoor(e.clientX, e.clientY); if (di) di.action(); }
    else if (state === 'overview') { var s = pickSection(e.clientX, e.clientY); if (s) openSection(s); }
    else if (state === 'section') {
      var g = pickGarment(e.clientX, e.clientY);
      if (g) {
        var vis = visibleItems(current), i = vis.indexOf(g), ci = centerIndex(current);
        if (i === ci) openProduct(g);
        else { current.target = current.kind === 'ring' ? Math.round(current.target) + shortest(ci, i, vis.length) : i; updateSectionUI(); }
      }
    }
  });
  canvas.addEventListener('pointercancel', function () { drag = null; });
  var wheelLock = 0;
  canvas.addEventListener('wheel', function (e) {
    if (state !== 'section') return;
    e.preventDefault();
    var now = performance.now();
    if (now - wheelLock < 260) return;
    if (Math.abs(e.deltaX) + Math.abs(e.deltaY) > 8) { wheelLock = now; stepSection((Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) > 0 ? 1 : -1); }
  }, { passive: false });
  document.addEventListener('keydown', function (e) {
    if (STAGE.isOpen() || STAGE.lightboxOpen() || CHECKOUT.isOpen()) return;
    if (e.key === 'Escape') {
      if (!legalEl.hidden) closeLegal();
      else if (state === 'section') backToOverview();
      return;
    }
    if (state === 'section' && !(e.target && e.target.tagName === 'BUTTON')) {
      if (e.key === 'ArrowLeft') { stepSection(-1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { stepSection(1); e.preventDefault(); }
    }
  });

  $('legal-close').addEventListener('click', closeLegal);
  legalEl.addEventListener('click', function (e) { if (e.target === legalEl) closeLegal(); });
  $('kbd-enter').addEventListener('click', enterShop);
  $('kbd-skip').addEventListener('click', skipIntro);
  $('kbd-legal').addEventListener('click', openLegal);
  $('exit-btn').addEventListener('click', leaveShop);
  $('sec-back').addEventListener('click', backToOverview);
  $('sec-prev').addEventListener('click', function () { stepSection(-1); });
  $('sec-next').addEventListener('click', function () { stepSection(1); });
  $('sec-open').addEventListener('click', function () { openProduct(visibleItems(current)[centerIndex(current)]); });
  cartBtn.addEventListener('click', function () { openSection(secById('casa')); });

  /* ---------------- layout ---------------- */
  function fitDoor() {
    var t = Math.tan(THREE.MathUtils.degToRad(35 / 2));
    var halfW = 0.64, halfH = 1.24;
    return Math.max(halfH / t, halfW / (t * camera.aspect));
  }
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camHome.set(0, 1.32, ROOM.z0 + 0.2 + fitDoor());
    sections.forEach(function (sc) { if (sc.pin) sc.pin.userData.base = camera.aspect < 1 ? 2.0 : 1.8; });
    if (state === 'door') camera.position.copy(camHome);
    if (state === 'overview') {
      var o = overviewPose();
      camera.position.copy(o.pos); camLook.copy(o.look);
      camera.fov = o.fov; camera.updateProjectionMatrix();
    }
  }
  window.addEventListener('resize', resize);

  var tmp = new THREE.Vector3();
  function placeHint() {
    if (hintEl.hidden) return;
    door.handle.localToWorld(tmp.set(0, -0.36, 0.09));
    tmp.project(camera);
    var x = (tmp.x + 1) / 2 * window.innerWidth, y = (1 - tmp.y) / 2 * window.innerHeight;
    var w = hintEl.offsetWidth;
    var left = clamp(x - w + 26, 10, window.innerWidth - w - 10);
    hintEl.style.transform = 'translate(' + left.toFixed(1) + 'px,' + (y + 8).toFixed(1) + 'px)';
    hintEl.style.setProperty('--arrow-x', (x - left).toFixed(1) + 'px');
  }

  /* ---------------- loop ---------------- */
  var clock = new THREE.Clock(), time = 0;
  function frame() {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, clock.getDelta());
    time += dt;
    if (state === 'product') return;   // shop frozen and blurred behind the product
    runTweens(dt);
    for (var i = 0; i < animated.length; i++) animated[i](time, dt);
    Object.keys(figures).forEach(function (k) {
      var f = figures[k];
      f.walker.update(dt);
      var near = (state === 'section' || state === 'moving') && f.walker.p.root.position.distanceTo(camera.position) < 1.9;
      f.walker.p.root.visible = !near && !(f.isMe && (state === 'door' || state === 'intro' || state === 'section' || myAt === 'usa'));
    });
    sections.forEach(function (s) {
      if (!s.place) return;
      s.offset += (s.target - s.offset) * Math.min(1, dt * 7);
      s.place(s, dt);
      s.items.forEach(function (g) { if (g.visible && g.userData.body) FIG.swing(g, dt, g.userData.push || 0, time); });
      if (s.pin.visible) {
        var k = 1 + Math.sin(time * 2.4 + s.pin.position.z) * 0.035 + (s.pin.userData.hot ? 0.08 : 0);
        s.pin.scale.set(s.pin.userData.base * k, s.pin.userData.base * k * 360 / 640, 1);
      }
    });
    if (state === 'section' && current && current.kind !== 'till') {
      var ci = centerIndex(current);
      if (ci !== current.lastCi) { current.lastCi = ci; updateSectionUI(); }
    }
    if (state === 'door') {
      camera.position.set(camHome.x + Math.sin(time * 0.3) * 0.015, camHome.y + Math.sin(time * 0.4) * 0.01, camHome.z);
      camLook.copy(DOOR_LOOK);
    }
    camera.lookAt(camLook);
    placeHint();
    renderer.render(scene, camera);
  }

  /* ---------------- boot ---------------- */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var faces = ['800 60px "Bricolage Grotesque"', '700 40px "Caveat"', '700 30px "Manrope"', '600 30px "Manrope"'];
    var all = Promise.all(faces.map(function (f) { return document.fonts.load(f, 'UMERAȘ ăâîșț'); }));
    return Promise.race([all, new Promise(function (r) { setTimeout(r, 2500); })]).catch(function () {});
  }

  fontsReady().then(function () {
    materials();
    buildEnv();
    buildLights();
    buildRoom();
    buildFront();
    buildShop();
    buildChips();
    updateCartUI();
    showPins(false);
    setInterior(true);
    resize();
    connectRoom();
    camera.fov = 35;
    camera.position.set(0, 1.45, camHome.z + 1.4);
    camLook.copy(DOOR_LOOK);
    camera.updateProjectionMatrix();
    state = 'intro';
    requestAnimationFrame(frame);
    loader.classList.add('is-done');
    setTimeout(function () { loader.hidden = true; }, 700);
    var from = camera.position.clone();
    tween(reduce ? 0.01 : 1.5, function (e) { camera.position.lerpVectors(from, camHome, e); }, { ease: easeOut }).then(function () {
      state = 'door';
      showHint(true);
    });
  });

  // hooks for automated checks
  window.__umeras = {
    state: function () { return state; },
    enter: enterShop, skip: skipIntro, leave: leaveShop,
    open: function (id) { openSection(secById(id)); },
    back: backToOverview, step: stepSection,
    product: function () { if (current) openProduct(visibleItems(current)[centerIndex(current)]); },
    figs: function () { return Object.keys(figures).map(function (k) { var w = figures[k].walker, r = w.p.root.position; return [k, figures[k].at, +r.x.toFixed(2), +r.z.toFixed(2), w.state, w.target && +w.target.x.toFixed(2), w.target && +w.target.z.toFixed(2)]; }); },
    fakePeers: function (n) {
      var list = [];
      for (var i = 0; i < n; i++) list.push({ kind: 'viewer', peer: 'p' + i, isMe: false, sameTab: false, presence: { at: ['tb', 'red', 'rf', 'casa', 'gh', 'intrare'][i % 6] } });
      syncPeers(list);
    }
  };
})();
