-- =============================================================================
-- CALENDAR HEATMAP SCHEMA
-- =============================================================================
-- Creates table for calendar activity tracking with sample data
-- Supports multi-user scenarios with user_id and category filtering
-- Follows project patterns: is_active for soft deletes, timestamps for auditing

-- Calendar activity table
CREATE TABLE IF NOT EXISTS calendar_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    activity_date DATE NOT NULL,
    activity_count INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, activity_date, category)
);

-- Create indexes for fast date range queries
CREATE INDEX IF NOT EXISTS idx_calendar_activity_date
    ON calendar_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_calendar_activity_user
    ON calendar_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_activity_category
    ON calendar_activity(category);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for automatic updated_at updates
DROP TRIGGER IF EXISTS update_calendar_activity_updated_at ON calendar_activity;
CREATE TRIGGER update_calendar_activity_updated_at
    BEFORE UPDATE ON calendar_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA - Past 365 days of realistic activity
-- =============================================================================
-- Generates activity data with patterns:
-- - Lower on weekends (Saturday/Sunday)
-- - Higher on weekdays
-- - Some zero days for realism
-- - Random variation creating visual patterns

INSERT INTO calendar_activity (user_id, activity_date, activity_count, category)
SELECT
    1 AS user_id,
    CURRENT_DATE - (seq || ' days')::interval AS activity_date,
    CASE
        -- 10% chance of zero activity
        WHEN RANDOM() < 0.1 THEN 0
        -- Weekend (Saturday=6, Sunday=0): 0-5 contributions
        WHEN EXTRACT(DOW FROM CURRENT_DATE - (seq || ' days')::interval) IN (0, 6)
            THEN FLOOR(RANDOM() * 6)
        -- Weekday: 5-20 contributions with occasional spikes
        ELSE
            FLOOR(5 + RANDOM() * 10) +
            CASE WHEN RANDOM() < 0.15 THEN FLOOR(RANDOM() * 6) ELSE 0 END
    END AS activity_count,
    'general' AS category
FROM generate_series(0, 365) AS seq
ON CONFLICT (user_id, activity_date, category) DO NOTHING;

-- Add some additional categories for demo purposes
INSERT INTO calendar_activity (user_id, activity_date, activity_count, category)
SELECT
    1 AS user_id,
    CURRENT_DATE - (seq || ' days')::interval AS activity_date,
    FLOOR(RANDOM() * 15) AS activity_count,
    'coding' AS category
FROM generate_series(0, 365) AS seq
WHERE RANDOM() > 0.3 -- Only populate 70% of days
ON CONFLICT (user_id, activity_date, category) DO NOTHING;

INSERT INTO calendar_activity (user_id, activity_date, activity_count, category)
SELECT
    1 AS user_id,
    CURRENT_DATE - (seq || ' days')::interval AS activity_date,
    FLOOR(RANDOM() * 10) AS activity_count,
    'exercise' AS category
FROM generate_series(0, 365) AS seq
WHERE RANDOM() > 0.4 -- Only populate 60% of days
ON CONFLICT (user_id, activity_date, category) DO NOTHING;

-- Verify data was inserted
SELECT
    category,
    COUNT(*) as total_days,
    ROUND(AVG(activity_count), 2) as avg_activity,
    MAX(activity_count) as max_activity
FROM calendar_activity
WHERE user_id = 1 AND is_active = TRUE
GROUP BY category
ORDER BY category;
