-- ==================================================
-- FOLDERFILES COMPONENT SCHEMA
-- ==================================================
-- This schema supports a two-level hierarchy: Folders contain Files
-- Demonstrates hierarchical data with graceful fallback patterns
--
-- Usage: Run this script in your Neon SQL Editor to create tables and seed data
-- Tables: folders, files
-- Features: Foreign keys, soft deletes, auto-incrementing display_order, timestamps
-- ==================================================

-- Drop existing tables if they exist (CASCADE removes dependent objects)
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS folders CASCADE;

-- ==================================================
-- FOLDERS TABLE
-- ==================================================
-- Represents top-level folders that contain files
-- Each folder is a coloured tab in the UI

CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,                      -- Display name (e.g., 'Lexical Interruptions')
    color VARCHAR(50) DEFAULT '#3b82f6',              -- Hex colour code (e.g., '#3b82f6')
    text_color VARCHAR(50) DEFAULT 'text-white',      -- Tailwind class for text colour
    icon VARCHAR(10),                                 -- Emoji or single character icon
    description TEXT,                                 -- Shown in tooltip on hover
    category VARCHAR(50) DEFAULT 'folderfiles-demo',  -- For filtering/grouping
    display_order INTEGER NOT NULL DEFAULT 0,         -- Order of folders in UI
    is_active BOOLEAN DEFAULT TRUE,                   -- Soft delete flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_folders_display_order ON folders(display_order);
CREATE INDEX idx_folders_category ON folders(category);
CREATE INDEX idx_folders_is_active ON folders(is_active);

-- ==================================================
-- FILES TABLE
-- ==================================================
-- Represents documents/files within folders
-- Each file can have single or multi-page content

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,  -- Parent folder
    title VARCHAR(255) NOT NULL,                                          -- File title
    subtitle VARCHAR(255),                                                -- Optional subtitle
    preview_text TEXT NOT NULL,                                           -- Preview shown in tooltip
    content TEXT,                                                         -- Single page HTML content
    pages TEXT,                                                           -- Multi-page JSON array ["<html1>", "<html2>"]
    thumbnail_url TEXT,                                                   -- Optional thumbnail
    metadata TEXT,                                                        -- JSON: {author, date, tags, pageCount, fileNumber}
    file_type VARCHAR(50) DEFAULT 'document',                             -- 'document', 'image', 'pdf', 'text'
    display_order INTEGER NOT NULL DEFAULT 0,                             -- Order within folder
    is_active BOOLEAN DEFAULT TRUE,                                       -- Soft delete flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_display_order ON files(display_order);
CREATE INDEX idx_files_is_active ON files(is_active);

-- ==================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ==================================================

-- Reuse or create the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to folders table
CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to files table
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- SEED DATA - FOLDERS
-- ==================================================
-- Insert sample folders with various colours and icons
-- Based on screenshot folder labels

INSERT INTO folders (label, color, text_color, icon, description, category, display_order)
VALUES
    (
        'Lexical Interruptions',
        '#a855f7',
        'text-white',
        '📘',
        'Research on lexical patterns in conversation',
        'folderfiles-demo',
        1
    ),
    (
        'Concord Variants',
        '#14b8a6',
        'text-white',
        '📗',
        'Analysis of concordance variations across dialects',
        'folderfiles-demo',
        2
    ),
    (
        'Prosodic Features',
        '#3b82f6',
        'text-white',
        '📙',
        'Studies on prosodic elements in speech',
        'folderfiles-demo',
        3
    ),
    (
        'Ink Displacement',
        '#6366f1',
        'text-white',
        '🖋️',
        'Examination of ink displacement patterns in handwriting',
        'folderfiles-demo',
        4
    ),
    (
        'Referent Ghosts',
        '#374151',
        'text-white',
        '👻',
        'Analysis of referent ambiguity in discourse',
        'folderfiles-demo',
        5
    ),
    (
        'Unanchored Statements',
        '#f97316',
        'text-white',
        '⚓',
        'Study of context-free utterances in dialogue',
        'folderfiles-demo',
        6
    );

-- ==================================================
-- SEED DATA - FILES
-- ==================================================
-- Insert sample files with multi-page HTML content
-- Some files use 'pages' JSON array, others use 'content' for single page

