/**
 * Shared constants for the CardStack template project
 *
 * This file contains all shared constant values to ensure consistency
 * across the application and prevent duplication.
 */

import type {
	Card,
	Testimonial,
	ExpandingCardData,
	LinkPreview,
	EditorData,
	Employee
} from './types';

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

/**
 * Fallback employee data for DataGrid demos when database is unavailable
 * Used by DataGrid components when DATABASE_URL is not configured
 *
 * Kept in sync with database/schema_datagrid.sql seed data
 * Sample data demonstrating various employee records for grid features
 */
export const FALLBACK_EMPLOYEES: Employee[] = [
	{
		id: 1,
		firstName: 'Sarah',
		lastName: 'Johnson',
		email: 'sarah.johnson@company.com',
		department: 'Engineering',
		position: 'Senior Developer',
		salary: 95000,
		hireDate: '2020-03-15',
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0958',
		notes: 'Team lead for backend services'
	},
	{
		id: 2,
		firstName: 'James',
		lastName: 'Smith',
		email: 'james.smith@company.com',
		department: 'Engineering',
		position: 'DevOps Engineer',
		salary: 88000,
		hireDate: '2021-06-01',
		status: 'active',
		location: 'Manchester',
		phone: '+44 161 850 2000',
		notes: 'AWS infrastructure specialist'
	},
	{
		id: 3,
		firstName: 'Emily',
		lastName: 'Brown',
		email: 'emily.brown@company.com',
		department: 'Design',
		position: 'UX Designer',
		salary: 72000,
		hireDate: '2019-09-20',
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0123',
		notes: 'Leading design system initiative'
	},
	{
		id: 4,
		firstName: 'Michael',
		lastName: 'Davis',
		email: 'michael.davis@company.com',
		department: 'Sales',
		position: 'Account Executive',
		salary: 65000,
		hireDate: '2022-01-10',
		status: 'active',
		location: 'Birmingham',
		phone: '+44 121 234 5678',
		notes: 'Enterprise accounts focus'
	},
	{
		id: 5,
		firstName: 'Jessica',
		lastName: 'Wilson',
		email: 'jessica.wilson@company.com',
		department: 'Marketing',
		position: 'Marketing Manager',
		salary: 78000,
		hireDate: '2020-11-05',
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0456',
		notes: 'Digital marketing campaigns'
	},
	{
		id: 6,
		firstName: 'David',
		lastName: 'Taylor',
		email: 'david.taylor@company.com',
		department: 'Engineering',
		position: 'Frontend Developer',
		salary: 82000,
		hireDate: '2021-03-22',
		status: 'active',
		location: 'Leeds',
		phone: '+44 113 243 2635',
		notes: 'React and Svelte specialist'
	},
	{
		id: 7,
		firstName: 'Laura',
		lastName: 'Anderson',
		email: 'laura.anderson@company.com',
		department: 'HR',
		position: 'HR Manager',
		salary: 70000,
		hireDate: '2018-07-14',
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0789',
		notes: 'Recruitment and onboarding'
	},
	{
		id: 8,
		firstName: 'Robert',
		lastName: 'Thomas',
		email: 'robert.thomas@company.com',
		department: 'Finance',
		position: 'Financial Analyst',
		salary: 68000,
		hireDate: '2021-08-30',
		status: 'active',
		location: 'Edinburgh',
		phone: '+44 131 225 2383',
		notes: 'Budget planning and analysis'
	},
	{
		id: 9,
		firstName: 'Sophie',
		lastName: 'Jackson',
		email: 'sophie.jackson@company.com',
		department: 'Engineering',
		position: 'QA Engineer',
		salary: 75000,
		hireDate: '2020-05-18',
		status: 'active',
		location: 'Bristol',
		phone: '+44 117 927 7000',
		notes: 'Automated testing framework'
	},
	{
		id: 10,
		firstName: 'Daniel',
		lastName: 'White',
		email: 'daniel.white@company.com',
		department: 'Design',
		position: 'Product Designer',
		salary: 76000,
		hireDate: '2019-12-03',
		status: 'active',
		location: 'London',
		phone: '+44 20 7946 0321',
		notes: 'Mobile app design'
	}
];

