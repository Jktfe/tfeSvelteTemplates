/**
 * Shared constants for the CardStack template project
 *
 * This file contains all shared constant values to ensure consistency
 * across the application and prevent duplication.
 */

import type { Card, Testimonial, ExpandingCardData, LinkPreview, EditorData } from './types';

/**
 * Fallback card data for when database is unavailable
 * Used by +page.server.ts when DATABASE_URL is not configured
 *
 * These cards use Unsplash images and are kept in sync with database/schema.sql seed data
 */
export const FALLBACK_CARDS: Card[] = [
	{
		title: 'Mountain Vista',
		content:
			'Breathtaking views from the highest peaks, where the air is crisp and the horizon endless.',
		image:
			'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
	},
	{
		title: 'Ocean Waves',
		content: 'The rhythmic dance of waves meeting shore, a timeless symphony of nature.',
		image:
			'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop'
	},
	{
		title: 'Forest Path',
		content: 'Wandering through ancient woods, where sunlight filters through emerald canopies.',
		image:
			'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
	},
	{
		title: 'Desert Dunes',
		content: 'Golden sands sculpted by wind, creating an ever-changing landscape of beauty.',
		image:
			'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop'
	},
	{
		title: 'City Lights',
		content: 'Urban brilliance illuminating the night, a testament to human achievement.',
		image:
			'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop'
	},
	{
		title: 'Northern Lights',
		content:
			"Aurora borealis painting the sky with ethereal colours, nature's greatest light show.",
		image:
			'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop'
	}
];

/**
 * Fallback testimonial data for when database is unavailable
 * Used by Marquee component demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_v2.sql seed data
 */
export const FALLBACK_TESTIMONIALS: Testimonial[] = [
	// Static marquee testimonials
	{
		name: 'Sarah Chen',
		role: 'Product Designer',
		company: 'TechCorp',
		quote: 'These components saved us weeks of development time. Absolutely brilliant!',
		avatar: '👩‍💼',
		category: 'static'
	},
	{
		name: 'James Rodriguez',
		role: 'Engineering Lead',
		company: 'StartupXYZ',
		quote: 'Clean, performant, and beautifully designed. Exactly what we needed.',
		avatar: '👨‍💻',
		category: 'static'
	},
	{
		name: 'Emily Watson',
		role: 'Frontend Developer',
		company: 'DesignStudio',
		quote: 'The TypeScript support and documentation are top-notch. Highly recommend!',
		avatar: '👩‍🎨',
		category: 'static'
	},
	{
		name: 'Michael Park',
		role: 'CTO',
		company: 'InnovateLabs',
		quote: 'Production-ready components that just work. Our team loves them!',
		avatar: '👨‍💼',
		category: 'static'
	},
	{
		name: 'Lisa Thompson',
		role: 'UI Engineer',
		company: 'CloudSystems',
		quote: 'Responsive, accessible, and easy to customise. Perfect for our projects.',
		avatar: '👩‍🔬',
		category: 'static'
	},
	// Interactive/draggable marquee testimonials
	{
		name: 'Alex Morgan',
		role: 'UX Designer',
		company: 'TechFlow',
		quote: 'The drag interaction is incredibly smooth and intuitive!',
		avatar: '👨‍💼',
		category: 'interactive'
	},
	{
		name: 'Sophia Chen',
		role: 'Product Manager',
		company: 'InnovateHub',
		quote: 'Users love being able to control the marquee speed themselves.',
		avatar: '👩‍💻',
		category: 'interactive'
	},
	{
		name: 'Marcus Johnson',
		role: 'Developer',
		company: 'CodeCraft',
		quote: 'Easy to implement and the momentum feels natural.',
		avatar: '👨‍🔬',
		category: 'interactive'
	},
	{
		name: 'Emma Wilson',
		role: 'Marketing Lead',
		company: 'BrandBoost',
		quote: 'Perfect for showcasing content in an engaging way!',
		avatar: '👩‍💼',
		category: 'interactive'
	}
];

/**
 * Fallback expanding card data for when database is unavailable
 * Used by ExpandingCard component demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_v2.sql seed data
 */
