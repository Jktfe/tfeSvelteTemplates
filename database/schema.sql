-- Card Stack Template Database Schema
-- This table stores card data for the CardStack component examples
-- Run this in your Neon database console to set up the schema

CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on display_order for efficient sorting
CREATE INDEX IF NOT EXISTS idx_cards_display_order ON cards(display_order);

-- Seed data: Example cards with beautiful images
-- Note: Using placeholder images for demo purposes
INSERT INTO cards (title, description, image_url, display_order) VALUES
('Mountain Vista', 'Breathtaking views from the highest peaks, where the air is crisp and the horizon endless.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', 1),
('Ocean Waves', 'The rhythmic dance of waves meeting shore, a timeless symphony of nature.', 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop', 2),
('Forest Path', 'Wandering through ancient woods, where sunlight filters through emerald canopies.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', 3),
('Desert Dunes', 'Golden sands sculpted by wind, creating an ever-changing landscape of beauty.', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop', 4),
('City Lights', 'Urban brilliance illuminating the night, a testament to human achievement.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop', 5),
('Northern Lights', 'Aurora borealis painting the sky with ethereal colours, nature\'s greatest light show.', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop', 6);

-- Query to verify data
-- SELECT * FROM cards ORDER BY display_order;
