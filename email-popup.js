/**
 * HerRelief — Exit-Intent Email Capture Popup
 * Triggers on: mouse leaving viewport OR 30 seconds on page
 * Shows once per session (sessionStorage flag)
 * Brand colors: primary #70585b | secondary #a43c12 | accent #fe7e4f | bg #faf9f6
 */
(function () {
  'use strict';

  var SESSION_KEY = 'herrelief_popup_shown';
  var FORM_ACTION = 'https://formspree.io/f/placeholder';
  var TIMER_DELAY = 30000; // 30 seconds

  // Don't show more than once per session
  if (sessionStorage.getItem(SESSION_KEY)) return;

  var popupShown = false;
  var exitTimer = null;

  // ── Build the popup DOM ────────────────────────────────────────────────────

  function createPopup() {
    // Backdrop
    var backdrop = document.createElement('div');
    backdrop.id = 'hr-popup-backdrop';
    backdrop.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(26,28,26,0.55)',
      'z-index:99998',
      'opacity:0',
      'transition:opacity 0.35s ease',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:16px',
      'box-sizing:border-box'
    ].join(';');

    // Card
    var card = document.createElement('div');
    card.id = 'hr-popup-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'Get 10% off your first order');
    card.style.cssText = [
      'position:relative',
      'background:#faf9f6',
      'border-radius:20px',
      'max-width:440px',
      'width:100%',
      'padding:40px 36px 36px',
      'box-shadow:0 24px 64px rgba(164,60,18,0.18)',
      'transform:translateY(24px) scale(0.97)',
      'transition:transform 0.35s ease, opacity 0.35s ease',
      'opacity:0',
      'font-family:"Plus Jakarta Sans", system-ui, sans-serif',
      'box-sizing:border-box',
      'text-align:center'
    ].join(';');

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.id = 'hr-popup-close';
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.innerHTML = '&#x2715;';
    closeBtn.style.cssText = [
      'position:absolute',
      'top:14px',
      'right:16px',
      'background:none',
      'border:none',
      'font-size:18px',
      'color:#807475',
      'cursor:pointer',
      'padding:4px 8px',
      'line-height:1',
      'border-radius:6px',
      'transition:color 0.2s, background 0.2s'
    ].join(';');
    closeBtn.addEventListener('mouseover', function () {
      closeBtn.style.color = '#a43c12';
      closeBtn.style.background = '#fadadd';
    });
    closeBtn.addEventListener('mouseout', function () {
      closeBtn.style.color = '#807475';
      closeBtn.style.background = 'none';
    });
    closeBtn.addEventListener('click', closePopup);

    // Leaf icon (brand motif, inline SVG)
    var iconWrap = document.createElement('div');
    iconWrap.style.cssText = 'margin-bottom:16px;';
    iconWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 32">' +
      '<defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#a43c12"/><stop offset="100%" stop-color="#fe7e4f"/>' +
      '</linearGradient></defs>' +
      '<path d="M16 28 L16 18 C16 14,14 11,10 7 C6 3,1 2,0 6 C-1 10,4 14,8 12 C11 11,13 9,14 7"' +
      ' fill="none" stroke="url(#pg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M16 18 C16 14,18 11,22 7 C26 3,31 2,32 6 C33 10,28 14,24 12 C21 11,19 9,18 7"' +
      ' fill="none" stroke="url(#pg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M13 20 C13 23,14.5 25,16 27 C17.5 25,19 23,19 20"' +
      ' fill="none" stroke="url(#pg)" stroke-width="1.8" stroke-linecap="round"/>' +
      '</svg>';

    // Discount badge
    var badge = document.createElement('div');
    badge.style.cssText = [
      'display:inline-block',
      'background:linear-gradient(135deg,#a43c12,#fe7e4f)',
      'color:#fff',
      'font-size:13px',
      'font-weight:700',
      'letter-spacing:0.06em',
      'text-transform:uppercase',
      'padding:5px 14px',
      'border-radius:999px',
      'margin-bottom:14px'
    ].join(';');
    badge.textContent = 'Limited Offer';

    // Headline
    var headline = document.createElement('h2');
    headline.style.cssText = [
      'margin:0 0 10px',
      'font-size:26px',
      'font-weight:700',
      'color:#1a1c1a',
      'line-height:1.2',
      'font-family:"Noto Serif","Georgia",serif'
    ].join(';');
    headline.innerHTML = 'Wait! Get <span style="color:#a43c12;">10% off</span><br>your first order';

    // Subtext
    var sub = document.createElement('p');
    sub.style.cssText = [
      'margin:0 0 24px',
      'font-size:14px',
      'color:#4f4445',
      'line-height:1.6'
    ].join(';');
    sub.textContent = 'Join 600+ women who found real period cramp relief. Subscribe and unlock your discount code.';

    // Form
    var form = document.createElement('form');
    form.action = FORM_ACTION;
    form.method = 'POST';
    form.id = 'hr-popup-form';
    form.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.required = true;
    emailInput.placeholder = 'Enter your email address';
    emailInput.style.cssText = [
      'width:100%',
      'padding:13px 16px',
      'border:1.5px solid #d2c3c4',
      'border-radius:12px',
      'font-size:15px',
      'font-family:inherit',
      'color:#1a1c1a',
      'background:#fff',
      'outline:none',
      'transition:border-color 0.2s',
      'box-sizing:border-box'
    ].join(';');
    emailInput.addEventListener('focus', function () {
      emailInput.style.borderColor = '#a43c12';
    });
    emailInput.addEventListener('blur', function () {
      emailInput.style.borderColor = '#d2c3c4';
    });

    // Hidden field for Formspree subject
    var hiddenSubject = document.createElement('input');
    hiddenSubject.type = 'hidden';
    hiddenSubject.name = '_subject';
    hiddenSubject.value = 'HerRelief — 10% Off Subscriber';

    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.style.cssText = [
      'width:100%',
      'padding:14px',
      'background:linear-gradient(135deg,#a43c12,#fe7e4f)',
      'color:#fff',
      'font-size:16px',
      'font-weight:700',
      'font-family:inherit',
      'border:none',
      'border-radius:12px',
      'cursor:pointer',
      'transition:opacity 0.2s, transform 0.15s',
      'letter-spacing:0.01em'
    ].join(';');
    submitBtn.textContent = 'Send My 10% Off Code';
    submitBtn.addEventListener('mouseover', function () {
      submitBtn.style.opacity = '0.88';
    });
    submitBtn.addEventListener('mouseout', function () {
      submitBtn.style.opacity = '1';
    });
    submitBtn.addEventListener('mousedown', function () {
      submitBtn.style.transform = 'scale(0.97)';
    });
    submitBtn.addEventListener('mouseup', function () {
      submitBtn.style.transform = 'scale(1)';
    });

    form.appendChild(emailInput);
    form.appendChild(hiddenSubject);
    form.appendChild(submitBtn);

    // Form submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!email) return;

      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      fetch(FORM_ACTION, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, _subject: 'HerRelief — 10% Off Subscriber' })
      })
        .then(function (res) {
          if (res.ok) {
            showSuccess(card);
          } else {
            submitBtn.textContent = 'Something went wrong — try again';
            submitBtn.disabled = false;
          }
        })
        .catch(function () {
          submitBtn.textContent = 'Something went wrong — try again';
          submitBtn.disabled = false;
        });
    });

    // No-thanks link
    var noThanks = document.createElement('button');
    noThanks.type = 'button';
    noThanks.style.cssText = [
      'background:none',
      'border:none',
      'font-size:12px',
      'color:#807475',
      'cursor:pointer',
      'margin-top:4px',
      'text-decoration:underline',
      'font-family:inherit',
      'transition:color 0.2s'
    ].join(';');
    noThanks.textContent = 'No thanks, I\'ll pay full price';
    noThanks.addEventListener('click', closePopup);
    noThanks.addEventListener('mouseover', function () { noThanks.style.color = '#a43c12'; });
    noThanks.addEventListener('mouseout', function () { noThanks.style.color = '#807475'; });

    // Assemble card
    card.appendChild(closeBtn);
    card.appendChild(iconWrap);
    card.appendChild(badge);
    card.appendChild(headline);
    card.appendChild(sub);
    card.appendChild(form);
    card.appendChild(noThanks);

    // Click backdrop to close
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closePopup();
    });

    // Escape key to close
    document.addEventListener('keydown', handleKeydown);

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    // Animate in (next frame so transition fires)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        backdrop.style.opacity = '1';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // ── Success state ──────────────────────────────────────────────────────────

  function showSuccess(card) {
    card.innerHTML = '';
    card.style.padding = '48px 36px';

    var check = document.createElement('div');
    check.style.cssText = 'font-size:48px;margin-bottom:16px;';
    check.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">' +
      '<circle cx="28" cy="28" r="28" fill="#fadadd"/>' +
      '<path d="M16 28 L24 36 L40 20" stroke="#a43c12" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '</svg>';

    var msg = document.createElement('p');
    msg.style.cssText = 'font-size:22px;font-weight:700;color:#1a1c1a;margin:0 0 10px;font-family:"Noto Serif","Georgia",serif;';
    msg.textContent = 'You\'re in!';

    var sub = document.createElement('p');
    sub.style.cssText = 'font-size:14px;color:#4f4445;line-height:1.6;margin:0 0 24px;';
    sub.textContent = 'Your 10% discount code is on its way to your inbox. Check spam if you don\'t see it.';

    var closeBtn2 = document.createElement('button');
    closeBtn2.style.cssText = [
      'padding:12px 32px',
      'background:linear-gradient(135deg,#a43c12,#fe7e4f)',
      'color:#fff',
      'font-size:15px',
      'font-weight:700',
      'font-family:inherit',
      'border:none',
      'border-radius:999px',
      'cursor:pointer',
      'transition:opacity 0.2s'
    ].join(';');
    closeBtn2.textContent = 'Keep Shopping';
    closeBtn2.addEventListener('click', closePopup);
    closeBtn2.addEventListener('mouseover', function () { closeBtn2.style.opacity = '0.85'; });
    closeBtn2.addEventListener('mouseout', function () { closeBtn2.style.opacity = '1'; });

    card.appendChild(check);
    card.appendChild(msg);
    card.appendChild(sub);
    card.appendChild(closeBtn2);
  }

  // ── Open / close ───────────────────────────────────────────────────────────

  function openPopup() {
    if (popupShown) return;
    popupShown = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    clearTimeout(exitTimer);
    createPopup();
  }

  function closePopup() {
    var backdrop = document.getElementById('hr-popup-backdrop');
    if (!backdrop) return;
    backdrop.style.opacity = '0';
    var card = document.getElementById('hr-popup-card');
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px) scale(0.97)';
    }
    document.removeEventListener('keydown', handleKeydown);
    setTimeout(function () {
      if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }, 380);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') closePopup();
  }

  // ── Triggers ───────────────────────────────────────────────────────────────

  // Trigger 1: exit intent — mouse leaves top of viewport
  document.addEventListener('mouseleave', function (e) {
    if (e.clientY <= 0) openPopup();
  });

  // Trigger 2: 30-second timer
  exitTimer = setTimeout(openPopup, TIMER_DELAY);

  // Clear timer if user closes tab / navigates away
  window.addEventListener('beforeunload', function () {
    clearTimeout(exitTimer);
  });

})();
