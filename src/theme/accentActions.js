import { S } from '../state/store.js';
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';
import { applyAppAccentByIndex } from './applyAccent.js';

export function setAccent(i) {
  S.ai = i;
  document.querySelectorAll('.swatch').forEach((s, j) => s.classList.toggle('active', j === i));
  applyAppAccentByIndex(i);
  renderCV();
  saveToLS();
}