-- Files for 'Lexical Interruptions' folder (id: 1)
INSERT INTO files (folder_id, title, subtitle, preview_text, pages, metadata, display_order)
VALUES
    (
        1,
        'Introduction to Lexical Interruptions',
        'Chapter 1: Foundations',
        'This document explores the fundamental concepts of lexical interruptions in natural conversation, examining how speakers interject, pause, and modify their speech patterns.',
        '["<h1>Introduction to Lexical Interruptions</h1><p>Lexical interruptions represent a fascinating aspect of conversational dynamics. When speakers engage in dialogue, they frequently interrupt their own or others'' speech patterns with various lexical elements...</p><p>This phenomenon occurs across all languages and cultures, though the specific patterns and social acceptability vary significantly. Understanding these patterns helps us decode the underlying cognitive processes of speech production.</p>", "<h2>Types of Interruptions</h2><p>We can categorise lexical interruptions into several distinct types:</p><ul><li><strong>Self-corrections:</strong> When speakers pause to correct their own speech</li><li><strong>Filler words:</strong> Um, uh, like, you know</li><li><strong>Clarifications:</strong> Interjections to clarify meaning</li><li><strong>Emphasis markers:</strong> Words added for emphasis</li></ul>", "<h2>Research Methodology</h2><p>Our research employed a mixed-methods approach, combining quantitative analysis of conversation transcripts with qualitative interviews. We analysed over 500 hours of natural conversation across different contexts...</p>"]',
        '{"author": "Dr. Sarah Johnson", "date": "Mar 15, 1966", "tags": ["linguistics", "conversation", "interruptions"], "pageCount": 3, "wordCount": 450, "fileNumber": "LXC"}',
        1
    ),
    (
        1,
        'Filler Words Across Cultures',
        'Comparative Study',
        'A comprehensive analysis of filler words (um, uh, like) across 12 different languages and their cultural implications.',
        '["<h1>Filler Words Across Cultures</h1><p>Filler words serve as conversational lubricants, giving speakers time to think whilst maintaining the flow of dialogue. However, their usage, acceptability, and frequency vary dramatically across cultures...</p>", "<h2>English Filler Words</h2><p>In English, the most common fillers include ''um'', ''uh'', ''like'', ''you know'', and ''so''. Younger speakers tend to use ''like'' more frequently, whilst older generations favour ''um'' and ''uh''.</p>"]',
        '{"author": "Prof. Michael Chen", "date": "Feb 20, 1966", "tags": ["linguistics", "cross-cultural", "fillers"], "pageCount": 2, "wordCount": 320}',
        2
    ),
    (
        1,
        'Turn-Taking Mechanisms',
        'Sequential Analysis',
        'Examination of how speakers negotiate turn-taking through lexical cues and interruption patterns in multi-party conversations.',
        NULL,
        '{"author": "Dr. Emily Watson", "date": "Jan 10, 1966", "tags": ["conversation-analysis", "turn-taking"], "pageCount": 1, "wordCount": 280}',
        3
    );

-- Insert content for single-page file (Turn-Taking Mechanisms)
UPDATE files
SET content = '<h1>Turn-Taking Mechanisms</h1><p>Turn-taking in conversation is a remarkably sophisticated coordination system. Speakers use subtle lexical and prosodic cues to signal when they''re finishing a turn or intending to continue...</p>'
WHERE id = (SELECT id FROM files WHERE title = 'Turn-Taking Mechanisms');

-- Files for 'Concord Variants' folder (id: 2)
INSERT INTO files (folder_id, title, subtitle, preview_text, content, metadata, display_order)
VALUES
    (
        2,
        'Subject-Verb Agreement Patterns',
        'Regional Variations in British English',
        'Analysis of subject-verb agreement variations across different British dialects, exploring both standard and non-standard forms.',
        '<h1>Subject-Verb Agreement Patterns</h1><p>Subject-verb agreement represents one of the most variable aspects of English grammar across dialects...</p>',
        '{"author": "Dr. James Morrison", "date": "Mar 1, 1966", "tags": ["grammar", "dialects", "British-English"], "pageCount": 1, "wordCount": 190}',
        1
    ),
    (
        2,
        'Number Concordance Study',
        'Corpus Analysis',
        'Large-scale corpus study examining number concordance patterns in formal vs informal written English.',
        '<h1>Number Concordance Study</h1><p>Using a 10-million-word corpus, we examined patterns of number concordance...</p>',
        '{"author": "Prof. Lisa Anderson", "date": "Feb 15, 1966", "tags": ["corpus-linguistics", "concordance"], "pageCount": 1, "wordCount": 240}',
        2
    );

-- Files for 'Prosodic Features' folder (id: 3)
INSERT INTO files (folder_id, title, subtitle, preview_text, pages, metadata, display_order)
VALUES
    (
        3,
        'Intonation Patterns in Questions',
        'Acoustic Analysis',
        'Detailed acoustic analysis of rising and falling intonation patterns in interrogative sentences across English dialects.',
        '["<h1>Intonation Patterns in Questions</h1><p>Intonation plays a crucial role in signalling question types in English...</p>", "<h2>Rising Intonation</h2><p>Rising intonation typically indicates yes/no questions or uncertainty...</p>"]',
        '{"author": "Dr. Robert Taylor", "date": "Mar 10, 1966", "tags": ["prosody", "intonation", "phonetics"], "pageCount": 2, "wordCount": 380}',
        1
    ),
    (
        3,
        'Stress and Rhythm in Speech',
        'Comparative Phonology',
        'Examination of stress-timed vs syllable-timed rhythm in English and Romance languages.',
        '<h1>Stress and Rhythm in Speech</h1><p>Languages exhibit different rhythmic patterns. English is predominantly stress-timed, whilst French and Spanish are syllable-timed...</p>',
        '{"author": "Prof. Maria Garcia", "date": "Jan 25, 1966", "tags": ["phonology", "rhythm", "comparative"], "pageCount": 1, "wordCount": 290}',
        2
    );

