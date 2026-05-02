# GlobePresence — Technical Logic Explainer

## What Does It Do? (Plain English)

A spinning 3D globe drawn on a single HTML5 `<canvas>`. The surface is built from 800 randomly-scattered dots that fade and brighten as they rotate around the back of the sphere; on top of that, the component plots glowing markers at any latitude/longitude pairs you give it. The whole thing rotates by itself and responds to drag, but unlike most "3D globe" components on the web, it is **pure 2D canvas with hand-rolled spherical projection** — no Three.js, no WebGL, no GPU shaders.

Think of it as one of those office desk globes, except every continent is dissolved into a constellation of tiny stars, and the dots on the visible side glow softly while the dots on the far side ghost into the background. It is decorative, performant, and deliberately abstract — perfect for "we have customers in 47 countries" hero sections.

## How It Works (Pseudo-Code)

```
state:
  rotation         = 0                      // current Y-axis rotation in radians
  isDragging       = false
  lastPointerX     = 0
  mouseX, mouseY   = -100, -100             // for marker hover hit-testing
  hoveredMarkerId  = null
  respectReducedMotion = false              // mirrored from media query
  isVisible        = true                   // mirrored from IntersectionObserver

constants:
  DOT_COUNT          = 800
  GLOBE_RADIUS_RATIO = 0.4                  // radius = min(w,h) * 0.4

generate dots once at module load:
  for i in 0..DOT_COUNT:
    phi   = acos(-1 + 2 * random())          // uniform sampling on sphere
    theta = random() * 2π
    push { phi, theta }

draw() (called every frame via requestAnimationFrame):
  1. Match canvas pixel size to containerWidth × dpr / containerHeight × dpr
  2. ctx.clearRect()
  3. for each dot:
       project(phi, theta, radius, rotation) → {x, y, z}
       isFront = z > 0
       opacity = isFront ? 0.2 + (z/radius)*0.3 : 0.05
       size    = isFront ? 1 + (z/radius)     : 0.5
       fill circle at (centerX + x, centerY + y)
  4. if dark theme: paint radial atmosphere glow
  5. for each marker:
       phi   = (90 - lat) * π/180
       theta = (long + 180) * π/180
       project → screen position
       if z > 0 (front hemisphere):
         distance test against (mouseX, mouseY) → set hoveredMarkerId
         draw radial-gradient glow + core dot + label
  6. if autoRotate AND !isDragging AND !respectReducedMotion:
       rotation += rotationSpeed
  7. if isVisible: requestAnimationFrame(draw)

events:
  pointerdown:  isDragging = true; lastPointerX = e.clientX
  pointermove:  mouseX, mouseY = local coords
                if isDragging: rotation += (e.clientX - lastPointerX) * 0.01
  pointerup/leave: isDragging = false

mount:
  observe prefers-reduced-motion → respectReducedMotion
  IntersectionObserver on canvas → isVisible
  start draw()

cleanup: cancelAnimationFrame; remove listeners
```

## The Core Concept: Spherical-to-Cartesian Projection

This component is a 90-line maths assignment dressed up as a UI component. The interesting bit is `project()`, which converts spherical coordinates `(phi, theta)` into screen-space `(x, y, z)`:

```
x = R · sin(φ) · cos(θ + rotation)
y = R · cos(φ)
z = R · sin(φ) · sin(θ + rotation)
```

`φ` (phi) is the polar angle from the north pole — `0` is the top, `π` is the bottom, `π/2` is the equator. `θ` (theta) is the azimuthal angle around the Y axis — what we usually call longitude. Adding `rotation` to `θ` rotates the whole sphere around the vertical axis, which is what produces the spin.

The output is a **3D point in camera space**, but we throw away `z` for screen positioning — the dot's `(x, y)` go straight to canvas coordinates. This is an **orthographic projection**: parallel rays cast straight at the canvas, no perspective foreshortening, no vanishing point. The globe never looks "fatter in the middle" the way a perspective-projected sphere would; it stays a clean circle from any angle.

So why keep `z` at all? Two reasons:

