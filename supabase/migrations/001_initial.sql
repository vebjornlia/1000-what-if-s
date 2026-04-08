-- User profiles built from onboarding conversation
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  raw_conversation jsonb,
  structured_profile jsonb,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Generated what-if opportunities
create table what_ifs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  batch_number int default 1,
  card_index int,
  category text,
  emoji text,
  recipient_name text,
  recipient_description text,
  message_subject text,
  message_body text,
  status text default 'unseen',
  swiped_at timestamptz,
  sent_at timestamptz,
  got_reply boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table what_ifs enable row level security;

-- RLS policies
create policy "Users see own profile" on profiles for all using (auth.uid() = id);
create policy "Users see own what_ifs" on what_ifs for all using (auth.uid() = user_id);

-- Index for fast lookups
create index what_ifs_user_status_idx on what_ifs(user_id, status);
create index what_ifs_user_batch_idx on what_ifs(user_id, batch_number, card_index);
