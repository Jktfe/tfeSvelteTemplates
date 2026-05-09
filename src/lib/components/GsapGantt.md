# GsapGantt — Technical Logic Explainer

## What Does It Do? (Plain English)

A GSAP-driven sibling of the native `Gantt` component. Same `GanttTask[]` data shape — drop-in compatible at the prop boundary — but the entrance animation is staged by `gsap.timeline()`: bars draw from left to right with a stagger, milestones pop with a soft overshoot, dependency arrows fade in once the bars they connect have landed. The static state (axis, weekend bands, today line, labels) is identical to the native Gantt; the difference is purely the cinematic entrance.

Pick this variant when your design system already speaks GSAP and you want the schedule to feel like a single composed reveal rather than appear instantly.

## How It Works (Pseudo-Code)

```
state:
  played = false
  prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches

derived:
  same chartStart / chartEnd / totalDays / layouts / dependencyArrows / weekendBands as native Gantt

on mount:
  loadGsap → gsapInstance
  if prefersReduced or no IntersectionObserver: played = true; bail
  observer = IntersectionObserver(threshold: 0.15)
  on first intersect: play(); observer.disconnect()

play():
  bars       = rect.gg-bar nodes
  milestones = .gg-milestone polygon nodes
  arrows     = path.gg-dependency nodes
  tl = gsap.timeline()
  tl.fromTo(bars,
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: 0.55, ease: 'power3.out',  stagger: { each: 0.06 } }, 0)
  tl.fromTo(milestones,
    { scale: 0, transformOrigin: 'center center' },
    { scale: 1, duration: 0.45, ease: 'back.out(1.7)', stagger: { each: 0.08 } }, 0.15)
  tl.fromTo(arrows,
    { opacity: 0 },
    { opacity: 1, duration: 0.4, ease: 'power2.out',  stagger: { each: 0.04 } }, 0.45)
```

## The Core Concept: Bars Draw, Milestones Pop, Arrows Connect

The visual "story" the timeline tells:

1. **Bars draw left → right** via `scaleX: 0 → 1` with `transform-origin: left center`. Stagger 0.06s, ease `power3.out`. The bars look like they're being painted in over their date ranges. This reads as *plan being committed to the calendar*.
2. **Milestones pop** with `back.out(1.7)` overshoot, scale `0 → 1`, stagger 0.08s. They land slightly after their bars have started drawing. The overshoot is what makes them feel like *events*, not just shapes.
3. **Dependency arrows fade in** at +0.45s — that's roughly when the first wave of bars has landed and you can see what's connected to what. Stagger 0.04s. They feel like *consequences emerging from cause*.

Critically, the **static context** (axis labels, weekend bands, today line) **does not animate**. Adding entrance animation to those would fight the bars for attention and turn an editorial reveal into noise. The grid is the stage; the bars are the performers.

## State Flow Diagram

```
              ┌──────────────────────────────┐
              │  tasks prop                   │
              └────────────┬─────────────────┘
                           │
                           ▼
              ┌──────────────────────────────┐
              │  derive layouts (one per task) │
              │  derive weekendBands           │
              │  derive dependencyArrows       │
              │  render labels + axis + bars  │
              │  + milestones + arrows         │
              └────────────┬─────────────────┘
                           │
                           ▼
              ┌──────────────────────────────┐
              │  onMount → loadGsap          │
              │  IO observe rootEl @0.15     │
              └────────────┬─────────────────┘
                           │  on first intersect
                           ▼
              ┌──────────────────────────────┐
              │  play() (one-shot)           │
              │   gsap.timeline:              │
              │     bars:       scaleX 0→1  │
              │     milestones: scale 0→1   │
              │       (back.out overshoot)  │
              │     arrows:     opacity 0→1 │
              │   played = true; disconnect │
              └──────────────────────────────┘
```

## Props Reference

Mirrors the native `Gantt` props exactly — see `Gantt.md` for the table. The only differences in `GsapGanttProps` vs `GanttProps`:

- The default `ariaLabel` is `'GSAP Gantt chart'` (was `'Gantt chart'`).
- No additional props — the timing of the entrance is internal (`stagger: 0.06` for bars etc.) and not exposed. This is intentional — the entrance is a fixed motion vocabulary that ties the suite together.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `prefers-reduced-motion: reduce` | Neither gsap nor IO fire. Everything renders in the assembled state instantly. |
| Scrolled past chart and back | Doesn't replay — `played` is one-shot. |
| Empty `tasks` array | Renders the empty wrapper + axis; no bars to animate; the timeline never runs. |
| Per-task `color` set | Inline `fill` overrides the gsap-driven scaleX / scale (gsap doesn't touch fill). |
| Dependency targets missing | Same as native Gantt — silently dropped; no arrow rendered. |
| Multiple instances on one page | Per-instance `arrowheadId` (random suffix) prevents SVG `<marker>` collisions. |

## Distinct From Native `Gantt`

| Concern | `Gantt` (native) | `GsapGantt` (this) |
|---------|-------------------|---------------------|
| Entrance | Bars/milestones/arrows render statically (no animation) | gsap.timeline composes bar draw + milestone pop + arrow fade |
| Engine | None | gsap core |
| Trigger | n/a | IntersectionObserver one-shot |
| Use when | Screenshot-grade static schedule | Editorial reveal — schedule feels composed in |

Same prop interface, so substitutable at the call site.

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$props`, `onMount`.
- **`gsap` core** (already a project dep) — drives the entrance timeline. No GSAP business plugins.
- **`IntersectionObserver`** — native scroll trigger; universally supported.

## File Structure

```
src/lib/components/GsapGantt.svelte    # implementation
src/lib/components/GsapGantt.md        # this file
src/lib/components/GsapGantt.test.ts   # vitest unit + behaviour tests
src/lib/types.ts                       # GsapGanttProps (shares GanttTask)
```
