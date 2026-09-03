-- Recipient contact: the source contact (email or URL) the app inserts and selects for each what-if
alter table what_ifs add column if not exists recipient_contact text;
