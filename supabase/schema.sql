-- ============================================================
-- Halfway Cafe — Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. menu_items
CREATE TABLE menu_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text,
  price       numeric(6,2) NOT NULL,
  category    text        NOT NULL CHECK (category IN ('breakfast','lunch','burgers','desserts','drinks')),
  image_url   text,
  dietary     text[]      DEFAULT '{}',
  available   text        DEFAULT 'all-day',
  featured    boolean     DEFAULT false,
  active      boolean     DEFAULT true,
  sort_order  integer     DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- 2. opening_hours
CREATE TABLE opening_hours (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  day_name   text    NOT NULL,
  day_order  integer NOT NULL CHECK (day_order BETWEEN 1 AND 7),
  open_time  text,
  close_time text,
  is_closed  boolean DEFAULT false
);

-- 3. gallery_images
CREATE TABLE gallery_images (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  url        text        NOT NULL,
  alt_text   text,
  sort_order integer     DEFAULT 0,
  active     boolean     DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. site_settings
CREATE TABLE site_settings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text        UNIQUE NOT NULL,
  value      text,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE menu_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;

-- Public (anon) → SELECT only
CREATE POLICY "Public read menu_items"     ON menu_items     FOR SELECT TO anon USING (true);
CREATE POLICY "Public read opening_hours"  ON opening_hours  FOR SELECT TO anon USING (true);
CREATE POLICY "Public read gallery_images" ON gallery_images FOR SELECT TO anon USING (true);
CREATE POLICY "Public read site_settings"  ON site_settings  FOR SELECT TO anon USING (true);

-- Authenticated → full CRUD
CREATE POLICY "Auth manage menu_items"     ON menu_items     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage opening_hours"  ON opening_hours  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage gallery_images" ON gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage site_settings"  ON site_settings  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_menu_items
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_site_settings
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. categories
-- ============================================================

CREATE TABLE categories (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  slug       text        NOT NULL UNIQUE,
  sort_order integer     DEFAULT 0,
  active     boolean     DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated can manage categories"
  ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
