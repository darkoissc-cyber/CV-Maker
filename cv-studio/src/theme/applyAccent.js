import { ACCENTS } from '../state/constants.js';

export function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 245, g: 158, b: 11 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Sync UI chrome (scrollbars, focus rings) to the selected accent swatch. */
export function applyAppAccent(hex) {
  const { r, g, b } = hexToRgb(hex);
  const root = document.documentElement;
  root.style.setProperty('--app-accent', hex);
  root.style.setProperty('--app-accent-rgb', `${r}, ${g}, ${b}`);
}

export function applyAppAccentByIndex(i) {
  const a = ACCENTS[i] ?? ACCENTS[0];
  applyAppAccent(a.hex);
}
