// Builds each page's Tailwind CSS and inlines it into <style id="tw">...</style> in that page.
// Usage: cd tools/tailwind && npm install && npm run build
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const bin = process.env.TAILWIND_BIN || path.join(__dirname, 'node_modules', '.bin', 'tailwindcss');
const pages = ['product', 'index', 'cart'];

for (const page of pages) {
  const css = execFileSync(bin, [
    '-c', path.join(__dirname, `${page}.config.js`),
    '-i', path.join(__dirname, 'input.css'),
    '--minify',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const file = path.join(root, `${page}.html`);
  const html = fs.readFileSync(file, 'utf8');
  const re = /<style id="tw">[\s\S]*?<\/style>/;
  if (!re.test(html)) throw new Error(`${page}.html has no <style id="tw"> block`);
  fs.writeFileSync(file, html.replace(re, () => `<style id="tw">${css}</style>`));
  console.log(`${page}.html: ${(css.length / 1024).toFixed(1)} KiB of Tailwind CSS inlined`);
}
