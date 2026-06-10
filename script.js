fetch('sticky-top-menu.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('sticky-top-menu-placeholder').innerHTML = data;

    const mobileTopBar = document.querySelector('.mobile-top-bar');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileBackdrop = document.querySelector('.mobile-menu-backdrop');
    const mobileMenuLinks = document.querySelectorAll(
      '.mobile-dropdown-menu a'
    );

    if (!mobileTopBar || !mobileMenuToggle || !mobileBackdrop) return;

    function openMenu() {
      mobileTopBar.classList.add('is-open');
      document.body.classList.add('menu-open');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenuToggle.setAttribute('aria-label', 'Закрыть меню');
    }

    function closeMenu() {
      mobileTopBar.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
    }

    function toggleMenu() {
      const isOpen = mobileTopBar.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    }

    mobileMenuToggle.addEventListener('click', toggleMenu);

    mobileBackdrop.addEventListener('click', closeMenu);

    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    let lastScrollY = window.scrollY;
    const scrollThreshold = 10;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (mobileTopBar.classList.contains('is-open')) {
        mobileTopBar.classList.remove('is-hidden');
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY <= 20) {
        mobileTopBar.classList.remove('is-hidden');
      } else if (diff > scrollThreshold) {
        mobileTopBar.classList.add('is-hidden');
        lastScrollY = currentScrollY;
      } else if (diff < -scrollThreshold) {
        mobileTopBar.classList.remove('is-hidden');
        lastScrollY = currentScrollY;
      }
    });
  });

fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  });

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

document.querySelectorAll('.screen-switcher').forEach((switcher) => {
  const images = switcher.querySelectorAll('.screen-image');
  const interval = Number(switcher.dataset.interval) || 3000;
  let current = 0;

  if (images.length < 2) return;

  setInterval(() => {
    images[current].classList.remove('is-active');
    current = (current + 1) % images.length;
    images[current].classList.add('is-active');
  }, interval);
});

document.querySelectorAll('.before-after-slider').forEach((slider) => {
  const beforeImage = slider.querySelector('.before-image');
  const handle = slider.querySelector('.before-after-handle');

  function setPosition(percent) {
    percent = Math.min(100, Math.max(0, percent));
    beforeImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    handle.style.left = `${percent}%`;
  }

  function updateFromEvent(event) {
    const rect = slider.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    setPosition(((clientX - rect.left) / rect.width) * 100);
  }

  let dragging = false;

  slider.addEventListener('pointerdown', (event) => {
    dragging = true;
    updateFromEvent(event);
  });

  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    updateFromEvent(event);
  });

  window.addEventListener('pointerup', () => {
    dragging = false;
  });

  setPosition(50);
});
