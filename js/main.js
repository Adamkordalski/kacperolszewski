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

  /* ------------------------------------------------- 6. FILM (ROLKA 9:16) */
  var reel = document.getElementById('reel');
  var video = document.getElementById('reel-video');
  var soundBtn = document.getElementById('reel-sound');
  var playBtn = document.getElementById('reel-play');

  if (reel && video && soundBtn && playBtn && 'IntersectionObserver' in window) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var soundIcon = soundBtn.querySelector('use');
    var started = false;     /* czy po przewinięciu była już próba autostartu */
    var userPaused = false;  /* użytkownik sam zatrzymał — nie wznawiamy za niego */
    var userMuted = false;   /* użytkownik sam wyciszył */

    /* Odtwarzanie z jednym awaryjnym ponowieniem: jeśli przeglądarka odrzuci
       start z dźwiękiem (brak gestu użytkownika), lecimy wyciszeni. */
    var play = function () {
      var p = video.play();
      if (!p || !p.catch) return;
      p.catch(function () {
        if (video.muted) return;
        video.muted = true;
        var q = video.play();
        if (q && q.catch) q.catch(function () {});
      });
    };

    /* JS działa → własny interfejs zamiast natywnych kontrolek */
    video.controls = false;
    video.setAttribute('tabindex', '0');
    reel.classList.add('reel--js');

    var syncUi = function () {
      var muted = video.muted;
      reel.classList.toggle('is-paused', video.paused);
      /* wyróżniony „Włącz dźwięk" tylko gdy to przeglądarka wyciszyła film */
      soundBtn.setAttribute('data-muted', String(muted && !userMuted));
      soundBtn.setAttribute('aria-label', muted ? 'Włącz dźwięk' : 'Wycisz');
      soundIcon.setAttribute('href', muted ? '#i-vol-off' : '#i-vol-on');
    };

    /* Próba z dźwiękiem; przeglądarki (zwłaszcza iOS) bez wcześniejszego
       dotknięcia strony odrzucają taki autostart — wtedy lecimy wyciszeni. */
    var startPlayback = function () {
      if (reduceMotion || userPaused) return;
      video.muted = false;
      play();
    };

    var userPlay = function () {
      userPaused = false;
      if (!userMuted) video.muted = false;
      play();
    };

    ['play', 'pause', 'ended', 'volumechange'].forEach(function (name) {
      video.addEventListener(name, syncUi);
    });

    soundBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      video.muted = !video.muted;
      userMuted = video.muted;
      syncUi();
    });

    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      userPlay();
    });

    var toggle = function () {
      if (video.paused) {
        userPlay();
      } else {
        userPaused = true;
        video.pause();
      }
    };
    video.addEventListener('click', toggle);
    video.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });

    /* plik ~4,5 MB — pobieranie rusza dopiero tuż przed ekranem */
    new IntersectionObserver(function (entries, observer) {
      if (!entries[0].isIntersecting) return;
      video.preload = 'auto';
      observer.disconnect();
    }, { rootMargin: '0px 0px 1000px 0px' }).observe(reel);

    /* start przy przewinięciu do filmu, pauza gdy zniknie z ekranu */
    new IntersectionObserver(function (entries) {
      var ratio = entries[entries.length - 1].intersectionRatio;
      if (ratio >= 0.6) {
        if (!started) {
          started = true;
          startPlayback();
        } else if (!userPaused && video.paused && !video.ended) {
          play();
        }
      } else if (ratio < 0.2 && !video.paused) {
        video.pause();
      }
    }, { threshold: [0, 0.2, 0.6] }).observe(reel);

    syncUi();
  }
})();
