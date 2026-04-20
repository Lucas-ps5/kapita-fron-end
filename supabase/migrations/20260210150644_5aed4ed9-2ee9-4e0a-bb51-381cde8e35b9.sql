
-- Add activity_types array column to support multiple activities
ALTER TABLE public.user_preferences 
ADD COLUMN activity_types text[] NOT NULL DEFAULT ARRAY['autre']::text[];

-- Migrate existing data from activity_type to activity_types
UPDATE public.user_preferences 
SET activity_types = ARRAY[activity_type::text];
