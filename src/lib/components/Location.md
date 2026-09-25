# MapLocateMe — Technical Logic Explainer

## What Does It Do? (Plain English)

A map with a single button labelled with a crosshair icon. Tap it, the browser asks for permission to read your location, and — if you grant it — the map pans and zooms to where you are, drops a pulsing blue dot, and draws a translucent circle showing how confident the GPS is in that position. Optionally, the dot keeps following you as you move.

Think of it as the "you are here" arrow on a shopping centre map, except the arrow knows where you actually are because the browser asks the device for GPS, Wi-Fi, or cell-tower triangulation results. The accuracy circle is honesty in cartographic form: a tight 5-metre ring outdoors with GPS, a fuzzy 500-metre ring indoors on Wi-Fi alone.

## How It Works (Pseudo-Code)

```
state:
  isLocating       = false
  hasLocation      = false
  locationError    = null            // user-facing message
  currentLocation  = null            // GeolocationResult on success
  watchId          = undefined       // for clearWatch()
  isGeolocationSupported = $derived(isBrowser && 'geolocation' in navigator)

mount ($effect):
  1. await loadLeaflet() — one shared import('leaflet') per page (SSR-safe)
     bail out if the component unmounted while it loaded
  2. Read prefers-reduced-motion to gate Leaflet animations
  3. Create map, attach OSM tiles, add zoom control bottom-right

cleanup:
  if watchId !== undefined: navigator.geolocation.clearWatch(watchId)
  mapInstance.remove()

locateMe() (called by button click or external ref):
  1. if !isGeolocationSupported:
       error('NOT_SUPPORTED'); return
  2. isLocating = true; locationError = null
  3. options = { enableHighAccuracy, timeout, maximumAge }
  4. if watchPosition:
       watchId = navigator.geolocation.watchPosition(success, error, options)
     else:
       navigator.geolocation.getCurrentPosition(success, error, options)

handlePositionSuccess(position):
  1. Build GeolocationResult { position, accuracy, altitude?, heading?, speed?, timestamp }
  2. currentLocation = result; hasLocation = true; isLocating = false
  3. if showAccuracyCircle:
       create or move L.circle(latLng, radius=accuracy)
  4. create or move L.marker with custom divIcon { pulse-ring, pulse-core }
  5. map.setView(latLng, locateZoom, { animate: !prefersReducedMotion() })
  6. onLocate?.(result)

handlePositionError(error):
  1. errorType = mapErrorCode(error.code)        // 1→DENIED, 2→UNAVAILABLE, 3→TIMEOUT
  2. message  = getErrorMessage(errorType)        // human-readable
  3. isLocating = false; locationError = message
  4. onError?.(errorType, message)

clearLocation() (exported):
  remove marker + circle; hasLocation = false; stopWatching()

MapRouting (sibling, same file family):
  click 1 → origin (A); click 2 → destination (B); drag either pin to adjust
  $effect reads origin, destination AND profile synchronously → any change re-routes
  calculateRoute():
    abort the previous fetch (AbortController)
    GET {osrmApiUrl}/route/v1/{car|bike|foot}/{A.lng},{A.lat};{B.lng},{B.lat}?geometries=geojson&steps=true
    draw / update L.polyline; map.fitBounds(line, { animate: !prefersReducedMotion() })
    onRouteCalculated?.(result) | routeError + onRouteError?.(message)
```

## The Core Concept: Accuracy Circles and Confidence

The browser's Geolocation API returns a `coords.accuracy` value in metres. This is not an "average error" or a "± reading" — it is the **radius of a 95% confidence circle**. The actual position is, with 95% probability, somewhere inside that circle. So `accuracy: 12` means "we are 95% sure you are within 12 metres of the centre point we returned"; `accuracy: 1500` means "we know you are roughly in this neighbourhood, but we cannot pin you to a specific street".

