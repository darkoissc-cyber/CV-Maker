import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktop = path.join(root, '..');
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css =
  fs.readFileSync(path.join(root, '_extracted.css'), 'utf8') +
  '\n' +
  fs.readFileSync(path.join(root, 'src/styles/animations.css'), 'utf8');
const js = fs.readFileSync(path.join(root, '_extracted.js'), 'utf8');

const head = idx
  .match(/<head>[\s\S]*?<\/head>/)[0]
  .replace(/<link rel="stylesheet" href="src\/styles\/main.css">/, `<style>\n${css}</style>`);

const body = idx.split('<script type="module"')[0].split('<body>')[1];
const bodyHtml = '<body>\n' + body;

const out = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
${head}
${bodyHtml}
<script>
${js}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(desktop, 'cv-studio-v2.html'), out);
console.log('Wrote cv-studio-v2.html', out.length, 'bytes');
