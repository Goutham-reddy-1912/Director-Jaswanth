/* ============================================================
   ALAM JASWANTH — "A FILM IN THE MAKING"
   Vanilla JS · one rAF scroll loop · IntersectionObserver reveals
   ------------------------------------------------------------
   01 helpers            06 reveals
   02 loading sequence   07 scroll engine (camera)
   03 custom cursor      08 films rail
   04 navigation         09 project detail view
   05 hero dust          10 subtitles / end credits
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 01 · HELPERS ---------- */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var body = document.body;

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var REDUCED = motionQuery.matches;
  var FINE_POINTER = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };

  var vh = window.innerHeight;
  var vw = window.innerWidth;

  // scroll lock has to hit both the root and the body to be reliable
  function lockScroll(on) {
    document.documentElement.classList.toggle('is-locked', !!on);
    body.classList.toggle('is-locked', !!on);
  }

  /* ---------- 02 · CINEMATIC LOADING SEQUENCE ---------- */
  (function loader() {
    var projector = $('#projector');
    var bar    = $('#loadBar');
    var pctEl  = $('#loadPct');
    var status = $('#loadStatus');
    var flash  = $('.gate-flash');
    if (!projector) { return; }

    var STEPS = [
      { at: 0,  text: 'Preparing the story...' },
      { at: 28, text: 'Loading...' },
      { at: 56, text: 'Setting the scene...' },
      { at: 84, text: 'Rolling...' }
    ];

    var pct = 0;
    var target = 92;          // hold just short of the gate until assets land
    var stepIndex = -1;
    var done = false;

    function setStatus(p) {
      var idx = 0;
      for (var i = 0; i < STEPS.length; i++) { if (p >= STEPS[i].at) { idx = i; } }
      if (idx !== stepIndex) {
        stepIndex = idx;
        status.textContent = STEPS[idx].text;
      }
    }

    function paint(p) {
      bar.style.transform = 'scaleX(' + (p / 100) + ')';
      pctEl.textContent = (p < 10 ? '0' : '') + Math.floor(p);
      setStatus(p);
    }

    function release() {
      target = 100;
    }
    if (document.readyState === 'complete') { release(); }
    else { window.addEventListener('load', release); }
    setTimeout(release, REDUCED ? 200 : 3800);   // never strand the visitor

    function reveal() {
      if (done) { return; }
      done = true;

      projector.classList.add('is-flash');            // gate light peaks
      if (!REDUCED && flash) { flash.classList.add('is-fire'); }

      setTimeout(function () {
        projector.classList.add('is-out');            // shutter opens
        body.classList.remove('is-loading');
        body.classList.add('is-ready');
        lockScroll(false);
        startExperience();
      }, REDUCED ? 40 : 420);

      setTimeout(function () {
        projector.classList.add('is-gone');
        projector.setAttribute('aria-hidden', 'true');
      }, REDUCED ? 200 : 2000);
    }

    // ignition
    requestAnimationFrame(function () {
      projector.classList.add('is-on');
      setTimeout(function () { projector.classList.add('is-lit'); }, REDUCED ? 0 : 620);
    });

    var last = 0;
    function tick(now) {
      if (!last) { last = now; }
      var dt = Math.min(64, now - last);
      last = now;

      // eased approach + a floor so the meter always breathes,
      // paced so all four title cards are actually readable
      pct += (target - pct) * (1 - Math.pow(0.35, dt / 1000));
      if (pct < target) { pct = Math.min(target, pct + dt * 0.012); }
      paint(pct);

      if (target === 100 && pct > 99.3) { paint(100); reveal(); return; }
      requestAnimationFrame(tick);
    }
    paint(0);
    if (REDUCED) {
      // honour reduced motion: show the frame, then cut straight in
      setTimeout(function () { paint(100); reveal(); }, 350);
    } else {
      setTimeout(function () { requestAnimationFrame(tick); }, 900);
    }
  }());

  /* ---------- 03 · CUSTOM CURSOR ---------- */
  function initCursor() {
    if (!FINE_POINTER || REDUCED) { return; }
    var dot  = $('.cursor__dot');
    var ring = $('.cursor__ring');
    var label = $('.cursor__label');
    if (!dot || !ring) { return; }

    body.classList.add('has-cursor');

    var mx = vw / 2, my = vh / 2;
    var rx = mx, ry = my;
    var running = false;

    // park it centre-screen so nothing flickers in the corner
    dot.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
    ring.style.transform = dot.style.transform;

    function frame() {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      dot.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)' +
                             (body.classList.contains('cursor-down') ? ' scale(.82)' : '');
      requestAnimationFrame(frame);
    }

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });

    document.addEventListener('mousedown', function () { body.classList.add('cursor-down'); });
    document.addEventListener('mouseup',   function () { body.classList.remove('cursor-down'); });

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cursor]') : null;
      body.classList.remove('cursor-label', 'cursor-frame');
      if (!t) { return; }
      var v = t.getAttribute('data-cursor');
      if (v === 'frame') {
        body.classList.add('cursor-frame');
      } else {
        label.textContent = v;
        body.classList.add('cursor-label');
      }
    });
  }

  /* ---------- 04 · NAVIGATION ---------- */
  var nav = $('#nav');
  var navLinks = $('#navLinks');
  var navToggle = $('#navToggle');
  var hudScene = $('#hudScene');

  (function initNav() {
    if (!navToggle || !navLinks) { return; }

    function closeMenu() {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      lockScroll(false);
    }

    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      navLinks.classList.toggle('is-open', !open);
      lockScroll(!open);
    });

    $$('a', navLinks).forEach(function (a) { a.addEventListener('click', closeMenu); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMenu(); }
    });

    // active scene tracking
    var sections = $$('main section[id]');
    var links = $$('a[href^="#"]', navLinks);
    if (!('IntersectionObserver' in window) || !sections.length) { return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var id = en.target.id;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
        var idx = sections.indexOf(en.target) + 1;
        if (hudScene) { hudScene.textContent = 'SC ' + (idx < 10 ? '0' : '') + idx; }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }());

  /* ---------- 05 · HERO DUST ---------- */
  function initDust() {
    var cvs = $('#dust');
    if (!cvs || REDUCED || vw < 760) { return; }
    var ctx = cvs.getContext('2d');
    if (!ctx) { return; }

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = 0, h = 0, motes = [], alive = true, raf = 0;

    function size() {
      var r = cvs.getBoundingClientRect();
      w = r.width; h = r.height;
      cvs.width  = Math.floor(w * dpr);
      cvs.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var n = clamp(Math.round((w * h) / 26000), 18, 54);
      motes = [];
      for (var i = 0; i < n; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.35,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -(Math.random() * 0.22 + 0.04),
          a: Math.random() * 0.35 + 0.06,
          p: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.p += 0.01;
        m.x += m.vx + Math.sin(m.p) * 0.12;
        m.y += m.vy;
        if (m.y < -6) { m.y = h + 6; m.x = Math.random() * w; }
        if (m.x < -6) { m.x = w + 6; } else if (m.x > w + 6) { m.x = -6; }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,244,222,' + (m.a * (0.6 + Math.sin(m.p) * 0.4)) + ')';
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive) { raf = requestAnimationFrame(draw); }
    }

    size();
    window.addEventListener('resize', debounce(size, 250));

    // stop painting once the hero leaves the screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        var vis = e[0].isIntersecting;
        if (vis && !alive) { alive = true; raf = requestAnimationFrame(draw); }
        if (!vis && alive) { alive = false; cancelAnimationFrame(raf); }
      }, { threshold: 0 }).observe(cvs);
    }
    raf = requestAnimationFrame(draw);
  }

  /* ---------- 06 · SCROLL REVEALS ---------- */
  function initReveals() {
    var targets = $$('.reveal, .tl-item, .gear, .credit, .film, .screenplay');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.14 });
    targets.forEach(function (el) { io.observe(el); });

    // end-credit final beat: reveal after a short pause
    var begin = $('#endrollBegin');
    if (begin) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) {
          setTimeout(function () { begin.classList.add('is-in'); }, REDUCED ? 0 : 1100);
          obs.disconnect();
        }
      }, { threshold: 0.9 }).observe(begin);
    }
  }

  /* ---------- 07 · SCROLL ENGINE (CAMERA) ---------- */
  function initScrollEngine() {
    var heroInner  = $('#heroInner');
    var hero       = $('#home');
    var tape       = $('#tape');
    var tapeFill   = $('#tapeFill');
    var navReel    = $('#navReel');
    var tlFill     = $('#timelineFill');
    var timeline   = $('#timeline');
    var cuts       = $$('.cut');
    var endroll    = $('#endroll');
    var endInner   = $('#endrollInner');
    var rewind     = $('#rewind');
    var queued = false;

    function update() {
      queued = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var doc = document.documentElement.scrollHeight - vh;
      var prog = doc > 0 ? clamp(y / doc, 0, 1) : 0;

      // sticky nav + tape + reel
      if (nav) { nav.classList.toggle('is-stuck', y > 40); }
      if (tape) { tape.classList.toggle('is-on', y > 40); }
      if (tapeFill) { tapeFill.style.setProperty('--p', prog); }
      if (navReel) { navReel.style.setProperty('--r', (y * 0.16) + 'deg'); }
      if (rewind) { rewind.classList.toggle('is-on', y > vh * 1.2); }

      // hero: the camera pushes forward into the next scene
      if (heroInner && hero && !REDUCED) {
        var hp = clamp(y / Math.max(1, hero.offsetHeight), 0, 1);
        heroInner.style.setProperty('--camY', (hp * -110) + 'px');
        heroInner.style.setProperty('--camS', (1 + hp * 0.14).toFixed(4));
        heroInner.style.setProperty('--camO', (1 - hp * 1.25).toFixed(3));
      }

      // timeline draws itself like film running through a gate
      if (tlFill && timeline) {
        var r = timeline.getBoundingClientRect();
        var p = clamp((vh * 0.72 - r.top) / Math.max(1, r.height * 0.86), 0, 1);
        tlFill.style.setProperty('--p', p.toFixed(4));
      }

      // scene-cut hairlines
      for (var i = 0; i < cuts.length; i++) {
        var cr = cuts[i].getBoundingClientRect();
        var cp = 1 - Math.abs((cr.top + cr.height / 2) - vh / 2) / (vh / 2);
        cuts[i].style.setProperty('--cut', clamp(cp, 0, 1).toFixed(3));
      }

      // end credits roll
      if (endroll && endInner && !REDUCED) {
        var er = endroll.getBoundingClientRect();
        var span = Math.max(1, endroll.offsetHeight - vh);
        var ep = clamp((-er.top) / span, 0, 1);
        var travel = endInner.offsetHeight + vh * 0.85;
        endInner.style.setProperty('--roll', (vh * 0.42 - ep * travel) + 'px');
      }
    }

    function onScroll() {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', debounce(function () {
      vh = window.innerHeight; vw = window.innerWidth; update();
    }, 200));
    update();
  }

  /* ---------- 08 · FILMS RAIL ---------- */
  function initRail() {
    var rail = $('#rail');
    if (!rail) { return; }
    var films = $$('.film', rail);
    var prev = $('#railPrev');
    var next = $('#railNext');

    function step() {
      var card = films[0];
      return card ? card.getBoundingClientRect().width + 28 : rail.clientWidth * 0.8;
    }
    if (prev) { prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); }); }
    if (next) { next.addEventListener('click', function () { rail.scrollBy({ left:  step(), behavior: 'smooth' }); }); }

    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left:  step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });

    // drag to pan (pointer events, mouse only — touch already scrolls natively)
    var down = false, startX = 0, startL = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') { return; }
      down = true; moved = 0;
      startX = e.clientX; startL = rail.scrollLeft;
      rail.classList.add('is-dragging');
    });
    rail.addEventListener('pointermove', function (e) {
      if (!down) { return; }
      var d = e.clientX - startX;
      moved = Math.abs(d);
      rail.scrollLeft = startL - d;
    });
    function endDrag() {
      if (!down) { return; }
      down = false;
      rail.classList.remove('is-dragging');
    }
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointerleave', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    // swallow the click that ends a real drag
    rail.addEventListener('click', function (e) {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    // frames drift vertically as they pass the gate
    if (!REDUCED) {
      var queued = false;
      function parallax() {
        queued = false;
        var mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
        films.forEach(function (f) {
          var b = f.getBoundingClientRect();
          var off = ((b.left + b.width / 2) - mid) / rail.clientWidth;
          var btn = $('.film__btn', f);
          if (btn) { btn.style.setProperty('--py', (clamp(off, -1, 1) * 22).toFixed(2) + 'px'); }
        });
      }
      rail.addEventListener('scroll', function () {
        if (!queued) { queued = true; requestAnimationFrame(parallax); }
      }, { passive: true });
      parallax();
    }
  }

  /* ---------- 09 · PROJECT DETAIL VIEW ---------- */
  var FILMS = {
    'naa-boy-bestie': {
      slug: 'Project 01 · Web Series',
      title: 'Naa Boy Bestie',
      type: 'YouTube Web Series · Assistant Director',
      syn: 'A YouTube web series on which Alam Jaswanth worked as assistant director — contributing to the screenplay and dialogues while holding continuity and costumes together on set.',
      role: ['Screenplay writing', 'Dialogue writing', 'Edit log', 'Costumes', 'Continuity'],
      credits: [['Role', 'Assistant Director'], ['Format', 'Web Series'], ['Platform', 'YouTube'], ['Cast &amp; Crew', 'TBA'], ['Year', 'TBA']],
      trailer: 'Add trailer embed or YouTube link here',
      links: ['Episode link — TBA', 'Trailer — TBA']
    },
    'faded': {
      slug: 'Project 02 · Independent Film',
      title: '#FADED',
      type: 'Independent Film · 45 Minutes · Co-Director',
      syn: 'An independent film of 45 minutes in length, co-directed by Alam Jaswanth, who also wrote the entire script and ran continuity, properties and costumes through the shoot.',
      role: ['Entire script writing', 'Edit log', 'Continuity', 'Properties', 'Costumes'],
      credits: [['Role', 'Assistant Director / Co-Director'], ['Format', 'Independent Film'], ['Runtime', '45 minutes'], ['Cast &amp; Crew', 'TBA'], ['Year', 'TBA']],
      trailer: 'Add trailer embed or video link here',
      links: ['Full film — TBA', 'Trailer — TBA']
    },
    'feature-ad': {
      slug: 'Project 03 · Feature Film',
      title: 'Untitled Feature',
      type: 'Feature Film · Assistant Director',
      syn: 'Feature film work as assistant director, including script development and on-set departments. Title and further details to be added once they can be shared publicly.',
      role: ['Script development', 'Edit log', 'Continuity', 'Properties', 'Costumes'],
      credits: [['Role', 'Assistant Director'], ['Format', 'Feature Film'], ['Title', 'TBA'], ['Cast &amp; Crew', 'TBA'], ['Year', 'TBA']],
      trailer: 'Poster / teaser to be added',
      links: ['Details — TBA']
    },
    'feature-assoc': {
      slug: 'Project 04 · Feature Film',
      title: 'Untitled Feature',
      type: 'Feature Film · Associate Director',
      syn: 'Feature film work as associate director, covering script development and the entire pre-production process. The production was shelved before the shoot.',
      role: ['Script development', 'Entire pre-production work'],
      credits: [['Role', 'Associate Director'], ['Format', 'Feature Film'], ['Status', 'Production shelved'], ['Title', 'TBA'], ['Year', 'TBA']],
      trailer: 'No footage — pre-production material only',
      links: ['Details — TBA']
    }
  };

  function initModal() {
    var modal = $('#modal');
    if (!modal) { return; }
    var closeBtn = $('#modalClose');
    var scroller = $('.modal__scroll', modal);
    var lastFocus = null;
    var closeTimer = null;

    function fill(key) {
      var d = FILMS[key];
      if (!d) { return false; }
      $('#modalSlug').textContent  = d.slug;
      $('#modalTitle').textContent = d.title;
      $('#modalType').textContent  = d.type;
      $('#modalSyn').textContent   = d.syn;
      $('#modalHeroPh').innerHTML  = 'TRAILER PLACEHOLDER<br><i>' + d.trailer + '</i>';

      $('#modalRole').innerHTML = d.role.map(function (r) {
        return '<li>' + r + '</li>';
      }).join('');

      $('#modalCredits').innerHTML = d.credits.map(function (c) {
        return '<div><dt>' + c[0] + '</dt><dd>' + c[1] + '</dd></div>';
      }).join('');

      $('#modalStills').innerHTML = [1, 2, 3].map(function (n) {
        return '<div>STILL 0' + n + '<br>ADD IMAGE</div>';
      }).join('');

      $('#modalBts').innerHTML = [1, 2].map(function (n) {
        return '<div>BTS 0' + n + '<br>ADD PHOTO</div>';
      }).join('');

      $('#modalLinks').innerHTML = d.links.map(function (l) {
        return '<span>' + l + '</span>';
      }).join('');
      return true;
    }

    function open(key, trigger) {
      if (!fill(key)) { return; }
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      lastFocus = trigger || null;
      modal.hidden = false;
      lockScroll(true);
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        if (scroller) { scroller.scrollTop = 0; }
        if (closeBtn) { closeBtn.focus(); }
      });
    }

    function close() {
      modal.classList.remove('is-open');
      lockScroll(false);
      body.classList.remove('cursor-label', 'cursor-frame');
      closeTimer = setTimeout(function () {
        closeTimer = null;
        modal.hidden = true;
        if (lastFocus) { lastFocus.focus(); }
      }, REDUCED ? 0 : 480);
    }

    $$('[data-film]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn.getAttribute('data-film'), btn); });
    });

    if (closeBtn) { closeBtn.addEventListener('click', close); }
    $$('[data-close]', modal).forEach(function (el) { el.addEventListener('click', close); });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) { return; }
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') { return; }
      // keep focus inside the screening room
      var f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) { return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 10 · SUBTITLES · REWIND · YEAR ---------- */
  function initSubtitles() {
    var el = $('#subtitle');
    if (!el) { return; }
    var langs = ['Telugu', 'English', 'Tamil'];
    var i = 0;
    if (REDUCED) { el.textContent = langs.join('  ·  '); return; }

    var timer = null;
    function cycle() {
      el.classList.add('is-swap');
      setTimeout(function () {
        i = (i + 1) % langs.length;
        el.textContent = langs[i];
        el.classList.remove('is-swap');
      }, 420);
    }
    // only run while the section is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && !timer) { timer = setInterval(cycle, 2600); }
        else if (!e[0].isIntersecting && timer) { clearInterval(timer); timer = null; }
      }, { threshold: 0.3 }).observe(el);
    } else {
      timer = setInterval(cycle, 2600);
    }
  }

  function initMisc() {
    var rewind = $('#rewind');
    if (rewind) {
      rewind.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    }
    var year = $('#year');
    if (year) { year.textContent = new Date().getFullYear(); }
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  /* ---------- BOOT ---------- */
  var started = false;
  function startExperience() {
    if (started) { return; }
    started = true;
    initCursor();
    initDust();
    initReveals();
    initScrollEngine();
    initRail();
  }

  // things that don't wait for the projector
  initModal();
  initSubtitles();
  initMisc();

  // safety net: if the loader ever stalls, the site still comes alive
  setTimeout(function () {
    if (!started) {
      body.classList.remove('is-loading');
      body.classList.add('is-ready');
      lockScroll(false);
      var p = $('#projector');
      if (p) { p.classList.add('is-out', 'is-gone'); }
      startExperience();
    }
  }, 9000);

  motionQuery.addEventListener && motionQuery.addEventListener('change', function (e) {
    REDUCED = e.matches;
  });
}());
