/* Shared navigation for M2 pages. No delivery, storage, tracking or external calls. */
(() => {
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#nav');
  if(!toggle||!nav)return;
  const close=(focus=false)=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus()};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true')close(true)});
  matchMedia('(min-width:961px)').addEventListener('change',event=>{if(event.matches)close()});
})();
