/* El Paso Seismic Network — light / dark page.
 *
 * Loaded in <head>, before the page paints, so a visitor who chose dark
 * never sees a white flash. White is the default; the choice is kept in
 * localStorage. The button is wired once the page (and i18n.js) is loaded.
 */

const THEME_KEY = 'elpaso-theme';

(function applySavedTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* private mode */ }
  if (saved === 'dark') document.documentElement.dataset.theme = 'dark';
})();

const isDark = () => document.documentElement.dataset.theme === 'dark';

function setTheme(dark) {
  if (dark) document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* not fatal */ }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  // the button names the theme it switches TO, like the language button
  const paint = () => {
    btn.textContent = t(isDark() ? 'theme.toLight' : 'theme.toDark');
    btn.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
    btn.setAttribute('aria-label', t('theme.label'));
  };
  paint();
  onLangChange(paint);
  btn.addEventListener('click', () => { setTheme(!isDark()); paint(); });
});
