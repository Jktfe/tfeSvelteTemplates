/**
 * Page Configuration
 *
 * Disables SSR for this page. The card-stack demos rely on client-side
 * DOM measurement and FLIP-style animation that has no meaningful
 * server-rendered form, so rendering them only in the browser avoids
 * hydration mismatches without any loss of content.
 */

export const ssr = false;
