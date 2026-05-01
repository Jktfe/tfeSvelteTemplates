import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { isBetterAuthConfigured, toAuthUser } from '$lib/server/betterAuth';

const getDemoCredentials = () => {
	if (publicEnv.PUBLIC_DEMO_AUTH !== 'true') return null;

	return {
		email: publicEnv.PUBLIC_DEMO_USER_EMAIL || 'tester@test.com',
		password: publicEnv.PUBLIC_DEMO_USER_PASSWORD || 'test1'
	};
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectUrl = url.searchParams.get('redirect_url') || '/dashboard';

	if (locals.user) {
		throw redirect(303, redirectUrl);
	}

	return {
		isConfigured: isBetterAuthConfigured(),
		authUser: toAuthUser(locals.user),
		redirectUrl,
		demoCredentials: getDemoCredentials()
	};
};
