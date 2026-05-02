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
