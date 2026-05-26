/**
 * CV Studio Pro — application entry (ES modules).
 * Exposes a stable window API for inline HTML handlers in form templates.
 */
import * as store from './state/store.js';
import { bindPersistenceLifecycle, loadFromLS, saveToLS } from './storage/persistence.js';
import { exportJSON, importJSON, handleImport } from './storage/importExport.js';
import { exportPDF } from './export/pdf.js';
import { makeDraggable } from './core/dragDrop.js';
import { showUndo, undoDelete } from './core/undo.js';
import { setTpl } from './theme/template.js';
import { setAccent } from './theme/accentActions.js';
import { toggleTheme, loadThemePreference } from './theme/theme.js';
import { handlePhoto, removePhoto } from './components/photo.js';
import {
  addExp, rmExp, addEdu, rmEdu, addProj, rmProj,
  toggleRefs, addRef, rmRef, addCert, rmCert,
} from './components/sections.js';
import { addSkill, rmSkill, addLang, rmLang } from './components/skills.js';
import { update } from './core/update.js';
import { renderCV, rCV } from './renderers/pipeline.js';
import { initApp } from './core/init.js';

// Live state reference for inline handlers (S.exp.find, etc.)
window.S = store.S;

const api = {
  S: store.S,
  update,
  saveToLS,
  rCV,
  renderCV,
  exportJSON,
  importJSON,
  handleImport,
  exportPDF,
  makeDraggable,
  showUndo,
  undoDelete,
  setTpl,
  setAccent,
  toggleTheme,
  handlePhoto,
  removePhoto,
  addExp, rmExp, addEdu, rmEdu, addProj, rmProj,
  toggleRefs, addRef, rmRef,
  addSkill, rmSkill, addLang, rmLang,
  addCert, rmCert,
};

Object.assign(window, api);

bindPersistenceLifecycle();
loadThemePreference();
initApp();
