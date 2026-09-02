/**
 * Standalone entry at http://localhost:5103. It drives the exact same
 * `mount(el, props)` contract world uses, against a stand in host, which is
 * what keeps the contract honest. World never loads this file; it loads
 * './mount'.
 */
import './standalone.css';
import { createStandaloneHost } from './host';
import { mount } from './mount';

const root = document.getElementById('root');
if (!root) throw new Error('jerry: no #root element to mount into');

root.className = 'standalone';
root.innerHTML = `
  <header class="standalone-head">
    <div>
      <div class="standalone-eyebrow">standalone</div>
      <h1>jerry without world</h1>
    </div>
    <span class="jerry-pill jerry-pill-accent">stand in host</span>
  </header>
  <section class="standalone-panel">
    <div id="mount-point"></div>
  </section>
`;

const mountPoint = document.getElementById('mount-point');
if (!mountPoint) throw new Error('jerry: no mount point');

const { store, bus } = createStandaloneHost();

// The stand in host applies the theme the way world does: on the <html>
// element, where the tokens in standalone.css read it.
store.subscribe((state) => {
  document.documentElement.dataset.theme = state.theme;
});

// Locally this page is served at the root of its own origin, so the base is
// empty. Deployed under a path prefix, the routes sit under it.
const base = new URL(import.meta.env.BASE_URL, window.location.href).pathname.replace(/\/$/, '');

mount(mountPoint, { store, bus, base });
