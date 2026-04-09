/**
 * HeatRelief Pro — Tracking & Analytics
 *
 * HOW TO SET UP (all free):
 *
 * 1. GOOGLE ANALYTICS 4:
 *    - Go to https://analytics.google.com → Create account → Create property
 *    - Copy your Measurement ID (looks like G-XXXXXXXXXX)
 *    - Replace 'G-XXXXXXXXXX' below
 *
 * 2. MICROSOFT CLARITY:
 *    - Go to https://clarity.microsoft.com → Create project
 *    - Copy your Project ID (looks like "abcdefghij")
 *    - Replace 'CLARITY_PROJECT_ID' below
 *
 * 3. TIKTOK PIXEL:
 *    - Go to TikTok Ads Manager → Events → Web Events → Create Pixel
 *    - Copy your Pixel ID (looks like "CXXXXXXXXXXXXXXXXX")
 *    - Replace 'TIKTOK_PIXEL_ID' below
 *
 * 4. META PIXEL (Facebook/Instagram):
 *    - Go to Meta Events Manager → Create Pixel
 *    - Copy your Pixel ID (looks like "123456789012345")
 *    - Replace 'META_PIXEL_ID' below
 */

// ============================================
// CONFIGURATION — Replace these with your IDs
// ============================================
const TRACKING_CONFIG = {
  GA4_ID: 'G-XXXXXXXXXX',           // Google Analytics 4
  CLARITY_ID: 'CLARITY_PROJECT_ID',  // Microsoft Clarity
  TIKTOK_ID: 'TIKTOK_PIXEL_ID',     // TikTok Pixel
  META_ID: 'META_PIXEL_ID',         // Meta (Facebook/Instagram) Pixel
};

// ============================================
// 1. GOOGLE ANALYTICS 4
// ============================================
(function() {
  if (TRACKING_CONFIG.GA4_ID === 'G-XXXXXXXXXX') return; // Skip if not configured

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_CONFIG.GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', TRACKING_CONFIG.GA4_ID, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure',
  });
})();

// ============================================
// 2. MICROSOFT CLARITY
// ============================================
(function() {
  if (TRACKING_CONFIG.CLARITY_ID === 'CLARITY_PROJECT_ID') return;

  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", TRACKING_CONFIG.CLARITY_ID);
})();

// ============================================
// 3. TIKTOK PIXEL
// ============================================
(function() {
  if (TRACKING_CONFIG.TIKTOK_ID === 'TIKTOK_PIXEL_ID') return;

  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
    ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
    ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
    var a=document.createElement("script");a.type="text/javascript";a.async=!0;a.src=r+"?sdkid="+e+"&lib="+t;
    var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};
    ttq.load(TRACKING_CONFIG.TIKTOK_ID);
    ttq.page();
  }(window, document, 'ttq');
})();

// ============================================
// 4. META PIXEL (Facebook/Instagram)
// ============================================
(function() {
  if (TRACKING_CONFIG.META_ID === 'META_PIXEL_ID') return;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', TRACKING_CONFIG.META_ID);
  fbq('track', 'PageView');
})();

