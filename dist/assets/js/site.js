/* M1: navigation only. No delivery, storage, tracking or external calls. */
(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav');
  const header = document.querySelector('.site-header');
  if (!menu || !nav || !header) return;
  header.classList.add('js');
  const compact = matchMedia('(max-width: 960px)');
  const setOpen = (open, returnFocus = false) => {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    if (returnFocus) menu.focus();
  };
  menu.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    setOpen(false);
    const href = link.getAttribute('href');
    const destination = href?.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    if (destination) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  compact.addEventListener('change', () => {
    const focusWasInMenu = nav.contains(document.activeElement);
    const focusWasOnToggle = document.activeElement === menu;
    setOpen(false, compact.matches && focusWasInMenu);
    if (!compact.matches && focusWasOnToggle) nav.querySelector('a')?.focus();
  });
})();
