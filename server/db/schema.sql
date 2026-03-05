-- ============================================================
-- LOST & FOUND MANAGEMENT SYSTEM — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- 1. PROFILES (extends Supabase Auth users)
-- ─────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  student_id  text,                          -- only for students
  role        text not null default 'student'
                check (role in ('student', 'authority', 'admin')),
  created_at  timestamptz default now()
);

-- Auto-create profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────
create table public.categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  icon       text default '📦',
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- 3. LOST REPORTS
-- ─────────────────────────────────────────
create table public.lost_reports (
  id             uuid primary key default uuid_generate_v4(),
  item_name      text not null,
  category_id    uuid references public.categories(id) on delete set null,
  description    text,
  lost_location  text not null,
  lost_datetime  timestamptz not null,
  image_url      text,
  status         text not null default 'REPORTED'
                   check (status in ('REPORTED', 'REJECTED', 'CLOSED')),
  reported_by    uuid not null references public.profiles(id) on delete cascade,
  closed_by      uuid references public.profiles(id),  -- authority who closed/rejected
  notes          text,                                  -- authority notes on rejection
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- 4. FOUND ITEMS (Inventory)
-- ─────────────────────────────────────────
create table public.found_items (
  id               uuid primary key default uuid_generate_v4(),
  item_name        text not null,
  category_id      uuid references public.categories(id) on delete set null,
  description      text,
  found_location   text not null,
  date_found       date not null,
  image_url        text,
  storage_location text,                       -- e.g. "Locker A3", "Shelf B"
  status           text not null default 'AVAILABLE'
                     check (status in ('AVAILABLE', 'CLOSED')),
  added_by         uuid not null references public.profiles(id),
  closed_at        timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─────────────────────────────────────────
-- 5. CLAIMS
-- ─────────────────────────────────────────
create table public.claims (
  id              uuid primary key default uuid_generate_v4(),
  found_item_id   uuid not null references public.found_items(id) on delete cascade,
  claimed_by      uuid not null references public.profiles(id) on delete cascade,
  unique_marks    text not null,
  ownership_proof text not null,
  extra_details   text,
  status          text not null default 'PENDING'
                    check (status in ('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED')),
  reviewed_by     uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),

  -- One active claim per student per item
  unique (found_item_id, claimed_by)
);

-- ─────────────────────────────────────────
-- 6. DISPUTES
-- ─────────────────────────────────────────
create table public.disputes (
  id             uuid primary key default uuid_generate_v4(),
  found_item_id  uuid not null references public.found_items(id) on delete cascade,
  status         text not null default 'OPEN'
                   check (status in ('OPEN', 'RESOLVED')),
  resolved_by    uuid references public.profiles(id),
  winning_claim_id uuid references public.claims(id),
  notes          text,
  created_at     timestamptz default now(),
  resolved_at    timestamptz,

  unique (found_item_id)   -- one dispute record per item
);

-- ─────────────────────────────────────────
-- 7. ACTIVITY LOGS
-- ─────────────────────────────────────────
create table public.activity_logs (
  id           uuid primary key default uuid_generate_v4(),
  action       text not null,       -- e.g. 'CLAIM_SUBMITTED', 'ITEM_CLOSED'
  performed_by uuid references public.profiles(id) on delete set null,
  target_id    uuid,                -- ID of affected record
  target_type  text,                -- 'lost_report' | 'found_item' | 'claim' | 'dispute'
  metadata     jsonb,               -- extra info (old status, new status, etc.)
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────
-- 8. AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_lost_reports_updated_at
  before update on public.lost_reports
  for each row execute procedure public.set_updated_at();

create trigger set_found_items_updated_at
  before update on public.found_items
  for each row execute procedure public.set_updated_at();

create trigger set_claims_updated_at
  before update on public.claims
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- 9. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.lost_reports  enable row level security;
alter table public.found_items   enable row level security;
alter table public.claims        enable row level security;
alter table public.disputes      enable row level security;
alter table public.activity_logs enable row level security;

-- Helper function to get current user's role
create or replace function public.get_my_role()
returns text
language sql security definer stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ─── PROFILES ───
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Authority and admin can view all profiles"
  on public.profiles for select
  using (public.get_my_role() in ('authority', 'admin'));

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can insert profiles"
  on public.profiles for insert
  with check (public.get_my_role() = 'admin');

-- ─── CATEGORIES ───
create policy "Anyone authenticated can read categories"
  on public.categories for select
  using (auth.uid() is not null);

create policy "Admin can manage categories"
  on public.categories for all
  using (public.get_my_role() = 'admin');

-- ─── LOST REPORTS ───
create policy "Students can view own lost reports"
  on public.lost_reports for select
  using (auth.uid() = reported_by);

create policy "Authority and admin can view all lost reports"
  on public.lost_reports for select
  using (public.get_my_role() in ('authority', 'admin'));

create policy "Students can insert lost reports"
  on public.lost_reports for insert
  with check (auth.uid() = reported_by and public.get_my_role() = 'student');

create policy "Students can close own reports"
  on public.lost_reports for update
  using (auth.uid() = reported_by and public.get_my_role() = 'student');

create policy "Authority can update any lost report"
  on public.lost_reports for update
  using (public.get_my_role() in ('authority', 'admin'));

create policy "Admin can delete lost reports"
  on public.lost_reports for delete
  using (public.get_my_role() = 'admin');

-- ─── FOUND ITEMS ───
create policy "Anyone authenticated can view found items"
  on public.found_items for select
  using (auth.uid() is not null);

create policy "Authority can insert found items"
  on public.found_items for insert
  with check (public.get_my_role() in ('authority', 'admin'));

create policy "Authority can update found items"
  on public.found_items for update
  using (public.get_my_role() in ('authority', 'admin'));

-- ─── CLAIMS ───
create policy "Students can view own claims"
  on public.claims for select
  using (auth.uid() = claimed_by);

create policy "Authority can view all claims"
  on public.claims for select
  using (public.get_my_role() in ('authority', 'admin'));

create policy "Students can submit claims"
  on public.claims for insert
  with check (auth.uid() = claimed_by and public.get_my_role() = 'student');

create policy "Authority can update claim status"
  on public.claims for update
  using (public.get_my_role() in ('authority', 'admin'));

-- ─── DISPUTES ───
create policy "Authority can view and manage disputes"
  on public.disputes for all
  using (public.get_my_role() in ('authority', 'admin'));

-- ─── ACTIVITY LOGS ───
create policy "Admin can view activity logs"
  on public.activity_logs for select
  using (public.get_my_role() = 'admin');

create policy "System can insert activity logs"
  on public.activity_logs for insert
  with check (auth.uid() is not null);

-- ─────────────────────────────────────────
-- 10. SEED DATA — Categories
-- ─────────────────────────────────────────
insert into public.categories (name, icon) values
  ('Electronics',  '📱'),
  ('Documents',    '📄'),
  ('Keys',         '🔑'),
  ('Bags',         '🎒'),
  ('Clothing',     '👕'),
  ('Books',        '📚'),
  ('Accessories',  '⌚'),
  ('Sports',       '⚽'),
  ('Stationery',   '✏️'),
  ('Other',        '📦');

-- ─────────────────────────────────────────
-- DONE ✅
-- ─────────────────────────────────────────
