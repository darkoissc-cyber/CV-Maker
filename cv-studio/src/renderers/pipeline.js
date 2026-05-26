import { S } from '../state/store.js';
import { ACCENTS } from '../state/constants.js';
import { syncFromForm } from '../components/forms.js';
import { pct } from '../core/progress.js';
import { renderATS } from '../ats/renderATS.js';
import { TEMPLATE_RENDERERS } from '../templates/index.js';

export function renderCV() {
  syncFromForm();
  const p = pct();
  document.getElementById('prog-fill').style.width = p + '%';
  document.getElementById('prog-pct').textContent = p + '%';
  renderATS();

  const doc = document.getElementById('cv-doc');
  const a = ACCENTS[S.ai] || ACCENTS[0];
  doc.style.setProperty('--cv-accent', a.hex);
  doc.style.setProperty('--cv-accent-dark', a.dark);
  doc.style.setProperty('--cv-accent-light', a.light);

  const s = S;
  const hasAny = s.name || s.title || s.email || s.phone || s.sum || s.exp.length || s.edu.length
    || s.skills.length || s.projects.length || s.langs.length || s.certs.length;
  if (!hasAny) {
    doc.className = 'cv-doc';
    doc.innerHTML = '<div class="cv-empty"><div class="ei">◈</div><h3>Your CV will appear here</h3><p>Start filling in the form on the left</p></div>';
    return;
  }
  const render = TEMPLATE_RENDERERS[s.tpl] || TEMPLATE_RENDERERS.vertex;
  render(doc, s);
}

/** @deprecated Use renderCV — kept for inline form handlers */
export const rCV = renderCV;
