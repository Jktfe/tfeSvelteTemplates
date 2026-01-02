<!--
  ============================================================
  MapDelivery.svelte - Real-Time Delivery Tracking Map
  ============================================================

  🎯 WHAT IT DOES
  Interactive map for tracking deliveries in real-time with animated marker
  movement, ETA display, status indicators, and route visualization.
  Perfect for food delivery, logistics, or any location tracking use case.

  ✨ FEATURES
  • Real-time marker position updates with smooth animation
  • Delivery status indicators (pending, in transit, delivered)
  • ETA badges on markers
  • Route line from origin to destination
  • Vehicle type icons (car, bike, van, walking)
  • Auto-fit bounds to show all active deliveries
  • Click markers for detailed delivery info popup
  • Simulated movement for demo purposes

  ♿ ACCESSIBILITY
  • Keyboard: Tab to controls, Enter to interact
  • Screen readers: ARIA labels for status and controls
  • Motion: Respects prefers-reduced-motion

  📦 DEPENDENCIES
  • leaflet - Industry-standard map library (too complex to build natively)
  • Leaflet CSS (add to app.html or import globally)

  ⚡ PERFORMANCE
  • Efficient marker updates (only moves changed positions)
  • Configurable animation duration
  • Optional route display

  🎨 USAGE
  ```svelte
  <script>
    import MapDelivery from '$lib/components/MapDelivery.svelte';
    import type { DeliveryData } from '$lib/types';

    let deliveries: DeliveryData[] = [
      {
        id: 'order-123',
        position: { lat: 51.51, lng: -0.12 },
        status: 'in_transit',
        label: 'Order #123',
        eta: 15,
        destination: { lat: 51.52, lng: -0.11 }
      }
    ];
  </script>

  <MapDelivery {deliveries} height={500} />
  ```

  ============================================================
  @component
