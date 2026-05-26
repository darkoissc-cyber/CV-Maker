import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let code = fs.readFileSync(path.join(root, '_extracted.js'), 'utf8');

// Remove state block (handled by state/*)
code = code.replace(/^[\s\S]*?let dragSkillIdx=null;\n\n/, '');

// Counter & store references
const ctr = ['ec', 'dc', 'pc', 'rc', 'cc', 'sc'];
ctr.forEach((c) => {
  code = code.replace(new RegExp(`\\b${c}\\+\\+`, 'g'), `counters.${c}++`);
  code = code.replace(new RegExp(`\\b${c}\\b`, 'g'), `counters.${c}`);
});

// Undo / drag / saveTimer
code = code
  .replace(/\bundoStack\b/g, 'undoState.stack')
  .replace(/\bundoTimer\b/g, 'undoState.timer')
  .replace(/\bsaveTimer\b/g, 'saveState.timer')
  .replace(/\bdragSrc\b/g, 'dragState.src')
  .replace(/\bdragArr\b/g, 'dragState.arr')
  .replace(/\bdragSkillIdx\b/g, 'dragState.skillIdx');

const w = (rel, header, body) => {
  fs.writeFileSync(path.join(root, rel), `${header}\n${body}\n`);
};

function sliceFn(name) {
  const re = new RegExp(`(?:async )?function ${name}\\([^)]*\\)\\{`);
  const m = code.match(re);
  if (!m) throw new Error('Missing ' + name);
  let i = m.index;
  let depth = 0;
  let started = false;
  for (let j = i; j < code.length; j++) {
    if (code[j] === '{') { depth++; started = true; }
    if (code[j] === '}') depth--;
    if (started && depth === 0) return code.slice(i, j + 1);
  }
  throw new Error('Unclosed ' + name);
}

const storeImport = `import { S, counters, saveTimer } from '../state/store.js';`;
const undoImport = `import { undoState } from '../core/undo.js';`;
const dragImport = `import { dragState } from '../core/dragDrop.js';`;

w('src/storage/persistence.js', `import { LS_KEY } from '../state/constants.js';
import { S, setState, initCounters, saveTimer } from '../state/store.js';
import { migrateState } from '../state/model.js';
import { $ } from '../utils/dom.js';`, sliceFn('saveToLS').replace('saveTimer', 'saveTimer') + '\n\n' + sliceFn('loadFromLS'));

// Fix persistence - saveTimer export issue
let persist = fs.readFileSync(path.join(root, 'src/storage/persistence.js'), 'utf8');
persist = persist.replace('import { S, setState, initCounters, saveTimer }', 'import { S, setState, initCounters } from \'../state/store.js\';\nimport { saveState }');
persist = persist.replace(/\bsaveTimer\b/g, 'saveState.timer');
fs.writeFileSync(path.join(root, 'src/storage/persistence.js'), persist);

console.log('build-modules: partial - run full manual for remaining');