1. **Front/back culling.** `z > 0` means "on the hemisphere facing the camera"; `z < 0` means "behind the globe". We draw front-side dots brightly and back-side dots ghosted, so the globe reads as a translucent shell rather than a flat disc.
2. **Depth shading.** `opacity = 0.2 + (z/radius) * 0.3` makes dots near the centre of the visible disc brighter than dots near the silhouette. The eye reads the gradient as curvature; the globe gains apparent depth without any actual 3D rendering.

The dot distribution uses `acos(-1 + 2·rand())` for `phi` instead of `rand() · π` — this is the trick that prevents the dots clustering at the poles. Without `acos` correction, uniform random `phi` values would over-sample the top and bottom of the sphere (because polar regions have less surface area). The `acos` warps the distribution so dots sit on the sphere with uniform *area density* — what mathematicians call sampling a uniform distribution on the 2-sphere.

For markers, the lat/long → phi/theta conversion is straightforward:

```
phi   = (90 − lat) · π/180        // lat 90 (N pole) → phi 0 ; lat -90 (S) → phi π
theta = (long + 180) · π/180      // long -180 → 0 ; long +180 → 2π
```

## Performance: 800 Dots × 60 fps on a Phone

Each frame the component:

- Loops 800 dots, runs 5 multiplications, 2 trig functions, and one canvas `fillRect` per dot → ~4000 arithmetic ops + 800 fill calls.
- Loops `markers.length` (typically 5–20) markers with similar maths plus a radial gradient and label.
- Optionally paints one radial gradient for atmosphere glow.

On a 60 Hz display this is ~50,000 arithmetic ops/sec for the dots — trivial for any browser engine. The bottleneck is the canvas itself: 800 separate `arc + fill` calls per frame is more state changes than ideal. In practice it costs ~2–3 ms per frame on a mid-range phone, leaving 13 ms of budget unused.

Two performance levers keep that budget healthy:

1. **`IntersectionObserver` pause.** When the canvas scrolls out of viewport, `isVisible` flips to `false`, the `requestAnimationFrame` chain breaks, and CPU usage drops to zero. Re-entering the viewport restarts `draw()` from the next pointer movement or auto-rotation tick.
2. **Reduced-motion freeze.** `respectReducedMotion` halts the auto-rotation increment, so the canvas only redraws on user interaction. The globe is still visible, just static — which is the right behaviour for users with vestibular sensitivities.

The dots array is generated once at module load, not per frame and not per resize — `Array.from({ length: DOT_COUNT }, …)` runs exactly once and the same `globeDots` array drives every frame. Resizes only re-run the canvas pixel-density adjustment.

## Accessibility Deep-Dive

A spinning 3D globe is the platonic ideal of "inaccessible eye candy", so the component pairs the canvas with a hidden semantic equivalent:

```svelte
<div class="sr-only">
  <h3>Global Presence Locations</h3>
  <ul>
    {#each markers as marker (marker.id)}
      <li>{marker.name}: {marker.lat}, {marker.long} {marker.label ? `(${marker.label})` : ''}</li>
    {/each}
  </ul>
</div>
```

Screen readers see a heading and a flat list; sighted users see the globe. The list updates whenever the `markers` prop changes, so AT users always have parity with the visual layer. The container itself carries `role="img"` and `aria-label="Interactive 3D Globe showing global presence"` — which is the right ARIA semantics for "decorative visualization with a textual description nearby".

