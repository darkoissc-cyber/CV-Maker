import { createDefaultState } from './model.js';
import { syncCounters } from './model.js';

export let S = createDefaultState();
export const counters = { ec: 0, dc: 0, pc: 0, rc: 0, cc: 0, sc: 0 };

export let saveTimer = null;

export function setState(next) {
  S = next;
  syncCounters(S, counters);
  if (typeof window !== 'undefined') window.S = S;
}

export function initCounters() {
  syncCounters(S, counters);
}
