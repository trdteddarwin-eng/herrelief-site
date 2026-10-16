/*
 * HerRelief gift mode (HEAT10)
 * ----------------------------------------------------------------------------
 * Does nothing at all unless the page was opened with ?gift=HEAT10, or this tab
 * already picked up the gift earlier in the session (sessionStorage).
 *
 * When active:
 *  - product.html: "Discount applied!" popup (first landing only), then a slim
 *    sticky strip, discounted prices everywhere, promo code on every Stripe link.
 *  - cart.html: strip, discounted prices, promo code on the Stripe redirect.
 *
 * Every class and id is prefixed "hrg-" so nothing clashes with page styles.
 */
(function () {
  'use strict';

  var CODE = 'HEAT10';
  var PCT = 10;
  var KEY = 'hr_gift';
  var SEEN = 'hr_gift_popup_seen';

  function ssGet(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) {} }

  var fromUrl = false;
  try { fromUrl = (new URLSearchParams(window.location.search).get('gift') || '').toUpperCase() === CODE; } catch (e) {}
  if (fromUrl) { ssSet(KEY, CODE); }
  if (!(fromUrl || ssGet(KEY) === CODE)) { return; } // normal visitor: zero change

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function cents(v) { var n = parseFloat(v); return isNaN(n) ? 0 : Math.round(n * 100); }
  function giftCents(c) { return Math.round(c * (100 - PCT) / 100); } // 3999 -> 3599, 6399 -> 5759, 8399 -> 7559
  function fmt(c) { return '$' + (c / 100).toFixed(2); }
  function setText(el, t) { if (el && el.textContent !== t) { el.textContent = t; } }
  function reduceMotion() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function tracker() {
    if (window.HRTracking) { return window.HRTracking; }
    try { if (typeof HRTracking !== 'undefined') { return HRTracking; } } catch (e) {} // tracking.js uses a top-level const
    return null;
  }
  function track(name, data) { try { var t = tracker(); if (t && t.track) { t.track(name, data || {}); } } catch (e) {} }

  /* ---------- Stripe links ---------- */
  function withPromo(url) {
    if (typeof url !== 'string' || url.indexOf('buy.stripe.com') === -1) { return url; }
    if (/[?&]prefilled_promo_code=/.test(url)) { return url; }
    var hash = '', i = url.indexOf('#');
    if (i > -1) { hash = url.slice(i); url = url.slice(0, i); }
    return url + (url.indexOf('?') > -1 ? '&' : '?') + 'prefilled_promo_code=' + CODE + hash;
  }
  function patchLinks(root) {
    $$('[data-stripe-link]', root).forEach(function (el) {
      var v = el.getAttribute('data-stripe-link'), n = withPromo(v);
      if (n !== v) { el.setAttribute('data-stripe-link', n); }
    });
    $$('a[href*="buy.stripe.com"]', root).forEach(function (a) {
      var v = a.getAttribute('href'), n = withPromo(v);
      if (n !== v) { a.setAttribute('href', n); }
    });
  }

  /* ---------- styles (scoped, injected only in gift mode) ---------- */
  var CSS = [
    'html.hrg-on #exit-popup{display:none!important}',
    'html.hrg-locked,html.hrg-locked body{overflow:hidden!important}',
    '.hrg-strip{display:flex;align-items:center;justify-content:center;gap:8px;min-height:36px;padding:7px 14px;background:#3b1f2b;color:#faf9f6;',
    '  font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif;font-size:13.5px;font-weight:600;line-height:1.3;text-align:center;letter-spacing:0}',
    '.hrg-strip b{font-weight:800;color:#fe7e4f;letter-spacing:.02em}',
    '.hrg-strip svg{flex:none;display:block}',
    '.hrg-strip.hrg-in{animation:hrg-fade .4s ease both}',
    '.hrg-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:18px;',
    '  font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}',
    '.hrg-modal *{box-sizing:border-box}',
    '.hrg-back{position:absolute;inset:0;background:rgba(26,16,20,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:hrg-fade .3s ease both}',
    '.hrg-card{position:relative;width:100%;max-width:400px;max-height:calc(100vh - 36px);overflow:hidden;border-radius:30px;background:#3b1f2b;color:#faf9f6;',
    '  padding:34px 24px 22px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,.4);animation:hrg-rise .45s cubic-bezier(.2,1.1,.3,1) both}',
    '@keyframes hrg-fade{from{opacity:0}to{opacity:1}}',
    '@keyframes hrg-rise{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:none}}',
    '.hrg-glow{position:absolute;left:50%;top:-150px;width:360px;height:360px;margin-left:-180px;border-radius:50%;background:radial-gradient(circle,rgba(254,126,79,.5),rgba(254,126,79,0) 70%);pointer-events:none}',
    '.hrg-x{position:absolute;right:14px;top:14px;width:38px;height:38px;border-radius:19px;border:0;padding:0;margin:0;background:rgba(250,249,246,.1);color:#faf9f6;display:grid;place-items:center;cursor:pointer;z-index:2}',
    '.hrg-x:hover{background:rgba(250,249,246,.18)}',
    '.hrg-gift{position:relative;z-index:1;width:92px;height:92px;margin:0 auto;border-radius:28px;background:rgba(250,249,246,.08);display:grid;place-items:center}',
    '.hrg-gift svg{display:block}',
    '.hrg-title{position:relative;z-index:1;margin:16px 0 0;padding:0;font-family:"Fraunces",Georgia,serif;font-weight:800;font-size:42px;line-height:1.02;letter-spacing:-.02em;color:#faf9f6;',
    '  font-variation-settings:"SOFT" 50,"WONK" 0,"opsz" 144}',
    '.hrg-title em{font-style:italic;font-weight:700;color:#fe7e4f}',
    '.hrg-desc{position:relative;z-index:1;font-size:17px;line-height:1.5;font-weight:600;color:rgba(250,249,246,.86);margin:10px auto 0;max-width:19em}',
    '.hrg-applied{position:relative;z-index:1;display:inline-flex;align-items:center;gap:10px;height:46px;margin-top:18px;padding:0 18px 0 8px;border-radius:23px;background:#faf9f6;color:#3b1f2b;font-weight:800;font-size:15px}',
    '.hrg-ok{width:30px;height:30px;border-radius:15px;background:#a43c12;display:grid;place-items:center}',
    '.hrg-ok svg{display:block}',
    '.hrg-code{font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:18px;font-weight:800;letter-spacing:.1em;color:#a43c12}',
    '.hrg-tag{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#70585b}',
    '.hrg-go{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:58px;margin:20px 0 0;padding:0 20px;border:0;border-radius:29px;',
    '  background:#fe7e4f;color:#3b1f2b;font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-size:17px;font-weight:800;letter-spacing:.01em;cursor:pointer;',
    '  box-shadow:0 10px 24px rgba(254,126,79,.3),inset 0 -3px 0 rgba(0,0,0,.12);transition:background .15s ease,transform .1s ease}',
    '.hrg-go:hover{background:#ff9064}',
    '.hrg-go:active{transform:scale(.98)}',
    '.hrg-go svg{display:block}',
    '.hrg-x:focus,.hrg-go:focus{outline:none}',
    '.hrg-x:focus-visible,.hrg-go:focus-visible{outline:3px solid #f4b8c0;outline-offset:3px}',
    '.hrg-modal:not(.hrg-kbd) .hrg-x:focus-visible,.hrg-modal:not(.hrg-kbd) .hrg-go:focus-visible{outline:none}',
    '.hrg-fine{position:relative;z-index:1;font-size:12.5px;line-height:1.4;font-weight:600;color:rgba(250,249,246,.6);margin:12px 0 0}',
    '.hrg-spark{position:absolute;pointer-events:none;display:block}',
    '.hrg-twinkle{animation:hrg-tw 1.6s ease-in-out 3 both}',
    '@keyframes hrg-tw{0%,100%{transform:scale(.6);opacity:.4}50%{transform:scale(1.15);opacity:1}}',
    '.hrg-pop{animation:hrg-pop .55s cubic-bezier(.2,1.4,.4,1) both .2s}',
    '@keyframes hrg-pop{0%{transform:scale(.7);opacity:0}100%{transform:scale(1);opacity:1}}',
    '.hrg-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
    '.hrg-confetti i{position:absolute;top:-14px;display:block;border-radius:2px;opacity:0;animation:hrg-fall 2.1s cubic-bezier(.2,.6,.4,1) forwards}',
    '@keyframes hrg-fall{0%{opacity:1;transform:translate(0,0) rotate(0)}85%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--rot))}}',
    '.hrg-was{text-decoration:line-through;color:#a8a29e;font-weight:400}',
    '@media (max-width:360px){.hrg-title{font-size:36px}.hrg-card{padding:30px 18px 20px}}',
    '@media (max-height:560px){.hrg-gift{width:72px;height:72px}.hrg-title{font-size:34px;margin-top:10px}.hrg-applied{margin-top:12px}.hrg-go{margin-top:14px}}',
    '@media (prefers-reduced-motion:reduce){.hrg-back,.hrg-card,.hrg-twinkle,.hrg-pop,.hrg-strip.hrg-in{animation:none}.hrg-confetti{display:none}.hrg-go{transition:none}}'
  ].join('\n');

  function injectAssets() {
    document.documentElement.classList.add('hrg-on');
    if (!document.getElementById('hrg-style')) {
      var st = document.createElement('style');
      st.id = 'hrg-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
  }
  function loadDisplayFont() {
    if (document.getElementById('hrg-font')) { return; }
    var l = document.createElement('link');
    l.id = 'hrg-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,800;1,9..144,700&display=swap';
    document.head.appendChild(l);
  }

  /* ---------- sticky strip ---------- */
  var CHECK = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';
  function showStrip(animate) {
    if (document.getElementById('hrg-strip')) { return; }
    var s = document.createElement('div');
    s.id = 'hrg-strip';
    s.className = 'hrg-strip' + (animate ? ' hrg-in' : '');
    s.setAttribute('role', 'status');
    s.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fe7e4f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + CHECK + '</svg>' +
      '<span><b>' + CODE + ' applied:</b> 10% off + free shipping</span>';
    var nav = $('nav.sticky');
    if (nav) {
      nav.insertBefore(s, nav.firstChild); // rides along with the sticky nav
    } else {
      s.style.position = 'sticky'; s.style.top = '0'; s.style.zIndex = '55';
      document.body.insertBefore(s, document.body.firstChild);
    }
  }

  /* ---------- popup ---------- */
  var SPARK = '<path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1Z" fill="';
  function modalHTML() {
    return '' +
      '<div class="hrg-back" data-hrg-close></div>' +
      '<div class="hrg-card" role="dialog" aria-modal="true" aria-labelledby="hrg-title" aria-describedby="hrg-desc">' +
        '<div class="hrg-glow" aria-hidden="true"></div>' +
        '<div class="hrg-confetti" id="hrg-confetti" aria-hidden="true"></div>' +
        '<button type="button" class="hrg-x" data-hrg-close aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<svg class="hrg-spark hrg-twinkle" width="26" height="26" viewBox="0 0 24 24" style="left:26px;top:28px" aria-hidden="true">' + SPARK + '#fe7e4f"/></svg>' +
        '<svg class="hrg-spark hrg-twinkle" width="14" height="14" viewBox="0 0 24 24" style="left:62px;top:70px;animation-delay:.4s" aria-hidden="true">' + SPARK + '#fadadd"/></svg>' +
        '<svg class="hrg-spark hrg-twinkle" width="18" height="18" viewBox="0 0 24 24" style="right:70px;top:120px;animation-delay:.8s" aria-hidden="true">' + SPARK + '#fe7e4f"/></svg>' +
        '<div class="hrg-gift hrg-pop" aria-hidden="true">' +
          '<svg width="64" height="64" viewBox="0 0 100 100"><rect x="14" y="44" width="72" height="48" rx="6" fill="#a43c12"/><rect x="8" y="30" width="84" height="18" rx="5" fill="#fe7e4f"/><rect x="44" y="30" width="12" height="62" fill="#fadadd"/><path d="M50 30 C42 14 24 12 26 24 C28 32 44 31 50 30 Z M50 30 C58 14 76 12 74 24 C72 32 56 31 50 30 Z" fill="#fadadd" stroke="#3b1f2b" stroke-width="3" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<h2 class="hrg-title" id="hrg-title">Discount <em>applied!</em></h2>' +
        '<p class="hrg-desc" id="hrg-desc">10% off + free shipping is already on your order.</p>' +
        '<span class="hrg-applied hrg-pop"><span class="hrg-ok"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#faf9f6" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + CHECK + '</svg></span><span class="hrg-code">' + CODE + '</span><span class="hrg-tag">Applied</span></span>' +
        '<button type="button" class="hrg-go" id="hrg-go">Shop now' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
        '<p class="hrg-fine">The code fills in for you at checkout.</p>' +
      '</div>';
  }

  function confetti(box) {
    if (!box || reduceMotion()) { return; }
    var cols = ['#fe7e4f', '#a43c12', '#fadadd', '#f4b8c0', '#faf9f6'];
    for (var i = 0; i < 40; i++) {
      var c = document.createElement('i'), w = 5 + (i * 7) % 6, h = i % 3 === 0 ? w : w * 2;
      c.style.left = ((i * 37) % 100) + '%';
      c.style.width = w + 'px'; c.style.height = h + 'px';
      c.style.background = cols[i % cols.length];
      if (i % 4 === 0) { c.style.borderRadius = '50%'; }
      c.style.setProperty('--dx', (((i * 53) % 80) - 40) + 'px');
      c.style.setProperty('--dy', (260 + (i * 29) % 200) + 'px');
      c.style.setProperty('--rot', (((i * 97) % 540) - 270) + 'deg');
      c.style.animationDelay = (0.15 + ((i * 41) % 600) / 1000) + 's';
      box.appendChild(c);
    }
    setTimeout(function () { box.innerHTML = ''; }, 3200);
  }

  function scrollToBuy() {
    var sel = document.getElementById('bundle-selector');
    var target = sel ? (sel.parentElement || sel) : null;
    if (!target) { return; }
    var nav = $('nav.sticky');
    var offset = (nav ? nav.getBoundingClientRect().height : 0) + 14;
    var y = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - offset;
    try { window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, Math.max(0, y)); }
    if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); target.style.outline = 'none'; }
    try { target.focus({ preventScroll: true }); } catch (e) {}
  }

  function openPopup() {
    loadDisplayFont();
    var modal = document.createElement('div');
    modal.className = 'hrg-modal';
    modal.id = 'hrg-modal';
    modal.innerHTML = modalHTML();
    document.body.appendChild(modal);
    document.documentElement.classList.add('hrg-locked');
    var lastFocus = document.activeElement;
    var go = document.getElementById('hrg-go');
    setTimeout(function () { try { go.focus({ preventScroll: true }); } catch (e) { go.focus(); } }, 60);

    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(false, 'escape'); return; }
      if (e.key === 'Tab') { // keep focus inside the popup
        modal.classList.add('hrg-kbd'); // show focus rings once she uses the keyboard
        var f = $$('button', modal), first = f[0], last = f[f.length - 1];
        if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function close(scroll, via) {
      if (!modal.parentNode) { return; }
      document.removeEventListener('keydown', onKey, true);
      modal.parentNode.removeChild(modal);
      document.documentElement.classList.remove('hrg-locked');
      showStrip(true);
      if (scroll) { scrollToBuy(); }
      else if (lastFocus && lastFocus.focus && lastFocus !== document.body) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
      track('gift_popup_close', { code: CODE, via: via });
    }
    document.addEventListener('keydown', onKey, true);
    go.addEventListener('click', function () { close(true, 'shop_now'); });
    $$('[data-hrg-close]', modal).forEach(function (el) {
      el.addEventListener('click', function () { close(false, el.classList.contains('hrg-x') ? 'x' : 'backdrop'); });
    });
    confetti(document.getElementById('hrg-confetti'));
  }

  /* ---------- product.html pricing ---------- */
  function selectedOption() { return $('.bundle-option.selected') || $('.bundle-option'); }
  function findP(contains) {
    var ps = $$('p'), i;
    for (i = 0; i < ps.length; i++) { if (ps[i].textContent.indexOf(contains) > -1) { return ps[i]; } }
    return null;
  }

  function renderProductPrices() {
    var opt = selectedOption();
    if (!opt) { return; }
    var reg = cents(opt.getAttribute('data-total')), g = giftCents(reg);

    // main price block
    setText(document.getElementById('display-price'), fmt(g));
    setText(document.getElementById('display-original-price'), fmt(reg));
    setText(document.getElementById('display-savings'), CODE + ': 10% off');

    // pay-in-4 + per-day lines under the price
    var ap = findP('interest-free payments of'), apS = ap && $('strong', ap);
    setText(apS, fmt(Math.round(g / 4)));
    var pd = findP('over a year'), pdS = pd && $('strong', pd);
    setText(pdS, fmt(Math.round(g / 365)) + '/day');
  }

  function renderBundleOptions() {
    $$('.bundle-option').forEach(function (opt) {
      var reg = cents(opt.getAttribute('data-total')), g = giftCents(reg);
      var qty = parseInt(opt.getAttribute('data-bundle'), 10) || 1;
      var right = $('.text-right', opt);
      if (right) {
        setText($('p.font-bold', right), fmt(g));
        setText($('.line-through', right), fmt(reg));
      }
      if (qty > 1 && !opt.hasAttribute('data-hrg-each')) {
        var each = $$('p', opt).filter(function (p) { return /each\s*$/.test(p.textContent); })[0];
        if (each) {
          var label = each.textContent.split(/\s[\u2014\u2013-]\s/)[0].trim(); // "60% off"
          each.innerHTML = '';
          each.appendChild(document.createTextNode(label + ' \u00b7 '));
          var was = document.createElement('span'); was.className = 'hrg-was'; was.textContent = fmt(Math.round(reg / qty));
          each.appendChild(was);
          each.appendChild(document.createTextNode(' ' + fmt(Math.round(g / qty)) + ' each'));
          opt.setAttribute('data-hrg-each', '1');
        }
      }
    });
  }

  function renderDrawer() {
    var opt = selectedOption();
    if (!opt || !document.getElementById('drawer-total')) { return; }
    var reg = cents(opt.getAttribute('data-total')), g = giftCents(reg), orig = cents(opt.getAttribute('data-original'));
    setText(document.getElementById('drawer-item-price'), fmt(g));
    setText(document.getElementById('drawer-item-original'), fmt(reg));
    setText(document.getElementById('drawer-subtotal'), fmt(reg));
    setText(document.getElementById('drawer-discount'), '-' + fmt(orig - reg));
    var row = document.getElementById('hrg-drawer-row');
    var discRow = document.getElementById('drawer-discount');
    if (!row && discRow && discRow.parentElement) {
      row = document.createElement('div');
      row.id = 'hrg-drawer-row';
      row.className = 'flex justify-between text-sm';
      row.innerHTML = '<span class="text-on-surface-variant">' + CODE + ' (10% off)</span><span id="hrg-drawer-off" class="text-green-600 font-medium"></span>';
      discRow.parentElement.parentElement.insertBefore(row, discRow.parentElement.nextSibling);
    }
    setText(document.getElementById('hrg-drawer-off'), '-' + fmt(reg - g));
    setText(document.getElementById('drawer-total'), fmt(g));
    var ap = document.getElementById('drawer-afterpay');
    if (ap) { setText($('strong', ap), fmt(Math.round(g / 4))); }
    setText(document.getElementById('drawer-checkout-text'), 'Checkout for ' + fmt(g));
  }

  function renderStaticSpots() {
    var reg = 3999, g = giftCents(reg);
    // mobile sticky buy bar
    $$('.sticky-bar-enter p').forEach(function (p) {
      var spans = $$('span', p);
      if (spans.length === 2 && spans[0].textContent.trim() === fmt(reg)) {
        setText(spans[0], fmt(g));
        setText(spans[1], fmt(reg));
      }
    });
    // closing CTA button + its struck price
    $$('a').forEach(function (a) {
      if (/^Get Yours Now\s*[\u2014\u2013-]\s*\$39\.99$/.test(a.textContent.trim())) {
        a.textContent = 'Get Yours Now for ' + fmt(g);
        var box = a.nextElementSibling, was = box && $('.line-through', box);
        setText(was, fmt(reg));
      }
    });
    // comparison card + comparison table
    $$('p.font-bold, td.font-bold').forEach(function (el) {
      if (el.closest('.bundle-option') || el.children.length) { return; }
      var t = el.textContent.trim(), m = /^\$39\.99(.*)$/.exec(t);
      if (!m) { return; }
      el.textContent = fmt(g) + ' ';
      var was = document.createElement('span'); was.className = 'hrg-was'; was.textContent = fmt(reg);
      el.appendChild(was);
      if (m[1]) { el.appendChild(document.createTextNode(m[1])); }
    });
  }

  function renderTikTok(root) {
    var reg = 3999, g = giftCents(reg);
    $$('a', root).forEach(function (a) {
      var nodes = a.childNodes;
      for (var i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].nodeType === 3 && nodes[i].nodeValue.trim()) {
          if (/^Get Yours\s*[\u2014\u2013-]\s*\$39\.99$/.test(nodes[i].nodeValue.trim())) { nodes[i].nodeValue = ' Get Yours for ' + fmt(g) + ' '; }
          break;
        }
      }
    });
    var cur = document.getElementById('vm-price-current'), was = document.getElementById('vm-price-original');
    if (cur && cur.textContent.trim() === fmt(reg)) { setText(cur, fmt(g)); setText(was, fmt(reg)); }
  }

  function wrapGlobal(name, after) {
    var orig = window[name];
    if (typeof orig !== 'function' || orig.__hrg) { return; }
    var w = function () {
      var r = orig.apply(this, arguments);
      try { after(); } catch (e) {}
      return r;
    };
    w.__hrg = true;
    window[name] = w;
  }

  function initProduct() {
    patchLinks(document);
    renderBundleOptions();
    renderProductPrices();
    renderDrawer();
    renderStaticSpots();
    wrapGlobal('selectBundle', function () { renderProductPrices(); renderDrawer(); patchLinks(document); });
    wrapGlobal('updateDrawerPrices', renderDrawer);

    // TikTok section is fetched after load; patch it when it lands
    var mount = document.getElementById('tiktok-mount');
    if (mount) {
      renderTikTok(mount);
      if ('MutationObserver' in window) {
        new MutationObserver(function () { renderTikTok(mount); patchLinks(mount); }).observe(mount, { childList: true });
      }
    }
  }

  /* ---------- cart.html ---------- */
  function initCart() {
    var list = null, cur = 0;
    try { if (typeof bundles !== 'undefined' && Array.isArray(bundles)) { list = bundles; } } catch (e) {}
    if (!list) { return; }
    list.forEach(function (b) { if (b && typeof b.link === 'string') { b.link = withPromo(b.link); } });

    // bundle cards
    list.forEach(function (b, i) {
      var card = document.getElementById('bundle-' + i), right = card && $('.text-right', card);
      if (!right) { return; }
      var reg = cents(b.price), g = giftCents(reg), orig = cents(b.original);
      setText($('p.font-bold', right), fmt(g));
      setText($('.line-through', right), fmt(reg));
      var save = $$('span', right).filter(function (s) { return /^Save \$/.test(s.textContent.trim()); })[0];
      setText(save, 'Save $' + Math.round((orig - g) / 100));
    });

    function render(b) {
      if (!b) { return; }
      var reg = cents(b.price), g = giftCents(reg), orig = cents(b.original);
      setText(document.getElementById('item-price'), fmt(g));
      setText(document.getElementById('item-original'), fmt(reg));
      var disc = document.getElementById('summary-discount');
      var row = document.getElementById('hrg-cart-row');
      if (!row && disc && disc.parentElement) {
        row = document.createElement('div');
        row.id = 'hrg-cart-row';
        row.className = disc.parentElement.className;
        row.innerHTML = '<span>' + CODE + ' (10% off)</span><span id="hrg-cart-off"></span>';
        disc.parentElement.parentElement.insertBefore(row, disc.parentElement.nextSibling);
      }
      setText(document.getElementById('hrg-cart-off'), '-' + fmt(reg - g));
      setText(document.getElementById('summary-total'), fmt(g));
      setText(document.getElementById('btn-total'), fmt(g));
      setText(document.getElementById('mobile-total'), fmt(g));
      setText(document.getElementById('savings-msg'), "You're saving " + fmt(orig - g) + ' on this order!');
    }
    var origUpdate = window.updatePricing;
    if (typeof origUpdate === 'function') {
      window.updatePricing = function (b) { var r = origUpdate.apply(this, arguments); try { render(b); } catch (e) {} return r; };
    }
    try { if (typeof currentBundle === 'number') { cur = currentBundle; } } catch (e) {}
    render(list[cur] || list[0]);
  }

  /* ---------- boot ---------- */
  function boot() {
    injectAssets();
    var isProduct = !!document.getElementById('bundle-selector');
    if (isProduct) { initProduct(); }
    else { initCart(); patchLinks(document); }

    // safety net: any Stripe link clicked anywhere carries the code
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href*="buy.stripe.com"]') : null;
      if (a) { var v = a.getAttribute('href'), n = withPromo(v); if (n !== v) { a.setAttribute('href', n); } }
    }, true);

    if (isProduct && fromUrl && ssGet(SEEN) !== '1') {
      ssSet(SEEN, '1');
      openPopup();
    } else {
      showStrip(false);
    }
    if (fromUrl) { track('gift_mode_applied', { code: CODE, page: window.location.pathname }); }
    window.HRGift = { code: CODE, active: true, withPromo: withPromo };
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
