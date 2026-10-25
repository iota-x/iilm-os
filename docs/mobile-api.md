# Semwise from a mobile app (React Native / Expo)

The web app's rules live in Postgres — row-level security, triggers and a few
functions — so a mobile app talks to Supabase directly with `supabase-js` and
gets exactly the same behaviour. Only a handful of things need the Next.js
server; those are HTTP routes that accept a bearer token.

## Signing in

```ts
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
await supabase.auth.signInWithPassword({ email, password });
```

New students sign up through `POST /api/signup` (it seeds the curriculum);
teachers ask for access with `POST /api/teacher-signup`
`{ name, email, password, department }` and wait for the admin.

## Calling the server routes

Send the session's access token; no cookies needed:

```ts
const { data: { session } } = await supabase.auth.getSession();
fetch(`${SITE}/api/search-pages?q=karnaugh`, { headers: { Authorization: `Bearer ${session.access_token}` } });
```

| route | what |
| --- | --- |
| `GET /api/search-pages?q=` | words inside the class notes → `{ hits: [{ label, snippet, href, subject }] }` |
| `GET /api/events/:id/ics` | an event as a calendar file (or use expo-calendar with the row itself) |
| `GET /api/classroom/connect?app=1&json=1` | `{ url }` — open it in a browser; Google sends the student back to `semwise://classroom?status=connected` |
| `POST /api/classroom/sync` | pull Classroom coursework into to-dos now → `{ courses, added, updated }` |

`/api/search-index` and `/api/ask` still read the web session only.

## The board and friends — straight from supabase-js

Everything below is already scoped by RLS to the student's own class (board)
or university (events) or syllabus (past papers).

```ts
// board, newest first, with counts
supabase.from("posts").select("*, replies!post_id(count), post_votes(count)").order("created_at", { ascending: false });
supabase.from("post_votes").insert({ post_id, user_id });          // Helpful
supabase.rpc("create_anonymous_post", { p_title, p_body, p_subject }); // anonymous question → post id
supabase.from("post_reads").insert({ post_id, user_id });           // opened a notice
supabase.rpc("notice_reach", { p_id });  // [{ seen, total, can_see_names, unseen }]
supabase.rpc("class_points", { since });  // brownie points; since = null for all time

// names: member_names (id, display_name, is_faculty) — never profiles
// anonymous posts have user_id null; post_owners tells the author it's theirs

// past papers (files live in the public `board` bucket under <uid>/papers/)
supabase.from("papers").select("*, paper_votes(count)");
supabase.from("paper_votes").insert({ paper_id, user_id });

// events
supabase.from("events").select("*, event_rsvps(count)").gte("starts_at", since).order("starts_at");
supabase.from("event_rsvps").insert({ event_id, user_id });          // I'm going

// teachers
supabase.rpc("teacher_post", { p_title, p_body, p_kind, p_cohorts }); // → how many classes
supabase.rpc("set_post_verified", { p_id, p_on });
supabase.rpc("set_paper_verified", { p_id, p_on });
```

What the database refuses, whatever the client sends: setting `is_admin`,
`is_faculty`, `faculty_status`, `university_id` or `cohort_id` on your own
profile; pinning unless admin; verifying unless teacher or admin; changing a
post's author or making it anonymous after the fact.

## Not web-only by accident

- Shortcuts: everything that says ⌘ also takes Ctrl (Windows, Linux).
- Times: events are stored as instants and shown in India time.
- Reminders: the web shows "You're going" on Today from 6 pm the evening
  before; a native app should schedule a local notification for the same
  moment (expo-notifications) when the student taps I'm going.
