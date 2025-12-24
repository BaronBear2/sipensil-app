-- Create storage buckets for the application
-- NOTE: This often requires Supabase Dashboard access or extensions enabled, but we can try SQL driven creation if Storage schema is exposed.
-- Typically, buckets are row records in `storage.buckets`.

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('im_japan_documents', 'im_japan_documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public access (Simplified for development)
-- Allow Public READ
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Access Documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Public Access IM Japan" ON storage.objects FOR SELECT USING (bucket_id = 'im_japan_documents');

-- Allow Authenticated UPLOAD
CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Upload Documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Upload IM Japan" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'im_japan_documents' AND auth.role() = 'authenticated');
