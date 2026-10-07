-- MedSafe care-team patch - run once in the Supabase SQL Editor (SQL tab),
-- then reload the app. Safe to re-run: every statement is idempotent.
--
-- 1) strips the last em/en dashes from seeded chat text (dash cleanup pass)
-- 2) lets a signed-in participant mark a thread read -> powers the unread
--    badge on Safety > Care (read receipts)
-- 3) puts public.messages into the realtime publication -> chat updates
--    instantly instead of every 15 seconds (the app keeps a 15s polling
--    fallback when realtime is unavailable, so nothing breaks either way)

begin;

-- 1) dash cleanup: replace em dash / en dash with a plain hyphen
update public.messages
   set body = translate(body, '—–', '-')
 where body ~ '[—–]';

update public.clinical_notes
   set note = translate(note, '—–', '-')
 where note ~ '[—–]';

-- 2) read receipts: participants may update rows in their own thread.
-- The client only ever writes read_at; messages you cannot already read
-- stay invisible (row-level security).
drop policy if exists "participants update messages" on public.messages;
create policy "participants update messages"
  on public.messages for update
  to authenticated
  using (
    exists (
      select 1 from public.care_links c
      where c.id = link_id
        and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.care_links c
      where c.id = link_id
        and (c.patient_id = auth.uid() or c.doctor_id = auth.uid())
    )
  );

-- 3) realtime chat (adding an already-present table raises duplicate_object)
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

commit;
