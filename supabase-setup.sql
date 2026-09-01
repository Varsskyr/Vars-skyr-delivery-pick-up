create table if not exists deliveries (
  id text primary key,
  customer text not null,
  address text not null,
  phone text,
  area text not null default 'Route',
  tubs integer not null check (tubs > 0),
  completed boolean not null default false,
  completed_at timestamptz,
  stop_order integer not null
);

alter table deliveries add column if not exists phone text;

alter table deliveries enable row level security;

drop policy if exists "Routeboard can read deliveries" on deliveries;
drop policy if exists "Routeboard can add deliveries" on deliveries;
drop policy if exists "Routeboard can update deliveries" on deliveries;
drop policy if exists "Routeboard can remove deliveries" on deliveries;

create policy "Routeboard can read deliveries"
  on deliveries for select to anon using (true);
create policy "Routeboard can add deliveries"
  on deliveries for insert to anon with check (true);
create policy "Routeboard can update deliveries"
  on deliveries for update to anon using (true) with check (true);
create policy "Routeboard can remove deliveries"
  on deliveries for delete to anon using (true);

grant select, insert, update, delete on deliveries to anon;

create table if not exists pickup_deliveries (
  id text primary key,
  customer text not null,
  address text not null default 'Pickup address not provided',
  phone text,
  order_number text,
  area text not null default 'Pickup route',
  tubs integer not null check (tubs > 0),
  completed boolean not null default false,
  completed_at timestamptz,
  stop_order integer not null
);

alter table pickup_deliveries enable row level security;

drop policy if exists "Routeboard can read pickups" on pickup_deliveries;
drop policy if exists "Routeboard can add pickups" on pickup_deliveries;
drop policy if exists "Routeboard can update pickups" on pickup_deliveries;
drop policy if exists "Routeboard can remove pickups" on pickup_deliveries;

create policy "Routeboard can read pickups"
  on pickup_deliveries for select to anon using (true);
create policy "Routeboard can add pickups"
  on pickup_deliveries for insert to anon with check (true);
create policy "Routeboard can update pickups"
  on pickup_deliveries for update to anon using (true) with check (true);
create policy "Routeboard can remove pickups"
  on pickup_deliveries for delete to anon using (true);

grant select, insert, update, delete on pickup_deliveries to anon;
