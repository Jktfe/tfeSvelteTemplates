import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { Pool } from '@neondatabase/serverless';
import { betterAuth, type User } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import type { AuthUser } from '$lib/types';
import { isPlaceholderDatabaseUrl } from './dataSource';

const databaseUrl = env.DATABASE_URL;
const authSecret = env.BETTER_AUTH_SECRET;
const authBaseUrl = env.BETTER_AUTH_URL;
const placeholderSecret = 'replace_with_a_long_random_secret';

export const isBetterAuthConfigured = (): boolean =>
	!isPlaceholderDatabaseUrl(databaseUrl) && !!authSecret && authSecret !== placeholderSecret && !!authBaseUrl;

export const auth = betterAuth({
	database: new Pool({
		connectionString: databaseUrl || 'postgresql://disabled:disabled@localhost:5432/disabled'
	}),
	secret: authSecret || 'development-only-better-auth-secret-change-me',
	baseURL: authBaseUrl || 'http://localhost:5173',
	emailAndPassword: {
		enabled: true
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});

export const toAuthUser = (user: User | null | undefined): AuthUser | null => {
	if (!user) return null;

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image ?? null
	};
};
