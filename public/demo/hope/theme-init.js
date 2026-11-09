/*
 * Aplica o tema ANTES do primeiro paint (evita piscar claro/escuro).
 * Arquivo externo, e não <script> inline, para permitir uma CSP estrita na
 * nuvem (script-src 'self', sem 'unsafe-inline').
 * Lê o mesmo estado que src/app/ui-store.ts persiste em localStorage['hope-ui'].
 */
(function () {
  var theme = 'light';
  try {
    var raw = localStorage.getItem('hope-ui');
    var state = raw ? JSON.parse(raw).state || {} : {};
    if (location.pathname.indexOf('/tv') === 0) {
      theme = state.tvTheme === 'light' ? 'light' : 'dark';
    } else if (state.theme === 'dark' || state.theme === 'light') {
      theme = state.theme;
    } else if (state.theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch (e) {
    theme = 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
