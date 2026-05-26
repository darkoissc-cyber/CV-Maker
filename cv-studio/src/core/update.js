import { syncFromForm } from '../components/forms.js';
import { pct } from './progress.js';
import { renderATS } from '../ats/renderATS.js';
import { renderCV } from '../renderers/pipeline.js';
import { saveToLS } from '../storage/persistence.js';

export function update() {
  syncFromForm();
  const p = pct();
  document.getElementById('prog-fill').style.width = p + '%';
  document.getElementById('prog-pct').textContent = p + '%';
  renderATS();
  renderCV();
  saveToLS();
}
