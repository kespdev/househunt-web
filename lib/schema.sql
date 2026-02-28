-- =============================================================
-- HouseHunt Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database
-- =============================================================

-- ─── STEP 1: CREATE ALL TABLES FIRST ────────────────────────

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  avatar text,
  created_at timestamptz not null default now()
);

-- 2. GROUPS (hunts)
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  invite_code text not null unique,
  status text not null default 'active' check (status in ('active', 'completed')),
  move_date text,
  move_exact_date text,
  hunt_type text check (hunt_type in ('rent', 'buy')),
  completed_at timestamptz,
  completion_reason text check (completion_reason in ('found_place', 'stopped_searching')),
  chosen_apartment_id uuid
);

-- 3. GROUP MEMBERS
create table public.group_members (
  user_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  role text not null default 'member' check (role in ('creator', 'member')),
  joined_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

-- 4. APARTMENTS
create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  source_url text not null default '',
  address text not null,
  price numeric not null,
  bedrooms integer not null,
  bathrooms integer not null,
  square_footage integer,
  photos text[] not null default '{}',
  listing_source text not null default '',
  status text not null default 'New' check (status in ('New', 'Shortlist', 'Tour', 'Rejected', 'FinalChoice')),
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz not null default now(),
  tags text[]
);

-- 5. RATINGS
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid references public.apartments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  value text not null check (value in ('Love', 'Maybe', 'Pass')),
  created_at timestamptz not null default now(),
  unique (apartment_id, user_id)
);

-- 6. NOTES
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid references public.apartments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz not null default now()
);

-- 7. NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  apartment_id uuid references public.apartments(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null default 'new_listing',
  read boolean not null default false,
  created_at timestamptz not null default now()
);


-- ─── STEP 2: ENABLE RLS ON ALL TABLES ───────────────────────

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.apartments enable row level security;
alter table public.ratings enable row level security;
alter table public.notes enable row level security;
alter table public.notifications enable row level security;


-- ─── STEP 3: RLS POLICIES ───────────────────────────────────

-- Profiles
create policy "Users can view profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Groups
create policy "Anyone can read groups"
  on public.groups for select using (true);

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Members can update their groups"
  on public.groups for update
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = groups.id
        and group_members.user_id = auth.uid()
    )
  );

-- Group Members
create policy "Members can view group memberships"
  on public.group_members for select
  using (auth.uid() = user_id);

create policy "Users can insert own membership"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own membership"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- Apartments
create policy "Members can view apartments in their groups"
  on public.apartments for select
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = apartments.group_id
        and group_members.user_id = auth.uid()
    )
  );

create policy "Members can insert apartments to their groups"
  on public.apartments for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.group_members
      where group_members.group_id = apartments.group_id
        and group_members.user_id = auth.uid()
    )
  );

create policy "Members can update apartments in their groups"
  on public.apartments for update
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = apartments.group_id
        and group_members.user_id = auth.uid()
    )
  );

-- Ratings
create policy "Members can view ratings for apartments in their groups"
  on public.ratings for select
  using (
    exists (
      select 1 from public.apartments apt
      join public.group_members gm on gm.group_id = apt.group_id
      where apt.id = ratings.apartment_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Users can insert own ratings"
  on public.ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ratings"
  on public.ratings for update
  using (auth.uid() = user_id);

-- Notes
create policy "Members can view notes for apartments in their groups"
  on public.notes for select
  using (
    exists (
      select 1 from public.apartments apt
      join public.group_members gm on gm.group_id = apt.group_id
      where apt.id = notes.apartment_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

-- Notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = recipient_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = recipient_id);


-- ─── STEP 4: TRIGGERS ───────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-create notifications when an apartment is added
create or replace function public.handle_new_apartment()
returns trigger as $$
begin
  insert into public.notifications (recipient_id, group_id, apartment_id, actor_id, type)
  select
    gm.user_id,
    new.group_id,
    new.id,
    new.created_by,
    'new_listing'
  from public.group_members gm
  where gm.group_id = new.group_id
    and gm.user_id != new.created_by;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_apartment_created
  after insert on public.apartments
  for each row execute function public.handle_new_apartment();


-- ─── STEP 5: INDEXES ────────────────────────────────────────

create index idx_group_members_group_id on public.group_members(group_id);
create index idx_group_members_user_id on public.group_members(user_id);
create index idx_apartments_group_id on public.apartments(group_id);
create index idx_ratings_apartment_id on public.ratings(apartment_id);
create index idx_notes_apartment_id on public.notes(apartment_id);
create index idx_notifications_recipient_id on public.notifications(recipient_id);
create index idx_groups_invite_code on public.groups(invite_code);


-- ─── STEP 6: ENABLE REALTIME ────────────────────────────────

alter publication supabase_realtime add table public.apartments;
alter publication supabase_realtime add table public.ratings;
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.notifications;
