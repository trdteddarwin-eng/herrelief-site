# Tailwind build

product.html, index.html and cart.html no longer load the Tailwind Play CDN (a runtime JIT
that blocked rendering). Their Tailwind CSS is prebuilt and inlined in `<style id="tw">`.

If you add or change Tailwind classes in those pages (or in tiktok-section.html,
js/heat-gift.js, js/before-after.js), rebuild:

    cd tools/tailwind && npm install && npm run build

Theme colors/fonts live in `<page>.config.js` (copied from the old inline tailwind.config).
