function initMobileMenu() {
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
}

fetch('sticky-top-menu.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('sticky-top-menu-placeholder').innerHTML = data;
    initMobileMenu();
  });

// --- Per-content init: re-run for the initial page load and after every
// pjax-style content swap (see navigation section at the bottom). ---

const REVEAL_STAGGER = 80;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeCleanups = [];

function registerCleanup(fn) {
  activeCleanups.push(fn);
}

function runCleanups() {
  activeCleanups.splice(0).forEach(fn => fn());
}

function revealContent(root) {
  Array.from(root.children).forEach((el, index) => {
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      return;
    }
    setTimeout(() => el.classList.add('is-visible'), index * REVEAL_STAGGER);
  });
}

function loadFooter(root) {
  const placeholder = root.querySelector('#footer-placeholder');
  if (!placeholder) return;

  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      placeholder.innerHTML = data;
    });
}

const HOVER_CTA_TEXT = 'ПОСМОТРЕТЬ ПРОЕКТ';
const HOVER_CTA_TYPE_INTERVAL = 35;
const HOVER_CTA_OFFSET = 16;

// Tracked globally (once) so it survives pjax content swaps and always
// reflects the real cursor position - some browsers fire a synthetic
// mouseenter with stale/zeroed coordinates right after the DOM under the
// cursor changes, which would otherwise place the badge at the top-left.
let lastMouseX = 0;
let lastMouseY = 0;
let hasMousePosition = false;

document.addEventListener('mousemove', (event) => {
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  hasMousePosition = true;
}, { passive: true });

function initHoverCta(root) {
  root.querySelectorAll('.case-card-link').forEach((link) => {
    const cta = link.querySelector('.hover-cta');
    if (!cta) return;

    const textEl = cta.querySelector('.hover-cta-text');
    const cursorEl = cta.querySelector('.hover-cta-cursor');
    const dotsEl = cta.querySelector('.hover-cta-dots');
    const arrowEl = cta.querySelector('.hover-cta-arrow');

    let typeTimeoutId = null;

    function resetAnimation() {
      clearTimeout(typeTimeoutId);
      textEl.textContent = '';
      dotsEl.classList.remove('is-hidden');
      arrowEl.classList.remove('is-visible');
      cursorEl.classList.remove('is-visible');
    }

    function typeNextChar(index) {
      textEl.textContent += HOVER_CTA_TEXT[index];
      if (index + 1 < HOVER_CTA_TEXT.length) {
        typeTimeoutId = setTimeout(() => typeNextChar(index + 1), HOVER_CTA_TYPE_INTERVAL);
      } else {
        dotsEl.classList.add('is-hidden');
        cursorEl.classList.remove('is-visible');
        arrowEl.classList.add('is-visible');
      }
    }

    function moveTo(clientX, clientY) {
      cta.style.left = `${clientX + HOVER_CTA_OFFSET}px`;
      cta.style.top = `${clientY + HOVER_CTA_OFFSET}px`;
    }

    link.addEventListener('mouseenter', (event) => {
      resetAnimation();
      const x = hasMousePosition ? lastMouseX : event.clientX;
      const y = hasMousePosition ? lastMouseY : event.clientY;
      moveTo(x, y);
      cursorEl.classList.add('is-visible');
      typeTimeoutId = setTimeout(() => typeNextChar(0), HOVER_CTA_TYPE_INTERVAL);
    });

    link.addEventListener('mousemove', (event) => {
      moveTo(event.clientX, event.clientY);
    });

    link.addEventListener('mouseleave', resetAnimation);
  });
}

function initScreenSwitchers(root) {
  root.querySelectorAll('.screen-switcher').forEach((switcher) => {
    const images = switcher.querySelectorAll('.screen-image');
    const interval = Number(switcher.dataset.interval) || 3000;
    let current = 0;

    if (images.length < 2) return;

    const intervalId = setInterval(() => {
      images[current].classList.remove('is-active');
      current = (current + 1) % images.length;
      images[current].classList.add('is-active');
    }, interval);

    registerCleanup(() => clearInterval(intervalId));
  });
}

function initBeforeAfterSliders(root) {
  root.querySelectorAll('.before-after-slider').forEach((slider) => {
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

    function onPointerDown(event) {
      dragging = true;
      updateFromEvent(event);
    }

    function onPointerMove(event) {
      if (!dragging) return;
      updateFromEvent(event);
    }

    function onPointerUp() {
      dragging = false;
    }

    slider.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    registerCleanup(() => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    });

    setPosition(50);
  });
}

function initContent(root) {
  runCleanups();
  loadFooter(root);
  initHoverCta(root);
  initScreenSwitchers(root);
  initBeforeAfterSliders(root);
  revealContent(root);
}

const contentContainer = document.querySelector('.content-container');
if (contentContainer) {
  initContent(contentContainer);
}

// --- Pjax-style navigation: swap only .content-container so the menu
// stays put and the new page fades/reveals in like the initial load. ---

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function isInternalPageLink(link) {
  if (!link || !link.href) return false;
  if (link.target === '_blank' || link.hasAttribute('download')) return false;
  if (link.origin !== window.location.origin) return false;
  if (!link.pathname.endsWith('.html')) return false;
  return true;
}

function navigateTo(url, push) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newContent = doc.querySelector('.content-container');

      if (!newContent || !contentContainer) {
        window.location.href = url;
        return;
      }

      contentContainer.classList.add('is-leaving');

      setTimeout(() => {
        contentContainer.innerHTML = newContent.innerHTML;
        document.title = doc.title;

        if (push) {
          history.pushState({}, '', url);
        }

        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        window.scrollTo(0, 0);
        contentContainer.classList.remove('is-leaving');
        initContent(contentContainer);
      }, 200);
    })
    .catch(() => {
      window.location.href = url;
    });
}

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a');
  if (!isInternalPageLink(link)) return;
  if (link.pathname === window.location.pathname) return;

  event.preventDefault();
  navigateTo(link.pathname + link.search, true);
});

window.addEventListener('popstate', () => {
  navigateTo(window.location.pathname, false);
});
