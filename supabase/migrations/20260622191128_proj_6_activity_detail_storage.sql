
-- Create storage buckets
-- Path convention:
--   activity-comment-images: {activity_id}/{user_id}/{uuid}.{ext}
--   activity-photos:          {activity_id}/{user_id}/{uuid}.{ext}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'activity-comment-images',
    'activity-comment-images',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  ),
  (
    'activity-photos',
    'activity-photos',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: activity-comment-images
CREATE POLICY "comment_images_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'activity-comment-images'
    AND is_group_member((
      SELECT group_id FROM activities
      WHERE id = (storage.foldername(name))[1]::uuid
    ))
  );

CREATE POLICY "comment_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activity-comment-images'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND is_group_member((
      SELECT group_id FROM activities
      WHERE id = (storage.foldername(name))[1]::uuid
    ))
  );

CREATE POLICY "comment_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'activity-comment-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[2]
      OR is_group_admin((
        SELECT group_id FROM activities
        WHERE id = (storage.foldername(name))[1]::uuid
      ))
    )
  );

-- Storage RLS: activity-photos
CREATE POLICY "activity_photos_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'activity-photos'
    AND is_group_member((
      SELECT group_id FROM activities
      WHERE id = (storage.foldername(name))[1]::uuid
    ))
  );

CREATE POLICY "activity_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activity-photos'
    AND auth.uid()::text = (storage.foldername(name))[2]
    AND is_group_member((
      SELECT group_id FROM activities
      WHERE id = (storage.foldername(name))[1]::uuid
    ))
  );

CREATE POLICY "activity_photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'activity-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[2]
      OR is_group_admin((
        SELECT group_id FROM activities
        WHERE id = (storage.foldername(name))[1]::uuid
      ))
    )
  );
