// Shared navigation and theme controls.
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('sideHustleTheme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;
  document.body.classList.toggle('dark-mode', shouldUseDark);

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const syncThemeButton = () => {
      const dark = document.body.classList.contains('dark-mode');
      themeToggle.textContent = dark ? 'Light' : 'Dark';
      themeToggle.setAttribute('aria-pressed', String(dark));
    };
    syncThemeButton();
    themeToggle.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('sideHustleTheme', dark ? 'dark' : 'light');
      syncThemeButton();
    });
  }
});
