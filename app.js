/* ==========================================================
   app.js: Theme toggle, Mobile Menu, GSAP Animations
   ========================================================== */
const API_BASE_URL = 'https://portfolio-backend-t7so.onrender.com' || 'http://localhost:5000';
document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Lucide Icons
  lucide.createIcons();

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel) => [...document.querySelectorAll(sel)];

  /* ---------- Theme Toggle Logic ---------- */
  const themeBtn = document.getElementById('theme-toggle');

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  /* ---------- Mobile Menu Logic ---------- */
  const mobileToggleBtn = document.getElementById('mobile-toggle');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileLinks = $('.mobile__link');
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    mobileOverlay.classList.toggle('is-active', isMenuOpen);
    mobileToggleBtn.classList.toggle('is-open', isMenuOpen);

    // Lock background scroll when menu is open
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleMenu);
  }

  mobileLinks.forEach(link => link.addEventListener('click', () => {
    if (isMenuOpen) toggleMenu();
  }));

  /* ---------- GSAP Scroll Animations ---------- */
  if (!reducedMotion && typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // Standard Setup (Mobile & Desktop)
    mm.add("all", () => {

      // Hero Timeline
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl.fromTo('.nav', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo('.hero__word', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.15 }, "-=0.4")
        .fromTo('.hero__sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .fromTo('.hero__actions .btn', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.6");

      // Titles
      $('.title').forEach((title) => {
        gsap.fromTo(title,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        );
      });

      // Text & Timeline Reveal
      $('.reveal-text').forEach((el) => {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        );
      });

      // Skills Reveal
      gsap.fromTo('.skill-tag',
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out',
          scrollTrigger: { trigger: '.skills__grid', start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );

      // Projects Block Reveal
      $('.project').forEach((proj) => {
        gsap.fromTo(proj,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: proj, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        );
      });

      // Contact Grid Blocks (Left info, Right form)
      gsap.fromTo('.contact__info',
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact__grid', start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );
      gsap.fromTo('.contact__form-wrapper',
        { x: 30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.contact__grid', start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );
    });

    // Desktop Only Image Parallax
    mm.add("(min-width: 900px)", () => {
      $('.project__media img').forEach((img) => {
        gsap.fromTo(img,
          { yPercent: -10 },
          {
            yPercent: 10, ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        );
      });
    });
  }


  /* ---------- Contact Form Handling ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector('.form__status');

      if (!form.checkValidity()) {
        status.textContent = 'Please fill in every field and use a valid email address.';
        status.style.color = '#ef4444';
        form.reportValidity();
        return;
      }

      const formData = Object.fromEntries(new FormData(form));

      try {
        // Send data to your new backend route
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          status.style.color = 'var(--accent)';
          status.textContent = 'Message sent successfully! I will get back to you soon.';
          form.reset();
        } else {
          throw new Error('Failed to send');
        }
      } catch (error) {
        status.style.color = '#ef4444';
        status.textContent = 'Server error. Please try again later or email me directly.';
      }
    });
  }

  // Refresh ScrollTrigger calculations after everything loads
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });

});
