-- BUG-1: Enable PostgREST to embed profiles on group_members.
-- group_members.user_id already FKs auth.users; add a parallel FK to
-- public.profiles (whose id == auth.users.id) so the profiles(...) embed resolves.
alter table public.group_members
  add constraint group_members_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