-- Files for 'Ink Displacement' folder (id: 4) - Matching screenshot themes
INSERT INTO files (folder_id, title, subtitle, preview_text, pages, metadata, display_order)
VALUES
    (
        4,
        'Excerpt A',
        'Peripheral Entry',
        'Believed to be part of a larger set. No other parts located. Retrieved unbound. Source pending.',
        '["<h1 style=\"font-style: italic; font-family: Georgia, serif;\">Excerpt A</h1><p>The original arrives already altered—a copy turned latter by its journey through the gauntlet of scepticism. Interrogation loops back on itself, turning layers of erasure and silence.</p><p>The sequence, if it ever was one, appears broken, but each break insists on secondary logic of its annotation.</p>"]',
        '{"author": "Unknown", "date": "Jan 21, 1966", "fileNumber": "File 003", "pageCount": 1}',
        1
    );

-- Files for 'Referent Ghosts' folder (id: 5)
INSERT INTO files (folder_id, title, subtitle, preview_text, content, metadata, display_order)
VALUES
    (
        5,
        'Unverified',
        'Margin Events',
        'There are signs of use: annotations, omissions, the pressure of someone else''s urgency. No conclusion is evident, but the document resists being closed.',
        '<h1 style="font-style: italic; font-family: Georgia, serif;">Unverified</h1><p>There are signs of use: annotations, omissions, the pressure of someone else''s urgency. No conclusion is evident, but the document resists being closed. It remains held in transit, not as an answer but as evidence of asking.</p>',
        '{"date": "Jan 23, 1966", "fileNumber": "File 004", "pageCount": 1}',
        1
    );

-- Files for 'Unanchored Statements' folder (id: 6)
INSERT INTO files (folder_id, title, subtitle, preview_text, content, metadata, display_order)
VALUES
    (
        6,
        'Varnell Collection',
        'Duplicated Silence',
        'Filed without status. Referenced frequently, yet volume titer in full. Peripheral impact.',
        '<h1 style="font-style: italic; font-family: Georgia, serif;">Varnell Collection</h1><p>Filed without status. Referenced frequently, yet volume titer in full. Peripheral impact on discourse remains substantial despite lack of formal acknowledgement.</p>',
        '{"date": "Jan 18, 1966", "pageCount": 1}',
        1
    ),
    (
        6,
        'Morphological Fragments',
        'Structural Analysis',
        'Fragmented records of morphological structures across various language families.',
        '<h1>Morphological Fragments</h1><p>These fragments represent partial documentation of morphological structures. The completeness varies significantly, reflecting the challenges of comprehensive documentation...</p>',
        '{"author": "Dr. Alex Kim", "date": "Feb 28, 1966", "pageCount": 1}',
        2
    );

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================
-- Run these to verify the data was inserted correctly

-- Count folders and files
-- SELECT
--     (SELECT COUNT(*) FROM folders WHERE is_active = TRUE) as folder_count,
--     (SELECT COUNT(*) FROM files WHERE is_active = TRUE) as file_count;

-- View all folders with their file counts
-- SELECT
--     f.id,
--     f.label,
--     f.color,
--     f.icon,
--     COUNT(fi.id) as file_count
-- FROM folders f
-- LEFT JOIN files fi ON f.id = fi.folder_id AND fi.is_active = TRUE
-- WHERE f.is_active = TRUE
-- GROUP BY f.id, f.label, f.color, f.icon
-- ORDER BY f.display_order;

-- View sample file content
-- SELECT
--     fi.title,
--     fi.subtitle,
--     LEFT(fi.preview_text, 100) as preview_snippet,
--     fo.label as folder_name
-- FROM files fi
-- JOIN folders fo ON fi.folder_id = fo.id
-- WHERE fi.is_active = TRUE
-- ORDER BY fo.display_order, fi.display_order
-- LIMIT 10;

-- ==================================================
-- SCHEMA COMPLETE
-- ==================================================
-- Tables created: folders, files
-- Triggers configured: auto-update timestamps
-- Seed data inserted: 6 folders, 11 files
-- Ready for use with FolderFiles component!
-- ==================================================
