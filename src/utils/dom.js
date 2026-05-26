/** Cached DOM references used across the app */
const cache = new Map();

export function $(id) {
  if (!cache.has(id)) cache.set(id, document.getElementById(id));
  return cache.get(id);
}

export function clearDomCache() {
  cache.clear();
}
