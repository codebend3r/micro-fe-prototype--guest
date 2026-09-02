import { ROSTER, useJerryStore } from '../store';

/** Route 3 of 4. A list, also in zustand, with check in and check out. */
export function Jerryboree() {
  const checkedIn = useJerryStore((state) => state.checkedIn);
  const checkIn = useJerryStore((state) => state.checkIn);
  const checkOut = useJerryStore((state) => state.checkOut);

  const waiting = ROSTER.filter((name) => !checkedIn.includes(name));

  return (
    <>
      <div className="jerry-note">
        <strong>Jerryboree, a daycare for Jerrys</strong>
        <span>
          Nothing here touches world. The roster is jerry's own state, and the only thing that
          crosses the boundary on this page is the URL.
        </span>
      </div>

      {checkedIn.length ? (
        <ul className="jerry-rows" aria-label="checked in">
          {checkedIn.map((name) => (
            <li className="jerry-rowitem" key={name}>
              <span className="jerry-rowitem-name">{name}</span>
              <span className="jerry-rowitem-meta">checked in</span>
              <button type="button" className="jerry-btn" onClick={() => checkOut(name)}>
                Check out
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="jerry-empty">
          <strong>Nobody is here</strong>
          <span className="jerry-small">Every Jerry has been picked up.</span>
        </div>
      )}

      {!!waiting.length && (
        <div className="jerry-row">
          {waiting.map((name) => (
            <button
              type="button"
              className="jerry-btn"
              key={name}
              onClick={() => checkIn(name)}
            >
              Check in {name}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