The component renders this honestly: a translucent blue `L.circle` with `radius: result.accuracy` (Leaflet circles take radius in metres at the equator and adjust for latitude internally). The pulsing dot in the centre is the *point estimate*; the circle is the *uncertainty*. Together they communicate "here, plus or minus this much" without forcing the user to read a number.

Where does the accuracy come from? The browser combines whatever signals are available:

- **GPS** — sub-10 m outdoors with clear sky, useless indoors.
- **Wi-Fi triangulation** — Google/Apple maintain databases of Wi-Fi BSSID → physical location. 20–100 m typical, indoors-friendly.
- **Cell tower triangulation** — 500–5000 m, last-resort fallback.
- **IP geolocation** — city-level, only when nothing better is available.

The `enableHighAccuracy: true` flag tells the browser to prefer GPS, which costs battery but yields the tightest circles. On desktops without a GPS chip, the flag has no effect — the browser just uses whatever it has.

## Performance: Watch vs. One-Shot Geolocation

The component supports two modes via the `watchPosition` prop:

**One-shot (`watchPosition: false`, default):**
- Calls `navigator.geolocation.getCurrentPosition(...)` once.
- Returns a single position; no further updates.
- Cheap on battery — the GPS chip can power back down immediately.
- Right for "find my location" buttons that fire and forget.

**Continuous (`watchPosition: true`):**
- Calls `navigator.geolocation.watchPosition(...)` and stores the returned `watchId`.
- The browser fires the success callback whenever the position changes meaningfully (the threshold is browser-defined, typically a few metres of movement or a confidence improvement).
- The marker and accuracy circle move smoothly as new readings arrive.
- The GPS chip stays warm — battery cost is real on phones, ~5–10% per hour with high accuracy.
- Cleanup is critical: the `$effect` cleanup function calls `navigator.geolocation.clearWatch(watchId)` so a stale watcher does not survive component unmount.

For battery-conscious continuous tracking, raise `maximumAge` so the browser can return cached positions when fresh GPS is not available, and lower `enableHighAccuracy` to `false` so it can fall back to network-based positioning.

## Accessibility Deep-Dive: Permission UX

