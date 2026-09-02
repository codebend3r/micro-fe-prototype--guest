/**
 * What world hands a remote at mount time, as far as jerry is concerned.
 *
 * Jerry lives in a different repo, so it cannot import world's `@mfe/*`
 * packages and must not try. It declares the slice of the contract it actually
 * reads, and nothing more: a plain observable store, a plain event bus, and the
 * URL prefix world mounted it under. Anything else on those objects is ignored,
 * which is what lets world grow the contract without a jerry release.
 */

export type Theme = 'dark' | 'light';

export type SelectionItem = { sku: string; count: number };

export type HostState = {
  user: { name: string; role: string };
  theme: Theme;
  selection: SelectionItem[];
};

export type HostStore = {
  getState(): HostState;
  subscribe(listener: (state: HostState) => void): () => void;
  setTheme(theme: Theme): void;
};

export type HostBus = {
  on(type: string, handler: (detail: unknown) => void): () => void;
  emit(type: string, detail: unknown): void;
};

/** The props bag `mount(el, props)` receives. */
export type MountProps = {
  store: HostStore;
  bus: HostBus;
  base: string;
};

/**
 * A stand in for world, used only by the standalone page. It implements the
 * same surface with the same semantics, so running jerry on its own exercises
 * the real mount contract rather than a shortcut around it.
 */
export function createStandaloneHost(): { store: HostStore; bus: HostBus } {
  const bus = createStandaloneBus();

  let state: HostState = {
    user: { name: 'Beth Smith', role: 'Horse surgeon' },
    theme: 'dark',
    selection: [],
  };
  const listeners = new Set<(state: HostState) => void>();

  const store: HostStore = {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setTheme(theme) {
      state = { ...state, theme };
      listeners.forEach((listener) => listener(state));
      bus.emit('session:theme', { theme });
    },
  };

  return { store, bus };
}

function createStandaloneBus(): HostBus {
  const channels = new Map<string, Set<(detail: unknown) => void>>();

  return {
    on(type, handler) {
      const handlers = channels.get(type) ?? new Set();
      handlers.add(handler);
      channels.set(type, handlers);
      return () => {
        handlers.delete(handler);
      };
    },
    emit(type, detail) {
      // Standalone there is no probe panel to show these, so the console is it.
      console.info(`[bus] ${type}`, detail);
      channels.get(type)?.forEach((handler) => handler(detail));
    },
  };
}
