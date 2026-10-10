/* Stylized shoppers and garment geometry. Exposed as window.PARTS. */
(function () {
  'use strict';

  var PALETTE = ['#ff5a5f', '#ffb400', '#2ec4b6', '#3a86ff', '#8338ec', '#ff006e',
    '#06d6a0', '#f1faee', '#1d3557', '#ef8354', '#9b5de5', '#f15bb5', '#00bbf9', '#fee440'];

  var matCache = {};
  function mat(color, rough) {
    var key = color + '|' + (rough || 0.65);
    if (!matCache[key]) {
      matCache[key] = new THREE.MeshStandardMaterial({ color: color, roughness: rough || 0.65, metalness: 0 });
    }
    return matCache[key];
  }

  /* ---------- garments ---------- */
  function tshirtShape() {
    var s = new THREE.Shape();
    s.moveTo(-0.07, 0);
    s.lineTo(-0.17, -0.025);
    s.lineTo(-0.28, -0.1);
    s.lineTo(-0.23, -0.2);
    s.lineTo(-0.165, -0.16);
    s.lineTo(-0.175, -0.62);
    s.quadraticCurveTo(0, -0.645, 0.175, -0.62);
    s.lineTo(0.165, -0.16);
    s.lineTo(0.23, -0.2);
    s.lineTo(0.28, -0.1);
    s.lineTo(0.17, -0.025);
    s.lineTo(0.07, 0);
    s.quadraticCurveTo(0, -0.07, -0.07, 0);
    return s;
  }
  function hoodieShape() {
    var s = new THREE.Shape();
    s.moveTo(-0.08, 0);
    s.lineTo(-0.19, -0.03);
    s.lineTo(-0.27, -0.2);
    s.lineTo(-0.3, -0.58);
    s.lineTo(-0.23, -0.6);
    s.lineTo(-0.19, -0.27);
    s.lineTo(-0.19, -0.66);
    s.lineTo(0.19, -0.66);
    s.lineTo(0.19, -0.27);
    s.lineTo(0.23, -0.6);
    s.lineTo(0.3, -0.58);
    s.lineTo(0.27, -0.2);
    s.lineTo(0.19, -0.03);
    s.lineTo(0.08, 0);
    s.quadraticCurveTo(0, -0.09, -0.08, 0);
    return s;
  }
  function dressShape() {
    var s = new THREE.Shape();
    s.moveTo(-0.06, 0);
    s.lineTo(-0.12, -0.01);
    s.lineTo(-0.14, -0.2);
    s.lineTo(-0.12, -0.32);
    s.quadraticCurveTo(-0.22, -0.6, -0.27, -0.92);
    s.quadraticCurveTo(0, -0.96, 0.27, -0.92);
    s.quadraticCurveTo(0.22, -0.6, 0.12, -0.32);
    s.lineTo(0.14, -0.2);
    s.lineTo(0.12, -0.01);
    s.lineTo(0.06, 0);
    s.quadraticCurveTo(0, -0.08, -0.06, 0);
    return s;
  }
  function pantsShape() {
    var s = new THREE.Shape();
    s.moveTo(-0.18, 0);
    s.lineTo(0.18, 0);
    s.lineTo(0.21, -0.95);
    s.lineTo(0.035, -0.95);
    s.lineTo(0, -0.3);
    s.lineTo(-0.035, -0.95);
    s.lineTo(-0.21, -0.95);
    s.closePath();
    return s;
  }

  var EXTRUDE = { depth: 0.022, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 8 };
  var GEO = {};
  function garmentGeo(kind) {
    if (!GEO[kind]) {
      var shape = { tshirt: tshirtShape, hoodie: hoodieShape, dress: dressShape, pants: pantsShape }[kind]();
      var g = new THREE.ExtrudeGeometry(shape, EXTRUDE);
      g.translate(0, 0, -0.011);
      GEO[kind] = g;
    }
    return GEO[kind];
  }

  var hangerMat = null;
  function hanger() {
    if (!hangerMat) hangerMat = new THREE.MeshStandardMaterial({ color: '#d7dbe6', metalness: 0.9, roughness: 0.25 });
    var g = new THREE.Group();
    var hook = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0045, 6, 16, Math.PI * 1.35), hangerMat);
    hook.position.set(0, 0.075, 0);
    hook.rotation.z = -Math.PI * 0.18;
    g.add(hook);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.05, 6), hangerMat);
    neck.position.y = 0.025;
    g.add(neck);
    var armGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.2, 6);
    var l = new THREE.Mesh(armGeo, hangerMat);
    l.position.set(-0.095, 0.005, 0);
    l.rotation.z = Math.PI / 2 - 0.22;
    var r = new THREE.Mesh(armGeo, hangerMat);
    r.position.set(0.095, 0.005, 0);
    r.rotation.z = -(Math.PI / 2 - 0.22);
    g.add(l, r);
    return g;
  }

  /* A garment on a hanger. Origin = top of the hook (where it sits on the rail). */
  function garment(kind, color, opts) {
    opts = opts || {};
    var root = new THREE.Group();
    var body = new THREE.Group();
    body.position.y = -0.1;
    var m = new THREE.Mesh(garmentGeo(kind), mat(color, 0.8));
    body.add(m);
    if (opts.noHanger) {
      // nothing: hangs flat on a wall hook
    } else if (kind !== 'pants') body.add(hanger());
    else {
      var clip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.03), mat('#2b2b33', 0.4));
      clip.position.y = 0.01;
      body.add(clip);
      var hk = hanger();
      hk.children[2].visible = false;
      hk.children[3].visible = false;
      hk.position.y = 0.01;
      body.add(hk);
    }
    root.add(body);
    root.userData.body = body;
    root.userData.phase = Math.random() * Math.PI * 2;
    return root;
  }

  /* ---------- people ---------- */
  var SKIN = ['#f1c7a5', '#d9a07a', '#a86b4a', '#7a4a32', '#f6d5bd'];
  var HAIR = ['#2b1b14', '#5a3825', '#e0b25a', '#c2410c', '#1a1a1a', '#9b5de5'];

  function person(opts) {
    opts = opts || {};
    var shirt = opts.shirt || PALETTE[Math.floor(Math.random() * PALETTE.length)];
    var pants = opts.pants || ['#1d3557', '#2b2d42', '#3a3a52', '#6b705c', '#264653'][Math.floor(Math.random() * 5)];
    var skin = opts.skin || SKIN[Math.floor(Math.random() * SKIN.length)];
    var hair = opts.hair || HAIR[Math.floor(Math.random() * HAIR.length)];
    var s = opts.scale || 1;

    var root = new THREE.Group();
    var body = new THREE.Group();
    root.add(body);

    var legGeo = new THREE.CapsuleGeometry(0.065, 0.56, 4, 10);
    function leg(x) {
      var hip = new THREE.Group();
      hip.position.set(x, 0.78, 0);
      var m = new THREE.Mesh(legGeo, mat(pants));
      m.position.y = -0.37;
      hip.add(m);
      var shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.2), mat('#f4f4f4', 0.5));
      shoe.position.set(0, -0.73, 0.035);
      hip.add(shoe);
      body.add(hip);
      return hip;
    }
    var hipL = leg(-0.085), hipR = leg(0.085);

    var torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.4, 6, 14), mat(shirt));
    torso.position.y = 1.1;
    torso.scale.z = 0.72;
    body.add(torso);

    var armGeo = new THREE.CapsuleGeometry(0.052, 0.46, 4, 8);
    function arm(x) {
      var sh = new THREE.Group();
      sh.position.set(x, 1.36, 0);
      var m = new THREE.Mesh(armGeo, mat(shirt));
      m.position.y = -0.26;
      sh.add(m);
      var hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat(skin));
      hand.position.y = -0.53;
      sh.add(hand);
      body.add(sh);
      return sh;
    }
    var armL = arm(-0.22), armR = arm(0.22);
    armL.rotation.z = 0.08;
    armR.rotation.z = -0.08;

    var headPivot = new THREE.Group();
    headPivot.position.y = 1.5;
    body.add(headPivot);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 10), mat(skin));
    neck.position.y = 0.0;
    headPivot.add(neck);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 18, 14), mat(skin));
    head.position.y = 0.15;
    head.scale.set(0.95, 1.05, 1);
    headPivot.add(head);
    var hairM = new THREE.Mesh(new THREE.SphereGeometry(0.133, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(hair, 0.9));
    hairM.position.y = 0.17;
    hairM.rotation.x = -0.25;
    headPivot.add(hairM);
    if (opts.longHair) {
      var back = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.16, 4, 10), mat(hair, 0.9));
      back.position.set(0, 0.06, -0.07);
      back.scale.z = 0.6;
      headPivot.add(back);
    }
    if (opts.bag) {
      var bag = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.09), mat(opts.bag, 0.6));
      bag.position.set(0, -0.62, 0.06);
      armL.add(bag);
    }

    var shadowMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.22, depthWrite: false });
    var shadow = new THREE.Mesh(new THREE.CircleGeometry(0.26, 20), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.006;
    root.add(shadow);

    root.scale.setScalar(s);
    return { root: root, body: body, hipL: hipL, hipR: hipR, armL: armL, armR: armR, head: headPivot };
  }

  /* Wandering shopper: walks between browse spots, stops, reaches for clothes. */
  function Walker(p, spots, startIndex, obstacles) {
    this.p = p;
    this.spots = spots;
    this.obs = obstacles || [];
    this.idx = startIndex % spots.length;
    var s = spots[this.idx];
    p.root.position.set(s.x, 0, s.z);
    p.root.rotation.y = s.face;
    this.state = 'browse';
    this.timer = 1 + Math.random() * 3;
    this.phase = Math.random() * 6;
    this.speed = 0.5 + Math.random() * 0.2;
    this.reach = 0;
    this.t = Math.random() * 10;
  }

  function angleLerp(a, b, k) {
    var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return a + d * k;
  }

  Walker.prototype.pickNext = function () {
    var n = this.idx;
    while (n === this.idx) n = Math.floor(Math.random() * this.spots.length);
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
        this.timer = 2.5 + Math.random() * 4;
      } else {
        var vx = dx / dist, vz = dz / dist;
        // steer around racks: push away + slide along the tangent
        for (var i = 0; i < this.obs.length; i++) {
          var o = this.obs[i];
          var ox = r.position.x - o.x, oz = r.position.z - o.z;
          var od = Math.hypot(ox, oz) || 0.001;
          var R = o.r + 0.35;
          if (od < R && dist > 0.3) {
            var k = (R - od) / R * 2.2;
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
        r.rotation.y = angleLerp(r.rotation.y, Math.atan2(vx, vz), Math.min(1, dt * 6));
        this.phase += dt * this.speed * 9;
      }
      this.reach = Math.max(0, this.reach - dt * 3);
    } else {
      r.rotation.y = angleLerp(r.rotation.y, tgt.face, Math.min(1, dt * 4));
      this.phase = this.phase * (1 - Math.min(1, dt * 8));
      this.reach = Math.min(1, this.reach + dt * 1.6);
      this.timer -= dt;
      if (this.timer <= 0) this.pickNext();
    }
    var sw = Math.sin(this.phase);
    var walking = this.state === 'walk' ? 1 : 0;
    p.hipL.rotation.x = sw * 0.55 * walking;
    p.hipR.rotation.x = -sw * 0.55 * walking;
    p.body.position.y = Math.abs(Math.cos(this.phase)) * 0.035 * walking;
    p.armL.rotation.x = -sw * 0.4 * walking;
    // right arm reaches into the rack and flicks through hangers
    var flick = Math.sin(this.t * 2.6) * 0.18 * this.reach;
    p.armR.rotation.x = -sw * 0.4 * walking - this.reach * 1.25;
    p.armR.rotation.z = -0.08 + flick;
    p.head.rotation.y = Math.sin(this.t * 0.7) * 0.35 * (1 - walking * 0.6);
    p.head.rotation.x = this.reach * 0.12;
  };

  window.PARTS = {
    PALETTE: PALETTE,
    mat: mat,
    garment: garment,
    person: person,
    Walker: Walker
  };
})();
