-- Each student brings their own Gemini key, so /ask isn't sixty people on
-- one free-tier limit. Readable only by its owner (profiles is own-row RLS;
-- the member_names view exposes id and display_name and nothing else).

alter table profiles
  add column if not exists gemini_key text;
