# GeoViz — Technical Logic Explainer

## What Does It Do? (Plain English)

A family of three SVG-based geographic visualisations that share a projection pipeline but tell three different stories with the same shape data:

- **GeoChoropleth** — paints regions in shades of one or two colours so darker areas mean "more of this thing". Election maps, population density, regional sales.
- **GeoBubbleMap** — drops circles at coordinate points sized by value. Cities, store locations, customer counts.
- **GeoSpikeMap** — drops vertical triangle spikes at coordinate points whose height encodes the value. The same data as a bubble map, but more dramatic — comparisons read off pixel heights instead of circle areas.

All three are drawn as plain SVG inside a LayerChart `<GeoContext>`, projected through D3-geo's Mercator transform, and auto-fitted to the container. The user gets choropleths for "how does it vary across regions", bubbles for "where are the data points and how big are they", and spikes for "look how much bigger the largest one is".

## How It Works (Pseudo-Code)

```
shared pipeline (all three components):
  1. <GeoContext projection={geoMercator} fitGeojson={geojson} let:projection>
  2. LayerChart computes the projection scale + translate so geojson fills the container
  3. The 'projection' slot prop is a function: ([long, lat]) → [pixelX, pixelY]

GeoChoropleth:
  derive valueMap = SvelteMap<regionId, value> from data prop
  derive [min, max] = extent of values
  derive colorScale = scaleSequential(interpolator).domain([min, max])
                  | scaleLinear().domain([min, mid, max]).range(colors)
  for each feature in geojson.features:
    regionId = feature.properties.RGN24CD
            || feature.properties.RGN23CD
            || feature.properties.RGN22CD
            || feature.properties.CTRY22CD
    value    = valueMap.get(regionId) ?? null
    fill     = value === null ? '#e5e7eb' : colorScale(value)
    <GeoPath {feature} fill={fill} stroke={strokeColor}
             tabindex=0 role="button" aria-label="{name}: {label | value | 'no data'}"
             onclick onpointermove onpointerleave onfocus onblur onkeydown(Enter/Space) />

GeoBubbleMap:
  derive radiusScale = scaleSqrt().domain([minValue, maxValue]).range([minRadius, maxRadius])
  derive sortedData  = data sorted descending by value (largest renders first)
  for each point in sortedData:
    [x, y]  = projection([point.long, point.lat])
    radius  = radiusScale(point.value)
    <g role="button" tabindex=0 aria-label="{name}: {value}" onfocus/onblur → tooltip, Enter/Space → click>
      <Circle cx={x} cy={y} r={radius} fill={point.color ?? bubbleColor} />

GeoSpikeMap:
  derive heightScale = scaleLinear().domain([minValue, maxValue]).range([minSpikeHeight, maxSpikeHeight])
  derive sortedData  = data sorted by lat descending (north-to-south, so southern spikes render on top)
  for each point in sortedData:
    [x, y]  = projection([point.long, point.lat])
    h       = heightScale(point.value)
    w       = spikeWidth
    <g role="button" tabindex=0 transform="translate({x}, {y})" …same focus/keyboard wiring as bubbles>
      <path d="M 0,0 L {-w/2},0 L 0,{-h} L {w/2},0 Z" fill="url(#spike-gradient-{uid})" />
```

## The Core Concept: Projections, fitGeojson, and Why scaleSqrt for Bubbles

The whole family runs on D3-geo's `geoMercator()`. A projection in D3-geo is a function with an internal scale and translate that maps `[longitude, latitude]` to `[x, y]` in pixels. Out of the box it would project the entire world into a 960×500 box centred on `[0, 0]` — useless for a choropleth of, say, just the UK.

`fitGeojson` is the trick. LayerChart's `<GeoContext>` calls `projection.fitSize([width, height], geojson)` under the hood, which:

1. Computes the bounding box of the GeoJSON in *projected* space (sweep all coordinates through `geoMercator()`).
2. Picks the largest scale factor that keeps the bbox inside `[width, height]`.
3. Sets translate so the bbox is centred.

The result is a projection that fills the container with whatever region your GeoJSON covers, regardless of whether that is a single county, a country, or the whole world. Pass a different GeoJSON, get a different projection automatically.

For the bubble map, the maths trick is **square-root scaling**. Naïvely, you might map value to radius linearly: `radius = value × k`. But human visual perception reads circles by *area*, not radius, and area scales with radius squared. A bubble with twice the radius looks four times bigger. To make the bubble *look* twice as big, you need:

```
radius = sqrt(value) × k        // i.e. d3.scaleSqrt()
```

