/* Gespräch — Aurora
   Plain script (no modules) so the page also works when opened straight from disk. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(pointer: fine)').matches;

  function $(sel, root)  { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ───────── Mobile menu ───────── */
  function initMenu() {
    var btn = $('#menuBtn'), menu = $('#mnav');
    if (!btn || !menu) return;
    function set(open) {
      menu.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { set(!menu.classList.contains('is-open')); });
    menu.addEventListener('click', function () { set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* ───────── Nav micro-interactions: sliding pill, scroll-spy, edge light ───────── */
  function initNav() {
    var nav = $('#nav'), list = $('#navLinks');
    if (!nav || !list) return;
    var links = $$('a', list), current = null, hovering = false;

    function pillTo(a) {
      if (!a) { list.style.setProperty('--pill-o', 0); return; }
      list.style.setProperty('--pill-x', a.offsetLeft + 'px');
      list.style.setProperty('--pill-w', a.offsetWidth + 'px');
      list.style.setProperty('--pill-o', 1);
    }
    function setCurrent(a) {
      current = a;
      links.forEach(function (l) { l.classList.toggle('is-current', l === a); });
      if (!hovering) pillTo(current);
    }

    links.forEach(function (a) {
      a.addEventListener('pointerenter', function () { hovering = true; pillTo(a); });
      a.addEventListener('focus', function () { pillTo(a); });
    });
    list.addEventListener('pointerleave', function () { hovering = false; pillTo(current); });
    list.addEventListener('focusout', function (e) { if (!list.contains(e.relatedTarget)) pillTo(current); });

    // re-measure once web fonts land and on resize (link widths change)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { pillTo(current); });
    window.addEventListener('resize', function () { if (!hovering) pillTo(current); });

    // edge light follows the cursor
    if (finePointer) {
      nav.addEventListener('pointermove', function (e) {
        var r = nav.getBoundingClientRect();
        nav.style.setProperty('--nx', (e.clientX - r.left) + 'px');
        nav.style.setProperty('--ny', (e.clientY - r.top) + 'px');
      });
    }

    // scroll-spy: the link whose section crosses the middle of the screen
    if (!('IntersectionObserver' in window)) return;
    var bySection = new Map();
    links.forEach(function (a) {
      var sec = $(a.getAttribute('href'));
      if (sec) bySection.set(sec, a);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = bySection.get(e.target);
        if (e.isIntersecting) setCurrent(a);
        else if (current === a) setCurrent(null);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    bySection.forEach(function (_, sec) { io.observe(sec); });
  }

  /* ───────── Magnetic buttons: lean a few px toward the cursor ───────── */
  function initMagnetic() {
    if (reduceMotion || !finePointer) return;
    $$('.btn-glow').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px');
        b.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () {
        b.style.removeProperty('--tx');
        b.style.removeProperty('--ty');
      });
    });
  }

  /* ───────── Scroll reveal ───────── */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: .12 });
    els.forEach(function (el, i) {
      if (el.classList.contains('card')) el.style.transitionDelay = ((i % 3) * 80) + 'ms';
      io.observe(el);
    });
  }

  /* ───────── Voice card waveform ───────── */
  function initWaveform() {
    var wave = $('#bigwave');
    if (!wave) return;
    for (var i = 0; i < 34; i++) {
      var bar = document.createElement('i');
      bar.style.height = (20 + Math.round(Math.abs(Math.sin(i * .55)) * 70)) + 'px';
      bar.style.animationDelay = (-(i * 0.07)).toFixed(2) + 's';
      wave.appendChild(bar);
    }
  }

  /* ───────── Card spotlight + role toggles ───────── */
  function initCards() {
    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    $$('.tgl').forEach(function (t) {
      t.addEventListener('click', function () {
        var on = t.classList.toggle('is-on');
        t.setAttribute('aria-pressed', String(on));
      });
    });
  }

  /* ───────── Hero device tilt ───────── */
  function initTilt() {
    var stage = $('#stage'), rig = $('#rig');
    if (!stage || !rig || reduceMotion || !finePointer) return;
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      rig.style.setProperty('--ry', (x * 24 - 6) + 'deg');
      rig.style.setProperty('--rx', (10 - y * 14) + 'deg');
    });
    stage.addEventListener('pointerleave', function () {
      rig.style.removeProperty('--ry');
      rig.style.removeProperty('--rx');
    });
  }

  /* ───────── Hero live chat demo ───────── */
  var CHAT_SCRIPT = [
    { from: 'you', text: '今晚的流星雨你要看吗？✨' },
    { from: 'me',  text: '当然！我们去山上看' },
    { from: 'you', voice: '0:06' },
    { from: 'me',  sticker: '🌠' },
    { from: 'you', text: '那我把大家拉进群 👋' },
    { from: 'sys', text: 'Yuki 创建了群组「观星小队」' }
  ];

  function bubble(cls, html) {
    var d = document.createElement('div');
    d.className = 'm ' + cls;
    d.innerHTML = html;
    return d;
  }

  function renderMessage(msg) {
    if (msg.from === 'sys') return bubble('sys', msg.text);
    if (msg.sticker)        return bubble(msg.from + ' sticker', msg.sticker);
    if (msg.voice)          return bubble(msg.from + ' voice',
      '<svg><use href="#i-voice"/></svg><span class="wv">' + new Array(12).join('<i></i>') + '</span><span class="dur">' + msg.voice + '</span>');
    return bubble(msg.from, msg.text);
  }

  function initChatDemo() {
    var feed = $('#feed'), status = $('#status');
    if (!feed) return;

    if (reduceMotion) {
      CHAT_SCRIPT.forEach(function (m) { feed.appendChild(renderMessage(m)); });
      return;
    }

    function step(i) {
      if (i >= CHAT_SCRIPT.length) {
        setTimeout(function () {
          feed.classList.add('is-leaving');
          setTimeout(function () { feed.innerHTML = ''; feed.classList.remove('is-leaving'); step(0); }, 600);
        }, 2600);
        return;
      }
      var msg = CHAT_SCRIPT[i];
      function show() {
        feed.appendChild(renderMessage(msg));
        setTimeout(function () { step(i + 1); }, 1100);
      }
      if (msg.from === 'you') {
        var typing = bubble('you typing', '<i></i><i></i><i></i>');
        feed.appendChild(typing);
        status.textContent = '正在输入…';
        setTimeout(function () { typing.remove(); status.textContent = '在线'; show(); }, 1000);
      } else {
        show();
      }
    }
    setTimeout(function () { step(0); }, 900);
  }

  /* ───────── Statement: per-character scroll highlight ───────── */
  function initStatement() {
    var h = $('#stmt');
    if (!h) return;
    var spans = [];
    h.getAttribute('data-text').split('|').forEach(function (part, pi, all) {
      part.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.textContent = ch;
        s.setAttribute('aria-hidden', 'true');
        if (pi === 1) s.className = 'hl';
        h.appendChild(s);
        spans.push(s);
      });
      if (pi === 0 && all.length > 1) h.appendChild(document.createElement('br'));
    });

    function update() {
      var r = h.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
      var n = Math.round(p * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle('is-on', i < n); });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ───────── Story: sticky phone follows the active step ───────── */
  function initStory() {
    var steps = $$('.step');
    var panes = $$('#storyDevice .pane');
    if (!steps.length) return;

    // mobile: give each step its own phone with a copy of its screen
    $$('.mobile-shot').forEach(function (slot) {
      var src = $('#storyDevice .pane[data-pane="' + slot.getAttribute('data-pane') + '"]');
      if (!src) return;
      var device = document.createElement('div'); device.className = 'device';
      var scr = document.createElement('div');    scr.className = 'scr';
      scr.innerHTML = '<div class="island"></div>';
      var pane = src.cloneNode(true);
      pane.classList.remove('is-visible');
      scr.appendChild(pane);
      device.appendChild(scr);
      slot.appendChild(device);
    });

    steps[0].classList.add('is-active');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = e.target.getAttribute('data-step');
        steps.forEach(function (s) { s.classList.toggle('is-active', s === e.target); });
        panes.forEach(function (p) { p.classList.toggle('is-visible', p.getAttribute('data-pane') === idx); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ───────── Boot ───────── */
  initMenu();
  initNav();
  initMagnetic();
  initReveal();
  initWaveform();
  initCards();
  initTilt();
  initChatDemo();
  initStatement();
  initStory();
})();
