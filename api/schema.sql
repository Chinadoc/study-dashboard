-- Schema for locksmith_data table
CREATE TABLE IF NOT EXISTS locksmith_data (
  make TEXT,
  make_norm TEXT,
  model TEXT,
  year INTEGER,
  immobilizer_system TEXT,
  immobilizer_system_specific TEXT,
  immobilizer_years TEXT,
  key_type TEXT,
  key_category TEXT,
  transponder_family TEXT,
  chip TEXT,
  fcc_id TEXT,
  fcc_present TEXT,
  part_number TEXT,
  keyway TEXT,
  keyway_norm TEXT,
  blade_type TEXT,
  frequency TEXT,
  frequency_mhz REAL,
  battery TEXT,
  buttons INTEGER,
  remote_start TEXT,
  prog_method TEXT,
  prog_difficulty TEXT,
  prog_tools TEXT,
  akl_supported TEXT,
  add_key_supported TEXT,
  requires_pin_seed TEXT,
  requires_bench_unlock TEXT,
  wait_time TEXT,
  confidence TEXT,
  confidence_reason TEXT,
  emergency_blade TEXT,
  compat_makes TEXT,
  compat_year_min INTEGER,
  compat_year_max INTEGER,
  compat_years_list TEXT,
  compat_models TEXT,
  notes TEXT,
  source TEXT,
  source_record_id TEXT,
  match_basis TEXT,
  url TEXT,
  fcc_confidence TEXT,
  fcc_source TEXT,
  -- New columns for unified database
  video_id TEXT,
  data_completeness INTEGER DEFAULT 0,
  needs_enrichment INTEGER DEFAULT 1,
  key_type TEXT,
  explainer_text TEXT
);

-- Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_make ON locksmith_data(make);
CREATE INDEX IF NOT EXISTS idx_make_norm ON locksmith_data(make_norm);
CREATE INDEX IF NOT EXISTS idx_model ON locksmith_data(model);
CREATE INDEX IF NOT EXISTS idx_year ON locksmith_data(year);
CREATE INDEX IF NOT EXISTS idx_immobilizer ON locksmith_data(immobilizer_system);
CREATE INDEX IF NOT EXISTS idx_fcc ON locksmith_data(fcc_id);
CREATE INDEX IF NOT EXISTS idx_completeness ON locksmith_data(data_completeness);
CREATE INDEX IF NOT EXISTS idx_needs_enrichment ON locksmith_data(needs_enrichment);

-- Video Tutorials table
CREATE TABLE IF NOT EXISTS video_tutorials (
  id TEXT PRIMARY KEY,
  video_id TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  tool TEXT,
  difficulty TEXT,
  transcript_summary TEXT,
  related_make TEXT,
  related_model TEXT,
  related_year_start INTEGER,
  related_year_end INTEGER
);

CREATE INDEX IF NOT EXISTS idx_video_make_model ON video_tutorials(related_make, related_model);

-- Curated FCC overrides - manually verified locksmith data takes precedence
CREATE TABLE IF NOT EXISTS curated_overrides (
  fcc_id TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  frequency TEXT,
  chip TEXT,
  key_blank TEXT,
  programmer TEXT,
  immo_system TEXT,
  notes TEXT,
  amazon_url TEXT,
  source TEXT DEFAULT 'manual',
  PRIMARY KEY (fcc_id, make, model)
);

CREATE INDEX IF NOT EXISTS idx_curated_make_model ON curated_overrides(make, model);
CREATE INDEX IF NOT EXISTS idx_curated_fcc ON curated_overrides(fcc_id);
