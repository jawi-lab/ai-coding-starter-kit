-- User-authorized fix: storage RLS group-membership checks for comment images
-- & activity photos referenced storage.foldername(activities.name) (the table
-- column) instead of the object's own `name` path, so is_group_member(NULL) =>
-- false and EVERY upload/read was denied.
-- Path layout: <activityId>/<userId>/<uuid>.<ext>

-- ── activity-comment-images ────────────────────────────────────────────────
DROP POLICY IF EXISTS comment_images_insert ON storage.objects;
CREATE POLICY comment_images_insert ON storage.objects
  FOR INSERT TO public
  WITH CHECK (
    bucket_id = 'activity-comment-images'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND is_group_member((
      SELECT a.group_id FROM activities a
      WHERE a.id = ((storage.foldername(name))[1])::uuid
    ))
  );

DROP POLICY IF EXISTS comment_images_select ON storage.objects;
CREATE POLICY comment_images_select ON storage.objects
  FOR SELECT TO public
  USING (
    bucket_id = 'activity-comment-images'
    AND is_group_member((
      SELECT a.group_id FROM activities a
      WHERE a.id = ((storage.foldername(name))[1])::uuid
    ))
  );

DROP POLICY IF EXISTS comment_images_delete ON storage.objects;
CREATE POLICY comment_images_delete ON storage.objects
  FOR DELETE TO public
  USING (
    bucket_id = 'activity-comment-images'
    AND (
      (auth.uid())::text = (storage.foldername(name))[2]
      OR is_group_admin((
        SELECT a.group_id FROM activities a
        WHERE a.id = ((storage.foldername(name))[1])::uuid
      ))
    )
  );

-- ── activity-photos (same latent bug) ──────────────────────────────────────
DROP POLICY IF EXISTS activity_photos_insert ON storage.objects;
CREATE POLICY activity_photos_insert ON storage.objects
  FOR INSERT TO public
  WITH CHECK (
    bucket_id = 'activity-photos'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND is_group_member((
      SELECT a.group_id FROM activities a
      WHERE a.id = ((storage.foldername(name))[1])::uuid
    ))
  );

DROP POLICY IF EXISTS activity_photos_select ON storage.objects;
CREATE POLICY activity_photos_select ON storage.objects
  FOR SELECT TO public
  USING (
    bucket_id = 'activity-photos'
    AND is_group_member((
      SELECT a.group_id FROM activities a
      WHERE a.id = ((storage.foldername(name))[1])::uuid
    ))
  );

DROP POLICY IF EXISTS activity_photos_delete ON storage.objects;
CREATE POLICY activity_photos_delete ON storage.objects
  FOR DELETE TO public
  USING (
    bucket_id = 'activity-photos'
    AND (
      (auth.uid())::text = (storage.foldername(name))[2]
      OR is_group_admin((
        SELECT a.group_id FROM activities a
        WHERE a.id = ((storage.foldername(name))[1])::uuid
      ))
    )
  );
