/**
 * Splits _extracted.js into ES modules (behavior-preserving).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const js = fs.readFileSync(path.join(root, '_extracted.js'), 'utf8');

const w = (rel, content) => {
  const fp = path.join(root, rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
};

// ── constants + model ──
const constBlock = js.match(/const SCHEMA_VERSION[\s\S]*?function syncCounters\(\)\{[\s\S]*?\}\n/)[0];
w('src/state/constants.js', constBlock.split('function createDefaultState')[0].replace(
  /const (SCHEMA_VERSION|LS_KEY|LS_THEME|ACCENTS|PROG_FIELDS|ACTION_VERBS)/g,
  'export const $1'
));

w('src/state/model.js', `import { SCHEMA_VERSION } from './constants.js';

${js.match(/function createDefaultState\(\)\{[\s\S]*?return d;\n\}/)[0]}

${js.match(/function syncCounters\(\)\{[\s\S]*?\}\n/)[0].replace('function syncCounters', 'export function syncCounters')}
`);

w('src/state/store.js', `import { createDefaultState } from './model.js';
import { syncCounters } from './model.js';

export let S = createDefaultState();
export const counters = { ec: 0, dc: 0, pc: 0, rc: 0, cc: 0, sc: 0 };
export let undoStack = null;
export let undoTimer = null;
export let saveTimer = null;
export let dragSrc = null;
export let dragArr = null;
export let dragSkillIdx = null;

export function replaceState(next) {
  S = next;
  syncCounters(S, counters);
}

export function resetCounters() {
  syncCounters(S, counters);
}
`);

// Fix model.js syncCounters to accept params
const modelJs = fs.readFileSync(path.join(root, 'src/state/model.js'), 'utf8');
fs.writeFileSync(
  path.join(root, 'src/state/model.js'),
  modelJs
    .replace(
      'function syncCounters(){',
      'export function syncCounters(state, ctr) {'
    )
    .replace(/ec=/g, 'ctr.ec=')
    .replace(/dc=/g, 'ctr.dc=')
    .replace(/pc=/g, 'ctr.pc=')
    .replace(/rc=/g, 'ctr.rc=')
    .replace(/cc=/g, 'ctr.cc=')
    .replace(/sc=/g, 'ctr.sc=')
    .replace(/S\./g, 'state.')
);

w('src/utils/escape.js', `export function x(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
`);

console.log('Wrote state + escape');
