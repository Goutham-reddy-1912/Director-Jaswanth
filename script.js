/* ============================================================
   ALAM JASWANTH — CINEMATIC PORTFOLIO
   Vanilla JS. One rAF scroll loop, IntersectionObserver reveals.
   ------------------------------------------------------------
   01 helpers          05 reveals
   02 loading          06 scroll engine
   03 cursor           07 films rail
   04 navigation       08 project detail · subtitles · misc
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 01 · HELPERS ---------- */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var body = document.body;
  var root = document.documentElement;

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var REDUCED = motionQuery.matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var HAS_IO = 'IntersectionObserver' in window;

  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };
  var pad2  = function (n) { return (n < 10 ? '0' : '') + n; };

  var vh = window.innerHeight;
  var vw = window.innerWidth;

  function lockScroll(on) {
    root.classList.toggle('is-locked', !!on);
    body.classList.toggle('is-locked', !!on);
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  /* ---------- 02 · LOADING ---------- */
  (function loader() {
    var projector = $('#projector');
    if (!projector) { return; }
    var bar = $('#loadBar'), pctEl = $('#loadPct'), status = $('#loadStatus');
    var flash = $('.gate-flash');

    var STEPS = [
      { at: 0,  text: 'Preparing the story' },
      { at: 28, text: 'Loading' },
      { at: 56, text: 'Setting the scene' },
      { at: 84, text: 'Rolling' }
    ];

    var pct = 0, target = 92, step = -1, done = false;

    function paint(p) {
      bar.style.transform = 'scaleX(' + (p / 100) + ')';
      pctEl.textContent = pad2(Math.floor(p));
      var idx = 0;
      for (var i = 0; i < STEPS.length; i++) { if (p >= STEPS[i].at) { idx = i; } }
      if (idx !== step) { step = idx; status.textContent = STEPS[idx].text; }
    }

    function release() { target = 100; }
    if (document.readyState === 'complete') { release(); }
    else { window.addEventListener('load', release); }
    setTimeout(release, REDUCED ? 200 : 3600);

    function reveal() {
      if (done) { return; }
      done = true;
      projector.classList.add('is-flash');
      if (!REDUCED && flash) { flash.classList.add('is-fire'); }

      setTimeout(function () {
        projector.classList.add('is-out');
        body.classList.remove('is-loading');
        body.classList.add('is-ready');
        lockScroll(false);
        start();
      }, REDUCED ? 40 : 420);

      setTimeout(function () {
        projector.classList.add('is-gone');
        projector.setAttribute('aria-hidden', 'true');
      }, REDUCED ? 200 : 2000);
    }

    requestAnimationFrame(function () {
      projector.classList.add('is-on');
      setTimeout(function () { projector.classList.add('is-lit'); }, REDUCED ? 0 : 620);
    });

    var last = 0;
    function tick(now) {
      if (!last) { last = now; }
      var dt = Math.min(64, now - last);
      last = now;
      pct += (target - pct) * (1 - Math.pow(0.35, dt / 1000));
      if (pct < target) { pct = Math.min(target, pct + dt * 0.012); }
      paint(pct);
      if (target === 100 && pct > 99.3) { paint(100); reveal(); return; }
      requestAnimationFrame(tick);
    }

    paint(0);
    if (REDUCED) { setTimeout(function () { paint(100); reveal(); }, 320); }
    else { setTimeout(function () { requestAnimationFrame(tick); }, 900); }
  }());

  /* ---------- 03 · CURSOR ---------- */
  function initCursor() {
    if (!FINE || REDUCED) { return; }
    var dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    if (!dot || !ring) { return; }

    body.classList.add('has-cursor');
    var mx = vw / 2, my = vh / 2, rx = mx, ry = my, running = false;

    function place(el, x, y) {
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
    }
    place(dot, mx, my); place(ring, rx, ry);

    function frame() {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      place(dot, mx, my);
      place(ring, rx, ry);
      requestAnimationFrame(frame);
    }

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      if (!e.target.closest) { return; }
      var labelled = e.target.closest('[data-cursor]');
      var hit = e.target.closest('a, button, [role="button"]');
      body.classList.remove('cursor-label', 'cursor-on');
      if (labelled) {
        label.textContent = labelled.getAttribute('data-cursor');
        body.classList.add('cursor-label');
      } else if (hit) {
        body.classList.add('cursor-on');
      }
    });
  }

  /* ---------- 04 · NAVIGATION ---------- */
  var nav = $('#nav');
  var navLinks = $('#navLinks');
  var navToggle = $('#navToggle');
  var navIndex = $('#navIndex');
  var navItems = navLinks ? $$('a', navLinks) : [];

  (function initNav() {
    if (!navToggle || !navLinks) { return; }

    function closeMenu() {
      if (navToggle.getAttribute('aria-expanded') !== 'true') { return; }
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      navLinks.classList.remove('is-open');
      lockScroll(false);
    }

    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      navLinks.classList.toggle('is-open', !open);
      lockScroll(!open);
    });

    navItems.forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMenu(); }
    });

    // which scene are we in — drives the active link and the 01 / 06 counter
    var sections = $$('main section[data-nav]');
    if (!HAS_IO || !sections.length) { return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var i = parseInt(en.target.getAttribute('data-nav'), 10) || 1;
        navItems.forEach(function (a, n) { a.classList.toggle('is-active', n === i - 1); });
        if (navIndex) { navIndex.textContent = pad2(i); }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }());

  /* ---------- 05 · REVEALS ---------- */
  function initReveals() {
    var targets = $$('[data-reveal], .tl-item, .tool, .credit, .film, .note');
    if (!HAS_IO) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });

    // the last beat of the credits, after a held pause
    var begin = $('#endrollBegin');
    if (begin) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) {
          setTimeout(function () { begin.classList.add('is-in'); }, REDUCED ? 0 : 1200);
          obs.disconnect();
        }
      }, { threshold: 0.85 }).observe(begin);
    }
  }

  /* ---------- 06 · SCROLL ENGINE ---------- */
  function initScrollEngine() {
    // camera vars live on the grid so the text column AND the footer
    // (CTA + scroll cue) both inherit them
    var heroCam = $('.hero__grid'), hero = $('#home'), shot = $('#shot');
    var tape = $('#tape'), tapeFill = $('#tapeFill'), navReel = $('#navReel');
    var tlFill = $('#timelineFill'), timeline = $('#timeline');
    var tlItems = $$('.tl-item');
    var cuts = $$('.cut');
    var endroll = $('#endroll'), endInner = $('#endrollInner');
    var rewind = $('#rewind');
    var queued = false, prevY = window.pageYOffset || 0, activeItem = null;

    function update() {
      queued = false;
      var y = window.pageYOffset || root.scrollTop;
      var span = root.scrollHeight - vh;
      var prog = span > 0 ? clamp(y / span, 0, 1) : 0;

      if (nav) {
        nav.classList.toggle('is-stuck', y > 32);
        // gets out of the way going down, returns the moment they scroll up
        var dy = y - prevY;
        var menuOpen = navLinks && navLinks.classList.contains('is-open');
        if (!menuOpen && y > vh * 0.6) {
          if (dy > 6) { nav.classList.add('is-hidden'); }
          else if (dy < -6) { nav.classList.remove('is-hidden'); }
        } else {
          nav.classList.remove('is-hidden');
        }
      }
      prevY = y;

      if (tape) { tape.classList.toggle('is-on', y > 32); }
      if (tapeFill) { tapeFill.style.setProperty('--p', prog); }
      if (navReel) { navReel.style.setProperty('--r', (y * 0.15) + 'deg'); }
      if (rewind) { rewind.classList.toggle('is-on', y > vh * 1.4); }

      // hero: the camera eases forward into the next scene
      if (hero && !REDUCED) {
        var hp = clamp(y / Math.max(1, hero.offsetHeight), 0, 1);
        var late = hp * hp;                       // holds back, then lets go
        if (heroCam) {
          heroCam.style.setProperty('--camY', (hp * -90) + 'px');
          heroCam.style.setProperty('--camS', (1 + hp * 0.1).toFixed(4));
          heroCam.style.setProperty('--camO', (1 - hp * 1.3).toFixed(3));
        }
        // the frame drifts up slower than the type (parallax), then the camera
        // eases away from it — barely a scale, and it stays half-lit on the way
        // out so the hand-off into Director's Note has no hard edge
        if (shot) {
          shot.style.setProperty('--shotY', (hp * -38) + 'px');
          shot.style.setProperty('--shotX', (late * 10).toFixed(1) + 'px');
          shot.style.setProperty('--shotS', (1 - late * 0.03).toFixed(4));
          shot.style.setProperty('--shotO', (1 - late * 0.62).toFixed(3));
        }
      }

      // the journey rail draws itself
      if (tlFill && timeline) {
        var r = timeline.getBoundingClientRect();
        tlFill.style.setProperty('--p',
          clamp((vh * 0.7 - r.top) / Math.max(1, r.height * 0.85), 0, 1).toFixed(4));
      }

      // one scene is lit at a time; the rest sit back
      if (tlItems.length) {
        var best = null, bestD = Infinity, mid = vh * 0.45;
        for (var j = 0; j < tlItems.length; j++) {
          var b = tlItems[j].getBoundingClientRect();
          var d = Math.abs((b.top + Math.min(b.height, vh) / 2) - mid);
          if (d < bestD) { bestD = d; best = tlItems[j]; }
        }
        if (best !== activeItem) {
          if (activeItem) { activeItem.classList.remove('is-active'); }
          if (best) { best.classList.add('is-active'); }
          activeItem = best;
        }
      }

      for (var i = 0; i < cuts.length; i++) {
        var cr = cuts[i].getBoundingClientRect();
        var cp = 1 - Math.abs((cr.top + cr.height / 2) - vh / 2) / (vh / 2);
        cuts[i].style.setProperty('--cut', clamp(cp, 0, 1).toFixed(3));
      }

      if (endroll && endInner && !REDUCED) {
        var er = endroll.getBoundingClientRect();
        var es = Math.max(1, endroll.offsetHeight - vh);
        var ep = clamp((-er.top) / es, 0, 1);
        var travel = endInner.offsetHeight + vh * 0.85;
        endInner.style.setProperty('--roll', (vh * 0.42 - ep * travel) + 'px');
      }
    }

    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', debounce(function () {
      vh = window.innerHeight; vw = window.innerWidth; update();
    }, 200));
    update();
  }

  /* ---------- 07 · FILMS RAIL ---------- */
  function initRail() {
    var rail = $('#rail');
    if (!rail) { return; }
    var films = $$('.film', rail);
    var prev = $('#railPrev'), next = $('#railNext');

    function step() {
      var c = films[0];
      return c ? c.getBoundingClientRect().width + 32 : rail.clientWidth * 0.8;
    }
    function go(dir) { rail.scrollBy({ left: dir * step(), behavior: REDUCED ? 'auto' : 'smooth' }); }
    if (prev) { prev.addEventListener('click', function () { go(-1); }); }
    if (next) { next.addEventListener('click', function () { go(1); }); }

    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
    });

    var down = false, startX = 0, startL = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') { return; }
      down = true; moved = 0; startX = e.clientX; startL = rail.scrollLeft;
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
    rail.addEventListener('click', function (e) {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    if (REDUCED) { return; }
    var queued = false;
    function parallax() {
      queued = false;
      var mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      films.forEach(function (f) {
        var b = f.getBoundingClientRect();
        var off = ((b.left + b.width / 2) - mid) / rail.clientWidth;
        var btn = $('.film__btn', f);
        if (btn) { btn.style.setProperty('--py', (clamp(off, -1, 1) * 18).toFixed(2) + 'px'); }
      });
    }
    rail.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }

  /* ---------- 08 · PROJECT DETAIL ---------- */
  /* Only what the résumé states. Anything unknown stays an explicit TBA. */
  var FILMS = {
    'naa-boy-bestie': {
      n: 1,
      type: 'Web Series · YouTube',
      title: 'Naa Boy Bestie',
      role: 'Assistant Director',
      syn: 'A YouTube web series. Alam worked as assistant director — writing screenplay and dialogues, then holding continuity and costumes together through the shoot.',
      duties: ['Screenplay writing', 'Dialogue writing', 'Edit log', 'Costumes', 'Continuity'],
      credits: [['Role', 'Assistant Director'], ['Format', 'Web Series'], ['Platform', 'YouTube'], ['Cast & Crew', 'TBA'], ['Year', 'TBA']],
      trailer: 'Footage not yet available',
      links: ['Episode link — TBA', 'Trailer — TBA']
    },
    'faded': {
      n: 2,
      type: 'Independent Film · 45 Minutes',
      title: '#FADED',
      role: 'Assistant Director / Co-Director',
      syn: 'An independent film running 45 minutes, co-directed by Alam Jaswanth. He wrote the entire script and carried continuity, properties and costumes on set.',
      duties: ['Entire script writing', 'Edit log', 'Continuity', 'Properties', 'Costumes'],
      credits: [['Role', 'Assistant Director / Co-Director'], ['Format', 'Independent Film'], ['Runtime', '45 minutes'], ['Cast & Crew', 'TBA'], ['Year', 'TBA']],
      trailer: 'Footage not yet available',
      links: ['Full film — TBA', 'Trailer — TBA']
    },
    'feature-ad': {
      n: 3,
      type: 'Feature Film',
      title: 'Untitled Feature',
      role: 'Assistant Director',
      syn: 'Feature film work as assistant director, spanning script development and the on-set departments. The title and further details will be added once they can be shared publicly.',
      duties: ['Script development', 'Edit log', 'Continuity', 'Properties', 'Costumes'],
      credits: [['Role', 'Assistant Director'], ['Format', 'Feature Film'], ['Title', 'TBA'], ['Cast & Crew', 'TBA'], ['Year', 'TBA']],
      trailer: 'Footage not yet available',
      links: ['Details — TBA']
    },
    'feature-assoc': {
      n: 4,
      type: 'Feature Film',
      title: 'Untitled Feature',
      role: 'Associate Director',
      syn: 'Feature film work as associate director, covering script development and the entire pre-production process. The production was shelved before the shoot began.',
      duties: ['Script development', 'Entire pre-production work'],
      credits: [['Role', 'Associate Director'], ['Format', 'Feature Film'], ['Status', 'Production shelved'], ['Title', 'TBA'], ['Year', 'TBA']],
      trailer: 'No footage — pre-production material only',
      links: ['Details — TBA']
    }
  };

  function initStory() {
    var story = $('#story');
    if (!story) { return; }
    var scroller = $('#storyScroll');
    var closers = [$('#storyClose'), $('#storyCloseFoot')].filter(Boolean);
    var lastFocus = null, closeTimer = null;

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function fill(key) {
      var d = FILMS[key];
      if (!d) { return false; }
      $('#storyNum').textContent   = pad2(d.n);
      $('#storyType').textContent  = d.type;
      $('#storyTitle').textContent = d.title;
      $('#storyRole').textContent  = d.role;
      $('#storySyn').textContent   = d.syn;
      $('#storyHeroPh').innerHTML  = 'Trailer<i>' + esc(d.trailer) + '</i>';

      $('#storyDuties').innerHTML = d.duties.map(function (r) {
        return '<li>' + esc(r) + '</li>';
      }).join('');

      $('#storyCredits').innerHTML = d.credits.map(function (c) {
        return '<div><dt>' + esc(c[0]) + '</dt><dd>' + esc(c[1]) + '</dd></div>';
      }).join('');

      $('#storyStills').innerHTML = [1, 2, 3, 4].map(function (i) {
        return '<div>Still ' + pad2(i) + '<i>Not yet available</i></div>';
      }).join('');

      $('#storyBts').innerHTML = [1, 2].map(function (i) {
        return '<div>BTS ' + pad2(i) + '<i>Not yet available</i></div>';
      }).join('');

      $('#storyLinks').innerHTML = d.links.map(function (l) {
        return '<span>' + esc(l) + '</span>';
      }).join('');
      return true;
    }

    function open(key, trigger) {
      if (!fill(key)) { return; }
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      lastFocus = trigger || null;
      story.hidden = false;
      lockScroll(true);
      requestAnimationFrame(function () {
        story.classList.add('is-open');
        if (scroller) { scroller.scrollTop = 0; }
        if (closers[0]) { closers[0].focus(); }
      });
    }

    function close() {
      story.classList.remove('is-open');
      lockScroll(false);
      body.classList.remove('cursor-label', 'cursor-on');
      closeTimer = setTimeout(function () {
        closeTimer = null;
        story.hidden = true;
        if (lastFocus) { lastFocus.focus(); }
      }, REDUCED ? 0 : 520);
    }

    $$('[data-film]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn.getAttribute('data-film'), btn); });
    });
    closers.forEach(function (b) { b.addEventListener('click', close); });

    document.addEventListener('keydown', function (e) {
      if (story.hidden) { return; }
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') { return; }
      var f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', story)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) { return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- SHOWREEL ----------
     The markup ships without a video on purpose. The moment a <video
     id="reelVideo"> exists, the button becomes a real play control; until
     then it stays honestly disabled rather than pretending to work. */
  function initReel() {
    var stage = $('#reelStage'), btn = $('#reelPlay'), vid = $('#reelVideo');
    if (!btn || !stage) { return; }

    if (!vid) {
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('title', 'Showreel coming soon');
      btn.addEventListener('click', function () {
        stage.classList.add('is-waiting');
        setTimeout(function () { stage.classList.remove('is-waiting'); }, 1400);
      });
      return;
    }

    btn.removeAttribute('aria-disabled');
    btn.setAttribute('aria-label', 'Play showreel');
    btn.addEventListener('click', function () {
      stage.classList.add('is-playing');
      btn.hidden = true;
      var p = vid.play();
      if (p && p.catch) { p.catch(function () { vid.controls = true; }); }
    });
  }

  /* ---------- TIMECODE ----------
     Runs at 24fps through the opening take, then stops for good. No idle
     loop, no scroll listener — it is a one-shot that settles. */
  function initTimecode() {
    var el = $('#timecode');
    if (!el) { return; }
    var RUN = 1900;                       // the length of the take
    if (REDUCED) { el.textContent = '00:00:01:21'; return; }

    var t0 = 0;
    function frame(now) {
      if (!t0) { t0 = now; }
      var ms = Math.min(RUN, now - t0);
      var f = Math.floor(ms / 1000 * 24);
      el.textContent = '00:00:' + pad2(Math.floor(f / 24)) + ':' + pad2(f % 24);
      if (ms < RUN) { requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- THE OPENING SHOT · CURSOR DRIFT ---------- */
  function initShot() {
    var frame = $('.shot__frame');
    if (!frame || REDUCED || !FINE) { return; }

    // set on the frame, not on a layer: the body and the head band both
    // inherit it, so they can never drift apart and split the seam
    frame.addEventListener('mousemove', function (e) {
      var b = frame.getBoundingClientRect();
      frame.style.setProperty('--mx', (((e.clientX - b.left) / b.width) * 2 - 1).toFixed(3));
      frame.style.setProperty('--my', (((e.clientY - b.top) / b.height) * 2 - 1).toFixed(3));
    }, { passive: true });

    frame.addEventListener('mouseleave', function () {
      frame.style.setProperty('--mx', '0');
      frame.style.setProperty('--my', '0');
    });
  }

  /* ---------- HERO DUST ---------- */
  function initDust() {
    var cvs = $('#dust');
    if (!cvs || REDUCED || vw < 900) { return; }
    var ctx = cvs.getContext('2d');
    if (!ctx) { return; }

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = 0, h = 0, motes = [], alive = true, raf = 0;

    function build() {
      var n = clamp(Math.round((w * h) / 30000), 14, 40);
      motes = [];
      for (var i = 0; i < n; i++) {
        motes.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          vx: (Math.random() - 0.5) * 0.14,
          vy: -(Math.random() * 0.2 + 0.03),
          a: Math.random() * 0.3 + 0.05,
          p: Math.random() * Math.PI * 2
        });
      }
    }
    function size() {
      var r = cvs.getBoundingClientRect();
      w = r.width; h = r.height;
      cvs.width = Math.floor(w * dpr); cvs.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.p += 0.009;
        m.x += m.vx + Math.sin(m.p) * 0.1;
        m.y += m.vy;
        if (m.y < -6) { m.y = h + 6; m.x = Math.random() * w; }
        if (m.x < -6) { m.x = w + 6; } else if (m.x > w + 6) { m.x = -6; }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,246,229,' + (m.a * (0.6 + Math.sin(m.p) * 0.4)) + ')';
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive) { raf = requestAnimationFrame(draw); }
    }

    size();
    window.addEventListener('resize', debounce(size, 250));
    if (HAS_IO) {
      new IntersectionObserver(function (e) {
        var vis = e[0].isIntersecting;
        if (vis && !alive) { alive = true; raf = requestAnimationFrame(draw); }
        if (!vis && alive) { alive = false; cancelAnimationFrame(raf); }
      }, { threshold: 0 }).observe(cvs);
    }
    raf = requestAnimationFrame(draw);
  }

  /* ---------- SUBTITLES · MISC ---------- */
  function initSubtitles() {
    var el = $('#subtitle');
    if (!el) { return; }
    var langs = ['Telugu', 'English', 'Tamil'], i = 0, timer = null;
    if (REDUCED) { el.textContent = langs.join('  ·  '); return; }

    function cycle() {
      el.classList.add('is-swap');
      setTimeout(function () {
        i = (i + 1) % langs.length;
        el.textContent = langs[i];
        el.classList.remove('is-swap');
      }, 400);
    }
    if (HAS_IO) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && !timer) { timer = setInterval(cycle, 2600); }
        else if (!e[0].isIntersecting && timer) { clearInterval(timer); timer = null; }
      }, { threshold: 0.4 }).observe(el);
    } else { timer = setInterval(cycle, 2600); }
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

  /* ---------- BOOT ---------- */
  var started = false;
  function start() {
    if (started) { return; }
    started = true;
    initCursor();
    initTimecode();
    initShot();
    initDust();
    initReveals();
    initScrollEngine();
    initRail();
  }

  initStory();
  initReel();
  initSubtitles();
  initMisc();

  // if the loader ever stalls, the site still comes alive
  setTimeout(function () {
    if (!started) {
      body.classList.remove('is-loading');
      body.classList.add('is-ready');
      lockScroll(false);
      var p = $('#projector');
      if (p) { p.classList.add('is-out', 'is-gone'); }
      start();
    }
  }, 9000);

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function (e) { REDUCED = e.matches; });
  }
}());