Geolocation permission prompts are notoriously hostile to users — they appear in browser chrome (out of the page's control), dismissing them silently denies the request, and "Block" persists for the entire origin until the user manually unblocks the site in browser settings. The component cannot improve the prompt itself, but it does its best around it:

- **Explicit user gesture.** The browser only allows the permission prompt to appear in response to a click — it will not trigger from `onMount` or a `setTimeout`. The component honours this by tying `locateMe()` to a button click. (Programmatic `locateMe` calls from a parent will still work *if* they are inside an event handler, e.g. on a wrapper button.)
- **All error states are spoken.** `locationError` renders in a `[role="alert"]` div, which screen readers announce immediately. The error messages are written for humans, not developers: "Location access was denied. Please enable location permissions in your browser settings." rather than "PERMISSION_DENIED".
- **Loading state is announced.** The button's `aria-label` flips between "Find my location", "Finding your location…", and "Re-center on your location" so AT users know what state the request is in.
- **The dismiss button has an aria-label.** Errors can be cleared without a mouse.
- **Keyboard fully supported.** Tab to the button, Enter/Space to trigger; Escape on the popup closes it (Leaflet default).

The one thing the component cannot do is detect whether the user has previously *blocked* permission for this origin. The Permissions API (`navigator.permissions.query({name: 'geolocation'})`) can tell you if the state is `'denied'`, but support is uneven and the component treats every request as fresh — the browser will silently re-deny without re-prompting if it has been blocked.

## State Flow Diagram

```
                  ┌──────────────────────┐
                  │   IDLE               │  isLocating=false
                  │   no marker, no ring │  hasLocation=false
                  └──────────┬───────────┘
                             │ button click → locateMe()
                             ▼
                  ┌──────────────────────┐
                  │   PERMISSION REQUESTED│  isLocating=true
                  │   browser prompt up   │  spinner visible
                  └──────────┬───────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │ granted            │ denied             │ timeout / unavailable
        ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ POSITION ACQUIRED│  │ ERROR: DENIED    │  │ ERROR: TIMEOUT/  │
│ marker + ring    │  │ alert banner     │  │ UNAVAILABLE      │
│ map.setView()    │  │ onError fired    │  │ alert banner     │
│ onLocate fired   │  └──────────────────┘  └──────────────────┘
└──────┬───────────┘
       │ if watchPosition: position changes ──╮
       │                                       ▼
       │                              ┌──────────────────┐
       │                              │ TRACKING         │
       │                              │ marker + ring    │
       │                              │   move on update │
       │                              └──────────────────┘
       │ clearLocation() (exported)
       ▼
┌──────────────────┐
│   IDLE (reset)   │
└──────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `LatLng` | `DEFAULT_MAP_CENTER` | Initial map centre before location is found. |
| `zoom` | `number` | `13` | Initial zoom level. |
| `height` | `number` | `400` | Map container height in pixels. |
| `locateZoom` | `number` | `16` | Zoom level applied when a location is acquired. |
| `showAccuracyCircle` | `boolean` | `true` | Render the translucent blue confidence circle. |
| `enableHighAccuracy` | `boolean` | `true` | Hint to the browser to prefer GPS. Costs battery on mobile. |
| `timeout` | `number` | `10000` | Milliseconds to wait before firing a TIMEOUT error. |
| `maximumAge` | `number` | `0` | Maximum age (ms) of an acceptable cached position. `0` forces fresh. |
| `watchPosition` | `boolean` | `false` | If true, continuously track position via `watchPosition` API. |
| `buttonPosition` | `'topleft' \| 'topright' \| 'bottomleft' \| 'bottomright'` | `'topright'` | Corner placement of the locate button. |
| `onLocate` | `(result: GeolocationResult) => void` | `undefined` | Fires on every successful position read (once for one-shot, repeatedly for watch). |
| `onError` | `(error: GeolocationErrorType, message: string) => void` | `undefined` | Fires on permission denial, timeout, or unavailability. |
| `class` | `string` | `''` | Extra classes for the container. |

The component also exports `locateMe()`, `stopWatching()`, and `clearLocation()` so a parent can drive it imperatively via `bind:this`.

### MapRouting

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `origin` | `LatLng` | `undefined` | Start point (A). Bindable — updates on map click or pin drag. |
| `destination` | `LatLng` | `undefined` | End point (B). Bindable. |
| `center` | `LatLng` | `DEFAULT_MAP_CENTER` | Initial centre when neither point is set (otherwise the midpoint is used). |
| `zoom` | `number` | `13` | Initial zoom level. |
| `height` | `number` | `500` | Container height in pixels. |
| `profile` | `'driving' \| 'cycling' \| 'walking'` | `'driving'` | Travel mode; the in-map buttons change it and re-route. |
| `osrmApiUrl` | `string` | `'https://router.project-osrm.org'` | OSRM server. The public demo server is rate-limited — self-host for production. |
| `showInstructions` | `boolean` | `true` | Collapsible turn-by-turn panel. |
| `showDistance` / `showDuration` | `boolean` | `true` | Route summary badge contents. |
| `routeColor` | `string` | `'#146ef5'` | Polyline colour (brand — deliberately a prop, not a flipping token). |
| `routeWeight` | `number` | `5` | Polyline width in pixels. |
| `draggableWaypoints` | `boolean` | `true` | Let users drag A/B pins. |
| `enableClickToSet` | `boolean` | `true` | Map clicks set A then B. |
| `onRouteCalculated` | `(route: RouteResult) => void` | `undefined` | Fires after each successful route. |
| `onRouteError` | `(error: string) => void` | `undefined` | Fires when OSRM fails or finds no route. |

## Theming

Both components follow the project theming convention (`docs/THEMING.md`): chrome tokens flip under `prefers-color-scheme: dark`, semantic tokens stay put.

### MapLocateMe (`--mlm-*`)

`MapLocateMe` declares `--mlm-*` tokens on `.map-locate-container` with light defaults inline and a `@media (prefers-color-scheme: dark)` flip. The button, info strip, error banner, accuracy badge, Leaflet popup, attribution strip, and tile-gap canvas all follow it.

| Property | Light | Dark | Used by |
| --- | --- | --- | --- |
| `--mlm-canvas` | `#f0f0f0` | `#1a1a1a` | Container + tile-gap background |
| `--mlm-surface` / `--mlm-surface-hover` | `#ffffff` / `#f5f5f5` | `#2a2a2a` / `#3a3a3a` | Locate button, zoom buttons, popup |
| `--mlm-info-bg` / `--mlm-attribution-bg` | translucent white | translucent charcoal | Coordinates strip, attribution |
| `--mlm-text` / `--mlm-text-muted` | `#333` / `#666` | `#e5e5e5` / `#9ca3af` | Text tiers |
| `--mlm-accent` | `#146ef5` | `#3b82f6` | Locate icon, pulse marker |
| `--mlm-accuracy-circle` | `var(--mlm-accent)` | `var(--mlm-accent)` | Leaflet accuracy circle (read from script) |
| `--mlm-error-*` | red tints | deep red tints | Error banner |
| `--mlm-accuracy-bg` / `--mlm-accuracy-text` | `#dbeafe` / `#1d4ed8` | `#1e3a8a` / `#bfdbfe` | Accuracy badge |

**The accuracy circle is drawn by Leaflet from JavaScript**, so CSS can't reach it directly. The component exports `readAccuracyCircleColour(el, fallback?)`, which reads `--mlm-accuracy-circle` via `getComputedStyle` on the map element when the circle is created, and re-applies it with `circle.setStyle()` whenever the OS colour scheme changes. It falls back to `#146ef5` during SSR or when the token is empty.

```css
/* Brand the accuracy circle without touching the rest of the accent */
body .map-locate-container.map-locate-container {
  --mlm-accuracy-circle: #16a34a;
}
```

### MapRouting (`--mr-*`)

| Token | Light | Dark | Used by |
|-------|-------|------|---------|
| `--mr-canvas` | `#f0f0f0` | `#1a1a1a` | Container background, profile track, clear button |
| `--mr-surface` / `--mr-surface-hover` | `#ffffff` / `#f5f5f5` | `#2a2a2a` / `#3a3a3a` | Swap button, active profile, zoom controls |
| `--mr-panel-bg` | `rgba(255,255,255,.95)` | `rgba(31,31,31,.95)` | Control panel, route badge, directions panel |
| `--mr-overlay-bg` | `rgba(255,255,255,.8)` | `rgba(17,17,17,.75)` | "Calculating route…" overlay |
| `--mr-text` / `--mr-text-muted` | `#333333` / `#666666` | `#e5e5e5` / `#a3a3a3` | Headings, coordinates, step distances |
| `--mr-accent` | `#146ef5` | `#60a5fa` | Active profile icon, links, step numbers, spinner |
| `--mr-accent-soft` | `rgba(20,110,245,.9)` | `rgba(37,99,235,.9)` | Click-mode hint pill |
| `--mr-border-soft`, `--mr-divider`, `--mr-divider-strong` | `#ddd`, `#f0f0f0`, `#eee` | `#4b5563`, `#333`, `#3f3f3f` | Swap button border, list dividers |
| `--mr-error-*` | red tints | dark red tints | Route error banner, clear-button hover |
| `--mr-shadow-*`, `--mr-marker-shadow` | 10–30% black | 40–60% black | Panel and pin shadows |
| `--mr-origin` | `#22c55e` | *(unchanged)* | "A" badge and start pin — semantic green |
| `--mr-destination` | `#ef4444` | *(unchanged)* | "B" badge and end pin — semantic red |

Override on the element itself with a doubled class so you beat Svelte's scoped specificity:

```css
.brand-area :global(.map-routing-container.map-routing-container) {
  --mr-accent: #6366f1;
  --mr-accent-soft: rgba(99, 102, 241, 0.9);
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User denies permission | `onError('PERMISSION_DENIED', …)` fires; an alert banner appears with instructions to re-enable in browser settings. |
| User dismisses the prompt without choosing | Most browsers treat dismissal as denial after a beat; the TIMEOUT error fires after the configured `timeout`. |
| Browser does not support geolocation (very old) | `isGeolocationSupported` is `false`; clicking the button immediately fires `onError('NOT_SUPPORTED', …)` without prompting. |
| Served over plain HTTP (not localhost) | All modern browsers refuse geolocation on insecure origins; `error.code === 1` (`PERMISSION_DENIED`) fires immediately. Deploy on HTTPS. |
| Indoors with no GPS | The browser falls back to Wi-Fi/cell positioning; accuracy circle widens dramatically (often 500+ m). The component renders this honestly rather than hiding it. |
| `watchPosition: true` and component unmounts | The `$effect` cleanup calls `clearWatch(watchId)` so the GPS chip powers down and the callback is detached. |
| User scrolls / pans away after location is acquired | The marker stays at its real position; the map view does not auto-recentre on subsequent updates unless `watchPosition` is true. |
| Multiple rapid clicks on the button | The button is `disabled` while `isLocating`; redundant clicks do nothing. |
| Position update arrives after `clearLocation()` | The watcher was cleared in `stopWatching()`, so no stale callback fires. |
| `prefers-reduced-motion: reduce` | The pulsing-dot and spinner animations are disabled via CSS `@media`; Leaflet's zoom/fade animations are disabled at construction, and every `setView` / `fitBounds` passes `{ animate: false }` so watch-mode re-centring and route fitting jump instead of glide. |
| Component unmounts while Leaflet is still loading | The mount effect notices it was cancelled and never builds the map, so no orphaned Leaflet instance is left behind. |
| MapRouting: travel mode changed with A and B set | The route recalculates with the new OSRM profile; any in-flight request is aborted first. |
| MapRouting: OSRM returns `NoRoute` or a non-200 | An alert banner shows the message and `onRouteError` fires; the previous polyline (if any) stays visible. |

## Dependencies

- **leaflet** (~150 KB gzip) — Same justification as MapLive: industry-standard, would take 100+ hours to replicate. Dynamic-imported, SSR-safe.
- **Browser Geolocation API** — Native, no external service. Backed by GPS, Wi-Fi, cell, and (rarely) IP-based positioning depending on hardware.
- **Leaflet CSS** — Loaded globally; without it the location marker's custom divIcon CSS still renders correctly because it is scoped, but tile controls are unstyled.
- **OpenStreetMap tiles** — Free public tile server; for production traffic use a paid provider as per OSM's tile usage policy.

## File Structure

```
src/lib/components/MapLocateMe.svelte     # locate-me + accuracy circle implementation
src/lib/components/MapRouting.svelte      # related: OSRM-driven route planning
src/lib/components/Location.md            # this file (rendered inside ComponentPageShell)
src/lib/components/MapLocateMe.test.ts    # behaviour tests (Leaflet + Geolocation mocked)
src/lib/components/MapRouting.test.ts     # behaviour tests (Leaflet + OSRM fetch mocked)
src/lib/testing/leafletMock.ts            # lightweight Leaflet test double
src/routes/location/+page.svelte          # demo page (locate-me + delivery + routing)
src/lib/types.ts                          # MapLocateMeProps, GeolocationResult,
                                          # GeolocationErrorType, RouteResult, RouteWaypoint
src/lib/constants.ts                      # DEFAULT_MAP_CENTER
src/lib/mapUtils.ts                       # calculateMapBounds — fit-to-points helper
```
