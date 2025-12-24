/**
 * Geometry utilities for ExplainerCanvas
 *
 * Functions for calculating connection line paths between cards.
 * Supports straight, bezier (curved), and orthogonal (right-angle) line styles.
 *
 * @module ExplainerCanvas/utils/geometry
 */

import type { ExplainerPosition, ConnectionLineStyle } from '$lib/types';

/**
 * Card dimensions for path calculations
 * Used to determine connection anchor points
 */
export interface CardDimensions {
	width: number;
	height: number;
}

/**
 * Default card dimensions (can be overridden)
 */
export const DEFAULT_CARD_WIDTH = 280;
export const DEFAULT_CARD_HEIGHT = 160;

/**
 * Calculate the center point of a card
 *
 * @param position - Card position (top-left corner)
 * @param dimensions - Card width and height
 * @returns Center point coordinates
 */
export function getCardCenter(
	position: ExplainerPosition,
	dimensions: CardDimensions = { width: DEFAULT_CARD_WIDTH, height: DEFAULT_CARD_HEIGHT }
): ExplainerPosition {
	return {
		x: position.x + dimensions.width / 2,
		y: position.y + dimensions.height / 2
	};
}

/**
 * Calculate the best anchor points for connecting two cards
 * Determines which edge of each card provides the shortest/cleanest path
 *
 * @param from - Source card position
 * @param to - Target card position
 * @param dimensions - Card dimensions (same for both)
 * @returns Object with start and end anchor points
 */
export function getConnectionAnchors(
	from: ExplainerPosition,
	to: ExplainerPosition,
	dimensions: CardDimensions = { width: DEFAULT_CARD_WIDTH, height: DEFAULT_CARD_HEIGHT }
): { start: ExplainerPosition; end: ExplainerPosition } {
	const fromCenter = getCardCenter(from, dimensions);
	const toCenter = getCardCenter(to, dimensions);

	// Calculate angle between centers
	const dx = toCenter.x - fromCenter.x;
	const dy = toCenter.y - fromCenter.y;
	const angle = Math.atan2(dy, dx);

	// Determine which sides to connect based on angle
	// Split into 4 quadrants: right, bottom, left, top
	const { width, height } = dimensions;

	let start: ExplainerPosition;
	let end: ExplainerPosition;

	if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
		// Target is to the right
		start = { x: from.x + width, y: from.y + height / 2 };
		end = { x: to.x, y: to.y + height / 2 };
	} else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
		// Target is below
		start = { x: from.x + width / 2, y: from.y + height };
		end = { x: to.x + width / 2, y: to.y };
	} else if (angle >= (-3 * Math.PI) / 4 && angle < -Math.PI / 4) {
		// Target is above
		start = { x: from.x + width / 2, y: from.y };
		end = { x: to.x + width / 2, y: to.y + height };
	} else {
		// Target is to the left
		start = { x: from.x, y: from.y + height / 2 };
		end = { x: to.x + width, y: to.y + height / 2 };
	}

	return { start, end };
}

/**
 * Generate a straight line SVG path
 *
 * @param start - Line start point
 * @param end - Line end point
 * @returns SVG path d attribute
 */
