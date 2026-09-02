/**
 * Jerry's app. Four routes, all relative to whatever base world hands over,
 * so `/golf` here is `/jerry/golf` in the browser when mounted inside world
 * and `/golf` when running standalone.
 */
import { Link, Route, Router, Switch, useLocation, useRoute } from 'wouter';
import type { MountProps } from './host';
import { useHostState } from './use-host-state';
import { Home } from './pages/Home';
import { Golf } from './pages/Golf';
import { Jerryboree } from './pages/Jerryboree';
import { Complaints } from './pages/Complaints';

export function App({ store, bus, base }: MountProps) {
  return (
    // Jerry's own wouter. It reads the same window.location as world's, and
    // `base` tells it which prefix is world's business.
    <Router base={base}>
      <Pages store={store} bus={bus} />
    </Router>
  );
}

function Pages({ store, bus }: Pick<MountProps, 'store' | 'bus'>) {
  const state = useHostState(store);
  // Relative to the base, so this reads "/golf" not "/jerry/golf".
  const [location] = useLocation();

  return (
    <div className="jerry">
      <nav className="jerry-nav" aria-label="jerry">
        <NavLink href="/">Den</NavLink>
        <NavLink href="/golf">Golf</NavLink>
        <NavLink href="/jerryboree">Jerryboree</NavLink>
        <NavLink href="/complaints">Complaints</NavLink>
        <span className="jerry-pill">jerry sees {location}</span>
        <span className="jerry-pill">theme seen: {state.theme}</span>
      </nav>

      <Switch>
        <Route path="/">
          <Home state={state} />
        </Route>
        <Route path="/golf" component={Golf} />
        <Route path="/jerryboree" component={Jerryboree} />
        <Route path="/complaints">
          <Complaints store={store} bus={bus} state={state} />
        </Route>
        <Route>
          <div className="jerry-empty">
            <strong>jerry has no page at {location}</strong>
            <span className="jerry-small">Only /, /golf, /jerryboree and /complaints exist here.</span>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  const [active] = useRoute(href);
  return (
    <Link href={href} className="jerry-link" aria-current={active}>
      {children}
    </Link>
  );
}
