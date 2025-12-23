-- Maps Component Schema
-- Location markers for demonstrating interactive mapping features
-- Part of TFE Svelte Templates project

-- Create map_markers table for storing location data
CREATE TABLE IF NOT EXISTS map_markers (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'default',
    icon_type VARCHAR(50) DEFAULT 'default',
    image_url TEXT,
    metadata JSONB,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for auto-updating updated_at
-- (Uses existing function if it exists from other schemas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_map_markers_updated_at ON map_markers;
CREATE TRIGGER update_map_markers_updated_at
    BEFORE UPDATE ON map_markers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_map_markers_location ON map_markers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_map_markers_category ON map_markers(category);
CREATE INDEX IF NOT EXISTS idx_map_markers_is_active ON map_markers(is_active);

-- ================================================================
-- SEED DATA: UK landmarks and points of interest
-- ================================================================

-- Clear existing seed data (if re-running)
DELETE FROM map_markers WHERE category IN ('landmark', 'museum', 'attraction', 'restaurant');

-- London landmarks
INSERT INTO map_markers (latitude, longitude, title, description, category, icon_type, metadata, display_order) VALUES
    (51.5014, -0.1419, 'Buckingham Palace',
     'The official London residence of the UK''s sovereigns since 1837, featuring the famous Changing of the Guard ceremony.',
     'landmark', 'default',
     '{"address": "Westminster, London SW1A 1AA", "website": "https://www.royal.uk/royal-residences-buckingham-palace", "hours": "Seasonal opening hours"}'::jsonb,
     1),

    (51.5081, -0.0759, 'Tower of London',
     'Historic castle and former royal residence. Home to the Crown Jewels and famous Beefeater guards.',
     'landmark', 'default',
     '{"address": "London EC3N 4AB", "phone": "+44 20 3166 6000", "website": "https://www.hrp.org.uk/tower-of-london/"}'::jsonb,
     2),

    (51.5194, -0.1270, 'British Museum',
     'World-famous museum housing a vast collection of world art and artefacts, including the Rosetta Stone.',
     'museum', 'default',
     '{"address": "Great Russell St, London WC1B 3DG", "hours": "Daily 10:00-17:00", "rating": 4.8}'::jsonb,
     3),

    (51.5033, -0.1195, 'London Eye',
     'Iconic 135m observation wheel on the South Bank offering stunning views across London.',
     'attraction', 'default',
     '{"address": "Riverside Building, London SE1 7PB", "website": "https://www.londoneye.com/"}'::jsonb,
     4),

    (51.5007, -0.1246, 'Houses of Parliament',
     'The meeting place of the House of Commons and House of Lords, home to Big Ben.',
     'landmark', 'default',
     '{"address": "Westminster, London SW1A 0AA", "website": "https://www.parliament.uk/"}'::jsonb,
     5);

-- Other UK cities
INSERT INTO map_markers (latitude, longitude, title, description, category, icon_type, metadata, display_order) VALUES
    (53.4808, -2.2426, 'Manchester Town Hall',
     'Victorian neo-Gothic building and iconic Manchester landmark. Grade I listed.',
     'landmark', 'default',
     '{"address": "Albert Square, Manchester M2 5DB", "tags": ["architecture", "victorian"]}'::jsonb,
     6),

    (55.9533, -3.1883, 'Edinburgh Castle',
     'Historic fortress dominating the skyline of Edinburgh from its position atop Castle Rock.',
     'landmark', 'default',
     '{"address": "Castlehill, Edinburgh EH1 2NG", "website": "https://www.edinburghcastle.scot/"}'::jsonb,
     7),

    (51.4545, -2.5879, 'Clifton Suspension Bridge',
     'Iconic suspension bridge spanning the Avon Gorge, designed by Isambard Kingdom Brunel.',
     'landmark', 'default',
     '{"address": "Bridge Road, Leigh Woods, Bristol BS8 3PA", "tags": ["engineering", "brunel"]}'::jsonb,
     8);

-- Restaurants/cafes (for category filtering demo)
INSERT INTO map_markers (latitude, longitude, title, description, category, icon_type, metadata, display_order) VALUES
    (51.5116, -0.1197, 'Dishoom Covent Garden',
     'Bombay-style cafe serving Indian comfort food in a colonial-era setting.',
     'restaurant', 'pin',
     '{"address": "12 Upper St Martin''s Lane, London WC2H 9FB", "phone": "+44 20 7420 9320", "hours": "08:00-23:00"}'::jsonb,
     9),

    (51.5137, -0.0988, 'Borough Market',
     'London''s most renowned food market, offering fresh produce and street food.',
     'restaurant', 'pin',
     '{"address": "8 Southwark St, London SE1 1TL", "hours": "Mon-Sat 10:00-17:00"}'::jsonb,
     10);

-- ================================================================
-- Verification query
-- ================================================================
-- SELECT COUNT(*) as total_markers,
--        COUNT(DISTINCT category) as categories
-- FROM map_markers WHERE is_active = TRUE;
