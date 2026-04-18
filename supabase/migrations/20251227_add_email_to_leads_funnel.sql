-- Add email column to leads_funnel table to store purchase email
ALTER TABLE public.leads_funnel ADD COLUMN IF NOT EXISTS email text;

-- Add email column to leads table (used by leadSyncService / checkpoints)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email text;
