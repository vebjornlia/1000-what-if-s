-- Recipient contact suggested at generation time (a URL, handle, or email).
-- app/api/generate/route.ts inserts it and app/api/discover-email/route.ts
-- selects it, but no earlier migration defined the column, so a database
-- provisioned purely from migrations rejects every generation INSERT with
-- "column what_ifs.recipient_contact does not exist".
-- `if not exists` so this is a safe no-op if the column was already added
-- out-of-band on a live database.
alter table what_ifs add column if not exists recipient_contact text;
