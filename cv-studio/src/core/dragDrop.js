import { saveToLS } from '../storage/persistence.js';

export const dragState = { src: null, arr: null, skillIdx: null };

export function makeDraggable(card, arr, id) {
  card.draggable = true;
  card.addEventListener('dragstart', (e) => {
    dragState.src = card;
    dragState.arr = arr;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    document.querySelectorAll('.e-card').forEach((c) => c.classList.remove('drag-over'));
  });
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (card !== dragState.src) card.classList.add('drag-over');
  });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', async (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (dragState.src === card || dragState.arr !== arr) return;
    const srcId = parseInt(e.dataTransfer.getData('text/plain'));
    const tgtId = id;
    const si = arr.findIndex((v) => v.id === srcId);
    const ti = arr.findIndex((v) => v.id === tgtId);
    if (si < 0 || ti < 0) return;
    const [item] = arr.splice(si, 1);
    arr.splice(ti, 0, item);
    const { rForms } = await import('../components/forms.js');
    const { renderCV } = await import('../renderers/pipeline.js');
    rForms();
    renderCV();
    saveToLS();
  });
}
