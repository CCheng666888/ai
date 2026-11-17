(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('page-data').textContent);
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let savedMotion = false;
  try { savedMotion = sessionStorage.getItem('chark-motion-paused') === 'true'; } catch (_) { /* Storage may be unavailable in private/file contexts. */ }
  let paused = savedMotion || reduce.matches;
  const motionButton = document.querySelector('.motion-button');
  function setMotion(value) {
    paused = value || reduce.matches;
    doc.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.disabled = reduce.matches;
    const label = reduce.matches ? data.reduced : (paused ? data.resume : data.pause);
    motionButton.setAttribute('aria-label', label);
    motionButton.querySelector('.motion-label').textContent = label;
    motionButton.querySelector('.motion-icon').textContent = value ? '▷' : 'Ⅱ';
    try { sessionStorage.setItem('chark-motion-paused', String(value)); } catch (_) {}
  }
  setMotion(paused);
  motionButton.addEventListener('click', () => setMotion(!paused));
  reduce.addEventListener('change', event => setMotion(event.matches));
  if ('IntersectionObserver' in window) {
    doc.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  const dropdown = document.querySelector('.dropdown-trigger');
  const menu = document.getElementById('product-menu');
  const toggleDropdown = open => { dropdown.setAttribute('aria-expanded', String(open)); menu.hidden = !open; };
  dropdown.addEventListener('click', () => toggleDropdown(menu.hidden));
  document.addEventListener('click', event => { if (!event.target.closest('.nav-dropdown')) toggleDropdown(false); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDropdown(false)));
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  function toggleMobile(open) { mobileToggle.setAttribute('aria-expanded', String(open)); mobileMenu.hidden = !open; }
  mobileToggle.addEventListener('click', () => toggleMobile(mobileMenu.hidden));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMobile(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!menu.hidden) { toggleDropdown(false); dropdown.focus(); }
      if (!mobileMenu.hidden) { toggleMobile(false); mobileToggle.focus(); }
    }
  });
  const content = document.getElementById('demo-content');
  const bubble = document.getElementById('demo-bubble');
  let activeDemo = 'read';
  let bubbleIndex = 0;
  function comment() { bubbleIndex = (bubbleIndex + 1) % data[activeDemo].bubbles.length; bubble.textContent = data[activeDemo].bubbles[bubbleIndex]; }
  function renderDemo(key) {
    activeDemo = key; bubbleIndex = 0;
    const sample = data[key];
    document.querySelectorAll('[data-demo]').forEach(button => {
      const selected = button.dataset.demo === key;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    });
    document.getElementById('demo-panel').setAttribute('aria-labelledby', 'demo-tab-' + key);
    document.querySelectorAll('[data-side]').forEach(el => el.classList.toggle('active', el.dataset.side === key));
    let inner = `<h3>${escape(sample.title)}</h3><p class="app-description">${escape(sample.description)}</p>`;
    if (key === 'read') {
      inner += `<div class="mock-file"><div class="mock-file-heading"><strong><span class="file-icon">PDF</span>${escape(sample.file)}</strong><span>${escape(sample.label)}</span></div><h4>${escape(sample.heading)}</h4><p>${sample.paragraph}</p></div><div class="read-footer"><span><i></i>${escape(sample.status)}</span><button class="mock-action">${escape(sample.action)} ↗</button></div>`;
    } else if (key === 'library') {
      inner += '<div class="mock-file">' + sample.files.map(file => `<div class="library-row"><span><span class="file-icon">${escape(file[0])}</span>${escape(file[1])}<small>${escape(file[2])}</small></span><span class="tag">${escape(sample.tag)}</span></div>`).join('') + `</div><div class="read-footer"><span><i></i>${escape(sample.status)}</span><span>K1 · K2 · K3</span></div>`;
    } else {
      inner += sample.items.map(item => `<div class="memory-card"><span>${escape(item[0])}<small>${escape(item[1])}</small></span><span class="mock-switch" aria-hidden="true"></span></div>`).join('') + `<div class="read-footer"><span><i></i>${escape(sample.status)}</span><span>M1 · M2 · M3</span></div>`;
    }
    content.innerHTML = inner;
    content.classList.remove('content-enter'); void content.offsetWidth; content.classList.add('content-enter');
    bubble.textContent = sample.bubbles[0];
    const action = content.querySelector('.mock-action');
    if (action) action.addEventListener('click', comment);
  }
  function tabs(selector, key, render) {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => render(button.dataset[key]));
      button.addEventListener('keydown', event => {
        let next;
        if (['ArrowRight','ArrowDown'].includes(event.key)) next = (index + 1) % buttons.length;
        if (['ArrowLeft','ArrowUp'].includes(event.key)) next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); buttons[next].focus(); render(buttons[next].dataset[key]); }
      });
    });
  }
  tabs('[data-demo]', 'demo', renderDemo);
  renderDemo('read');
  document.querySelector('.demo-pet').addEventListener('click', comment);
  const usePanel = document.getElementById('use-panel');
  const assetBase = document.querySelector('.demo-pet img').getAttribute('src');
  function renderUse(key) {
    const scene = data.scenarios[key];
    document.querySelectorAll('[data-use]').forEach(button => {
      const selected = button.dataset.use === key;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    });
    usePanel.setAttribute('aria-labelledby', 'use-tab-' + key);
    usePanel.innerHTML = `<div class="scenario-topline"><span>${escape(scene.category)}</span><span>CHARK / 0${Object.keys(data.scenarios).indexOf(key) + 1}</span></div><div class="scenario-paper"><span class="paper-tag">${escape(scene.format)}</span><h3>${escape(scene.title)}</h3><p>${scene.body}</p></div><div class="scenario-note"><img src="${assetBase}" alt="" width="65" height="49"><p>${escape(scene.note)}</p></div><p class="scenario-example">${escape(scene.example)}</p>`;
  }
  tabs('[data-use]', 'use', renderUse);
  renderUse('study');
})();
