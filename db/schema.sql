create table if not exists canonical_items (
  slug text primary key,
  display_name text not null,
  material_group text not null,
  default_waste_stream text not null,
  sort_order integer not null default 0
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  canonical_item text not null references canonical_items(slug),
  item_name text not null,
  material text not null,
  material_group text not null,
  waste_stream text not null,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  created_at timestamptz not null default now()
);

create index if not exists scans_canonical_item_idx on scans (canonical_item);
create index if not exists scans_created_at_idx on scans (created_at desc);

create table if not exists scan_feedback (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null unique references scans(id) on delete cascade,
  verdict text not null check (verdict in ('correct', 'incorrect')),
  corrected_item_name text,
  corrected_canonical_item text references canonical_items(slug),
  corrected_material_group text,
  corrected_waste_stream text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);

create index if not exists rate_limits_window_start_idx on rate_limits (window_start);

insert into canonical_items (slug, display_name, material_group, default_waste_stream, sort_order) values
  ('plastic-bottle', 'Plastic bottle', 'plastic', 'recycling', 1),
  ('plastic-bag', 'Plastic bag', 'plastic', 'special_dropoff', 2),
  ('plastic-container', 'Plastic container', 'plastic', 'recycling', 3),
  ('plastic-film', 'Plastic film', 'plastic', 'special_dropoff', 4),
  ('plastic-cup', 'Plastic cup', 'plastic', 'recycling', 5),
  ('plastic-cutlery', 'Plastic cutlery', 'plastic', 'landfill', 6),
  ('styrofoam', 'Styrofoam', 'plastic', 'landfill', 7),
  ('plastic-toy', 'Plastic toy', 'plastic', 'landfill', 8),
  ('other-plastic', 'Other plastic', 'plastic', 'unknown', 9),
  ('glass-bottle', 'Glass bottle', 'glass', 'recycling', 10),
  ('glass-jar', 'Glass jar', 'glass', 'recycling', 11),
  ('glass-scrap', 'Glass scrap', 'glass', 'special_dropoff', 12),
  ('ceramic', 'Ceramic', 'ceramic', 'landfill', 13),
  ('aluminum-can', 'Aluminum can', 'metal', 'recycling', 14),
  ('steel-can', 'Steel can', 'metal', 'recycling', 15),
  ('metal-scrap', 'Metal scrap', 'metal', 'recycling', 16),
  ('aerosol-can', 'Aerosol can', 'metal', 'hazardous', 17),
  ('cardboard-box', 'Cardboard box', 'paper', 'recycling', 18),
  ('paper', 'Paper', 'paper', 'recycling', 19),
  ('newspaper', 'Newspaper', 'paper', 'recycling', 20),
  ('paper-cup', 'Paper cup', 'paper', 'landfill', 21),
  ('carton', 'Carton', 'paper', 'recycling', 22),
  ('tissue', 'Tissue', 'paper', 'landfill', 23),
  ('food-scraps', 'Food scraps', 'organic', 'organic', 24),
  ('garden-waste', 'Garden waste', 'organic', 'organic', 25),
  ('battery', 'Battery', 'hazardous', 'hazardous', 26),
  ('e-waste', 'Electronic waste', 'electronic', 'electronic', 27),
  ('light-bulb', 'Light bulb', 'hazardous', 'hazardous', 28),
  ('cable', 'Cable', 'electronic', 'electronic', 29),
  ('medical-waste', 'Medical waste', 'hazardous', 'hazardous', 30),
  ('clothing', 'Clothing', 'textile', 'textile', 31),
  ('shoes', 'Shoes', 'textile', 'textile', 32),
  ('textile-scrap', 'Textile scrap', 'textile', 'textile', 33),
  ('composite-packaging', 'Composite packaging', 'composite', 'unknown', 34),
  ('wood', 'Wood', 'wood', 'special_dropoff', 35),
  ('rubber', 'Rubber', 'rubber', 'special_dropoff', 36),
  ('other', 'Other', 'other', 'unknown', 37)
on conflict (slug) do update set
  display_name = excluded.display_name,
  material_group = excluded.material_group,
  default_waste_stream = excluded.default_waste_stream,
  sort_order = excluded.sort_order;
