'use strict';
// Navigation for standalone service, project and privacy pages.
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  const close = (focus = false) => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); if (focus) toggle.focus(); };
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));
  document.addEventListener('click', event => { if (!nav.contains(event.target) && !toggle.contains(event.target)) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close(true); });
  window.addEventListener('resize', () => { if (innerWidth > 760) close(); });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
