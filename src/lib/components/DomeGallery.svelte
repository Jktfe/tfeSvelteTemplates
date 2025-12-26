<!--
  ============================================================
  DomeGallery - Interactive 3D Spherical Image Gallery
  ============================================================

  [CR] WHAT IT DOES
  Creates a stunning 3D spherical gallery where images are arranged on a dome surface.
  Uses CSS 3D transforms for rendering, velocity-based physics for inertia, and
  requestAnimationFrame for smooth 60fps animation. Click any image to enlarge it
  with an animated transition.

  [NTL] THE SIMPLE VERSION
  Imagine a snow globe filled with photos instead of snowflakes! You can spin it
  around by dragging, and it keeps spinning when you let go (like a globe on a desk).
  Click any photo to see it bigger. Press Escape or click outside to close it.

  ✨ FEATURES
  • 3D spherical layout using CSS transforms and perspective
  • Smooth drag-to-rotate with physics-based inertia/momentum
  • Click-to-enlarge with animated zoom transitions
  • Responsive radius calculation based on container size
  • Optional grayscale filter for artistic effect
  • Keyboard support (Escape to close enlarged image)
  • Touch and mouse support via Pointer Events API
  • Scroll lock during image enlargement

  ♿ ACCESSIBILITY
  • Keyboard: Enter/Space to open image, Escape to close
  • Screen readers: ARIA labels on image buttons
  • Focus: Images are focusable and keyboard-navigable
  • Motion: Physics can be tuned via dragDampening prop

  📦 DEPENDENCIES
  Zero external dependencies - pure Svelte 5 implementation!

  ⚠️ WARNINGS
  - a11y_no_noninteractive_element_interactions: Required for drag interaction on main element
  - :global() CSS used for scroll lock class (documented below)

  🎨 USAGE
  <DomeGallery
    images={[
      { src: 'image1.jpg', alt: 'Description 1' },
      { src: 'image2.jpg', alt: 'Description 2' },
    ]}
    segments={35}
    grayscale={true}
  />

  📋 PROPS
  | Prop                   | Type       | Default      | Description                           |
  |------------------------|------------|--------------|---------------------------------------|
  | images                 | array      | []           | Array of {src, alt} or string URLs    |
  | fit                    | number     | 0.5          | Radius multiplier (0-1)               |
  | fitBasis               | string     | 'auto'       | Basis for radius: auto/min/max/width/height |
  | minRadius              | number     | 600          | Minimum sphere radius in pixels       |
  | maxRadius              | number     | Infinity     | Maximum sphere radius in pixels       |
  | padFactor              | number     | 0.25         | Viewer padding as factor of size      |
  | overlayBlurColor       | string     | '#060010'    | Colour for edge fade overlay          |
  | maxVerticalRotationDeg | number     | 5            | Max vertical tilt in degrees          |
  | dragSensitivity        | number     | 20           | Lower = more sensitive drag           |
  | enlargeTransitionMs    | number     | 300          | Enlarge animation duration (ms)       |
  | segments               | number     | 35           | Grid segments (more = smaller tiles)  |
  | dragDampening          | number     | 0.8          | Inertia dampening (0-1, higher = longer coast) |
  | openedImageWidth       | string     | '250px'      | Enlarged image width                  |
  | openedImageHeight      | string     | '350px'      | Enlarged image height                 |
  | imageBorderRadius      | string     | '30px'       | Tile border radius                    |
  | openedImageBorderRadius| string     | '30px'       | Enlarged image border radius          |
  | grayscale              | boolean    | true         | Apply grayscale filter to images      |

  Inspired by ReactBits DomeGallery (https://reactbits.dev/components/dome-gallery)
  ============================================================
-->
<script lang="ts">
	// =========================================================================
	// [CR] IMPORTS
	// Type definitions for props and internal data structures
	// =========================================================================
	import type { DomeGalleryProps, DomeGalleryImage, DomeGalleryItem } from '$lib/types';

	// =========================================================================
	// [CR] COMPONENT PROPS
	// All the settings you can customise when using this component
	// [NTL] These are like the knobs and dials on a fancy stereo - tweak them
	//       to get the exact look and feel you want!
	// =========================================================================
	let {
		// [CR] Image data - accepts array of {src, alt} objects or plain URL strings
		images = [],

		// [CR] Radius sizing controls
		// [NTL] These control how big the "snow globe" appears
		fit = 0.5, // Multiplier for container → radius calculation
		fitBasis = 'auto', // What dimension to base radius on
		minRadius = 600, // Don't go smaller than this
		maxRadius = Infinity, // Don't go bigger than this

		// [CR] Visual appearance
		padFactor = 0.25, // Padding around the viewer
		overlayBlurColor = '#060010', // Edge fade colour (dark purple-black)
		grayscale = true, // Apply grayscale filter to images

		// [CR] Interaction tuning
		// [NTL] These control how the globe "feels" when you spin it
		maxVerticalRotationDeg = 5, // How far up/down it can tilt
		dragSensitivity = 20, // Lower = more responsive to small movements
		dragDampening = 0.8, // 0-1: higher = spins longer after letting go

		// [CR] Animation timing
		enlargeTransitionMs = 300, // How fast images zoom in/out

		// [CR] Grid configuration
		// [NTL] More segments = smaller tiles = more images visible
		segments = 35,

		// [CR] Enlarged image sizing
		openedImageWidth = '250px',
		openedImageHeight = '350px',
		imageBorderRadius = '30px',
		openedImageBorderRadius = '30px'
	}: DomeGalleryProps = $props();

	// =========================================================================
	// [CR] PHYSICS CONSTANTS
	// These values were tuned through experimentation to feel natural
	// [NTL] Physics! These numbers make the spinning feel like a real object
	//       with weight and momentum, not a robotic animation
	// =========================================================================

	// [CR] Velocity limits prevent the globe from spinning impossibly fast
	const MAX_VELOCITY = 1.4;
	const VELOCITY_SCALE = 80; // Amplifies small gestures into visible rotation

	// [CR] Friction controls how quickly spinning slows down
	// [NTL] Like how a spinning top gradually loses speed due to air resistance
	const FRICTION_BASE = 0.94;
	const FRICTION_DAMPENING_FACTOR = 0.055;

	// [CR] When velocity drops below this, stop the animation
	const STOP_THRESHOLD_BASE = 0.015;
	const STOP_THRESHOLD_DAMPENING_FACTOR = 0.01;

	// [CR] Frame limits prevent infinite spinning
	const MIN_INERTIA_FRAMES = 90;
	const MAX_INERTIA_FRAMES_FACTOR = 270;

	// [CR] Click vs drag distinction: 4px squared movement threshold
	// [NTL] If you move less than 4 pixels, it's a click. More = a drag.
	const DRAG_THRESHOLD_SQUARED = 16;

	// =========================================================================
	// [CR] ELEMENT REFS
	// Bindings to DOM elements for direct manipulation
	// [NTL] These are like "handles" we grab to move elements around in the DOM
	// =========================================================================
	let rootEl: HTMLDivElement | undefined = $state(); // Outermost container
	let mainEl: HTMLElement | undefined = $state(); // Main interactive area
	let sphereEl: HTMLDivElement | undefined = $state(); // The 3D sphere itself
	let frameEl: HTMLDivElement | undefined = $state(); // Enlarged image frame
	let viewerEl: HTMLDivElement | undefined = $state(); // Viewer overlay container
	let scrimEl: HTMLDivElement | undefined = $state(); // Dark backdrop when enlarged

	// =========================================================================
	// [CR] COMPONENT STATE
	// Reactive and non-reactive state for tracking interaction
	// [NTL] The component's "memory" - what's happening right now
	// =========================================================================

	// [CR] Current rotation of the sphere (reactive - triggers re-render)
	let rotation = $state({ x: 0, y: 0 });

	// [CR] Non-reactive state (plain JS - faster, no re-renders needed)
	let startRot = { x: 0, y: 0 }; // Rotation at drag start
	let startPos: { x: number; y: number } | null = null; // Mouse position at drag start
	let dragging = false; // Is user currently dragging?
	let moved = false; // Has drag exceeded threshold?
	let lastDragEndTime = 0; // Timestamp of last drag end (prevents click after drag)
	let inertiaRAF: number | null = null; // requestAnimationFrame ID for cancellation
	let opening = false; // Is image enlarging animation in progress?
	let openStartedAt = 0; // When enlargement started (prevents instant close)
	let scrollLocked = false; // Is page scroll disabled?
	let lockedRadius: number | null = null; // Cached radius value

	// [CR] Enlarged image state
	let focusedEl: HTMLElement | null = null; // Currently enlarged tile element
	let originalTilePosition: { left: number; top: number; width: number; height: number } | null =
		null; // Where to animate back to
	let enlarging = $state(false); // Is an image currently enlarged? (reactive for CSS)

	// =========================================================================
	// [CR] UTILITY FUNCTIONS
	// Small helper functions used throughout the component
	// [NTL] Little tools in our toolbox that we use again and again
	// =========================================================================

	// [CR] Clamp a value between min and max
	// [NTL] Like a "bouncer" that keeps numbers within allowed limits
	const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

	// [CR] Wrap angle to -180 to +180 range (signed)
	// [NTL] Converts 270° to -90°, making rotation math simpler
	const wrapAngleSigned = (deg: number): number => {
		const a = (((deg + 180) % 360) + 360) % 360;
		return a - 180;
	};

	// [CR] Normalize angle to 0-360 range (unsigned)
	const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;

	// [CR] Extract numeric data attribute with fallback
	const getDataNumber = (el: HTMLElement, name: string, fallback: number): number => {
		const attr = el.dataset[name];
		const n = attr == null ? NaN : parseFloat(attr);
		return Number.isFinite(n) ? n : fallback;
	};

	// =========================================================================
	// [CR] BUILD ITEMS ON SPHERE
	// Creates the grid of image tiles arranged on the sphere surface
	// [NTL] This is where we decide where each photo sits on our "snow globe"!
	// =========================================================================
	function buildItems(pool: (string | DomeGalleryImage)[], seg: number): DomeGalleryItem[] {
		/**
		 * [CR] Create grid coordinates for tiles arranged on the sphere surface.
		 *
		 * The sphere is divided into columns (X axis) and rows (Y axis).
		 * - X columns: Start at -segments and increment by 2, creating seg+1 columns
		 *   to span a full 360° around the sphere's circumference.
		 * - Y rows: Alternate between even (-4,-2,0,2,4) and odd (-3,-1,1,3,5)
		 *   offsets to create a staggered brick-like pattern that tiles well.
		 *
		 * [NTL] Imagine wrapping a grid around a beach ball, but offsetting
		 * every other column like bricks in a wall - that's what we're doing!
		 */
		// [CR] Center the grid around 0 for symmetric 360° coverage
		// With seg columns and step 2, we span (seg-1)*2 units centered at 0
		const GRID_X_START = -(seg - 1); // [CR] Start at -(seg-1) for symmetric centering
		const GRID_X_STEP = 2; // X increment between columns
		const xCols = Array.from({ length: seg }, (_, i) => GRID_X_START + i * GRID_X_STEP);

		// [CR] Staggered Y positions create a brick-like pattern on the sphere
		// [NTL] Like how bricks in a wall are offset - prevents obvious grid lines
		const evenYs = [-4, -2, 0, 2, 4]; // Y offsets for even-indexed columns
		const oddYs = [-3, -1, 1, 3, 5]; // Y offsets for odd-indexed columns

		const coords = xCols.flatMap((x, c) => {
			const ys = c % 2 === 0 ? evenYs : oddYs;
			return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
		});

		const totalSlots = coords.length;
		if (pool.length === 0) {
			return coords.map((c) => ({ ...c, src: '', alt: '' }));
		}

		// [CR] Warn if more images provided than available tile slots
		if (pool.length > totalSlots) {
			console.warn(
				`[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
			);
		}

		// [CR] Normalise images - accept both string URLs and {src, alt} objects
		// [NTL] Makes the component flexible - just pass URLs or detailed objects
		const normalizedImages = pool.map((image) => {
			if (typeof image === 'string') {
				return { src: image, alt: '' };
			}
			return { src: image.src || '', alt: image.alt || '' };
		});

		// [CR] Cycle through images to fill all slots (repeats if fewer images than slots)
		const usedImages = Array.from(
			{ length: totalSlots },
			(_, i) => normalizedImages[i % normalizedImages.length]
		);

		// [CR] Prevent consecutive duplicates by swapping with later non-duplicate
		// [NTL] Stops the same photo appearing next to itself when we repeat images
		for (let i = 1; i < usedImages.length; i++) {
			if (usedImages[i].src === usedImages[i - 1].src) {
				for (let j = i + 1; j < usedImages.length; j++) {
					if (usedImages[j].src !== usedImages[i].src) {
						const tmp = usedImages[i];
						usedImages[i] = usedImages[j];
						usedImages[j] = tmp;
						break;
					}
				}
			}
		}

		return coords.map((c, i) => ({
			...c,
			src: usedImages[i].src,
			alt: usedImages[i].alt
		}));
	}

	/**
	 * [CR] Compute the 3D rotation needed to position an item on the sphere
	 * Uses spherical coordinates: rotateY for longitude, rotateX for latitude
	 *
	 * [NTL] Just like latitude and longitude on Earth - this tells each photo
	 * exactly where to sit on our globe!
	 */
	function computeItemBaseRotation(
		offsetX: number,
		offsetY: number,
		sizeX: number,
		sizeY: number,
		segs: number
	) {
		const unit = 360 / segs / 2; // Degrees per grid unit
		const rotateY = unit * (offsetX + (sizeX - 1) / 2); // Longitude
		const rotateX = unit * (offsetY - (sizeY - 1) / 2); // Latitude
		return { rotateX, rotateY };
	}

	// =========================================================================
	// [CR] DERIVED STATE
	// Computed values that automatically update when dependencies change
	// =========================================================================
	let items = $derived(buildItems(images, segments));

	// =========================================================================
	// [CR] TRANSFORM APPLICATION
	// Applies 3D rotation to the sphere element via CSS transform
	// [NTL] This actually spins the "snow globe" when you drag it!
	// =========================================================================
	function applyTransform(xDeg: number, yDeg: number) {
		if (sphereEl) {
			// [CR] translateZ pushes sphere back, rotateX/Y spins it
			sphereEl.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
		}
	}

	// =========================================================================
	// [CR] SCROLL LOCK
	// Prevents page scrolling when an image is enlarged
	// [NTL] Stops the page from moving while you're looking at a big photo
	// =========================================================================
	function lockScroll() {
		if (scrollLocked) return;
		scrollLocked = true;
		document.body.classList.add('dg-scroll-lock'); // [CR] Uses :global() CSS
	}

	function unlockScroll() {
		if (!scrollLocked) return;
		// [CR] Don't unlock while image is enlarged or user is dragging
		// [NTL] Only let the page scroll again once you've stopped interacting!
		if (enlarging || dragging) return;
		scrollLocked = false;
		document.body.classList.remove('dg-scroll-lock');
	}

	// =========================================================================
	// [CR] INERTIA ANIMATION
	// Physics-based momentum simulation using requestAnimationFrame
	// [NTL] This makes the globe keep spinning after you let go, gradually
	//       slowing down like a real spinning object would!
	// =========================================================================

	// [CR] Cancel any running inertia animation
	function stopInertia() {
		if (inertiaRAF) {
			cancelAnimationFrame(inertiaRAF);
			inertiaRAF = null;
		}
	}

	/**
	 * [CR] Start inertia animation with initial velocity
	 * Uses a rAF loop that applies friction each frame until velocity drops
	 * below threshold or max frames exceeded
	 *
	 * [NTL] Like giving a globe a spin - starts fast, gradually slows down!
	 */
	function startInertia(vx: number, vy: number) {
		// [CR] Clamp and scale velocity to usable range
		let vX = clamp(vx, -MAX_VELOCITY, MAX_VELOCITY) * VELOCITY_SCALE;
		let vY = clamp(vy, -MAX_VELOCITY, MAX_VELOCITY) * VELOCITY_SCALE;
		let frames = 0;

		// [CR] Calculate physics parameters from dampening prop
		const d = clamp(dragDampening ?? 0.8, 0, 1);
		const frictionMul = FRICTION_BASE + FRICTION_DAMPENING_FACTOR * d;
		const stopThreshold = STOP_THRESHOLD_BASE - STOP_THRESHOLD_DAMPENING_FACTOR * d;
		const maxFrames = Math.round(MIN_INERTIA_FRAMES + MAX_INERTIA_FRAMES_FACTOR * d);

		// [CR] Animation step function - called ~60 times per second
		const step = () => {
			// [CR] Apply friction - velocity decays exponentially
			vX *= frictionMul;
			vY *= frictionMul;

			// [CR] Stop conditions: velocity too low OR too many frames
			if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
				inertiaRAF = null;
				return;
			}
			if (++frames > maxFrames) {
				inertiaRAF = null;
				return;
			}

			// [CR] Update rotation (clamped vertically, wrapped horizontally)
			const nextX = clamp(rotation.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
			const nextY = wrapAngleSigned(rotation.y + vX / 200);
			rotation = { x: nextX, y: nextY };
			applyTransform(nextX, nextY);

			// [CR] Schedule next frame
			inertiaRAF = requestAnimationFrame(step);
		};

		stopInertia(); // [CR] Cancel any existing animation first
		inertiaRAF = requestAnimationFrame(step);
	}

	// =========================================================================
	// [CR] DRAG HANDLERS
	// Handle pointer events for rotating the sphere
	// [NTL] These functions detect when you're dragging and spin the globe!
	// =========================================================================

	// [CR] Velocity tracking for inertia calculation
	let lastMoveTime = 0;
	let lastMovePos: { x: number; y: number } | null = null;
	let velocity = { x: 0, y: 0 };

	/**
	 * [CR] Start drag interaction
	 * Captures pointer for smooth dragging outside element bounds
	 * Also locks page scroll to prevent interference during drag
	 */
	function handlePointerDown(e: PointerEvent) {
		if (focusedEl) return; // [CR] Don't drag while image is enlarged
		stopInertia(); // [CR] Stop any ongoing spin

		dragging = true;
		moved = false;
		startRot = { ...rotation };
		startPos = { x: e.clientX, y: e.clientY };
		lastMoveTime = performance.now();
		lastMovePos = { x: e.clientX, y: e.clientY };
		velocity = { x: 0, y: 0 };

		// [CR] Lock page scroll during drag to prevent page movement
		// [NTL] When you start spinning the globe, we stop the page from scrolling!
		lockScroll();

		// [CR] Pointer capture ensures we get events even outside the element
		mainEl?.setPointerCapture(e.pointerId);
	}

	/**
	 * [CR] Update rotation during drag
	 * Calculates velocity for inertia and updates sphere transform
	 */
	function handlePointerMove(e: PointerEvent) {
		if (!dragging || !startPos || focusedEl) return;

		// [CR] Calculate velocity from delta position / delta time
		const now = performance.now();
		const dt = Math.max(1, now - lastMoveTime);

		if (lastMovePos) {
			velocity = {
				x: (e.clientX - lastMovePos.x) / dt,
				y: (e.clientY - lastMovePos.y) / dt
			};
		}

		lastMoveTime = now;
		lastMovePos = { x: e.clientX, y: e.clientY };

		// [CR] Total drag distance from start
		const dxTotal = e.clientX - startPos.x;
		const dyTotal = e.clientY - startPos.y;

		// [CR] Check if drag exceeds click threshold
		// [NTL] This is how we tell a "click" from a "drag"
		if (!moved) {
			const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
			if (dist2 > DRAG_THRESHOLD_SQUARED) moved = true;
		}

		// [CR] Calculate new rotation from drag distance
		const nextX = clamp(
			startRot.x - dyTotal / dragSensitivity,
			-maxVerticalRotationDeg,
			maxVerticalRotationDeg
		);
		const nextY = wrapAngleSigned(startRot.y + dxTotal / dragSensitivity);

		// [CR] Only update if changed (performance optimisation)
		if (rotation.x !== nextX || rotation.y !== nextY) {
			rotation = { x: nextX, y: nextY };
			applyTransform(nextX, nextY);
		}
	}

	/**
	 * [CR] End drag interaction
	 * Releases pointer and starts inertia animation if velocity is significant
	 * Also handles tile clicks since pointer capture prevents tile events from firing
	 */
	function handlePointerUp(e: PointerEvent) {
		if (!dragging) return;

		// [CR] Store moved state before resetting - need it for tile click detection
		const wasMove = moved;

		dragging = false;
		mainEl?.releasePointerCapture(e.pointerId);

		// [CR] Apply inertia based on final velocity
		// [NTL] If you were moving when you let go, the globe keeps spinning!
		const vx = velocity.x * 10;
		const vy = velocity.y * 10;

		if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
			startInertia(vx, vy);
		}

		// [CR] Record drag end time to prevent accidental clicks
		if (wasMove) {
			lastDragEndTime = performance.now();
		}
		moved = false;

		// [CR] Handle tile click - pointer capture means tile events don't fire
		// [NTL] Since we "grabbed" all the mouse events, we need to check if
		//       you clicked on a photo ourselves!
		if (!wasMove && !opening) {
			// [CR] Find the element at click position (pointer capture redirects target)
			const targetEl = document.elementFromPoint(e.clientX, e.clientY);
			// [CR] Look for the clickable tile wrapper with role="button"
			const tileEl = targetEl?.closest('.item__image');
			if (tileEl && tileEl instanceof HTMLElement) {
				openItemFromElement(tileEl);
			}
		}

		// [CR] Unlock scroll now that drag is complete
		// [NTL] You've let go, so the page can scroll normally again!
		unlockScroll();
	}

	// =========================================================================
	// [CR] TILE CLICK HANDLER
	// Complex animation sequence for enlarging and closing images
	// [NTL] This is the "zoom in" magic! When you click a photo, it flies
	//       from its spot on the globe to the centre of the screen
	// =========================================================================

	/**
	 * [CR] Open (enlarge) a tile image
	 * This creates a complex animation where:
	 * 1. We calculate the tile's current screen position
	 * 2. Create an overlay element at that exact position
	 * 3. Animate the overlay from tile position to centre screen
	 * 4. Optionally resize to custom dimensions after first animation
	 *
	 * [NTL] Like picking up a photo from a bulletin board and bringing it
	 *       closer to your face - it zooms smoothly from where it was!
	 */
	function openItemFromElement(el: HTMLElement) {
		// [CR] Prevent multiple simultaneous opens
		if (opening) return;
		opening = true;
		openStartedAt = performance.now();
		lockScroll();

		// [CR] Store reference to the clicked element
		const parent = el.parentElement!;
		focusedEl = el;
		el.setAttribute('data-focused', 'true');

		// [CR] Read tile's grid position from data attributes
		const offsetX = getDataNumber(parent, 'offsetX', 0);
		const offsetY = getDataNumber(parent, 'offsetY', 0);
		const sizeX = getDataNumber(parent, 'sizeX', 2);
		const sizeY = getDataNumber(parent, 'sizeY', 2);

		// [CR] Calculate rotations needed to bring tile to front
		// [NTL] Figures out how much the globe needs to "rotate" this tile forward
		const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
		const parentY = normalizeAngle(parentRot.rotateY);
		const globalY = normalizeAngle(rotation.y);

		let rotY = -(parentY + globalY) % 360;
		if (rotY < -180) rotY += 360;
		const rotX = -parentRot.rotateX - rotation.x;

		// [CR] Apply rotation deltas via CSS custom properties
		parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
		parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

		// [CR] Create invisible reference element to measure final position
		// [NTL] We need to know where the tile WILL BE after rotation to animate correctly
		const refDiv = document.createElement('div');
		refDiv.className = 'item__image item__image--reference';
		// [CR] Get dimensions from the actual tile (CSS inset doesn't work reliably on dynamic elements)
		const elRect = el.getBoundingClientRect();
		refDiv.style.cssText = `opacity:0;position:absolute;inset:10px;width:${elRect.width}px;height:${elRect.height}px;`;
		refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
		parent.appendChild(refDiv);

		// [CR] Force layout calculation (reading offsetHeight triggers reflow)
		void refDiv.offsetHeight;

		// [CR] Measure positions for animation
		const tileR = refDiv.getBoundingClientRect();
		const mainR = mainEl?.getBoundingClientRect();
		const frameR = frameEl?.getBoundingClientRect();

		// [CR] Abort if measurements are invalid
		if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
			opening = false;
			focusedEl = null;
			parent.removeChild(refDiv);
			unlockScroll();
			return;
		}

		// [CR] Store original position for close animation later
		originalTilePosition = {
			left: tileR.left,
			top: tileR.top,
			width: tileR.width,
			height: tileR.height
		};

		// [CR] Hide original tile (we'll show the overlay instead)
		el.style.visibility = 'hidden';
		el.style.zIndex = '0';

		// [CR] Create the enlarged overlay element
		// [NTL] This is the "flying photo" that zooms to the centre
		const overlay = document.createElement('div');
		overlay.className = 'enlarge';
		overlay.style.position = 'absolute';
		overlay.style.left = frameR.left - mainR.left + 'px';
		overlay.style.top = frameR.top - mainR.top + 'px';
		overlay.style.width = frameR.width + 'px';
		overlay.style.height = frameR.height + 'px';
		overlay.style.opacity = '0';
		overlay.style.zIndex = '30';
		overlay.style.willChange = 'transform, opacity';
		overlay.style.transformOrigin = 'top left';
		overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;

		// [CR] Add image to overlay
		const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
		const img = document.createElement('img');
		img.src = rawSrc;
		overlay.appendChild(img);
		viewerEl?.appendChild(overlay);

		// [CR] Calculate initial transform (from tile position to frame position)
		// [NTL] Math to figure out where the photo starts vs where it's going
		const tx0 = tileR.left - frameR.left;
		const ty0 = tileR.top - frameR.top;
		const sx0 = tileR.width / frameR.width;
		const sy0 = tileR.height / frameR.height;

		const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
		const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

		// [CR] Set initial transform (at tile position)
		overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

		// [CR] Trigger animation to full size after next frame
		// [NTL] The 16ms delay ensures the browser has rendered the initial state
		setTimeout(() => {
			if (!overlay.parentElement) return;
			overlay.style.opacity = '1';
			overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
			enlarging = true;
		}, 16);

		// [CR] Handle optional custom sizing (second animation phase)
		// [NTL] If you've set custom width/height, we animate to those after the zoom
		const wantsResize = openedImageWidth || openedImageHeight;
		if (wantsResize) {
			const onFirstEnd = (ev: TransitionEvent) => {
				if (ev.propertyName !== 'transform') return;
				overlay.removeEventListener('transitionend', onFirstEnd);

				// [CR] Disable transition for measurement, then re-enable for resize
				const prevTransition = overlay.style.transition;
				overlay.style.transition = 'none';

				const tempWidth = openedImageWidth || `${frameR.width}px`;
				const tempHeight = openedImageHeight || `${frameR.height}px`;

				// [CR] Measure what size the custom dimensions would be
				overlay.style.width = tempWidth;
				overlay.style.height = tempHeight;
				const newRect = overlay.getBoundingClientRect();

				// [CR] Reset to current size before animating
				overlay.style.width = frameR.width + 'px';
				overlay.style.height = frameR.height + 'px';
				void overlay.offsetWidth; // Force reflow

				overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;

				// [CR] Calculate centred position for new size
				const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
				const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;

				// [CR] Animate to custom size
				requestAnimationFrame(() => {
					overlay.style.left = `${centeredLeft}px`;
					overlay.style.top = `${centeredTop}px`;
					overlay.style.width = tempWidth;
					overlay.style.height = tempHeight;
				});

				// [CR] Restore original transition after resize completes
				const cleanupSecond = () => {
					overlay.removeEventListener('transitionend', cleanupSecond);
					overlay.style.transition = prevTransition;
				};
				overlay.addEventListener('transitionend', cleanupSecond, { once: true });
			};
			overlay.addEventListener('transitionend', onFirstEnd);
		}
	}

	/**
	 * [CR] Close the enlarged image and animate back to original position
	 * Reverse of openItemFromElement - animates overlay back to tile position
	 *
	 * [NTL] Puts the photo back! It flies smoothly back to its spot on the globe
	 */
	function closeEnlarged() {
		// [CR] Prevent closing too quickly after opening (prevents accidental close)
		if (performance.now() - openStartedAt < 250) return;
		if (!focusedEl) return;

		const el = focusedEl;
		const parent = el.parentElement!;
		const overlay = viewerEl?.querySelector('.enlarge');

		if (!overlay) return;

		const refDiv = parent.querySelector('.item__image--reference');
		const originalPos = originalTilePosition;

		// [CR] If we can't animate back, just clean up immediately
		if (!originalPos || !rootEl) {
			overlay.remove();
			if (refDiv) refDiv.remove();
			parent.style.setProperty('--rot-y-delta', '0deg');
			parent.style.setProperty('--rot-x-delta', '0deg');
			el.style.visibility = '';
			el.style.zIndex = '0';
			focusedEl = null;
			enlarging = false;
			opening = false;
			unlockScroll();
			return;
		}

		// [CR] Calculate positions relative to root for animation
		const currentRect = overlay.getBoundingClientRect();
		const rootRect = rootEl.getBoundingClientRect();

		const originalPosRelativeToRoot = {
			left: originalPos.left - rootRect.left,
			top: originalPos.top - rootRect.top,
			width: originalPos.width,
			height: originalPos.height
		};

		const overlayRelativeToRoot = {
			left: currentRect.left - rootRect.left,
			top: currentRect.top - rootRect.top,
			width: currentRect.width,
			height: currentRect.height
		};

		// [CR] Create new overlay for closing animation (cleaner than modifying existing)
		// [NTL] We create a fresh "copy" to animate back - avoids CSS conflicts
		const animatingOverlay = document.createElement('div');
		animatingOverlay.className = 'enlarge-closing';
		animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius: var(--enlarge-radius, 32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;

		// [CR] Clone image into closing overlay
		const originalImg = overlay.querySelector('img');
		if (originalImg) {
			const img = originalImg.cloneNode() as HTMLImageElement;
			img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
			animatingOverlay.appendChild(img);
		}

		// [CR] Swap overlays and trigger closing animation
		overlay.remove();
		rootEl.appendChild(animatingOverlay);
		void animatingOverlay.getBoundingClientRect(); // Force layout

		// [CR] Animate back to original tile position
		requestAnimationFrame(() => {
			animatingOverlay.style.left = originalPosRelativeToRoot.left + 'px';
			animatingOverlay.style.top = originalPosRelativeToRoot.top + 'px';
			animatingOverlay.style.width = originalPosRelativeToRoot.width + 'px';
			animatingOverlay.style.height = originalPosRelativeToRoot.height + 'px';
			animatingOverlay.style.opacity = '0';
		});

		// [CR] Cleanup after animation completes
		// [NTL] Once the animation finishes, we tidy up and show the original tile again
		const cleanup = () => {
			animatingOverlay.remove();
			originalTilePosition = null;

			if (refDiv) refDiv.remove();

			// [CR] Disable transitions during reset to prevent unwanted animations
			parent.style.transition = 'none';
			el.style.transition = 'none';
			parent.style.setProperty('--rot-y-delta', '0deg');
			parent.style.setProperty('--rot-x-delta', '0deg');

			// [CR] Multi-frame cleanup to ensure smooth state reset
			requestAnimationFrame(() => {
				el.style.visibility = '';
				el.style.opacity = '0';
				el.style.zIndex = '0';
				focusedEl = null;
				enlarging = false;

				requestAnimationFrame(() => {
					parent.style.transition = '';
					el.style.transition = 'opacity 300ms ease-out';

					// [CR] Fade the original tile back in
					requestAnimationFrame(() => {
						el.style.opacity = '1';

						setTimeout(() => {
							el.style.transition = '';
							el.style.opacity = '';
							opening = false;
							if (!dragging && !enlarging) {
								document.body.classList.remove('dg-scroll-lock');
							}
						}, 300);
					});
				});
			});
		};

		animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
	}

	/**
	 * [CR] Handle mouse click on tile (fallback for keyboard/screen reader activation)
	 * Primary click handling is done via pointerup for better drag detection
	 * [NTL] This is a backup - mainly for keyboard users who press Enter
	 */
	function handleTileClick(e: MouseEvent) {
		// [CR] Only process if not triggered by pointer (which uses pointerup)
		// Check if this is a keyboard-triggered click (no pointer coordinates)
		const isKeyboardClick = e.detail === 0;
		if (!isKeyboardClick) return; // [CR] Pointer clicks handled by pointerup

		if (opening) return; // [CR] Don't double-open
		openItemFromElement(e.currentTarget as HTMLElement);
	}

	/**
	 * [CR] Handle pointer release on tile (both mouse and touch)
	 * This is the primary click/tap handler for opening images
	 * [NTL] When you click or tap a photo, this opens it up big!
	 */
	function handleTilePointerUp(e: PointerEvent) {
		// [CR] Guard conditions to prevent accidental opens
		if (moved) return; // [CR] User was dragging, not clicking
		if (opening) return; // [CR] Already opening an image

		// [CR] Use setTimeout to let the main pointerup handler run first
		// This ensures dragging is set to false before we open
		const target = e.currentTarget as HTMLElement;
		setTimeout(() => {
			if (!moved && !opening) {
				openItemFromElement(target);
			}
		}, 0);
	}

	// =========================================================================
	// [CR] KEYBOARD HANDLER
	// Global keyboard event handler for accessibility
	// [NTL] Press Escape to close an enlarged photo - essential for keyboard users!
	// =========================================================================

	/**
	 * [CR] Handle keyboard events
	 * Currently only handles Escape to close enlarged images
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeEnlarged();
		}
	}

	// =========================================================================
	// [CR] RESIZE OBSERVER EFFECT
	// Recalculates sphere radius when container size changes
	// [NTL] When you resize the browser window, this makes sure the globe
	//       adjusts to fit nicely in the new space!
	// =========================================================================
	$effect(() => {
		if (!rootEl) return;

		// [CR] ResizeObserver watches for container size changes
		const ro = new ResizeObserver((entries) => {
			const cr = entries[0].contentRect;
			const w = Math.max(1, cr.width);
			const h = Math.max(1, cr.height);
			const minDim = Math.min(w, h);
			const maxDim = Math.max(w, h);
			const aspect = w / h;

			// [CR] Determine which dimension to base radius on
			// [NTL] Different fitBasis options give different visual results
			let basis: number;
			switch (fitBasis) {
				case 'min':
					basis = minDim; // Use smaller dimension
					break;
				case 'max':
					basis = maxDim; // Use larger dimension
					break;
				case 'width':
					basis = w; // Always use width
					break;
				case 'height':
					basis = h; // Always use height
					break;
				default:
					// [CR] 'auto': Use width for wide containers, min for narrow
					basis = aspect >= 1.3 ? w : minDim;
			}

			// [CR] Calculate final radius with guards
			let radius = basis * fit;
			const heightGuard = h * 1.35; // Don't exceed 135% of height
			radius = Math.min(radius, heightGuard);
			radius = clamp(radius, minRadius, maxRadius);
			lockedRadius = Math.round(radius);

			// [CR] Calculate viewer padding (space around the frame)
			const viewerPad = Math.max(8, Math.round(minDim * padFactor));

			// [CR] Apply calculated values as CSS custom properties
			// [NTL] CSS variables let the styles update automatically!
			rootEl!.style.setProperty('--radius', `${lockedRadius}px`);
			rootEl!.style.setProperty('--viewer-pad', `${viewerPad}px`);
			rootEl!.style.setProperty('--overlay-blur-color', overlayBlurColor);
			rootEl!.style.setProperty('--tile-radius', imageBorderRadius);
			rootEl!.style.setProperty('--enlarge-radius', openedImageBorderRadius);
			rootEl!.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');

			// [CR] Re-apply transform with new radius
			applyTransform(rotation.x, rotation.y);
		});

		ro.observe(rootEl);
		// [CR] Cleanup: disconnect observer when component unmounts
		return () => ro.disconnect();
	});

	// =========================================================================
	// [CR] INITIAL TRANSFORM EFFECT
	// Ensures sphere is positioned correctly on mount
	// =========================================================================
	$effect(() => {
		applyTransform(rotation.x, rotation.y);
	});

	// =========================================================================
	// [CR] EVENT LISTENER EFFECT
	// Sets up scrim click and keyboard handlers
	// [NTL] Click the dark background or press Escape to close enlarged images
	// =========================================================================
	$effect(() => {
		if (!scrimEl) return;

		// [CR] Add event listeners
		scrimEl.addEventListener('click', closeEnlarged);
		window.addEventListener('keydown', handleKeyDown);

		// [CR] Cleanup: remove listeners when component unmounts
		return () => {
			scrimEl?.removeEventListener('click', closeEnlarged);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// =========================================================================
	// [CR] SCROLL LOCK CLEANUP EFFECT
	// Ensures scroll lock is removed if component unmounts while image is open
	// [NTL] Safety net - if you navigate away while viewing a photo, scrolling
	//       won't stay broken on the rest of the site!
	// =========================================================================
	$effect(() => {
		return () => {
			document.body.classList.remove('dg-scroll-lock');
		};
	});
</script>

<!-- =========================================================================
     [CR] TEMPLATE STRUCTURE
     The DOM hierarchy for the 3D spherical gallery
     [NTL] Here's the "skeleton" of our component - all the pieces that make
           up the 3D globe and enlarged image viewer!
     ========================================================================= -->

<!-- [CR] Root container - holds all CSS custom properties and state attributes -->
<div
	bind:this={rootEl}
	class="sphere-root"
	data-enlarging={enlarging}
	style="--segments-x: {segments}; --segments-y: {segments}; --overlay-blur-color: {overlayBlurColor}; --tile-radius: {imageBorderRadius}; --enlarge-radius: {openedImageBorderRadius}; --image-filter: {grayscale
		? 'grayscale(1)'
		: 'none'};"
>
	<!-- [CR] Main interactive area - captures all pointer events for drag rotation -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<main
		bind:this={mainEl}
		class="sphere-main"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<!-- [CR] Stage provides perspective for 3D effect -->
		<div class="stage">
			<!-- [CR] Sphere container - rotated via CSS transform -->
			<!-- [NTL] This is the actual "globe" that spins when you drag! -->
			<div bind:this={sphereEl} class="sphere">
				<!-- [CR] Render each image tile on the sphere surface -->
				{#each items as item, i (`${item.x},${item.y},${i}`)}
					<!-- [CR] Item wrapper - positioned on sphere via CSS transforms -->
					<div
						class="item"
						data-src={item.src}
						data-offset-x={item.x}
						data-offset-y={item.y}
						data-size-x={item.sizeX}
						data-size-y={item.sizeY}
						style="--offset-x: {item.x}; --offset-y: {item.y}; --item-size-x: {item.sizeX}; --item-size-y: {item.sizeY};"
					>
						<!-- [CR] Clickable image tile - button role for accessibility -->
						<!-- [NTL] Each photo you can click on - tap or click to enlarge! -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div
							class="item__image"
							role="button"
							tabindex="0"
							aria-label={item.alt || 'Open image'}
							onclick={handleTileClick}
							onpointerup={handleTilePointerUp}
							onkeydown={(e) =>
							(e.key === 'Enter' || e.key === ' ') &&
							(e.preventDefault(), handleTileClick(e as unknown as MouseEvent))}
						>
							<!-- [CR] Image with error handling - shows placeholder gradient if loading fails -->
							<!-- [CR] Using eager loading because lazy doesn't work well with 3D transforms -->
							<!-- [NTL] We load all images right away so the sphere looks full immediately! -->
							<img
								src={item.src}
								draggable="false"
								alt={item.alt}
								loading="eager"
								decoding="async"
								onerror={(e) => {
									const img = e.currentTarget;
									// [NTL] If the image fails to load, show a nice gradient instead
									img.style.display = 'none';
									img.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
								}}
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- [CR] Visual overlays for edge fading effect -->
		<!-- [NTL] These create the "fade to black" effect at the edges of the globe -->
		<div class="overlay"></div>
		<div class="overlay overlay--blur"></div>
		<div class="edge-fade edge-fade--top"></div>
		<div class="edge-fade edge-fade--bottom"></div>

		<!-- [CR] Viewer overlay - appears when an image is enlarged -->
		<!-- [NTL] The dark backdrop and frame that appear when you click a photo -->
		<div bind:this={viewerEl} class="viewer">
			<!-- [CR] Scrim - dark backdrop that closes enlarged image on click -->
			<div bind:this={scrimEl} class="scrim"></div>
			<!-- [CR] Frame - reference position for enlarged image centering -->
			<div bind:this={frameEl} class="frame"></div>
		</div>
	</main>
</div>

<style>
	/* =========================================================================
	   [CR] CSS STYLES
	   All styling for the 3D spherical gallery component
	   [NTL] This is where the visual magic happens! CSS handles the 3D
	         transforms, animations, and the beautiful fade effects.
	   ========================================================================= */

	/* -------------------------------------------------------------------------
	   [CR] GLOBAL SCROLL LOCK
	   Applied to body via classList when an image is enlarged
	   [NTL] Prevents the page from scrolling while you're viewing a big photo
	   Note: Uses :global() because we need to style document.body, not
	         an element inside this component
	   ------------------------------------------------------------------------- */
	:global(.dg-scroll-lock) {
		overflow: hidden !important;
	}

	/* -------------------------------------------------------------------------
	   [CR] ROOT CONTAINER
	   Sets up CSS custom properties used throughout the component
	   [NTL] Think of these as "settings" that control how big the globe is,
	         how items are sized, and how rotation angles are calculated
	   ------------------------------------------------------------------------- */
	.sphere-root {
		position: relative;
		width: 100%;
		height: 100%;
		/* [CR] Default values - overridden by JavaScript ResizeObserver */
		--radius: 520px;
		--viewer-pad: 72px;
		/* [CR] Calculated values based on radius and segment count */
		--circ: calc(var(--radius) * 3.14); /* Circumference */
		--rot-y: calc((360deg / var(--segments-x)) / 2); /* Rotation per segment (horizontal) */
		--rot-x: calc((360deg / var(--segments-y)) / 2); /* Rotation per segment (vertical) */
		--item-width: calc(var(--circ) / var(--segments-x)); /* Tile width */
		--item-height: calc(var(--circ) / var(--segments-y)); /* Tile height */
	}

	/* [CR] Ensure consistent box-sizing for all nested elements */
	.sphere-root :global(*) {
		box-sizing: border-box;
	}

	/* -------------------------------------------------------------------------
	   [CR] 3D TRANSFORM PRESERVATION
	   Critical for nested 3D transforms to work correctly
	   [NTL] Without this, CSS would flatten everything to 2D and the 3D
	         globe effect would break!
	   ------------------------------------------------------------------------- */
	.sphere,
	.item,
	.item__image {
		transform-style: preserve-3d;
	}

	/* -------------------------------------------------------------------------
	   [CR] MAIN CONTAINER
	   The interactive drag area for the sphere
	   ------------------------------------------------------------------------- */
	main.sphere-main {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		overflow: hidden;
		/* [CR] Disable browser touch handling - we handle it ourselves */
		touch-action: none;
		/* [CR] Prevent text selection during drag */
		user-select: none;
		-webkit-user-select: none;
		background: transparent;
	}

	/* -------------------------------------------------------------------------
	   [CR] STAGE (Perspective Container)
	   Provides the 3D perspective effect
	   [NTL] This is like your "viewing distance" from the globe - closer
	         perspective = more dramatic 3D effect
	   ------------------------------------------------------------------------- */
	.stage {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		/* [CR] Perspective distance = 2x radius for natural look */
		perspective: calc(var(--radius) * 2);
		perspective-origin: 50% 50%; /* Look from centre */
		/* [CR] Performance: contain layout/paint to this element */
		contain: layout paint size;
	}

	/* -------------------------------------------------------------------------
	   [CR] SPHERE
	   The rotating 3D sphere container
	   [NTL] This div IS the globe - it's pushed back in 3D space and rotates
	   ------------------------------------------------------------------------- */
	.sphere {
		/* [CR] Push sphere back by its radius (centre of sphere at viewer) */
		transform: translateZ(calc(var(--radius) * -1));
		/* [CR] Hint to browser: this element will animate */
		will-change: transform;
	}

	/* -------------------------------------------------------------------------
	   [CR] OVERLAY (Edge Fade Effect)
	   Radial gradient that fades edges to the background colour
	   [NTL] Creates that nice "looking through a circular window" effect
	   ------------------------------------------------------------------------- */
	.overlay,
	.overlay--blur {
		position: absolute;
		inset: 0;
		margin: auto;
		z-index: 3;
		pointer-events: none; /* Don't block interactions */
	}

	.overlay {
		/* [CR] Radial gradient from transparent centre to coloured edges */
		background-image: radial-gradient(
			rgba(235, 235, 235, 0) 65%,
			var(--overlay-blur-color, #060010) 100%
		);
	}

	/* [CR] Second overlay adds blur at edges for softer transition */
	.overlay--blur {
		/* [CR] Mask to only show blur near edges */
		-webkit-mask-image: radial-gradient(
			rgba(235, 235, 235, 0) 70%,
			var(--overlay-blur-color, #060010) 90%
		);
		mask-image: radial-gradient(
			rgba(235, 235, 235, 0) 70%,
			var(--overlay-blur-color, #060010) 90%
		);
		backdrop-filter: blur(3px);
	}

	/* -------------------------------------------------------------------------
	   [CR] ITEM (Tile Wrapper)
	   Each image tile positioned on the sphere surface
	   [NTL] Like sticky notes on a globe - each one positioned by rotating
	         to its spot, then pushing outward to the surface
	   ------------------------------------------------------------------------- */
	.item {
		/* [CR] Size based on grid units */
		width: calc(var(--item-width) * var(--item-size-x));
		height: calc(var(--item-height) * var(--item-size-y));
		position: absolute;
		/* [CR] Centring trick: extreme insets + margin auto */
		top: -999px;
		bottom: -999px;
		left: -999px;
		right: -999px;
		margin: auto;
		transform-origin: 50% 50%;
		/* [CR] Hide back of tiles (when rotated away from viewer) */
		backface-visibility: hidden;
		transition: transform 300ms;
		/* [CR] Complex transform: rotate to position, then push out to sphere surface
		   rotateY = horizontal position (longitude)
		   rotateX = vertical position (latitude)
		   translateZ = push out to sphere surface
		   rot-y-delta/rot-x-delta = adjustments when enlarging */
		transform: rotateY(
				calc(
					var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)
				)
			)
			rotateX(
				calc(
					var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)
				)
			)
			translateZ(var(--radius));
	}

	/* -------------------------------------------------------------------------
	   [CR] ITEM IMAGE (Clickable Tile)
	   The actual visible, clickable image element
	   ------------------------------------------------------------------------- */
	.item__image {
		position: absolute;
		display: block;
		inset: 10px; /* [NTL] Small gap between tiles */
		border-radius: var(--tile-radius, 12px);
		background: transparent;
		overflow: hidden;
		backface-visibility: hidden;
		transition: transform 300ms;
		cursor: pointer;
		/* [CR] Remove default tap highlight on mobile */
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		pointer-events: auto;
		/* [CR] Force hardware acceleration */
		-webkit-transform: translateZ(0);
		transform: translateZ(0);
	}

	/* [CR] Remove default focus outline (custom styling could be added) */
	.item__image:focus {
		outline: none;
	}

	/* [CR] Image within tile - fills container, maintains aspect ratio */
	.item__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none; /* Events handled by parent */
		backface-visibility: hidden;
		/* [CR] Optional grayscale filter controlled by prop */
		filter: var(--image-filter, none);
	}

	/* -------------------------------------------------------------------------
	   [CR] VIEWER (Enlarged Image Container)
	   Overlay layer for displaying enlarged images
	   [NTL] The "lightbox" area where enlarged photos appear
	   ------------------------------------------------------------------------- */
	.viewer {
		position: absolute;
		inset: 0;
		z-index: 20;
		pointer-events: none; /* Pass through when not enlarging */
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--viewer-pad);
	}

	/* [CR] Frame defines the target area for enlarged images */
	.viewer .frame {
		height: 100%;
		aspect-ratio: 1;
		border-radius: var(--enlarge-radius, 32px);
		display: flex;
	}

	/* [CR] Responsive: switch to width-based sizing on portrait screens */
	@media (max-aspect-ratio: 1/1) {
		.viewer .frame {
			height: auto;
			width: 100%;
		}
	}

	/* -------------------------------------------------------------------------
	   [CR] SCRIM (Dark Backdrop)
	   Semi-transparent background behind enlarged images
	   [NTL] The "dimmed lights" effect when viewing a big photo
	   ------------------------------------------------------------------------- */
	.viewer .scrim {
		position: absolute;
		inset: 0;
		z-index: 10;
		background: rgba(0, 0, 0, 0.4);
		pointer-events: none;
		opacity: 0;
		transition: opacity 500ms ease;
		backdrop-filter: blur(3px);
	}

	/* [CR] Show scrim when an image is enlarged (data attribute controlled by JS) */
	.sphere-root[data-enlarging='true'] .viewer .scrim {
		opacity: 1;
		pointer-events: all; /* Block interactions with globe */
	}

	/* -------------------------------------------------------------------------
	   [CR] ENLARGED IMAGE OVERLAY
	   Dynamically created element for the zoomed image
	   Note: Uses :global() because these elements are created via JS,
	         not in the Svelte template
	   [NTL] The "flying photo" that zooms in from the globe
	   ------------------------------------------------------------------------- */
	.viewer :global(.enlarge) {
		position: absolute;
		z-index: 30;
		border-radius: var(--enlarge-radius, 32px);
		overflow: hidden;
		transition:
			transform 500ms ease,
			opacity 500ms ease;
		transform-origin: top left;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
	}

	.viewer :global(.enlarge img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* [CR] Enlarged images always show in full colour, regardless of grayscale setting */
		filter: none;
	}

	/* [CR] Closing animation overlay - show in colour then transition back to grayscale
	   [NTL] When the photo flies back to the globe, it's still in colour until it lands */
	.sphere-root :global(.enlarge-closing img) {
		filter: none;
	}

	/* -------------------------------------------------------------------------
	   [CR] EDGE FADE (Top/Bottom)
	   Horizontal gradient bars at top and bottom edges
	   [NTL] Extra "fading" at the very top and bottom of the view
	   ------------------------------------------------------------------------- */
	.edge-fade {
		position: absolute;
		left: 0;
		right: 0;
		height: 120px;
		z-index: 5;
		pointer-events: none;
		background: linear-gradient(to bottom, transparent, var(--overlay-blur-color, #060010));
	}

	/* [CR] Top edge: rotated 180° so gradient fades from top down */
	.edge-fade--top {
		top: 0;
		transform: rotate(180deg);
	}

	/* [CR] Bottom edge: gradient fades from bottom up (default direction) */
	.edge-fade--bottom {
		bottom: 0;
	}
</style>
