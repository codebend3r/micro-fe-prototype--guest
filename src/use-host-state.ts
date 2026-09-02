import { useSyncExternalStore } from 'react';
import type { HostState, HostStore } from './host';

/**
 * Subscribes jerry's React to the store world owns. There is no context to
 * reach for: world's providers were created by a different copy of React and
 * are invisible from here. A plain subscription is the whole bridge.
 */
export function useHostState(store: HostStore): HostState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
