/* =========================================================================
   kacperolszewski.pl — minimalny vanilla JS
   1) menu mobilne  2) stan nagłówka + aktywny link  3) animacje wejścia
   ========================================================================= */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  /* ------------------------------------------------------ 1. MENU MOBILNE */
  function closeMenu() {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    header.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Otwórz menu');
    document.body.classList.remove('is-locked');
  }

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    document.body.classList.toggle('is-locked', open);
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* -------------------------------------- 2. STAN NAGŁÓWKA + AKTYWNY LINK */
  var onScroll = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ------------------------------------------------- 3. ANIMACJE WEJŚCIA */
  var reveals = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { revealer.observe(el); });
  }

  /* ------------------------------------------------------------ 4. DROBNE */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* --------------------------------------------- 5. ZŁOTA RĘKAWICA — SCROLL */
  var glove = document.getElementById('glove');
  if (glove && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var root = document.documentElement;
    var travel = 0, iconW = 0;

    function measureGlove() {
      /* pozioma podróż: od samej lewej do samej prawej krawędzi strony —
         przeliczana tylko przy resize (szerokość ikony/okna zmienia się rzadko) */
      iconW = glove.offsetWidth;
      travel = Math.max(window.innerWidth - iconW, 0);
    }

    function updateGlove() {
      var y = window.scrollY;
      /* wysokość strony liczona na bieżąco, żeby prawa krawędź była osiągana
         dokładnie w momencie dotarcia do samego dołu — niezależnie od tego,
         jak dociążą się czcionki/obrazy po starcie */
      var travelDenom = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      var pTravel = Math.min(Math.max(y / travelDenom, 0), 1);
      var x = pTravel * travel;

      var fadeInPx = 24;   /* pojawia się w pierwszych px scrolla */
      var opacity = y <= 0 ? 0 : (y < fadeInPx ? y / fadeInPx : 1);

      /* --glove-x/--glove-o/--glove-w idą na <html>, żeby czytała je zarówno
         rękawica, jak i kreska (.glove-trail) obok niej — jeden wspólny
         zestaw custom properties zamiast dwóch osobnych aktualizacji */
      root.style.setProperty('--glove-x', x + 'px');
      root.style.setProperty('--glove-o', opacity);
      root.style.setProperty('--glove-w', (x + iconW) + 'px');
    }

    measureGlove();
    updateGlove();

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { updateGlove(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', function () { measureGlove(); updateGlove(); }, { passive: true });
  }
})();
