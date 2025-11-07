-- TFE Svelte Templates - Database Schema v2
-- Extension to add support for Marquee, ExpandingCard, and LinkImageHover components
-- Run this after schema.sql to add additional tables

-- ==================================================
-- TESTIMONIALS TABLE (for Marquee components)
-- ==================================================

DROP TABLE IF EXISTS testimonials CASCADE;

CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    avatar VARCHAR(10) DEFAULT '👤',
    category VARCHAR(50) DEFAULT 'general',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX idx_testimonials_category ON testimonials(category);

-- Seed testimonials data
INSERT INTO testimonials (name, role, company, quote, avatar, category, display_order)
SELECT * FROM (VALUES
    -- Static marquee testimonials
    ('Sarah Chen', 'Product Designer', 'TechCorp', 'These components saved us weeks of development time. Absolutely brilliant!', '👩‍💼', 'static', 1),
    ('James Rodriguez', 'Engineering Lead', 'StartupXYZ', 'Clean, performant, and beautifully designed. Exactly what we needed.', '👨‍💻', 'static', 2),
    ('Emily Watson', 'Frontend Developer', 'DesignStudio', 'The TypeScript support and documentation are top-notch. Highly recommend!', '👩‍🎨', 'static', 3),
    ('Michael Park', 'CTO', 'InnovateLabs', 'Production-ready components that just work. Our team loves them!', '👨‍💼', 'static', 4),
    ('Lisa Thompson', 'UI Engineer', 'CloudSystems', 'Responsive, accessible, and easy to customise. Perfect for our projects.', '👩‍🔬', 'static', 5),
    -- Interactive/draggable marquee testimonials
    ('Alex Morgan', 'UX Designer', 'TechFlow', 'The drag interaction is incredibly smooth and intuitive!', '👨‍💼', 'interactive', 6),
    ('Sophia Chen', 'Product Manager', 'InnovateHub', 'Users love being able to control the marquee speed themselves.', '👩‍💻', 'interactive', 7),
    ('Marcus Johnson', 'Developer', 'CodeCraft', 'Easy to implement and the momentum feels natural.', '👨‍🔬', 'interactive', 8),
    ('Emma Wilson', 'Marketing Lead', 'BrandBoost', 'Perfect for showcasing content in an engaging way!', '👩‍💼', 'interactive', 9)
) AS v(name, role, company, quote, avatar, category, display_order)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);

-- ==================================================
-- EXPANDING_CARDS TABLE (for ExpandingCard component)
-- ==================================================

DROP TABLE IF EXISTS expanding_cards CASCADE;

CREATE TABLE expanding_cards (
    id SERIAL PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    compact_text TEXT NOT NULL,
    expanded_text TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255) NOT NULL,
    bg_color VARCHAR(50) DEFAULT 'bg-lime-100',
    category VARCHAR(50) DEFAULT 'general',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expanding_cards_display_order ON expanding_cards(display_order);
CREATE INDEX idx_expanding_cards_category ON expanding_cards(category);

-- Seed expanding cards data
INSERT INTO expanding_cards (heading, compact_text, expanded_text, image_url, image_alt, bg_color, category, display_order)
SELECT * FROM (VALUES
    (
        'Mountain Vista',
        'Towering peaks pierce the clouds',
        'Experience the majesty of towering mountain peaks that pierce through ethereal clouds, creating a breathtaking panorama of nature''s grandeur. The crisp mountain air and pristine snow-capped summits offer an escape into pure wilderness.',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'Mountain landscape with snow-capped peaks',
        'bg-blue-100',
        'nature',
        1
    ),
    (
        'Ocean Depths',
        'The rhythmic dance of azure waves',
        'Discover the mesmerising rhythm of azure waves as they dance endlessly across the vast ocean expanse. The deep blue waters hold countless mysteries, from vibrant coral reefs to majestic marine life that calls these depths home.',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
        'Ocean waves and deep blue water',
        'bg-cyan-100',
        'nature',
        2
    ),
    (
        'Forest Trail',
        'Sunlight filters through emerald canopies',
        'Wander along peaceful forest trails where golden sunlight filters through dense emerald canopies, creating a magical interplay of light and shadow. Ancient trees stand as silent sentinels, their roots deep in the rich forest soil.',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        'Forest path with sunlight through trees',
        'bg-green-100',
        'nature',
        3
    ),
    (
        'Desert Dunes',
        'Golden sands sculpted by endless winds',
        'Marvel at the endless expanse of golden desert dunes, each one sculpted by ancient winds into flowing curves of sand. As the sun sets, the dunes transform into a canvas of warm oranges and deep purples, creating an otherworldly landscape.',
        'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop',
        'Desert sand dunes in golden light',
        'bg-amber-100',
        'nature',
        4
    )
) AS v(heading, compact_text, expanded_text, image_url, image_alt, bg_color, category, display_order)
WHERE NOT EXISTS (SELECT 1 FROM expanding_cards);

-- ==================================================
-- LINK_PREVIEWS TABLE (for LinkImageHover component)
-- ==================================================

DROP TABLE IF EXISTS link_previews CASCADE;

CREATE TABLE link_previews (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    href TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255) NOT NULL,
    image_width VARCHAR(50) DEFAULT 'h-44 w-44',
    target VARCHAR(20) DEFAULT '_blank',
    category VARCHAR(50) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_link_previews_category ON link_previews(category);
CREATE INDEX idx_link_previews_display_order ON link_previews(display_order);

-- Seed link previews data
INSERT INTO link_previews (text, href, image_url, image_alt, category, display_order)
SELECT * FROM (VALUES
    -- City links (using Unsplash images which allow hotlinking)
    ('Mumbai', 'https://en.wikipedia.org/wiki/Mumbai', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=400&fit=crop', 'Mumbai City', 'cities', 1),
    ('New York', 'https://en.wikipedia.org/wiki/New_York_City', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop', 'New York City', 'cities', 2),
    ('Tokyo', 'https://en.wikipedia.org/wiki/Tokyo', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop', 'Tokyo City', 'cities', 3),
    ('London', 'https://en.wikipedia.org/wiki/London', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop', 'London City', 'cities', 4),
    -- Nature links
    ('Mount Everest', 'https://en.wikipedia.org/wiki/Mount_Everest', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'Mount Everest peak', 'nature', 5),
    ('Amazon Rainforest', 'https://en.wikipedia.org/wiki/Amazon_rainforest', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', 'Amazon Rainforest canopy', 'nature', 6),
    ('Great Barrier Reef', 'https://en.wikipedia.org/wiki/Great_Barrier_Reef', 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=400', 'Great Barrier Reef coral', 'nature', 7)
) AS v(text, href, image_url, image_alt, category, display_order)
WHERE NOT EXISTS (SELECT 1 FROM link_previews);

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Uncomment to verify data after running migration:
-- SELECT COUNT(*) as total_testimonials FROM testimonials;
-- SELECT COUNT(*) as total_expanding_cards FROM expanding_cards;
-- SELECT COUNT(*) as total_link_previews FROM link_previews;
