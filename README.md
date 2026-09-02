# micro-fe-prototype--guest

**jerry**, a guest remote for [micro-fe-prototype](https://github.com/codebend3r/micro-fe-prototype).
A proof of concept that the world shell can load a remote that was built, served and versioned
somewhere else entirely.

Jerry has four routes, its own React 19, wouter and zustand, and no dependency on anything in the
host repository. It exposes one thing over module federation: a `mount(el, props)` function.

| Route | What |
| --- | --- |
| `/` | Den: reads the user, theme and selection world owns |
| `/golf` | Scorecard in zustand, survives leaving and coming back |
| `/jerryboree` | A roster, also in zustand, only the URL crosses the boundary |
| `/complaints` | Emits on world's bus and flips world's theme through the store |

Mounted inside world, those are `/jerry`, `/jerry/golf`, and so on. Standalone they are just `/`
and `/golf`.

## Requirements

Bun 1.2 or newer, and Node 20 or newer to run Vite. Same as the host repo.

## Run it standalone

```bash
bun install
bun run dev        # http://localhost:5103, with HMR
bun run start      # build, then serve the built output on 5103
```

The standalone page boots a stand in for world, a plain store and bus with the same surface, and
drives the real `mount` function with it. That is the same code path world takes.

## Load it inside world

World knows nothing about jerry yet. Three small additions in the host repo wire it in, none of
which touch rick or morty.

**1. Register the remote** in `world/vite.config.ts`, next to rick and morty:

```ts
remotes: {
  rick:  { type: 'module', name: 'rick',  entry: remoteEntry('rick') },
  morty: { type: 'module', name: 'morty', entry: remoteEntry('morty') },
  jerry: { type: 'module', name: 'jerry', entry: 'http://localhost:5103/remoteEntry.js' },
},
```

For a deployed world, point `entry` at wherever this repo's build is hosted. Reading it from an
environment variable is the sensible next step, since teams rarely run every remote locally.

**2. Declare the module** in `world/src/remotes.d.ts`:

```ts
declare module 'jerry/mount' {
  export function mount(el: HTMLElement, props: Record<string, unknown>): () => void;
}
```

**3. Add the route** in `world/src/World.tsx`, beside the other two:

```tsx
const loadJerry = () => import('jerry/mount');
const jerryProps = { ...shared, base: '/jerry' };

// in the nav
{ href: '/jerry', label: 'Jerry' },

// in the switch
<Route path="/jerry" nest>
  <RemoteMount name="jerry" loader={loadJerry} props={jerryProps} />
</Route>
```

Then run both repos:

```bash
# this repo
bun run dev                 # jerry on :5103

# host repo
bun run dev                 # world :5100, rick :5101, morty :5102
```

Open http://localhost:5100/jerry. World fetches `http://localhost:5103/remoteEntry.js` and mounts
jerry into its slot. If jerry's server is down, world's slot shows a load failure and the rest of
the page keeps working.

## What jerry does and does not get

Jerry receives exactly what rick and morty receive: the session store, the bus, and a base path.
It types that contract for itself in `src/host.ts`, declaring only the fields it reads. It cannot
import `@mfe/shared-core`, `@mfe/session` or `@mfe/ui`, because those are workspace packages
linked from source inside the host repo, and it does not need to:

- **Store and bus** are plain objects. A `useSyncExternalStore` subscription is the whole bridge.
- **Theme** arrives through CSS custom properties cascading from world's `<html>`. Jerry's
  stylesheet reads `var(--accent)` and friends with a fallback for each, so it is themed by world
  when mounted and still fine on its own.
- **Styles** travel with the code. `mount` injects a `<style>` element once, so nothing depends on
  the host document having loaded anything. Every class is prefixed `jerry-` to stay out of
  world's way.

Two things jerry deliberately does not do:

- **It does not register with world's probe.** The probe lives on `globalThis.__MFE_PROBE__`
  and jerry could poke it directly, but that would couple this repo to an internal of the host.
  Jerry's script bytes still show up in the probe's per origin table, because that comes from the
  Resource Timing API and `Timing-Allow-Origin: *`.
- **It does not add to the selection.** The catalog of parts lives in the host repo. Jerry reads
  the selection and leaves writing it to rick.

## Deploying

`bun run build` bakes the origin into every chunk URL, because world resolves them from a page on
a different origin. Locally that is `http://localhost:5103/`. For a deployed copy:

```bash
JERRY_ORIGIN=https://jerry.example.com/ bun run build
```

Whatever serves `dist/` must send `Access-Control-Allow-Origin` for world's origin, since world
loads `remoteEntry.js` cross origin as a module script. Vite's dev and preview servers already do.
