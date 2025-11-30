/**
 * SvelteKit App Type Declarations
 *
 * This file extends SvelteKit's built-in type definitions to include
 * Clerk authentication types. The svelte-clerk/env reference provides
 * typing for locals.auth() throughout the application.
 *
 * @see https://svelte.dev/docs/kit/types#app.d.ts
 * @see https://svelte-clerk.netlify.app/
 */

/// <reference types="svelte-clerk/env" />

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {} - provided by svelte-clerk/env reference
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