Now `value: 100` and `value: 400` produce circles whose visible areas are in a 1:4 ratio — matching the data. This is the same correction Charles Joseph Minard's 1869 Russia campaign map applies to its army-size circles, and it is the difference between honest data visualisation and accidentally inflating your big numbers. The component uses `d3-scale.scaleSqrt()` for exactly this reason.

Spike maps do not need the correction — height is read linearly by the eye, so `scaleLinear()` is appropriate.

## Performance: SVG vs. Canvas, and the Geometry-Simplification Trade-Off

The components render to SVG, which means every region polygon and every bubble circle is its own DOM node. The browser pays for:

- **Layout cost.** SVG elements are laid out by the browser's render tree, not the GPU compositor. A choropleth of 33 UK regions is ~33 nodes — fast. A choropleth of US census tracts is ~74,000 nodes — your laptop fan will spin up.
- **Hit-testing.** Hover and click events route through the standard event system; no special infrastructure needed. This is the biggest argument for SVG over canvas — accessibility "just works".
- **Animation.** SVG can be CSS-transitioned (e.g. `transition: fill 0.2s` on hover), GPU-accelerated, no canvas redraw loop needed.

The practical limit is roughly **5,000 SVG nodes** before performance degrades on a mid-range laptop. Above that, switch to canvas (D3 supports it natively) or pre-render the static layer to a PNG and overlay only the interactive markers as SVG.

