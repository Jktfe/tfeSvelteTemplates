# Maps Components - Technical Logic Explainer

## Overview

The Maps component family provides interactive mapping using **Leaflet.js** with OpenStreetMap tiles. Four variants serve different use cases, all sharing SSR-safe architecture.

## Component Variants

| Component | Purpose | Key Feature |
|-----------|---------|-------------|
| **MapBasic** | Foundation map | Pan, zoom, tile layers |
| **MapMarkers** | Display locations | Markers from database with filtering |
| **MapSearch** | Find places | Nominatim geocoding + autocomplete |
| **MapLive** | User annotations | Click-to-add, drag-to-move markers |

## Why Leaflet?

Building a map library from scratch would take 100+ hours:
- Tile loading/caching
- Projection math
- Touch gestures
- Marker clustering
- Geocoding

Leaflet is battle-tested, ~40KB, and MIT licensed.

---

## MapBasic - The Foundation

### SSR Safety Pattern

```typescript
// Check for browser environment
const isBrowser = typeof window !== 'undefined';

$effect(() => {
  if (!isBrowser || !mapContainer) return;

  // Dynamic import (only loads in browser)
  const L = await import('leaflet');

  // Now safe to create map
  map = L.map(mapContainer, options);
});
```

### Reduced Motion Support

```typescript
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

map = L.map(container, {
  zoomAnimation: !prefersReducedMotion,
  fadeAnimation: !prefersReducedMotion
});
```

---

## MapMarkers - Database Markers

### Data Flow

```
Database/Fallback → markers[] prop
        ↓
[Category filter applied]
        ↓
Leaflet markers created
        ↓
Popups bound with escaped HTML
```

### Category Filtering

```typescript
// Extract unique categories from markers
categories = [...new Set(markers.map(m => m.category))];

// Filter on selection
filteredMarkers = selectedCategory
  ? markers.filter(m => m.category === selectedCategory)
  : markers;
```

### Auto-Fit Bounds

```typescript
// Zoom to show all markers
const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
map.fitBounds(bounds, { padding: [50, 50] });
```

### XSS Protection

All marker content is escaped:

```typescript
const popup = `
  <h3>${escapeHtml(marker.title)}</h3>
  <p>${escapeHtml(marker.description)}</p>
`;
```

---

## MapSearch - Geocoding

### Nominatim API Integration

```typescript
// OpenStreetMap's free geocoding service
const API = 'https://nominatim.openstreetmap.org/search';

async function search(query: string) {
  const response = await fetch(
    `${API}?q=${encodeURIComponent(query)}&format=json&limit=${maxResults}`
  );
  return response.json();
}
```

### Debounce Pattern

```typescript
let debounceTimer: number;

function handleInput(e: Event) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    search(searchQuery);
  }, debounceMs);  // Default 300ms
}
```

### Keyboard Navigation

```
↑ (ArrowUp)   → Previous result (wraps)
↓ (ArrowDown) → Next result (wraps)
Enter         → Select highlighted result
Escape        → Close dropdown
```

### Bounding Box Zoom

Nominatim returns `boundingbox` for areas (cities, regions):

```typescript
// Zoom to show whole area, not just center point
if (result.boundingbox) {
  const [south, north, west, east] = result.boundingbox;
  map.fitBounds([[south, west], [north, east]]);
} else {
  map.setView([result.lat, result.lon], 15);
}
```

---

## MapLive - User Annotations

### Click-to-Add Pattern

```typescript
map.on('click', (e: LeafletMouseEvent) => {
  if (!addModeActive) return;
  if (maxMarkers && markers.length >= maxMarkers) return;

  const newMarker: MapMarker = {
    id: Date.now(),  // Simple unique ID
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    title: 'New Marker',
    draggable: true
  };

  markers = [...markers, newMarker];
});
```

### Bindable Markers

Uses `$bindable()` for two-way sync with parent:

```typescript
// In MapLive
let { markers = $bindable([]) } = $props();

// In parent
<MapLive bind:markers={myMarkers} />
```

### Drag-to-Reposition

```typescript
leafletMarker.on('dragend', (e) => {
  const newPos = e.target.getLatLng();
  markers = markers.map(m =>
    m.id === marker.id
      ? { ...m, lat: newPos.lat, lng: newPos.lng }
      : m
  );
});
```

### Add Mode Cursor

```css
.map-container.add-mode {
  cursor: crosshair !important;
}
```

---

## Props Quick Reference

### MapBasic
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `LatLng` | London | Initial center |
| `zoom` | `number` | `13` | Initial zoom (1-18) |
| `height` | `number` | `400` | Container height |
| `enableScrollZoom` | `boolean` | `true` | Mouse wheel zoom |

### MapMarkers (extends Basic)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `markers` | `MapMarker[]` | `[]` | Marker data |
| `showCategories` | `boolean` | `true` | Show filter UI |
| `onMarkerClick` | `function` | - | Click callback |

### MapSearch (extends Basic)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | "Search..." | Input placeholder |
| `debounceMs` | `number` | `300` | Search delay |
| `maxResults` | `number` | `5` | Max suggestions |
| `onLocationSelect` | `function` | - | Selection callback |

### MapLive (extends Basic)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `markers` | `MapMarker[]` | `$bindable([])` | Marker array |
| `enableAddMode` | `boolean` | `true` | Allow adding |
| `maxMarkers` | `number` | `0` | Limit (0=∞) |
| `animateNewMarkers` | `boolean` | `true` | Drop animation |

---

## Dependencies

```bash
bun add leaflet
bun add -D @types/leaflet
```

Also add Leaflet CSS in `app.html`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

---

## Common Patterns

### Cleanup on Unmount

```typescript
$effect(() => {
  // Setup...

  return () => {
    map?.remove();  // Cleanup
  };
});
```

### View State Sync

```typescript
map.on('moveend', () => {
  currentView = {
    center: map.getCenter(),
    zoom: map.getZoom()
  };
});
```
