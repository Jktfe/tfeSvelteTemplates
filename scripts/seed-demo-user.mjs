import 'dotenv/config';

import { Pool } from '@neondatabase/serverless';
import { betterAuth } from 'better-auth';

const DEFAULT_EMAIL = 'tester@test.com';
const DEFAULT_PASSWORD = 'test1';
const DEFAULT_NAME = 'Demo Tester';

const demoUser = {
	email: process.env.DEMO_USER_EMAIL || process.env.PUBLIC_DEMO_USER_EMAIL || DEFAULT_EMAIL,
	password: process.env.DEMO_USER_PASSWORD || process.env.PUBLIC_DEMO_USER_PASSWORD || DEFAULT_PASSWORD,
	name: process.env.DEMO_USER_NAME || process.env.PUBLIC_DEMO_USER_NAME || DEFAULT_NAME
};

const databaseUrl = process.env.DATABASE_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;
const authBaseUrl = process.env.BETTER_AUTH_URL;

/**
 * @param {string | undefined} url
 */
const isPlaceholderDatabaseUrl = (url) =>
	!url ||
	url.includes('username:password@host.neon.tech') ||
	url.includes('your_connection_string_here');

/**
 * @param {string} message
 * @returns {never}
 */
const fail = (message) => {
	console.error(`Demo user seed failed: ${message}`);
	process.exit(1);
};

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_DEMO_SEED !== 'true') {
	fail('refusing to seed a known demo credential while NODE_ENV=production.');
}

if (isPlaceholderDatabaseUrl(databaseUrl)) {
	fail('set DATABASE_URL to a real Postgres connection string first.');
}

if (!authSecret || authSecret === 'replace_with_a_long_random_secret') {
	fail('set BETTER_AUTH_SECRET to a real secret first.');
}

if (!authBaseUrl) {
	fail('set BETTER_AUTH_URL first, for example http://localhost:5173.');
}

const origin = (() => {
	try {
		return new URL(authBaseUrl);
	} catch {
		fail('set BETTER_AUTH_URL to a valid absolute URL, for example http://localhost:5173.');
	}
})();

const requestHeaders = new Headers({
	host: origin.host,
	origin: origin.origin
});

const pool = new Pool({ connectionString: databaseUrl });

try {
	const auth = betterAuth({
		database: pool,
		secret: authSecret,
		baseURL: authBaseUrl,
		emailAndPassword: {
			enabled: true,
			minPasswordLength: demoUser.password.length
		}
	});

	const existing = await pool.query(
		`
			select
				u.id,
				a.id as credential_account_id
			from "user" u
			left join "account" a
				on a."userId" = u.id
				and a."providerId" = 'credential'
			where lower(u.email) = lower($1)
			limit 1
		`,
		[demoUser.email]
	);

	const existingUser = existing.rows[0];

	if (existingUser?.credential_account_id) {
		console.log(`Demo user already exists: ${demoUser.email}`);
	} else if (existingUser) {
		throw new Error(
			`user ${demoUser.email} already exists without a credential account. ` +
				'Remove or update that user before running this seed.'
		);
	} else {
		await auth.api.signUpEmail({
			body: demoUser,
			headers: requestHeaders
		});

		console.log(`Created demo user: ${demoUser.email}`);
		console.log(`Password: ${demoUser.password}`);
	}
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`Demo user seed failed: ${message}`);
	process.exitCode = 1;
} finally {
	await pool.end();
}