/**
 * Dropdown options for DataGrid inline editing
 * These define the allowed values for select/dropdown fields
 * Keeps data consistent and prevents invalid entries
 */

/**
 * Department options for employee records
 * Based on schema and seed data
 */
export const DEPARTMENT_OPTIONS = [
	'Engineering',
	'Design',
	'Sales',
	'Marketing',
	'HR',
	'Finance',
	'Customer Success'
] as const;

/**
 * Employment status options
 * Used for filtering and inline editing
 */
export const STATUS_OPTIONS = [
	'active',
	'on-leave',
	'terminated'
] as const;

/**
 * Position/role options
 * Comprehensive list of job titles used in the organisation
 */
export const POSITION_OPTIONS = [
	'Junior Developer',
	'Frontend Developer',
	'Senior Developer',
	'DevOps Engineer',
	'QA Engineer',
	'Data Engineer',
	'Security Engineer',
	'Platform Engineer',
	'Mobile Developer',
	'ML Engineer',
	'CTO',
	'UX Designer',
	'UI Designer',
	'Product Designer',
	'Design Director',
	'Account Executive',
	'Sales Representative',
	'Business Development',
	'Sales Director',
	'Marketing Manager',
	'Content Manager',
	'SEO Specialist',
	'Brand Manager',
	'HR Manager',
	'Recruiter',
	'Financial Analyst',
	'Accountant',
	'CFO',
	'Support Manager',
	'Support Engineer'
] as const;

/**
 * Office location options
 * UK cities and remote option
 */
export const LOCATION_OPTIONS = [
	'London',
	'Manchester',
	'Birmingham',
	'Leeds',
	'Edinburgh',
	'Bristol',
	'Glasgow',
	'Brighton',
	'Liverpool',
	'Cardiff',
	'Cambridge',
	'Oxford',
	'Nottingham',
	'Remote'
] as const;

/**
 * Validation fields mapping for dropdown columns
 * Used by both client-side and server-side validation to ensure consistency
 * Maps employee property names to their allowed values
 */
export const VALIDATION_FIELDS: Record<string, readonly string[]> = {
	department: DEPARTMENT_OPTIONS,
	status: STATUS_OPTIONS,
	position: POSITION_OPTIONS,
	location: LOCATION_OPTIONS
};

/**
 * Transform string array to SVAR Grid options format
 * SVAR Grid expects options as array of objects with { id, label } properties
 *
 * @param options - Array of string values
 * @returns Array of objects with id and label properties
 */
export function transformToGridOptions(options: readonly string[]): Array<{ id: string; label: string }> {
	return options.map(value => ({ id: value, label: value }));
}

/**
 * Pre-transformed options for SVAR Grid editors
 * These are used in DataGridAdvanced for dropdown/select editors
 */
export const DEPARTMENT_OPTIONS_GRID = transformToGridOptions(DEPARTMENT_OPTIONS);
export const STATUS_OPTIONS_GRID = transformToGridOptions(STATUS_OPTIONS);
export const POSITION_OPTIONS_GRID = transformToGridOptions(POSITION_OPTIONS);
export const LOCATION_OPTIONS_GRID = transformToGridOptions(LOCATION_OPTIONS);

// =============================================================================
// SANKEY VISUALIZATION FALLBACK DATA
// =============================================================================

/**
 * Fallback data for Expandable Sankey diagram
 *
 * Hierarchy Structure:
 * - Level 0: Root node (Energy Sources)
 * - Level 1: Main categories (Coal, Gas, Solar) - children of root
 * - Level 2: Subcategories (Plants) - children of categories
 * - Level 3: Destinations (Residential, Industrial) - final nodes
 *
 * Expected Behavior:
 * - Initially show: Root → Coal, Gas, Solar → Residential, Industrial
 * - Click Coal: Expand to show Coal Plant A
 * - Click Coal again: Collapse back to just Coal
 * - Same pattern for Gas (shows Gas Plant A, Gas Plant B)
 * - Solar has no children (not expandable)
 */
