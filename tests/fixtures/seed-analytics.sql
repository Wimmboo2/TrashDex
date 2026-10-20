-- Synthetic fixture data for analytics checks.
--
-- This is NOT production data. It creates deterministic rows so the leaderboard
-- and the insights dashboard can be verified against known numbers.
-- Only run this against a throwaway test database, never against Neon.
--
-- Expected results after running:
--   total scans .................. 21
--   unique item types ............ 5
--   feedback responses .......... 12  (4 correct, 8 incorrect)
--   reported correctness ........ 33%  (4 correct out of 12 feedback)
--   most scanned ................ plastic-bottle with 9 scans, 43% of all scans
--   most confusing .............. plastic-bottle only, 67% (4 of 6 responses)
--                                  glass-bottle has 4 responses, below the
--                                  threshold of 5, so it must not be ranked
--   last 7 days ................. 14 scans, last 30 days 21 scans
--                                  (calendar days in Asia/Jakarta, so the
--                                  150 hour old scan falls outside the
--                                  seven day window)

insert into scans
  (canonical_item, item_name, material, material_group, waste_stream, confidence, created_at)
select
  v.item, v.name, v.material, v.group, v.stream, v.conf,
  now() - make_interval(hours => v.hours)
from (values
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'high',     2),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'high',    10),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'medium',  26),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'high',    50),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'high',    74),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'low',    100),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'high',   150),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'high',   200),
  ('plastic-bottle',  'Plastic water bottle', 'PET plastic (#1)', 'plastic',   'recycling', 'high',   260),
  ('glass-bottle',    'Glass bottle',        'Glass',            'glass',     'recycling', 'high',     5),
  ('glass-bottle',    'Glass bottle',        'Glass',            'glass',     'recycling', 'medium',  30),
  ('glass-bottle',    'Glass bottle',        'Glass',            'glass',     'recycling', 'high',    60),
  ('glass-bottle',    'Glass bottle',        'Glass',            'glass',     'recycling', 'high',   120),
  ('glass-bottle',    'Glass bottle',        'Glass',            'glass',     'recycling', 'high',   240),
  ('aluminum-can',   'Aluminum can',        'Aluminium',        'metal',     'recycling', 'high',    18),
  ('aluminum-can',   'Aluminum can',        'Aluminium',        'metal',     'recycling', 'high',    80),
  ('aluminum-can',   'Aluminum can',        'Aluminium',        'metal',     'recycling', 'medium', 190),
  ('cardboard-box',   'Cardboard box',       'Corrugated card',  'paper',     'recycling', 'high',    40),
  ('cardboard-box',   'Cardboard box',       'Corrugated card',  'paper',     'recycling', 'high',   170),
  ('food-scraps',     'Food scraps',         'Organic matter',   'organic',   'organic',   'high',    12),
  ('food-scraps',     'Food scraps',         'Organic matter',   'organic',   'organic',   'medium', 220)
) as v(item, name, material, "group", stream, conf, hours);

with target as (
  select
    id,
    canonical_item,
    row_number() over (partition by canonical_item order by created_at) as rn
  from scans
)
insert into scan_feedback (scan_id, verdict, created_at)
select
  id,
  case
    when canonical_item = 'plastic-bottle' and rn <= 4 then 'incorrect'
    when canonical_item = 'glass-bottle' then 'incorrect'
    else 'correct'
  end,
  now()
from target
where (canonical_item = 'plastic-bottle' and rn <= 6)
   or (canonical_item = 'glass-bottle' and rn <= 4)
   or (canonical_item = 'aluminum-can' and rn <= 2);
