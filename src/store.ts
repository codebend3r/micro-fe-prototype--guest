import { create } from 'zustand';

/**
 * Jerry's own client state, in zustand, never handed across the boundary.
 *
 * The store is module scoped inside jerry's bundle. World unmounts jerry when
 * the URL leaves `/jerry`, but the module stays loaded, so this state survives
 * a trip to rick and back. That is a different lifetime from `useState` in a
 * page, which is reset every time the page mounts, and the golf scorecard is
 * here to make the difference visible.
 */

export type Complaint = { id: number; text: string; filedAt: string };

export type JerryState = {
  /** Strokes on the current hole. */
  strokes: number;
  /** Strokes on each finished hole, in order. */
  holes: number[];
  /** Which Jerrys are checked in at the daycare. */
  checkedIn: string[];
  complaints: Complaint[];

  swing(): void;
  finishHole(): void;
  resetRound(): void;
  checkIn(name: string): void;
  checkOut(name: string): void;
  fileComplaint(text: string): Complaint;
};

/** Every Jerry the daycare has on file. */
export const ROSTER = ['Jerry C-137', 'Jerry J19ζ7', 'Jerry C-500A', 'Jerry K-22', 'Jerry D-99'];

let nextComplaintId = 1;

export const useJerryStore = create<JerryState>((set, get) => ({
  strokes: 0,
  holes: [],
  checkedIn: [ROSTER[0]],
  complaints: [],

  swing: () => set((state) => ({ strokes: state.strokes + 1 })),

  finishHole: () =>
    set((state) => {
      if (state.strokes === 0) return state;
      return { strokes: 0, holes: [...state.holes, state.strokes] };
    }),

  resetRound: () => set({ strokes: 0, holes: [] }),

  checkIn: (name) =>
    set((state) => {
      if (state.checkedIn.includes(name)) return state;
      return { checkedIn: [...state.checkedIn, name] };
    }),

  checkOut: (name) =>
    set((state) => ({ checkedIn: state.checkedIn.filter((entry) => entry !== name) })),

  fileComplaint: (text) => {
    const complaint = { id: nextComplaintId++, text, filedAt: new Date().toISOString() };
    set({ complaints: [complaint, ...get().complaints] });
    return complaint;
  },
}));
