
-- Add goals array column to user_preferences
ALTER TABLE public.user_preferences ADD COLUMN goals text[] NOT NULL DEFAULT ARRAY['suivre'::text];

-- Migrate existing goal data to goals array
UPDATE public.user_preferences SET goals = ARRAY[goal];

-- Create tontines table
CREATE TABLE public.tontines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  amount BIGINT NOT NULL,
  cagnotte BIGINT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tontines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tontines" ON public.tontines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tontines" ON public.tontines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tontines" ON public.tontines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tontines" ON public.tontines FOR DELETE USING (auth.uid() = user_id);

-- Create tontine_payments table to track each payment cycle
CREATE TABLE public.tontine_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount BIGINT NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  note TEXT
);

ALTER TABLE public.tontine_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tontine payments" ON public.tontine_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tontine payments" ON public.tontine_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tontine payments" ON public.tontine_payments FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_tontines_updated_at BEFORE UPDATE ON public.tontines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