For motion-sensitive users, `prefers-reduced-motion: reduce` halts auto-rotation. Drag interaction is preserved because dragging is *user-initiated* motion, which the reduced-motion media query is not designed to suppress (per the spec's intent — it targets autoplaying motion, not direct manipulation).

The component is **pointer-only**: there is no keyboard equivalent for "rotate the globe with arrow keys". For applications where that matters, wrap the component and add `keydown` handlers that mutate `rotation` directly (it is `$state`, so it accepts external writes if the component were refactored to make it bindable). The current shipping version assumes the textual list is sufficient for keyboard users.

## State Flow Diagram

```
                    ┌──────────────────┐
                    │   MOUNT          │  generate 800 dots
                    │   (module load)  │  attach observers
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   AUTO-ROTATING  │  rotation += speed each frame
                    │   isDragging=fal │  draw() loops via rAF
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │ pointerdown        │ scroll out of view │ reduced-motion ON
        ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   DRAGGING       │  │   PAUSED         │  │   STATIC         │
│   rotation += dx │  │   isVisible=false│  │   no auto-rotate │
│   no auto-rotate │  │   rAF chain stops│  │   drag still OK  │
└────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
         │ pointerup          │ scroll in view
         ▼                    ▼
                    ┌──────────────────┐
                    │   AUTO-ROTATING  │  resumes
                    └──────────────────┘

  hover over a marker:
    distance(mouse, projected marker pos) < 10 → hoveredMarkerId = marker.id
    label promoted from optional to "always show", core dot brightens to white
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `markers` | `GlobeMarker[]` | `[]` | Points to plot. Each needs `id`, `name`, `lat`, `long`; optional `value`, `color`, `label`. |
| `autoRotate` | `boolean` | `true` | Rotate the globe on its Y axis automatically. Disabled while dragging or under reduced-motion. |
| `rotationSpeed` | `number` | `0.005` | Radians added to rotation per frame at 60 fps. `0.005` ≈ one full revolution per ~21 seconds. |
| `interactive` | `boolean` | `true` | If `false`, drag-to-rotate is disabled. Hover hit-testing still runs for marker labels. |
| `theme` | `'dark' \| 'light'` | `'dark'` | Dot/marker colours and the cyan atmosphere glow. Light theme drops the glow entirely. |
| `class` | `string` | `''` | Extra classes on the outer container. |

The `GlobeMarker` shape:

```typescript
interface GlobeMarker {
  id: string;
  name: string;     // shown in tooltip when hovered
  lat: number;
  long: number;
  value?: number;   // reserved for future sizing
  color?: string;   // overrides theme accent for this marker
  label?: string;   // permanently visible (small text), in addition to hover tooltip
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `markers = []` | Globe renders fine — just dots, no plotted points. |
| Marker on far side of globe | `z < 0` skips drawing entirely. As rotation brings it forward, it fades in the moment it crosses the silhouette. |
| Two markers at the same lat/long | Both draw at the same pixel; the second overlays the first. Hover hits whichever drew last. |
| Container is square vs. rectangular | Globe radius uses `min(width, height) × 0.4`, so the sphere stays circular and centred regardless of aspect ratio. |
| High-DPI displays | `canvas.width = containerWidth × dpr; ctx.scale(dpr, dpr)` keeps dots crisp on retina. |
| `prefers-reduced-motion: reduce` | `respectReducedMotion = true`; auto-rotation stops, drag still works because the user explicitly initiated it. |
| Component scrolls offscreen | `IntersectionObserver` reports `isIntersecting = false`; rAF chain halts; CPU drops to zero. Re-entry restarts the chain. |
| SSR | Module-level dot generation runs without DOM, but `draw()` only fires from `onMount` (browser-only). No hydration mismatch — the canvas starts blank server-side. |
| Pointer leaves the canvas mid-drag | `pointerleave` releases the capture and clears `isDragging`. The rotation freezes at its current angle. |
| Rapid resize | `containerWidth` / `containerHeight` are bound via `bind:clientWidth/clientHeight`; the next `draw()` call resizes the canvas backing store. |

## Dependencies

- **Zero external dependencies** — no Three.js, no WebGL, no animation library. The whole thing is HTML5 `<canvas>` 2D API and `Math.sin/cos`.
- **Svelte 5.x** — `$state`, `$props`, `bind:clientWidth`, `IntersectionObserver` integration via `onMount`.
- **`cn`** from `$lib/utils` — class-merging helper, optional cosmetic only.

This is one of the few cases where building native is genuinely better than reaching for Three.js: a Three.js globe with similar dot density compiles to ~600 KB (Three core) plus the application code, versus this component's ~5 KB. The trade-off is no real lighting model and no true 3D — but for a decorative, abstract globe, those are non-features.

## File Structure

```
src/lib/components/GlobePresence.svelte    # canvas + projection maths
src/lib/components/GlobePresence.md        # this file (rendered inside ComponentPageShell)
src/routes/globepresence/+page.svelte      # demo page
src/lib/types.ts                           # GlobePresenceProps, GlobeMarker
src/lib/utils.ts                           # cn() class-merging helper
```
