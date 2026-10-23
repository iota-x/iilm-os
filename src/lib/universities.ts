/**
 * Every university Semwise runs at, and the classes (cohorts) inside each.
 *
 * This file is the one place a new university is added: its email domains
 * (who may sign up), its academic calendar, and its cohorts — a programme,
 * semester and section, each pointing at the syllabus pack (src/data/catalogs)
 * and timetable it seeds new accounts with. A cohort with no pack is still a
 * valid place to sign up: the account starts empty and says so.
 *
 * Kept free of the heavy syllabus data so the sign-up page can import it.
 * The database mirrors the ids (migration 012) so profiles, the class board
 * and its policies can refer to them; `npm run tenants` syncs the rows.
 */

export interface Holiday {
  name: string;
  /** inclusive, YYYY-MM-DD */
  from: string;
  to: string;
}

export interface AcademicCalendar {
  /** first and last day of the mid-sem window (YYYY-MM-DD); null when not known */
  midsemStart: string | null;
  midsemEnd: string | null;
  /** first end-sem paper; null until announced */
  endsemStart: string | null;
  /** shown under the countdown while the mid-sem dates are an estimate */
  midsemNote?: string;
  holidays: Holiday[];
}

export interface Cohort {
  /** "<university>/<programme-batch>/s<semester>/<section>", lower case */
  id: string;
  universityId: string;
  programme: string;
  semester: number;
  section: string | null;
  batch: string | null;
  /** lab groups the timetable splits into; [] when it doesn't */
  labGroups: number[];
  /** syllabus pack in src/data/catalogs, or null while it isn't loaded */
  catalog: string | null;
  /** timetable pack in src/data/catalogs, or null */
  timetable: string | null;
  /** dates that differ from the university's */
  calendar?: Partial<AcademicCalendar>;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  /** sign-up is open to these email domains (lower case, no "@") */
  domains: string[];
  /** shown as the email placeholder */
  emailExample: string;
  /** optional check on the part before the "@", with a hint when it fails */
  localPattern?: RegExp;
  localHint?: string;
  calendar: AcademicCalendar;
  /** grading pack in src/data/catalogs (grades, SGPA rules), or null */
  grading: string | null;
  cohorts: Cohort[];
}

// ─── IILM University, Gurugram ────────────────────────────────────────
// Semester I B.Tech CSE runs the same courses in every section, so every
// section gets the syllabus; only Section E's timetable is in so far.
const IILM_SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const iilmGurugram: University = {
  id: "iilm-gurugram",
  name: "IILM University, Gurugram",
  shortName: "IILM University",
  city: "Gurugram",
  domains: ["gg.iilm.edu"],
  emailExample: "first.last.26@gg.iilm.edu",
  // first.last.26, or first.2026.26 for students with one name
  localPattern: /^[a-z]+(?:\.[a-z]+)*(?:\.\d+)*\.\d{2}$/,
  localHint: "Use your college address — it looks like first.last.26@gg.iilm.edu.",
  calendar: {
    midsemStart: "2026-10-05",
    midsemEnd: "2026-10-11",
    endsemStart: "2026-12-04",
    midsemNote: "5–11 Oct expected — dates not announced yet",
    // Student holiday calendar, odd semester 2026 (signed by the Registrar)
    holidays: [
      { name: "Independence Day", from: "2026-08-15", to: "2026-08-15" },
      { name: "Raksha Bandhan", from: "2026-08-28", to: "2026-08-28" },
      { name: "Janmashtami", from: "2026-09-04", to: "2026-09-04" },
      { name: "Ganesh Chaturthi", from: "2026-09-14", to: "2026-09-14" },
      { name: "Gandhi Jayanti", from: "2026-10-02", to: "2026-10-02" },
      { name: "Dussehra", from: "2026-10-20", to: "2026-10-20" },
      { name: "Diwali break", from: "2026-11-07", to: "2026-11-11" },
      { name: "Guru Nanak Jayanti", from: "2026-11-24", to: "2026-11-24" },
      { name: "Christmas & winter break", from: "2026-12-25", to: "2027-01-04" },
    ],
  },
  grading: "iilm",
  cohorts: [
    ...IILM_SECTIONS.map(
      (s): Cohort => ({
        id: `iilm-gurugram/btech-cse-2026/s1/${s.toLowerCase()}`,
        universityId: "iilm-gurugram",
        programme: "B.Tech CSE",
        semester: 1,
        section: s,
        batch: "2026-30",
        labGroups: [1, 2],
        catalog: "iilm-btech-cse-s1",
        timetable: s === "E" ? "iilm-btech-cse-s1-e" : null,
      }),
    ),
    {
      id: "iilm-gurugram/other",
      universityId: "iilm-gurugram",
      programme: "Another programme",
      semester: 1,
      section: null,
      batch: null,
      labGroups: [],
      catalog: null,
      timetable: null,
    },
  ],
};

