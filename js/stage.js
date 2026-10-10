/* Product focus: the garment comes forward on its own transparent canvas while the shop
   behind is blurred. Drag sideways to tilt it (never edge-on); a longer drag or the
   Față/Spate switch flips it to the other side. Drag it down into the basket.
   Exposed as window.STAGE. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var el = {
    wrap: $('product'), canvas: $('stage'), sheet: $('sheet'), back: $('p-back'), basket: $('p-basket'),
    hint: $('p-hint'), brand: $('p-brand'), name: $('p-name'), price: $('p-price'), rows: $('p-rows'),
    gallery: $('p-gallery'), galleryWrap: $('p-gallery-wrap'), note: $('p-note'),
    lb: $('lightbox'), lbImg: $('lb-img'), lbCap: $('lb-cap'), lbCount: $('lb-count'),
    lbClose: $('lb-close'), lbPrev: $('lb-prev'), lbNext: $('lb-next'),
    faces: $('p-faces'), fFront: $('p-face-front'), fBack: $('p-face-back')
  };

  var renderer = null, scene, camera, root = null, product = null;
  var api = { onBack: null, onAdd: null, inCart: function () { return false; } };
  var rot = { y: 0, vel: 0, face: 0, target: 0, tilt: 0 }, intro = 0, open = false, raf = 0, last = 0, t = 0;
  var TILT = 0.55, FLIP_AT = 0.3;
  var carry = null, dropping = null, loose = null;

  function init() {
    if (renderer) return true;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el.canvas, antialias: true, alpha: true });
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.05, 20);
    scene.add(new THREE.HemisphereLight('#ffffff', '#c9d2d6', 0.85));
    var key = new THREE.DirectionalLight('#ffffff', 0.85); key.position.set(-1.2, 1.6, 2.2); scene.add(key);
    var rim = new THREE.DirectionalLight('#dff1f2', 0.55); rim.position.set(1.5, 1, -2); scene.add(rim);
    var fill = new THREE.DirectionalLight('#fff3e0', 0.35); fill.position.set(1.8, -0.5, 1.5); scene.add(fill);
    // the rail the hanger hangs on
    var railMat = new THREE.MeshStandardMaterial({ color: '#d4d9de', metalness: 0.75, roughness: 0.28 });
    var rail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.4, 20), railMat);
    rail.rotation.z = Math.PI / 2;
    rail.position.y = 0.004;
    scene.add(rail);
    window.addEventListener('resize', resize);
    bindInput();
    return true;
  }

  function resize() {
    if (!renderer) return;
    var r = el.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    var h = 1.05;   // garment + hook + tag
    var d = Math.max((h / 2) / Math.tan(THREE.MathUtils.degToRad(15)), (0.75 / 2) / (Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect));
    camera.position.set(0, -0.4, d * 1.22);
    camera.lookAt(0, -0.46, 0);
    camera.updateProjectionMatrix();
  }

  /* ---------------- open / close ---------------- */
  function show(p) {
    if (!init()) return false;
    product = p;
    open = true;
    el.wrap.hidden = false;
    el.wrap.classList.remove('is-leaving');
    document.body.classList.add('is-focused');
    resize();
    if (root) { scene.remove(root); root = null; }
    if (loose) { scene.remove(loose); loose = null; }
    rot.y = -0.5; rot.vel = 0; rot.face = 0; rot.target = 0; rot.tilt = 0; intro = 0; dropping = null; carry = null;
    var two = hasBack(p);
    el.faces.hidden = !two;
    setFaceUI();
    el.hint.innerHTML = two ? 'Trage stânga–dreapta ca s-o întorci pe spate<br>sau trage-o în jos, în coș' : 'Trage stânga–dreapta ca s-o înclini<br>sau trage-o în jos, în coș';
    var g = FIG.garment(p, { tagScale: 1.25 });
    g.visible = false;
    root = g;
    scene.add(g);
    g.userData.ready.then(function () { if (root === g) g.visible = true; });
    fillSheet(p);
    el.hint.hidden = false;
    el.hint.classList.remove('is-fading');
    updateBasket();
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
    setTimeout(function () { el.back.focus({ preventScroll: true }); }, 60);
    return true;
  }

  function hide() {
    if (!open) return Promise.resolve();
    open = false;
    el.wrap.classList.add('is-leaving');
    document.body.classList.remove('is-focused');
    return new Promise(function (res) {
      setTimeout(function () {
        el.wrap.hidden = true;
        el.wrap.classList.remove('is-leaving');
        cancelAnimationFrame(raf);
        res();
      }, reduce ? 10 : 320);
    });
  }

  function fillSheet(p) {
    el.brand.textContent = p.brand && p.brand !== '—' ? p.brand : 'UMERAȘ';
    el.name.textContent = p.name;
    el.price.textContent = p.price + ' lei';
    el.rows.innerHTML = '';
    p.details.forEach(function (d, i) {
      var row = document.createElement('div');
      row.className = 'p-row';
      row.style.animationDelay = (reduce ? 0 : 140 + i * 90) + 'ms';
      var k = document.createElement('dt'); k.textContent = d[0];
      var v = document.createElement('dd'); v.textContent = d[1];
      if (/de completat/.test(d[1])) v.classList.add('is-todo');
      row.appendChild(k); row.appendChild(v);
      el.rows.appendChild(row);
    });
    el.gallery.innerHTML = '';
    el.galleryWrap.hidden = !p.photos.length;
    el.note.hidden = !p.sample && p.real;
    el.note.textContent = p.sample ? 'Produs de test, doar pentru preview. Poza e preluată din ' + p.source + ' și nu se vinde.' : 'Haină demonstrativă. Pozele și detaliile reale apar când adaugi marfa ta.';
    p.photos.forEach(function (ph, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb';
      b.setAttribute('aria-label', 'Deschide poza: ' + ph.alt);
      var im = document.createElement('img');
      im.src = ph.src; im.alt = ph.alt; im.loading = 'lazy'; im.decoding = 'async';
      b.appendChild(im);
      b.addEventListener('click', function () { openLightbox(i); });
      el.gallery.appendChild(b);
    });
    el.sheet.scrollTop = 0;
  }

  function hasBack(p) { return !!(p && (p.texture && p.texture.back) || (p && !p.texture && !p.real)); }
  function setFaceUI() {
    el.fFront.classList.toggle('is-on', rot.face === 0);
    el.fBack.classList.toggle('is-on', rot.face === 1);
    el.fFront.setAttribute('aria-pressed', rot.face === 0);
    el.fBack.setAttribute('aria-pressed', rot.face === 1);
  }
  function flip(toFace, dir) {
    if (!product || !hasBack(product) || toFace === rot.face) return;
    rot.face = toFace;
    rot.target += Math.PI * (dir || 1);
    setFaceUI();
    hideHint();
  }

  function updateBasket() {
    var inCart = product && api.inCart(product.id);
    el.basket.classList.toggle('is-done', !!inCart);
    el.basket.querySelector('.b-text').textContent = inCart ? 'E în coș' : 'Pune în coș';
    el.basket.disabled = !!inCart;
  }

  /* ---------------- loop ---------------- */
  function loop(now) {
    var dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now; t += dt;
    if (root) {
      intro = Math.min(1, intro + dt / (reduce ? 0.2 : 0.9));
      var e = 1 - Math.pow(1 - intro, 3);
      {
        // spring towards the shown face plus a little tilt; never rests edge-on
        var sway = rot.dragging || reduce ? 0 : Math.sin(t * 0.7) * 0.1 * Math.min(1, intro * 2);
        var goal = rot.target + rot.tilt + sway;
        var prevY = rot.y;
        rot.vel += ((goal - rot.y) * 60 - rot.vel * 12) * dt;
        rot.y += rot.vel * dt;
        if (rot.dragging) { rot.y = prevY + (goal - prevY) * Math.min(1, dt * 18); rot.vel = (rot.y - prevY) / Math.max(dt, 0.001); }
        root.position.set(0, (1 - e) * -0.15, 0);
        root.scale.setScalar(0.75 + 0.25 * e);
      }
      root.rotation.y = rot.y;
      if (root.userData.body) FIG.swing(root, dt, -rot.vel * 0.12, t, -rot.vel * 0.3);
      if (dropping) {
        // the garment slips off the hanger and falls into the basket
        dropping.t += dt / 0.8;
        var p = Math.min(1, dropping.t), ep = p * p;
        var c = dropping.obj;
        c.position.lerpVectors(dropping.from, dropping.to, ep);
        c.position.y += Math.sin(Math.min(1, p * 1.6) * Math.PI) * 0.06;
        c.position.x += Math.sin(p * Math.PI * 2.2) * 0.03 * (1 - p);
        c.scale.setScalar(dropping.s0 * (1 - ep * 0.88));
        c.rotation.z = dropping.rz0 + ep * dropping.spin;
        c.rotation.x = Math.sin(p * Math.PI) * 0.5;
        root.userData.flutter = 1;
        if (p >= 1) finishDrop();
      }
    }
    renderer.render(scene, camera);
    if (open) raf = requestAnimationFrame(loop);
  }

  /* ---------------- input: rotate, carry, drop ---------------- */
  var ndc = new THREE.Vector2(), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  function worldAt(x, y) {
    var r = el.canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    ray.ray.intersectPlane(plane, hit);
    return hit.clone();
  }
  function overGarment(x, y) {
    if (!root || !root.userData.mesh) return false;
    var r = el.canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(root, true).length > 0;
  }
  function basketRect() { var r = el.basket.getBoundingClientRect(); return { x: r.left - 40, y: r.top - 50, w: r.width + 80, h: r.height + 90, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }

  function bindInput() {
    var drag = null;
    el.canvas.addEventListener('pointerdown', function (e) {
      if (dropping) return;
      drag = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: performance.now(), mode: null, onG: overGarment(e.clientX, e.clientY) };
      try { el.canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    el.canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.mode && Math.hypot(dx, dy) > 9) {
        var canCarry = drag.onG && dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.2 && !api.inCart(product.id);
        drag.mode = canCarry ? 'carry' : 'rotate';
        if (drag.mode === 'carry') {
          carry = { w0: worldAt(drag.x, drag.y) };
          el.basket.classList.add('is-target');
          FIG.kick(root, 2.4);          // lifting the garment off sets the hanger swinging
          root.userData.flutter = 0.8;
        }
        hideHint();
      }
      if (drag.mode === 'rotate') {
        var raw = (e.clientX - drag.x) * 0.006;
        // rubber band past the tilt limit
        rot.tilt = Math.abs(raw) <= TILT * 0.7 ? raw : Math.sign(raw) * (TILT * 0.7 + (TILT * 0.3) * (1 - Math.exp(-(Math.abs(raw) - TILT * 0.7) / (TILT * 0.3))));
        rot.dragging = true;
        drag.lx = e.clientX; drag.lt = performance.now();
      } else if (drag.mode === 'carry') {
        var w = worldAt(e.clientX, e.clientY);
        var body = root.userData.body, cl = root.userData.cloth;
        var a = body.worldToLocal(carry.w0.clone()), bb = body.worldToLocal(w.clone());
        cl.position.set(bb.x - a.x, bb.y - a.y, 0.04);
        var b = basketRect(), inside = e.clientX > b.x && e.clientX < b.x + b.w && e.clientY > b.y && e.clientY < b.y + b.h;
        el.basket.classList.toggle('is-hot', inside);
        cl.scale.setScalar(inside ? 0.8 : 1);
        root.userData.flutter = Math.max(root.userData.flutter, 0.4);
      }
    });
    function end(e) {
      if (!drag) return;
      var d = drag; drag = null;
      rot.dragging = false;
      if (d.mode === 'rotate') {
        var tl = rot.tilt;
        rot.tilt = 0;
        if (Math.abs(tl) > FLIP_AT && product && hasBack(product)) flip(1 - rot.face, tl > 0 ? 1 : -1);
      }
      if (d.mode === 'carry') {
        var b = basketRect();
        var inside = e && e.clientX > b.x && e.clientX < b.x + b.w && e.clientY > b.y && e.clientY < b.y + b.h;
        el.basket.classList.remove('is-target', 'is-hot');
        if (inside) startDrop();
        else { carry = null; springBack(); }
      }
    }
    el.canvas.addEventListener('pointerup', end);
    el.canvas.addEventListener('pointercancel', function () { end(null); });

    el.back.addEventListener('click', function () { if (api.onBack) api.onBack(); });
    el.fFront.addEventListener('click', function () { flip(0, -1); });
    el.fBack.addEventListener('click', function () { flip(1, 1); });
    el.basket.addEventListener('click', function () { if (!dropping && product && !api.inCart(product.id)) startDrop(); });

    // lightbox
    el.lbClose.addEventListener('click', closeLightbox);
    el.lbPrev.addEventListener('click', function () { step(-1); });
    el.lbNext.addEventListener('click', function () { step(1); });
    document.addEventListener('keydown', function (e) {
      if (!el.lb.hidden) {
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'ArrowRight') step(1);
        return;
      }
      if (open && e.key === 'Escape' && api.onBack) api.onBack();
      if (open && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { if (hasBack(product)) flip(1 - rot.face, e.key === 'ArrowLeft' ? -1 : 1); else rot.vel += e.key === 'ArrowLeft' ? -3 : 3; hideHint(); }
    });
    bindZoom();
  }

  /* dropped outside the basket: the garment goes back onto its hanger */
  function springBack() {
    var cl = root.userData.cloth, from = cl.position.clone(), s0 = cl.scale.x, t0 = performance.now();
    (function anim(now) {
      var p = Math.min(1, (now - t0) / 420), e = 1 - Math.pow(1 - p, 3);
      cl.position.lerpVectors(from, new THREE.Vector3(0, 0, 0), e);
      cl.scale.setScalar(s0 + (1 - s0) * e);
      if (p < 1) requestAnimationFrame(anim);
      else FIG.kick(root, -1.2);
    })(t0);
  }

  function startDrop() {
    hideHint();
    if (!root || !root.userData.cloth) return;
    var b = basketRect();
    var target = worldAt(b.cx, b.cy - 6);
    var cl = root.userData.cloth;
    scene.attach(cl);                 // the garment leaves the hanger; the hanger stays on the rail
    loose = cl;
    dropping = { t: 0, obj: cl, from: cl.position.clone(), to: target, s0: cl.scale.x, rz0: cl.rotation.z, spin: (Math.random() < 0.5 ? -1 : 1) * 0.7 };
    FIG.kick(root, 3.2);
    root.userData.flutter = 1;
    el.basket.classList.add('is-hot');
  }
  function finishDrop() {
    var p = product;
    if (dropping && dropping.obj) { scene.remove(dropping.obj); }
    loose = null;
    dropping = null;
    carry = null;
    FIG.kick(root, -1.6);
    el.basket.classList.remove('is-hot');
    el.basket.classList.add('is-bump');
    setTimeout(function () { el.basket.classList.remove('is-bump'); }, 450);
    if (api.onAdd) api.onAdd(p);
    updateBasket();
  }

  function hideHint() {
    if (el.hint.hidden) return;
    el.hint.classList.add('is-fading');
    setTimeout(function () { el.hint.hidden = true; }, 300);
  }

  /* ---------------- lightbox with pinch / double-tap zoom ---------------- */
  var lbIndex = 0, z = { s: 1, x: 0, y: 0 }, lastFocus = null;
  function openLightbox(i) {
    lastFocus = document.activeElement;
    lbIndex = i;
    el.lb.hidden = false;
    setPhoto();
    el.lbClose.focus({ preventScroll: true });
  }
  function closeLightbox() {
    el.lb.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function step(d) {
    if (!product || !product.photos.length) return;
    lbIndex = (lbIndex + d + product.photos.length) % product.photos.length;
    setPhoto();
  }
  function setPhoto() {
    var ph = product.photos[lbIndex];
    el.lbImg.src = ph.src;
    el.lbImg.alt = ph.alt;
    el.lbCap.textContent = ph.alt;
    el.lbCount.textContent = (lbIndex + 1) + ' / ' + product.photos.length;
    z = { s: 1, x: 0, y: 0 };
    applyZoom();
  }
  function applyZoom() { el.lbImg.style.transform = 'translate(' + z.x + 'px,' + z.y + 'px) scale(' + z.s + ')'; }
  function bindZoom() {
    var pts = {}, startD = 0, startS = 1, pan = null, lastTap = 0, swipe = null;
    var stageEl = el.lbImg.parentElement;
    stageEl.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { stageEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        startD = Math.hypot(a.x - b.x, a.y - b.y); startS = z.s; pan = null; swipe = null;
      } else {
        pan = { x: e.clientX, y: e.clientY, zx: z.x, zy: z.y };
        swipe = z.s === 1 ? { x: e.clientX, t: performance.now() } : null;
        var now = performance.now();
        if (now - lastTap < 300) {
          z = z.s > 1 ? { s: 1, x: 0, y: 0 } : { s: 2.6, x: 0, y: 0 };
          applyZoom(); lastTap = 0; swipe = null;
        } else lastTap = now;
      }
    });
    stageEl.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        z.s = Math.max(1, Math.min(5, startS * Math.hypot(a.x - b.x, a.y - b.y) / startD));
        if (z.s === 1) { z.x = 0; z.y = 0; }
        applyZoom();
      } else if (pan && z.s > 1) {
        z.x = pan.zx + (e.clientX - pan.x); z.y = pan.zy + (e.clientY - pan.y);
        applyZoom();
      }
    });
    function up(e) {
      delete pts[e.pointerId];
      if (swipe && Object.keys(pts).length === 0) {
        var dx = e.clientX - swipe.x;
        if (Math.abs(dx) > 60 && performance.now() - swipe.t < 600) step(dx < 0 ? 1 : -1);
      }
      swipe = null;
    }
    stageEl.addEventListener('pointerup', up);
    stageEl.addEventListener('pointercancel', up);
    stageEl.addEventListener('wheel', function (e) {
      e.preventDefault();
      z.s = Math.max(1, Math.min(5, z.s * (e.deltaY < 0 ? 1.15 : 0.87)));
      if (z.s === 1) { z.x = 0; z.y = 0; }
      applyZoom();
    }, { passive: false });
  }

  window.STAGE = {
    show: show,
    hide: hide,
    isOpen: function () { return open; },
    lightboxOpen: function () { return !el.lb.hidden; },
    on: function (o) { for (var k in o) api[k] = o[k]; },
    refresh: updateBasket
  };
})();
