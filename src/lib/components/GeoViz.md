# GeoViz Components - Technical Logic Explainer

## Overview

The GeoViz component family provides **geographic data visualization** using LayerChart (SVG) with D3-geo projections. Three visualization types for different data stories:

| Component | Visualization | Best For |
|-----------|---------------|----------|
| **GeoBubbleMap** | Circles at coordinates | Point data (cities, stores) |
| **GeoChoropleth** | Colored regions | Regional statistics |
| **GeoSpikeMap** | 3D spikes at coordinates | Dramatic comparisons |

---

## Common Architecture

All three components share this flow:

```
GeoJSON (boundaries)  +  Data Array
           ↓                  ↓
    [LayerChart SVG]
           ↓
    [GeoContext with Mercator projection]
           ↓
    [fitGeojson auto-scales to container]
           ↓
    Rendered visualization
```

### Key Shared Concepts

1. **GeoContext** - LayerChart wrapper that handles projection
2. **`let:projection`** - Slot prop giving access to projection function
3. **fitGeojson** - Auto-fits map to container bounds
4. **Mercator projection** - Standard web map projection (EPSG:3857-ish)

---

## GeoBubbleMap

### How Bubbles Work

```
Data: { lat, long, value, name }
           ↓
[project([long, lat])] → Screen coordinates (x, y)
           ↓
[scaleSqrt(value)] → Circle radius
           ↓
<Circle cx={x} cy={y} r={radius} />
```

### Square Root Scaling (Perceptual Accuracy)

Why `scaleSqrt()` not `scaleLinear()`?

```
value: 100 → radius: 10 → area: 314
value: 400 → radius: 20 → area: 1256

Area ratio: 1256/314 = 4x ✓ (matches value ratio)
```

Linear radius would make 4x value look 16x bigger!

### Rendering Order

Largest bubbles render FIRST so smaller ones appear on top:

```typescript
sortedData = [...data].sort((a, b) => b.value - a.value);
```

### Direct Projection (Not GeoPoint)

The component uses `let:projection` directly instead of LayerChart's GeoPoint:

```svelte
<GeoContext projection={geoMercator} fitGeojson={geojson} let:projection>
  {#each data as point}
    {@const [x, y] = projection([point.long, point.lat])}
    <Circle cx={x} cy={y} ... />
  {/each}
</GeoContext>
```

---

## GeoChoropleth

### How Region Coloring Works

```
GeoJSON Feature (region boundary)
           ↓
[Extract region ID: RGN24CD, RGN23CD, RGN22CD...]
           ↓
[Lookup value in data map]
           ↓
[scaleSequential(value)] → Color
           ↓
<GeoPath fill={color} />
```

### ONS Property Naming

UK Office for National Statistics uses year-based property names:

```typescript
// Check multiple year formats
const regionId = props.RGN24CD   // 2024 format
              || props.RGN23CD   // 2023 format
              || props.RGN22CD   // 2022 format
              || props.CTRY22CD; // Country code
```

### Color Scale Types

```typescript
// Sequential (single hue gradient)
scaleSequential(interpolateBlues).domain([min, max])

// Custom colors (multi-step)
scaleLinear().domain([min, mid, max]).range(['#blue', '#white', '#red'])
```

### Legend Generation

```typescript
const steps = 5;
for (let i = 0; i <= steps; i++) {
  const value = min + (max - min) * (i / steps);
  items.push({ value, color: colorScale(value) });
}
```

---

## GeoSpikeMap

### How Spikes Work

```
Data: { lat, long, value }
           ↓
[project([long, lat])] → Screen position
           ↓
[scaleLinear(value)] → Spike height
           ↓
<path d="M 0,0 L -w,0 L 0,-h L w,0 Z" /> (triangle)
```

### 3D Effect (Pure CSS)

```svg
<!-- Gradient for 3D illusion -->
<linearGradient id="spike-grad">
  <stop offset="0%" stop-color="red" stop-opacity="0.4" />
  <stop offset="50%" stop-color="red" stop-opacity="1" />
  <stop offset="100%" stop-color="red" stop-opacity="0.6" />
</linearGradient>

<!-- Shadow ellipse at base -->
<ellipse rx="4" ry="1.5" fill="rgba(0,0,0,0.2)" />

<!-- Spike triangle -->
<path d="..." fill="url(#spike-grad)" />
```

### Latitude Sorting

Render north-to-south so southern spikes don't cover northern ones:

```typescript
sortedData = [...data].sort((a, b) => b.lat - a.lat);
```

---

## Props Quick Reference

### GeoBubbleMap
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `geojson` | `FeatureCollection` | - | Background map |
| `data` | `GeoDataPoint[]` | required | Point data |
| `minRadius` | `number` | `4` | Smallest bubble |
| `maxRadius` | `number` | `40` | Largest bubble |
| `bubbleColor` | `string` | blue | Default fill |
| `showLabels` | `boolean` | `false` | Names on large bubbles |
| `showTooltip` | `boolean` | `true` | Hover tooltips |

### GeoChoropleth
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `geojson` | `FeatureCollection` | required | Region boundaries |
| `data` | `GeoRegionData[]` | `[]` | Region values |
| `colorScale` | `GeoColorScale` | blues | Color scheme |
| `showLegend` | `boolean` | `true` | Show gradient legend |
| `showTooltip` | `boolean` | `true` | Hover tooltips |

### GeoSpikeMap
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `geojson` | `FeatureCollection` | - | Background map |
| `data` | `GeoDataPoint[]` | required | Point data |
| `minSpikeHeight` | `number` | `5` | Shortest spike |
| `maxSpikeHeight` | `number` | `80` | Tallest spike |
| `spikeWidth` | `number` | `3` | Triangle base width |
| `spikeColor` | `string` | red | Spike fill |

---

## Finding GeoJSON Data

### UK (Office for National Statistics)
```
https://geoportal.statistics.gov.uk/
→ Boundaries → Administrative → Regions
→ Download GeoJSON (WGS84)
```

### USA (Census Bureau)
```
https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html
```

### World Countries
```
https://github.com/datasets/geo-countries
https://geojson-maps.ash.ms/
```

### Tips
- Always use **WGS84 / EPSG:4326** coordinate system
- **Simplify geometries** with mapshaper.org (reduces file size)
- **Cache server-side** - don't fetch on every request

---

## Dependencies

```bash
bun add layerchart d3-geo d3-scale d3-scale-chromatic
```

Bundle impact: LayerChart + D3 submodules ~50KB (tree-shaken)

---

## Data Structures

```typescript
// For bubble and spike maps
interface GeoDataPoint {
  id: string;
  name: string;
  lat: number;
  long: number;
  value: number;
  color?: string;
  category?: string;
}

// For choropleth maps
interface GeoRegionData {
  regionId: string;  // Must match GeoJSON feature property
  value: number;
  label?: string;
}
```
