-- Recipient contact captured at generation time (raw email or profile URL).
-- Code inserts (app/api/generate/route.ts) and selects (app/api/discover-email/route.ts)
-- this column, but 001/002 never created it, so a DB built from migrations alone
-- rejects every generate INSERT. Nullable; callers coalesce to "".
-- IF NOT EXISTS keeps this safe if the column was already added out-of-band.
alter table what_ifs add column if not exists recipient_contact text;