export const FALLBACK_SANKEY_DATA = {
	nodes: [
		// Source (single root node - this is what expands)
		{ id: 'energy', label: 'Energy Sources', color: '#6366f1' },

		// Categories (these are expandable groups)
		{ id: 'coal', label: 'Coal', color: '#8B4513', expandable: true },
		{ id: 'gas', label: 'Natural Gas', color: '#4682B4', expandable: true },
		{ id: 'solar', label: 'Solar', color: '#FFD700' },

		// Subcategories (shown when parent is expanded)
		{ id: 'coal-plant-a', label: 'Coal Plant A', color: '#8B4513', parent: 'coal' },
		{ id: 'coal-bbqs', label: 'Coal BBQs', color: '#8B4513', parent: 'coal' },
		{ id: 'gas-plant-a', label: 'Gas Plant A', color: '#4682B4', parent: 'gas' },
		{ id: 'gas-plant-b', label: 'Gas Plant B', color: '#4682B4', parent: 'gas', expandable: true },

		// Sub-subcategories (nested children - shown when grandparent is expanded)
		{ id: 'substation-z', label: 'Substation Z', color: '#4682B4', parent: 'gas-plant-b' },
		{ id: 'substation-y', label: 'Substation Y', color: '#4682B4', parent: 'gas-plant-b' },
		{ id: 'substation-x', label: 'Substation X', color: '#4682B4', parent: 'gas-plant-b' },

		// Destinations (targets - always visible)
		{ id: 'residential', label: 'Residential', color: '#32CD32' },
		{ id: 'industrial', label: 'Industrial', color: '#A0522D' }
	],
	links: [
		// Source to categories
		{ source: 'energy', target: 'coal', value: 12 },
		{ source: 'energy', target: 'gas', value: 29 },
		{ source: 'energy', target: 'solar', value: 13 },

		// Coal to subcategories (only shown when expanded)
		{ source: 'coal', target: 'coal-plant-a', value: 8 },
		{ source: 'coal', target: 'coal-bbqs', value: 4 },

		// Gas to subcategories (only shown when expanded)
		{ source: 'gas', target: 'gas-plant-a', value: 15 },
		{ source: 'gas', target: 'gas-plant-b', value: 14 },

		// Gas Plant B to substations (only shown when Gas Plant B is expanded)
		{ source: 'gas-plant-b', target: 'substation-z', value: 10 },
		{ source: 'gas-plant-b', target: 'substation-y', value: 2 },
		{ source: 'gas-plant-b', target: 'substation-x', value: 2 },

		// Coal subcategories to destinations
		{ source: 'coal-plant-a', target: 'residential', value: 2 },
		{ source: 'coal-plant-a', target: 'industrial', value: 6 },
		{ source: 'coal-bbqs', target: 'residential', value: 4 },

		// Gas Plant A to destinations
		{ source: 'gas-plant-a', target: 'residential', value: 5 },
		{ source: 'gas-plant-a', target: 'industrial', value: 10 },

		// Substations to destinations
		{ source: 'substation-z', target: 'residential', value: 7 },
		{ source: 'substation-z', target: 'industrial', value: 3 },
		{ source: 'substation-y', target: 'residential', value: 2 },
		{ source: 'substation-x', target: 'industrial', value: 2 },

		// Gas Plant B aggregate links (shown when Gas Plant B is NOT expanded)
		{ source: 'gas-plant-b', target: 'residential', value: 9 },
		{ source: 'gas-plant-b', target: 'industrial', value: 5 },

		// Solar direct to destinations (no subcategories)
		{ source: 'solar', target: 'residential', value: 5 },
		{ source: 'solar', target: 'industrial', value: 8 },

		// Coal aggregate links (shown when Coal is NOT expanded)
		{ source: 'coal', target: 'residential', value: 6 },
		{ source: 'coal', target: 'industrial', value: 6 },

		// Gas aggregate links (shown when Gas is NOT expanded)
		{ source: 'gas', target: 'residential', value: 14 },
		{ source: 'gas', target: 'industrial', value: 15 }
	]
};