export const FALLBACK_EXPANDING_CARDS: ExpandingCardData[] = [
	{
		heading: 'Mountain Vista',
		compactText: 'Towering peaks pierce the clouds',
		expandedText:
			"Experience the majesty of towering mountain peaks that pierce through ethereal clouds, creating a breathtaking panorama of nature's grandeur. The crisp mountain air and pristine snow-capped summits offer an escape into pure wilderness.",
		imageSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
		imageAlt: 'Mountain landscape with snow-capped peaks',
		bgColor: 'bg-blue-100',
		category: 'nature'
	},
	{
		heading: 'Ocean Depths',
		compactText: 'The rhythmic dance of azure waves',
		expandedText:
			'Discover the mesmerising rhythm of azure waves as they dance endlessly across the vast ocean expanse. The deep blue waters hold countless mysteries, from vibrant coral reefs to majestic marine life that calls these depths home.',
		imageSrc: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
		imageAlt: 'Ocean waves and deep blue water',
		bgColor: 'bg-cyan-100',
		category: 'nature'
	},
	{
		heading: 'Forest Trail',
		compactText: 'Sunlight filters through emerald canopies',
		expandedText:
			'Wander along peaceful forest trails where golden sunlight filters through dense emerald canopies, creating a magical interplay of light and shadow. Ancient trees stand as silent sentinels, their roots deep in the rich forest soil.',
		imageSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
		imageAlt: 'Forest path with sunlight through trees',
		bgColor: 'bg-green-100',
		category: 'nature'
	},
	{
		heading: 'Desert Dunes',
		compactText: 'Golden sands sculpted by endless winds',
		expandedText:
			'Marvel at the endless expanse of golden desert dunes, each one sculpted by ancient winds into flowing curves of sand. As the sun sets, the dunes transform into a canvas of warm oranges and deep purples, creating an otherworldly landscape.',
		imageSrc: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop',
		imageAlt: 'Desert sand dunes in golden light',
		bgColor: 'bg-amber-100',
		category: 'nature'
	}
];

/**
 * Fallback link preview data for when database is unavailable
 * Used by LinkImageHover component demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_v2.sql seed data
 */
export const FALLBACK_LINK_PREVIEWS: LinkPreview[] = [
	// City links
	{
		text: 'Mumbai',
		href: 'https://en.wikipedia.org/wiki/Mumbai',
		imageSrc: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=400&fit=crop',
		imageAlt: 'Mumbai City',
		category: 'cities'
	},
	{
		text: 'New York',
		href: 'https://en.wikipedia.org/wiki/New_York_City',
		imageSrc: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop',
		imageAlt: 'New York City',
		category: 'cities'
	},
	{
		text: 'Tokyo',
		href: 'https://en.wikipedia.org/wiki/Tokyo',
		imageSrc: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop',
		imageAlt: 'Tokyo City',
		category: 'cities'
	},
	{
		text: 'London',
		href: 'https://en.wikipedia.org/wiki/London',
		imageSrc: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop',
		imageAlt: 'London City',
		category: 'cities'
	},
	// Nature links
	{
		text: 'Mount Everest',
		href: 'https://en.wikipedia.org/wiki/Mount_Everest',
		imageSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
		imageAlt: 'Mount Everest peak',
		category: 'nature'
	},
	{
		text: 'Amazon Rainforest',
		href: 'https://en.wikipedia.org/wiki/Amazon_rainforest',
		imageSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
		imageAlt: 'Amazon Rainforest canopy',
		category: 'nature'
	},
	{
		text: 'Great Barrier Reef',
		href: 'https://en.wikipedia.org/wiki/Great_Barrier_Reef',
		imageSrc: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400',
		imageAlt: 'Great Barrier Reef coral',
		category: 'nature'
	}
];

/**
 * Fallback editor data for when database is unavailable
 * Used by Editor component CRUD demos when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_editor.sql seed data
 */
export const FALLBACK_EDITOR_DATA: EditorData[] = [
	{
		id: -1,
		heading: 'Mountain Wilderness',
		compactText: 'Explore the untamed beauty of mountain landscapes and discover nature at its finest.',
		expandedText:
			"The mountain wilderness offers breathtaking vistas, challenging trails, and an escape from the bustle of everyday life. From snow-capped peaks to alpine meadows, every season brings its own unique charm. Whether you're an experienced mountaineer or a casual hiker, there's something magical about standing atop a summit and viewing the world from above.",
		imageSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
		imageAlt: 'Majestic mountain landscape with snow-capped peaks',
		bgColor: 'bg-blue-100',
		category: 'editor-demo'
	},
	{
		id: -2,
		heading: 'Ocean Serenity',
		compactText: 'Dive into the calming waves and peaceful shores of our coastal paradise.',
		expandedText:
			"The ocean has a way of putting everything into perspective. The rhythmic sound of waves, the endless horizon, and the salty breeze create a sense of peace that's hard to find elsewhere. Whether you're surfing the breaks, swimming in crystal-clear waters, or simply walking along the shore, the ocean offers renewal and inspiration. It's a reminder of nature's power and beauty.",
		imageSrc: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&auto=format&fit=crop',
		imageAlt: 'Peaceful ocean waves at sunset',
		bgColor: 'bg-cyan-100',
		category: 'editor-demo'
	},
	{
		id: -3,
		heading: 'Urban Energy',
		compactText: 'Experience the vibrant pulse of city life where innovation meets culture.',
		expandedText:
			"Cities are living organisms, constantly evolving and buzzing with energy. From towering skyscrapers to hidden alleyways, every corner tells a story. The urban landscape is where cultures collide, ideas flourish, and opportunities abound. Street art, diverse cuisines, cutting-edge technology, and historic architecture all coexist in a beautiful chaos. It's a place where you can reinvent yourself daily and find inspiration around every corner.",
		imageSrc: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop',
		imageAlt: 'Dynamic city skyline at night with lights',
		bgColor: 'bg-purple-100',
		category: 'editor-demo'
	}
];
