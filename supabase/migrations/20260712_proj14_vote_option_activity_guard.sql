-- PROJ-14 QA hardening (SEC-14-1): tighten the vote INSERT policy.
--
-- The original policy trusted the client-supplied denormalised `activity_id`
-- (writable status + self-authored) but never checked that `option_id` actually
-- belongs to a poll option in that activity. A member of a writable activity could
-- therefore insert a vote row referencing an option from a *different* activity by
-- passing their own activity_id. The symmetric SELECT policy hid such rows and
-- unique(option_id,user_id) + self-authorship prevented any visible tampering, so
-- there was no exploitable impact — but defense-in-depth wants the row to be
-- internally consistent. Add an EXISTS check tying option_id ↔ activity_id.

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
