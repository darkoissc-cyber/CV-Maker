import { ACCENTS } from '../state/constants.js';
import { setAccent } from './accentActions.js';

export function initSwatches() {
  const w = document.getElementById('swatches');
  ACCENTS.forEach((a, i) => {
    const d = document.createElement('div');
    d.className = 'swatch' + (i === 0 ? ' active' : '');
    d.style.background = a.hex;
    d.title = a.name;
    d.onclick = () => setAccent(i);
    w.appendChild(d);
  });
}
