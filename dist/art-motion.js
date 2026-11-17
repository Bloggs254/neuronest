'use strict';

// Arrival is available on phones; mouse tracking is a separate desktop enhancement.
(() => {
  const gsap = window.gsap;
  const image = document.querySelector('.hero-art img');
  const artwork = document.querySelector('.hero-art');
  const hero = document.querySelector('.hero-inner');
  if (!image || !artwork || !hero || !gsap?.matchMedia || !gsap?.timeline) return;

  let entrancePlayed = false;
  const media = gsap.matchMedia();
  function restoreStyle(element, original) {
    if (original === null) element.removeAttribute('style');
    else element.setAttribute('style', original);
  }

  // Short phone screens may need a scroll before the artwork comes into view.
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const originalStyle = artwork.getAttribute('style');
    let entrance;
    let disposed = false;
    let visible = !('IntersectionObserver' in window);

    function start() {
      if (disposed || entrancePlayed || !image.naturalWidth || !visible || document.hidden) return;
      entrancePlayed = true;
      const compact = matchMedia('(max-width: 760px)').matches;
      entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(artwork, {
          x: compact ? 0 : 14, y: compact ? 14 : 24,
          rotation: compact ? 1 : 2, scale: compact ? 0.99 : 0.98, opacity: 0.97
        }, {
          x: 0, y: compact ? -2 : -4, rotation: compact ? -0.1 : -0.25,
          scale: 1.001, opacity: 1, duration: compact ? 0.8 : 1.05
        })
        .to(artwork, {
          y: 0, rotation: 0, scale: 1, duration: compact ? 0.4 : 0.5,
          ease: 'sine.inOut', clearProps: 'transform,opacity'
        });
    }

    const settle = () => entrance?.progress(1);
    const visibility = () => { if (document.hidden) settle(); else start(); };
    image.addEventListener('load', start);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', settle);
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.12;
        if (visible) start();
        else settle();
      }, { threshold: 0.12 });
      observer.observe(artwork);
    }
    if (image.complete) start();

    return () => {
      disposed = true;
      entrance?.kill();
      observer?.disconnect();
      image.removeEventListener('load', start);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', settle);
      restoreStyle(artwork, originalStyle);
    };
  });

  media.add('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    if (!gsap.quickTo) return;
    const originalStyle = image.getAttribute('style');
    const neutral = { x: 0, y: 0, rotationX: 0, rotationY: 0, rotation: 0 };
    const easing = { duration: 0.2, ease: 'power2.out' };
    const moves = {
      x: gsap.quickTo(image, 'x', easing), y: gsap.quickTo(image, 'y', easing),
      rotationX: gsap.quickTo(image, 'rotationX', easing),
      rotationY: gsap.quickTo(image, 'rotationY', easing)
    };
    let bounds;
    let ready = false;
    let visible = true;
    let disposed = false;

    function reset(immediate = false) {
      bounds = null;
      if (immediate) {
        Object.values(moves).forEach(move => move.tween.pause());
        gsap.set(image, neutral);
      } else Object.values(moves).forEach(move => move(0));
    }
    function follow(event) {
      if ((event.pointerType && event.pointerType !== 'mouse') || disposed || !ready || !visible || document.hidden) return;
      // quickTo already uses GSAP's ticker; do not add another RAF of input delay.
      bounds ||= hero.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const clamp = value => Math.max(-1, Math.min(1, value));
      const x = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1);
      const y = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1);
      moves.x(x * 4);
      moves.y(y * 3);
      moves.rotationX(-y * 2);
      moves.rotationY(x * 3);
    }
    function start() {
      if (disposed || !image.naturalWidth) return;
      gsap.set(image, { ...neutral, transformPerspective: 1100, transformOrigin: '50% 50%' });
      image.style.willChange = 'transform';
      ready = true;
    }

    const leave = () => { if (ready) reset(); };
    const scroll = () => { if (ready) reset(true); };
    const resize = () => { bounds = null; if (ready) reset(true); };
    const settle = () => reset(true);
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
      Object.values(moves).forEach(move => move.tween.kill());
      observer?.disconnect();
      image.removeEventListener('load', start);
      hero.removeEventListener('pointermove', follow);
      hero.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', settle);
      document.removeEventListener('visibilitychange', visibility);
      restoreStyle(image, originalStyle);
    };
  });
})();
