/* VandeTrack — shared behaviour: theme, nav, reveal animations, forms -> WhatsApp. No deps. */
(function () {
  'use strict';

  /* ---------- Theme (dark / light) ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  /* Keep responsive WebP sources in sync with the existing light/dark logo fallback. */
  function syncBrandLogo(t) {
    var lg = document.querySelector('.brand-logo');
    if (!lg) return;
    var dark = t === 'dark';
    var picture = lg.closest ? lg.closest('picture.vt-media') : null;
    var source = picture ? picture.querySelector('source[type="image/webp"]') : null;
    var responsive = lg.getAttribute(dark ? 'data-logo-dark-srcset' : 'data-logo-light-srcset');
    if (source && responsive) source.setAttribute('srcset', responsive);
    lg.src = dark ? 'assets/img/logo-dark.png' : 'assets/img/logo.png';
  }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('vt-theme', t); } catch (e) {}
    if (toggle) toggle.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    syncBrandLogo(t);
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    var cur = root.getAttribute('data-theme');
    toggle.setAttribute('aria-pressed', cur === 'dark' ? 'true' : 'false');
  }
  /* sync logo variant with the theme set by the head script */
  syncBrandLogo(root.getAttribute('data-theme'));

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var wasScrolled = null;
    var onScroll = function () {
      var scrolled = window.scrollY > 8;
      if (scrolled !== wasScrolled) {
        header.classList.toggle('scrolled', scrolled);
        wasScrolled = scrolled;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll-reveal (subtle, respects reduced motion) ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* SVG SMIL (animateMotion) ignores CSS reduced-motion — pause it explicitly */
  if (reduce) {
    document.querySelectorAll('.tm-map svg').forEach(function (svg) {
      if (svg.pauseAnimations) { try { svg.pauseAnimations(); } catch (e) {} }
    });
  }

  var revealSel = '.section-head, .card, .ind-tile, .vt-tile, .step, .tier, .track-mock, .cta-band, .check-list, .spec-table, .form-card, .stat, .pcat-head';
  if (!reduce && 'IntersectionObserver' in window) {
    var pending = [];
    var vrCount = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        /* reveal when visible OR when it already scrolled past above the viewport
           (fast scroll / jump-to-anchor can skip intersection samples) */
        if (en.isIntersecting || en.boundingClientRect.top < 0) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    /* dynamic-safe scan: catches elements rendered later (e.g. products.js) too */
    function vtRevealScan() {
      var els = document.querySelectorAll(revealSel);
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.hasAttribute('data-vr')) continue;
        if (el.closest && el.closest('details')) continue;
        el.setAttribute('data-vr', '1');
        el.classList.add('reveal');
        el.style.setProperty('--rd', (vrCount++ % 4) * 0.08 + 's');
        io.observe(el);
        pending.push(el);
      }
    }
    vtRevealScan();
    window.__vtRevealScan = vtRevealScan;
    /* scroll fallback: instantly reveal anything the user has already scrolled to
       (protects against IO sample-skipping on very fast scrolls / jump-to-bottom) */
    var ticking = false;
    function sweep() {
      ticking = false;
      var vh = window.innerHeight;
      /* Read all geometry first, then write classes; avoid per-element layout thrashing. */
      var revealNow = [];
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        if (el.getBoundingClientRect().top < vh) {
          revealNow.push(el);
          return false;
        }
        return true;
      });
      revealNow.forEach(function (el) {
        el.classList.add('in');
        io.unobserve(el);
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(sweep); }
    }, { passive: true });
    /* safety net: never leave content invisible (print, odd viewports, missed samples) */
    window.setTimeout(function () {
      var all = document.querySelectorAll(revealSel);
      for (var i = 0; i < all.length; i++) all[i].classList.add('in');
    }, 1800);
  } else {
    var all0 = document.querySelectorAll(revealSel);
    for (var j = 0; j < all0.length; j++) all0[j].classList.add('in');
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Forms -> WhatsApp ---------- */
  document.querySelectorAll('form[data-wa]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var num = form.getAttribute('data-wa') || '918238707442';
      var lines = [];
      form.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (el) {
        var label = el.getAttribute('data-label') || el.name;
        var val = (el.value || '').trim();
        if (val) lines.push('• ' + label + ': ' + val);
      });
      var prefix = form.getAttribute('data-wa-prefix') || 'Hi VandeTrack!';
      var msg = prefix + '\n' + lines.join('\n');
      window.open(
        'https://wa.me/' + num + '?text=' + encodeURIComponent(msg),
        '_blank',
        'noopener'
      );
    });
  });
  /* ---------- Custom GPS cursor (fine pointers only) ---------- */
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    document.documentElement.classList.add('vt-cursor');
    var cur = document.createElement('div');
    cur.id = 'vtCursor';
    cur.className = 'vt-cursor-el';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML =
      '<svg class="c-cross" viewBox="0 0 40 40" aria-hidden="true">' +
        '<circle class="ring" cx="20" cy="20" r="10"/>' +
        '<path class="tick" d="M20 4v6M20 30v6M4 20h6M30 20h6"/>' +
        '<circle class="dot" cx="20" cy="20" r="3.2"/>' +
      '</svg>' +
      '<svg class="c-pin" viewBox="0 0 40 40" aria-hidden="true">' +
        '<path class="pin-body" d="M20 4c-7 0-12.5 5.4-12.5 12.2C7.5 25.6 20 37 20 37s12.5-11.4 12.5-20.8C32.5 9.4 27 4 20 4z"/>' +
        '<circle class="pin-hole" cx="20" cy="16.4" r="5"/>' +
        '<circle class="pin-core" cx="20" cy="16.4" r="2.2"/>' +
      '</svg>' +
      '<span class="c-ripple"></span>';
    document.body.appendChild(cur);

    var trail = null;
    if (!reduce) {
      trail = document.createElement('div');
      trail.className = 'vt-trail';
      trail.setAttribute('aria-hidden', 'true');
      document.body.appendChild(trail);
    }

    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy, seen = false;
    window.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!seen) {
        seen = true;
        cur.classList.add('on');
        if (trail) trail.classList.add('on');
      }
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      seen = false;
      cur.classList.remove('on');
      if (trail) trail.classList.remove('on');
    });
    document.addEventListener('pointerover', function (e) {
      var t = e.target && e.target.closest
        ? e.target.closest('a, button, summary, select, .filter-btn, [data-cursor="pin"]')
        : null;
      cur.classList.toggle('is-hover', !!t);
    });
    window.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });

    (function loop() {
      if (trail) {
        tx += (cx - tx) * 0.16;
        ty += (cy - ty) * 0.16;
        trail.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      }
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- Sliding nav indicator (desktop) — slides ONLY after a click ---------- */
  var nav = document.getElementById('mainNav');
  var pill = nav ? nav.querySelector('.nav-pill') : null;
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll(':scope > a')) : [];
  var activeLink = nav ? nav.querySelector('a.active') : null;

  var pillTransitionFrame = 0;
  function placePill(el, animate) {
    if (!pill || !el || window.innerWidth <= 980) return;
    /* Measure before changing any styles. Never force a synchronous post-write layout. */
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    if (pillTransitionFrame) {
      cancelAnimationFrame(pillTransitionFrame);
      pillTransitionFrame = 0;
    }
    pill.style.transition = animate ? '' : 'none';
    pill.style.left = left + 'px';
    pill.style.width = width + 'px';
    pill.style.opacity = '1';
    nav.classList.add('nav-pill-on');
    if (!animate) {
      pillTransitionFrame = requestAnimationFrame(function () {
        pillTransitionFrame = requestAnimationFrame(function () {
          pill.style.transition = '';
          pillTransitionFrame = 0;
        });
      });
    }
  }

  if (pill && activeLink) {
    var curIdx = navLinks.indexOf(activeLink);
    var clickRec = null;
    try {
      clickRec = JSON.parse(sessionStorage.getItem('vt-nav-click') || 'null');
      sessionStorage.removeItem('vt-nav-click');
    } catch (e) {}

    /* slide ONLY when it follows an actual click (very recent); otherwise place instantly */
    var fresh = clickRec && Date.now() - clickRec.t < 2500;
    var fromEl = fresh && typeof clickRec.idx === 'number' ? navLinks[clickRec.idx] : null;
    if (fromEl && clickRec.idx !== curIdx) {
      placePill(fromEl, false);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { placePill(activeLink, true); });
      });
    } else {
      placePill(activeLink, false);
    }

    /* slide to the item the user clicks (before the page leaves) */
    navLinks.forEach(function (link, i) {
      link.addEventListener('click', function () {
        try {
          sessionStorage.setItem('vt-nav-click', JSON.stringify({ idx: i, t: Date.now() }));
        } catch (e) {}
        placePill(link, true);
      });
    });

    var pillResizeFrame = 0;
    window.addEventListener('resize', function () {
      if (pillResizeFrame) return;
      pillResizeFrame = requestAnimationFrame(function () {
        pillResizeFrame = 0;
        if (activeLink) placePill(activeLink, false);
      });
    });
  }

  /* ---------- Page transitions (fade + slide + progress) ---------- */
  var progress = document.getElementById('pageProgress');

  if (!reduce) {
    document.body.classList.add('is-entering');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('is-entering');
      });
    });
    if (progress) {
      progress.classList.add('on');
      progress.style.transform = 'scaleX(0.4)';
      window.setTimeout(function () {
        progress.style.transform = 'scaleX(1)';
        window.setTimeout(function () {
          progress.classList.remove('on');
          progress.style.transform = 'scaleX(0)';
        }, 260);
      }, 120);
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return;
    if (/^(https?:|tel:|mailto:|javascript:|\/\/)/i.test(href)) {
      /* external / special links: only same-site http(s) get the transition */
      try {
        var url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
      } catch (err) { return; }
    }
    var dest = new URL(href, location.href);
    if (dest.pathname === location.pathname && dest.hash) return; /* same-page anchor */

    e.preventDefault();
    if (reduce) { location.href = dest.href; return; }
    document.body.classList.add('is-leaving');
    if (progress) {
      progress.classList.add('on');
      progress.style.transform = 'scaleX(0.7)';
    }
    window.setTimeout(function () { location.href = dest.href; }, 200);
  });

  /* back/forward cache: reset any leftover state */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('is-leaving', 'is-entering');
      if (progress) { progress.classList.remove('on'); progress.style.transform = 'scaleX(0)'; }
      if (pill && activeLink) placePill(activeLink, false);
      vtRippleReset();
    }
  });

  /* ---------- Water-drop ripple on logo click (starts at the logo, then goes home) ---------- */
  var vtRippleRunning = false;
  function vtRippleReset() {
    vtRippleRunning = false;
    var old = document.querySelectorAll('.ripple-canvas');
    for (var i = 0; i < old.length; i++) {
      if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
    }
  }
  var brand = document.querySelector('.brand');
  if (brand) {
    brand.addEventListener('click', function (e) {
      /* let modified clicks (new tab etc.) and keyboard/programmatic clicks use the
         normal page-transition path untouched */
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.detail === 0) return;
      e.preventDefault();
      if (vtRippleRunning) return;
      vtRippleRunning = true;

      var href = brand.getAttribute('href') || 'index.html';
      var onHome = /index\.html?$/.test(location.pathname) || /\/$/.test(location.pathname);

      function go() {
        if (onHome) {
          try { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } catch (err) { window.scrollTo(0, 0); }
        } else {
          document.body.classList.add('is-leaving');
          if (progress) { progress.classList.add('on'); progress.style.transform = 'scaleX(0.7)'; }
          location.href = href;
        }
      }

      /* reduced motion / no canvas support: skip the effect entirely */
      var testCtx;
      try { testCtx = document.createElement('canvas').getContext('2d'); } catch (err) { testCtx = null; }
      if (reduce || !testCtx) {
        if (onHome) { go(); vtRippleRunning = false; }
        else { go(); window.setTimeout(function () { location.href = href; }, 1200); }
        return;
      }

      /* click point — fall back to the logo centre for edge cases */
      var rect = brand.getBoundingClientRect();
      var x = (e.clientX || e.clientY) ? e.clientX : rect.left + rect.width / 2;
      var y = (e.clientX || e.clientY) ? e.clientY : rect.top + rect.height / 2;

      var canvas = document.createElement('canvas');
      canvas.className = 'ripple-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      var W = window.innerWidth, H = window.innerHeight;
      var DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      document.body.appendChild(canvas);
      var ctx;
      try { ctx = canvas.getContext('2d'); } catch (err) { ctx = null; }
      if (!ctx) {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        go(); vtRippleRunning = false;
        return;
      }
      ctx.scale(DPR, DPR);

      /* HARD navigation fallback — even if the animation loop dies, the user still
         reaches home. Harmless if go() already ran. */
      if (!onHome) window.setTimeout(function () { location.href = href; }, 2400);

      var maxR = Math.sqrt(Math.max(x, W - x) * Math.max(x, W - x) + Math.max(y, H - y) * Math.max(y, H - y)) * 1.06;
      var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
      var WAVES = [{ d: 0, dur: 1400 }, { d: 240, dur: 1400 }, { d: 480, dur: 1400 }];
      var TOTAL = 1960;
      var navFired = false;

      function easeOut(t) { return 1 - (1 - t) * (1 - t) * (1 - t); }

      function drawRing(R, A) {
        if (R <= 2 || A <= 0.01) return;
        /* soft dark trough just outside the crest (radii clamped — canvas throws on r1 < 0) */
        var o1 = Math.max(1, R + 10);
        var o0 = Math.max(0, Math.min(R - 30, o1 - 1));
        var g = ctx.createRadialGradient(x, y, o0, x, y, o1);
        g.addColorStop(0, 'rgba(64, 92, 80, 0)');
        g.addColorStop(0.62, 'rgba(64, 92, 80, ' + (0.22 * A).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(64, 92, 80, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - R - 12, y - R - 12, 2 * R + 24, 2 * R + 24);
        /* bright water highlight inside the crest */
        var h1 = Math.max(1, R - 8);
        var h0 = Math.max(0, Math.min(R - 54, h1 - 1));
        var g2 = ctx.createRadialGradient(x, y, h0, x, y, h1);
        g2.addColorStop(0, 'rgba(255, 255, 255, 0)');
        g2.addColorStop(0.55, 'rgba(255, 255, 255, ' + (0.52 * A).toFixed(3) + ')');
        g2.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g2;
        ctx.fillRect(x - R - 12, y - R - 12, 2 * R + 24, 2 * R + 24);
        /* crest line + faint outer echo */
        ctx.beginPath(); ctx.arc(x, y, Math.max(1, R - 16), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.55 * A).toFixed(3) + ')';
        ctx.lineWidth = 1.6; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, R + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(70, 100, 88, ' + (0.15 * A).toFixed(3) + ')';
        ctx.lineWidth = 1; ctx.stroke();
      }

      function frame() {
        try {
        var now = (window.performance && performance.now) ? performance.now() : Date.now();
        var t = now - t0;
        ctx.clearRect(0, 0, W, H);

        /* milky water surface spreading from the drop point (like the reference photo) */
        var spread = easeOut(Math.min(1, t / 1000)) * maxR * 0.92;
        if (spread > 1) {
          var gs = ctx.createRadialGradient(x, y, 0, x, y, spread);
          gs.addColorStop(0, 'rgba(230, 239, 234, 0.90)');
          gs.addColorStop(0.72, 'rgba(224, 235, 230, 0.42)');
          gs.addColorStop(1, 'rgba(224, 235, 230, 0)');
          ctx.fillStyle = gs;
          ctx.fillRect(0, 0, W, H);
        }

        /* the falling drop bump (first quarter second) */
        if (t < 380) {
          var dp = t / 380;
          var dr = 30 * easeOut(dp);
          var gd = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, dr));
          gd.addColorStop(0, 'rgba(46, 74, 64, ' + (0.34 * (1 - dp)).toFixed(3) + ')');
          gd.addColorStop(1, 'rgba(46, 74, 64, 0)');
          ctx.fillStyle = gd;
          ctx.fillRect(x - dr - 4, y - dr - 4, 2 * dr + 8, 2 * dr + 8);
        }

        /* expanding concentric waves */
        for (var i = 0; i < WAVES.length; i++) {
          var tw = t - WAVES[i].d;
          if (tw <= 0) continue;
          var p = tw / WAVES[i].dur;
          if (p >= 1) continue;
          drawRing(maxR * easeOut(p), (1 - p) * (1 - p));
        }

        if (t < TOTAL) {
          requestAnimationFrame(frame);
        } else {
          finish();
        }

        /* start moving home mid-effect so the page loads under the water */
        if (!navFired && t >= 850) {
          navFired = true;
          go();
        }
        } catch (err) {
          /* zero-risk fallback: never leave a stuck canvas or stuck page */
          finish();
          if (!navFired) { navFired = true; go(); }
        }
      }
      function finish() {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        if (onHome) vtRippleRunning = false;
      }
      /* absolute cleanup net — canvas never outlives 1.6s no matter what */
      window.setTimeout(finish, 2600);
      requestAnimationFrame(frame);
    });

    /* first-visit discoverability: briefly show the Home hint once per session
       so visitors learn the logo click takes them home */
    try {
      if (!window.sessionStorage.getItem('vt-logo-hint')) {
        window.setTimeout(function () {
          var hint = brand.querySelector('.brand-hint');
          if (hint) {
            hint.classList.add('show');
            window.setTimeout(function () { hint.classList.remove('show'); }, 2600);
          }
          try { window.sessionStorage.setItem('vt-logo-hint', '1'); } catch (err2) {}
        }, 1800);
      }
    } catch (err) {}
  }

  /* ---------- Certificate lightbox (click-to-zoom) ---------- */
  document.querySelectorAll('a[data-zoom]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var src = a.getAttribute('href');
      var lb = document.createElement('div');
      lb.className = 'vt-lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', 'Certificate viewer');
      var img = document.createElement('img');
      img.src = src;
      img.alt = a.querySelector('img') ? a.querySelector('img').alt : 'Certificate';
      var close = document.createElement('div');
      close.className = 'lb-close';
      close.textContent = '×';
      lb.appendChild(img);
      lb.appendChild(close);
      document.body.appendChild(lb);
      function dismiss() { if (lb.parentNode) lb.parentNode.removeChild(lb); }
      lb.addEventListener('click', dismiss);
      document.addEventListener('keydown', function onKey(e2) {
        if (e2.key === 'Escape') { dismiss(); document.removeEventListener('keydown', onKey); }
      });
    });
  });
})();


  /* ---------- Looping videos: instant-start engine (v0.9.5) ----------
     Phase 1: near-viewport tiles fetch + play (rootMargin 1200px).
     Phase 2: after window 'load', warm EVERY remaining clip at idle so
     scroll-in is already buffered = instant start, no waiting.
     preload upgraded to 'auto' BEFORE src (preload="none" was the slow-start
     culprit: the browser deferred the fetch until play()). */
  (function () {
    var vids = document.querySelectorAll('video[data-src]');
    if (!vids.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    function load(v) {
      if (!v.getAttribute('src')) {
        v.setAttribute('preload', 'auto');
        v.setAttribute('src', v.getAttribute('data-src'));
      }
    }
    function safePlay(v) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    if (reduce) return; /* posters only */
    if (saveData) return; /* respect data-saver: posters only */
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < vids.length; i++) { load(vids[i]); safePlay(vids[i]); }
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { load(v); safePlay(v); }
        else { try { v.pause(); } catch (err) {} }
      });
    }, { rootMargin: '1200px 0px', threshold: 0.01 });
    for (var k = 0; k < vids.length; k++) { io.observe(vids[k]); }
    /* Warm-cache: fetch everything in the background once the page settles */
    function warmAll() { for (var w = 0; w < vids.length; w++) { load(vids[w]); } }
    function scheduleWarm() {
      if (window.requestIdleCallback) { window.requestIdleCallback(warmAll, { timeout: 4000 }); }
      else { setTimeout(warmAll, 1200); }
    }
    if (document.readyState === 'complete') { scheduleWarm(); }
    else { window.addEventListener('load', scheduleWarm, { once: true }); }
  })();


  /* ---------- Products: "Under Development" overlay (3.8s, auto-dismiss) ---------- */
  (function () {
    var ov = document.getElementById('devOverlay');
    if (!ov) return;
    var hideTimer, shown = false;
    function showDev() {
      if (shown) return;
      shown = true;
      ov.style.display = 'flex';
      ov.classList.remove('closing');
      requestAnimationFrame(function () { ov.classList.add('show'); });
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hideDev, 3800);
    }
    function hideDev() {
      clearTimeout(hideTimer);
      ov.classList.add('closing');
      setTimeout(function () {
        ov.classList.remove('show', 'closing');
        ov.style.display = 'none';
        shown = false;
      }, 420);
    }
    showDev();
    ov.addEventListener('click', hideDev);
    /* replay when clicking Products nav while already on this page */
    var links = document.querySelectorAll('.main-nav a[href="products.html"]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        if (location.pathname.indexOf('products.html') > -1) { e.preventDefault(); showDev(); }
      });
    }
  })();
