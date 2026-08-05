CREATE POLICY "anyone can upload listing photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'listing-uploads');

CREATE POLICY "admins read listing photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'listing-uploads' AND public.is_admin());

CREATE POLICY "admins update listing photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-uploads' AND public.is_admin())
  WITH CHECK (bucket_id = 'listing-uploads' AND public.is_admin());

CREATE POLICY "admins delete listing photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'listing-uploads' AND public.is_admin());