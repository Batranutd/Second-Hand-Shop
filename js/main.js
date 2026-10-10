/* UMERAȘ: the shop door (step 1) and the aisle with shelves, stands and the till (step 2). */
(function () {
  'use strict';

  var P = window.PARTS, TX = window.TX;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  var canvas = $('scene'), loader = $('loader'), hintEl = $('hint'), legalEl = $('legal');
  var aisleUI = $('aisle-ui'), chipsEl = $('chips'), focusEl = $('focus'), gestureEl = $('gesture'), vignette = $('vignette');

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
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d0908');

  var camera = new THREE.PerspectiveCamera(35, 1, 0.05, 60);
  var DOOR_FOV = 35;
  var DOOR_LOOK = new THREE.Vector3(0, 1.36, 0);
  var camHome = new THREE.Vector3(0, 1.42, 6);
  var camLook = DOOR_LOOK.clone();

  var clickables = [];   // door items
  var sections = [];     // aisle items
  var animated = [];
  var walkers = [];
  var door = {};

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
    var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.0005, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 4 });
    g.center();
    RB[key] = g;
    return g;
  }
  function mesh(geo, m, x, y, z, o) {
    var me = new THREE.Mesh(geo, m);
    me.position.set(x || 0, y || 0, z || 0);
    if (!o || o.cast !== false) me.castShadow = true;
    if (!o || o.receive !== false) me.receiveShadow = true;
    return me;
  }
  function std(color, o) {
    o = o || {};
    return new THREE.MeshStandardMaterial({
      color: color, roughness: o.rough != null ? o.rough : 0.6, metalness: o.metal || 0,
      map: o.map || null, bumpMap: o.bump || null, bumpScale: o.bumpScale || 1,
      emissive: o.emissive || '#000000', emissiveMap: o.emissiveMap || null, emissiveIntensity: o.ei != null ? o.ei : 1,
      transparent: !!o.transparent, opacity: o.opacity != null ? o.opacity : 1, alphaTest: o.alphaTest || 0,
      side: o.side || THREE.FrontSide, depthWrite: o.depthWrite !== false
    });
  }
  function plane(w, h, m) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var MAT = {};
  function materials() {
    MAT.brass = P.brass();
    MAT.paint = std('#155a5f', { rough: 0.38, map: TX.wood([1, 1], '#ffffff', 40) });
    MAT.cream = std('#efe2c9', { rough: 0.45, map: TX.wood([1, 1], '#ffffff', 30) });
    MAT.wood = std('#c48d5e', { rough: 0.5, map: TX.wood([1, 1]) });
    MAT.darkWood = std('#6e4a31', { rough: 0.55, map: TX.wood([1, 1]) });
    MAT.glass = new THREE.MeshPhysicalMaterial({
      color: '#d9f1ee', transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0.15,
      envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false
    });
    var br = TX.brick();
    br.map.repeat.set(1.04, 1.04); br.bump.repeat.set(1.04, 1.04);
    MAT.brick = std('#ffffff', { map: br.map, bump: br.bump, bumpScale: 0.018, rough: 0.92 });
    MAT.stone = std('#9a9184', { rough: 0.88, map: TX.plaster([2, 1]) });
    MAT.street = std('#2a221d', { rough: 0.95, map: TX.plaster([6, 4]) });
  }

  /* ---------------- environment + lights ---------------- */
  function buildEnv() {
    var pm = new THREE.PMREMGenerator(renderer);
    var env = new THREE.Scene();
    env.background = new THREE.Color('#1a1412');
    var g = new THREE.BoxGeometry(1, 1, 1);
    function lamp(col, k, pos, sc) {
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k) }));
      m.position.fromArray(pos); m.scale.fromArray(sc); env.add(m);
    }
    lamp('#ffd9a8', 1.2, [0, 2, -6], [8, 3, 0.1]);
    lamp('#ffe2b8', 0.8, [0, 7, 0], [5, 0.1, 5]);
    lamp('#7f95d8', 0.4, [-6, 3, 4], [0.1, 4, 6]);
    lamp('#ffb070', 0.45, [6, 2, 3], [0.1, 2, 3]);
    scene.environment = pm.fromScene(env, 0.05).texture;
    pm.dispose();
  }

  function buildLights() {
    scene.add(new THREE.HemisphereLight('#a7b6ff', '#3a2618', 0.16));

    // the warm lamp above the door (out of frame) — the only light outside
    var spot = new THREE.SpotLight('#ffd3a0', 1.9, 14, 0.36, 1, 1.1);
    spot.position.set(0.35, 4.7, 3.6);
    spot.target.position.set(0, 1.25, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    spot.shadow.bias = -0.0004;
    spot.shadow.normalBias = 0.015;
    spot.shadow.camera.near = 1.5;
    spot.shadow.camera.far = 12;
    scene.add(spot, spot.target);

    var fill = new THREE.DirectionalLight('#8aa0e8', 0.22);
    fill.position.set(-3, 2.5, 5);
    scene.add(fill);

    // interior key: a wide spot from the back of the shop toward the door, casting soft shadows
    var key = new THREE.SpotLight('#ffe7c8', 0.95, 20, 1.05, 0.7, 0.9);
    key.position.set(0.6, 3.45, -12.4);
    key.target.position.set(0, 0.2, -4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.03;
    scene.add(key, key.target);

    var spill = new THREE.PointLight('#ffd7a3', 0.4, 5, 2);
    spill.position.set(0, 2.1, -1.0);
    scene.add(spill);
  }

  /* ---------------- outside: brick, step, door casing ---------------- */
  function buildFront() {
    var s = new THREE.Shape();
    s.moveTo(-5, -0.12); s.lineTo(5, -0.12); s.lineTo(5, 6); s.lineTo(-5, 6); s.closePath();
    var h = new THREE.Path();
    h.moveTo(-0.64, 0); h.lineTo(-0.64, 2.56); h.lineTo(0.64, 2.56); h.lineTo(0.64, 0); h.closePath();
    s.holes.push(h);
    var geo = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: false });
    geo.translate(0, 0, -0.35);
    var wall = mesh(geo, MAT.brick);
    scene.add(wall);

    var street = mesh(new THREE.PlaneGeometry(10, 6), MAT.street, 0, -0.12, 3);
    street.rotation.x = -Math.PI / 2;
    scene.add(street);
    scene.add(mesh(rbox(1.95, 0.16, 0.5, 0.035), MAT.stone, 0, -0.06, 0.24));

    // casing
    var C = MAT.cream;
    scene.add(mesh(rbox(0.14, 2.72, 0.12, 0.02), C, -0.71, 1.36, 0.035));
    scene.add(mesh(rbox(0.14, 2.72, 0.12, 0.02), C, 0.71, 1.36, 0.035));
    scene.add(mesh(rbox(1.62, 0.2, 0.13, 0.025), C, 0, 2.68, 0.04));
    scene.add(mesh(rbox(1.86, 0.08, 0.2, 0.025), C, 0, 2.82, 0.07));
    scene.add(mesh(rbox(1.74, 0.05, 0.16, 0.02), C, 0, 2.885, 0.06));
    scene.add(mesh(rbox(0.19, 0.26, 0.15, 0.02), C, -0.71, 0.13, 0.045));
    scene.add(mesh(rbox(0.19, 0.26, 0.15, 0.02), C, 0.71, 0.13, 0.045));
    // keystone-ish brass house number plate above the door
    var badge = mesh(rbox(0.3, 0.12, 0.02, 0.02), MAT.brass, 0, 2.68, 0.11);
    scene.add(badge);
    // reveal lining
    scene.add(mesh(rbox(0.03, 2.56, 0.35, 0.005), C, -0.625, 1.28, -0.175));
    scene.add(mesh(rbox(0.03, 2.56, 0.35, 0.005), C, 0.625, 1.28, -0.175));
    scene.add(mesh(rbox(1.28, 0.03, 0.35, 0.005), C, 0, 2.545, -0.175));
    scene.add(mesh(rbox(1.25, 0.02, 0.36, 0.006), MAT.brass, 0, 0.01, -0.17));
  }

  var _streak = null;
  function addStreaks(parent, w, h) {
    _streak = _streak || TX.streak();
    var m = new THREE.MeshBasicMaterial({ map: _streak, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false });
    [[-0.2, 0.18], [0.14, 0.08]].forEach(function (s) {
      var p = plane(w * s[1] + 0.04, h * 0.95, m);
      p.rotation.z = -0.45;
      p.position.set(w * s[0], 0, 0.003);
      parent.add(p);
    });
  }

  /* ---------------- the door ---------------- */
  function buildDoor() {
    var W = 1.2, H = 2.5, T = 0.055;
    var pivot = new THREE.Group();
    pivot.position.set(-0.6, 0, -0.1);
    scene.add(pivot);
    door.pivot = pivot;
    var Pm = MAT.paint;

    pivot.add(mesh(rbox(0.12, H, T, 0.012), Pm, 0.06, H / 2, 0));
    pivot.add(mesh(rbox(0.12, H, T, 0.012), Pm, W - 0.06, H / 2, 0));
    pivot.add(mesh(rbox(0.97, 0.13, T, 0.012), Pm, W / 2, H - 0.065, 0));
    pivot.add(mesh(rbox(0.97, 0.15, T, 0.012), Pm, W / 2, 0.865, 0));
    pivot.add(mesh(rbox(0.97, 0.16, T, 0.012), Pm, W / 2, 0.08, 0));
    // lower raised panel
    pivot.add(mesh(rbox(0.97, 0.64, 0.03, 0.006), Pm, W / 2, 0.475, 0));
    pivot.add(mesh(rbox(0.8, 0.48, 0.042, 0.02), Pm, W / 2, 0.475, 0.004));
    // brass opening-hours plaque on the panel
    pivot.add(mesh(rbox(0.47, 0.21, 0.01, 0.008), MAT.brass, W / 2, 0.48, 0.028));
    var plaque = plane(0.45, 0.197, new THREE.MeshStandardMaterial({ map: TX.plaque(), metalness: 0.85, roughness: 0.32 }));
    plaque.position.set(W / 2, 0.48, 0.0335);
    pivot.add(plaque);
    // brass kick plate
    pivot.add(mesh(rbox(0.94, 0.12, 0.004, 0.002), MAT.brass, W / 2, 0.08, 0.029));
    // hinges
    [0.32, 1.25, 2.18].forEach(function (y) {
      var hg = mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.11, 14), MAT.brass, -0.004, y, 0.028);
      pivot.add(hg);
    });

    // glass + bead moulding
    var gw = 0.97, gh = 1.43, gy = 0.94 + gh / 2;
    var glass = plane(gw, gh, MAT.glass);
    glass.position.set(W / 2, gy, 0);
    pivot.add(glass);
    addStreaks(glass, gw, gh);
    [[gw, 0.022, W / 2, 0.951], [gw, 0.022, W / 2, 2.359], [0.022, gh, 0.131, gy], [0.022, gh, W - 0.131, gy]].forEach(function (b) {
      pivot.add(mesh(rbox(b[0], b[1], 0.02, 0.008), Pm, b[2], b[3], 0.028));
      pivot.add(mesh(rbox(b[0], b[1], 0.02, 0.008), Pm, b[2], b[3], -0.028));
    });

    // gold-leaf name on the glass
    var nameTex = TX.goldName();
    var name = plane(0.9, 0.3, new THREE.MeshStandardMaterial({ map: nameTex, metalness: 0.55, roughness: 0.28, transparent: true, depthWrite: false }));
    name.position.set(W / 2, 2.19, 0.003);
    pivot.add(name);

    // legal poster (clickable)
    var poster = plane(0.25, 0.35, new THREE.MeshStandardMaterial({ map: TX.legalPoster(), roughness: 0.9, transparent: true }));
    poster.position.set(0.31, 1.2, 0.005);
    poster.rotation.z = 0.035;
    pivot.add(poster);
    clickables.push({ mesh: poster, action: openLegal, hover: function (on) { poster.scale.setScalar(on ? 1.06 : 1); } });

    // skip-intro sticker (clickable)
    var sticker = plane(0.21, 0.21, new THREE.MeshStandardMaterial({ map: TX.skipSticker(), roughness: 0.35, transparent: true, alphaTest: 0.05 }));
    sticker.position.set(0.79, 1.15, 0.006);
    pivot.add(sticker);
    clickables.push({ mesh: sticker, action: skipIntro, hover: function (on) { sticker.scale.setScalar(on ? 1.1 : 1); } });

    // long brass pull handle (outside) and a matching one inside
    function pull(zSign) {
      var g = new THREE.Group();
      g.position.set(W - 0.06, 1.33, 0);
      var bar = mesh(new THREE.CapsuleGeometry(0.016, 0.6, 6, 16), MAT.brass, 0, 0, zSign * 0.085);
      g.add(bar);
      [-0.24, 0.24].forEach(function (y) {
        var st = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.06, 12), MAT.brass, 0, y, zSign * 0.056);
        st.rotation.x = Math.PI / 2;
        g.add(st);
        var rose = mesh(new THREE.CylinderGeometry(0.027, 0.03, 0.01, 20), MAT.brass, 0, y, zSign * 0.031);
        rose.rotation.x = Math.PI / 2;
        g.add(rose);
      });
      pivot.add(g);
      return g;
    }
    var handle = pull(1);
    pull(-1);
    door.handle = handle;
    var glowMat = MAT.brass.clone();
    door.handleMeshes = [];
    handle.traverse(function (n) { if (n.isMesh) { n.material = glowMat; door.handleMeshes.push(n); } });
    glowMat.emissive = new THREE.Color('#ffb84d');
    glowMat.emissiveIntensity = 0;

    var hit = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.22), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(-0.03, 0, 0.08);
    handle.add(hit);
    clickables.push({ mesh: hit, action: enterShop, hover: function (on) { glowMat.emissiveIntensity = on ? 0.35 : 0; } });

    var ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.ring(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    ring.position.set(0, 0, 0.1);
    handle.add(ring);
    animated.push(function (t) {
      var k = (t * 0.8) % 1;
      ring.scale.setScalar(0.2 + k * 0.4);
      ring.material.opacity = (1 - k) * 0.85 * (door.ringOn ? 1 : 0);
      glowMat.emissiveIntensity = Math.max(glowMat.emissiveIntensity * 0.9, door.ringOn ? 0.06 + 0.06 * Math.sin(t * 3) : 0);
    });

    // painted wooden OPEN sign hanging on twine inside the glass
    var hook = new THREE.Group();
    hook.position.set(W / 2, 2.0, -0.05);
    pivot.add(hook);
    var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.012, 16), new THREE.MeshStandardMaterial({ color: '#d8ecf0', transparent: true, opacity: 0.55, roughness: 0.1 }));
    cup.rotation.x = Math.PI / 2;
    cup.position.z = 0.02;
    hook.add(cup);
    var swing = new THREE.Group();
    hook.add(swing);
    var twine = P.mat('#c9a77a', 0.9);
    [-1, 1].forEach(function (sx) {
      var len = Math.hypot(0.17, 0.12);
      var c = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, len, 5), twine);
      c.position.set(sx * 0.085, -0.06, 0);
      c.rotation.z = sx * Math.atan2(0.17, 0.12);
      swing.add(c);
    });
    var flip = new THREE.Group();
    flip.position.y = -0.24;
    swing.add(flip);
    var board = mesh(rbox(0.44, 0.22, 0.018, 0.03), P.mat('#e9d6b2', 0.6), 0, 0, 0);
    flip.add(board);
    var front = plane(0.43, 0.215, new THREE.MeshStandardMaterial({ map: TX.openFront(), roughness: 0.65, transparent: true }));
    front.position.z = 0.0095;
    var back = plane(0.43, 0.215, new THREE.MeshStandardMaterial({ map: TX.openBack(), roughness: 0.65, transparent: true }));
    back.rotation.y = Math.PI;
    back.position.z = -0.0095;
    flip.add(front, back);

    var flipT = 0, flipFrom = 0, flipTo = 0, flipping = false, nextFlip = 6;
    animated.push(function (t, dt) {
      var sway = reduce ? 0.2 : 1;
      swing.rotation.z = (Math.sin(t * 1.5) * 0.06 + Math.sin(t * 0.57) * 0.025) * sway;
      swing.rotation.x = Math.sin(t * 1.05 + 1) * 0.035 * sway;
      nextFlip -= dt;
      if (!flipping && nextFlip <= 0) { flipping = true; flipT = 0; flipFrom = flip.rotation.y; flipTo = flipFrom + Math.PI; }
      if (flipping) {
        flipT += dt / 1.2;
        var p = Math.min(1, flipT);
        flip.rotation.y = flipFrom + (flipTo - flipFrom) * (ease(p) + Math.sin(p * Math.PI) * 0.08);
        if (p >= 1) {
          flip.rotation.y = flipTo; flipping = false;
          nextFlip = Math.round(flipTo / Math.PI) % 2 === 0 ? 7 : 3.5;
        }
      }
    });
  }

  /* ---------------- interior ---------------- */
  var ROOM = { x: 2.7, z0: -0.35, z1: -12.8, h: 3.6 };
  var stacks = null, stackCount = 0, stackMax = 400;
  var swaying = [];

  function buildRoom() {
    var len = ROOM.z0 - ROOM.z1, cz = (ROOM.z0 + ROOM.z1) / 2;
    var floorTex = TX.floor();
    floorTex.repeat.set(ROOM.x * 2 / 1.2, len / 1.2);
    var floor = mesh(new THREE.PlaneGeometry(ROOM.x * 2, len), std('#d8c0a2', { map: floorTex, rough: 0.55 }), 0, 0.001, cz, { cast: false });
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    var plasterTex = TX.plaster([4, 1.5]);
    var upper = std('#e2c9a6', { map: plasterTex, rough: 0.92 });
    var lower = std('#57867e', { map: TX.wood([4, 1], '#ffffff', 30), rough: 0.6 });
    [-1, 1].forEach(function (s) {
      var up = mesh(new THREE.PlaneGeometry(len, ROOM.h - 1.0), upper, s * ROOM.x, 1.0 + (ROOM.h - 1.0) / 2, cz, { cast: false });
      up.rotation.y = -s * Math.PI / 2;
      scene.add(up);
      var lo = mesh(new THREE.PlaneGeometry(len, 1.0), lower, s * (ROOM.x - 0.005), 0.5, cz, { cast: false });
      lo.rotation.y = -s * Math.PI / 2;
      scene.add(lo);
      var rail = mesh(rbox(0.05, 0.06, len, 0.015), MAT.cream, s * (ROOM.x - 0.02), 1.0, cz);
      scene.add(rail);
    });
    var backWall = mesh(new THREE.PlaneGeometry(ROOM.x * 2, ROOM.h), std('#d6b88f', { map: plasterTex, rough: 0.92 }), 0, ROOM.h / 2, ROOM.z1, { cast: false });
    scene.add(backWall);
    var ceil = mesh(new THREE.PlaneGeometry(ROOM.x * 2, len), std('#efe4d3', { rough: 1 }), 0, ROOM.h, cz, { cast: false });
    ceil.rotation.x = Math.PI / 2;
    scene.add(ceil);
    for (var z = -1.4; z > ROOM.z1; z -= 1.7) {
      scene.add(mesh(rbox(ROOM.x * 2, 0.16, 0.14, 0.02), MAT.darkWood, 0, ROOM.h - 0.08, z, { cast: false }));
    }

    // pendant lamps
    var shadeGeo = new THREE.LatheGeometry([[0.02, 0.2], [0.05, 0.19], [0.09, 0.12], [0.17, 0.02], [0.2, 0]].map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 32);
    var shadeOut = std('#1f6a70', { rough: 0.35, side: THREE.DoubleSide });
    var bulbMat = new THREE.MeshBasicMaterial({ color: '#fff1d6' });
    var glowTex = TX.glow('rgba(255,210,150,0.9)');
    [-2.5, -6.4, -10.2].forEach(function (z) {
      var cord = mesh(new THREE.CylinderGeometry(0.006, 0.006, ROOM.h - 2.95, 6), P.mat('#1a1a1a', 0.6), 0, (ROOM.h + 2.95) / 2, z, { cast: false });
      scene.add(cord);
      var shade = mesh(shadeGeo, shadeOut, 0, 2.75, z, { cast: false });
      scene.add(shade);
      scene.add(mesh(new THREE.SphereGeometry(0.055, 16, 12), bulbMat, 0, 2.77, z, { cast: false }));
      var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 }));
      halo.scale.set(0.9, 0.9, 1);
      halo.position.set(0, 2.72, z);
      scene.add(halo);
      var l = new THREE.PointLight('#ffd9a8', 0.75, 8, 1.6);
      l.position.set(0, 2.6, z);
      scene.add(l);
    });

    // plants for life
    [[-2.3, -12.3], [2.35, -0.9], [-2.35, -0.9]].forEach(function (p) {
      var pot = mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.42, 22), std('#b5543a', { rough: 0.7 }), p[0], 0.21, p[1]);
      scene.add(pot);
      for (var i = 0; i < 7; i++) {
        var leaf = mesh(new THREE.SphereGeometry(0.13 + Math.random() * 0.06, 12, 10), std('#4f7d4a', { rough: 0.7 }), p[0] + (Math.random() - 0.5) * 0.26, 0.55 + i * 0.09, p[1] + (Math.random() - 0.5) * 0.22);
        leaf.scale.y = 1.4;
        scene.add(leaf);
      }
    });

    stacks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ map: TX.foldedStack(), roughness: 0.85 }), stackMax);
    stacks.castShadow = true;
    stacks.receiveShadow = true;
    stacks.count = 0;
    scene.add(stacks);
  }

  var _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color(), _e = new THREE.Euler();
  function addStack(parent, x, y, z, w, h, d, color) {
    if (stackCount >= stackMax) return;
    parent.updateMatrixWorld(true);
    _p.set(x, y + h / 2, z).applyMatrix4(parent.matrixWorld);
    _e.set(0, parent.rotation.y + (Math.random() - 0.5) * 0.1, 0);
    _q.setFromEuler(_e);
    _s.set(w, h, d);
    _m.compose(_p, _q, _s);
    stacks.setMatrixAt(stackCount, _m);
    stacks.setColorAt(stackCount, _c.set(color));
    stackCount++;
    stacks.count = stackCount;
  }

  var boardMats = [];
  function headerBoard(parent, title, sub, bg, fg, w, y, z) {
    var tex = TX.board(title, sub, bg, fg);
    var m = new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.12, roughness: 0.55, transparent: true });
    boardMats.push(m);
    var back = mesh(rbox(w, w * 0.22, 0.05, 0.025), std(bg, { rough: 0.6 }), 0, y, z - 0.004);
    parent.add(back);
    var face = plane(w, w * 0.21875, m);
    face.position.set(0, y, z + 0.024);
    parent.add(face);
    // warm strip light under the board
    var strip = mesh(rbox(w * 0.9, 0.012, 0.02, 0.004), new THREE.MeshBasicMaterial({ color: '#fff0d0' }), 0, y - w * 0.11 - 0.012, z + 0.03, { cast: false });
    parent.add(strip);
    return m;
  }

  function hitBox(parent, w, h, d, x, y, z) {
    var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
    b.position.set(x, y, z);
    parent.add(b);
    return b;
  }

  /* shelf unit standing against a side wall; local +z faces the aisle */
  function shelfUnit(def) {
    var side = def.side;
    var g = new THREE.Group();
    g.position.set(side * (ROOM.x - 0.28), 0, def.z);
    g.rotation.y = -side * Math.PI / 2;
    scene.add(g);
    var W = 2.2, Hh = 2.36, D = 0.5;
    g.add(mesh(rbox(0.06, Hh, D, 0.012), MAT.wood, -W / 2, Hh / 2, 0));
    g.add(mesh(rbox(0.06, Hh, D, 0.012), MAT.wood, W / 2, Hh / 2, 0));
    g.add(mesh(rbox(W, Hh, 0.03, 0.006), std(def.panel, { rough: 0.7, map: TX.wood([1, 1], '#ffffff', 30) }), 0, Hh / 2, -D / 2 + 0.015));
    [0.12, 0.66].forEach(function (y) { g.add(mesh(rbox(W - 0.04, 0.035, D - 0.04, 0.008), MAT.wood, 0, y, 0)); });
    var rail = mesh(new THREE.CylinderGeometry(0.012, 0.012, W - 0.1, 12), MAT.brass, 0, 2.12, 0.06);
    rail.rotation.z = Math.PI / 2;
    g.add(rail);
    [-W / 2 + 0.08, W / 2 - 0.08].forEach(function (x) {
      g.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 8), MAT.brass, x, 2.12, 0.01));
    });
    def.kinds.forEach(function (k, i) {
      var gm = P.garment(k, k === 'jeans' ? P.DENIM[i % P.DENIM.length] : def.colors[i % def.colors.length]);
      gm.position.set(-0.78 + i * 0.52, 2.13, 0.07 + i * 0.004);
      gm.scale.setScalar(0.92);
      g.add(gm);
      swaying.push(gm);
    });
    [0.155, 0.695].forEach(function (y) {
      for (var c = 0; c < 5; c++) {
        var hgt = 0.14 + Math.random() * 0.2;
        addStack(g, -0.84 + c * 0.42, y - 0.02, 0.02, 0.34, hgt, 0.36, def.colors[(c + Math.round(y * 10)) % def.colors.length]);
      }
    });
    var bm = headerBoard(g, def.title, def.sub, def.bg, def.fg, 2.26, 2.6, 0.02);
    var hit = hitBox(g, 2.3, 2.95, 0.7, 0, 1.47, 0.05);
    var sz = def.z;
    sections.push({
      id: def.id, kind: 'Raft', title: def.title + (def.sub ? ' · ' + def.sub : ''), short: def.short, z: sz, hit: hit, board: bm,
      lane: { z: sz + 0.6, yaw: side < 0 ? 1.05 : -1.05 },
      view: function (pan) {
        var x = -side * 0.35, zz = sz + pan;
        return { pos: new THREE.Vector3(x, 1.72, zz + 0.05), look: new THREE.Vector3(side * 2.3, 1.68, zz) };
      },
      pan: [-0.55, 0.55], panScale: 1
    });
  }

  /* round clothing stand with a spinning topper sign */
  function stand(def) {
    var g = new THREE.Group();
    g.position.set(def.x, 0, def.z);
    scene.add(g);
    var ringR = 0.55;
    g.add(mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.05, 32), MAT.brass, 0, 0.025, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.0, 12), MAT.brass, 0, 1.0, 0));
    var ring = mesh(new THREE.TorusGeometry(ringR, 0.014, 10, 64), MAT.brass, 0, 1.5, 0);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    [0, Math.PI / 2].forEach(function (a) {
      var arm = mesh(new THREE.CylinderGeometry(0.008, 0.008, ringR * 2, 8), MAT.brass, 0, 1.5, 0);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = a;
      g.add(arm);
    });
    var rack = new THREE.Group();
    g.add(rack);
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      var gm = P.randomGarment();
      gm.position.set(Math.cos(a) * ringR, 1.51, Math.sin(a) * ringR);
      gm.rotation.y = -a;
      gm.scale.setScalar(0.9);
      rack.add(gm);
      swaying.push(gm);
    }
    var topTex = TX.topper(def.title, def.bg, def.fg);
    var topMat = new THREE.MeshStandardMaterial({ map: topTex, emissive: '#ffffff', emissiveMap: topTex, emissiveIntensity: 0.15, roughness: 0.5, transparent: true });
    boardMats.push(topMat);
    var topper = new THREE.Group();
    topper.position.y = 2.18;
    g.add(topper);
    topper.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 40), std(def.bg, { rough: 0.5 }), 0, 0, 0));
    topper.children[0].rotation.x = Math.PI / 2;
    var f1 = plane(0.5, 0.5, topMat); f1.position.z = 0.011; topper.add(f1);
    var f2 = plane(0.5, 0.5, topMat); f2.position.z = -0.011; f2.rotation.y = Math.PI; topper.add(f2);
    animated.push(function (t) { topper.rotation.y = Math.sin(t * 0.5 + def.x) * 0.9; });
    var hit = hitBox(g, 1.5, 2.5, 1.5, 0, 1.2, 0);
    var c = new THREE.Vector2(def.x, def.z);
    var base = Math.atan2(0 - def.x, def.laneZ - def.z);   // direction from stand toward the lane
    sections.push({
      id: def.id, kind: 'Stand', title: def.title, short: def.short, z: def.z, hit: hit, board: topMat,
      lane: { z: def.laneZ + 0.6, yaw: Math.atan2(-(def.x), -(def.z - def.laneZ - 0.6)) },
      view: function (pan) {
        var a = base + pan, r = 2.1;
        return { pos: new THREE.Vector3(c.x + Math.sin(a) * r, 1.8, c.y + Math.cos(a) * r), look: new THREE.Vector3(c.x, 1.45, c.y) };
      },
      pan: [-0.9, 0.9], panScale: 1.6
    });
    return { x: def.x, z: def.z, r: 0.72 };
  }

  /* the till: wooden counter, vintage cash register, cashier */
  function counter() {
    var g = new THREE.Group();
    g.position.set(-1.62, 0, -7.1);
    g.rotation.y = Math.PI / 2;   // front (local +z) faces the aisle
    scene.add(g);
    var body = std('#7a4e33', { rough: 0.5, map: TX.wood([1, 1]) });
    g.add(mesh(rbox(1.8, 0.92, 0.6, 0.03), body, 0, 0.46, 0));
    [-0.6, 0, 0.6].forEach(function (x) {
      g.add(mesh(rbox(0.5, 0.6, 0.025, 0.015), MAT.paint, x, 0.47, 0.305));
      g.add(mesh(rbox(0.4, 0.48, 0.02, 0.012), MAT.paint, x, 0.47, 0.318));
    });
    g.add(mesh(rbox(1.94, 0.06, 0.72, 0.025), std('#efe6d8', { rough: 0.25 }), 0, 0.95, 0.02));
    g.add(mesh(rbox(1.84, 0.05, 0.03, 0.01), MAT.brass, 0, 0.9, 0.32));

    var reg = new THREE.Group();
    reg.position.set(0.25, 0.98, 0.02);
    g.add(reg);
    var teal = std('#1f6a70', { rough: 0.32, metal: 0.2 });
    reg.add(mesh(rbox(0.46, 0.16, 0.38, 0.03), teal, 0, 0.08, 0));
    reg.add(mesh(rbox(0.44, 0.03, 0.02, 0.01), MAT.brass, 0, 0.05, 0.19));
    var keys = new THREE.Group();
    keys.position.set(0, 0.2, 0.06);
    keys.rotation.x = -0.55;
    reg.add(keys);
    keys.add(mesh(rbox(0.42, 0.1, 0.22, 0.02), teal, 0, 0, 0));
    var keyGeo = rbox(0.045, 0.03, 0.04, 0.01), keyMat = std('#f3ead8', { rough: 0.35 });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 6; c++) keys.add(mesh(keyGeo, keyMat, -0.16 + c * 0.064, 0.055, -0.065 + r * 0.065, { cast: false }));
    reg.add(mesh(rbox(0.26, 0.17, 0.09, 0.02), MAT.brass, 0, 0.34, -0.1));
    var disp = plane(0.2, 0.075, new THREE.MeshBasicMaterial({ map: TX.registerDisplay() }));
    disp.position.set(0, 0.35, -0.054);
    reg.add(disp);
    var crank = new THREE.Group();
    crank.position.set(0.25, 0.1, 0);
    reg.add(crank);
    var disc = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 20), MAT.brass, 0, 0, 0);
    disc.rotation.z = Math.PI / 2;
    crank.add(disc);
    crank.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), MAT.brass, 0.02, 0.05, 0));
    crank.add(mesh(new THREE.SphereGeometry(0.018, 12, 10), P.mat('#2a1a10', 0.4), 0.02, 0.1, 0));
    // bell, paper bags, card reader
    var bell = mesh(new THREE.SphereGeometry(0.05, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), MAT.brass, -0.45, 0.98, 0.1);
    g.add(bell);
    g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 18), P.mat('#2a1a10', 0.4), -0.45, 0.985, 0.1));
    var kraft = std('#c9a27a', { rough: 0.85 });
    for (var k = 0; k < 4; k++) g.add(mesh(rbox(0.3, 0.012, 0.22, 0.004), kraft, -0.72, 0.99 + k * 0.013, -0.05));
    g.add(mesh(rbox(0.08, 0.025, 0.15, 0.01), P.mat('#22252b', 0.4), 0.72, 0.995, 0.08));

    // hanging sign, readable from the door
    var signTex = TX.casaSign();
    var sm = new THREE.MeshStandardMaterial({ map: signTex, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: 0.14, roughness: 0.5, transparent: true });
    boardMats.push(sm);
    var sign = new THREE.Group();
    sign.position.set(-1.55, 2.55, -7.1);
    scene.add(sign);
    sign.add(mesh(rbox(1.36, 0.35, 0.04, 0.03), std('#1f6a70', { rough: 0.5 }), 0, 0, 0));
    var s1 = plane(1.36, 0.345, sm); s1.position.z = 0.021; sign.add(s1);
    var s2 = plane(1.36, 0.345, sm); s2.position.z = -0.021; s2.rotation.y = Math.PI; sign.add(s2);
    [-0.55, 0.55].forEach(function (x) {
      sign.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, ROOM.h - 2.72, 6), MAT.brass, x, (ROOM.h - 2.55) / 2 + 0.17, 0, { cast: false }));
    });
    animated.push(function (t) { sign.rotation.y = Math.sin(t * 0.4) * 0.05; });

    var hit = hitBox(g, 2.1, 2.0, 1.6, 0, 1.0, -0.2);
    sections.push({
      id: 'casa', kind: 'Casa de marcat', title: 'Casa de marcat', short: 'Casa', z: -7.1, hit: hit, board: sm,
      lane: { z: -6.3, yaw: 1.0 },
      view: function (pan) {
        var a = 1.2 + pan, r = 2.5;
        return { pos: new THREE.Vector3(-1.4 + Math.sin(a) * r, 1.85, -7.1 + Math.cos(a) * r * 0.8), look: new THREE.Vector3(-1.5, 1.35, -7.1) };
      },
      pan: [-0.5, 0.35], panScale: 1.4
    });
  }

  /* back wall display: jackets & hoodies */
  function backWall() {
    var g = new THREE.Group();
    g.position.set(0.9, 0, ROOM.z1 + 0.02);
    scene.add(g);
    [2.25, 1.25].forEach(function (y, row) {
      var rail = mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.9, 12), MAT.brass, 0, y, 0.12);
      rail.rotation.z = Math.PI / 2;
      g.add(rail);
      for (var i = 0; i < 5; i++) {
        var k = row === 0 ? (i % 2 ? 'hoodie' : 'shirt') : (i % 2 ? 'hoodie' : 'jeans');
        var col = k === 'jeans' ? P.DENIM[i % 4] : ['#3e7c7a', '#b5432f', '#e0a93b', '#34405e', '#7b3f61'][(i + row) % 5];
        var gm = P.garment(k, col);
        gm.position.set(-1.15 + i * 0.58, y + 0.01, 0.13);
        gm.scale.setScalar(k === 'jeans' ? 0.78 : 0.95);
        g.add(gm);
        swaying.push(gm);
      }
    });
    var bm = headerBoard(g, 'GECI', 'și hanorace', '#b5432f', '#fff3dc', 2.4, 3.0, 0.03);
    var hit = hitBox(g, 3.2, 2.6, 0.6, 0, 1.75, 0.2);
    sections.push({
      id: 'geci', kind: 'Raft', title: 'GECI · și hanorace', short: 'Geci & hanorace', z: ROOM.z1, hit: hit, board: bm,
      lane: { z: -9.3, yaw: -0.25 },
      view: function (pan) {
        return { pos: new THREE.Vector3(0.9 + pan, 1.65, -9.7), look: new THREE.Vector3(0.9 + pan, 1.75, ROOM.z1) };
      },
      pan: [-0.7, 0.7], panScale: 1
    });
  }

  function buildInterior() {
    buildRoom();
    var SH = [
      { id: 'tf', side: -1, z: -2.3, title: 'TRICOURI', sub: 'femei', short: 'Tricouri femei', bg: '#c4534a', fg: '#fff3dc', panel: '#f2d2c2',
        kinds: ['tshirt', 'tshirt', 'tshirt', 'tshirt'], colors: ['#e7c3b0', '#b5432f', '#efe1c6', '#8fb3a0', '#7b3f61'] },
      { id: 'rf', side: -1, z: -4.75, title: 'ROCHII', sub: 'și fuste', short: 'Rochii & fuste', bg: '#e0a93b', fg: '#2d1b10', panel: '#f6e2b5',
        kinds: ['dress', 'dress', 'dress', 'dress'], colors: ['#d9734e', '#3e7c7a', '#efe1c6', '#7b3f61', '#e0a93b'] },
      { id: 'bf', side: -1, z: -9.6, title: 'BLUGI', sub: 'femei', short: 'Blugi femei', bg: '#466b8f', fg: '#fff3dc', panel: '#cfdbe6',
        kinds: ['jeans', 'jeans', 'jeans', 'jeans'], colors: ['#3b5b7a', '#5a7593', '#2c3e55', '#c9b48a'] },
      { id: 'tb', side: 1, z: -2.3, title: 'TRICOURI', sub: 'bărbați', short: 'Tricouri bărbați', bg: '#3e7c7a', fg: '#fff3dc', panel: '#cfe2dc',
        kinds: ['tshirt', 'tshirt', 'tshirt', 'tshirt'], colors: ['#34405e', '#efe1c6', '#5d8a72', '#a9372f', '#c9b48a'] },
      { id: 'cb', side: 1, z: -4.75, title: 'CĂMĂȘI', sub: 'bărbați', short: 'Cămăși bărbați', bg: '#7b3f61', fg: '#fff3dc', panel: '#e6d0dc',
        kinds: ['shirt', 'shirt', 'shirt', 'shirt'], colors: ['#efe1c6', '#466b8f', '#c9b48a', '#8fb3a0', '#e7c3b0'] },
      { id: 'pb', side: 1, z: -9.6, title: 'PANTALONI', sub: 'bărbați', short: 'Pantaloni bărbați', bg: '#34405e', fg: '#fff3dc', panel: '#d3d7e2',
        kinds: ['jeans', 'jeans', 'jeans', 'jeans'], colors: ['#253246', '#c9b48a', '#3b5b7a', '#5d8a72'] }
    ];
    SH.forEach(shelfUnit);
    var obs = [];
    obs.push(stand({ id: 'red', x: 1.5, z: -7.15, laneZ: -7.15, title: 'REDUCERI', short: 'Stand Reduceri', bg: '#c4362a', fg: '#fff3dc' }));
    obs.push(stand({ id: 'nou', x: -1.3, z: -11.3, laneZ: -10.2, title: 'NOUTĂȚI', short: 'Stand Noutăți', bg: '#1f6a70', fg: '#fff3dc' }));
    counter();
    backWall();
    stacks.instanceMatrix.needsUpdate = true;
    if (stacks.instanceColor) stacks.instanceColor.needsUpdate = true;
    obs.push({ x: -1.62, z: -6.4, r: 0.42 }, { x: -1.62, z: -7.1, r: 0.42 }, { x: -1.62, z: -7.8, r: 0.42 });

    animated.push(function (t) {
      for (var i = 0; i < swaying.length; i++) {
        var gm = swaying[i];
        gm.userData.body.rotation.z = Math.sin(t * 0.8 + gm.userData.phase) * 0.016;
        gm.userData.body.rotation.x = Math.sin(t * 0.6 + gm.userData.phase * 1.3) * 0.012;
      }
    });
    sections.sort(function (a, b) { return b.z - a.z; });
    return obs;
  }

  /* ---------------- shoppers ---------------- */
  function buildPeople(obstacles) {
    function spot(x, z, tx, tz, idle) { return { x: x, z: z, face: Math.atan2(tx - x, tz - z), idle: idle }; }
    var spots = [
      spot(-1.62, -2.3, -2.6, -2.3), spot(1.62, -2.2, 2.6, -2.2),
      spot(-1.6, -4.8, -2.6, -4.8), spot(1.62, -4.7, 2.6, -4.7),
      spot(-1.6, -9.6, -2.6, -9.6), spot(1.62, -9.5, 2.6, -9.5),
      spot(0.68, -7.05, 1.5, -7.15), spot(1.45, -6.25, 1.5, -7.15),
      spot(-0.72, -7.05, -1.62, -7.05),
      spot(0.9, -11.9, 0.9, -12.8), spot(1.9, -11.8, 1.9, -12.8),
      spot(-0.42, -11.05, -1.3, -11.3), spot(-1.25, -10.4, -1.3, -11.3),
      spot(0.25, -3.6, 0.3, -7)
    ];
    var cast = [
      { shirt: '#b5432f', pants: '#2c3e55', hairStyle: 'long', hair: '#5b3a24', bag: '#e0a93b', scale: 0.94 },
      { shirt: '#2f6f9f', pants: '#c9b48a', hairStyle: 'short', hair: '#191714', longSleeves: true, scale: 1.0, wide: true },
      { shirt: '#5d8a72', pants: '#34405e', hairStyle: 'bun', hair: '#c99a52', scale: 0.93 },
      { shirt: '#efe1c6', pants: '#3b5b7a', hairStyle: 'short', hair: '#8c3b1a', bag: '#7b3f61', scale: 0.97 },
      { shirt: '#7b3f61', pants: '#253246', hairStyle: 'long', hair: '#2a1a12', longSleeves: true, scale: 0.92 }
    ];
    var starts = [0, 6, 9, 3, 12];
    var camObstacle = function () {
      return (state === 'aisle' || state === 'focus' || state === 'flying') ? { x: camera.position.x, z: camera.position.z, r: 0.45 } : null;
    };
    cast.forEach(function (c, i) {
      var p = P.person(c);
      scene.add(p.root);
      walkers.push(new P.Walker(p, spots, starts[i], obstacles, camObstacle));
    });
    // cashier behind the till
    var cashier = P.person({ shirt: '#1f6a70', pants: '#2c3e55', hairStyle: 'short', hair: '#2a1a12', scale: 0.98, longSleeves: true });
    scene.add(cashier.root);
    walkers.push(new P.Walker(cashier, [{ x: -2.22, z: -7.1, face: Math.PI / 2, idle: true }], 0, []));
  }

  /* ---------------- tweens ---------------- */
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

  /* ---------------- state ---------------- */
  var state = 'loading';  // loading | intro | door | opening | aisle | flying | focus | leaving
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var nav = { z: -1.0, tz: -1.0, yaw: 0, tyaw: 0, walked: 0 };
  var NAV_MIN = -9.4, NAV_MAX = -0.95, EYE = 1.62;
  var focus = { sec: null, pan: 0, tpan: 0 };

  function aisleFov() { return camera.aspect < 1 ? 62 : 50; }
  function setFov(f) { camera.fov = f; camera.updateProjectionMatrix(); }
  function aislePose(z, yaw) {
    var pos = new THREE.Vector3(0, EYE, z);
    var look = new THREE.Vector3(-Math.sin(yaw) * 4, EYE - 0.22, z - Math.cos(yaw) * 4);
    return { pos: pos, look: look };
  }

  var curtain = document.createElement('div');
  curtain.style.cssText = 'position:fixed;inset:0;background:#0d0908;opacity:0;pointer-events:none;z-index:12;transition:opacity .45s ease';
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
  function setVignette(on) { vignette.classList.toggle('is-off', !on); }

  var gestureShown = false, gestureTimer = null;
  function showAisleUI(on) {
    aisleUI.hidden = !on;
    if (on && !gestureShown) {
      gestureShown = true;
      gestureEl.hidden = false;
      gestureTimer = setTimeout(hideGesture, 7000);
    }
    if (!on) hideGesture();
  }
  function hideGesture() {
    if (gestureEl.hidden) return;
    gestureEl.classList.add('is-fading');
    clearTimeout(gestureTimer);
    setTimeout(function () { gestureEl.hidden = true; gestureEl.classList.remove('is-fading'); }, 400);
  }

  function flyTo(pos, look, fov, dur) {
    var p0 = camera.position.clone(), l0 = camLook.clone(), f0 = camera.fov;
    return tween(dur, function (e) {
      camera.position.lerpVectors(p0, pos, e);
      camLook.lerpVectors(l0, look, e);
      if (fov) setFov(f0 + (fov - f0) * e);
    });
  }

  function enterShop() {
    if (state !== 'door') return;
    state = 'opening';
    showHint(false);
    chime();
    tween(0.18, function (e) { door.handle.position.z = Math.sin(e * Math.PI) * 0.012; }, { ease: function (p) { return p; } });
    tween(1.6, function (e) { door.pivot.rotation.y = 1.42 * e; }, { delay: 0.15 });
    setTimeout(function () { setVignette(false); }, 600);
    nav.z = nav.tz = -1.0; nav.yaw = nav.tyaw = 0;
    var target = aislePose(nav.z, 0);
    var p0 = camera.position.clone(), l0 = camLook.clone(), f0 = camera.fov;
    tween(2.6, function (e) {
      camera.position.lerpVectors(p0, target.pos, e);
      camLook.lerpVectors(l0, target.look, e);
      setFov(f0 + (aisleFov() - f0) * e);
    }, { delay: 0.55 }).then(function () {
      state = 'aisle';
      showAisleUI(true);
    });
  }

  function skipIntro() {
    if (state !== 'door') return;
    state = 'opening';
    showHint(false);
    setCurtain(true).then(function () {
      door.pivot.rotation.y = 1.42;
      nav.z = nav.tz = -1.0; nav.yaw = nav.tyaw = 0;
      var t = aislePose(nav.z, 0);
      camera.position.copy(t.pos);
      camLook.copy(t.look);
      setFov(aisleFov());
      setVignette(false);
      state = 'aisle';
      return setCurtain(false);
    }).then(function () { showAisleUI(true); });
  }

  function leaveShop() {
    if (state !== 'aisle' && state !== 'focus') return;
    closeFocusCard();
    state = 'leaving';
    showAisleUI(false);
    var mid = aislePose(-0.95, 0);
    flyTo(mid.pos, mid.look, null, 0.9).then(function () {
      setVignette(true);
      tween(1.3, function (e) { door.pivot.rotation.y = 1.42 * (1 - e); }, { delay: 1.0 });
      return flyTo(camHome.clone(), DOOR_LOOK.clone(), DOOR_FOV, 2.1);
    }).then(function () {
      setTimeout(function () { state = 'door'; showHint(true); }, 300);
    });
  }

  /* focus on a shelf, stand or the till */
  var focusTitle = $('focus-title'), focusKind = $('focus-kind'), focusText = $('focus-text');
  function focusSection(sec) {
    if (state !== 'aisle' && state !== 'focus') return;
    hideGesture();
    closeFocusCard();
    state = 'flying';
    focus.sec = sec;
    focus.pan = focus.tpan = 0;
    var v = sec.view(0);
    markChip(sec.id);
    flyTo(v.pos, v.look, camera.aspect < 1 ? 66 : 50, 1.2).then(function () {
      state = 'focus';
      focusKind.textContent = sec.kind;
      focusTitle.textContent = sec.title;
      focusText.textContent = sec.id === 'casa'
        ? 'Aici vei vedea pe casa de marcat produsele din coș și totalul, apoi alegi plata cu cardul sau ramburs la livrare.'
        : 'Aici vei răsfoi hainele pe umerașe cu swipe, le vei vedea de aproape cu eticheta de preț și le vei trage în coș. Construim asta la pasul următor.';
      $('focus-tip').textContent = sec.kind === 'Raft' ? 'Trage stânga–dreapta ca să vezi tot raftul.'
        : sec.kind === 'Stand' ? 'Trage stânga–dreapta ca să te rotești în jurul standului.' : 'Trage stânga–dreapta ca să te rotești în jurul casei.';
      focusEl.hidden = false;
      $('focus-back').focus({ preventScroll: true });
    });
  }
  function closeFocusCard() { focusEl.hidden = true; }
  function backToAisle() {
    if (state !== 'focus') return;
    closeFocusCard();
    state = 'flying';
    var sec = focus.sec;
    sec.board.emissiveIntensity = 0.12;
    nav.z = nav.tz = clamp(sec.lane.z, NAV_MIN, NAV_MAX);
    nav.yaw = nav.tyaw = sec.lane.yaw;
    var p = aislePose(nav.z, nav.yaw);
    flyTo(p.pos, p.look, aisleFov(), 1.0).then(function () { state = 'aisle'; markChip(null); });
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

  /* chips: one per section, nearest first */
  function buildChips() {
    sections.forEach(function (sec) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = sec.short;
      b.dataset.id = sec.id;
      b.addEventListener('click', function () { focusSection(sec); });
      chipsEl.appendChild(b);
    });
  }
  function markChip(id) {
    Array.prototype.forEach.call(chipsEl.children, function (c) {
      var on = c.dataset.id === id;
      c.classList.toggle('is-on', on);
      if (on) c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    });
  }

  /* ---------------- input ---------------- */
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pickFrom(list, x, y) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((x - r.left) / r.width) * 2 - 1;
    ndc.y = -((y - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(list.map(function (c) { return c.hit || c.mesh; }), false);
    if (!hits.length) return null;
    for (var i = 0; i < list.length; i++) if ((list[i].hit || list[i].mesh) === hits[0].object) return list[i];
    return null;
  }

  var drag = null, hovered = null;
  canvas.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: 0, id: e.pointerId };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  canvas.addEventListener('pointermove', function (e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    if (drag) {
      var dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 8) {
        if (state === 'aisle') {
          nav.tyaw = clamp(nav.tyaw + dx * 0.0055, -1.35, 1.35);
          nav.tz = clamp(nav.tz + dy * 0.016, NAV_MIN, NAV_MAX);
          hideGesture();
        } else if (state === 'focus' && focus.sec) {
          var s = focus.sec;
          focus.tpan = clamp(focus.tpan - dx * 0.004 * s.panScale, s.pan[0], s.pan[1]);
        }
      }
      return;
    }
    if (e.pointerType !== 'mouse') return;
    var c = null;
    if (state === 'door') c = pickFrom(clickables, e.clientX, e.clientY);
    else if (state === 'aisle') c = pickFrom(sections, e.clientX, e.clientY);
    if (c !== hovered) {
      if (hovered) setHover(hovered, false);
      hovered = c;
      if (c) setHover(c, true);
      canvas.classList.toggle('is-pointer', !!c);
    }
  });
  function setHover(c, on) {
    if (c.hover) c.hover(on);
    else if (c.board) c.board.emissiveIntensity = on ? 0.45 : 0.12;
    if (c.mesh) c.mesh.userData.hover = on;
  }
  function endDrag(e) {
    if (!drag) return;
    var tap = drag.moved <= 8;
    drag = null;
    if (!tap) return;
    if (state === 'door') {
      var c = pickFrom(clickables, e.clientX, e.clientY);
      if (c) c.action();
    } else if (state === 'aisle') {
      var s = pickFrom(sections, e.clientX, e.clientY);
      if (s) focusSection(s);
    }
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', function () { drag = null; });
  canvas.addEventListener('pointerleave', function () { pointer.tx = pointer.ty = 0; });
  canvas.addEventListener('wheel', function (e) {
    if (state !== 'aisle') return;
    e.preventDefault();
    nav.tz = clamp(nav.tz - e.deltaY * 0.004, NAV_MIN, NAV_MAX);
    hideGesture();
  }, { passive: false });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!legalEl.hidden) closeLegal();
      else if (state === 'focus') backToAisle();
      return;
    }
    if (state !== 'aisle' || e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    var k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') nav.tz = clamp(nav.tz - 0.5, NAV_MIN, NAV_MAX);
    else if (k === 'arrowdown' || k === 's') nav.tz = clamp(nav.tz + 0.5, NAV_MIN, NAV_MAX);
    else if (k === 'arrowleft' || k === 'a') nav.tyaw = clamp(nav.tyaw + 0.15, -1.35, 1.35);
    else if (k === 'arrowright' || k === 'd') nav.tyaw = clamp(nav.tyaw - 0.15, -1.35, 1.35);
    else return;
    e.preventDefault();
    hideGesture();
  });

  $('exit-btn').addEventListener('click', leaveShop);
  $('focus-back').addEventListener('click', backToAisle);
  $('legal-close').addEventListener('click', closeLegal);
  legalEl.addEventListener('click', function (e) { if (e.target === legalEl) closeLegal(); });
  $('kbd-enter').addEventListener('click', enterShop);
  $('kbd-skip').addEventListener('click', skipIntro);
  $('kbd-legal').addEventListener('click', openLegal);

  /* ---------------- layout ---------------- */
  function fitDistance() {
    var t = Math.tan(THREE.MathUtils.degToRad(DOOR_FOV / 2));
    var halfW = 0.98, halfH = 1.58;
    return Math.min(9, Math.max(halfH / t, halfW / (t * camera.aspect)));
  }
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camHome.set(0, 1.42, fitDistance());
    if (state === 'aisle' || state === 'focus') camera.fov = aisleFov();
    camera.updateProjectionMatrix();
    if (state === 'door') camera.position.copy(camHome);
  }
  window.addEventListener('resize', resize);

  var tmpV = new THREE.Vector3();
  function placeHint() {
    if (hintEl.hidden) return;
    door.handle.getWorldPosition(tmpV);
    tmpV.project(camera);
    var x = (tmpV.x + 1) / 2 * window.innerWidth;
    var y = (1 - tmpV.y) / 2 * window.innerHeight;
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

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    var drift = reduce ? 0 : 1;
    if (state === 'door') {
      camera.position.set(
        camHome.x + pointer.x * 0.22 * drift + Math.sin(time * 0.25) * 0.04 * drift,
        camHome.y - pointer.y * 0.1 * drift + Math.sin(time * 0.33) * 0.025 * drift,
        camHome.z
      );
    } else if (state === 'aisle') {
      var k = Math.min(1, dt * 5);
      var oldZ = nav.z;
      nav.z += (nav.tz - nav.z) * k;
      nav.yaw += (nav.tyaw - nav.yaw) * k;
      nav.walked += Math.abs(nav.z - oldZ);
      var pose = aislePose(nav.z, nav.yaw);
      pose.pos.y += Math.sin(nav.walked * 5.5) * 0.012 * drift;
      camera.position.copy(pose.pos);
      camLook.copy(pose.look);
    } else if (state === 'focus' && focus.sec) {
      focus.pan += (focus.tpan - focus.pan) * Math.min(1, dt * 6);
      var v = focus.sec.view(focus.pan);
      camera.position.copy(v.pos);
      camLook.copy(v.look);
      focus.sec.board.emissiveIntensity = 0.2 + Math.sin(time * 3) * 0.08;
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
    materials();
    buildEnv();
    buildLights();
    buildFront();
    buildDoor();
    var obs = buildInterior();
    buildPeople(obs);
    buildChips();
    resize();

    camera.position.set(0, 1.9, camHome.z + 2.2);
    camLook.copy(DOOR_LOOK);
    setFov(DOOR_FOV);
    state = 'intro';
    requestAnimationFrame(frame);
    loader.classList.add('is-done');
    setTimeout(function () { loader.hidden = true; }, 700);

    var from = camera.position.clone();
    tween(reduce ? 0.01 : 1.9, function (e) { camera.position.lerpVectors(from, camHome, e); }, { ease: easeOut }).then(function () {
      state = 'door';
      showHint(true);
    });
  });

  // test hook: lets automated checks jump between states
  window.__umeras = { enter: enterShop, skip: skipIntro, leave: leaveShop, focus: function (id) { var s = sections.filter(function (x) { return x.id === id; })[0]; if (s) focusSection(s); }, back: backToAisle, state: function () { return state; }, nav: nav };
})();