export const UNIVERSITIES: University[] = [iilmGurugram];

/** Accounts made before universities existed belong here. */
export const DEFAULT_UNIVERSITY_ID = "iilm-gurugram";
export const DEFAULT_COHORT_ID = "iilm-gurugram/btech-cse-2026/s1/e";

/** A calendar with nothing in it, for a university not set up yet. */
export const EMPTY_CALENDAR: AcademicCalendar = { midsemStart: null, midsemEnd: null, endsemStart: null, holidays: [] };

export function universityById(id: string | null | undefined): University | null {
  return UNIVERSITIES.find((u) => u.id === id) ?? null;
}

export function cohortById(id: string | null | undefined): Cohort | null {
  for (const u of UNIVERSITIES) {
    const c = u.cohorts.find((c) => c.id === id);
    if (c) return c;
  }
  return null;
}

export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

/** The university an email address belongs to, if Semwise runs there. */
export function universityForEmail(email: string): University | null {
  const domain = emailDomain(email);
  if (!domain) return null;
  return UNIVERSITIES.find((u) => u.domains.includes(domain)) ?? null;
}

/** Why this address can't sign up at its university, or null when it can. */
export function emailProblem(email: string, u: University): string | null {
  const local = email.trim().toLowerCase().split("@")[0] ?? "";
  if (!local) return `Use your college address, like ${u.emailExample}.`;
  if (u.localPattern && !u.localPattern.test(local)) return u.localHint ?? `Use your college address, like ${u.emailExample}.`;
  return null;
}

/** The cohort's calendar: the university's, with the cohort's own dates over it. */
export function calendarOf(cohort: Cohort | null, university: University | null): AcademicCalendar {
  const base = university?.calendar ?? EMPTY_CALENDAR;
  return { ...base, ...(cohort?.calendar ?? {}) };
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** "B.Tech CSE · Semester I · Section E" */
export function cohortLabel(c: Cohort): string {
  const parts = [c.programme];
  if (c.catalog || c.section) parts.push(`Semester ${ROMAN[c.semester] ?? c.semester}`);
  if (c.section) parts.push(`Section ${c.section}`);
  return parts.join(" · ");
}

/** "priya.sharma.26@gg.iilm.edu" → "Priya Sharma"; works for any first.last / first_last style */
export function nameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter((p) => p && !/^\d+$/.test(p))
    .map((p) => p.replace(/\d+$/, ""))
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

/** What the sign-up page needs, and nothing it shouldn't show. */
export function publicDirectory() {
  return UNIVERSITIES.map((u) => ({
    id: u.id,
    name: u.name,
    shortName: u.shortName,
    domains: u.domains,
    emailExample: u.emailExample,
    cohorts: u.cohorts.map((c) => ({
      id: c.id,
      label: cohortLabel(c),
      labGroups: c.labGroups,
      ready: Boolean(c.catalog),
      timetable: Boolean(c.timetable),
    })),
  }));
}

/** Where one account sits: its university, its class, and that class's calendar. */
export interface Tenant {
  university: University;
  cohort: Cohort;
  calendar: AcademicCalendar;
  /** "B.Tech CSE · Semester I · Section E" */
  label: string;
}

/**
 * Resolve a profile's university and cohort. Accounts from before migration
 * 012 (or a cohort since removed from this file) fall back to the default,
 * which is where every one of those accounts was made.
 */
export function tenantOf(p: { university_id?: string | null; cohort_id?: string | null } | null): Tenant {
  const cohort =
    cohortById(p?.cohort_id) ??
    universityById(p?.university_id)?.cohorts[0] ??
    cohortById(DEFAULT_COHORT_ID)!;
  const university = universityById(cohort.universityId)!;
  return { university, cohort, calendar: calendarOf(cohort, university), label: cohortLabel(cohort) };
}

/** The serialisable slice of a tenant that client components get (see components/tenant.tsx). */
export interface TenantInfo {
  universityId: string;
  universityName: string;
  universityShort: string;
  cohortId: string;
  cohortLabel: string;
  catalog: string | null;
  labGroups: number[];
  calendar: AcademicCalendar;
}

export function tenantInfo(t: Tenant): TenantInfo {
  return {
    universityId: t.university.id,
    universityName: t.university.name,
    universityShort: t.university.shortName,
    cohortId: t.cohort.id,
    cohortLabel: t.label,
    catalog: t.cohort.catalog,
    labGroups: t.cohort.labGroups,
    calendar: t.calendar,
  };
}
