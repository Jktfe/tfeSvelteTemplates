# MapLive — Technical Logic Explainer

## What Does It Do? (Plain English)

A live, editable map. The user clicks anywhere on the tiles to drop a pin, drags pins to reposition them, and uses an inline popup to rename or delete each one. The full marker list is bindable, so the parent component always sees an up-to-date array — useful for "save my favourite places", route planning, or any UI where users curate a small set of locations.

Think of it as a digital corkboard pinned to a paper map: you place a thumbtack with a single tap, scribble a label on it, and slide it around with your finger. The map underneath is OpenStreetMap tiles served via Leaflet — battle-tested map plumbing the component delegates to rather than reimplementing.

## How It Works (Pseudo-Code)

```
state:
  markers       = []                    // bindable, parent-controlled
  isAddMode     = true                  // toggleable from control bar
  markerMap     = SvelteMap<id, LeafletMarker>
  nextMarkerId  = max(existing IDs) + 1
  canAddMore    = maxMarkers === 0 || markers.length < maxMarkers

mount ($effect):
  1. Dynamic-import 'leaflet' (SSR-safe — module never loaded on server)
  2. Read prefers-reduced-motion to gate Leaflet's zoom/fade animations
  3. Create map at center/zoom; attach OSM tile layer
  4. Add zoom control bottom-right (avoids overlapping our control bar)
  5. Create a LayerGroup for markers
  6. Subscribe to map 'click' event:
       if isAddMode AND canAddMore AND enableAddMode:
         addMarkerAtPosition(event.latlng)
  7. Replay any existing markers passed in via prop

cleanup:
  mapInstance.remove(); reset markerMap

addMarkerAtPosition(latlng):
  1. Build MapMarker { id: nextMarkerId++, position, title, description }
  2. markers = [...markers, newMarker]            // immutable update fires reactivity
  3. await addLeafletMarker(newMarker, animate=true)
  4. onMarkerAdd?.(newMarker)

addLeafletMarker(data, animate):
  1. Create draggable L.marker at data.position
  2. bindPopup with edit form HTML; configure autoPan padding so popup is fully visible
  3. on 'popupopen' → setupPopupHandlers() (rebinds save/delete)
  4. on 'dragend' → updateMarkerPosition(id, newLatLng)
  5. layerGroup.addLayer(marker); markerMap.set(id, marker)
  6. if animate: add .marker-animate-in class, remove after 300ms

popup save handler:
  e.stopPropagation()                     // critical — otherwise map 'click' fires
  updateMarkerDetails(id, title, description)
  marker.closePopup()

popup delete handler:
  e.stopPropagation()
  removeMarker(id)
```

## The Core Concept: Tile Pyramids and Web Mercator

Every web map you have ever scrolled is a pyramid of pre-rendered image tiles, each 256×256 pixels, organised by zoom level. At zoom 0 the entire world fits in one tile; at zoom 1 there are 4 tiles; at zoom z there are 4ⁿ tiles. Leaflet's job is to figure out which tiles are visible in the current viewport, fetch them from a server, and stitch them edge-to-edge.

The projection that makes those tiles align is **Web Mercator** (EPSG:3857). It is a cylindrical projection that wraps the globe around a cylinder tangent to the equator, then unrolls it flat. The maths:

```
x = R · (longitude in radians)
y = R · ln( tan(π/4 + latitude/2) )
```

This is the same transform Google, OpenStreetMap, and Leaflet all use, which is why their tiles are interchangeable. The pleasant side-effect is that loxodromes (constant-bearing lines) are straight on the map — useful for navigation, the original purpose of the projection. The painful side-effect is that Greenland looks bigger than Africa. For most UI work, the trade-off is worth it: pinching to zoom feels natural because the projection is conformal (angle-preserving locally).

