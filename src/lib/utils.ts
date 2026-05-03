import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Re-export escapeHtml from htmlUtils for backward compatibility.
 * Lives in its own file so server-only callers can import it without
 * pulling in any sanitiser dependency.
 */
export { escapeHtml } from './htmlUtils';

/**
 * ⚠️ Currently a no-op pass-through. Despite the name, this does NOT sanitise
 * the input. It exists as a stable seam for callers (CardStack, DataGridBasic)
 * that render untyped HTML via `{@html}`, so a future migration can plug a real
 * sanitiser (e.g. `sanitize-html` as already used in `src/lib/utils/markdown.ts`)
 * in one place.
 *
 * Today this is safe ONLY because the inputs at all current call-sites come
 * from controlled, in-repo fallback data — never user input. If you wire up
 * any user-controlled HTML to these callers, plug a real sanitiser in here
 * FIRST.
 *
 * @param html - Raw HTML string
 * @returns The same HTML, unmodified
 */
export function sanitizeHTML(html: string): string {
	return html;
}

/**
 * Re-export calculateMapBounds from mapUtils for backward compatibility.
 * Lives in its own file so server-only callers can import it without
 * pulling in any sanitiser dependency.
 */
export { calculateMapBounds } from './mapUtils';

/**
 * ⚠️ Currently a no-op pass-through. See `sanitizeHTML` above for the same
 * caveat — the only current caller (`SpeedDial`) feeds in icon strings from
 * the developer, not from end users.
 *
 * @param svg - Raw SVG string
 * @returns The same SVG, unmodified
 */
export function sanitizeSVG(svg: string): string {
	return svg;
}
