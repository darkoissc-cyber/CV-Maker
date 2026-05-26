import { S } from '../state/store.js';
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';

export function setTpl(t) {
  S.tpl = t;
  document.querySelectorAll('.tpl-card').forEach((c) => c.classList.remove('active'));
  document.getElementById('tpl-' + t)?.classList.add('active');
  renderCV();
  saveToLS();
}
