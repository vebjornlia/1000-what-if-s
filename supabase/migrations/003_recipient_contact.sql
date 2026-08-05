-- Recipient contact: the AI-suggested contact (email or profile/URL) for each what-if.
-- App code inserts and selects this column (app/api/generate/route.ts,
-- app/api/discover-email/route.ts, and several UI components), but earlier
-- migrations never created it, so a database provisioned purely from migrations
-- rejects every generation with "column what_ifs.recipient_contact does not exist".
-- Nullable text; application code coalesces null to "". `if not exists` keeps this
-- migration safe to run against a database where the column was added out-of-band.
alter table what_ifs add column if not exists recipient_contact text;
