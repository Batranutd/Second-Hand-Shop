/* Checkout at the till: receipt with the basket, choice of payment, delivery "invoice",
   animated card (visual only, nothing is charged or sent) and the printed receipt at the end.
   Exposed as window.CHECKOUT. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SHIP = { curier: { label: 'Curier la ușă', price: 19 }, locker: { label: 'Easybox / locker', price: 13 } };
  var FREE_FROM = 250;
  var JUDETE = ['Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea'];

  var api = { items: function () { return []; }, remove: null, done: null };
  var state = { pay: null, ship: 'curier', step: 'cart' };
  var el = {};

  function init() {
    el = {
      card: $('casa-card'), list: $('casa-list'), sub: $('casa-sub'), ship: $('casa-ship'), total: $('casa-total'),
      payCard: $('pay-card'), payCash: $('pay-cash'), empty: $('casa-empty'), actions: $('casa-actions'),
      shipOpts: document.querySelectorAll('input[name="ship"]'),
      co: $('checkout'), coBack: $('co-back'), coTitle: $('co-title'), steps: $('co-steps'),
      inv: $('invoice'), invItems: $('inv-items'), invTotal: $('inv-total'), invForm: $('inv-form'), invNo: $('inv-no'), invDate: $('inv-date'),
      invSubmit: $('inv-submit'), cardStep: $('card-step'), cardForm: $('card-form'), card3d: $('card3d'),
      cNum: $('c-num'), cName: $('c-name'), cExp: $('c-exp'), cCvv: $('c-cvv'), cBrand: $('c-brand'), cPay: $('c-pay'), cAmount: $('c-amount'),
      done: $('co-done'), receipt: $('receipt'), rItems: $('r-items'), rTotal: $('r-total'), rNo: $('r-no'), rMethod: $('r-method'), rAddr: $('r-addr'),
      doneBtn: $('co-finish')
    };
    var sel = $('f-judet');
    JUDETE.forEach(function (j) { var o = document.createElement('option'); o.value = j; o.textContent = j; sel.appendChild(o); });
    sel.value = 'Cluj';

    Array.prototype.forEach.call(el.shipOpts, function (r) {
      r.addEventListener('change', function () { state.ship = r.value; render(); });
    });
    el.payCard.addEventListener('click', function () { start('card'); });
    el.payCash.addEventListener('click', function () { start('cash'); });
    el.coBack.addEventListener('click', back);
    el.invForm.addEventListener('submit', function (e) { e.preventDefault(); submitInvoice(); });
    el.cardForm.addEventListener('submit', function (e) { e.preventDefault(); submitCard(); });
    el.doneBtn.addEventListener('click', finish);
    bindCard();
    el.invForm.addEventListener('input', function (e) { if (e.target.closest('.field')) e.target.closest('.field').classList.remove('is-bad'); });
  }

  function money(n) { return n.toLocaleString('ro-RO') + ' lei'; }
  function totals() {
    var items = api.items();
    var sub = items.reduce(function (s, p) { return s + p.price; }, 0);
    var ship = !items.length ? 0 : sub >= FREE_FROM ? 0 : SHIP[state.ship].price;
    return { items: items, sub: sub, ship: ship, total: sub + ship };
  }

  /* ---------------- the receipt card at the till ---------------- */
  function render() {
    var T = totals();
    el.list.innerHTML = '';
    T.items.forEach(function (p) {
      var li = document.createElement('li');
      var n = document.createElement('span'); n.className = 'r-name'; n.textContent = p.name + ' · ' + p.size;
      var pr = document.createElement('b'); pr.textContent = money(p.price);
      var rm = document.createElement('button');
      rm.type = 'button'; rm.className = 'casa-rm'; rm.textContent = 'Scoate';
      rm.setAttribute('aria-label', 'Scoate din coș: ' + p.name);
      rm.addEventListener('click', function () { if (api.remove) api.remove(p.id); render(); });
      li.appendChild(n); li.appendChild(pr); li.appendChild(rm);
      el.list.appendChild(li);
    });
    el.empty.hidden = T.items.length > 0;
    el.actions.hidden = T.items.length === 0;
    el.sub.textContent = money(T.sub);
    el.ship.textContent = !T.items.length ? '—' : T.ship === 0 ? 'gratuit' : money(T.ship);
    el.total.textContent = money(T.total);
    $('casa-free').textContent = T.sub >= FREE_FROM || !T.items.length ? '' : 'Mai adaugă ' + money(FREE_FROM - T.sub) + ' și transportul e gratuit.';
  }

  function showCard(on) { el.card.hidden = !on; if (on) render(); }

  /* ---------------- checkout flow ---------------- */
  function setStep(step) {
    state.step = step;
    el.inv.hidden = step !== 'invoice';
    el.cardStep.hidden = step !== 'card';
    el.done.hidden = step !== 'done';
    el.coBack.hidden = step === 'done';
    el.coTitle.textContent = step === 'invoice' ? 'Date de livrare' : step === 'card' ? 'Plata cu cardul' : 'Comandă plasată';
    var steps = state.pay === 'card' ? ['invoice', 'card', 'done'] : ['invoice', 'done'];
    el.steps.innerHTML = '';
    steps.forEach(function (s, i) {
      var d = document.createElement('span');
      d.className = 'co-dot' + (steps.indexOf(step) >= i ? ' is-on' : '');
      d.textContent = (i + 1) + '. ' + (s === 'invoice' ? 'Livrare' : s === 'card' ? 'Card' : 'Gata');
      el.steps.appendChild(d);
    });
    el.co.scrollTop = 0;
    var first = step === 'invoice' ? $('f-name') : step === 'card' ? el.cNum : el.doneBtn;
    setTimeout(function () { first.focus({ preventScroll: true }); }, reduce ? 0 : 380);
  }

  function start(method) {
    var T = totals();
    if (!T.items.length) return;
    state.pay = method;
    var now = new Date();
    el.invNo.textContent = 'UMR-' + now.getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000);
    el.invDate.textContent = now.toLocaleDateString('ro-RO');
    el.invItems.innerHTML = '';
    T.items.forEach(function (p, i) {
      var tr = document.createElement('tr');
      [String(i + 1), p.name + ' (' + p.size + ')', money(p.price)].forEach(function (c, j) {
        var td = document.createElement('td'); td.textContent = c; if (j === 2) td.className = 'num'; tr.appendChild(td);
      });
      el.invItems.appendChild(tr);
    });
    var tr2 = document.createElement('tr');
    ['', 'Transport · ' + SHIP[state.ship].label, T.ship === 0 ? 'gratuit' : money(T.ship)].forEach(function (c, j) {
      var td = document.createElement('td'); td.textContent = c; if (j === 2) td.className = 'num'; tr2.appendChild(td);
    });
    el.invItems.appendChild(tr2);
    el.invTotal.textContent = money(T.total);
    $('inv-method').textContent = method === 'card' ? 'Card bancar (online)' : 'Numerar, ramburs la livrare';
    el.invSubmit.textContent = method === 'card' ? 'Continuă la plata cu cardul' : 'Plasează comanda · ' + money(T.total);
    el.cAmount.textContent = money(T.total);
    $('f-locker').closest('.field').hidden = state.ship !== 'locker';
    el.co.hidden = false;
    document.body.classList.add('is-checkout');
    setStep('invoice');
  }

  function back() {
    if (state.step === 'card') { setStep('invoice'); return; }
    close();
  }
  function close() {
    el.co.classList.add('is-leaving');
    setTimeout(function () {
      el.co.hidden = true;
      el.co.classList.remove('is-leaving');
      document.body.classList.remove('is-checkout');
      el.card3d.classList.remove('is-flipped');
    }, reduce ? 0 : 260);
  }

  /* ---------------- invoice (delivery details) ---------------- */
  var RULES = {
    'f-name': function (v) { return v.trim().split(/\s+/).length >= 2 ? '' : 'Scrie numele și prenumele.'; },
    'f-phone': function (v) { return /^(\+?40|0)7\d{8}$/.test(v.replace(/[\s.-]/g, '')) ? '' : 'Un număr de mobil, de exemplu 0722 123 456.'; },
    'f-email': function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'O adresă de email validă, ca să primești confirmarea.'; },
    'f-street': function (v) { return v.trim().length >= 4 ? '' : 'Strada și numărul.'; },
    'f-city': function (v) { return v.trim().length >= 2 ? '' : 'Localitatea.'; },
    'f-zip': function (v) { return !v.trim() || /^\d{6}$/.test(v.trim()) ? '' : 'Codul poștal are 6 cifre.'; },
    'f-locker': function (v) { return state.ship !== 'locker' || v.trim().length >= 3 ? '' : 'Scrie ce easybox vrei, de exemplu „Turda Centru”.'; }
  };
  function validate(form, rules) {
    var firstBad = null;
    Object.keys(rules).forEach(function (id) {
      var inp = $(id);
      if (!inp || inp.closest('.field').hidden) return;
      var msg = rules[id](inp.value);
      var f = inp.closest('.field');
      f.classList.toggle('is-bad', !!msg);
      f.querySelector('.err').textContent = msg;
      inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !firstBad) firstBad = inp;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  function submitInvoice() {
    if (!validate(el.invForm, RULES)) return;
    if (state.pay === 'card') setStep('card');
    else placeOrder();
  }

  /* ---------------- animated card ---------------- */
  function luhn(num) {
    var s = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = +num[i];
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      s += n; alt = !alt;
    }
    return num.length >= 13 && s % 10 === 0;
  }
  function brand(num) {
    if (/^4/.test(num)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    return '';
  }
  function bindCard() {
    el.cNum.addEventListener('input', function () {
      var d = el.cNum.value.replace(/\D/g, '').slice(0, 16);
      el.cNum.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
      el.cBrand.textContent = brand(d);
      clearErr(el.cNum);
    });
    el.cExp.addEventListener('input', function () {
      var d = el.cExp.value.replace(/\D/g, '').slice(0, 4);
      el.cExp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
      clearErr(el.cExp);
    });
    el.cCvv.addEventListener('input', function () { el.cCvv.value = el.cCvv.value.replace(/\D/g, '').slice(0, 4); clearErr(el.cCvv); });
    el.cName.addEventListener('input', function () { el.cName.value = el.cName.value.toUpperCase(); clearErr(el.cName); });
    el.cCvv.addEventListener('focus', function () { el.card3d.classList.add('is-flipped'); });
    el.cCvv.addEventListener('blur', function () { el.card3d.classList.remove('is-flipped'); });
    $('c-flip').addEventListener('click', function () { el.card3d.classList.toggle('is-flipped'); if (el.card3d.classList.contains('is-flipped')) el.cCvv.focus(); });
  }
  function clearErr(inp) { var f = inp.closest('.cfield'); if (f) f.classList.remove('is-bad'); }
  function cardErr(inp, msg) {
    var f = inp.closest('.cfield');
    f.classList.toggle('is-bad', !!msg);
    inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return msg;
  }
  function submitCard() {
    var num = el.cNum.value.replace(/\D/g, '');
    var exp = el.cExp.value.split('/');
    var mm = +exp[0], yy = +exp[1];
    var now = new Date(), cy = now.getFullYear() % 100, cm = now.getMonth() + 1;
    var errs = [
      [el.cNum, luhn(num) ? '' : 'Numărul cardului nu e valid.'],
      [el.cName, el.cName.value.trim().length >= 3 ? '' : 'Numele de pe card.'],
      [el.cExp, mm >= 1 && mm <= 12 && exp[1] && exp[1].length === 2 && (yy > cy || (yy === cy && mm >= cm)) ? '' : 'Data expirării, LL/AA.'],
      [el.cCvv, /^\d{3,4}$/.test(el.cCvv.value) ? '' : 'Codul de 3 cifre de pe spate.']
    ];
    var msgs = errs.map(function (e) { return cardErr(e[0], e[1]); }).filter(Boolean);
    $('c-err').textContent = msgs.join(' ');
    if (msgs.length) {
      var bad = errs.filter(function (e) { return e[1]; })[0][0];
      if (bad === el.cCvv) el.card3d.classList.add('is-flipped');
      bad.focus();
      return;
    }
    el.cPay.disabled = true;
    el.cPay.classList.add('is-busy');
    el.cPay.textContent = 'Se verifică…';
    setTimeout(function () {
      el.cPay.disabled = false;
      el.cPay.classList.remove('is-busy');
      el.cPay.textContent = 'Plătește';
      el.cNum.value = ''; el.cExp.value = ''; el.cCvv.value = ''; el.cBrand.textContent = '';
      placeOrder();
    }, reduce ? 200 : 1400);
  }

  /* ---------------- receipt ---------------- */
  function placeOrder() {
    var T = totals();
    el.rNo.textContent = el.invNo.textContent;
    el.rItems.innerHTML = '';
    T.items.forEach(function (p) {
      var li = document.createElement('li');
      var a = document.createElement('span'); a.textContent = p.name;
      var b = document.createElement('span'); b.textContent = money(p.price);
      li.appendChild(a); li.appendChild(b);
      el.rItems.appendChild(li);
    });
    var li2 = document.createElement('li');
    var a2 = document.createElement('span'); a2.textContent = 'Transport';
    var b2 = document.createElement('span'); b2.textContent = T.ship === 0 ? 'gratuit' : money(T.ship);
    li2.appendChild(a2); li2.appendChild(b2); el.rItems.appendChild(li2);
    el.rTotal.textContent = money(T.total);
    el.rMethod.textContent = state.pay === 'card' ? 'Plătit cu cardul (demo)' : 'Plătești ' + money(T.total) + ' la livrare';
    el.rAddr.textContent = $('f-name').value.trim() + ', ' + (state.ship === 'locker' ? 'easybox ' + $('f-locker').value.trim() + ', ' : $('f-street').value.trim() + ', ') + $('f-city').value.trim() + ', jud. ' + $('f-judet').value;
    el.receipt.classList.remove('is-printing');
    void el.receipt.offsetWidth;
    el.receipt.classList.add('is-printing');
    state.order = T.items.map(function (p) { return p.id; });
    setStep('done');
  }
  function finish() {
    close();
    if (api.done) api.done(state.order || []);
  }

  window.CHECKOUT = {
    init: init,
    on: function (o) { for (var k in o) api[k] = o[k]; },
    show: showCard,
    render: render,
    isOpen: function () { return !el.co.hidden; },
    close: close
  };
})();
