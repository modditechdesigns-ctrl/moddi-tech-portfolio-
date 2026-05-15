(function() {
  'use strict';

  // ========== CUSTOM CURSOR ==========
  const cursor = document.querySelector('.cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    document.body.style.cursor = 'none';
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const interactiveElements = document.querySelectorAll('a, button, .card, input, textarea, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (el.classList.contains('btn-primary') || el.classList.contains('btn-secondary')) {
          cursor.classList.add('on-button');
        } else {
          cursor.classList.add('on-link');
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('on-link', 'on-button');
      });
    });
  } else if (cursor) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  // ========== HEADER SCROLL EFFECT ==========
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ========== HERO PARALLAX SHAPES (desktop) ==========
  const heroShapes = document.querySelectorAll('.hero-decoration');
  if (heroShapes.length && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      heroShapes[0].style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      heroShapes[1].style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
    });
  }

  // ========== COUNTER ANIMATION ==========
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1500;
    const step = (timestamp) => {
      if (!el.startTime) el.startTime = timestamp;
      const progress = Math.min((timestamp - el.startTime) / duration, 1);
      const current = (target * progress).toFixed(target % 1 === 0 ? 0 : 1);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stat = entry.target;
        if (!stat.classList.contains('counted')) {
          stat.classList.add('counted');
          animateCounter(stat);
        }
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => counterObserver.observe(stat));

  // ========== ASSEMBLY ANIMATION ==========
  const assemblyContainer = document.getElementById('assembly');
  const tokens = document.querySelectorAll('.assembly-token');
  if (assemblyContainer && tokens.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tokens.forEach((token, i) => {
            setTimeout(() => token.classList.add('visible'), i * 120);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(assemblyContainer);
  }

  // ========== SCROLL REVEAL FOR SECTIONS ==========
  const hiddenSections = document.querySelectorAll('.section-hidden');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  hiddenSections.forEach(section => revealObserver.observe(section));

  // ========== SMOOTH SCROLL (respect reduced motion) ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    });
  });

  // ========== CONTACT FORM SUBMISSION (FIXED) ==========
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!email || !message) {
        formStatus.textContent = 'Please fill in all fields.';
        formStatus.className = 'form-status error';
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: new FormData(contactForm)
        });

        if (response.ok) {
          formStatus.textContent = 'Message sent successfully. We’ll be in touch soon.';
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          if (data.errors) {
            formStatus.textContent = data.errors.map(e => e.message).join(', ');
          } else {
            formStatus.textContent = 'Oops! Something went wrong. Please try again.';
          }
          formStatus.className = 'form-status error';
        }
      } catch (error) {
        formStatus.textContent = 'Network error. Please check your connection.';
        formStatus.className = 'form-status error';
      } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

})();