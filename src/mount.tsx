/**
 * Jerry's public surface, exposed to world as './mount'.
 *
 * This file is the entire contract between two repositories: give me a DOM
 * node and a bag of plain props, get back a function that tears everything
 * down. Jerry's React, wouter and zustand live on this side of the line.
 */
import { createRoot } from 'react-dom/client';
import type { MountProps } from './host';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import styles from './styles.css?inline';

const STYLE_ID = 'jerry-styles';

/**
 * Jerry cannot assume the host document has its stylesheet, so the styles
 * travel with the code and are injected once. A second mount finds the
 * element already there.
 */
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const element = document.createElement('style');
  element.id = STYLE_ID;
  element.textContent = styles;
  document.head.append(element);
}

export function mount(el: HTMLElement, props: MountProps) {
  ensureStyles();
  const root = createRoot(el);

  root.render(
    <ErrorBoundary>
      <App {...props} />
    </ErrorBoundary>,
  );

  return () => {
    // Deferred by one task. Unmounting a root synchronously from inside
    // another root's commit phase logs a warning.
    setTimeout(() => root.unmount(), 0);
  };
}
