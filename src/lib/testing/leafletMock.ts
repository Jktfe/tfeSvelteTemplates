/**
 * ============================================================
 * Leaflet test double
 * ============================================================
 *
 * The real Leaflet bundle is heavy, touches layout APIs happy-dom
 * doesn't implement, and is the reason the map family used to time
 * out in the full parallel vitest pool. This module is a tiny,
 * dependency-free stand-in that implements only the slice of the
 * Leaflet API our map components call, and records every instance
 * so tests can assert on what the component asked Leaflet to do.
 *
 * Usage in a test file:
 *
 *   import { leafletMock, resetLeafletMock } from '$lib/testing/leafletMock';
 *   vi.mock('leaflet', async () => (await import('$lib/testing/leafletMock')).leafletModule);
 *   beforeEach(() => resetLeafletMock());
 *
 * `vi.mock` is hoisted, so the factory must import lazily (as above)
 * rather than closing over a top-level binding.
 *
 * Caveat: with vitest 4, only the FIRST of several *concurrent*
 * `import('leaflet')` calls is routed to the mock — the rest get the
 * real package. The map components therefore load Leaflet through a
 * single shared `loadLeaflet()` promise, and test files pre-warm the
 * mock in `beforeAll` so a component's first import resolves at once.
 * ============================================================
 */

import { vi } from 'vitest';

type Handler = (event?: any) => void;
type LatLngTuple = [number, number];
type LatLngInput = LatLngTuple | { lat: number; lng: number };
type ViewOptions = Record<string, unknown>;

function toLatLng(input: LatLngInput): { lat: number; lng: number } {
	return Array.isArray(input) ? { lat: input[0], lng: input[1] } : { lat: input.lat, lng: input.lng };
}

/** Minimal event emitter mirroring Leaflet's `Evented` */
class Evented {
	handlers: Record<string, Handler[]> = {};

	on(event: string, handler: Handler) {
		(this.handlers[event] ??= []).push(handler);
		return this;
	}

	off(event: string, handler?: Handler) {
		if (!handler) delete this.handlers[event];
		else this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== handler);
		return this;
	}

	fire(event: string, payload: Record<string, unknown> = {}) {
		for (const handler of this.handlers[event] ?? []) handler({ type: event, target: this, ...payload });
		return this;
	}
}

export class MockMap extends Evented {
	container: HTMLElement;
	options: Record<string, unknown>;
	center: { lat: number; lng: number };
	zoom: number;
	layers = new Set<unknown>();
	removed = false;

	setView = vi.fn<(center: LatLngInput, zoom?: number, options?: ViewOptions) => MockMap>((center, zoom) => {
		this.center = toLatLng(center);
		if (zoom !== undefined) this.zoom = zoom;
		return this;
	});
	panTo = vi.fn<(center: LatLngInput, options?: ViewOptions) => MockMap>((center) => {
		this.center = toLatLng(center);
		return this;
	});
	fitBounds = vi.fn<(bounds: unknown, options?: ViewOptions) => MockMap>(() => this);
	remove = vi.fn(() => {
		this.removed = true;
		return this;
	});

	constructor(container: HTMLElement, options: Record<string, unknown> = {}) {
		super();
		this.container = container;
		this.options = options;
		this.center = toLatLng((options.center as LatLngInput) ?? [0, 0]);
		this.zoom = (options.zoom as number) ?? 0;
	}

	getCenter() {
		return this.center;
	}

	getZoom() {
		return this.zoom;
	}

	addLayer(layer: unknown) {
		this.layers.add(layer);
		return this;
	}

	removeLayer(layer: unknown) {
		this.layers.delete(layer);
		return this;
	}
}

/** Base for anything with `.addTo(map)` / `.remove()` */
class Layer extends Evented {
	map: MockMap | MockLayerGroup | null = null;
	options: Record<string, unknown>;

	constructor(options: Record<string, unknown> = {}) {
		super();
		this.options = options;
	}

	addTo(target: MockMap | MockLayerGroup) {
		this.map = target;
		target.addLayer(this);
		return this;
	}

	remove = vi.fn(() => {
		this.map?.removeLayer(this);
		this.map = null;
		return this;
	});
}

export class MockLayerGroup extends Layer {
	layers = new Set<unknown>();

	addLayer(layer: unknown) {
		this.layers.add(layer);
		return this;
	}

	removeLayer(layer: unknown) {
		this.layers.delete(layer);
		return this;
	}

	clearLayers = vi.fn(() => {
		this.layers.clear();
		return this;
	});
}

/**
 * Popups keep ONE element for their whole life (content is re-rendered
 * into it). That's the worst case for listener hygiene: if a component
 * forgets to detach handlers, they pile up on the same buttons.
 */
export class MockPopup {
	element: HTMLDivElement;
	content: string;
	options: Record<string, unknown>;
	isOpen = false;

	constructor(content: string, options: Record<string, unknown> = {}) {
		this.content = content;
		this.options = options;
		this.element = document.createElement('div');
		this.element.className = 'leaflet-popup';
		this.element.innerHTML = content;
	}

	getElement() {
		return this.element;
	}

	setContent(content: string) {
		this.content = content;
		this.element.innerHTML = content;
	}
}

