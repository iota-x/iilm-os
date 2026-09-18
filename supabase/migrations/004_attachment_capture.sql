-- When a photo was taken, and which class it came from.
--
-- The upload reads the capture time out of the photo (EXIF) and matches it
-- against the timetable, so a board photo tags itself with its subject and
-- lecture instead of asking you to pick. slot_id is set null rather than
-- cascaded if a slot is ever removed — the photo is still worth keeping.

alter table attachments
  add column if not exists taken_at timestamptz,
  add column if not exists slot_id  uuid references timetable_slots(id) on delete set null;

create index if not exists attachments_taken_at_idx on attachments(taken_at desc);
