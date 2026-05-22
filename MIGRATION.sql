-- omo schema migration
-- Run in Kura Supabase SQL editor

-- ── TABLES ───────────────────────────────────────────────

create table if not exists omo_rankings (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  category    text not null default 'other'
                check (category in ('life','apartments','travel','gear','other')),
  is_decided  boolean not null default false,
  decided_at  timestamptz,
  is_published boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists omo_criteria (
  id              uuid primary key default gen_random_uuid(),
  ranking_id      uuid not null references omo_rankings(id) on delete cascade,
  label           text not null,
  weight          integer not null check (weight >= 0 and weight <= 100),
  why             text,
  is_disqualifier boolean not null default false,
  sort_order      integer not null default 0
);

create table if not exists omo_options (
  id                 uuid primary key default gen_random_uuid(),
  ranking_id         uuid not null references omo_rankings(id) on delete cascade,
  title              text not null,
  subtitle           text,
  description        text,
  vibes              text[],
  pros               text[],
  cons               text[],
  maps_url           text,
  is_disqualified    boolean not null default false,
  disqualify_reason  text,
  sort_order         integer not null default 0
);

create table if not exists omo_scores (
  id           uuid primary key default gen_random_uuid(),
  option_id    uuid not null references omo_options(id) on delete cascade,
  criterion_id uuid not null references omo_criteria(id) on delete cascade,
  value        numeric(4,1) not null check (value >= 0 and value <= 10),
  unique (option_id, criterion_id)
);

create table if not exists omo_versions (
  id            uuid primary key default gen_random_uuid(),
  ranking_id    uuid not null references omo_rankings(id) on delete cascade,
  label         text not null,
  snapshot_json jsonb not null,
  created_at    timestamptz not null default now()
);

-- ── RLS ──────────────────────────────────────────────────

alter table omo_rankings enable row level security;
alter table omo_criteria  enable row level security;
alter table omo_options   enable row level security;
alter table omo_scores    enable row level security;
alter table omo_versions  enable row level security;

-- Public read for published rankings
create policy "anon read rankings"  on omo_rankings for select using (is_published = true);
create policy "anon read criteria"  on omo_criteria  for select using (true);
create policy "anon read options"   on omo_options   for select using (true);
create policy "anon read scores"    on omo_scores    for select using (true);
create policy "anon read versions"  on omo_versions  for select using (true);

-- ── SEED: SD NEIGHBORHOODS RANKING ───────────────────────

-- Ranking
insert into omo_rankings (id, slug, title, description, category, is_decided, decided_at, is_published)
values (
  'a1000000-0000-0000-0000-000000000001',
  'sd-neighborhoods',
  'San Diego neighborhood ranking',
  'Where to live after the Chicago → San Diego move. Scored on 13 criteria weighted to our specific situation.',
  'life',
  true,
  '2026-05-01',
  true
);

-- Criteria (weights sum to 100)
insert into omo_criteria (ranking_id, label, weight, why, is_disqualifier, sort_order) values
  ('a1000000-0000-0000-0000-000000000001', 'Walkability',      15, 'Daily quality of life — groceries, coffee, dinner on foot', false, 1),
  ('a1000000-0000-0000-0000-000000000001', 'Safety',           15, 'She walks Bean alone at night while I travel', true,  2),
  ('a1000000-0000-0000-0000-000000000001', 'Food & coffee',    13, 'We live at restaurants and coffee shops', false, 3),
  ('a1000000-0000-0000-0000-000000000001', 'Apt quality',      11, 'Concrete/steel construction, 850+ sqft, good acoustics', false, 4),
  ('a1000000-0000-0000-0000-000000000001', 'Airport access',   10, 'I fly constantly — SAN needs to be close', false, 5),
  ('a1000000-0000-0000-0000-000000000001', 'Coastal feel',      7, 'She wants waterfront adjacency', false, 6),
  ('a1000000-0000-0000-0000-000000000001', 'Driving distances', 6, null, false, 7),
  ('a1000000-0000-0000-0000-000000000001', 'Outdoor access',    5, 'Dog walks, hiking, daily movement', false, 8),
  ('a1000000-0000-0000-0000-000000000001', 'Farmer''s market',  4, null, false, 9),
  ('a1000000-0000-0000-0000-000000000001', 'Noise level',       4, 'WFH acoustics — indoor neighbor noise', false, 10),
  ('a1000000-0000-0000-0000-000000000001', 'Dog friendliness',  4, 'Bean needs walkable parks and dog-friendly culture', false, 11),
  ('a1000000-0000-0000-0000-000000000001', 'Flight path',       3, 'SAN Runway 27 approach — significant in certain neighborhoods', false, 12),
  ('a1000000-0000-0000-0000-000000000001', 'Neighborhood vibe', 3, null, false, 13);

-- Options
insert into omo_options (id, ranking_id, title, subtitle, description, vibes, pros, cons, maps_url, is_disqualified, disqualify_reason, sort_order) values

('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
 'Little Italy', 'Downtown · India St · Columbia',
 'The most walkable, self-contained neighborhood in San Diego. Dense restaurant-and-café grid centered on India Street, waterfront a short walk west. Genuine urban feel without needing a car. High-rises with condo-grade construction. Saturday Mercato farmer''s market. SAN airport 12–15 min away. Closest SD analog to Gold Coast Chicago.',
 ARRAY['Walkable Urban','Coastal Adjacent','Food-Forward','Self-Contained','High-Rise'],
 ARRAY['Elite walkability — grocery, coffee, dinner, gym on foot','Best concrete high-rise inventory in SD','SAN 12 min — biggest single travel win over Chicago','Saturday Mercato farmer''s market','Very safe — Gold Coast equivalent feel at night'],
 ARRAY['Most expensive — $3,600–$5,500/mo for qualifying units','India St facing units pick up weekend bar noise','Under SAN Runway 27 flight path','No nearby green space — no real park'],
 'https://www.google.com/maps/search/?api=1&query=Little+Italy+San+Diego+CA',
 false, null, 1),

('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
 'Bankers Hill', 'Uptown · Balboa Park Adjacent',
 'Quieter upscale residential neighbor just above Little Italy. Tree-lined streets, Victorian homes, exceptional fine dining. Borders Balboa Park — great for dog walks. Walk to Little Italy in 10 min. Less weekend noise. Also under the SAN flight path like LI.',
 ARRAY['Quiet Residential','Fine Dining','Park Adjacent','Bay Views'],
 ARRAY['Quieter than LI — less bar noise','Balboa Park for dog walks','Exceptional restaurant quality','Still 12–15 min to SAN, walk to LI in 10 min'],
 ARRAY['No standalone farmer''s market','Fewer concrete high-rises','Less coastal feel','Under flight path like Little Italy'],
 'https://www.google.com/maps/search/?api=1&query=Bankers+Hill+San+Diego+CA',
 false, null, 2),

('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
 'Hillcrest', 'Uptown · University Ave',
 'SD''s most vibrant urban neighborhood with real street energy. LGBTQ+ cultural hub, walkable University Ave corridor, excellent diverse food scene, weekly Sunday farmer''s market. Closest to a real city neighborhood feel. No waterfront access — fails the coastal non-negotiable.',
 ARRAY['Urban Energy','Progressive','LGBTQ+ Hub','Eclectic Food'],
 ARRAY['Best food scene diversity in SD','Sunday farmer''s market','Real city energy','Progressive community fit','Balboa Park dog walks'],
 ARRAY['No coastal feel — fails her non-negotiable hard','Older housing stock','SAN ~20 min','Some encampments near park edge'],
 'https://www.google.com/maps/search/?api=1&query=Hillcrest+San+Diego+CA',
 false, null, 3),

('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
 'North Park', '30th St Corridor · Uptown',
 'SD''s "it" neighborhood — hip 30th St corridor, excellent independent restaurants, best craft beer scene in the city. Most Brooklyn-adjacent energy in SD. Zero coastal feel and SAN is 25–30 min away vs LI''s 12.',
 ARRAY['Hipster','Craft Beer Capital','Independent Restaurants'],
 ARRAY['Excellent independent food scene','Good walkability on 30th St','Strong community feel'],
 ARRAY['Zero coastal feel — deep inland','SAN 25–30 min','Concrete high-rises rare','Noisier on bar corridor weekends'],
 'https://www.google.com/maps/search/?api=1&query=North+Park+San+Diego+CA',
 false, null, 4),

('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
 'Mission Hills', 'Uptown · West Washington St',
 'Beautiful, safe, quiet residential neighborhood with historic craftsman homes and tree canopy. Top safety score. But thin food options, no farmer''s market, and apartment inventory mostly single-family homes — too sleepy for our lifestyle.',
 ARRAY['Historic Homes','Quiet Residential','Established','Very Safe'],
 ARRAY['Best safety score','Beautiful for dog walking','Close enough to walk to Little Italy'],
 ARRAY['Very thin food scene','No farmer''s market','Limited apartment inventory'],
 'https://www.google.com/maps/search/?api=1&query=Mission+Hills+San+Diego+CA',
 false, null, 5),

('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001',
 'East Village', 'Downtown · East of Petco Park',
 'Disqualified on safety — she walks Bean alone at night regularly while I travel for days. East Village has persistent safety concerns after dark. Would otherwise score higher on walkability and airport access.',
 ARRAY['Urban Gritty','Development Zone','Baseball Adjacent'],
 ARRAY['Great walkability','Close to airport','New high-rise development'],
 ARRAY['Safety 4.5/10 — dealbreaker','Persistent issues after dark'],
 'https://www.google.com/maps/search/?api=1&query=East+Village+San+Diego+CA',
 true, 'Safety disqualifier — she walks Bean alone at night while I travel. East Village safety score (4.5/10) fails the hard threshold.', 6),

('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001',
 'Point Loma', 'Peninsula · Liberty Station',
 'Beautiful peninsula with incredible harbor views and Liberty Station arts district. Great coastal feel and safety. But airport access is counterintuitively slow, food density too low, and the military-influenced conservative culture isn''t a fit.',
 ARRAY['Coastal Residential','Harbor Views','Military Adjacent','Liberty Station'],
 ARRAY['World-class harbor views','Very safe','Great outdoor access'],
 ARRAY['Airport counterintuitively slow — 25+ min','Food density too thin','Conservative cultural vibe'],
 'https://www.google.com/maps/search/?api=1&query=Point+Loma+San+Diego+CA',
 false, null, 7),

('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001',
 'Golden Hill', 'Southeast of Balboa Park',
 'Up-and-coming neighborhood south of Balboa Park. More affordable. But food/coffee scene too thin, zero coastal feel, no farmer''s market, and safety patchier than uptown options.',
 ARRAY['Transitional','Up & Coming','Historic Homes','More Affordable'],
 ARRAY['More affordable','Balboa Park accessible'],
 ARRAY['Food/coffee scene too thin','Zero coastal feel','No farmer''s market','Patchier safety'],
 'https://www.google.com/maps/search/?api=1&query=Golden+Hill+San+Diego+CA',
 false, null, 8),

('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001',
 'La Jolla', 'North Coastal · UCSD Adjacent',
 'SD''s most affluent and prestigious neighborhood — stunning cliffs, world-class snorkeling, beautiful village. Highest coastal feel and outdoor scores. But entirely car-dependent, SAN is 35+ min (worst airport score), and resort vibe doesn''t satisfy urban energy need.',
 ARRAY['Upscale Resort','Coastal Luxury','World-Class Beauty','Car Dependent'],
 ARRAY['World-class coastal beauty','Highest safety score','Best outdoor access'],
 ARRAY['Airport 35+ min — worst score','Entirely car-dependent','Even more expensive than LI','Resort vibe — not urban'],
 'https://www.google.com/maps/search/?api=1&query=La+Jolla+San+Diego+CA',
 false, null, 9);

-- Scores (criterion IDs reference the criteria inserted above)
-- Format: (option_id, criterion_id, value)
-- Walkability, Safety, Food, Apt, Airport, Coastal, Driving, Outdoor, FM, Noise, Dog, FlightPath, Vibe

do $$
declare
  r_walk   uuid; r_safe  uuid; r_food  uuid; r_apt   uuid; r_air   uuid;
  r_coast  uuid; r_drive uuid; r_out   uuid; r_fm    uuid; r_noise uuid;
  r_dog    uuid; r_fp    uuid; r_vibe  uuid;
begin
  select id into r_walk  from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Walkability';
  select id into r_safe  from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Safety';
  select id into r_food  from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Food & coffee';
  select id into r_apt   from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Apt quality';
  select id into r_air   from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Airport access';
  select id into r_coast from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Coastal feel';
  select id into r_drive from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Driving distances';
  select id into r_out   from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Outdoor access';
  select id into r_fm    from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Farmer''s market';
  select id into r_noise from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Noise level';
  select id into r_dog   from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Dog friendliness';
  select id into r_fp    from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Flight path';
  select id into r_vibe  from omo_criteria where ranking_id = 'a1000000-0000-0000-0000-000000000001' and label = 'Neighborhood vibe';

  -- Little Italy
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000001', r_walk, 9.5),
    ('b1000000-0000-0000-0000-000000000001', r_safe, 9.2),
    ('b1000000-0000-0000-0000-000000000001', r_food, 9.0),
    ('b1000000-0000-0000-0000-000000000001', r_apt,  8.5),
    ('b1000000-0000-0000-0000-000000000001', r_air,  9.8),
    ('b1000000-0000-0000-0000-000000000001', r_coast,9.5),
    ('b1000000-0000-0000-0000-000000000001', r_drive,8.0),
    ('b1000000-0000-0000-0000-000000000001', r_out,  8.0),
    ('b1000000-0000-0000-0000-000000000001', r_fm,   9.5),
    ('b1000000-0000-0000-0000-000000000001', r_noise,6.5),
    ('b1000000-0000-0000-0000-000000000001', r_dog,  8.5),
    ('b1000000-0000-0000-0000-000000000001', r_fp,   4.0),
    ('b1000000-0000-0000-0000-000000000001', r_vibe, 8.5);

  -- Bankers Hill
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000002', r_walk, 8.0),
    ('b1000000-0000-0000-0000-000000000002', r_safe, 9.0),
    ('b1000000-0000-0000-0000-000000000002', r_food, 7.5),
    ('b1000000-0000-0000-0000-000000000002', r_apt,  7.2),
    ('b1000000-0000-0000-0000-000000000002', r_air,  8.5),
    ('b1000000-0000-0000-0000-000000000002', r_coast,7.0),
    ('b1000000-0000-0000-0000-000000000002', r_drive,7.8),
    ('b1000000-0000-0000-0000-000000000002', r_out,  7.5),
    ('b1000000-0000-0000-0000-000000000002', r_fm,   5.0),
    ('b1000000-0000-0000-0000-000000000002', r_noise,8.5),
    ('b1000000-0000-0000-0000-000000000002', r_dog,  7.5),
    ('b1000000-0000-0000-0000-000000000002', r_fp,   4.5),
    ('b1000000-0000-0000-0000-000000000002', r_vibe, 8.0);

  -- Hillcrest
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000003', r_walk, 9.0),
    ('b1000000-0000-0000-0000-000000000003', r_safe, 8.5),
    ('b1000000-0000-0000-0000-000000000003', r_food, 9.2),
    ('b1000000-0000-0000-0000-000000000003', r_apt,  6.5),
    ('b1000000-0000-0000-0000-000000000003', r_air,  7.5),
    ('b1000000-0000-0000-0000-000000000003', r_coast,3.5),
    ('b1000000-0000-0000-0000-000000000003', r_drive,7.5),
    ('b1000000-0000-0000-0000-000000000003', r_out,  6.5),
    ('b1000000-0000-0000-0000-000000000003', r_fm,   8.0),
    ('b1000000-0000-0000-0000-000000000003', r_noise,6.0),
    ('b1000000-0000-0000-0000-000000000003', r_dog,  8.0),
    ('b1000000-0000-0000-0000-000000000003', r_fp,   8.5),
    ('b1000000-0000-0000-0000-000000000003', r_vibe, 9.0);

  -- North Park
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000004', r_walk, 9.0),
    ('b1000000-0000-0000-0000-000000000004', r_safe, 7.8),
    ('b1000000-0000-0000-0000-000000000004', r_food, 8.5),
    ('b1000000-0000-0000-0000-000000000004', r_apt,  6.0),
    ('b1000000-0000-0000-0000-000000000004', r_air,  7.0),
    ('b1000000-0000-0000-0000-000000000004', r_coast,2.0),
    ('b1000000-0000-0000-0000-000000000004', r_drive,7.0),
    ('b1000000-0000-0000-0000-000000000004', r_out,  6.0),
    ('b1000000-0000-0000-0000-000000000004', r_fm,   8.5),
    ('b1000000-0000-0000-0000-000000000004', r_noise,5.5),
    ('b1000000-0000-0000-0000-000000000004', r_dog,  8.5),
    ('b1000000-0000-0000-0000-000000000004', r_fp,   9.0),
    ('b1000000-0000-0000-0000-000000000004', r_vibe, 8.5);

  -- Mission Hills
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000005', r_walk, 7.2),
    ('b1000000-0000-0000-0000-000000000005', r_safe, 9.2),
    ('b1000000-0000-0000-0000-000000000005', r_food, 6.2),
    ('b1000000-0000-0000-0000-000000000005', r_apt,  5.8),
    ('b1000000-0000-0000-0000-000000000005', r_air,  8.2),
    ('b1000000-0000-0000-0000-000000000005', r_coast,5.5),
    ('b1000000-0000-0000-0000-000000000005', r_drive,7.5),
    ('b1000000-0000-0000-0000-000000000005', r_out,  7.2),
    ('b1000000-0000-0000-0000-000000000005', r_fm,   4.0),
    ('b1000000-0000-0000-0000-000000000005', r_noise,9.0),
    ('b1000000-0000-0000-0000-000000000005', r_dog,  7.8),
    ('b1000000-0000-0000-0000-000000000005', r_fp,   8.5),
    ('b1000000-0000-0000-0000-000000000005', r_vibe, 7.0);

  -- East Village (disqualified — scores recorded for reference)
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000006', r_walk, 8.8),
    ('b1000000-0000-0000-0000-000000000006', r_safe, 4.5),
    ('b1000000-0000-0000-0000-000000000006', r_food, 7.5),
    ('b1000000-0000-0000-0000-000000000006', r_apt,  7.8),
    ('b1000000-0000-0000-0000-000000000006', r_air,  9.0),
    ('b1000000-0000-0000-0000-000000000006', r_coast,8.0),
    ('b1000000-0000-0000-0000-000000000006', r_drive,7.8),
    ('b1000000-0000-0000-0000-000000000006', r_out,  6.2),
    ('b1000000-0000-0000-0000-000000000006', r_fm,   6.0),
    ('b1000000-0000-0000-0000-000000000006', r_noise,5.8),
    ('b1000000-0000-0000-0000-000000000006', r_dog,  7.0),
    ('b1000000-0000-0000-0000-000000000006', r_fp,   6.5),
    ('b1000000-0000-0000-0000-000000000006', r_vibe, 7.2);

  -- Point Loma
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000007', r_walk, 6.2),
    ('b1000000-0000-0000-0000-000000000007', r_safe, 9.0),
    ('b1000000-0000-0000-0000-000000000007', r_food, 6.2),
    ('b1000000-0000-0000-0000-000000000007', r_apt,  5.5),
    ('b1000000-0000-0000-0000-000000000007', r_air,  5.2),
    ('b1000000-0000-0000-0000-000000000007', r_coast,8.8),
    ('b1000000-0000-0000-0000-000000000007', r_drive,5.8),
    ('b1000000-0000-0000-0000-000000000007', r_out,  8.5),
    ('b1000000-0000-0000-0000-000000000007', r_fm,   6.2),
    ('b1000000-0000-0000-0000-000000000007', r_noise,8.8),
    ('b1000000-0000-0000-0000-000000000007', r_dog,  7.8),
    ('b1000000-0000-0000-0000-000000000007', r_fp,   6.0),
    ('b1000000-0000-0000-0000-000000000007', r_vibe, 5.2);

  -- Golden Hill
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000008', r_walk, 7.0),
    ('b1000000-0000-0000-0000-000000000008', r_safe, 6.5),
    ('b1000000-0000-0000-0000-000000000008', r_food, 5.8),
    ('b1000000-0000-0000-0000-000000000008', r_apt,  5.5),
    ('b1000000-0000-0000-0000-000000000008', r_air,  7.0),
    ('b1000000-0000-0000-0000-000000000008', r_coast,2.5),
    ('b1000000-0000-0000-0000-000000000008', r_drive,7.2),
    ('b1000000-0000-0000-0000-000000000008', r_out,  7.2),
    ('b1000000-0000-0000-0000-000000000008', r_fm,   3.8),
    ('b1000000-0000-0000-0000-000000000008', r_noise,7.5),
    ('b1000000-0000-0000-0000-000000000008', r_dog,  7.2),
    ('b1000000-0000-0000-0000-000000000008', r_fp,   8.5),
    ('b1000000-0000-0000-0000-000000000008', r_vibe, 6.2);

  -- La Jolla
  insert into omo_scores (option_id, criterion_id, value) values
    ('b1000000-0000-0000-0000-000000000009', r_walk, 4.2),
    ('b1000000-0000-0000-0000-000000000009', r_safe, 9.5),
    ('b1000000-0000-0000-0000-000000000009', r_food, 7.8),
    ('b1000000-0000-0000-0000-000000000009', r_apt,  6.2),
    ('b1000000-0000-0000-0000-000000000009', r_air,  2.8),
    ('b1000000-0000-0000-0000-000000000009', r_coast,9.8),
    ('b1000000-0000-0000-0000-000000000009', r_drive,3.5),
    ('b1000000-0000-0000-0000-000000000009', r_out,  9.6),
    ('b1000000-0000-0000-0000-000000000009', r_fm,   7.2),
    ('b1000000-0000-0000-0000-000000000009', r_noise,9.0),
    ('b1000000-0000-0000-0000-000000000009', r_dog,  8.5),
    ('b1000000-0000-0000-0000-000000000009', r_fp,   9.0),
    ('b1000000-0000-0000-0000-000000000009', r_vibe, 5.0);

end $$;
