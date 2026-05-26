import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lines = fs.readFileSync(path.join(root, '_extracted.js'), 'utf8').split('\n');

const slice = (a, b) => lines.slice(a - 1, b).join('\n');

const transform = (body) =>
  body
    .replace(/\bec\+\+/g, 'counters.ec++')
    .replace(/\bdc\+\+/g, 'counters.dc++')
    .replace(/\bpc\+\+/g, 'counters.pc++')
    .replace(/\brc\+\+/g, 'counters.rc++')
    .replace(/\bcc\+\+/g, 'counters.cc++')
    .replace(/\bsc\+\+/g, 'counters.sc++')
    .replace(/^function /gm, 'export function ')
    .replace(/^async function /gm, 'export async function ');

const write = (rel, imports, start, end) => {
  fs.writeFileSync(path.join(root, rel), `${imports}\n\n${transform(slice(start, end))}\n`);
};

const S = "import { S, counters } from '../state/store.js';";
const SX = `${S}\nimport { x } from '../utils/escape.js';`;
const SS = `${S}\nimport { saveToLS } from '../storage/persistence.js';`;

write('src/renderers/helpers.js', SX, 662, 697);
write('src/ats/calcATS.js', `${S}\nimport { ACTION_VERBS } from '../state/constants.js';\nimport { x } from '../utils/escape.js';`, 561, 604);
write('src/ats/renderATS.js', `${S}\nimport { calcATS } from './calcATS.js';\nimport { x } from '../utils/escape.js';\nimport { $ } from '../utils/dom.js';`, 605, 625);
write('src/core/progress.js', `${S}\nimport { PROG_FIELDS } from '../state/constants.js';\nimport { $ } from '../utils/dom.js';`, 311, 343);

write('src/templates/vertex.js', `${SX}\nimport { ci, renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';`, 699, 735);
write('src/templates/atlas.js', `${SX}\nimport { renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';`, 736, 775);
write('src/templates/pulse.js', `${SX}\nimport { ci, renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';`, 776, 820);
write('src/templates/classic.js', `${SX}\nimport { projLinks, certLine } from '../renderers/helpers.js';`, 821, 846);
write('src/templates/executive.js', `${SX}\nimport { renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';`, 847, 872);
write('src/templates/creative.js', `${SX}\nimport { renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';`, 873, 901);
write('src/templates/minimal.js', `${SX}\nimport { certLine } from '../renderers/helpers.js';`, 902, 933);

fs.writeFileSync(
  path.join(root, 'src/templates/index.js'),
  `import { renderVertex } from './vertex.js';
import { renderAtlas } from './atlas.js';
import { renderPulse } from './pulse.js';
import { renderClassic } from './classic.js';
import { renderExecutive } from './executive.js';
import { renderCreative } from './creative.js';
import { renderMinimal } from './minimal.js';

export const TEMPLATE_RENDERERS = {
  vertex: renderVertex,
  atlas: renderAtlas,
  pulse: renderPulse,
  classic: renderClassic,
  executive: renderExecutive,
  creative: renderCreative,
  minimal: renderMinimal,
};
`
);

write('src/storage/persistence.js', `import { LS_KEY } from '../state/constants.js';
import { S, setState, saveTimer } from '../state/store.js';
import { migrateState } from '../state/model.js';
import { $ } from '../utils/dom.js';`, 91, 124);

write('src/storage/importExport.js', `${S}
import { setState, initCounters } from '../state/store.js';
import { migrateState } from '../state/model.js';
import { saveToLS } from './persistence.js';
import { applyStateToUI } from '../core/stateUI.js';
import { syncFromForm } from '../components/forms.js';`, 127, 170);

write('src/export/pdf.js', `${S}
import { $ } from '../utils/dom.js';`, 173, 198);

write('src/core/dragDrop.js', `${S}
import { saveToLS } from '../storage/persistence.js';
import { rForms } from '../components/forms.js';
import { renderCV } from '../renderers/pipeline.js';

export const dragState = { src: null, arr: null, skillIdx: null };
`, 200, 233);

write('src/core/undo.js', `${S}
import { saveToLS } from '../storage/persistence.js';
import { rForms } from '../components/forms.js';
import { renderCV } from '../renderers/pipeline.js';
import { $ } from '../utils/dom.js';

export const undoState = { stack: null, timer: null };
`, 235, 263);

