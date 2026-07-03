-- Recipient contact: the raw contact hint (email or URL) the model returns for
-- each what-if. App code inserts and selects this column (app/api/generate/route.ts,
-- app/api/discover-email/route.ts), but 001/002 never created it, so generation
-- fails with "column what_ifs.recipient_contact does not exist" on a DB built
-- purely from migrations. Nullable with no default; code coalesces to "".
-- IF NOT EXISTS keeps this safe to apply on a DB where the column was added
-- out-of-band.
alter table what_ifs add column if not exists recipient_contact text;
