(function() {
  'use strict';

  // ========== MOBILE MENU TOGGLE ==========
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open');
      mobileMenuBtn.classList.toggle('active');
      mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
      
      // Prevent body scroll when menu open
      document.body.style.overflow = isOpen ? 'auto' : 'hidden';
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-header')) {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // ========== HEADER SCROLL EFFECT ==========
  const header = document.getElementById('header');
  let headerTicking = false;

  const updateHeaderOnScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    headerTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!headerTicking) {
      window.requestAnimationFrame(updateHeaderOnScroll);
      headerTicking = true;
    }
  }, { passive: true });

  // ========== HERO PARALLAX SHAPES (desktop only) ==========
  const heroShapes = document.querySelectorAll('.hero-decoration');
  const isDesktop = window.matchMedia('(min-width: 769px) and (pointer: fine)').matches;

  if (heroShapes.length && isDesktop) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      if (heroShapes[0]) heroShapes[0].style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      if (heroShapes[1]) heroShapes[1].style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
    }, { passive: true });
  }

  // ========== COUNTER ANIMATION ==========
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1500;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuad = 1 - Math.pow(1 - progress, 2);
      const current = (target * easeOutQuad).toFixed(target % 1 === 0 ? 0 : 1);
      
      el.textContent = current + suffix;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    
    window.requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const stat = entry.target;
        if (!stat.classList.contains('counted')) {
          stat.classList.add('counted');
          // Stagger animations
          setTimeout(() => animateCounter(stat), index * 100);
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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ 
          behavior: prefersReducedMotion ? 'auto' : 'smooth' 
        });
      }
    });
  });

  // ========== CONTACT FORM SUBMISSION ==========
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      // Validation
      if (!email || !message) {
        showFormError('Please fill in all fields.');
        return;
      }

      if (!isValidEmail(email)) {
        showFormError('Please enter a valid email address.');
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
          formStatus.textContent = 'Message sent successfully! We\'ll be in touch soon.';
          formStatus.className = 'form-status success';
          contactForm.reset();
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
          }, 5000);
        } else {
          const data = await response.json().catch(() => ({}));
          if (data.errors) {
            showFormError(data.errors.map(e => e.message).join(', '));
          } else {
            showFormError('Something went wrong. Please try again.');
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        showFormError('Network error. Please check your connection.');
      } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });

    // Clear error messages on input
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (formStatus.classList.contains('error')) {
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }
      });
    });
  }

  function showFormError(message) {
    formStatus.textContent = message;
    formStatus.className = 'form-status error';
    formStatus.focus();
  }

  // Simple email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ========== PREVENT LAYOUT SHIFT ON SCROLL ==========
  if (window.innerWidth > 768) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
    }
  }

  // ========== WINDOW RESIZE HANDLER ==========
  window.addEventListener('resize', () => {
    // Reset menu state on resize
    if (window.innerWidth > 768 && mobileMenu) {
      mobileMenu.classList.remove('open');
      mobileMenuBtn.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

})();