write('src/theme/template.js', `${S}
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';`, 265, 270);

write('src/theme/accents.js', `${S}
import { ACCENTS } from '../state/constants.js';
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';`, 271, 275);

write('src/theme/theme.js', `import { LS_THEME } from '../state/constants.js';
import { $ } from '../utils/dom.js';`, 276, 283);

write('src/components/photo.js', `${S}
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';
import { $ } from '../utils/dom.js';`, 286, 307);

write('src/components/skills.js', `${SX}
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';
import { showUndo } from '../core/undo.js';
import { dragState } from '../core/dragDrop.js';
import { $ } from '../utils/dom.js';`, 398, 439);

write('src/components/sections.js', `${SX}
import { saveToLS } from '../storage/persistence.js';
import { rForms } from './forms.js';
import { renderCV } from '../renderers/pipeline.js';
import { showUndo } from '../core/undo.js';`, 345, 450);

write('src/components/forms.js', `${SX}
import { makeDraggable } from '../core/dragDrop.js';
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';
import { $ } from '../utils/dom.js';`, 455, 556);

write('src/renderers/pipeline.js', `${S}
import { ACCENTS } from '../state/constants.js';
import { syncFromForm } from '../components/forms.js';
import { updateProgress } from '../core/progress.js';
import { renderATS } from '../ats/renderATS.js';
import { TEMPLATE_RENDERERS } from '../templates/index.js';
import { $ } from '../utils/dom.js';`, 638, 660);

write('src/core/stateUI.js', `${S}
import { saveToLS } from '../storage/persistence.js';
import { rForms, restoreFormValues } from '../components/forms.js';
import { rSkills, rLangs } from '../components/skills.js';
import { renderCV } from '../renderers/pipeline.js';
import { removePhoto } from '../components/photo.js';
import { $ } from '../utils/dom.js';`, 152, 170);

write('src/core/update.js', `${S}
import { syncFromForm } from '../components/forms.js';
import { updateProgress } from '../core/progress.js';
import { renderATS } from '../ats/renderATS.js';
import { renderCV } from '../renderers/pipeline.js';
import { saveToLS } from '../storage/persistence.js';
import { $ } from '../utils/dom.js';`, 626, 636);

// Fix drag/undo body to use dragState/undoState
['src/core/dragDrop.js', 'src/core/undo.js'].forEach((f) => {
  let t = fs.readFileSync(path.join(root, f), 'utf8');
  t = t
    .replace(/\bdragSrc\b/g, 'dragState.src')
    .replace(/\bdragArr\b/g, 'dragState.arr')
    .replace(/\bdragSkillIdx\b/g, 'dragState.skillIdx')
    .replace(/\bundoStack\b/g, 'undoState.stack')
    .replace(/\bundoTimer\b/g, 'undoState.timer')
    .replace(/\brCV\(\)/g, 'renderCV()')
    .replace(/\brForms\(\)/g, 'rForms()');
  fs.writeFileSync(path.join(root, f), t);
});

// Fix all modules rCV -> renderCV for imports
const fixRcv = (dir) => {
  fs.readdirSync(path.join(root, dir), { withFileTypes: true }).forEach((e) => {
    const fp = path.join(root, dir, e.name);
    if (e.isDirectory()) fixRcv(path.relative(root, fp));
    else if (e.name.endsWith('.js')) {
      let t = fs.readFileSync(fp, 'utf8');
      if (t.includes('rCV()') && !t.includes('export function rCV')) {
        t = t.replace(/\brCV\(\)/g, 'renderCV()');
        fs.writeFileSync(fp, t);
      }
    }
  });
};
fixRcv('src');

// persistence saveTimer
let p = fs.readFileSync(path.join(root, 'src/storage/persistence.js'), 'utf8');
p = p.replace(/\bsaveTimer\b/g, 'saveTimer').replace(
  "import { S, setState, saveTimer }",
  "import { S, setState } from '../state/store.js';\nimport { saveTimer }"
);
fs.writeFileSync(path.join(root, 'src/storage/persistence.js'), p);

console.log('Extracted all modules');
