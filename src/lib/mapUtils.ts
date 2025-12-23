import type { LatLng } from './types';

/**
 * Calculate map bounds to fit all markers
 * Shared utility for map components - can be used client-side or server-side
 *
 * @param positions - Array of lat/lng positions
 * @param defaultCenter - Default center when no positions provided (default: Central London)
 * @returns Object with center coordinates and recommended zoom level
 */
export function calculateMapBounds(
	positions: LatLng[],
	defaultCenter: LatLng = { lat: 51.5074, lng: -0.1278 }
): { center: LatLng; zoom: number } {
	if (positions.length === 0) {
		return { center: defaultCenter, zoom: 13 };
	}

	if (positions.length === 1) {
		return { center: positions[0], zoom: 15 };
	}

	const lats = positions.map((p) => p.lat);
	const lngs = positions.map((p) => p.lng);

	const center: LatLng = {
		lat: (Math.min(...lats) + Math.max(...lats)) / 2,
		lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
	};

	// Calculate appropriate zoom based on spread
	const latSpread = Math.max(...lats) - Math.min(...lats);
	const lngSpread = Math.max(...lngs) - Math.min(...lngs);
	const maxSpread = Math.max(latSpread, lngSpread);

	let zoom: number;
	if (maxSpread > 5) zoom = 6;
	else if (maxSpread > 2) zoom = 8;
	else if (maxSpread > 0.5) zoom = 10;
	else if (maxSpread > 0.1) zoom = 12;
	else if (maxSpread > 0.01) zoom = 14;
	else zoom = 15;

	return { center, zoom };
}
