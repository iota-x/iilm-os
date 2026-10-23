import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calendarOf,
  cohortById,
  cohortLabel,
  DEFAULT_COHORT_ID,
  EMPTY_CALENDAR,
  emailProblem,
  nameFromEmail,
  tenantOf,
  UNIVERSITIES,
  universityForEmail,
} from "@/lib/universities";
import { catalogOf, contentOf, timetableOf } from "@/data/catalogs";
import { examCountdown, inScope, nextPaper } from "@/lib/utils";

const iilm = UNIVERSITIES.find((u) => u.id === "iilm-gurugram")!;

describe("which university an address belongs to", () => {
  it("finds a university by its domain, case-insensitively", () => {
    expect(universityForEmail("Priya.Sharma.26@GG.iilm.edu")?.id).toBe("iilm-gurugram");
  });
  it("knows nothing about other colleges", () => {
    expect(universityForEmail("someone@dtu.ac.in")).toBeNull();
    expect(universityForEmail("not-an-email")).toBeNull();
  });
  it("applies the university's own address rule", () => {
    expect(emailProblem("priya.sharma.26@gg.iilm.edu", iilm)).toBeNull();
    expect(emailProblem("priya@gg.iilm.edu", iilm)).toMatch(/first\.last\.26/);
  });
});

describe("names from addresses", () => {
  it("handles dots, underscores and batch numbers", () => {
    expect(nameFromEmail("priya.sharma.26@gg.iilm.edu")).toBe("Priya Sharma");
    expect(nameFromEmail("rahul_verma2027@college.edu")).toBe("Rahul Verma");
  });
});

describe("tenants", () => {
  it("puts accounts from before universities in the original class", () => {
    const t = tenantOf(null);
    expect(t.cohort.id).toBe(DEFAULT_COHORT_ID);
    expect(t.university.id).toBe("iilm-gurugram");
    expect(t.label).toBe("B.Tech CSE · Semester I · Section E");
  });
  it("resolves a stored class, and a university with an unknown class to its first", () => {
    expect(tenantOf({ cohort_id: "iilm-gurugram/btech-cse-2026/s1/b" }).cohort.section).toBe("B");
    expect(tenantOf({ university_id: "iilm-gurugram", cohort_id: "gone" }).cohort.universityId).toBe("iilm-gurugram");
  });
  it("every class points at packs that exist", () => {
    for (const u of UNIVERSITIES) {
      for (const c of u.cohorts) {
        if (c.catalog) expect(catalogOf(c.catalog), c.id).not.toBeNull();
        if (c.timetable) expect(timetableOf(c.timetable).length, c.id).toBeGreaterThan(0);
        expect(c.universityId).toBe(u.id);
      }
    }
  });
  it("only Section E has a timetable so far, every IILM B.Tech section has the syllabus", () => {
    expect(cohortById(DEFAULT_COHORT_ID)?.timetable).toBeTruthy();
    expect(cohortById("iilm-gurugram/btech-cse-2026/s1/a")?.timetable).toBeNull();
    expect(cohortById("iilm-gurugram/btech-cse-2026/s1/a")?.catalog).toBe("iilm-btech-cse-s1");
    expect(cohortLabel(cohortById("iilm-gurugram/other")!)).toBe("Another programme");
  });
  it("gives a class without a syllabus no notes, explainers or sprints", () => {
    const empty = contentOf(null);
    expect(empty.sprints).toEqual([]);
    expect(empty.coverageOf("deco-u1-kmap")).toBeNull();
  });
});

describe("the calendar decides the next paper", () => {
  afterEach(() => vi.useRealTimers());
  const cal = calendarOf(cohortById(DEFAULT_COHORT_ID), iilm);

  it("is the mid-sem before the window closes, the end-sem after", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T10:00:00+05:30"));
    expect(nextPaper(cal)).toBe("midsem");
    expect(inScope({ in_midsem: false }, cal)).toBe(false);
    vi.setSystemTime(new Date("2026-10-24T10:00:00+05:30"));
    expect(nextPaper(cal)).toBe("endsem");
    expect(inScope({ in_midsem: false }, cal)).toBe(true);
    expect(examCountdown(cal).headline).toMatch(/^End-sems in \d+ days\.$/);
  });
  it("says so when a university has no dates yet", () => {
    expect(nextPaper(EMPTY_CALENDAR)).toBe("endsem");
    expect(examCountdown(EMPTY_CALENDAR)).toMatchObject({ phase: "unknown", chip: null });
  });
});
