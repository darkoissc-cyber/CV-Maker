import { loadFromLS } from '../storage/persistence.js';
import { initSwatches } from '../theme/accents.js';
import { rForms } from '../components/forms.js';
import { rSkills, rLangs } from '../components/skills.js';
import { renderCV } from '../renderers/pipeline.js';
import { renderATS } from '../ats/renderATS.js';
import { applyStateToUI } from './stateUI.js';
import { initLangLevel } from '../components/langLevel.js';
import { applyAppAccentByIndex } from '../theme/applyAccent.js';
import { S } from '../state/store.js';

export function initApp() {
  initSwatches();
  initLangLevel();
  applyAppAccentByIndex(S.ai || 0);
  const loaded = loadFromLS();
  if (loaded) {
    applyStateToUI();
  } else {
    rForms();
    rSkills();
    rLangs();
    renderCV();
    renderATS();
  }
  const badge = document.getElementById('save-badge');
  const txt = document.getElementById('save-txt');
  if (loaded) {
    badge.className = 'save-badge saved';
    txt.textContent = 'Restored — auto-save on';
  } else {
    badge.className = 'save-badge';
    txt.textContent = 'Auto-save on';
  }
}

export { applyStateToUI };
