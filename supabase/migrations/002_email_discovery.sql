-- Email discovery: store discovered emails and resolved contact for each what-if
alter table what_ifs add column discovered_emails jsonb;
alter table what_ifs add column resolved_contact text;
alter table what_ifs add column email_discovery_status text default 'pending';

-- Index for finding cards that need email discovery
create index what_ifs_email_status_idx on what_ifs(user_id, email_discovery_status);
