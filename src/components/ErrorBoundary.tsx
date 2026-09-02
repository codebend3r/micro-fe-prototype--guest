import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Jerry's own boundary. World has one too, but it cannot reach in here: a
 * render error thrown inside jerry's React root is only visible to jerry's
 * React, so containment is jerry's job.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="jerry-crash" role="alert">
        <strong>Caught by jerry's error boundary</strong>
        <code>{error.message}</code>
        <p className="jerry-small jerry-muted">
          Jerry renders in its own React root. World and the other remotes never saw this.
        </p>
        <button type="button" className="jerry-btn" onClick={() => this.setState({ error: null })}>
          Recover
        </button>
      </div>
    );
  }
}
