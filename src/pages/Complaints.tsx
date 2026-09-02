import { useActionState } from 'react';
import type { HostState, MountProps } from '../host';
import { type Complaint, useJerryStore } from '../store';

/**
 * Route 4 of 4. The one page that writes across the boundary: a complaint is
 * kept in jerry's store and announced on the bus world owns, and the theme
 * button calls a method on the store world owns. Both are plain functions
 * handed over at mount time, nothing more.
 */
export function Complaints({
  store,
  bus,
  state,
}: Pick<MountProps, 'store' | 'bus'> & { state: HostState }) {
  const complaints = useJerryStore((jerry) => jerry.complaints);
  const fileComplaint = useJerryStore((jerry) => jerry.fileComplaint);

  const [last, formAction] = useActionState(
    (_previous: Complaint | null, formData: FormData): Complaint | null => {
      const value = formData.get('text');
      const text = typeof value === 'string' ? value.trim() : '';
      if (!text) return null;
      const complaint = fileComplaint(text);
      bus.emit('jerry:complaint', { id: complaint.id, text });
      return complaint;
    },
    null,
  );

  const nextTheme = state.theme === 'dark' ? 'light' : 'dark';

  return (
    <>
      <div className="jerry-note">
        <strong>File a complaint and world hears it</strong>
        <span>
          Each one is emitted on the bus world created. World's probe panel logs it under{' '}
          <span className="jerry-mono">jerry:complaint</span>, and any remote could listen.
        </span>
        <form className="jerry-form" action={formAction}>
          <input
            className="jerry-input"
            name="text"
            aria-label="complaint"
            placeholder="Nobody respects me"
            autoComplete="off"
            required
          />
          <button type="submit" className="jerry-btn jerry-btn-primary">
            File it
          </button>
        </form>
        {last && (
          <span className="jerry-small" aria-live="polite">
            Filed #{last.id}.
          </span>
        )}
      </div>

      <div className="jerry-note">
        <strong>This button writes to state world owns</strong>
        <span>
          It calls <span className="jerry-mono">store.setTheme</span> on the object world passed
          in. World re renders its header, rick and morty see the new theme, and the CSS tokens
          cascade into jerry's DOM like everyone else's.
        </span>
        <div className="jerry-row">
          <button type="button" className="jerry-btn" onClick={() => store.setTheme(nextTheme)}>
            Switch world to {nextTheme}
          </button>
        </div>
      </div>

      {complaints.length ? (
        <ul className="jerry-rows" aria-label="complaints filed">
          {complaints.map((complaint) => (
            <li className="jerry-rowitem" key={complaint.id}>
              <span className="jerry-rowitem-name">{complaint.text}</span>
              <span className="jerry-rowitem-meta">#{complaint.id}</span>
              <span />
            </li>
          ))}
        </ul>
      ) : (
        <div className="jerry-empty">
          <strong>No complaints yet</strong>
          <span className="jerry-small">That will not last.</span>
        </div>
      )}
    </>
  );
}
