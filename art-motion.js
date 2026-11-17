'use strict';

// A lightweight depth effect on the existing image, with no continuous render loop.
// This layer owns only the hero artwork; the guide and other app state stay separate.
(() => {
  const gsap = window.gsap;
  const image = document.querySelector('.hero-art img');
  const hero = document.querySelector('.hero-inner');
  if (!image || !hero || !gsap?.matchMedia || !gsap?.quickTo) return;

  let entrancePlayed = false;
  const media = gsap.matchMedia();
  media.add('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const originalStyle = image.getAttribute('style');
    const neutral = { x: 0, y: 0, rotationX: 0, rotationY: 0, rotation: 0 };
    const easing = { duration: 0.65, ease: 'power3.out' };
    const moves = {
      x: gsap.quickTo(image, 'x', easing),
      y: gsap.quickTo(image, 'y', easing),
      rotationX: gsap.quickTo(image, 'rotationX', easing),
      rotationY: gsap.quickTo(image, 'rotationY', easing)
    };
    let entrance;
    let frame = 0;
    let bounds;
    let pointer;
    let ready = false;
    let visible = true;
    let disposed = false;

    function cancelFrame() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
    }

    function reset(immediate = false) {
      cancelFrame();
      bounds = null;
      if (immediate) {
        Object.values(moves).forEach(move => move.tween.pause());
        gsap.set(image, neutral);
      } else Object.values(moves).forEach(move => move(0));
    }

    function settle() {
      entrance?.progress(1);
      reset(true);
    }

    function paint() {
      frame = 0;
      if (!pointer || disposed || !ready || !visible || document.hidden) return;
      // Read once after entry/scroll; subsequent pointer events update transforms only.
      bounds ||= hero.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const clamp = value => Math.max(-1, Math.min(1, value));
      const x = clamp((pointer.x - bounds.left) / bounds.width * 2 - 1);
      const y = clamp((pointer.y - bounds.top) / bounds.height * 2 - 1);
      moves.x(x * 4);
      moves.y(y * 3);
      moves.rotationX(-y * 2);
      moves.rotationY(x * 3);
    }

    function follow(event) {
      if ((event.pointerType && event.pointerType !== 'mouse') || !ready || !visible || document.hidden) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function start() {
      if (disposed || !image.naturalWidth) return;
      gsap.set(image, { ...neutral, transformPerspective: 1100, transformOrigin: '50% 50%' });
      image.style.willChange = 'transform';
      if (!entrancePlayed && !document.hidden && visible) {
        entrancePlayed = true;
        entrance = gsap.fromTo(image, { y: 14, rotation: -1, opacity: 0.88 }, {
          y: 0, rotation: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
          onComplete: () => { ready = !disposed; }
        });
      } else ready = true;
    }

    const leave = () => { if (ready) reset(); };
    const scroll = () => { if (ready) reset(true); };
    const resize = () => { bounds = null; if (ready) reset(true); };
    const visibility = () => { if (document.hidden) settle(); };
    hero.addEventListener('pointermove', follow, { passive: true });
    hero.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('blur', settle);
    document.addEventListener('visibilitychange', visibility);
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (!visible) settle();
      }, { threshold: 0.05 });
      observer.observe(hero);
    }
    if (image.complete) start();
    else image.addEventListener('load', start, { once: true });

    return () => {
      disposed = true;
      cancelFrame();
      entrance?.kill();
      Object.values(moves).forEach(move => move.tween.kill());
      observer?.disconnect();
      image.removeEventListener('load', start);
      hero.removeEventListener('pointermove', follow);
      hero.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', settle);
      document.removeEventListener('visibilitychange', visibility);
      if (originalStyle === null) image.removeAttribute('style');
      else image.setAttribute('style', originalStyle);
    };
  });
})();
