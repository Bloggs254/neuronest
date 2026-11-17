'use strict';

// Optional presentation layer. App state, links, forms and content work without it.
(() => {
  const gsap = window.gsap;
  if (!gsap || typeof gsap.matchMedia !== 'function') return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const settings = Object.freeze({ enter: 0.48, panel: 0.17, distance: 10, ease: 'power2.out' });
  const active = new Set();
  const panels = new Map();
  let enabled = !reducedMotion.matches;
  let heroPlayed = false;

  function completeEntries() {
    for (const timeline of [...active]) timeline.progress(1);
    active.clear();
  }

  function animate(context, build) {
    if (!enabled || document.hidden) return;
    context.add(() => {
      let timeline;
      timeline = gsap.timeline({
        defaults: { duration: settings.enter, ease: settings.ease },
        onComplete: () => active.delete(timeline)
      });
      active.add(timeline);
      try { build(timeline); }
      catch (error) {
        // Reverting restores the readable CSS state if enhancement setup fails.
        timeline.revert();
        active.delete(timeline);
        console.warn('NeuroNest motion skipped:', error.message);
      }
    });
  }

  function finishPanel(element, state) {
    state.timeline?.kill();
    panels.delete(element);
    element.hidden = !state.open;
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  }

  function setPanel(element, open) {
    if (!element) return;
    let state = panels.get(element);
    if (!enabled || reducedMotion.matches || document.hidden) {
      finishPanel(element, { ...state, open });
      return;
    }
    if (!state) {
      // A redundant close should not flash a panel that has never been opened.
      if (!open && element.hidden) return;
      state = { open, timeline: null };
      panels.set(element, state);
      try {
        state.timeline = gsap.timeline({
          paused: true,
          onReverseComplete: () => {
            if (!state.open) element.hidden = true;
          }
        }).fromTo(element, { y: 7, opacity: 0.65 }, {
          y: 0, opacity: 1, duration: settings.panel,
          ease: settings.ease, immediateRender: false
        });
      } catch {
        finishPanel(element, state);
        return;
      }
    }
    state.open = open;
    if (open) {
      element.hidden = false;
      state.timeline.play();
    } else {
      // No frame may have elapsed yet on an immediate open -> close toggle.
      if (state.timeline.time() === 0) element.hidden = true;
      state.timeline.reverse();
    }
  }

  window.NeuroNestMotion = Object.freeze({ setPanel });

  const media = gsap.matchMedia();
  try {
    media.add({
      desktop: '(min-width: 761px)',
      compact: '(max-width: 760px)',
      reduce: '(prefers-reduced-motion: reduce)'
    }, context => {
      enabled = !context.conditions.reduce;
      if (!enabled) {
        completeEntries();
        for (const [element, state] of panels) finishPanel(element, state);
        return;
      }
      const distance = context.conditions.compact ? 6 : settings.distance;
      const hero = document.querySelector('.hero-copy');
      if (hero && !heroPlayed) {
        heroPlayed = true;
        animate(context, timeline => {
          timeline.addLabel('intro', 0)
            .fromTo(hero.querySelector('h1'), { y: distance, opacity: 0.75 }, {
              y: 0, opacity: 1, clearProps: 'transform,opacity'
            }, 'intro')
            .fromTo(hero.querySelector('.hero-description'), { y: distance, opacity: 0.8 }, {
              y: 0, opacity: 1, clearProps: 'transform,opacity'
            }, 'intro+=0.08')
            .fromTo(hero.querySelector('.hero-note'), { y: 4, opacity: 0.85 }, {
              y: 0, opacity: 1, duration: 0.35, clearProps: 'transform,opacity'
            }, 'intro+=0.16');
          // Actions stay fully visible and usable from the first frame.
        });
      }

      // One authored hero entrance. The rest of the page stays still and readable.
      return () => {
        // matchMedia reverts collected animations; no replay when conditions change.
        active.clear();
      };
    });
  } catch (error) {
    media.revert();
    enabled = false;
    console.warn('NeuroNest motion unavailable:', error.message);
  }

  // Enter a stable final state when a tab is hidden or preferences change.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    completeEntries();
    for (const [element, state] of panels) finishPanel(element, state);
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    completeEntries();
    for (const [element, state] of panels) finishPanel(element, state);
  });
})();