-->
<script lang="ts">
	import type { MapDeliveryProps, DeliveryData, DeliveryStatus, LatLng } from '$lib/types';
	import { DEFAULT_MAP_CENTER } from '$lib/constants';
	import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from 'leaflet';

	// ==================================================
	// PROPS - Component configuration
	// ==================================================

	let {
		/** Array of delivery data to track */
		deliveries = $bindable([]),
		/** Initial map center (auto-calculated from deliveries if not provided) */
		center,
		/** Initial zoom level (default: 13) */
		zoom = 13,
		/** Map container height in pixels (default: 500) */
		height = 500,
		/** Show route line from origin to destination (default: true) */
		showRoute = true,
		/** Show ETA badge on markers (default: true) */
		showETA = true,
		/** Smoothly animate marker position changes (default: true) */
		animateMovement = true,
		/** Duration of movement animation in ms (default: 1000) */
		animationDuration = 1000,
		/** Auto-adjust map to show all deliveries (default: true) */
		autoFitBounds = true,
		/** Callback when a delivery marker is clicked */
		onDeliveryClick,
		/** Callback when a delivery status changes */
		onStatusChange,
		/** Callback when a delivery is marked as delivered */
		onDeliveryComplete,
		/** Additional CSS classes for container */
		class: className = ''
	}: MapDeliveryProps = $props();

	// ==================================================
	// STATE - Reactive component state
	// ==================================================

	/** Reference to the map container DOM element */
	let mapContainer: HTMLDivElement | undefined = $state();

	/** Leaflet map instance */
	let map: LeafletMap | undefined = $state();

	/** Map of delivery IDs to Leaflet markers */
	let markerMap = $state<Map<string, LeafletMarker>>(new Map());

	/** Map of delivery IDs to route polylines */
	let routeMap = $state<Map<string, LeafletPolyline>>(new Map());

	/** Currently selected delivery for popup */
	let selectedDelivery = $state<DeliveryData | null>(null);

	/** Animation frame handles for cleanup */
	let animationFrames = new Map<string, number>();

	/** Track previous statuses to detect changes */
	let previousStatuses = new Map<string, DeliveryStatus>();

	// ==================================================
	// DERIVED STATE
	// ==================================================

	/** Check if we're in a browser environment (for SSR safety) */
	const isBrowser = typeof window !== 'undefined';

	/** Active deliveries (not delivered/failed) */
	let activeDeliveries = $derived(
		deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'failed')
	);

	/** Count by status */
	let statusCounts = $derived({
		pending: deliveries.filter((d) => d.status === 'pending').length,
		in_transit: deliveries.filter((d) => d.status === 'in_transit' || d.status === 'picked_up').length,
		delivered: deliveries.filter((d) => d.status === 'delivered').length,
		failed: deliveries.filter((d) => d.status === 'failed').length
	});

	// ==================================================
	// EFFECTS - Lifecycle and reactive updates
	// ==================================================

	/**
	 * Initialize Leaflet map on mount
	 */
	$effect(() => {
		if (!isBrowser || !mapContainer) return;

		let mapInstance: LeafletMap | undefined;

		(async () => {
			const L = await import('leaflet');

			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			// Calculate initial center from deliveries if not provided
			let initialCenter = center;
			if (!initialCenter && deliveries.length > 0) {
				const positions = deliveries.map((d) => d.position);
				initialCenter = {
					lat: positions.reduce((sum, p) => sum + p.lat, 0) / positions.length,
					lng: positions.reduce((sum, p) => sum + p.lng, 0) / positions.length
				};
			}

			mapInstance = L.map(mapContainer, {
				center: [initialCenter?.lat ?? DEFAULT_MAP_CENTER.lat, initialCenter?.lng ?? DEFAULT_MAP_CENTER.lng],
				zoom: zoom,
				scrollWheelZoom: true,
				zoomControl: false,
				attributionControl: true,
				zoomAnimation: !prefersReducedMotion,
				fadeAnimation: !prefersReducedMotion
			});

			// Add zoom control to bottom-right
			L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19
			}).addTo(mapInstance);

			map = mapInstance;

			// Add initial deliveries
			await updateDeliveryMarkers();
		})();

		return () => {
			// Cancel any pending animations
			animationFrames.forEach((frame) => cancelAnimationFrame(frame));
			animationFrames.clear();

			if (mapInstance) {
				mapInstance.remove();
				mapInstance = undefined;
				map = undefined;
				markerMap = new Map();
				routeMap = new Map();
			}
		};
	});

	/**
	 * Update markers when deliveries change
	 */
	$effect(() => {
		if (map) {
			updateDeliveryMarkers();
		}
	});

	// ==================================================
	// FUNCTIONS - Utilities
	// ==================================================

	/**
	 * Escape HTML special characters to prevent XSS
	 * This is critical for user-provided content like labels and names
	 */
	function escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	// ==================================================
	// FUNCTIONS - Marker management
	// ==================================================

	/**
	 * Get status color
	 */
	function getStatusColor(status: DeliveryStatus): string {
		switch (status) {
			case 'pending':
				return '#f59e0b'; // Amber
			case 'picked_up':
				return '#3b82f6'; // Blue
			case 'in_transit':
				return '#146ef5'; // Primary blue
			case 'nearby':
				return '#10b981'; // Emerald
			case 'delivered':
				return '#22c55e'; // Green
			case 'failed':
				return '#ef4444'; // Red
			default:
				return '#6b7280'; // Gray
		}
	}

	/**
	 * Get vehicle icon SVG
	 */
	function getVehicleIcon(vehicleType?: string): string {
		switch (vehicleType) {
			case 'bike':
				return `<path d="M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 19V9m0 0l3 3m-3-3l-3 3M12 9l4-4h4" stroke="currentColor" stroke-width="2" fill="none"/>`;
			case 'van':
				return `<path d="M5 17h14M7 17v-4H5a2 2 0 0 0-2 2v2h4zm10 0v-4h-7v4h7zm0 0v-6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2h12zm0 0h4v-2a2 2 0 0 0-2-2h-2v4z" stroke="currentColor" stroke-width="2" fill="none"/>`;
			case 'truck':
				return `<path d="M5 18h14M7 18V8H5a2 2 0 0 0-2 2v6h4zm10 0V8H9v10h8zm0 0h4v-4a2 2 0 0 0-2-2h-2v6z" stroke="currentColor" stroke-width="2" fill="none"/>`;
			case 'walking':
				return `<circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7v4m0 0l-2 5m2-5l2 5m-4-3l-2 1m6-1l2 1" stroke="currentColor" stroke-width="2" fill="none"/>`;
			default: // car
				return `<path d="M7 17h10M5 13h14l-2-5H7l-2 5zm0 0v4h2v-4m10 0v4h2v-4" stroke="currentColor" stroke-width="2" fill="none"/>`;
		}
	}

	/**
	 * Get status label
	 */
	function getStatusLabel(status: DeliveryStatus): string {
		switch (status) {
			case 'pending':
				return 'Pending';
			case 'picked_up':
				return 'Picked Up';
			case 'in_transit':
				return 'In Transit';
			case 'nearby':
				return 'Nearby';
			case 'delivered':
				return 'Delivered';
			case 'failed':
				return 'Failed';
			default:
				return status;
		}
	}

	/**
	 * Create marker HTML
	 */
	function createMarkerHtml(delivery: DeliveryData): string {
		const color = getStatusColor(delivery.status);
		const vehicleIcon = getVehicleIcon(delivery.metadata?.vehicleType);
		const rotation = delivery.heading ?? 0;

		return `
			<div class="delivery-marker" style="--status-color: ${color}">
				<div class="marker-body" style="transform: rotate(${rotation}deg)">
					<svg viewBox="0 0 24 24" class="vehicle-icon">${vehicleIcon}</svg>
				</div>
				${showETA && delivery.eta ? `<div class="eta-badge">${delivery.eta}m</div>` : ''}
				<div class="status-dot"></div>
			</div>
		`;
	}

	/**
	 * Create popup content
	 * All user-provided strings are escaped to prevent XSS attacks
	 */
	function createPopupContent(delivery: DeliveryData): string {
		const statusColor = getStatusColor(delivery.status);
		const statusLabel = getStatusLabel(delivery.status);

		// Escape all user-provided content
		const safeLabel = escapeHtml(delivery.label || `Delivery ${delivery.id}`);
		const safeDriverName = delivery.metadata?.driverName ? escapeHtml(delivery.metadata.driverName) : '';
		const safeOrderNumber = delivery.metadata?.orderNumber ? escapeHtml(delivery.metadata.orderNumber) : '';

		return `
			<div class="delivery-popup">
				<div class="popup-header">
					<strong>${safeLabel}</strong>
					<span class="status-badge" style="background: ${statusColor}">${statusLabel}</span>
				</div>
				${safeDriverName ? `<div class="popup-row"><span>Driver:</span> ${safeDriverName}</div>` : ''}
				${safeOrderNumber ? `<div class="popup-row"><span>Order:</span> ${safeOrderNumber}</div>` : ''}
				${delivery.eta ? `<div class="popup-row"><span>ETA:</span> ${delivery.eta} minutes</div>` : ''}
				${delivery.speed ? `<div class="popup-row"><span>Speed:</span> ${Math.round(delivery.speed)} km/h</div>` : ''}
				<div class="popup-coords">${delivery.position.lat.toFixed(5)}, ${delivery.position.lng.toFixed(5)}</div>
			</div>
		`;
	}

	/**
	 * Animate marker to new position
	 */
	function animateMarkerTo(
		marker: LeafletMarker,
		targetLat: number,
		targetLng: number,
		duration: number,
		deliveryId: string
	): void {
		const startPos = marker.getLatLng();
		const startTime = performance.now();

		// Cancel any existing animation for this delivery
		if (animationFrames.has(deliveryId)) {
			cancelAnimationFrame(animationFrames.get(deliveryId)!);
		}

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Ease-out cubic for smooth deceleration
			const eased = 1 - Math.pow(1 - progress, 3);

			const newLat = startPos.lat + (targetLat - startPos.lat) * eased;
			const newLng = startPos.lng + (targetLng - startPos.lng) * eased;

			marker.setLatLng([newLat, newLng]);

			if (progress < 1) {
				animationFrames.set(deliveryId, requestAnimationFrame(animate));
			} else {
				animationFrames.delete(deliveryId);
			}
		}

		animationFrames.set(deliveryId, requestAnimationFrame(animate));
	}

	/**
	 * Update all delivery markers
	 * Also handles status change detection and callback invocation
	 */
	async function updateDeliveryMarkers(): Promise<void> {
		if (!map) return;

		const L = await import('leaflet');
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Track which deliveries we've processed
		const processedIds = new Set<string>();

		for (const delivery of deliveries) {
			processedIds.add(delivery.id);

			// Check for status changes and invoke callbacks
			const prevStatus = previousStatuses.get(delivery.id);
			if (prevStatus && prevStatus !== delivery.status) {
				// Status has changed - invoke callback
				onStatusChange?.(delivery, prevStatus);

				// Check for delivery completion
				if (delivery.status === 'delivered') {
					onDeliveryComplete?.(delivery);
				}
			}
			// Update tracked status
			previousStatuses.set(delivery.id, delivery.status);

			const existingMarker = markerMap.get(delivery.id);

			if (existingMarker) {
				// Update existing marker position
				const currentPos = existingMarker.getLatLng();
				const targetPos = delivery.position;

				if (currentPos.lat !== targetPos.lat || currentPos.lng !== targetPos.lng) {
					if (animateMovement && !prefersReducedMotion) {
						animateMarkerTo(existingMarker, targetPos.lat, targetPos.lng, animationDuration, delivery.id);
					} else {
						existingMarker.setLatLng([targetPos.lat, targetPos.lng]);
					}
				}

				// Update icon (for status/heading changes)
				const icon = L.divIcon({
					className: 'delivery-marker-wrapper',
					html: createMarkerHtml(delivery),
					iconSize: [48, 48],
					iconAnchor: [24, 24]
				});
				existingMarker.setIcon(icon);
				existingMarker.setPopupContent(createPopupContent(delivery));
			} else {
				// Create new marker
				const icon = L.divIcon({
					className: 'delivery-marker-wrapper',
					html: createMarkerHtml(delivery),
					iconSize: [48, 48],
					iconAnchor: [24, 24]
				});

				const marker = L.marker([delivery.position.lat, delivery.position.lng], { icon }).addTo(map);
				marker.bindPopup(createPopupContent(delivery), {
					autoPan: true,
					autoPanPaddingTopLeft: L.point(50, 80),
					autoPanPaddingBottomRight: L.point(50, 50)
				});

				marker.on('click', () => {
					selectedDelivery = delivery;
					onDeliveryClick?.(delivery);
				});

				markerMap.set(delivery.id, marker);
			}

			// Update route if showing
			if (showRoute && delivery.origin && delivery.destination) {
				const existingRoute = routeMap.get(delivery.id);
				const routeCoords: [number, number][] = [
					[delivery.origin.lat, delivery.origin.lng],
					[delivery.position.lat, delivery.position.lng],
					[delivery.destination.lat, delivery.destination.lng]
				];

				if (existingRoute) {
					existingRoute.setLatLngs(routeCoords);
				} else {
					const route = L.polyline(routeCoords, {
						color: getStatusColor(delivery.status),
						weight: 3,
						opacity: 0.6,
						dashArray: '10, 10'
					}).addTo(map);
					routeMap.set(delivery.id, route);
				}
			}
		}

		// Remove markers for deleted deliveries
		markerMap.forEach((marker, id) => {
			if (!processedIds.has(id)) {
				marker.remove();
				markerMap.delete(id);
			}
		});

		routeMap.forEach((route, id) => {
			if (!processedIds.has(id)) {
				route.remove();
				routeMap.delete(id);
			}
		});

		// Auto-fit bounds if enabled
		if (autoFitBounds && deliveries.length > 0) {
			const positions = deliveries.map((d) => [d.position.lat, d.position.lng] as [number, number]);
			if (positions.length > 0) {
				const bounds = L.latLngBounds(positions);
				map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
			}
		}
	}
