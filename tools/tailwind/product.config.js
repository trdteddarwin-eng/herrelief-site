// Theme copied from the inline tailwind.config that product.html used with the Play CDN.
// Only change: metric-matched fallback faces (defined in the page's <style id="fonts">) added to the font stacks to stop the font-swap layout shift.
// Regenerate the inlined CSS after editing classes: see tools/tailwind/README.md
const path = require('path');
const root = path.join(__dirname, '..', '..');
module.exports = {
  content: [path.join(root, 'product.html'), path.join(root, 'tiktok-section.html'), path.join(root, 'js/heat-gift.js')],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],

    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "surface-tint": "#70585b",
          "primary-container": "#fadadd",
          "on-primary-fixed": "#281719",
          "on-secondary-container": "#6b1f00",
          "on-tertiary-fixed": "#22191a",
          "tertiary-fixed": "#efdfdf",
          "surface-container-lowest": "#ffffff",
          "on-error": "#ffffff",
          "background": "#faf9f6",
          "on-primary": "#ffffff",
          "surface-container-low": "#f4f3f1",
          "on-secondary-fixed": "#380c00",
          "on-primary-container": "#765e61",
          "primary": "#70585b",
          "tertiary-fixed-dim": "#d3c3c3",
          "surface-bright": "#faf9f6",
          "outline-variant": "#d2c3c4",
          "primary-fixed": "#fbdbde",
          "secondary": "#a43c12",
          "secondary-container": "#fe7e4f",
          "inverse-on-surface": "#f2f1ee",
          "on-error-container": "#93000a",
          "tertiary-container": "#efdede",
          "primary-fixed-dim": "#debfc2",
          "on-primary-fixed-variant": "#574144",
          "inverse-primary": "#debfc2",
          "secondary-fixed": "#ffdbcf",
          "surface-variant": "#e3e2e0",
          "surface": "#faf9f6",
          "inverse-surface": "#2f312f",
          "error-container": "#ffdad6",
          "outline": "#807475",
          "surface-dim": "#dbdad7",
          "on-secondary-fixed-variant": "#822800",
          "error": "#ba1a1a",
          "on-surface-variant": "#4f4445",
          "on-tertiary": "#ffffff",
          "on-tertiary-container": "#6d6161",
          "surface-container-highest": "#e3e2e0",
          "on-tertiary-fixed-variant": "#4f4444",
          "on-secondary": "#ffffff",
          "secondary-fixed-dim": "#ffb59c",
          "surface-container": "#efeeeb",
          "on-background": "#1a1c1a",
          "surface-container-high": "#e9e8e5",
          "tertiary": "#675c5c",
          "on-surface": "#1a1c1a"
        },
        fontFamily: {
          "headline": ["Noto Serif", "Noto Serif Fallback"],
          "body": ["Plus Jakarta Sans", "Plus Jakarta Sans Fallback"],
          "label": ["Plus Jakarta Sans", "Plus Jakarta Sans Fallback"]
        },
        borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"},
      },
    },
};
