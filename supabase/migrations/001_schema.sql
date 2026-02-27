-- Project 4H Dashboard — Initial Schema
-- Run this in Supabase SQL Editor or via psql

-- ─── EXTENSIONS ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── ENUMS ─────────────────────────────────────────────────────────────────────
create type ad_status as enum ('approved', 'pending', 'paused', 'rejected');
create type ad_platform as enum ('linkedin', 'youtube', 'facebook', 'instagram');
create type campaign_status as enum ('pre-launch', 'live', 'paused', 'ended');
create type channel_status as enum ('ready', 'live', 'paused', 'ended');
create type lifecycle_channel as enum ('email', 'sms');
create type lifecycle_status as enum ('active', 'paused');
create type approval_status as enum ('pending', 'approved', 'rejected', 'revise');

-- ─── ADS ───────────────────────────────────────────────────────────────────────
create table ads (
  id              text primary key,               -- e.g. "LI-R1"
  platform        ad_platform not null,
  campaign_group  text not null,
  format          text not null,                  -- static1x1, video30, reel9x16, etc.
  primary_text    text not null,
  headline        text,
  cta             text not null,
  landing_path    text not null,
  utm_source      text not null,
  utm_medium      text not null,
  utm_campaign    text not null,
  utm_content     text not null,
  utm_term        text not null,
  status          ad_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table ad_status_history (
  id         uuid primary key default uuid_generate_v4(),
  ad_id      text not null references ads(id) on delete cascade,
  status     ad_status not null,
  note       text,
  changed_at timestamptz not null default now()
);

create index on ads(platform);
create index on ads(status);
create index on ad_status_history(ad_id);

-- ─── WEEKLY METRICS ────────────────────────────────────────────────────────────
create table weekly_metrics (
  id           uuid primary key default uuid_generate_v4(),
  week_start   date not null,
  platform     ad_platform not null,
  spend        numeric(10,2) not null default 0,
  impressions  integer not null default 0,
  clicks       integer not null default 0,
  signups      integer not null default 0,
  activations  integer not null default 0,
  paid         integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (week_start, platform)
);

create index on weekly_metrics(week_start);

-- ─── LIFECYCLE MESSAGES ────────────────────────────────────────────────────────
create table lifecycle_messages (
  id         text primary key,              -- e.g. "ONB-EMAIL-01"
  asset_id   text not null,
  channel    lifecycle_channel not null,
  timing     text not null,                 -- "day0", "day1", "day3"
  subject    text,
  message    text not null,
  goal       text not null,
  status     lifecycle_status not null default 'active',
  updated_at timestamptz not null default now()
);

-- ─── LAUNCH CHECKLIST ──────────────────────────────────────────────────────────
create table launch_checklist (
  id         text primary key,              -- e.g. "LG-05"
  label      text not null,
  platform   text not null,                 -- "linkedin", "meta", "youtube", "tracking", "all"
  checked    boolean not null default false,
  updated_at timestamptz
);

-- ─── BUDGET ────────────────────────────────────────────────────────────────────
create table budget (
  platform   ad_platform primary key,
  allocated  numeric(10,2) not null default 5000,
  spent      numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);

-- ─── CAMPAIGN STATUS ───────────────────────────────────────────────────────────
create table campaign_config (
  id                 integer primary key default 1 check (id = 1),  -- singleton
  status             campaign_status not null default 'pre-launch',
  start_date         date,
  linkedin_status    channel_status not null default 'ready',
  youtube_status     channel_status not null default 'ready',
  facebook_status    channel_status not null default 'ready',
  instagram_status   channel_status not null default 'ready',
  total_budget       numeric(10,2) not null default 20000,
  updated_at         timestamptz not null default now()
);

-- ─── APPROVAL QUEUE ────────────────────────────────────────────────────────────
create table approval_queue (
  id          text primary key,
  type        text not null,               -- "retargeting_ad", "lp_block", "lifecycle", "creative_brief"
  title       text not null,
  content     text not null,
  platform    text,
  status      approval_status not null default 'pending',
  note        text,
  updated_at  timestamptz not null default now()
);

-- ─── ACTIVITY LOG ──────────────────────────────────────────────────────────────
create table activity_log (
  id          uuid primary key default uuid_generate_v4(),
  entity_type text not null,              -- "ad", "metric", "checklist", "budget", "campaign"
  entity_id   text not null,
  action      text not null,              -- "status_changed", "metric_updated", "checked", etc.
  old_value   jsonb,
  new_value   jsonb,
  note        text,
  created_at  timestamptz not null default now()
);

create index on activity_log(created_at desc);
create index on activity_log(entity_type, entity_id);

-- ─── UPDATED_AT TRIGGER ────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ads_updated_at before update on ads
  for each row execute procedure set_updated_at();
create trigger weekly_metrics_updated_at before update on weekly_metrics
  for each row execute procedure set_updated_at();
create trigger lifecycle_messages_updated_at before update on lifecycle_messages
  for each row execute procedure set_updated_at();
create trigger budget_updated_at before update on budget
  for each row execute procedure set_updated_at();
create trigger campaign_config_updated_at before update on campaign_config
  for each row execute procedure set_updated_at();
