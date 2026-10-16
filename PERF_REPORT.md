# herrelief.store speed pass (mobile first)

Branch `perf`. Goal: as fast as possible for Instagram in-app traffic, with no visible or behavioral change.

## Results (Lighthouse mobile)

**Like-for-like comparison:** the original and optimized copies were served from the same local server
(Python http.server, so no gzip/brotli, no HTTP/2 and no Range requests). Each number is the median of 3 runs.
The byte counts are uncompressed, so Vercel will serve much less. The Mac was busy during testing,
so TBT varies ±200 ms from run to run.

| Page | Version | Score | FCP | LCP | TBT | CLS | Speed Index | Transfer | Requests |
|---|---|---|---|---|---|---|---|---|---|
| product.html | before | 62 | 3.7 s | 3.7 s | 785 ms | 0.019 | 4.0 s | 6,502 KiB | 56 |
| product.html | **after** | **94** | **1.5 s** | **2.1 s** | 260 ms | **0** | 1.9 s | 1,204 KiB | 41 |
| index.html | before | 72 | 3.3 s | 3.5 s | 378 ms | 0.001 | 5.5 s | 2,645 KiB | 19 |
| index.html | **after** | **96** | **1.2 s** | **1.2 s** | 207 ms | 0.008 | 2.6 s | 1,389 KiB | 15 |
| cart.html | before | 69 | 3.7 s | 3.8 s | 405 ms | 0 | 4.1 s | 2,783 KiB | 16 |
| cart.html | **after** | **94** | **1.3 s** | **1.3 s** | 267 ms | 0 | 1.4 s | 362 KiB | 12 |
| heat-guide.html | before | 97 | 1.5 s | 1.7 s | 178 ms | 0.043 | 1.7 s | 629 KiB | 14 |
| heat-guide.html | after | 96 | 1.5 s | 1.6 s | ~200 ms | 0.043 | 1.7 s | 429 KiB | 15 |

