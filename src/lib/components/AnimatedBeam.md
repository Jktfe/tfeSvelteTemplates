# AnimatedBeam — Technical Logic Explainer

## What Does It Do? (Plain English)

AnimatedBeam draws a small network diagram — a handful of round nodes connected by lines — and animates each line so the dashes flow along it like packets of data travelling from one node to another. The whole thing is a single SVG with a fixed `viewBox`, so it scales crisply on any display, and every line of motion comes from one CSS keyframe animating the dash offset. There is no JavaScript animation loop, no canvas, no rAF.

It is the right component for system architecture diagrams, data pipelines, AI model fan-in/out illustrations, or anywhere a static network diagram could use a hint of life. Bidirectional connections animate in reverse so a return flow is visible alongside its outbound counterpart, and an optional gradient mode swaps the dashed line for a soft moving fade — the same trick, less marching-ants, more lava-lamp.

## How It Works (Pseudo-Code)

```
on render:
  read props: width, height, nodes[], connections[], beamColor, beamWidth,
              beamSpeed, bidirectional, gradient, nodeSize, nodeColor

  beamPaths = derived: for each connection in connections:
    sourceNode = nodes.find(n.id === conn.from)
    targetNode = nodes.find(n.id === conn.to)
    if either missing: warn and skip
    return { x1, y1, x2, y2, bidirectional }

  emit <svg viewBox="0 0 width height">
    if gradient: emit <linearGradient> with transparent → color → transparent stops
    <g class="beams">
      for each path in beamPaths (keyed by endpoints):
        <line x1 y1 x2 y2
              stroke={gradient ? url(#beam-gradient) : beamColor}
              stroke-width
              class="beam {bidirectional?}"
              style="--beam-duration: beamSpeed s" />
    <g class="nodes">
      for each node:
        <circle cx cy r={nodeSize} fill={nodeColor} />
        if node.label: <text> at (x, y - nodeSize - 8)

CSS:
  .beam {
    stroke-dasharray: 8 8;
    animation: beam-flow var(--beam-duration) linear infinite;
  }
  .beam.bidirectional {
    animation: beam-flow-reverse ...;
  }
  @keyframes beam-flow         { from {stroke-dashoffset: 100;} to {stroke-dashoffset: 0;}   }
  @keyframes beam-flow-reverse { from {stroke-dashoffset: 0;}   to {stroke-dashoffset: 100;} }
```

The component is almost entirely declarative: SVG geometry from props, dash animation from CSS. The only JavaScript work is the `$derived` that translates `connections[]` (id-pair references) into `beamPaths[]` (concrete coordinates) and warns about dangling connection references during development.

## The Core Concept: The Dashoffset Marching-Ants Trick

A dashed SVG line is rendered by alternating "dash" and "gap" segments along the stroke. CSS controls this via `stroke-dasharray`, which here is `8 8` (8 px dash, 8 px gap, repeating).

`stroke-dashoffset` shifts where the dash pattern starts. Imagine the pattern as a ruler that runs along the line — `dashoffset = 0` means the first dash starts at the line's origin; `dashoffset = 8` means the pattern is shifted 8 px back, so the first 8 px of the line is gap.

Animating `stroke-dashoffset` from `100` to `0` is what creates the "ants marching forward" illusion:

```
dashoffset = 100   →  ── ── ── ── ── ── ──
dashoffset = 92    →   ── ── ── ── ── ── ─
dashoffset = 84    →    ── ── ── ── ── ──
…
dashoffset = 0     →  ── ── ── ── ── ── ──
```

To the eye, individual dashes appear to slide along the line — but every dash is the same dash; only the start offset is changing. The pattern is *rendered* fresh by the GPU each frame off a single floating-point variable.

For bidirectional flows, the second beam runs the reverse keyframes (`0 → 100`), so two superimposed lines appear to flow in opposite directions. In gradient mode, the dashed pattern is swapped for a `<linearGradient>` whose stops are `transparent → colour → transparent`, and the same dashoffset animation now slides the *gradient* — producing a soft moving glow rather than discrete dashes.

```
   single connection                bidirectional
   ●────→────●                      ●←────●────→●

   gradient mode (single connection)
   ●  · · · ·●·  · · · ●            (bright spot travels along the line)
```

## CSS Animation Strategy

Two keyframes do all the visible work:

```css
.beam {
  stroke-dasharray: 8 8;
  stroke-linecap: round;        /* prettier dash ends */
  animation: beam-flow var(--beam-duration, 2s) linear infinite;
}

.beam.bidirectional {
  animation: beam-flow-reverse var(--beam-duration, 2s) linear infinite;
}

@keyframes beam-flow         { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0;   } }
@keyframes beam-flow-reverse { from { stroke-dashoffset: 0;   } to { stroke-dashoffset: 100; } }
```

Per-beam timing is set via the inline `--beam-duration` custom property, so the same CSS file serves any speed without a fresh keyframe per beam.

