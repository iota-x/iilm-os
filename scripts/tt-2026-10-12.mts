// One-off for the 12-10-2026 timetable: the Group 1 C lab moved Thu 14:00 → Mon 14:00.
// Move the existing slot instead of letting the seed delete it, so its class_marks survive.
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const { data, error } = await db.from("timetable_slots").update({ day: "Mon" })
  .eq("day", "Thu").eq("start_time", "14:00").eq("lab_group", 1).select("id");
if (error) throw error;
console.log("moved", data?.length ?? 0, "slot(s) Thu → Mon");
