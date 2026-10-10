/* Shoppers with realistic proportions and cloth-like garments. Exposed as window.PARTS. */
(function () {
  'use strict';

  var CLOTH = ['#b5432f', '#2f6f9f', '#e0a93b', '#5d8a72', '#efe1c6', '#34405e', '#d9734e', '#8fb3a0',
    '#7b3f61', '#c9b48a', '#3e7c7a', '#e7c3b0', '#a9372f', '#466b8f'];
  var DENIM = ['#3b5b7a', '#2c3e55', '#5a7593', '#253246'];

  var matCache = {};
  function mat(color, rough, extra) {
    var key = color + '|' + rough + '|' + (extra ? JSON.stringify(extra) : '');
    if (!matCache[key]) {
      var o = { color: color, roughness: rough == null ? 0.7 : rough, metalness: 0 };
      if (extra) for (var k in extra) o[k] = extra[k];
      matCache[key] = new THREE.MeshStandardMaterial(o);
    }
    return matCache[key];
  }
  var BRASS = null;
  function brass() {
    if (!BRASS) BRASS = new THREE.MeshStandardMaterial({ color: '#d6a74b', metalness: 1, roughness: 0.3 });
    return BRASS;
  }

  /* ---------------- garments ----------------
     Outlines are in metres, x centred, y pointing DOWN from the top of the garment. */
  var KINDS = {
    tshirt: {
      w: 0.6, top: 0, h: 0.68, puff: 0.04,
      path: function (p) {
        p.moveTo(-0.07, 0); p.lineTo(-0.17, 0.025); p.lineTo(-0.29, 0.11); p.lineTo(-0.24, 0.215);
        p.lineTo(-0.172, 0.175); p.lineTo(-0.182, 0.665); p.quadraticCurveTo(0, 0.68, 0.182, 0.665);
        p.lineTo(0.172, 0.175); p.lineTo(0.24, 0.215); p.lineTo(0.29, 0.11); p.lineTo(0.17, 0.025);
        p.lineTo(0.07, 0); p.quadraticCurveTo(0, 0.075, -0.07, 0);
      },
      detail: function (g, S) {
        line(g, S, [[-0.07, 0.0], [0, 0.07], [0.07, 0]], 0.012, 'rgba(0,0,0,.18)', true);
        line(g, S, [[-0.172, 0.18], [-0.24, 0.21]], 0.004, 'rgba(0,0,0,.25)');
        line(g, S, [[0.172, 0.18], [0.24, 0.21]], 0.004, 'rgba(0,0,0,.25)');
        line(g, S, [[-0.18, 0.64], [0.18, 0.64]], 0.003, 'rgba(0,0,0,.22)');
      }
    },
    shirt: {
      w: 0.62, top: 0, h: 0.76, puff: 0.035,
      path: function (p) {
        p.moveTo(-0.065, 0); p.lineTo(-0.185, 0.03); p.lineTo(-0.27, 0.2); p.lineTo(-0.3, 0.63);
        p.lineTo(-0.235, 0.645); p.lineTo(-0.205, 0.27); p.lineTo(-0.185, 0.73);
        p.quadraticCurveTo(-0.09, 0.69, 0, 0.75); p.quadraticCurveTo(0.09, 0.69, 0.185, 0.73);
        p.lineTo(0.205, 0.27); p.lineTo(0.235, 0.645); p.lineTo(0.3, 0.63); p.lineTo(0.27, 0.2);
        p.lineTo(0.185, 0.03); p.lineTo(0.065, 0); p.quadraticCurveTo(0, 0.05, -0.065, 0);
      },
      detail: function (g, S) {
        line(g, S, [[0, 0.05], [0, 0.72]], 0.004, 'rgba(0,0,0,.25)');
        for (var y = 0.1; y < 0.7; y += 0.11) dot(g, S, 0.012, y, 0.008, 'rgba(255,255,255,.75)', 'rgba(0,0,0,.3)');
        poly(g, S, [[-0.065, 0], [-0.03, 0.09], [0, 0.05]], 'rgba(0,0,0,.14)');
        poly(g, S, [[0.065, 0], [0.03, 0.09], [0, 0.05]], 'rgba(0,0,0,.14)');
        line(g, S, [[-0.15, 0.18], [-0.06, 0.18], [-0.06, 0.29], [-0.15, 0.29], [-0.15, 0.18]], 0.003, 'rgba(0,0,0,.25)');
        line(g, S, [[-0.3, 0.58], [-0.235, 0.6]], 0.004, 'rgba(0,0,0,.25)');
        line(g, S, [[0.3, 0.58], [0.235, 0.6]], 0.004, 'rgba(0,0,0,.25)');
      }
    },
    hoodie: {
      w: 0.66, top: -0.08, h: 0.8, puff: 0.05,
      path: function (p) {
        p.moveTo(-0.1, 0.01); p.quadraticCurveTo(-0.12, -0.08, 0, -0.08); p.quadraticCurveTo(0.12, -0.08, 0.1, 0.01);
        p.lineTo(0.2, 0.04); p.lineTo(0.29, 0.22); p.lineTo(0.32, 0.6); p.lineTo(0.245, 0.62); p.lineTo(0.215, 0.29);
        p.lineTo(0.205, 0.7); p.lineTo(-0.205, 0.7); p.lineTo(-0.215, 0.29); p.lineTo(-0.245, 0.62);
        p.lineTo(-0.32, 0.6); p.lineTo(-0.29, 0.22); p.lineTo(-0.2, 0.04); p.closePath();
      },
      detail: function (g, S) {
        line(g, S, [[-0.09, 0.01], [0, 0.09], [0.09, 0.01]], 0.006, 'rgba(0,0,0,.25)');
        line(g, S, [[-0.03, 0.08], [-0.035, 0.24]], 0.004, 'rgba(255,255,255,.8)');
        line(g, S, [[0.03, 0.08], [0.035, 0.24]], 0.004, 'rgba(255,255,255,.8)');
        line(g, S, [[-0.13, 0.62], [-0.11, 0.44], [0.11, 0.44], [0.13, 0.62]], 0.004, 'rgba(0,0,0,.28)');
        line(g, S, [[-0.205, 0.66], [0.205, 0.66]], 0.008, 'rgba(0,0,0,.18)');
        line(g, S, [[-0.32, 0.57], [-0.245, 0.59]], 0.008, 'rgba(0,0,0,.18)');
        line(g, S, [[0.32, 0.57], [0.245, 0.59]], 0.008, 'rgba(0,0,0,.18)');
      }
    },
    dress: {
      w: 0.6, top: 0, h: 0.98, puff: 0.035,
      path: function (p) {
        p.moveTo(-0.06, 0); p.lineTo(-0.12, 0.01); p.lineTo(-0.14, 0.2); p.lineTo(-0.12, 0.33);
        p.quadraticCurveTo(-0.22, 0.6, -0.29, 0.95); p.quadraticCurveTo(0, 0.99, 0.29, 0.95);
        p.quadraticCurveTo(0.22, 0.6, 0.12, 0.33); p.lineTo(0.14, 0.2); p.lineTo(0.12, 0.01);
        p.lineTo(0.06, 0); p.quadraticCurveTo(0, 0.09, -0.06, 0);
      },
      detail: function (g, S) {
        line(g, S, [[-0.12, 0.33], [0.12, 0.33]], 0.006, 'rgba(0,0,0,.22)');
        [-0.16, -0.08, 0, 0.08, 0.16].forEach(function (x) {
          line(g, S, [[x * 0.5, 0.36], [x * 1.4, 0.94]], 0.006, 'rgba(0,0,0,.08)');
        });
      }
    },
    jeans: {
      w: 0.46, top: 0, h: 0.98, puff: 0.028,
      path: function (p) {
        p.moveTo(-0.18, 0); p.lineTo(0.18, 0); p.lineTo(0.21, 0.97); p.lineTo(0.035, 0.97);
        p.lineTo(0, 0.3); p.lineTo(-0.035, 0.97); p.lineTo(-0.21, 0.97); p.closePath();
      },
      detail: function (g, S) {
        g.save();
        g.globalAlpha = 0.12;
        for (var i = -40; i < 40; i++) line(g, S, [[i * 0.02, 0], [i * 0.02 + 0.5, 1.0]], 0.002, '#000');
        g.restore();
        line(g, S, [[-0.18, 0.05], [0.18, 0.05]], 0.004, 'rgba(0,0,0,.3)');
        line(g, S, [[0, 0.05], [0, 0.22], [0.04, 0.26]], 0.003, 'rgba(0,0,0,.3)');
        line(g, S, [[-0.17, 0.07], [-0.1, 0.17], [-0.06, 0.07]], 0.003, 'rgba(0,0,0,.3)');
        line(g, S, [[0.17, 0.07], [0.1, 0.17], [0.06, 0.07]], 0.003, 'rgba(0,0,0,.3)');
        [-0.12, 0.12].forEach(function (x) { dot(g, S, x, 0.025, 0.009, 'rgba(200,150,60,.9)'); });
        line(g, S, [[-0.205, 0.94], [-0.04, 0.94]], 0.004, 'rgba(0,0,0,.25)');
        line(g, S, [[0.205, 0.94], [0.04, 0.94]], 0.004, 'rgba(0,0,0,.25)');
      }
    }
  };

  var S_PX = 420;   // pixels per metre in garment textures
  function toPx(k, x, y) { return [(x + k.w / 2) * S_PX, (y - k.top) * S_PX]; }
  var curK = null;
  function line(g, S, pts, wM, color, round) {
    g.beginPath();
    pts.forEach(function (p, i) { var q = toPx(curK, p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
    g.lineWidth = wM * S_PX;
    g.lineCap = g.lineJoin = 'round';
    g.strokeStyle = color;
    g.stroke();
  }
  function poly(g, S, pts, color) {
    g.beginPath();
    pts.forEach(function (p, i) { var q = toPx(curK, p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
    g.closePath(); g.fillStyle = color; g.fill();
  }
  function dot(g, S, x, y, r, color, stroke) {
    var q = toPx(curK, x, y);
    g.beginPath(); g.arc(q[0], q[1], r * S_PX, 0, Math.PI * 2); g.fillStyle = color; g.fill();
    if (stroke) { g.lineWidth = 1.5; g.strokeStyle = stroke; g.stroke(); }
  }
  /* canvas path adapter so outlines draw in metres */
  function pathOn(g, k) {
    var T = function (x, y) { return toPx(k, x, y); };
    return {
      moveTo: function (x, y) { var q = T(x, y); g.moveTo(q[0], q[1]); },
      lineTo: function (x, y) { var q = T(x, y); g.lineTo(q[0], q[1]); },
      quadraticCurveTo: function (a, b, x, y) { var c = T(a, b), q = T(x, y); g.quadraticCurveTo(c[0], c[1], q[0], q[1]); },
      closePath: function () { g.closePath(); }
    };
  }

  var GARM = {};
  function garmentAssets(kind) {
    if (GARM[kind]) return GARM[kind];
    var k = KINDS[kind];
    var W = Math.round(k.w * S_PX), H = Math.round(k.h * S_PX);
    var c = TX.canvas(W, H), g = c.getContext('2d');
    // silhouette
    g.beginPath(); k.path(pathOn(g, k)); g.closePath();
    g.fillStyle = '#ffffff'; g.fill();
    var alpha = g.getImageData(0, 0, W, H).data;
    // fabric detail inside the silhouette
    g.save();
    g.beginPath(); k.path(pathOn(g, k)); g.closePath(); g.clip();
    curK = k;
    var sh = g.createLinearGradient(0, 0, W, 0);
    sh.addColorStop(0, 'rgba(0,0,0,.10)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.10)');
    g.fillStyle = sh; g.fillRect(0, 0, W, H);
    TX.noise(g, W, H, 0.07, Math.round(W * H / 20), true);
    k.detail(g, S_PX);
    g.restore();
    var map = TX.tex(c);

    // geometry: two displaced grids (front + back) sharing the silhouette
    var nx = 20, ny = 30, verts = [], uvs = [], idx = [];
    function inside(px, py) {
      px = Math.max(0, Math.min(W - 1, px | 0)); py = Math.max(0, Math.min(H - 1, py | 0));
      return alpha[(py * W + px) * 4 + 3] > 127 ? 1 : 0;
    }
    var rad = 0.045 * S_PX;
    for (var side = 0; side < 2; side++) {
      for (var j = 0; j <= ny; j++) {
        for (var i = 0; i <= nx; i++) {
          var u = i / nx, v = j / ny;
          var px = u * (W - 1), py = v * (H - 1);
          var acc = 0, n = 0;
          for (var a = 0; a < 12; a++) {
            var ang = (a / 12) * Math.PI * 2;
            acc += inside(px + Math.cos(ang) * rad, py + Math.sin(ang) * rad);
            acc += inside(px + Math.cos(ang) * rad * 0.5, py + Math.sin(ang) * rad * 0.5);
            n += 2;
          }
          var f = inside(px, py) ? acc / n : 0;
          var s = Math.max(0, Math.min(1, (f - 0.35) / 0.65));
          s = s * s * (3 - 2 * s);
          var x = -k.w / 2 + u * k.w, y = -(k.top + v * k.h);
          var fold = Math.sin(x * 42 + (kind.length)) * 0.006 * Math.pow(v, 1.4);
          var d = (k.puff * s + fold * s) * (side ? -0.75 : 1);
          verts.push(x, y, d);
          uvs.push(u, 1 - v);
        }
      }
    }
    var row = nx + 1, off = row * (ny + 1);
    for (var jj = 0; jj < ny; jj++) {
      for (var ii = 0; ii < nx; ii++) {
        var a0 = jj * row + ii, b0 = a0 + 1, c0 = a0 + row, d0 = c0 + 1;
        idx.push(a0, c0, b0, b0, c0, d0);
        idx.push(off + a0, off + b0, off + c0, off + b0, off + d0, off + c0);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    GARM[kind] = { geo: geo, map: map, mats: {} };
    return GARM[kind];
  }

  var HANGER = null;
  function hangerGeo() {
    if (HANGER) return HANGER;
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.21, -0.05, 0), new THREE.Vector3(-0.11, -0.012, 0), new THREE.Vector3(0, 0.004, 0),
      new THREE.Vector3(0.11, -0.012, 0), new THREE.Vector3(0.21, -0.05, 0)
    ]);
    HANGER = {
      bar: new THREE.TubeGeometry(curve, 24, 0.009, 8, false),
      hook: new THREE.TorusGeometry(0.03, 0.0035, 6, 18, Math.PI * 1.35),
      neck: new THREE.CylinderGeometry(0.0035, 0.0035, 0.05, 6)
    };
    return HANGER;
  }
  var hangerWood = null;

  /* Garment on a wooden hanger. Origin = top of the hook (where it sits on the rail). */
  function garment(kind, color, opts) {
    opts = opts || {};
    var A = garmentAssets(kind);
    if (!A.mats[color]) {
      A.mats[color] = new THREE.MeshStandardMaterial({ map: A.map, color: color, roughness: 0.88, alphaTest: 0.5, side: THREE.DoubleSide });
    }
    var root = new THREE.Group();
    var body = new THREE.Group();
    body.position.y = -0.1;
    var m = new THREE.Mesh(A.geo, A.mats[color]);
    body.add(m);
    if (!opts.noHanger) {
      var H = hangerGeo();
      hangerWood = hangerWood || mat('#b98552', 0.45);
      if (kind !== 'jeans') {
        var bar = new THREE.Mesh(H.bar, hangerWood);
        bar.position.y = 0.012;
        body.add(bar);
      } else {
        var clip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.022, 0.03), hangerWood);
        clip.position.y = 0.008;
        body.add(clip);
      }
      var hook = new THREE.Mesh(H.hook, brass());
      hook.position.y = 0.075;
      hook.rotation.z = -Math.PI * 0.18;
      body.add(hook);
      var neck = new THREE.Mesh(H.neck, brass());
      neck.position.y = 0.035;
      body.add(neck);
    }
    root.add(body);
    root.userData.body = body;
    root.userData.phase = Math.random() * Math.PI * 2;
    root.userData.kind = kind;
    return root;
  }
  function randomCloth() { return CLOTH[(Math.random() * CLOTH.length) | 0]; }
  function randomGarment(opts) {
    var kinds = ['tshirt', 'tshirt', 'shirt', 'hoodie', 'dress', 'jeans'];
    var k = kinds[(Math.random() * kinds.length) | 0];
    return garment(k, k === 'jeans' ? DENIM[(Math.random() * DENIM.length) | 0] : randomCloth(), opts);
  }

  /* ---------------- people ---------------- */
  var SKIN = ['#f0c6a4', '#dba07d', '#b97a55', '#8a5638', '#f5d5bd'];
  var HAIR = ['#2a1a12', '#5b3a24', '#c99a52', '#8c3b1a', '#191714', '#d9c7a6'];

  function taper(rTop, rBot, len, seg) { return new THREE.CylinderGeometry(rTop, rBot, len, seg || 14, 1); }
  function lathe(points, seg) { return new THREE.LatheGeometry(points.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 24); }

  var TORSO = null, PELVIS = null;
  function torsoGeo() {
    TORSO = TORSO || lathe([[0.001, 0], [0.135, 0], [0.15, 0.08], [0.142, 0.2], [0.158, 0.33], [0.178, 0.44], [0.172, 0.52], [0.13, 0.575], [0.06, 0.6], [0.001, 0.6]], 26);
    return TORSO;
  }
  function pelvisGeo() {
    PELVIS = PELVIS || lathe([[0.001, 0], [0.13, 0], [0.155, 0.07], [0.15, 0.16], [0.001, 0.16]], 22);
    return PELVIS;
  }

  function person(o) {
    o = o || {};
    var shirt = o.shirt || randomCloth();
    var pants = o.pants || DENIM[(Math.random() * DENIM.length) | 0];
    var skin = o.skin || SKIN[(Math.random() * SKIN.length) | 0];
    var hair = o.hair || HAIR[(Math.random() * HAIR.length) | 0];
    var shoe = o.shoe || '#f2efe8';
    var mShirt = mat(shirt, 0.85), mPants = mat(pants, 0.8), mSkin = mat(skin, 0.5), mHair = mat(hair, 0.65), mShoe = mat(shoe, 0.55);

    var root = new THREE.Group();
    var body = new THREE.Group();
    root.add(body);

    function leg(x) {
      var hip = new THREE.Group(); hip.position.set(x, 0.93, 0); body.add(hip);
      var thigh = new THREE.Mesh(taper(0.074, 0.056, 0.46), mPants); thigh.position.y = -0.23; hip.add(thigh);
      var knee = new THREE.Group(); knee.position.y = -0.46; hip.add(knee);
      var kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 10), mPants); knee.add(kneeCap);
      var shin = new THREE.Mesh(taper(0.054, 0.044, 0.42), mPants); shin.position.y = -0.21; knee.add(shin);
      var foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.15, 4, 10), mShoe);
      foot.rotation.x = Math.PI / 2; foot.position.set(0, -0.43, 0.05); foot.scale.set(1.1, 1, 0.75);
      knee.add(foot);
      return { hip: hip, knee: knee };
    }
    var L = leg(-0.088), R = leg(0.088);

    var pelvis = new THREE.Mesh(pelvisGeo(), mPants); pelvis.position.y = 0.86; pelvis.scale.z = 0.7; body.add(pelvis);
    var torso = new THREE.Mesh(torsoGeo(), mShirt); torso.position.y = 0.94; torso.scale.set(o.wide ? 1.08 : 1, 1, 0.66); body.add(torso);

    function arm(x) {
      var sh = new THREE.Group(); sh.position.set(x, 1.465, 0); body.add(sh);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 10), mShirt); sh.add(cap);
      var upper = new THREE.Mesh(taper(0.052, 0.042, 0.29), mShirt); upper.position.y = -0.145; sh.add(upper);
      var elbow = new THREE.Group(); elbow.position.y = -0.29; sh.add(elbow);
      var fore = new THREE.Mesh(taper(0.04, 0.031, 0.25), o.longSleeves ? mShirt : mSkin); fore.position.y = -0.125; elbow.add(fore);
      var hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), mSkin); hand.scale.set(0.8, 1.25, 0.6); hand.position.y = -0.29; elbow.add(hand);
      sh.rotation.z = x < 0 ? 0.07 : -0.07;
      elbow.rotation.x = -0.18;
      return { sh: sh, elbow: elbow };
    }
    var AL = arm(-0.19), AR = arm(0.19);

    var headPivot = new THREE.Group(); headPivot.position.y = 1.55; body.add(headPivot);
    var neck = new THREE.Mesh(taper(0.045, 0.05, 0.12), mSkin); neck.position.y = 0.02; headPivot.add(neck);
    var head = new THREE.Group(); head.position.y = 0.15; headPivot.add(head);
    var skull = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), mSkin); skull.scale.set(0.9, 1.08, 0.98); head.add(skull);
    var jaw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 12), mSkin); jaw.position.set(0, -0.05, 0.02); jaw.scale.set(1, 0.85, 1); head.add(jaw);
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), mSkin); nose.position.set(0, -0.012, 0.098); nose.scale.set(1, 1.3, 1.3); head.add(nose);
    [-1, 1].forEach(function (s) {
      var ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), mSkin); ear.position.set(s * 0.09, -0.005, 0); ear.scale.set(0.45, 1, 0.8); head.add(ear);
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), mat('#f7f4ee', 0.2)); eye.position.set(s * 0.034, 0.012, 0.082); head.add(eye);
      var iris = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), mat('#2a1c14', 0.15)); iris.position.set(s * 0.034, 0.012, 0.096); head.add(iris);
      var brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.022, 3, 6), mHair); brow.rotation.z = Math.PI / 2 + s * 0.12; brow.position.set(s * 0.035, 0.04, 0.09); head.add(brow);
    });
    var mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.0035, 0.024, 3, 6), mat('#8a4a3a', 0.6)); mouth.rotation.z = Math.PI / 2; mouth.position.set(0, -0.055, 0.086); head.add(mouth);

    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.108, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), mHair);
    cap.position.set(0, 0.012, -0.006); cap.scale.set(0.95, 1.12, 1.02); cap.rotation.x = -0.18; head.add(cap);
    if (o.hairStyle === 'long') {
      var back = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.2, 6, 14), mHair); back.position.set(0, -0.08, -0.05); back.scale.set(1.05, 1, 0.55); head.add(back);
    } else if (o.hairStyle === 'bun') {
      var bun = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), mHair); bun.position.set(0, 0.1, -0.07); head.add(bun);
    } else {
      var quiff = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), mHair); quiff.position.set(0.01, 0.085, 0.03); quiff.scale.set(1.3, 0.6, 1); head.add(quiff);
    }
    if (o.bag) {
      var bag = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.08), mat(o.bag, 0.6));
      bag.position.set(-0.03, -0.25, 0.02); AL.elbow.add(bag);
      var strap = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 16, Math.PI), mat(o.bag, 0.6));
      strap.position.set(-0.03, -0.1, 0.02); AL.elbow.add(strap);
    }

    root.traverse(function (n) { if (n.isMesh) n.castShadow = true; });
    root.scale.setScalar(o.scale || 1);
    return { root: root, body: body, L: L, R: R, AL: AL, AR: AR, head: headPivot };
  }

  /* Wandering shopper: walks between browse spots, stops, reaches for clothes. */
  function Walker(p, spots, startIndex, obstacles, dynamic) {
    this.p = p;
    this.spots = spots;
    this.obs = obstacles || [];
    this.dyn = dynamic || function () { return null; };
    this.idx = startIndex % spots.length;
    var s = spots[this.idx];
    p.root.position.set(s.x, 0, s.z);
    p.root.rotation.y = s.face;
    this.state = 'browse';
    this.timer = 1 + Math.random() * 3;
    this.phase = Math.random() * 6;
    this.speed = 0.55 + Math.random() * 0.15;
    this.reach = 0;
    this.t = Math.random() * 10;
    this.idle = !!s.idle;
  }
  function angleLerp(a, b, k) {
    var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return a + d * k;
  }
  Walker.prototype.pickNext = function () {
    if (this.spots.length < 2) { this.timer = 3 + Math.random() * 3; return; }
    var n = this.idx;
    while (n === this.idx) n = (Math.random() * this.spots.length) | 0;
    this.idx = n;
    this.state = 'walk';
  };
  Walker.prototype.update = function (dt) {
    var p = this.p, r = p.root, tgt = this.spots[this.idx];
    this.t += dt;
    if (this.state === 'walk') {
      var dx = tgt.x - r.position.x, dz = tgt.z - r.position.z;
      var dist = Math.hypot(dx, dz);
      if (dist < 0.06) {
        this.state = 'browse';
        this.timer = 2.5 + Math.random() * 4.5;
      } else {
        var vx = dx / dist, vz = dz / dist;
        var list = this.obs.slice();
        var d = this.dyn();
        if (d) list.push(d);
        for (var i = 0; i < list.length; i++) {
          var o = list[i];
          var ox = r.position.x - o.x, oz = r.position.z - o.z;
          var od = Math.hypot(ox, oz) || 0.001;
          var R = o.r + 0.32;
          if (od < R && dist > 0.25) {
            var k = (R - od) / R * 2.4;
            var side = (ox * vz - oz * vx) >= 0 ? 1 : -1;
            vx += (ox / od) * k + (-oz / od) * side * k;
            vz += (oz / od) * k + (ox / od) * side * k;
          }
        }
        var vl = Math.hypot(vx, vz) || 1;
        vx /= vl; vz /= vl;
        var step = Math.min(dist, this.speed * dt);
        r.position.x += vx * step;
        r.position.z += vz * step;
        r.rotation.y = angleLerp(r.rotation.y, Math.atan2(vx, vz), Math.min(1, dt * 5));
        this.phase += dt * this.speed * 8.5;
      }
      this.reach = Math.max(0, this.reach - dt * 3);
    } else {
      r.rotation.y = angleLerp(r.rotation.y, tgt.face, Math.min(1, dt * 3.5));
      this.phase *= (1 - Math.min(1, dt * 8));
      if (!this.idle) this.reach = Math.min(1, this.reach + dt * 1.4);
      this.timer -= dt;
      if (this.timer <= 0) this.pickNext();
    }
    var walking = this.state === 'walk' ? 1 : 0;
    var s = Math.sin(this.phase), c = Math.cos(this.phase);
    p.L.hip.rotation.x = -s * 0.42 * walking;
    p.R.hip.rotation.x = s * 0.42 * walking;
    p.L.knee.rotation.x = Math.max(0, Math.sin(this.phase + 1.3)) * 0.75 * walking + 0.04;
    p.R.knee.rotation.x = Math.max(0, Math.sin(this.phase + 1.3 + Math.PI)) * 0.75 * walking + 0.04;
    p.body.position.y = (Math.abs(c) * 0.025 - 0.012) * walking;
    p.body.rotation.y = s * 0.06 * walking;
    var breathe = Math.sin(this.t * 1.6) * 0.012;
    p.AL.sh.rotation.x = s * 0.32 * walking + breathe;
    p.AL.elbow.rotation.x = -0.22 - Math.max(0, s) * 0.25 * walking;
    var flick = Math.sin(this.t * 2.4) * 0.14 * this.reach;
    p.AR.sh.rotation.x = -s * 0.32 * walking - this.reach * 0.95 + breathe;
    p.AR.sh.rotation.z = -0.07 + flick * 0.6;
    p.AR.elbow.rotation.x = -0.22 - this.reach * 0.55 - Math.max(0, -s) * 0.25 * walking;
    p.head.rotation.y = Math.sin(this.t * 0.6) * 0.3 * (1 - walking * 0.6);
    p.head.rotation.x = this.reach * 0.14 + Math.sin(this.t * 0.4) * 0.03;
  };

  window.PARTS = {
    CLOTH: CLOTH,
    DENIM: DENIM,
    mat: mat,
    brass: brass,
    garment: garment,
    randomGarment: randomGarment,
    randomCloth: randomCloth,
    person: person,
    Walker: Walker
  };
})();