`prefers-reduced-motion: reduce` swaps the beam to a solid line:

```css
@media (prefers-reduced-motion: reduce) {
  .beam {
    animation: none;
    stroke-dasharray: none;     /* solid stroke */
  }
}
```

This is the right call for an architecture diagram — the *connection* still reads, just without the implied flow. Dark mode flips text fill on `.node-label` for legibility. Mobile (`max-width: 640px`) reduces the label font size from 14 px to 10 px so labels don't cover small node circles.

## State Flow Diagram

```
            ┌────────────────────────────┐
            │  props: nodes, connections │
            └──────────────┬─────────────┘
                           │ Svelte $derived recomputes
                           ▼
            ┌────────────────────────────┐
            │  beamPaths[]               │
            │  validated coordinate pairs│
            └──────────────┬─────────────┘
                           │ render
                           ▼
            ┌────────────────────────────┐
            │  static SVG + CSS keyframes│
            │  GPU animates dashes       │
            └──────────────┬─────────────┘
                           │
       props change?       │       prefers-reduced-motion: reduce
                           │
       ▼                                  ▼
       beamPaths re-derive        @media swap → solid lines, no animation
       SVG re-renders
       (animation continues from current dashoffset for stable beams)
```

There is no runtime state. The component is a pure projection of props through one derived array onto SVG.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `600` | SVG `viewBox` width. The component scales to its container; this sets the coordinate system. |
| `height` | `number` | `400` | SVG `viewBox` height. |
| `nodes` | `BeamNode[]` | `DEFAULT_BEAM_NODES_UNI` | Each node has `id`, `x`, `y`, optional `label`. Coordinates are in viewBox space. |
| `beamColor` | `string` | `'#3b82f6'` | Stroke colour for non-gradient beams. Also used as the gradient mid-stop. |
| `beamWidth` | `number` | `2` | Stroke width in viewBox pixels. |
| `beamSpeed` | `number` | `2` | Animation duration in seconds for one full dashoffset cycle. Lower = faster. |
| `bidirectional` | `boolean` | `false` | When true, *all* connections animate the reverse keyframes. Per-connection override is supported via `conn.bidirectional`. |
| `gradient` | `boolean` | `false` | Swaps the dashed stroke for a gradient that slides along the line. |
| `nodeSize` | `number` | `12` | Circle radius in viewBox pixels. |
| `nodeColor` | `string` | `'#3b82f6'` | Fill colour for node circles. |
| `connections` | `BeamConnection[]` | `DEFAULT_BEAM_CONNECTIONS_UNI` | Each connection has `from` (node id), `to` (node id), optional `bidirectional`. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Connection references missing node id | `console.warn` is emitted in development; the connection is silently dropped from `beamPaths`. The diagram still renders. |
| Two connections with identical endpoints | The keying `${x1}-${y1}-${x2}-${y2}` deduplicates them in the keyed `{#each}`. Pass distinct endpoints if you really want overlapping beams. |
| `nodes = []` | SVG renders empty. No errors. |
| Coordinates outside viewBox | Beams are clipped at the viewBox edge by `preserveAspectRatio="xMidYMid meet"`. Position your nodes inside the viewBox. |
| `beamSpeed = 0` | Browsers treat `animation-duration: 0s` as no animation; the dash pattern freezes at offset 100. The line still draws (statically dashed). |
| Very large `beamSpeed` (e.g. 60) | Beams crawl. Useful for ambient backdrops; verify the dashes don't read as broken lines at very slow speeds. |
| `prefers-reduced-motion: reduce` | Beams render as solid (un-dashed) lines. The diagram still communicates the connections, but the *flow* hint is removed. |
| Mobile viewport <640 px | Labels shrink to 10 px font. If labels still overlap their circles for short labels at small sizes, increase `nodeSize` or position labels manually using a separate `<text>`. |
| Dark mode | Labels flip to light text via `prefers-color-scheme: dark`. Beam and node colours remain — choose colours that work on both backgrounds, or pass theme-aware values. |

## Dependencies

- **Svelte 5** — `$props`, `$derived`. The derived array is the only runtime work the component does.
- **`$lib/types`** — `AnimatedBeamProps`, `BeamNode`, `BeamConnection` keep prop and data shapes consistent across the codebase.
- **`$lib/constants`** — `DEFAULT_BEAM_NODES_UNI` / `DEFAULT_BEAM_CONNECTIONS_UNI` give the component sensible default scenery.
- **Zero external libraries** — no charting library, no icon library. Pure SVG + CSS keyframes.

## File Structure

```
src/lib/components/AnimatedBeam.svelte        # implementation
src/lib/components/AnimatedBeam.md            # this explainer
src/lib/components/AnimatedBeam.test.ts       # unit tests
src/routes/animatedbeam/+page.svelte          # demo page
src/lib/types.ts                              # AnimatedBeamProps, BeamNode, BeamConnection
src/lib/constants.ts                          # DEFAULT_BEAM_* sample data
```
