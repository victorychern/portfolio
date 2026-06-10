  const mobileTopBar = document.querySelector('.mobile-top-bar');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

  if (mobileTopBar && mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileTopBar.classList.toggle('is-open');

      const isOpen = mobileTopBar.classList.contains('is-open');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });
  }

  const HOVER_CTA_TEXT = 'ПОСМОТРЕТЬ ПРОЕКТ';
  const HOVER_CTA_TYPE_INTERVAL = 35;
  const HOVER_CTA_OFFSET = 16;

  document.querySelectorAll('.case-card-link').forEach((link) => {
    const cta = link.querySelector('.hover-cta');
    if (!cta) return;

    const textEl = cta.querySelector('.hover-cta-text');
    const dotsEl = cta.querySelector('.hover-cta-dots');
    const arrowEl = cta.querySelector('.hover-cta-arrow');

    let typeTimeoutId = null;

    function resetAnimation() {
      clearTimeout(typeTimeoutId);
      textEl.textContent = '';
      dotsEl.classList.remove('is-hidden');
      arrowEl.classList.remove('is-visible');
    }

    function typeNextChar(index) {
      textEl.textContent += HOVER_CTA_TEXT[index];
      if (index + 1 < HOVER_CTA_TEXT.length) {
        typeTimeoutId = setTimeout(() => typeNextChar(index + 1), HOVER_CTA_TYPE_INTERVAL);
      } else {
        dotsEl.classList.add('is-hidden');
        arrowEl.classList.add('is-visible');
      }
    }

    function moveTo(clientX, clientY) {
      cta.style.left = `${clientX + HOVER_CTA_OFFSET}px`;
      cta.style.top = `${clientY + HOVER_CTA_OFFSET}px`;
    }

    link.addEventListener('mouseenter', (event) => {
      resetAnimation();
      moveTo(event.clientX, event.clientY);
      typeTimeoutId = setTimeout(() => typeNextChar(0), HOVER_CTA_TYPE_INTERVAL);
    });

    link.addEventListener('mousemove', (event) => {
      moveTo(event.clientX, event.clientY);
    });

    link.addEventListener('mouseleave', resetAnimation);
  });
