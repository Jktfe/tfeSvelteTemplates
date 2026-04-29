import type { Photo } from './types';

/**
 * Default photo set shipped with the demo route. 14 cinematic, generic
 * cover gradients with editorial captions. Intentionally asset-free
 * (no Unsplash, no copyrighted titles, no real-photographer credits)
 * so the showcase is safe to publish under OSS.
 */
export const SAMPLE_PHOTOS: Photo[] = [
	{
		id: 'golden-hour',
		caption: 'Golden hour over the marsh',
		category: 'Landscape',
		cover: { from: '#fef3c7', via: '#f59e0b', to: '#7c2d12', accent: '#fde68a' }
	},
	{
		id: 'harbour-blues',
		caption: 'Empty harbour, blue hour',
		category: 'Landscape',
		cover: { from: '#1e3a8a', via: '#3b82f6', to: '#0f172a', accent: '#bfdbfe' }
	},
	{
		id: 'studio-portrait',
		caption: 'Studio portrait, low key',
		category: 'Portrait',
		cover: { from: '#1c1917', via: '#44403c', to: '#0c0a09', accent: '#fde68a' }
	},
	{
		id: 'concrete-rain',
		caption: 'Concrete and rain',
		category: 'Urban',
		cover: { from: '#475569', via: '#64748b', to: '#1e293b', accent: '#cbd5e1' }
	},
	{
		id: 'dune-shadow',
		caption: 'Dune shadow at noon',
		category: 'Travel',
		cover: { from: '#fef3c7', via: '#fbbf24', to: '#92400e', accent: '#fef9c3' }
	},
	{
		id: 'silver-grain',
		caption: 'Silver gelatin, grain study',
		category: 'Monochrome',
		cover: { from: '#e7e5e4', via: '#a8a29e', to: '#1c1917', accent: '#fafaf9' }
	},
	{
		id: 'neon-alley',
		caption: 'Neon alley, midnight',
		category: 'Urban',
		cover: { from: '#831843', via: '#ec4899', to: '#0c0a09', accent: '#fbcfe8' }
	},
	{
		id: 'still-life-iv',
		caption: 'Still life, study iv',
		category: 'Studio',
		cover: { from: '#fef3c7', via: '#a8a29e', to: '#44403c', accent: '#fef3c7' }
	},
	{
		id: 'pine-fog',
		caption: 'Pine forest, dawn fog',
		category: 'Landscape',
		cover: { from: '#064e3b', via: '#10b981', to: '#1e293b', accent: '#a7f3d0' }
	},
	{
		id: 'fashion-mono',
		caption: 'Editorial, monochrome',
		category: 'Fashion',
		cover: { from: '#fafaf9', via: '#a8a29e', to: '#1c1917', accent: '#e7e5e4' }
	},
	{
		id: 'long-exposure',
		caption: 'Long exposure, river dusk',
		category: 'Landscape',
		cover: { from: '#3730a3', via: '#7c3aed', to: '#1e1b4b', accent: '#c4b5fd' }
	},
	{
		id: 'documentary',
		caption: 'Documentary, market square',
		category: 'Documentary',
		cover: { from: '#7c2d12', via: '#dc2626', to: '#1c1917', accent: '#fed7aa' }
	},
	{
		id: 'macro-bloom',
		caption: 'Macro bloom, single stem',
		category: 'Macro',
		cover: { from: '#fbcfe8', via: '#ec4899', to: '#831843', accent: '#fdf2f8' }
	},
	{
		id: 'twilight-pier',
		caption: 'Twilight, empty pier',
		category: 'Travel',
		cover: { from: '#1e3a8a', via: '#7c3aed', to: '#0c0a09', accent: '#c7d2fe' }
	}
];
