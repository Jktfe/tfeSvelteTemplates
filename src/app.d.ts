import type { Session, User } from 'better-auth';
import type { ComponentDocsData } from '$lib/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			/** Server-rendered sibling .md for the current demo route (see +layout.server.ts). */
			componentDocs?: ComponentDocsData | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
