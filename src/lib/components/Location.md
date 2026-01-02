# Location Components - Technical Logic Explainer

## Overview

The Location component family provides three specialised mapping components built on **Leaflet.js** for location-focused use cases: geolocation, delivery tracking, and routing.

## Component Variants

| Component | Purpose | Key Feature |
|-----------|---------|-------------|
| **MapLocateMe** | Find user location | Browser Geolocation API with accuracy circle |
| **MapDelivery** | Track deliveries | Animated markers with status and ETA |
| **MapRouting** | Plan routes | OSRM routing with turn-by-turn directions |

## Dependencies

All components use Leaflet.js (same as Maps components):

```bash
bun add leaflet
bun add -D @types/leaflet
```

Add Leaflet CSS in `app.html`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

---

## MapLocateMe - Browser Geolocation

### How It Works

Uses the browser's Geolocation API to find the user's position:

```typescript
navigator.geolocation.getCurrentPosition(
  handleSuccess,
  handleError,
  { enableHighAccuracy, timeout, maximumAge }
);
```

### Accuracy Circle

The blue circle shows position uncertainty:

```typescript
accuracyCircle = L.circle(latLng, {
  radius: result.accuracy,  // metres
  color: '#146ef5',
  fillOpacity: 0.15
}).addTo(map);
```

### Continuous Tracking

Enable `watchPosition` for real-time updates:

```typescript
watchId = navigator.geolocation.watchPosition(
  handleSuccess,
  handleError,
  options
);

// Cleanup on unmount
return () => navigator.geolocation.clearWatch(watchId);
```

### Exported Functions

Parent components can programmatically control the map:

```svelte
<script>
  let mapRef;
</script>

<MapLocateMe bind:this={mapRef} />

<button onclick={() => mapRef.locateMe()}>Find Me</button>
<button onclick={() => mapRef.clearLocation()}>Clear</button>
<button onclick={() => mapRef.stopWatching()}>Stop Tracking</button>
```

### Error Handling

Geolocation errors are mapped to user-friendly messages:

| Error Code | Type | User Message |
|------------|------|--------------|
| 1 | PERMISSION_DENIED | Location access was denied... |
| 2 | POSITION_UNAVAILABLE | Unable to determine your location... |
| 3 | TIMEOUT | Location request timed out... |

---

## MapDelivery - Real-Time Tracking

### Data Flow

```
DeliveryData[] → Component
      ↓
[Status change detection]
      ↓
[XSS escaping for popup content]
      ↓
Leaflet markers with custom icons
      ↓
Callbacks triggered on status changes
```

### Status Change Detection

The component tracks previous status to detect changes:

```typescript
const prevStatus = previousStatuses.get(delivery.id);
if (prevStatus && prevStatus !== delivery.status) {
  onStatusChange?.(delivery, prevStatus);

  if (delivery.status === 'delivered') {
    onDeliveryComplete?.(delivery);
  }
}
previousStatuses.set(delivery.id, delivery.status);
```

### XSS Protection

All user-provided content is escaped:

```typescript
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Usage
const safeLabel = escapeHtml(delivery.label || `Delivery ${delivery.id}`);
const safeDriverName = escapeHtml(delivery.metadata?.driverName);
```

### Animated Movement

Markers smoothly animate to new positions:

```typescript
function animateMarkerTo(marker, targetLat, targetLng, duration, id) {
  const startPos = marker.getLatLng();
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);  // Ease-out cubic

    marker.setLatLng([
      startPos.lat + (targetLat - startPos.lat) * eased,
      startPos.lng + (targetLng - startPos.lng) * eased
    ]);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}
```

### Vehicle Type Icons

Custom SVG icons based on vehicle type:

```typescript
function getVehicleIcon(vehicleType?: string): string {
  switch (vehicleType) {
    case 'bike': return /* bike SVG */;
    case 'van': return /* van SVG */;
    case 'walking': return /* walking SVG */;
    default: return /* car SVG */;
  }
}
```

---

## MapRouting - OSRM Integration

### OSRM API

Uses the Open Source Routing Machine (free, no API key):

```typescript
const url = `${osrmApiUrl}/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
```

### Custom OSRM Server

For production, use your own OSRM server:

```svelte
<MapRouting
  osrmApiUrl="https://your-osrm-server.com"
  ...
/>
```

### Race Condition Prevention

Uses AbortController to cancel stale requests:

```typescript
// Cancel any pending request
if (abortController) {
  abortController.abort();
}
abortController = new AbortController();

