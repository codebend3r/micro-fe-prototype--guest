import { useJerryStore } from '../store';

/**
 * Route 2 of 4. Local state in zustand. Leave for rick, come back, and the
 * scorecard is still here: the store lives in jerry's module, not in a page.
 */
export function Golf() {
  const strokes = useJerryStore((state) => state.strokes);
  const holes = useJerryStore((state) => state.holes);
  const swing = useJerryStore((state) => state.swing);
  const finishHole = useJerryStore((state) => state.finishHole);
  const resetRound = useJerryStore((state) => state.resetRound);

  const total = holes.reduce((sum, hole) => sum + hole, 0) + strokes;

  return (
    <>
      <div className="jerry-note">
        <strong>This scorecard is zustand state inside jerry</strong>
        <span>
          World unmounts jerry when you leave for rick or morty, but jerry's module stays loaded,
          so the round is still here when you come back. Compare rick's Lab counter, which is a{' '}
          <span className="jerry-mono">useState</span> and starts over.
        </span>
      </div>

      <div className="jerry-stats">
        <div className="jerry-stat">
          <span className="jerry-stat-label">hole</span>
          <span className="jerry-stat-value">{holes.length + 1}</span>
        </div>
        <div className="jerry-stat">
          <span className="jerry-stat-label">strokes this hole</span>
          <span className="jerry-stat-value">{strokes}</span>
        </div>
        <div className="jerry-stat">
          <span className="jerry-stat-label">round total</span>
          <span className="jerry-stat-value">{total}</span>
        </div>
      </div>

      <div className="jerry-row">
        <button type="button" className="jerry-btn jerry-btn-primary" onClick={swing}>
          Swing
        </button>
        <button type="button" className="jerry-btn" onClick={finishHole} disabled={strokes === 0}>
          Next hole
        </button>
        <button type="button" className="jerry-btn" onClick={resetRound} disabled={total === 0}>
          Reset round
        </button>
      </div>

      {!!holes.length && (
        <ul className="jerry-rows">
          {holes.map((hole, index) => (
            <li className="jerry-rowitem" key={index}>
              <span className="jerry-rowitem-name">Hole {index + 1}</span>
              <span className="jerry-rowitem-meta">
                {hole} stroke{hole === 1 ? '' : 's'}
              </span>
              <span />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
