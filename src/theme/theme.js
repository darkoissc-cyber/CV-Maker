import { LS_THEME } from '../state/constants.js';

export function toggleTheme() {
  const h = document.documentElement;
  const dark = h.dataset.theme === 'dark';
  h.dataset.theme = dark ? 'light' : 'dark';
  document.getElementById('themeIco').className = dark ? 'ti ti-moon' : 'ti ti-sun';
  try { localStorage.setItem(LS_THEME, h.dataset.theme); } catch (e) { /* ignore */ }
}

export function loadThemePreference() {
  const theme = localStorage.getItem(LS_THEME);
  if (theme) {
    document.documentElement.dataset.theme = theme;
    document.getElementById('themeIco').className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
  }
}
