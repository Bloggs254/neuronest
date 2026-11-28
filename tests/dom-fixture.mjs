import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

// Narrow DOM adapter for exercising event-driven app behavior in Node. It is
// deliberately not a layout/browser substitute; viewport and visual QA remain
// separate. The preserved baseline HTML exercises the retired legacy app.js
// modules. M1's new homepage runtime is verified by its own real-browser suite.
export function createApp({ reducedMotion = false, clipboardWrite = async () => {}, motion, loadMotion = false, gsap } = {}) {
  const root = resolve(import.meta.dirname, '..');
  const html = readFileSync(resolve(root, 'tests/fixtures/legacy-home.html'), 'utf8');
  const source = readFileSync(resolve(root, 'dist/app.js'), 'utf8');
  const document = { activeElement: null };

  class Element {
    constructor(tag = 'div', attributes = {}) {
      this.tagName = tag.toUpperCase();
      this.attributes = new Map(Object.entries(attributes));
      this.dataset = Object.fromEntries(Object.entries(attributes).filter(([k]) => k.startsWith('data-')).map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]));
      this.children = [];
      this.listeners = new Map();
      this.hidden = 'hidden' in attributes;
      this.open = false;
      this.inert = false;
      this.value = '';
      this.checked = false;
      this.disabled = false;
      this._textContent = '';
      this.scrollHeight = 500;
      this.scrollTop = 0;
      this.style = { removeProperty(name) { delete this[name]; }, setProperty(name, value) { this[name] = value; } };
      const classes = new Set((attributes.class || '').split(/\s+/).filter(Boolean));
      this.classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        contains: name => classes.has(name),
        toggle(name, force) { const on = force ?? !classes.has(name); on ? classes.add(name) : classes.delete(name); return on; }
      };
    }
    get textContent() { return this._textContent + this.children.map(child => child.textContent).join(''); }
    set textContent(value) { this._textContent = String(value); this.children = []; }
    get href() { return this.attributes.get('href') || ''; }
    set href(value) { this.attributes.set('href', value); }
    addEventListener(type, callback) { const listeners = this.listeners.get(type) || []; listeners.push(callback); this.listeners.set(type, listeners); }
    removeEventListener(type, callback) { this.listeners.set(type, (this.listeners.get(type) || []).filter(listener => listener !== callback)); }
    emit(type, fields = {}) {
      const event = { type, target: this, currentTarget: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...fields };
      return Promise.all((this.listeners.get(type) || []).map(callback => callback(event)));
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    append(...children) { children.forEach(child => { child.parentElement = this; this.children.push(child); }); }
    replaceChildren(...children) { this.children = []; this._textContent = ''; this.append(...children); }
    contains(element) { return this === element || this.children.some(child => child.contains(element)); }
    focus() { document.activeElement = this; }
    scrollIntoView(options) { this.lastScroll = options; }
    getBoundingClientRect() { return { top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }; }
    showModal() { this.open = true; }
    close() { this.open = false; }
    querySelectorAll(selector) { return this.children.filter(child => selector === 'a' ? child.tagName === 'A' : true); }
  }

  const attributesOf = text => Object.fromEntries([...text.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(match => [match[1], match[2] ?? '']));
  const elements = new Map();
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="[^"]+"[^>]*)>/gi)) {
    const attributes = attributesOf(match[2]);
    elements.set('#' + attributes.id, new Element(match[1], attributes));
  }
  elements.set('.menu-toggle', new Element('button', { 'aria-expanded': 'false', class: 'menu-toggle' }));
  const serviceButtons = [...html.matchAll(/<button\b([^>]*\bdata-service="[^"]+"[^>]*)>/g)].map(match => new Element('button', attributesOf(match[1])));
  const nav = elements.get('#nav');
  nav.append(new Element('a'), new Element('a'));
  const form = elements.get('#project-form');
  form.elements = Object.fromEntries(['name', 'business', 'email', 'service', 'message', 'budget', 'timeline'].map(name => [name, new Element('input', { name })]));
  form.valid = true;
  form.reportValidity = () => form.valid;
  form.elements.budget.value = 'Not sure yet';
  form.elements.timeline.value = 'Let’s discuss';

  const documentEvents = new Element('document');
  Object.assign(document, {
    documentElement: new Element('html'), body: new Element('body'),
    querySelector: selector => elements.get(selector) ?? null,
    querySelectorAll: selector => selector === '[data-service]' ? serviceButtons : [],
    createElement: tag => new Element(tag),
    addEventListener: documentEvents.addEventListener.bind(documentEvents),
    emit: documentEvents.emit.bind(documentEvents)
  });
  const windowEvents = new Element('window');
  const mediaEvents = new Element('media');
  const media = {
    matches: reducedMotion,
    addEventListener: mediaEvents.addEventListener.bind(mediaEvents),
    removeEventListener: mediaEvents.removeEventListener.bind(mediaEvents),
    async change(matches) { this.matches = matches; await mediaEvents.emit('change', { matches }); }
  };
  const window = {
    innerWidth: 390,
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    removeEventListener: windowEvents.removeEventListener.bind(windowEvents),
    emit: windowEvents.emit.bind(windowEvents),
    ...(gsap ? { gsap } : {}),
    ...(motion ? { NeuroNestMotion: motion } : {})
  };
  class FakeFormData { constructor(target) { this.target = target; } get(name) { return this.target.elements[name]?.value ?? null; } }
  const context = vm.createContext({ document, window, navigator: { clipboard: { writeText: clipboardWrite } }, FormData: FakeFormData, matchMedia: () => media, console, setTimeout, clearTimeout, requestAnimationFrame: callback => { callback(); return 1; }, cancelAnimationFrame() {} });
  if (loadMotion) vm.runInContext(readFileSync(resolve(root, 'dist/motion.js'), 'utf8'), context, { filename: 'dist/motion.js' });
  vm.runInContext(source, context, { filename: 'dist/app.js' });
  return {
    document, window, form, serviceButtons, media,
    get: selector => elements.get(selector),
    click: selector => elements.get(selector).emit('click'),
    submit: () => form.emit('submit'),
    answer: async text => { elements.get('#chat-input').value = text; await elements.get('#chat-form').emit('submit'); },
    choose: label => elements.get('#chat-options').children.find(child => child.textContent.includes(label)).emit('click'),
    chooseService: index => elements.get('#chat-options').children[index].emit('click')
  };
}
