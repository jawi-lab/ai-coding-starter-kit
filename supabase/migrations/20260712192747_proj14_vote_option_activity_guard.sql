-- PROJ-14 QA hardening (SEC-14-1): tighten the vote INSERT policy so option_id must
-- belong to a poll option in the supplied activity_id (defense-in-depth).
-- User explicitly approved applying to production project fogldssdmqgeffpuhvxd.
drop policy if exists "Group members can cast votes" on public.activity_poll_votes;

create policy "Group members can cast votes"
  on public.activity_poll_votes for insert to authenticated
  with check (
    auth.uid() = user_id
    and public.is_activity_polls_writable(activity_id)
    and exists (
      select 1 from public.activity_poll_options o
      where o.id = option_id
        and o.activity_id = activity_poll_votes.activity_id
    )
  );