The other performance lever is **geometry simplification**. ONS GeoJSON files for UK regions can be 2–10 MB; once simplified to ~5% of their original vertex count via [mapshaper.org](https://mapshaper.org), they drop to 100–300 KB with no visible difference at typical map sizes. Always simplify before shipping; never serve raw census-bureau geometries to the browser.

For sorting performance, the rendering order matters:

- Bubbles sort *largest first* so smaller circles draw on top — otherwise a tiny city would be hidden under a big one.
- Spikes sort by *latitude descending* (north to south) so southern spikes render on top of northern ones — otherwise distant tall spikes would visually obscure nearer short ones.

## Accessibility Deep-Dive

SVG-based geographic visualisations have a baseline accessibility advantage over canvas: every region or marker is a focusable, hit-testable DOM element. The components lean on that:

- **Every region, bubble and spike is a keyboard stop.** Each one is `role="button"` with `tabindex="0"` and an `aria-label` of the form "London: 8900000" (choropleth regions use the data `label` when supplied). Screen readers announce the value without needing to see the colour or size.
- **Tooltips follow focus as well as the pointer.** `pointermove` positions the tooltip at the cursor; `focus` anchors it to the element's bounding box and `blur` hides it, so keyboard users get the same readout as mouse users.
- **`Enter` and `Space` activate**, calling the same `onRegionClick` / `onBubbleClick` / `onSpikeClick` handler as a click, with structured data (`GeoRegionProperties`, `GeoDataPoint`).
- **Visible focus ring.** A 2px `:focus-visible` outline marks the focused shape; mouse clicks don't trigger it.
- **The legend renders as semantic HTML.** Colour swatches are `<div>`s with adjacent text labels, not buried in SVG, so AT users get the value scale without needing to interpret a colour gradient.
- **Choropleths with no data for a region** colour them grey (`#e5e7eb`) and their accessible name ends in "no data" — important for users who otherwise cannot distinguish "low value" (light blue) from "no value at all".

The hard part is colour blindness: a sequential blue-scale choropleth is fine, but red-green diverging scales are unreadable for ~8% of men. The components accept any colour array via the `colorScale.colors` prop, so designers can substitute viridis or cividis (perceptually uniform, colourblind-safe palettes from the matplotlib world) without modifying the component itself.

For motion-sensitive users, the components have no auto-animations — the only motion is a 150 ms opacity transition on hover, and each component switches that off inside `@media (prefers-reduced-motion: reduce)` so feedback is instant.

## State Flow Diagram

```
       ┌────────────────────────┐
       │  PARENT supplies:      │
       │   geojson + data array │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │  GeoContext mounts     │  fitGeojson computes scale + translate
       │  projection ready      │  let:projection slot exposes ([lng,lat]) → [x,y]
       └───────────┬────────────┘
                   │
       ┌───────────┼───────────┬───────────────────────┐
       │           │           │                       │
       ▼           ▼           ▼                       ▼
  ┌─────────┐ ┌──────────┐ ┌──────────┐         ┌──────────┐
  │CHOROPLETH│ │BUBBLEMAP │ │SPIKEMAP  │  paths/ │ LEGEND   │
  │paths fill│ │circles by│ │triangles │  markers│ HTML LIs │
  │by region │ │area sqrt │ │by linear │  rendered│ + colours│
  └────┬─────┘ └─────┬────┘ └────┬─────┘         └──────────┘
       │ hover/focus  │ hover     │ hover
       ▼              ▼           ▼
  ┌────────────────────────────────────┐
  │  TOOLTIP (LayerChart slot)         │
  │  showing value, label, region name │
  └─────────────┬──────────────────────┘
                │ click
                ▼
  ┌────────────────────────────────────┐
  │  onRegionClick / onBubbleClick /   │
  │  onSpikeClick fires with payload   │
  └────────────────────────────────────┘
```

## Props Reference

### GeoChoropleth

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `geojson` | `GeoJSON.FeatureCollection` | required | Region boundaries. Features must have an ID-bearing property (RGN24CD, etc.). |
| `data` | `GeoRegionData[]` | `[]` | Array of `{ regionId, value, label? }`. `regionId` must match the GeoJSON feature property. |
| `colorScale` | `GeoColorScale` | sequential blues | `{ type: 'sequential' \| 'diverging', colors: string[], domain?: [min, max] }`. |
| `height` | `number` | `500` | Container height. Width is 100% of parent. |
| `showLegend` | `boolean` | `true` | Render the colour-swatch legend (overlaid bottom-right; hidden when `data` is empty). |
| `showTooltip` | `boolean` | `true` | Show the tooltip on hover and keyboard focus. |
| `strokeColor` | `string` | `'#fff'` | Region border colour. |
| `strokeWidth` | `number` | `1` | Region border width in pixels. |
| `onRegionClick` | `(region: GeoRegionProperties) => void` | `undefined` | Fires on region click. |
| `onRegionHover` | `(region: GeoRegionProperties \| null) => void` | `undefined` | Fires on hover/focus; `null` on leave/blur. |
| `class` | `string` | `''` | Extra classes. |

### GeoBubbleMap

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `geojson` | `GeoJSON.FeatureCollection` | optional | Background outline (countries, regions). Bubbles draw on top. |
| `data` | `GeoDataPoint[]` | required | `{ id, name, lat, long, value, color?, category? }[]`. |
| `height` | `number` | `500` | Container height. |
| `minRadius` | `number` | `4` | Smallest bubble size in pixels. |
| `maxRadius` | `number` | `40` | Largest bubble size in pixels. |
| `bubbleColor` | `string` | `'rgba(59, 130, 246, 0.6)'` | Default fill when point has no `color`. |
| `bubbleStroke` | `string` | `'#fff'` | Bubble border colour. |
| `showLabels` | `boolean` | `false` | Show name labels inside bubbles whose radius exceeds 15px. |
| `showTooltip` | `boolean` | `true` | Hover tooltip. |
| `onBubbleClick` | `(point: GeoDataPoint) => void` | `undefined` | Fires on bubble click. |
| `class` | `string` | `''` | Extra classes. |

### GeoSpikeMap

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `geojson` | `GeoJSON.FeatureCollection` | optional | Background outline. |
| `data` | `GeoDataPoint[]` | required | Same shape as bubble map. |
| `height` | `number` | `500` | Container height. |
| `minSpikeHeight` | `number` | `5` | Shortest spike in pixels. |
| `maxSpikeHeight` | `number` | `80` | Tallest spike in pixels. |
| `spikeWidth` | `number` | `3` | Triangle base width in pixels. |
| `spikeColor` | `string` | `'#ef4444'` | Spike fill colour. |
| `showTooltip` | `boolean` | `true` | Hover tooltip. |
| `onSpikeClick` | `(point: GeoDataPoint) => void` | `undefined` | Fires on spike click. |
| `class` | `string` | `''` | Extra classes. |

## Theming

All three components follow `docs/THEMING.md`: **chrome flips, data stays**. Chrome tokens are declared on each root (`.geo-choropleth`, `.geo-bubble-map`, `.geo-spike-map`) with light defaults inline and a `@media (prefers-color-scheme: dark)` override. The data colours — `colorScale`, `bubbleColor`, `spikeColor`, `strokeColor`, and per-point `color` — are props and never flip, because the colour *is* the value.

| Property | Light | Dark | Used by |
| --- | --- | --- | --- |
| `--geo-surface` | `#f9fafb` | `#111827` | Map background |
| `--geo-land-fill` | `#e5e7eb` | `#374151` | Background geography (bubble / spike) |
| `--geo-land-stroke` | `#d1d5db` | `#4b5563` | Background geography outline |
| `--geo-no-data` | `#e5e7eb` | `#374151` | Choropleth regions with no matching data row |
| `--geo-legend-bg` | `#ffffff` | `#1f2937` | Legend card |
| `--geo-legend-fg` | `#374151` | `#e5e7eb` | Legend title (bubble / spike) |
| `--geo-legend-muted` | `#6b7280` | `#9ca3af` | Legend labels |
| `--geo-legend-shadow` | soft grey | deeper black | Legend card shadow |
| `--geo-tooltip-bg` | `rgba(0,0,0,0.85)` | `rgba(3,7,18,0.92)` | Hover tooltip |
| `--geo-tooltip-border` | `transparent` | `rgba(255,255,255,0.14)` | Tooltip edge so it separates from a dark map |

The SVG land paths still carry `fill` / `stroke` presentation attributes as a fallback, but the scoped CSS (`fill: var(--geo-land-fill)`) beats them, which is how the geography flips without a prop. Choropleth regions without data get a `region--no-data` class for the same reason.

```css
/* Warmer land on a dashboard with its own palette */
body .geo-bubble-map.geo-bubble-map {
  --geo-surface: #fffbeb;
  --geo-land-fill: #fde68a;
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Region in GeoJSON but no entry in `data` | Coloured neutral grey (`#e5e7eb`); the tooltip shows the name only and the accessible name ends in "no data". |
| Region has a value but no custom `label` | The tooltip shows the formatted value (en-GB grouping) rather than repeating the region name. |
| Empty `data` array (bubble / spike) | No markers render; the legend falls back to a 0–100 range rather than showing `Infinity`. |
| `data` entry with `regionId` that does not match any feature | Silently ignored. No console warning — add validation in your loader if you want one. |
| GeoJSON property is `RGN23CD` not `RGN24CD` | The fallback chain in property lookup catches it (`RGN24CD || RGN23CD || RGN22CD || CTRY22CD`). |
| All values identical | `extent` returns `[v, v]`; the colour scale collapses to a single colour. Add `domain: [0, v]` manually if you want a gradient anchored at zero. |
| Bubble with `value = 0` | `scaleSqrt(0) = minRadius` (the lower bound), so it still renders as the smallest bubble — not invisible. |
| Spike with `value = 0` | Renders at `minSpikeHeight` — visible but minimal. Filter zero-values out in the parent if you want them gone. |
| Container width is 0 (e.g. inside a hidden tab) | `fitGeojson` divides by zero or produces NaN; the SVG renders nothing. Mount inside a visible container or set explicit dimensions. |
| Massive GeoJSON (>5 MB) | Performance degrades; simplify with mapshaper.org before shipping. Aim for <500 KB after gzip. |
| Two bubbles at the exact same coordinate | Both render; the second overlays the first. Cluster in the parent if needed. |
| Diverging colour scale with all-positive data | Half the gradient is wasted. Use a sequential scale unless your data crosses zero. |
| User has colour blindness | Component is colourway-agnostic — pass a colourblind-safe palette via `colorScale.colors` (viridis, cividis, etc.). |

## Dependencies

- **layerchart** — SVG charting library with first-class GeoContext support. Provides the projection wrapper, fit-to-container logic, tooltip slot, and `<GeoPath>` component.
- **d3-geo** — Geographic projection module. Mercator is the only projection used here, but D3-geo also offers Albers, Equirectangular, Orthographic if you fork.
- **d3-scale** — `scaleSequential`, `scaleLinear`, `scaleSqrt`. Underpins all colour and size encoding.
- **d3-scale-chromatic** — `interpolateBlues`, `interpolateOrRd`, etc. Bundled colour interpolators.
- **geojson** type definitions — TypeScript-only, no runtime cost.
- **No Leaflet** — these are pure SVG visualisations, *not* tile-based maps. Use `MapLive` or `MapLocateMe` if you need tiles, panning, or zooming.

Tree-shaken bundle impact: ~50 KB gzip for the full LayerChart + d3 submodules combination. Justified by the 100+ hours of D3-geo expertise that would otherwise need replicating.

## File Structure

```
src/lib/components/GeoChoropleth.svelte    # region-colouring choropleth
src/lib/components/GeoBubbleMap.svelte     # sized circles at coordinates
src/lib/components/GeoSpikeMap.svelte      # vertical spikes at coordinates
src/lib/components/GeoViz.md               # this file (rendered inside ComponentPageShell)
src/lib/components/Geo{Choropleth,BubbleMap,SpikeMap}.test.ts   # behaviour tests (layerchart stubbed)
src/lib/components/GeoViz.test.ts          # shared type / helper checks
src/lib/testing/layerchartMock.ts          # lightweight layerchart stand-ins used by the tests
src/routes/geo/+page.svelte                # demo page (all three variants)
src/routes/geo/+page.server.ts             # fetches ONS GeoJSON (regions + countries)
src/lib/types.ts                           # GeoChoroplethProps, GeoBubbleMapProps,
                                           # GeoSpikeMapProps, GeoDataPoint, GeoRegionData,
                                           # GeoColorScale, GeoRegionProperties
src/lib/constants.ts                       # GEO_COLOR_SCALES, UK_*_GEOJSON_URL, sample points
```
