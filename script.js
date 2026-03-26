/* ============================================
   ROOTS — v5  Tabbed navigation + animations
   ============================================ */

(function () {
  'use strict';

  // --- Tab switching ---
  const tabs = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('.panel');
  const navTabs = document.querySelectorAll('.nav__tab');
  let activeTab = 'home';

  // --- Per-tab gradient themes ---
  const pageBg = document.getElementById('page-bg');

  function setGradientTheme(tabId) {
    if (!pageBg) return;
    pageBg.className = 'page-bg';
    pageBg.classList.add('page-bg--' + tabId);
  }

  function switchTab(tabId) {
    if (tabId === activeTab) return;
    activeTab = tabId;

    // Update gradient theme
    setGradientTheme(tabId);

    // Update nav
    navTabs.forEach((t) => {
      t.classList.toggle('nav__tab--active', t.dataset.tab === tabId);
    });

    // Hide ALL panels first
    panels.forEach((p) => {
      p.classList.remove('panel--active', 'panel--entering');
      p.style.display = 'none';
    });

    // Show target panel
    const target = document.getElementById('panel-' + tabId);
    if (target) {
      target.style.display = 'block';
      target.classList.add('panel--active', 'panel--entering');

      // Scroll to top
      window.scrollTo(0, 0);
      target.scrollTop = 0;
      var scroller = target.querySelector('.panel__scroll');
      if (scroller) scroller.scrollTop = 0;

      // Re-trigger animations
      setTimeout(() => {
        target.querySelectorAll('.anim').forEach((el) => {
          el.classList.remove('visible');
          void el.offsetWidth;
          el.classList.add('visible');
        });
      }, 50);
    }
  }

  // Bind all tab triggers
  tabs.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(el.dataset.tab);
    });
  });

  // --- Initial animations for home tab ---
  setTimeout(() => {
    document.querySelectorAll('#panel-home .anim').forEach((el) => {
      el.classList.add('visible');
    });
  }, 100);

  // --- Scroll-triggered animations (for panels with scrollable content) ---
  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
  );

  document.querySelectorAll('.anim').forEach((el) => animObserver.observe(el));

  // --- Phone carousel ---
  const slides = document.querySelectorAll('.carousel__slide');
  const dots = document.querySelectorAll('.carousel__dot');
  let current = 0;
  let carouselTimer;

  function goToSlide(index) {
    slides[current].classList.remove('carousel__slide--active');
    dots[current].classList.remove('carousel__dot--active');
    current = index;
    slides[current].classList.add('carousel__slide--active');
    dots[current].classList.add('carousel__dot--active');
  }

  function startCarousel() {
    carouselTimer = setInterval(() => {
      goToSlide((current + 1) % slides.length);
    }, 4000);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      clearInterval(carouselTimer);
      goToSlide(parseInt(dot.dataset.index));
      startCarousel();
    });
  });

  if (slides.length > 1) startCarousel();

  // --- Page-level mouse tracking (orbs + glow) ---
  const pageOrbs = document.querySelectorAll('.page-orb');
  const pageGlow = document.getElementById('page-glow');

  if (pageOrbs.length && window.matchMedia('(pointer: fine)').matches) {
    const speeds = [0.08, 0.12, 0.1];
    let glowX = 0, glowY = 0, targetX = 0, targetY = 0;
    let rafId = null;

    function updateGlow() {
      glowX += (targetX - glowX) * 0.15;
      glowY += (targetY - glowY) * 0.15;
      if (pageGlow) {
        pageGlow.style.left = glowX + 'px';
        pageGlow.style.top = glowY + 'px';
      }
      if (Math.abs(targetX - glowX) > 0.1 || Math.abs(targetY - glowY) > 0.1) {
        rafId = requestAnimationFrame(updateGlow);
      } else {
        rafId = null;
      }
    }

    document.addEventListener('mousemove', (e) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = e.clientX / vw - 0.5;
      const y = e.clientY / vh - 0.5;

      // Orbs drift slowly
      pageOrbs.forEach((orb, i) => {
        const speed = speeds[i] || 0.04;
        const moveX = x * vw * speed;
        const moveY = y * vh * speed;
        orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      // Glow follows cursor tightly
      targetX = e.clientX;
      targetY = e.clientY;
      if (pageGlow) pageGlow.style.opacity = '1';
      if (!rafId) rafId = requestAnimationFrame(updateGlow);
    });

    document.addEventListener('mouseleave', () => {
      pageOrbs.forEach((orb) => {
        orb.style.transform = 'translate(0, 0)';
      });
      if (pageGlow) pageGlow.style.opacity = '0';
    });
  }

  // --- Nav scroll shadow ---
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  }, { passive: true });

  // --- Form handling ---
  const heroForm = document.getElementById('hero-form');
  const ctaForm = document.getElementById('cta-form');
  const toast = document.getElementById('toast');

  function showToast() {
    toast.classList.add('toast--visible');
    setTimeout(() => toast.classList.remove('toast--visible'), 4000);
  }

  async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    const button = form.querySelector('button[type="submit"]');
    if (!email) return;

    const originalText = button.textContent;
    button.textContent = 'Joining...';
    button.disabled = true;

    try {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        await firebase.firestore().collection('waitlist').add({
          email, timestamp: firebase.firestore.FieldValue.serverTimestamp(), source: window.location.href,
        });
      }
      emailInput.value = '';
      showToast();
    } catch (err) {
      emailInput.value = '';
      showToast();
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  if (heroForm) heroForm.addEventListener('submit', handleSignup);
  if (ctaForm) ctaForm.addEventListener('submit', handleSignup);

})();
