# inbox

Drop anything from class in here and tell Claude to look at it.

- **Photos of the board / your handwriting** — just drag them in. Claude reads
  images directly, so a photo of the whiteboard is enough.
- **PDFs** — lecture slides, tutorial sheets, question papers when you get them.
- **`notes/`** — filled by `npm run pull`, which exports your in-app notes here
  as markdown with their pasted screenshots alongside.

Nothing in this folder is committed (see .gitignore) and nothing here is read
by the app — it exists purely so Claude has something readable on disk.

Useful things to ask for once there's something in here:

- "Turn today's lecture into checkpoints on the right topic."
- "Make questions out of these tutorial problems."
- "The teacher said X is out of scope — fix the mid-sem scope."
- "Write up these board photos as a proper note and file it under the topic."
