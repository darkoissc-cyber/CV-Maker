import { saveToLS } from '../storage/persistence.js';

export const undoState = { stack: null, timer: null };

export function showUndo(msg, restoreFn) {
  undoState.stack = { fn: restoreFn };
  document.getElementById('undo-msg').textContent = msg;
  const t = document.getElementById('undo-toast');
  t.classList.add('show');
  clearTimeout(undoState.timer);
  undoState.timer = setTimeout(() => {
    t.classList.remove('show');
    undoState.stack = null;
  }, 5000);
}

export async function undoDelete() {
  if (!undoState.stack) return;
  clearTimeout(undoState.timer);
  undoState.stack.fn();
  document.getElementById('undo-toast').classList.remove('show');
  undoState.stack = null;
  const { rForms } = await import('../components/forms.js');
  const { renderCV } = await import('../renderers/pipeline.js');
  rForms();
  renderCV();
  saveToLS();
}
