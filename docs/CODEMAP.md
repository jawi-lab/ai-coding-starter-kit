# Code Map

Where each feature lives. Paths are relative to the repo root; `app/`, `lib/` and `components/` mean the folders under `src/`; `groups/`, `profile/`, `native/` and `auth/` are folders in `src/components/`, and hook names are files in `src/hooks/`. Table names are in the Backend column, with Edge Functions marked `fn`. Unit tests sit next to their source and are not listed. If you move or add a central file, update this map.

## Features

| Feature | UI | Hooks | Lib | Backend |
|---------|----|-------|-----|---------|
| PROJ-2 Auth | `app/login`, `app/signup`, `app/forgot-password`, `app/reset-password`, `app/auth/callback`, `components/auth/` | – | `lib/auth-redirect.ts`, `lib/supabase.ts` | `profiles` |
| PROJ-3 Groups, members | `app/groups`, `components/groups/` (`CreateGroupForm`, `JoinGroupForm`, `GroupDetailSheet`, `MemberList`, `InviteCodeCard`) | `useGroups`, `useGroupDetail` | `lib/group-types.ts`, `lib/group-routes.ts`, `lib/last-group.ts` | `groups`, `group_members`, `group_members_history`, `invite_code_attempts`; fn `generate-invite-code` |
| PROJ-4 Proposals, voting | `groups/tabs/VorschlaegeTab`, `groups/ProposalCard`, `groups/ProposalFormSheet` | `useActivityProposals`, `useCreateProposal`, `useEditProposal`, `useDeleteProposal`, `useVote`, `useResetVotes`, `useOgImage` | `lib/activity-types.ts` | `activities`, `activity_votes` |
| PROJ-5 Kanban | `groups/tabs/PlanungTab`, `groups/KanbanBoard`, `KanbanColumn`, `KanbanCard` | `useKanbanActivities`, `useUpdateActivityStatus` | – | `activities` |
| PROJ-6 Activity detail | `groups/ActivityDetailSheet` | `useActivityDetail`, `useActivityComments`, `useScrollOnNewComment`, `useActivityPhotos`, `useActivityResponsibilities`, `useMyOpenResponsibilities`, `useSignedUrls` | `lib/comment-images.ts`, `lib/storage.ts` | `activity_comments`, `activity_photos`, `activity_responsibilities` |
| PROJ-7 Dates, calendar | `groups/tabs/TermineTab`, `groups/DateFinderSheet`, `profile/CalendarConnectionSection`, `profile/DateBlocksSection`, `app/auth/google-calendar/callback` | `useGroupSchedule`, `useGroupAvailability`, `useDateBlocks`, `useCalendarConnection` | `lib/ical-export.ts`, `lib/date-format.ts` | `calendar_connections`, `user_date_blocks`, `group_availability_cache`; fn `get-group-availability` |
| PROJ-8 Profile, archive | `profile/ProfileSheet`, `ProfileSection`, `AppearanceSection`, `AlbumTab` | `useProfile`, `useArchive`, `useTheme` | `lib/avatar.ts` | `profiles` |
| PROJ-9 Native apps | `components/native/` | `useKeyboardInset`, `useSheetDrag` | `lib/native/` | `capacitor.config.ts`, `android/`, `ios/` |
| PROJ-10 Push | `native/NativePushListener`, `profile/PushNotificationSection` | `usePushPermission` | `lib/native/push.ts` | `device_tokens`; fn `send-push` |
| PROJ-11 OTA | `native/NativeUpdater` | – | `lib/native/ota.ts` | – |
| PROJ-12 Notifications | `components/notifications/`, `profile/NotificationPreferencesSection` | `useNotifications`, `useNotificationPreferences` | `lib/notification-types.ts` | `notifications`, `notification_preferences`; fn `unsubscribe` |
| PROJ-13 Onboarding | `app/onboarding`, `components/onboarding/` | – | – | `profiles` |
| PROJ-14 Polls | `groups/PollSection`, `PollCard`, `PollOptionRow`, `CreatePollSheet` | `useActivityPolls` | – | `activity_polls`, `activity_poll_options`, `activity_poll_votes` |
| PROJ-15 Momentum | `groups/MomentumBanner`, `MomentumCelebration`, `MomentumLevelSheet` | `useGroupMomentum` | `lib/momentum.ts` | `group_momentum`, `group_momentum_seen` |
| PROJ-16 Badges | `groups/MemberBadgeIcons`, `profile/BadgeSection`, `components/icons/mellon-icons.tsx` | `useUserBadges`, `useGroupBadges` | `lib/badges.ts`, `lib/badge-toasts.ts` | `user_badges` |
| PROJ-17 Memory cards | `components/memory/`, `profile/AlbumTab` | `useMemoryCovers`, `useAlbumBadge` | `lib/memory-card.ts`, `lib/native/share-image.ts` | – |
| PROJ-18 Wrapped | `components/wrapped/` | `useGroupWrapped`, `useWrappedAvailability` | `lib/wrapped.ts`, `lib/wrapped-share.ts` | – |

PROJ-1 (Supabase setup) is cross-cutting: `lib/supabase.ts`, `lib/database.types.ts`, `supabase/migrations/`.

E2E tests are named after the feature: `tests/PROJ-X-*.spec.ts`. PROJ-1, 9, 10, 11 and 18 have none. `tests/apple-design-sheets.spec.ts` covers sheet behavior across features.

## App Shell and Routing

- `app/layout.tsx` is the root layout. `contexts/AuthContext.tsx` holds the session, and `auth/AuthGuard.tsx` protects pages.
- `app/page.tsx` only redirects, to `/groups` or `/onboarding`.
- **Group view is one static page with query params:** `/groups/view/?id=…&activity=…`, because static export has no dynamic routes. Build these URLs with `lib/group-routes.ts`.
- `groups/GroupShellContext`, `GroupBottomNav` (mobile) and `DesktopSidebar` (desktop) form the group navigation.
- Native routing: `lib/native/deep-link.ts`, plus the static router fixes in `ios/App/App/MainViewController.swift` and `android/app/src/main/java/com/zusammen/app/NextStaticWebViewClient.java`.

## Edge Functions

`supabase/functions/`: `generate-invite-code`, `get-group-availability`, `send-push`, `unsubscribe`; shared code in `_shared/`.
