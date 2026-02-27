-- Project 4H Dashboard v2 — Workflow + Templates

create extension if not exists pgcrypto;

alter table ads
  add column if not exists workflow_stage text not null default 'concept';

update ads
set workflow_stage = case
  when status = 'approved' then 'approved'
  when status = 'paused' then 'uploaded'
  when status = 'rejected' then 'concept'
  else 'copy-ready'
end
where workflow_stage is null
   or workflow_stage = 'concept';

create table if not exists ad_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  platform text not null,
  format text,
  primary_text text,
  headline text,
  cta text,
  landing_path text,
  utm_campaign text,
  created_at timestamptz default now()
);

create index if not exists ad_templates_created_at_idx on ad_templates(created_at desc);
