-- Editor Data Table Schema
-- This table stores data for the CRUD Editor demo component
-- It demonstrates database integration with graceful fallback patterns

DROP TABLE IF EXISTS editor_data CASCADE;

CREATE TABLE editor_data (
    id SERIAL PRIMARY KEY,
    heading VARCHAR(255) NOT NULL,
    compact_text TEXT NOT NULL,
    expanded_text TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255) NOT NULL,
    bg_color VARCHAR(50) DEFAULT 'bg-lime-100',
    category VARCHAR(50) DEFAULT 'editor-demo',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_editor_data_display_order ON editor_data(display_order);
CREATE INDEX idx_editor_data_category ON editor_data(category);
CREATE INDEX idx_editor_data_is_active ON editor_data(is_active);

-- Auto-update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_editor_data_updated_at
    BEFORE UPDATE ON editor_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for demo
INSERT INTO editor_data (heading, compact_text, expanded_text, image_url, image_alt, bg_color, category, display_order)
VALUES
    (
        'Mountain Wilderness',
        'Explore the untamed beauty of mountain landscapes and discover nature at its finest.',
        'The mountain wilderness offers breathtaking vistas, challenging trails, and an escape from the bustle of everyday life. From snow-capped peaks to alpine meadows, every season brings its own unique charm. Whether you''re an experienced mountaineer or a casual hiker, there''s something magical about standing atop a summit and viewing the world from above.',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
        'Majestic mountain landscape with snow-capped peaks',
        'bg-blue-100',
        'editor-demo',
        1
    ),
    (
        'Ocean Serenity',
        'Dive into the calming waves and peaceful shores of our coastal paradise.',
        'The ocean has a way of putting everything into perspective. The rhythmic sound of waves, the endless horizon, and the salty breeze create a sense of peace that''s hard to find elsewhere. Whether you''re surfing the breaks, swimming in crystal-clear waters, or simply walking along the shore, the ocean offers renewal and inspiration. It''s a reminder of nature''s power and beauty.',
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&auto=format&fit=crop',
        'Peaceful ocean waves at sunset',
        'bg-cyan-100',
        'editor-demo',
        2
    ),
    (
        'Urban Energy',
        'Experience the vibrant pulse of city life where innovation meets culture.',
        'Cities are living organisms, constantly evolving and buzzing with energy. From towering skyscrapers to hidden alleyways, every corner tells a story. The urban landscape is where cultures collide, ideas flourish, and opportunities abound. Street art, diverse cuisines, cutting-edge technology, and historic architecture all coexist in a beautiful chaos. It''s a place where you can reinvent yourself daily and find inspiration around every corner.',
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop',
        'Dynamic city skyline at night with lights',
        'bg-purple-100',
        'editor-demo',
        3
    );
