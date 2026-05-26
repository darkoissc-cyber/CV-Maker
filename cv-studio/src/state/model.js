import { SCHEMA_VERSION } from './constants.js';

export function createDefaultState() {
  return {
    v: SCHEMA_VERSION,
    name: '', title: '', email: '', phone: '', loc: '', link: '', sum: '',
    photo: null,
    exp: [], edu: [], projects: [], skills: [], langs: [], certs: [], refs: [],
    showRefs: false,
    tpl: 'vertex', ai: 0,
  };
}

export function migrateState(raw) {
  const d = createDefaultState();
  if (!raw || typeof raw !== 'object') return d;
  Object.assign(d, raw);
  d.v = SCHEMA_VERSION;
  d.exp = Array.isArray(d.exp) ? d.exp : [];
  d.edu = Array.isArray(d.edu) ? d.edu : [];
  d.projects = Array.isArray(d.projects) ? d.projects : [];
  d.langs = Array.isArray(d.langs) ? d.langs : [];
  d.refs = Array.isArray(d.refs) ? d.refs : [];
  d.showRefs = !!d.showRefs;
  if (d.skills.length && typeof d.skills[0] === 'string') {
    d.skills = d.skills.map((n, i) => ({ id: i, name: n }));
  } else {
    d.skills = d.skills.map((s, i) => ({ id: s.id ?? i, name: s.name || '' }));
  }
  if (d.certs.length && typeof d.certs[0] === 'string') {
    d.certs = d.certs.map((c, i) => ({ id: i, name: c, org: '', date: '' }));
  } else {
    d.certs = d.certs.map((c, i) => ({
      id: c.id ?? i, name: c.name || '', org: c.org || '', date: c.date || '',
    }));
  }
  d.projects = d.projects.map((p, i) => ({
    id: p.id ?? i,
    name: p.name || '',
    tech: p.tech || '',
    desc: p.desc || '',
    github: p.github || p.link || '',
    demo: p.demo || '',
  }));
  d.refs = d.refs.map((r, i) => ({
    id: r.id ?? i, name: r.name || '', role: r.role || '', contact: r.contact || '',
  }));
  return d;
}

export function syncCounters(state, ctr) {
  ctr.ec = Math.max(0, ...state.exp.map((e) => e.id + 1), 0);
  ctr.dc = Math.max(0, ...state.edu.map((e) => e.id + 1), 0);
  ctr.pc = Math.max(0, ...state.projects.map((e) => e.id + 1), 0);
  ctr.rc = Math.max(0, ...state.refs.map((e) => e.id + 1), 0);
  ctr.cc = Math.max(0, ...state.certs.map((e) => e.id + 1), 0);
  ctr.sc = Math.max(0, ...state.skills.map((e) => e.id + 1), 0);
}
