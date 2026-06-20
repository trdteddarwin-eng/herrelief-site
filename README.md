# HerRelief

> Direct-to-consumer storefront for the HerRelief electric heating + vibration
> massage belt. Drug-free period cramp relief, sold direct.

**Live:** [https://heatrelief-pro.vercel.app](https://heatrelief-pro.vercel.app)
(also aliased to herrelief.com per canonical tags)

A deliberately small e-commerce site: hand-written HTML, Tailwind via CDN, no
build step, no framework. Checkout is three Stripe Payment Links — one per
bundle. The result is a shop that ships in seconds, version-controls cleanly,
and has the lowest possible surface area for a product page that needs to
convert and not break.

---

## What this is

A small, conversion-focused storefront for a single SKU sold in three
bundles. Built without a framework because the page count is small and the
complexity is contained — JavaScript only lives where it earns its place
(email-capture popup, before/after image swap, tracking shim).

The site sits in front of three live Stripe Payment Links. Everything that
*looks* like a cart or checkout flow on the page is structured HTML around
those three URLs.

---

## Features

- **Live Stripe checkout** — three Payment Links wired into the product page
  bundle selector and the cart page:
  - `buy.stripe.com/00wfZaczCgjA9Yp5pQ3F60j` (single)
  - `buy.stripe.com/aFadR28jm2sKc6x2dE3F60g` (double)
  - `buy.stripe.com/5kQbIUdDGffw5I9dWm3F60k` (triple, best value)
- **Scroll-driven hero video** on the home page (`hero-video-web.mp4`,
  ~950 KB, web-optimised MP4, autoplay-muted, playsinline).
- **Product page** with multi-image gallery, 5 heat modes / 4 vibration
  pattern detail, FAQ accordion, and bundle-aware "Buy" buttons.
- **Science page** with two named mechanisms (heat therapy + gate-control
  vibration) and a peer-reviewed citation (Lee et al., 2019, *J Phys Ther Sci*)
  — written to read like a clinical brief, not folk wisdom.
- **Cycle Wellness Toolkit** — a free 5-day guide PDF page used as the
  email-capture lead magnet and the gift on the exit-intent popup.
- **Exit-intent + 30-second email popup** (`email-popup.js`). Triggers on
  mouse leaving viewport or after 30 seconds. Once per browser session.
  *(Form action is currently a Formspree placeholder — see "Roadmap" below.)*
- **Compliance pages shipped**: `refund-policy.html`, `shipping-policy.html`,
  `privacy-policy.html`, `terms.html`. 90-day money-back guarantee surfaced
  at checkout.
- **Material Design 3 color palette** wired into the Tailwind config block —
  warm rose primary (`#70585b`), terracotta secondary (`#a43c12`), peach
  accent (`#fe7e4f`), warm white background (`#faf9f6`).
- **SEO foundations**: `<title>` + meta description + Open Graph + Twitter Card
  on every page, canonical `<link>` to `herrelief.com`, JSON-LD for
  `Organization`, `WebSite`, `BreadcrumbList` on the home page and
  `Product` schema on the product page.
- **TikTok UGC strip**. `tiktok_videos/` directory + a horizontal-scroll
  video gallery (see `tiktok-section.html`) for social-proof video review
  embeds.
- **Pluggable analytics shim** (`tracking.js`) — GA4 + Microsoft Clarity +
  TikTok Pixel hooks behind named IDs at the top of the file. Currently
  placeholders; documented inline so swapping in real IDs is a one-line
  edit.
- **Multiple presentation surfaces** beyond the main funnel: `presentation.html`
  (sales deck), `logos.html` and `style-demos-*.html` (brand-asset reference
  pages), `gift-success.html` (post-checkout thank-you).

---

## Tech stack

- **Vanilla HTML, CSS, JS** — no framework, no build step. 19 HTML pages.
- **Tailwind CSS via CDN** with the `forms` and `container-queries` plugins
  (configured in an inline `<script>` block per page).
- **Material Design 3** color tokens defined in the Tailwind extend block.
- **Plus Jakarta Sans** (body) + **Noto Serif** (display) via Google Fonts.
  **Material Symbols Outlined** for icons.
- **Stripe Payment Links** (three, live) — no Stripe Checkout / Elements SDK,
  no backend.
- **Vercel** static hosting. `vercel.json` is currently empty; the site is
  served as static files only.
- **Formspree** *(planned)* for the email-popup submission target.

---

## Quick start

There is no install step — `index.html` opens in any browser:

```bash
git clone https://github.com/trdteddarwin-eng/herrelief-site.git
cd herrelief-site
open index.html              # or any HTML page directly
```

For accurate `localhost` testing (so the popup `sessionStorage` flag and
canonical URLs behave realistically), serve with any static server:

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

Deploy is plain `vercel --prod` (or just push to the GitHub-connected Vercel
project).

---

## Project structure

```
.
├── index.html                       Home page — hero video, bundle teaser, social proof
├── product.html                     Product page — gallery, 3-bundle selector, FAQ
├── cart.html                        Cart page — same three bundles, second checkout entry
├── science.html                     Mechanism + peer-reviewed citation
├── cycle-wellness-toolkit.html      Free 5-day guide / lead magnet
├── about.html                       Brand story
├── contact.html                     Contact form (no backend yet — see Roadmap)
├── refund-policy.html
├── shipping-policy.html
├── privacy-policy.html
├── terms.html
├── presentation.html                Sales deck (HTML slides)
├── logos.html                       Brand-asset reference page
├── style-demos-{1,2}.html           Internal style references
├── tiktok-section.html              UGC video strip (embedded in main pages)
├── gift-success.html                Post-checkout thank-you / order confirmation copy
├── 404.html
├── profile-pic.html                 Avatar generator (internal)
│
├── email-popup.js                   Exit-intent + 30s popup, sessionStorage dedup
├── tracking.js                      GA4 + Clarity + TikTok pixel shim (placeholders)
├── js/before-after.js               Before/after image slider component
│
├── hero-video-web.mp4               Web-optimised hero (~950 KB)
├── favicon.svg
├── images/                          Product, branded, lifestyle
├── tiktok_videos/                   UGC review videos
└── vercel.json                      Currently empty {} — see "Roadmap"
```

---

## Engineering notes

**Why no framework.** The page count is small, the routes are static, and
FCP matters more than DX for a shop selling to mobile-first buyers in a
moment of physical discomfort. A framework would add a build step, a hydration
cost, and a layer that has to be debugged on top of HTML. The trade-off:
shared chunks (header, footer, popup script) are duplicated across pages
rather than componentised. The fix isn't a framework — it's a tiny build
script if it ever becomes a problem (it hasn't).

**Stripe Payment Links over Checkout Sessions.** Three Payment Links cover the
three bundles. The site never calls Stripe's API directly — no backend, no
keys, no idempotency keys, no webhooks. The trade-off: no dynamic cart
totals, no upsells from server-side computation, no automatic A/B priced
variants. For a single-SKU 3-bundle shop, that's the right call. The day this
becomes a real catalogue, Checkout Sessions become worth the backend.

**Tailwind CDN, not a build.** The page ships with the runtime Tailwind
compiler. The cost: ~290 KB of JS on first paint, and styles compile in the
browser on every load. The benefit: editing a page is "save the HTML, refresh."
The site is small enough that the runtime cost is comfortable. If conversion
metrics ever pin on first-paint speed, a one-time `tailwindcss build` step
gets rid of the runtime entirely.

**Email popup hard rules.** `email-popup.js` shows once per session
(`sessionStorage`), on either exit-intent (mouseleave with `clientY <= 0`)
or after 30 s on page. It bypasses if the user has already submitted. The
form action is currently a placeholder; replace with a real Formspree (or
similar) endpoint before the next campaign — see Roadmap.

**No central nav/footer component.** Each HTML page contains its full nav and
footer markup. Updates require editing 19 files. This is a deliberate cost
because the alternative (a tiny SSI/JS include) trades it for a runtime
dependency on JavaScript executing before the nav renders. A small Node script
that generates pages from a shared template is the right next step if this
becomes painful.

**JSON-LD is the SEO investment.** The home page emits Organization +
WebSite + BreadcrumbList schemas. The product page emits a Product schema
(`name`, `description`, `image`). The site is small enough that getting these
right is high-leverage — they unlock rich snippets in Google and Shopping
Graph eligibility without spending a dollar.

**Tracking is opt-in by design.** `tracking.js` is a shim: it has named
constants for GA4 / Clarity / TikTok pixel IDs at the top with placeholder
values and inline instructions. The site ships zero tracking until a real ID
is pasted in. Lower legal/privacy surface area during development; trivial to
enable later.

---

## Deployment

Vercel static-hosted, deployed on push to `main`. The Vercel project name is
`heatrelief-pro` and the production alias is currently the
`heatrelief-pro.vercel.app` subdomain. The canonical domain in the page meta
tags is `herrelief.com` — alias setup pending.

`vercel.json` is currently `{}`. Custom routes, rewrites, headers, and clean
URLs are not configured (Vercel defaults apply). See Roadmap.

---

## Roadmap / known limits

Honest list. Things the site doesn't have today that a senior reviewer
would notice:

- **`vercel.json` is empty.** Hardened security headers (CSP, HSTS,
  X-Frame-Options, Permissions-Policy locking down camera/mic/geo) are NOT
  currently configured. These should be added — the site is in production
  and these are free wins.
- **`clean-urls` not enabled.** URLs include `.html` extensions today.
  Adding `cleanUrls: true` to `vercel.json` would make them prettier.
- **Email popup form action is a placeholder** (`formspree.io/f/placeholder`).
  Submissions go nowhere until a real Formspree endpoint or a Vercel function
  is wired. Same for the contact form.
- **Analytics IDs are placeholders** in `tracking.js`. Replace before the
  next paid campaign.
- **Nav and footer markup is duplicated across 19 pages.** A tiny build
  script that templates them from a single source would cut maintenance cost.
- **No A/B framework.** Bundle pricing, hero copy, and the popup offer are
  all hard-coded. A lightweight client-side flag system (e.g. a JSON loaded
  at boot) would unlock cheap experiments.

---

## License

No license file is currently committed. Source-available for portfolio review.
Ask before reusing.
