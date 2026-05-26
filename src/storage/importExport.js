import { S, setState } from '../state/store.js';
import { migrateState } from '../state/model.js';
import { saveToLS } from './persistence.js';
import { applyStateToUI } from '../core/stateUI.js';
import { syncFromForm } from '../components/forms.js';

export function exportJSON() {
  syncFromForm();
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (S.name || 'cv').replace(/\s+/g, '-').toLowerCase() + '-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importJSON() {
  document.getElementById('import-input').click();
}

export function handleImport(inp) {
  const f = inp.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (e) => {
    try {
      setState(migrateState(JSON.parse(e.target.result)));
      applyStateToUI();
      saveToLS(true);
    } catch (ex) {
      alert('Invalid JSON file. Please use a CV Studio export.');
    }
  };
  r.readAsText(f);
  inp.value = '';
}
