
-- Add start_date and duration to tontines
ALTER TABLE public.tontines ADD COLUMN start_date date DEFAULT NULL;
ALTER TABLE public.tontines ADD COLUMN duration_months integer DEFAULT NULL;