The component never touches projection maths directly — Leaflet handles it — but understanding why a marker appears where it does requires knowing that `[lat, lng]` are converted through this transform before becoming pixel coordinates. That is also why marker positions are stored as `LatLng` (geographic) rather than `{x, y}` (screen): geographic coordinates are stable across zoom levels, screen coordinates are not.

## Performance: Layer Groups and Marker Volume

Leaflet's `L.LayerGroup` is the secret to keeping a map with hundreds of markers responsive. Instead of attaching every marker directly to the map (which forces a redraw of the whole layer stack on each addition), the component groups them into a single layer that Leaflet can show/hide, clear, or remove as one operation:

```
markerLayer = L.layerGroup().addTo(map);
markerLayer.addLayer(newMarker);    // O(1) attach
markerLayer.clearLayers();          // O(1) remove all — used by Clear all button
```

For datasets larger than a few hundred markers, swap the LayerGroup for `Leaflet.markercluster`, which automatically clusters nearby markers into a single bubble showing the count, then expands them as the user zooms in. The component does not bundle markercluster — it would defeat the "minimal dependency" promise — but the LayerGroup pattern is the natural extension point.

Tile loading itself is handled by the browser: Leaflet sets `<img>` `src` attributes and lets HTTP/2 multiplex the requests. There is no manual viewport culling, no prefetch logic, no service worker. On a slow network, tiles load progressively from low-resolution placeholders to the full-resolution tile (Leaflet's default behaviour).

The dynamic `await import('leaflet')` keeps Leaflet's ~150 KB gzip out of the initial bundle for any route that does not actually use a map. SSR builds never touch the module, because the import lives inside `$effect` which only runs after `typeof window !== 'undefined'`.

## Accessibility Deep-Dive

Maps are notoriously hard to make accessible — they are inherently visual, spatial, and pointer-driven — but the component does what it can:

- **`role="application"`** on the map element tells screen readers to pass keystrokes through rather than treating the map as a document. Leaflet then handles arrow-key panning and `+`/`-` zooming natively.
- **Popup forms are keyboard-reachable.** When a popup opens the input gets focus; `Tab` moves through title → description → save → delete; `Escape` closes the popup (Leaflet default).
- **`aria-pressed`** on the add-mode toggle reflects the current mode for AT users.
- **`aria-live="polite"`** announces marker count changes and the "Click anywhere on the map to add a marker" hint.
- **All popup HTML is escaped** via `escapeHtml()` from `$lib/htmlUtils` — user-typed titles and descriptions cannot inject script tags through the popup template.

What the component cannot do is describe map content semantically — there is no list of "things on this map" exposed to screen readers. For applications where that matters, render an off-screen `<ul>` of marker titles in parallel; the GlobePresence component does exactly this with `.sr-only`.

## State Flow Diagram

```
                     ┌─────────────────────┐
                     │   IDLE              │  isAddMode=false
                     │   no clicks add pins│  canAddMore=*
                     └──────────┬──────────┘
                                │ click toggle button
                                ▼
                     ┌─────────────────────┐
                     │   ADD MODE ACTIVE   │  isAddMode=true
                     │   crosshair cursor  │  hint banner visible
                     └──────────┬──────────┘
                                │ map click
                                ▼
                     ┌─────────────────────┐
                     │   MARKER PLACED     │  markers = [...markers, new]
                     │   drop animation    │  onMarkerAdd fires
                     └──────────┬──────────┘
                                │ click marker
                                ▼
                     ┌─────────────────────┐
                     │   POPUP OPEN        │  edit form visible
                     │   focus → title     │  save / delete bound
                     └──────┬───────┬──────┘
              save click    │       │   delete click
                            ▼       ▼
                     ┌─────────────────────┐
                     │   MARKER UPDATED    │     ┌─────────────────────┐
                     │   or REMOVED        │ ──▶ │   MAX REACHED       │
                     │   array re-emitted  │     │   canAddMore=false  │
                     └─────────────────────┘     │   banner: "Maximum" │
                                                 └─────────────────────┘
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `markers` | `MapMarker[]` | `[]` | Bindable array of markers. Mutate from the parent and the map syncs. |
| `center` | `LatLng` | `DEFAULT_MAP_CENTER` (London) | Initial map centre. Ignored after mount. |
| `zoom` | `number` | `13` | Initial zoom level (1–18). |
| `height` | `number` | `500` | Map container height in pixels. |
| `enableAddMode` | `boolean` | `true` | Whether the add-mode toggle is rendered at all. |
| `animateNewMarkers` | `boolean` | `true` | Play the drop animation on newly placed markers. |
| `maxMarkers` | `number` | `0` | Hard cap on marker count. `0` means unlimited. |
| `onMarkerAdd` | `(m: MapMarker) => void` | `undefined` | Fires after a marker is placed. |
| `onMarkerRemove` | `(m: MapMarker) => void` | `undefined` | Fires after a marker is deleted (including via Clear all). |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| SSR render | The `$effect` short-circuits when `mapContainer` is undefined — Leaflet never loads on the server. The container is rendered as an empty `<div>`. |
| `prefers-reduced-motion: reduce` | Leaflet's zoom/fade animations are disabled at construction; the marker drop animation is overridden by a `@media` rule. |
| `maxMarkers` reached | `canAddMore` flips to `false`; the hint banner shows "Maximum markers reached"; map clicks no longer add. |
| User drags a marker into the sea | Position is stored verbatim — there is no land/water validation. Add it in the parent if needed. |
| Popup save without typing a title | Falls back to the placeholder string `'Untitled'`. Empty descriptions are stored as empty strings. |
| Parent mutates `markers` directly | Existing Leaflet markers do not re-sync automatically — they were created on initial mount. Treat `markers` as bindable, not as a one-way prop. |
| Clear all button click | Iterates markers, fires `onMarkerRemove` for each, then resets the array and the LayerGroup in one operation. |
| Hundreds of markers | LayerGroup keeps render time linear, but click-to-add latency degrades past ~500 markers — switch to `leaflet.markercluster` for those scales. |
| Offline / tile server unreachable | OSM tiles fail to load and show as grey squares; the map remains interactive (pan, zoom, marker placement still work). |

## Dependencies

- **leaflet** (~150 KB gzip) — Industry-standard open-source map library. Building map plumbing natively (tile pyramid, projection, layer compositor, marker hit-testing) would take 100+ hours and still not match Leaflet's mobile gesture handling. Justified external dependency.
- **@types/leaflet** — TypeScript definitions, dev-only.
- **OpenStreetMap tile servers** — Free public tiles. For production traffic use a proper tile provider (Mapbox, Stadia, MapTiler) — OSM's usage policy is intended for development and small-traffic hobbyist sites.
- **Leaflet CSS** — Must be loaded globally (in `app.html` or via a stylesheet import). Without it tiles render but controls and popups are unstyled.
- **`escapeHtml`** from `$lib/htmlUtils` — XSS protection for user-typed popup content.

## File Structure

```
src/lib/components/MapLive.svelte         # primary "click to add" implementation
src/lib/components/MapBasic.svelte        # static viewer with marker prop
src/lib/components/MapMarkers.svelte      # markers-only layer for composition
src/lib/components/MapSearch.svelte       # Nominatim geocoding search box
src/lib/components/Maps.md                # this file (rendered inside ComponentPageShell)
src/routes/maps/+page.svelte              # demo page
src/lib/types.ts                          # MapLiveProps, MapMarker, LatLng
src/lib/constants.ts                      # DEFAULT_MAP_CENTER, FALLBACK_MARKERS
src/lib/mapUtils.ts                       # calculateMapBounds — fit-to-markers helper
src/lib/htmlUtils.ts                      # escapeHtml — popup XSS guard
database/schema_maps.sql                  # map_markers schema (optional Neon table)
```