**Live baseline** (https://herrelief.store, before this branch, 1 run each): product 63 (LCP 3.6 s, TBT 880 ms, **32 MB**, 61 requests),
index 80 (LCP 3.3 s), cart 78 (LCP 3.7 s, 2.7 MB), heat-guide 95.
The live product page downloaded ~32 MB, almost all of it 22 UGC MP4s that were loaded just to show thumbnails.
After this branch the product page downloads **no video at all** until someone plays one.

## What changed

**1. Tailwind Play CDN removed** (product, index, cart)
- The CDN was a ~127 KB render-blocking script that compiled CSS in the browser at runtime.
- Replaced with prebuilt, purged CSS inlined in `<style id="tw">`: 34 / 29 / 21 KiB raw, roughly 6 KiB gzipped. It uses the exact Tailwind 3.4.17, forms and container-queries versions the CDN served.
- The CSS is placed where the CDN injected its own, after each page's head `<style>`, so the cascade order is the same.
- To rebuild after editing classes: `cd tools/tailwind && npm install && npm run build`. The theme lives in `tools/tailwind/<page>.config.js`.

**2. Fonts self-hosted** (product, index, cart)
- Google Fonts CSS was render-blocking and needed two extra origins. It is replaced by inline `@font-face` rules pointing at `/fonts/` (same woff2 files, same unicode-range split).
- The two critical latin files are preloaded.
- **Material Symbols icon font: 1.1 MB → 20 KB.**
  - The font is a custom subset (`tools/material-symbols-subset.py`) that keeps exactly the glyphs the 63 icon names on these pages use.
  - The subset was verified with HarfBuzz to shape every name identically to the full font. That includes `colors_spark` and `heating`, which are not real icons and render as glyph fragments; they look exactly as before.
  - It is inlined as a data URI, so there is no request.
  - A 1em placeholder width is held until the font is ready, so the icon names never flash as text and never push the layout around.
- Metric-matched fallback faces (`Plus Jakarta Sans Fallback` / `Noto Serif Fallback`, local Arial/Times with size and ascent overrides) mean the text-font swap no longer shifts the layout. Once the web fonts load, the page looks exactly as before.
- heat-guide keeps Google Fonts. Self-hosting there made its fonts compete with the LCP image and measured slower.

**3. Images:** sized WebP in `images/opt/`. The originals stay in place for OG tags and schema.
- Product hero (LCP): 1200px JPG (111 KB) → `srcset` of WebP at 600/900/1200 (18 / 28 / 44 KB) with `fetchpriority="high"`. `switchImage()` now clears `srcset` before swapping the image.
- Gallery thumbnails: previously the full 1024px images (~620 KB for 4 thumbs); now 280px WebP (~16 KB total). Clicking a thumbnail loads a full-size WebP.
- Index: lifestyle-couch 2.1 MB → 27 KB, detail-heat 1.4 MB → 40 KB, gift-ready 885 KB → 75 KB, guarantee badge 713 KB → 12 KB, tracker PNG 149 KB → 18 KB, and others.
- Cart: hero-clean was a 4096px, 1.27 MB image shown at 112px. It is now 4.5 KB.
- Resized widths keep the exact original aspect ratio, so layout is pixel-identical.
- heat-guide: the LCP image gets `srcset` (500/700/1000) and the 52px bundle thumbnails use 160px versions.

**4. Video**
- The product "Watch Real Reviews" strip had 22 `<video preload="metadata">` elements. They are now static poster images (the same frame at 0.1 s). The video still opens in the same modal on tap.
- The TikTok carousel used to download each of its 12 videos to grab a frame at 0.5 s, then encode it to a canvas data URL on the main thread. It now uses pre-rendered posters of that same frame, with `preload="none"`.
  - Autoplay when the card scrolls into view is unchanged, and playback still starts at 0.5 s.
- `tiktok-section.html` is fetched after the page `load` event, or immediately on the first video-thumbnail tap. Before, it was fetched during load.
- The index hero video is unchanged: the scroll-scrub effect needs it preloaded.
- The MP4s were not re-encoded. Downscaling them would have been a visible quality change, and they now only load on demand anyway.

**5. JavaScript**
- The index before/after canvas animation pauses while off screen. Its clock keeps running, so it resumes seamlessly.
- The index hero scroll loop only seeks the video when the scroll position actually changed. Before, it seeked every frame forever, even while idle.
- Two `<style>` blocks for the gallery tabs and video strip were in `<body>` after their markup, so those elements painted unstyled and then jumped. They now sit at the end of `<head>`. Product CLS: 0.057 → 0.

**6. `vercel.json` caching** (there were no rewrites or redirects to keep)

| Path | Cache-Control | Why |
|---|---|---|
| `/fonts/*` | 1 year, immutable | Google's hashed filenames |
| `/images/*`, `/tiktok_videos/*`, `*.mp4`, `*.svg` | 7 days + stale-while-revalidate 30 days | Not content-hashed, so an image replaced in place can be up to 7 days stale for a returning visitor |
| `js/*`, `tracking.js`, `email-popup.js` | 1 hour + stale-while-revalidate 1 day | Code fixes need to reach visitors quickly |

HTML keeps Vercel's default (always revalidated). `.vercelignore` keeps `tools/` and this report off the live site.

## Verified
- **Screenshots:** full-page screenshots at 390px and 1440px for all 4 pages, original against optimized.
  - Page heights are identical, with no horizontal scroll at 390 on product, index or heat-guide.
  - Remaining pixel differences are 0.002–0.28% of pixels. All of them were inspected: WebP recompression, the random "people viewing" counter, and CSS animation phase (pulse, canvas, sparkles).
- **Overlays:** the HEAT10 popup, cart drawer, video modal and cart in gift mode were compared visually. They differ only in animation phase.
- **Click tests:**
  - Every Stripe link and `data-stripe-link` on load and after each bundle switch (product and cart) matches the original.
  - Gift mode (`?gift=HEAT10`): the popup text, strip, discounted prices, `prefilled_promo_code=HEAT10` on every Stripe link, and the cart checkout redirect all match.
  - Cart checkout redirects to the right Stripe link with and without the gift code.
  - heat-guide bundle radios set the right link and label.
  - The cart drawer opens with the same contents, and a video thumbnail opens the modal with the right video.
  - `captureEmail` is present on all pages.
- **No console errors** on any page.
- **Meta Pixel:** the pages were served under the real `https://herrelief.store` origin via request interception, and the outgoing `/tr` hits were captured and aborted, so nothing was sent to Meta. Identical events fired before and after:
  - product: PageView
  - index: PageView, ViewContent
  - cart: PageView, InitiateCheckout, scroll_depth
  - heat-guide: PageView, scroll_depth, section_viewed

## Pre-existing issues noticed (not changed)
- `images/reviews/review-photo-*.{webp,jpg}` are 404 on live (product review cards), and so is heat-guide's `og:image` (`images/v2/hero-still-life-1200.webp`).
- cart.html is about 14px wider than a 390px screen (horizontal scroll), the same as live.
- heat-guide.html calls `window.HRTracking`, but tracking.js defines `HRTracking` as a top-level `const`, so `window.HRTracking` is undefined. Its custom ViewContent/InitiateCheckout calls never fire; PageView and auto events do.
- heat-guide still has a 0.043 font-swap CLS (Fraunces), as before.
- The other pages (about, contact, policies, etc.) still use the Tailwind CDN; only the 4 priority pages were optimized.

## Maintenance notes
- If you add Tailwind classes to product, index or cart, or to tiktok-section.html / js/heat-gift.js / js/before-after.js, rebuild the CSS (`tools/tailwind`). Otherwise the new classes will have no styles.
- If you add a new Material Symbols icon name to those pages, rebuild the icon subset (`tools/material-symbols-subset.py`). Otherwise the name shows as text.
