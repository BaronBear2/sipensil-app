-- Add photo_url column to profile_pencaker table
ALTER TABLE profile_pencaker ADD COLUMN IF NOT EXISTS photo_url TEXT;
