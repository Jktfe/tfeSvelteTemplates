---
title: GlobePresence
description: High-performance 3D globe visualization for global presence.
category: Geo Visualisations
author: Gemini
---

# GlobePresence

A lightweight, high-performance 3D globe visualization component for displaying global data points, connections, and location-based metadata. It uses a pure Svelte 5 and HTML5 Canvas approach to ensure smooth 60fps performance with zero external dependencies.

## Key Features

- **High-Performance Canvas**: Smooth 60fps auto-rotation and interactive pointer dragging.
- **High-DPI Support**: Automatically scales the canvas for Retina displays.
- **TFE Signature Theme**: Ultra-polished dark theme (Neon on Obsidian) with atmosphere glow.
- **Marker System**: Plottable markers (latitude/longitude) with interactive pulsing and hover tooltips.
- **Accessibility**: Includes a semantically hidden fallback list for screen readers.
- **Zero Dependencies**: Built with Svelte 5 runes and raw canvas math—no WebGL or Three.js needed.

## Usage

```svelte
<script lang="ts">
  import GlobePresence from '$lib/components/GlobePresence.svelte';
  import type { GlobeMarker } from '$lib/types';

  const markers: GlobeMarker[] = [
    { id: '1', name: 'San Francisco', lat: 37.7749, long: -122.4194, label: 'HQ' },
    { id: '2', name: 'London', lat: 51.5074, long: -0.1278, label: 'EMEA' },
    { id: '3', name: 'Tokyo', lat: 35.6762, long: 139.6503, label: 'APAC' }
  ];
</script>

<GlobePresence 
  {markers} 
  autoRotate={true} 
  rotationSpeed={0.003} 
  theme="dark" 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `markers` | `GlobeMarker[]` | `[]` | Array of locations to plot on the globe. |
| `autoRotate` | `boolean` | `true` | Whether the globe should slowly rotate on its own. |
| `rotationSpeed` | `number` | `0.005` | The speed of auto-rotation. |
| `interactive` | `boolean` | `true` | Whether the globe responds to pointer drag events. |
| `theme` | `'dark' \| 'light'` | `'dark'` | Visual theme. Currently focused on the 'Signature' dark theme. |
| `class` | `string` | `''` | Additional Tailwind CSS classes to apply to the container. |

## Types

```typescript
export interface GlobeMarker {
	id: string;
	name: string;
	lat: number;
	long: number;
	value?: number;
	color?: string;
	label?: string;
}
```
