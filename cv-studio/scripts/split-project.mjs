/**
 * One-time splitter: reads monolith extracts and writes modular files.
 * Run from cv-studio/: node scripts/split-project.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktop = path.join(root, '..');
const monolith = path.join(desktop, 'cv-studio-v2.html');
const html = fs.readFileSync(monolith, 'utf8');

const cssMain = html.match(/<style>\n([\s\S]*?)<\/style>/)[1];
const cssAnim = html.match(/<style>\n(@key[\s\S]*?)<\/style>/)[1];
const bodyInner = html.match(/<body>\n([\s\S]*)<\/script>\s*<\/body>/)[1].replace(/<script>[\s\S]*$/, '');
const js = html.match(/<script>\n([\s\S]*)<\/script>\s*<\/body>/)[1];

const stylesDir = path.join(root, 'src/styles');
const splitCss = (name, startMarker, endMarker) => {
  const start = cssMain.indexOf(startMarker);
  const end = endMarker ? cssMain.indexOf(endMarker, start + 1) : cssMain.length;
  const chunk = start >= 0 ? cssMain.slice(start, end >= 0 ? end : undefined) : '';
  fs.writeFileSync(path.join(stylesDir, name), chunk.trim() + '\n');
};

splitCss('base.css', '*,*::before', '/* ── Header ── */');
splitCss('layout.css', '/* ── Header ── */', '/* Photo Upload */');
splitCss('components.css', '/* Photo Upload */', '/* ═══ CV DOC ═══ */');
splitCss('templates.css', '/* ═══ CV DOC ═══ */', '/* Template mini previews */');
const tplMini = cssMain.slice(cssMain.indexOf('/* Template mini previews */'), cssMain.indexOf('/* ATS Panel */'));
fs.appendFileSync(path.join(stylesDir, 'templates.css'), '\n' + tplMini.trim() + '\n');
splitCss('utilities.css', '/* ATS Panel */', '/* PDF page breaks */');
const utilRest = cssMain.slice(cssMain.indexOf('/* PDF page breaks */'));
fs.appendFileSync(path.join(stylesDir, 'utilities.css'), '\n' + utilRest.trim() + '\n');
fs.writeFileSync(path.join(stylesDir, 'animations.css'), cssAnim.trim() + '\n');

fs.writeFileSync(
  path.join(stylesDir, 'main.css'),
  `@import url('base.css');
@import url('layout.css');
@import url('components.css');
@import url('templates.css');
@import url('utilities.css');
@import url('animations.css');
`
);

// index.html
const head = html.match(/<head>[\s\S]*?<\/head>/)[0]
  .replace(/<style>[\s\S]*?<\/style>\n?/g, '')
  .replace(/<style>[\s\S]*?<\/style>\n?/g, '')
  .replace('</head>', `  <link rel="stylesheet" href="src/styles/main.css">\n</head>`);

fs.writeFileSync(
  path.join(root, 'index.html'),
  `<!DOCTYPE html>\n<html lang="en" data-theme="dark">\n${head}\n<body>\n${bodyInner}<script type="module" src="src/main.js"></script>\n</body>\n</html>\n`
);

console.log('Wrote styles + index.html');
