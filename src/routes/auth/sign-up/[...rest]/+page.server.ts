import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isBetterAuthConfigured, toAuthUser } from '$lib/server/betterAuth';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectUrl = url.searchParams.get('redirect_url') || '/dashboard';

	if (locals.user) {
		throw redirect(303, redirectUrl);
	}

	return {
		isConfigured: isBetterAuthConfigured(),
		authUser: toAuthUser(locals.user),
		redirectUrl
	};
};