export function getStraightPath(start: ExplainerPosition, end: ExplainerPosition): string {
	return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

/**
 * Generate a bezier curve SVG path
 * Creates a smooth curved line between two points
 *
 * @param start - Line start point
 * @param end - Line end point
 * @returns SVG path d attribute
 */
export function getBezierPath(start: ExplainerPosition, end: ExplainerPosition): string {
	const dx = end.x - start.x;
	const dy = end.y - start.y;

	// Calculate control point offset based on distance
	const controlOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.5 + 50;

	// Determine curve direction based on predominant direction
	let cp1: ExplainerPosition;
	let cp2: ExplainerPosition;

	if (Math.abs(dx) > Math.abs(dy)) {
		// Horizontal connection - curve horizontally
		cp1 = { x: start.x + controlOffset, y: start.y };
		cp2 = { x: end.x - controlOffset, y: end.y };
	} else {
		// Vertical connection - curve vertically
		cp1 = { x: start.x, y: start.y + controlOffset * Math.sign(dy) };
		cp2 = { x: end.x, y: end.y - controlOffset * Math.sign(dy) };
	}

	return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
}

/**
 * Generate an orthogonal (right-angle) SVG path
 * Creates a path with only horizontal and vertical segments
 *
 * @param start - Line start point
 * @param end - Line end point
 * @returns SVG path d attribute
 */
export function getOrthogonalPath(start: ExplainerPosition, end: ExplainerPosition): string {
	const dx = end.x - start.x;
	const dy = end.y - start.y;

	// Midpoint for the routing
	const midX = start.x + dx / 2;
	const midY = start.y + dy / 2;

	// Route based on predominant direction
	if (Math.abs(dx) > Math.abs(dy)) {
		// Horizontal-first routing
		return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
	} else {
		// Vertical-first routing
		return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
	}
}

/**
 * Generate an SVG path between two cards
 *
 * @param fromPos - Source card position
 * @param toPos - Target card position
 * @param lineStyle - Style of connection line
 * @param dimensions - Optional card dimensions
 * @returns SVG path d attribute
 */
export function getConnectionPath(
	fromPos: ExplainerPosition,
	toPos: ExplainerPosition,
	lineStyle: ConnectionLineStyle = 'bezier',
	dimensions?: CardDimensions
): string {
	const { start, end } = getConnectionAnchors(fromPos, toPos, dimensions);

	switch (lineStyle) {
		case 'straight':
			return getStraightPath(start, end);
		case 'orthogonal':
			return getOrthogonalPath(start, end);
		case 'bezier':
		default:
			return getBezierPath(start, end);
	}
}

/**
 * Calculate the bounding box that contains all given positions
 * Useful for fit-to-view calculations
 *
 * @param positions - Array of positions to encompass
 * @param padding - Extra padding around the bounding box
 * @param dimensions - Card dimensions for accurate bounds
 * @returns Bounding box { x, y, width, height }
 */
export function getBoundingBox(
	positions: ExplainerPosition[],
	padding = 50,
	dimensions: CardDimensions = { width: DEFAULT_CARD_WIDTH, height: DEFAULT_CARD_HEIGHT }
): { x: number; y: number; width: number; height: number } {
	if (positions.length === 0) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	const { width, height } = dimensions;

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const pos of positions) {
		minX = Math.min(minX, pos.x);
		minY = Math.min(minY, pos.y);
		maxX = Math.max(maxX, pos.x + width);
		maxY = Math.max(maxY, pos.y + height);
	}

	return {
		x: minX - padding,
		y: minY - padding,
		width: maxX - minX + padding * 2,
		height: maxY - minY + padding * 2
	};
}

/**
 * Calculate the zoom level needed to fit content in viewport
 *
 * @param contentBounds - Bounding box of content
 * @param viewportWidth - Width of viewport
 * @param viewportHeight - Height of viewport
 * @param maxZoomIn - Maximum zoom in level (default: 2)
 * @param maxZoomOut - Maximum zoom out level (default: 0.1)
 * @returns Optimal zoom level
 */
export function calculateFitZoom(
	contentBounds: { width: number; height: number },
	viewportWidth: number,
	viewportHeight: number,
	maxZoomIn = 2,
	maxZoomOut = 0.1
): number {
	const scaleX = viewportWidth / contentBounds.width;
	const scaleY = viewportHeight / contentBounds.height;
	const scale = Math.min(scaleX, scaleY);

	return Math.max(maxZoomOut, Math.min(maxZoomIn, scale));
}

/**
 * Calculate the translation needed to center content in viewport
 *
 * @param contentBounds - Bounding box of content
 * @param viewportWidth - Width of viewport
 * @param viewportHeight - Height of viewport
 * @param zoom - Current zoom level
 * @returns Translation { x, y }
 */
export function calculateCenterTranslation(
	contentBounds: { x: number; y: number; width: number; height: number },
	viewportWidth: number,
	viewportHeight: number,
	zoom: number
): ExplainerPosition {
	const scaledWidth = contentBounds.width * zoom;
	const scaledHeight = contentBounds.height * zoom;

	return {
		x: (viewportWidth - scaledWidth) / 2 - contentBounds.x * zoom,
		y: (viewportHeight - scaledHeight) / 2 - contentBounds.y * zoom
	};
}
