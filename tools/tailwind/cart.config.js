// Theme copied from the inline tailwind.config that cart.html used with the Play CDN.
// Only change: metric-matched fallback faces (defined in the page's <style id="fonts">) added to the font stacks to stop the font-swap layout shift.
// Regenerate the inlined CSS after editing classes: see tools/tailwind/README.md
const path = require('path');
const root = path.join(__dirname, '..', '..');
module.exports = {
  content: [path.join(root, 'cart.html'), path.join(root, 'js/heat-gift.js')],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],

    theme: {
      extend: {
        colors: {
          "primary": "#70585b",
          "primary-container": "#fadadd",
          "on-primary": "#ffffff",
          "on-primary-container": "#765e61",
          "secondary": "#a43c12",
          "secondary-container": "#fe7e4f",
          "on-secondary": "#ffffff",
          "background": "#faf9f6",
          "surface": "#faf9f6",
          "surface-container-low": "#f4f3f1",
          "surface-container": "#efeeeb",
          "surface-container-lowest": "#ffffff",
          "on-surface": "#1a1c1a",
          "on-surface-variant": "#4f4445",
          "outline": "#807475",
          "outline-variant": "#d2c3c4",
          "success": "#16a34a",
          "success-light": "#dcfce7",
        },
        fontFamily: {
          "headline": ["Noto Serif", "Noto Serif Fallback"],
          "body": ["Plus Jakarta Sans", "Plus Jakarta Sans Fallback"],
        },
        borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "full": "9999px"},
      },
    },
};
