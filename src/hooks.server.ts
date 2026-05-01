import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth, isBetterAuthConfigured } from '$lib/server/betterAuth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.session = null;
	event.locals.user = null;

	if (!isBetterAuthConfigured()) {
		return resolve(event);
	}

	const session = await auth.api
		.getSession({
			headers: event.request.headers
		})
		.catch((error) => {
			console.error('[Auth] Failed to load Better Auth session:', error);
			return null;
		});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
