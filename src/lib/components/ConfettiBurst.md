---
name: ConfettiBurst
category: Animation & Effects
author: antclaude
status: shipped
---

# ConfettiBurst

Trigger-fired celebration particle burst. Mount once anywhere on the page; call `fire()` imperatively when a moment deserves celebration — successful submit, level-up, hold-to-confirm completion, payment received. Canvas-rendered for 60fps even at high particle counts; the DOM stays empty while idle.

Pairs naturally with `HoldToConfirm` (release confirmed → burst), `AlertBanner` ("payment received" + burst), and any optimistic-UI success state. Distinct from passive ambient effects like `AuroraBackdrop` — ConfettiBurst is event-driven and transient. Distinct from `Marquee` / `TickerTape` — those are continuous; this is a one-shot punctuation.

## Key features

- **Imperative `fire(opts?)` method** — `bind:this` exposes a single method. Call from any event handler. Per-shot `opts` can override `origin` and `palette` without re-mounting.
- **`onComplete` callback** — fires when the burst finishes (or immediately under reduced motion). Drives the consumer's next step in a sequence.
- **Configurable** — `count` [10, 500], `spread` [0, 180]°, `velocity`, `gravity`, `duration` [200, 5000] ms, `palette`, `origin` (`'center'` or `{ x, y }`).
- **Canvas-only-while-firing** — the `<canvas>` element only mounts during a burst and unmounts on completion. Zero DOM cost while idle.
- **Reduced-motion bypass** — `prefers-reduced-motion: reduce` causes `fire()` to call `onComplete` synchronously and skip rendering. The contract is preserved; only the visual transition is removed.
- **Pure-physics helpers** — `generateParticles`, `stepParticle`, `mulberry32` are exported from the module script and are deterministic given a seed. Unit-testable without a canvas or rAF.

## Usage

```svelte
<script>
	import ConfettiBurst from '$lib/components/ConfettiBurst.svelte';

	let burst;
	function celebrate() {
		burst.fire();
	}
</script>

<ConfettiBurst bind:this={burst} />
<button onclick={celebrate}>Submit</button>
```

Per-shot origin override (burst from the click point):

```svelte
<button
	onclick={(e) =>
		burst.fire({ origin: { x: e.clientX, y: e.clientY } })}
>
	Boom from cursor
</button>
```

## Props

| Prop         | Type                                | Default        | Notes                                                          |
| ------------ | ----------------------------------- | -------------- | -------------------------------------------------------------- |
| `count`      | `number`                            | `80`           | Clamped to `[10, 500]` — non-finite falls back to `80`.        |
| `spread`     | `number`                            | `70`           | Degrees, clamped `[0, 180]`. 0 = narrow upward cone, 180 = omni. |
| `velocity`   | `number`                            | `800`          | Pixels per second initial speed (randomised ±45%).             |
| `gravity`    | `number`                            | `1500`         | Pixels per second² downward acceleration.                       |
| `duration`   | `number`                            | `1800`         | Milliseconds, clamped `[200, 5000]`.                            |
| `palette`    | `readonly string[]`                 | rainbow        | Falls back to `DEFAULT_PALETTE` if empty.                      |
| `origin`     | `'center' \| { x, y }`              | `'center'`     | Viewport coordinates. `'center'` resolves to viewport centre. |
| `onComplete` | `() => void`                        | no-op          | Fires on finish (or immediately under reduced motion).         |
| `ariaLabel`  | `string`                            | `'Celebration'`| Decorative — the canvas is `aria-hidden="true"`.              |
| `class`      | `string`                            | `''`           | Extra classes on the canvas element.                           |

## Imperative API

`bind:this={burst}` exposes:

```ts
burst.fire(opts?: {
  origin?: 'center' | { x: number; y: number };
  palette?: readonly string[];
}): void;
```

Per-shot opts override the corresponding prop for that single burst. They do not mutate the component's props.

## Pure helpers (module-script exports)

- `clampCount(n)` — `[10, 500]` envelope, floors decimals.
- `clampDuration(n)` — `[200, 5000]` ms envelope.
- `clampSpread(n)` — `[0, 180]`° envelope.
- `parseOrigin(origin, w, h)` — resolves `'center'` / `{ x, y }` into absolute coordinates with safe fallback to centre.
- `mulberry32(seed)` — small fast PRNG returning `() => number` in `[0, 1)`.
- `generateParticles(opts)` — given `count`, `palette`, `origin`, `spread`, `velocity`, `seed?`, returns deterministic particle list.
- `stepParticle(p, dtSec, gravity, elapsedMs, totalMs)` — pure single-frame physics step. Returns a new particle.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Distinct from

- **`AuroraBackdrop`** — passive ambient surface, runs continuously. ConfettiBurst is event-driven and transient.
- **`Marquee` / `TickerTape`** — continuous scroll. ConfettiBurst is one-shot punctuation.
- **`HoldToConfirm`** — gesture primitive that decides *whether* something should happen. ConfettiBurst is the celebration *after* it does.
- **A toast** — toasts carry a textual message; ConfettiBurst is purely visual punctuation. Often used together.

## Accessibility

- The `<canvas>` is `aria-hidden="true"` because the burst is decorative — the semantic event ("payment received", "submitted", "confirmed") must be signalled by the consumer's own UI (toast, banner, aria-live region).
- Under `prefers-reduced-motion: reduce`, `fire()` calls `onComplete` immediately and skips the canvas mount entirely. The contract is preserved; the consumer's success indication still runs.

## Performance

- Canvas only mounts during a burst — zero DOM cost while idle.
- One `requestAnimationFrame` loop per active burst. ~80 particles × 60 fps ≈ 4800 draw calls/sec, well under the GPU budget.
- All physics live in pure functions — no allocation churn beyond particle list per frame.
- Helpers run in pure-function land for unit testing without a DOM.

## Recipes

- **Submit-then-burst**: `onsubmit={async () => { await save(); burst.fire(); }}`
- **Burst from click point**: `onclick={(e) => burst.fire({ origin: { x: e.clientX, y: e.clientY } })}`
- **Themed palette per moment**: `burst.fire({ palette: ['#10b981', '#34d399'] })` (greens for "done"), `burst.fire({ palette: ['#f87171', '#fb7185'] })` (reds for "high score").
- **Hold-to-confirm release → celebrate**: combine with `HoldToConfirm`'s `onConfirm` callback.
