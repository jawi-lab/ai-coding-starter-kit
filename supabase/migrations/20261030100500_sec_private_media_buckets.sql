-- Security audit run-1, Fall 5 + 10.

-- Fall 5: Die Buckets standen außerhalb der Migrationen auf public. Lesen läuft
-- künftig über signierte URLs und damit über die SELECT-Policies.
UPDATE storage.buckets SET public = false
WHERE id IN ('activity-photos', 'activity-comment-images');

-- Der avatars-Bucket existierte bisher nur remote; bleibt bewusst öffentlich.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS avatars_user_upload ON storage.objects;
CREATE POLICY avatars_user_upload ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS avatars_user_update ON storage.objects;
CREATE POLICY avatars_user_update ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS avatars_user_delete ON storage.objects;
CREATE POLICY avatars_user_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Fall 10: Ein Fotoeintrag darf nur auf eine Datei im eigenen Ordner zeigen. Sonst
-- löscht ein moderierender Admin über eine Köderzeile fremde Dateien.
ALTER TABLE public.activity_photos
  ADD CONSTRAINT activity_photos_storage_path_owner CHECK (
    storage_path LIKE activity_id::text || '/' || user_id::text || '/%'
    AND storage_path NOT LIKE '%..%'
  );
