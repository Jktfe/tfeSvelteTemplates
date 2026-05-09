-- =============================================================================
-- GANTT SCHEMA
-- =============================================================================
-- Tasks for the Gantt chart template. Dependencies live in their own table to
-- keep finish→start relationships first-class (and to allow many-to-many).
-- Follows project conventions: is_active soft delete, display_order, updated_at
-- trigger, BIGSERIAL primary key, snake_case columns.

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gantt_tasks (
    id            BIGSERIAL PRIMARY KEY,
    task_key      VARCHAR(64) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    start_date    DATE NOT NULL,
    end_date      DATE NOT NULL,
    progress      SMALLINT,
    is_milestone  BOOLEAN DEFAULT FALSE,
    color         VARCHAR(32),
    group_name    VARCHAR(64),
    assignee      VARCHAR(64),
    display_order INTEGER DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (start_date <= end_date),
    CHECK (progress IS NULL OR (progress BETWEEN 0 AND 100)),
    UNIQUE (task_key)
);

CREATE INDEX IF NOT EXISTS idx_gantt_tasks_active_order
    ON gantt_tasks(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_gantt_tasks_dates
    ON gantt_tasks(start_date, end_date);

-- ---------------------------------------------------------------------------
-- Dependencies (finish → start)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gantt_dependencies (
    id            BIGSERIAL PRIMARY KEY,
    task_key      VARCHAR(64) NOT NULL REFERENCES gantt_tasks(task_key) ON DELETE CASCADE,
    depends_on    VARCHAR(64) NOT NULL REFERENCES gantt_tasks(task_key) ON DELETE CASCADE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (task_key, depends_on),
    CHECK (task_key <> depends_on)
);

CREATE INDEX IF NOT EXISTS idx_gantt_deps_task ON gantt_dependencies(task_key);

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_at honest on UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gantt_tasks_updated_at ON gantt_tasks;
CREATE TRIGGER update_gantt_tasks_updated_at
    BEFORE UPDATE ON gantt_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Seed data — small but realistic delivery schedule
-- ---------------------------------------------------------------------------
INSERT INTO gantt_tasks
    (task_key, name, start_date, end_date, progress, is_milestone, color, group_name, assignee, display_order)
VALUES
    ('discovery',      'Discovery & research', CURRENT_DATE - 7, CURRENT_DATE - 1, 100, FALSE, NULL,      'Plan',  'Roxy',     0),
    ('kickoff',        'Kick-off milestone',   CURRENT_DATE,     CURRENT_DATE,     NULL, TRUE, '#f59e0b', 'Plan',  NULL,        1),
    ('design',         'Design system',        CURRENT_DATE + 1, CURRENT_DATE + 8, 60,   FALSE, NULL,     'Build', 'James',     2),
    ('build-frontend', 'Build front-end',      CURRENT_DATE + 5, CURRENT_DATE + 16, 25,  FALSE, NULL,     'Build', 'Fletcher',  3),
    ('build-api',      'Build API',            CURRENT_DATE + 2, CURRENT_DATE + 12, 40,  FALSE, NULL,     'Build', 'Viola',     4),
    ('integrate',      'Integrate & QA',       CURRENT_DATE + 13, CURRENT_DATE + 20, 0,  FALSE, NULL,     'Ship',  NULL,        5),
    ('launch',         'Launch',               CURRENT_DATE + 22, CURRENT_DATE + 22, NULL, TRUE, '#10b981', 'Ship', NULL,       6)
ON CONFLICT (task_key) DO NOTHING;

INSERT INTO gantt_dependencies (task_key, depends_on) VALUES
    ('kickoff',        'discovery'),
    ('design',         'kickoff'),
    ('build-frontend', 'design'),
    ('build-api',      'kickoff'),
    ('integrate',      'build-frontend'),
    ('integrate',      'build-api'),
    ('launch',         'integrate')
ON CONFLICT (task_key, depends_on) DO NOTHING;
