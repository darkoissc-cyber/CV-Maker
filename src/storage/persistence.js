import { LS_KEY } from '../state/constants.js';
import * as store from '../state/store.js';
import { migrateState } from '../state/model.js';

export function saveToLS(immediate) {
  const badge = document.getElementById('save-badge');
  const txt = document.getElementById('save-txt');
  badge.className = 'save-badge saving';
  txt.textContent = 'Saving…';
  clearTimeout(store.saveTimer);
  const doSave = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(store.S));
      badge.className = 'save-badge saved';
      txt.textContent = 'Saved';
      setTimeout(() => { badge.className = 'save-badge'; txt.textContent = 'Auto-saved'; }, 2000);
    } catch (e) {
      badge.className = 'save-badge';
      txt.textContent = 'Save failed';
    }
  };
  if (immediate) doSave();
  else store.saveTimer = setTimeout(doSave, 500);
}

export function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    store.setState(migrateState(JSON.parse(raw)));
    return true;
  } catch (e) {
    return false;
  }
}

export function bindPersistenceLifecycle() {
  window.addEventListener('beforeunload', () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store.S)); } catch (e) { /* ignore */ }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveToLS(true);
  });
}
