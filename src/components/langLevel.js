/** Custom language-level picker (replaces native select dropdown UI). */
const LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];

export function initLangLevel() {
  const native = document.getElementById('lang-lvl');
  const trigger = document.getElementById('lang-lvl-trigger');
  const menu = document.getElementById('lang-lvl-menu');
  const display = document.getElementById('lang-lvl-display');
  const wrap = document.getElementById('lang-lvl-ui');
  if (!native || !trigger || !menu || !display || !wrap) return;

  function setValue(val) {
    native.value = val;
    display.textContent = val;
    menu.querySelectorAll('.lang-lvl-option').forEach((el) => {
      const on = el.dataset.value === val;
      el.classList.toggle('is-selected', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function close() {
    menu.hidden = true;
    wrap.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function open() {
    menu.hidden = false;
    wrap.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.hidden) open();
    else close();
  });

  menu.querySelectorAll('.lang-lvl-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      setValue(opt.dataset.value);
      close();
    });
  });

  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (menu.hidden) open();
      else close();
    }
  });

  setValue(native.value || LEVELS[0]);
}
