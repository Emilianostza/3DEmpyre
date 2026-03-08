// Runs before React — prevents FOUC by applying saved theme immediately.
// Loaded as external script to comply with Content-Security-Policy (no unsafe-inline).
(function () {
  const t = localStorage.getItem('theme');
  if (t === 'light' || (!t && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.remove('dark');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#ffffff');
  }
})();
