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

  function switchTab(tabId) {
    if (tabId === activeTab) return;
    activeTab = tabId;

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