// ============================================
// 5. CUSTOM EVENT TRACKING
// Tracks user behavior across all platforms
// ============================================
const HRTracking = {

  // Track a custom event across all platforms
  track: function(eventName, params) {
    params = params || {};
    console.log(`[HeatRelief Track] ${eventName}`, params);

    // GA4
    if (window.gtag) {
      gtag('event', eventName, params);
    }

    // TikTok
    if (window.ttq) {
      ttq.track(eventName, params);
    }

    // Meta
    if (window.fbq) {
      fbq('trackCustom', eventName, params);
    }

    // Clarity — custom tags
    if (window.clarity) {
      clarity('set', eventName, JSON.stringify(params));
    }
  },

  // Standard e-commerce events
  viewContent: function(value, currency) {
    if (window.gtag) gtag('event', 'view_item', { currency: currency || 'USD', value: value, items: [{ item_name: 'HeatRelief Pro', price: value }] });
    if (window.ttq) ttq.track('ViewContent', { content_type: 'product', content_id: 'heatrelief-pro', value: value, currency: currency || 'USD' });
    if (window.fbq) fbq('track', 'ViewContent', { content_name: 'HeatRelief Pro', content_type: 'product', value: value, currency: currency || 'USD' });
  },

  addToCart: function(value, quantity) {
    if (window.gtag) gtag('event', 'add_to_cart', { currency: 'USD', value: value, items: [{ item_name: 'HeatRelief Pro', price: value, quantity: quantity || 1 }] });
    if (window.ttq) ttq.track('AddToCart', { content_type: 'product', content_id: 'heatrelief-pro', value: value, currency: 'USD', quantity: quantity || 1 });
    if (window.fbq) fbq('track', 'AddToCart', { content_name: 'HeatRelief Pro', value: value, currency: 'USD', content_type: 'product' });
  },

  initiateCheckout: function(value) {
    if (window.gtag) gtag('event', 'begin_checkout', { currency: 'USD', value: value });
    if (window.ttq) ttq.track('InitiateCheckout', { value: value, currency: 'USD' });
    if (window.fbq) fbq('track', 'InitiateCheckout', { value: value, currency: 'USD' });
  },

  purchase: function(value, orderId) {
    if (window.gtag) gtag('event', 'purchase', { currency: 'USD', value: value, transaction_id: orderId || Date.now().toString() });
    if (window.ttq) ttq.track('CompletePayment', { value: value, currency: 'USD' });
    if (window.fbq) fbq('track', 'Purchase', { value: value, currency: 'USD' });
  },

  selectBundle: function(bundleName, value) {
    this.track('select_bundle', { bundle: bundleName, value: value });
  },
};

// ============================================
// 6. AUTO-TRACKING (runs on every page)
// ============================================
document.addEventListener('DOMContentLoaded', function() {

  // --- Scroll depth tracking ---
  let maxScroll = 0;
  const scrollMilestones = [25, 50, 75, 90, 100];
  const firedMilestones = {};

  window.addEventListener('scroll', function() {
    const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPct > maxScroll) {
      maxScroll = scrollPct;
      scrollMilestones.forEach(function(milestone) {
        if (scrollPct >= milestone && !firedMilestones[milestone]) {
          firedMilestones[milestone] = true;
          HRTracking.track('scroll_depth', { depth: milestone + '%' });
        }
      });
    }
  });

  // --- Track time on page ---
  let startTime = Date.now();
  const timeThresholds = [30, 60, 120, 300]; // seconds
  const firedTimes = {};

  setInterval(function() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeThresholds.forEach(function(t) {
      if (elapsed >= t && !firedTimes[t]) {
        firedTimes[t] = true;
        HRTracking.track('time_on_page', { seconds: t });
      }
    });
  }, 5000);

  // --- Track all link clicks ---
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (link) {
      const href = link.getAttribute('href');

      // Track Add to Cart / Shop Now clicks
      if (href === 'cart.html') {
        HRTracking.addToCart(39.99, 1);
      }

      HRTracking.track('link_click', {
        url: href,
        text: (link.textContent || '').trim().substring(0, 50),
      });
    }

    // Track button clicks
    const btn = e.target.closest('button');
    if (btn) {
      HRTracking.track('button_click', {
        text: (btn.textContent || '').trim().substring(0, 50),
      });
    }
  });

  // --- Track which sections are viewed ---
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('section[id]');
    const sectionsSeen = {};

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !sectionsSeen[entry.target.id]) {
          sectionsSeen[entry.target.id] = true;
          HRTracking.track('section_viewed', { section: entry.target.id });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function(s) { observer.observe(s); });
  }

  // --- Fire ViewContent on landing page ---
  if (window.location.pathname.includes('index') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    HRTracking.viewContent(39.99, 'USD');
  }

  // --- Fire InitiateCheckout on cart page ---
  if (window.location.pathname.includes('cart')) {
    HRTracking.initiateCheckout(39.99);
  }

  // --- Track exit intent (mouse leaves viewport) ---
  let exitFired = false;
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 5 && !exitFired) {
      exitFired = true;
      HRTracking.track('exit_intent', { scroll_depth: maxScroll + '%' });
    }
  });

});
