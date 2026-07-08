-- Add the recipient_contact column the app reads and writes.
-- app/api/generate/route.ts INSERTs recipient_contact and
-- app/api/discover-email/route.ts SELECTs it, but neither 001 nor 002
-- defined the column, so a DB provisioned purely from migrations rejects
-- every generation INSERT with "column what_ifs.recipient_contact does not exist".
-- `if not exists` keeps this safe on any live DB where the column was added out-of-band.
alter table what_ifs add column if not exists recipient_contact text;
