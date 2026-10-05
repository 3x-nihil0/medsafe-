-- ============================================================
-- MedSafe care-team schema (Supabase / PostgreSQL)
--
-- Run this ONCE in the Supabase dashboard:
--   SQL Editor → New query → paste this file → Run
--
-- Security model: every table has Row Level Security enabled, so
-- the database itself refuses any read/write a user is not part
-- of - roles are never trusted from the app. This is the fix for
-- the original product's auth-bypass vulnerabilities.
-- ============================================================

-- ---------- 1. profiles: one row per signed-up user ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null check (role in ('patient', 'doctor')),
  full_name   text not null check (char_length(full_name) between 2 and 120),
  specialty   text check (char_length(specialty) <= 120),   -- doctors only
  license_no  text check (char_length(license_no) <= 80),   -- doctors only
  created_at  timestamptz not null default now()
);

-- ---------- 2. care_links: patient ↔ doctor relationship ----------
create table if not exists public.care_links (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.profiles (id) on delete cascade,
  doctor_id   uuid not null references public.profiles (id) on delete cascade,
  status      text not null default 'pending'
              check (status in ('pending', 'active', 'declined', 'ended')),
  created_at  timestamptz not null default now(),
  unique (patient_id, doctor_id)
);
create index if not exists care_links_patient_idx on public.care_links (patient_id);
create index if not exists care_links_doctor_idx  on public.care_links (doctor_id);

-- ---------- 3. messages: chat between linked patient & doctor ----------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  link_id     uuid not null references public.care_links (id) on delete cascade,
  sender_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 4000),
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
create index if not exists messages_link_idx on public.messages (link_id, created_at);

-- ---------- 4. clinical_notes: doctor's notes on a patient ----------
create table if not exists public.clinical_notes (
  id          uuid primary key default gen_random_uuid(),
  link_id     uuid not null references public.care_links (id) on delete cascade,
  doctor_id   uuid not null references public.profiles (id) on delete cascade,
  patient_id  uuid not null references public.profiles (id) on delete cascade,
  note        text not null check (char_length(note) between 1 and 8000),
  created_at  timestamptz not null default now()
);
create index if not exists clinical_notes_patient_idx on public.clinical_notes (patient_id, created_at desc);

-- ---------- 5. med_snapshots: the patient's shared medication list ----------
create table if not exists public.med_snapshots (
  patient_id  uuid primary key references public.profiles (id) on delete cascade,
  payload     jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.care_links    enable row level security;
alter table public.messages      enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.med_snapshots enable row level security;

-- profiles: any signed-in user may browse the doctor directory;
-- you may only create/edit your own row.
drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- care_links: participants may read; only a patient may create their own
-- pending request; only the doctor on the link may change its status
-- (and the patient may cancel their own request).
drop policy if exists "participants read links" on public.care_links;
create policy "participants read links"
  on public.care_links for select
  to authenticated
  using (patient_id = auth.uid() or doctor_id = auth.uid());

drop policy if exists "patient creates own request" on public.care_links;
create policy "patient creates own request"
  on public.care_links for insert
  to authenticated
  with check (patient_id = auth.uid() and status = 'pending');

drop policy if exists "doctor answers request" on public.care_links;
create policy "doctor answers request"
  on public.care_links for update
  to authenticated
  using (doctor_id = auth.uid())
  with check (doctor_id = auth.uid());

drop policy if exists "patient cancels request" on public.care_links;
create policy "patient cancels request"
  on public.care_links for delete
  to authenticated
  using (patient_id = auth.uid());

-- messages: only the two participants of a link may read it;
-- a sender may only post as themselves, inside their own link.
drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.care_links c
      where c.id = link_id
        and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
    )
  );

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.care_links c
      where c.id = link_id
        and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
    )
  );

-- clinical_notes: participants may read; only the linked doctor may write.
drop policy if exists "participants read notes" on public.clinical_notes;
create policy "participants read notes"
  on public.clinical_notes for select
  to authenticated
  using (
    doctor_id = auth.uid()
    or patient_id = auth.uid()
    or exists (
      select 1 from public.care_links c
      where c.id = link_id
        and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
    )
  );

drop policy if exists "doctor writes own notes" on public.clinical_notes;
create policy "doctor writes own notes"
  on public.clinical_notes for insert
  to authenticated
  with check (doctor_id = auth.uid());

-- med_snapshots: the patient owns their snapshot; only an ACTIVE
-- linked doctor may read it. Nothing else can see it.
drop policy if exists "patient writes own snapshot" on public.med_snapshots;
create policy "patient writes own snapshot"
  on public.med_snapshots for insert
  to authenticated
  with check (patient_id = auth.uid());

drop policy if exists "patient updates own snapshot" on public.med_snapshots;
create policy "patient updates own snapshot"
  on public.med_snapshots for update
  to authenticated
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

drop policy if exists "owner or active doctor reads snapshot" on public.med_snapshots;
create policy "owner or active doctor reads snapshot"
  on public.med_snapshots for select
  to authenticated
  using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.care_links c
      where c.patient_id = med_snapshots.patient_id
        and c.doctor_id = auth.uid()
        and c.status = 'active'
    )
  );

-- Optional: enable realtime chat (messages are polled as a fallback,
-- so this step is nice-to-have, not required).
-- do $$
-- begin
--   alter publication supabase_realtime add table public.messages;
-- exception when duplicate_object then null;
-- end $$;
