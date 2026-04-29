import type { Playlist } from './types';

/**
 * Default sample playlists shipped with the demo route. Five unique
 * playlists, intentionally generic (no real channel handles, no private
 * content, no copyrighted titles) so the showcase is safe to publish.
 */
export const SAMPLE_PLAYLISTS: Playlist[] = [
	{
		slug: 'solo-to-saas',
		title: 'Solo to SaaS',
		tag: 'Founder Diary',
		description:
			'A weekly diary of one builder taking a side project from a single-user demo to a paying customer base.',
		cover: { from: '#0f172a', to: '#1e293b', accent: '#f59e0b' },
		episodeCount: 24
	},
	{
		slug: 'type-and-hue',
		title: 'Type & Hue',
		tag: 'Design Practice',
		description:
			'Studio-style sessions on typography pairings, colour systems, and the small craft details that lift a UI.',
		cover: { from: '#7c2d12', to: '#9a3412', accent: '#fef3c7' },
		episodeCount: 18
	},
	{
		slug: 'calm-code',
		title: 'Calm Code',
		tag: 'Pair Programming',
		description:
			'Long-form, low-stakes coding walkthroughs. No drama, no clickbait, just thinking out loud while shipping.',
		cover: { from: '#064e3b', to: '#065f46', accent: '#a7f3d0' },
		episodeCount: 32
	},
	{
		slug: 'tiny-tools',
		title: 'Tiny Tools',
		tag: 'Micro-utilities',
		description:
			'Each episode ships one tiny, focused tool — a bookmarklet, a CLI, a single-file webapp — start to finish.',
		cover: { from: '#1e1b4b', to: '#312e81', accent: '#c4b5fd' },
		episodeCount: 41
	},
	{
		slug: 'ship-logs',
		title: 'Ship Logs',
		tag: 'Release Notes',
		description:
			'Behind-the-release storytelling: the bug that almost shipped, the spec that pivoted, the demo that landed.',
		cover: { from: '#831843', to: '#9d174d', accent: '#fbcfe8' },
		episodeCount: 12
	}
];