export class MockMarker extends Layer {
	latlng: { lat: number; lng: number };
	popup: MockPopup | null = null;
	element: HTMLDivElement;

	constructor(latlng: LatLngInput, options: Record<string, unknown> = {}) {
		super(options);
		this.latlng = toLatLng(latlng);
		this.element = document.createElement('div');
		this.element.className = 'leaflet-marker-icon';
	}

	getLatLng() {
		return this.latlng;
	}

	setLatLng = vi.fn((latlng: LatLngInput) => {
		this.latlng = toLatLng(latlng);
		return this;
	});

	getElement() {
		return this.element;
	}

	bindPopup = vi.fn((content: string, options?: Record<string, unknown>) => {
		this.popup = new MockPopup(content, options);
		return this;
	});

	setPopupContent = vi.fn((content: string) => {
		this.popup?.setContent(content);
		return this;
	});

	getPopup() {
		return this.popup;
	}

	openPopup = vi.fn(() => {
		if (!this.popup) return this;
		document.body.appendChild(this.popup.element);
		this.popup.isOpen = true;
		this.fire('popupopen', { popup: this.popup });
		return this;
	});

	closePopup = vi.fn(() => {
		if (!this.popup?.isOpen) return this;
		this.popup.element.remove();
		this.popup.isOpen = false;
		this.fire('popupclose', { popup: this.popup });
		return this;
	});

	/** Test helper: simulate the user dragging the pin to a new spot */
	dragTo(latlng: LatLngInput) {
		this.latlng = toLatLng(latlng);
		this.fire('dragend');
	}
}

export class MockCircle extends Layer {
	latlng: { lat: number; lng: number };
	radius: number;

	constructor(latlng: LatLngInput, options: Record<string, unknown> = {}) {
		super(options);
		this.latlng = toLatLng(latlng);
		this.radius = (options.radius as number) ?? 0;
	}

	setLatLng = vi.fn((latlng: LatLngInput) => {
		this.latlng = toLatLng(latlng);
		return this;
	});

	setRadius = vi.fn((radius: number) => {
		this.radius = radius;
		return this;
	});
}

export class MockPolyline extends Layer {
	latlngs: LatLngTuple[];

	constructor(latlngs: LatLngTuple[], options: Record<string, unknown> = {}) {
		super(options);
		this.latlngs = latlngs;
	}

	setLatLngs = vi.fn((latlngs: LatLngTuple[]) => {
		this.latlngs = latlngs;
		return this;
	});

	getBounds() {
		return { points: this.latlngs };
	}
}

/** Every instance created since the last reset, for assertions */
export const leafletMock = {
	maps: [] as MockMap[],
	markers: [] as MockMarker[],
	layerGroups: [] as MockLayerGroup[],
	circles: [] as MockCircle[],
	polylines: [] as MockPolyline[],
	tileLayers: [] as Layer[],
	divIcons: [] as Record<string, unknown>[]
};

export function resetLeafletMock(): void {
	for (const list of Object.values(leafletMock)) list.length = 0;
	document.querySelectorAll('.leaflet-popup').forEach((el) => el.remove());
}

/** The fake module handed to `vi.mock('leaflet', ...)` */
const L = {
	map: (container: HTMLElement, options?: Record<string, unknown>) => {
		const map = new MockMap(container, options);
		leafletMock.maps.push(map);
		return map;
	},
	tileLayer: (_url: string, options?: Record<string, unknown>) => {
		const layer = new Layer(options);
		leafletMock.tileLayers.push(layer);
		return layer;
	},
	layerGroup: () => {
		const group = new MockLayerGroup();
		leafletMock.layerGroups.push(group);
		return group;
	},
	marker: (latlng: LatLngInput, options?: Record<string, unknown>) => {
		const marker = new MockMarker(latlng, options);
		leafletMock.markers.push(marker);
		return marker;
	},
	circle: (latlng: LatLngInput, options?: Record<string, unknown>) => {
		const circle = new MockCircle(latlng, options);
		leafletMock.circles.push(circle);
		return circle;
	},
	polyline: (latlngs: LatLngTuple[], options?: Record<string, unknown>) => {
		const line = new MockPolyline(latlngs, options);
		leafletMock.polylines.push(line);
		return line;
	},
	divIcon: (options: Record<string, unknown>) => {
		leafletMock.divIcons.push(options);
		return options;
	},
	point: (x: number, y: number) => ({ x, y }),
	latLngBounds: (points: LatLngTuple[]) => ({ points }),
	control: {
		zoom: (options?: Record<string, unknown>) => new Layer(options)
	}
};

export const leafletModule = { ...L, default: L };

/** Wait until the component's async `import('leaflet')` has built a map */
export async function waitForMap(index = 0): Promise<MockMap> {
	await vi.waitFor(() => {
		if (!leafletMock.maps[index]) throw new Error('map not created yet');
	});
	return leafletMock.maps[index];
}

/**
 * Swap the global matchMedia stub for one that reports the given
 * reduced-motion preference. Returns a restore function.
 */
export function mockReducedMotion(reduce: boolean): () => void {
	const original = window.matchMedia;
	window.matchMedia = ((query: string) => ({
		matches: reduce && query.includes('prefers-reduced-motion'),
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false
	})) as typeof window.matchMedia;
	return () => {
		window.matchMedia = original;
	};
}
