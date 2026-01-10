-- Add category column to notes table
ALTER TABLE public.notes ADD COLUMN category text DEFAULT 'general';

-- Create an index for faster category filtering
CREATE INDEX idx_notes_category ON public.notes(category);