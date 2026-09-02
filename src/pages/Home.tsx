import type { HostState } from '../host';

/** Route 1 of 4. Reads the state world owns and explains what jerry is. */
export function Home({ state }: { state: HostState }) {
  const selected = state.selection.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <div className="jerry-note">
        <h2>Jerry is a guest here</h2>
        <span>
          This remote was built and served from a different repository. World learned nothing
          about it beyond a URL to its <span className="jerry-mono">remoteEntry.js</span> and a
          route prefix. Everything on this side of the line, React, wouter and zustand included,
          arrived with jerry.
        </span>
      </div>

      <div className="jerry-note">
        <strong>What world handed over at mount time</strong>
        <dl className="jerry-kv">
          <dt>user</dt>
          <dd>
            {state.user.name}, {state.user.role}
          </dd>
          <dt>theme</dt>
          <dd>{state.theme}</dd>
          <dt>selection</dt>
          <dd>
            {selected} item{selected === 1 ? '' : 's'} in shared state
          </dd>
        </dl>
        <span className="jerry-small">
          Rick writes the selection and morty reads it. Jerry can read it too, through the same
          plain store object, because a subscription needs no shared React.
        </span>
      </div>
    </>
  );
}