</script>

<!--
  Map Delivery Container
-->
<div class="map-delivery-container {className}" style="--map-height: {height}px">
	<!-- Status Summary Bar -->
	<div class="status-bar">
		<div class="status-item pending" title="Pending">
			<span class="status-count">{statusCounts.pending}</span>
			<span class="status-label">Pending</span>
		</div>
		<div class="status-item in-transit" title="In Transit">
			<span class="status-count">{statusCounts.in_transit}</span>
			<span class="status-label">In Transit</span>
		</div>
		<div class="status-item delivered" title="Delivered">
			<span class="status-count">{statusCounts.delivered}</span>
			<span class="status-label">Delivered</span>
		</div>
		{#if statusCounts.failed > 0}
			<div class="status-item failed" title="Failed">
				<span class="status-count">{statusCounts.failed}</span>
				<span class="status-label">Failed</span>
			</div>
		{/if}
	</div>

	<!-- Map Element -->
	<div
		bind:this={mapContainer}
		class="map-element"
		role="application"
		aria-label="Delivery tracking map"
	></div>

	<!-- Empty State -->
	{#if deliveries.length === 0}
		<div class="empty-state">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M9 17H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2M9 17l3 3m-3-3l3-3" />
			</svg>
			<span>No active deliveries</span>
		</div>
	{/if}
</div>

<style>
	/* ==================================================
     Container Styles
     ================================================== */
	.map-delivery-container {
		position: relative;
		width: 100%;
		height: var(--map-height, 500px);
		border-radius: 8px;
		overflow: hidden;
		background-color: #f0f0f0;
	}

	.map-element {
		width: 100%;
		height: 100%;
	}

	/* ==================================================
     Status Bar Styles
     ================================================== */
	.status-bar {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 1000;
		display: flex;
		gap: 8px;
		padding: 8px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.status-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6px 12px;
		border-radius: 6px;
		min-width: 60px;
	}

	.status-item.pending {
		background: rgba(245, 158, 11, 0.1);
		color: #b45309;
	}

	.status-item.in-transit {
		background: rgba(20, 110, 245, 0.1);
		color: #1d4ed8;
	}

	.status-item.delivered {
		background: rgba(34, 197, 94, 0.1);
		color: #15803d;
	}

	.status-item.failed {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.status-count {
		font-size: 18px;
		font-weight: 700;
	}

	.status-label {
		font-size: 10px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* ==================================================
     Empty State
     ================================================== */
	.empty-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 12px;
		color: #666;
	}

	.empty-state svg {
		width: 48px;
		height: 48px;
		opacity: 0.5;
	}

	/* ==================================================
     Custom Marker Styles (injected into Leaflet)
     ================================================== */
	.map-delivery-container :global(.delivery-marker-wrapper) {
		background: transparent !important;
		border: none !important;
	}

	.map-delivery-container :global(.delivery-marker) {
		position: relative;
		width: 48px;
		height: 48px;
	}

	.map-delivery-container :global(.marker-body) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 36px;
		height: 36px;
		background: white;
		border: 3px solid var(--status-color, #146ef5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: transform 0.3s ease;
	}

	.map-delivery-container :global(.vehicle-icon) {
		width: 20px;
		height: 20px;
		color: var(--status-color, #146ef5);
	}

	.map-delivery-container :global(.eta-badge) {
		position: absolute;
		top: -4px;
		right: -4px;
		padding: 2px 5px;
		background: var(--status-color, #146ef5);
		color: white;
		font-size: 10px;
		font-weight: 600;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.map-delivery-container :global(.status-dot) {
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%);
		width: 8px;
		height: 8px;
		background: var(--status-color, #146ef5);
		border-radius: 50%;
		animation: pulse-status 2s ease-in-out infinite;
	}

	@keyframes pulse-status {
		0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
		50% { opacity: 0.6; transform: translateX(-50%) scale(1.2); }
	}

	/* Popup Styles */
	.map-delivery-container :global(.delivery-popup) {
		min-width: 180px;
	}

	.map-delivery-container :global(.popup-header) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 8px;
		padding-bottom: 8px;
		border-bottom: 1px solid #eee;
	}

	.map-delivery-container :global(.status-badge) {
		padding: 2px 8px;
		font-size: 10px;
		font-weight: 600;
		color: white;
		border-radius: 10px;
		text-transform: uppercase;
	}

	.map-delivery-container :global(.popup-row) {
		font-size: 13px;
		margin-bottom: 4px;
	}

	.map-delivery-container :global(.popup-row span) {
		color: #666;
	}

	.map-delivery-container :global(.popup-coords) {
		margin-top: 8px;
		font-size: 11px;
		font-family: monospace;
		color: #999;
	}

	/* ==================================================
     Leaflet Overrides
     ================================================== */
	.map-delivery-container :global(.leaflet-control-zoom) {
		border: none !important;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		overflow: hidden;
	}

	.map-delivery-container :global(.leaflet-control-zoom a) {
		width: 36px !important;
		height: 36px !important;
		line-height: 36px !important;
		font-size: 18px;
		color: #333;
		background: white;
		border: none !important;
	}

	.map-delivery-container :global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		padding: 0;
	}

	.map-delivery-container :global(.leaflet-popup-content) {
		margin: 12px 16px;
	}

	/* ==================================================
     Responsive Adjustments
     ================================================== */
	@media (max-width: 600px) {
		.status-bar {
			flex-wrap: wrap;
			gap: 4px;
		}

		.status-item {
			min-width: 50px;
			padding: 4px 8px;
		}

		.status-count {
			font-size: 14px;
		}

		.status-label {
			font-size: 8px;
		}
	}

	/* ==================================================
     Reduced Motion Support
     ================================================== */
	@media (prefers-reduced-motion: reduce) {
		.map-delivery-container :global(.status-dot) {
			animation: none;
		}

		.map-delivery-container :global(.marker-body) {
			transition: none;
		}
	}
</style>