try {
  const response = await fetch(url, { signal: abortController.signal });
  // Process response...
} catch (error) {
  // Ignore abort errors
  if (error.name === 'AbortError') return;
  // Handle real errors...
}
```

### Click-to-Set Mode

Users click the map to set origin/destination:

```typescript
map.on('click', (e) => {
  if (clickMode === 'origin') {
    origin = { lat: e.latlng.lat, lng: e.latlng.lng };
    clickMode = 'destination';
  } else if (clickMode === 'destination') {
    destination = { lat: e.latlng.lat, lng: e.latlng.lng };
    clickMode = null;
  }
});
```

### Profile Mapping

OSRM uses different profile names:

| Our Profile | OSRM Profile |
|-------------|--------------|
| `driving` | `car` |
| `cycling` | `bike` |
| `walking` | `foot` |

---

## Props Quick Reference

### MapLocateMe
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `LatLng` | London | Initial center |
| `zoom` | `number` | `13` | Initial zoom |
| `height` | `number` | `400` | Container height |
| `locateZoom` | `number` | `16` | Zoom when located |
| `showAccuracyCircle` | `boolean` | `true` | Show accuracy radius |
| `enableHighAccuracy` | `boolean` | `true` | Use GPS |
| `timeout` | `number` | `10000` | Geolocation timeout (ms) |
| `watchPosition` | `boolean` | `false` | Continuous tracking |
| `buttonPosition` | `string` | `'topright'` | Button placement |
| `onLocate` | `function` | - | Success callback |
| `onError` | `function` | - | Error callback |

### MapDelivery
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `deliveries` | `DeliveryData[]` | `[]` | Delivery data (bindable) |
| `center` | `LatLng` | Auto | Initial center |
| `zoom` | `number` | `13` | Initial zoom |
| `height` | `number` | `500` | Container height |
| `showRoute` | `boolean` | `true` | Show route lines |
| `showETA` | `boolean` | `true` | Show ETA badges |
| `animateMovement` | `boolean` | `true` | Smooth position updates |
| `animationDuration` | `number` | `1000` | Animation time (ms) |
| `autoFitBounds` | `boolean` | `true` | Auto-zoom to show all |
| `onDeliveryClick` | `function` | - | Marker click callback |
| `onStatusChange` | `function` | - | Status change callback |
| `onDeliveryComplete` | `function` | - | Delivery complete callback |

### MapRouting
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `origin` | `LatLng` | - | Start point (bindable) |
| `destination` | `LatLng` | - | End point (bindable) |
| `center` | `LatLng` | London | Initial center |
| `zoom` | `number` | `13` | Initial zoom |
| `height` | `number` | `500` | Container height |
| `profile` | `RoutingProfile` | `'driving'` | Travel mode |
| `osrmApiUrl` | `string` | Public demo | OSRM server URL |
| `showInstructions` | `boolean` | `true` | Show directions panel |
| `showDistance` | `boolean` | `true` | Show distance badge |
| `showDuration` | `boolean` | `true` | Show duration badge |
| `routeColor` | `string` | `'#146ef5'` | Route line colour |
| `routeWeight` | `number` | `5` | Route line width |
| `draggableWaypoints` | `boolean` | `true` | Drag to adjust route |
| `enableClickToSet` | `boolean` | `true` | Click to set points |
| `onRouteCalculated` | `function` | - | Success callback |
| `onRouteError` | `function` | - | Error callback |

---

## Known Warnings

### svelte-check Warnings (Safe to Ignore)

**None currently** - All CSS selectors are correctly scoped.

---

## Common Patterns

### SSR Safety

All components check for browser environment:

```typescript
const isBrowser = typeof window !== 'undefined';

$effect(() => {
  if (!isBrowser || !mapContainer) return;
  // Map initialisation...
});
```

### Reduced Motion Support

Animations respect user preferences:

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (animateMovement && !prefersReducedMotion) {
  animateMarkerTo(...);
} else {
  marker.setLatLng([lat, lng]);
}
```

### Cleanup on Unmount

```typescript
$effect(() => {
  // Setup...

  return () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    animationFrames.forEach(frame => cancelAnimationFrame(frame));
    map?.remove();
  };
});
```

---

## Use Cases

| Component | Best For |
|-----------|----------|
| **MapLocateMe** | Check-in apps, store locators, fitness tracking |
| **MapDelivery** | Food delivery, logistics, fleet management |
| **MapRouting** | Navigation apps, trip planning, distance calculators |

---

## External Dependencies

| Service | Used By | Notes |
|---------|---------|-------|
| OpenStreetMap tiles | All | Free, no API key |
| Browser Geolocation | MapLocateMe | Requires HTTPS |
| OSRM | MapRouting | Free demo or self-hosted |

---

## Security Considerations

1. **XSS Protection**: All user content in popups is escaped
2. **HTTPS Required**: Geolocation requires secure context
3. **Rate Limiting**: OSRM demo server has usage limits - use your own for production
