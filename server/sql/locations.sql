-- =============================================
-- LOCATIONS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create the locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📍',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Insert default locations
INSERT INTO locations (name, icon, sort_order) VALUES
    ('Block 1', '🏢', 1),
    ('Block 2', '🏢', 2),
    ('Block 3', '🏢', 3),
    ('R&D', '🔬', 4),
    ('Birds Park', '🌳', 5),
    ('Central Block', '🏛️', 6),
    ('Auditorium', '🎭', 7),
    ('Other', '📍', 99);

-- 3. Add location_id to lost_reports
ALTER TABLE lost_reports ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- 4. Add location_id to found_items
ALTER TABLE found_items ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- 5. Enable RLS (Row Level Security) — allow all authenticated reads
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read locations" ON locations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage locations" ON locations
    FOR ALL USING (true);
