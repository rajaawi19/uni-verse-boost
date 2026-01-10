-- Add email notification preference columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS email_study_reminders boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS email_task_due_dates boolean NOT NULL DEFAULT true;