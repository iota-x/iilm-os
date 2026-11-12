/**
 * Replan: take the end-sem prep blocks that are not done and lay them out
 * again from today to the papers. Pure — no database, no clock — so it is
 * easy to test and the preview can run it in the browser.
 *
 * Rules (they follow the script that first built the plan):
 *  - daily budget by weekday, in minutes; holidays and paper days get none
 *  - every subject finishes the day before its own paper
 *  - blocks keep their order within a subject (calculus route order included)
 *  - revision / mock blocks already sitting in the last days stay where they are
 *    (so do ticked or partly-done blocks); the rest is spread around them
 *  - if it does not fit: days may run up to 25% over budget, and if that still
 *    does not fit the last drill blocks are trimmed and listed. Nothing is
 *    dropped silently.
 */

/** Mon..Sun, in minutes */
export const WEEKDAY_BUDGET = [150, 120, 120, 120, 120, 330, 270] as const;
export const PLAN_TAG = "[end-sem plan]";
/** how far a day may run over budget before blocks are trimmed instead */
export const STRETCH = 1.25;
const DEFAULT_MINUTES = 30;

export interface ReplanTask {
  id: string;
  subject_id: string | null;
  title: string;
  kind: string;
  minutes: number | null;
  due_date: string | null;
  sort_order: number;
  /** todo and no study session logged: the only blocks that may move */
  movable: boolean;
  /** ticked: counts toward its day's load while it is today or later */
  done?: boolean;
}

export interface ReplanInput {
  today: string;
  tasks: ReplanTask[];
  /** subject id -> first day of its paper */
  papers: Record<string, string>;
  holidays: { from: string; to: string }[];
  /** plan_days.phase by date, to tell the revision stretch from the first pass */
  phaseByDate: Record<string, string | null>;
  /** use holidays as study days (default false: they are skipped) */
  useHolidays?: boolean;
  /** keep every block: let days run as long as it takes (up to 3x budget) instead of trimming */
  keepAll?: boolean;
}

export interface DayLoad {
  date: string;
  minutes: number;
  budget: number;
  /** blocks on the day that were not moved by the replan (done, partly done, pinned revision) */
  keptMinutes: number;
  over: boolean;
  isExam: boolean;
  isHoliday: boolean;
  subjects: string[];
}

export interface Move {
  id: string;
  from: string | null;
  to: string;
  sort_order: number;
}

export interface ReplanResult {
  moves: Move[];
  /** movable blocks that stay on the day they are already on */
  stayed: number;
  days: DayLoad[];
  /** blocks left out because they do not fit, drills first */
  leftOut: ReplanTask[];
  movableCount: number;
  movableMinutes: number;
  /** minutes over budget at normal budgets (0 = fits) */
  overMinutes: number;
  /** how the fit was reached */
  mode: "fits" | "stretched" | "trimmed";
  endsOn: string | null;
  /** how far over budget the busiest days may run (1 = none, 1.25 = a quarter over) */
  factor: number;
}

const addDays = (iso: string, n: number) => new Date(Date.parse(iso + "T12:00:00Z") + n * 86_400_000).toISOString().slice(0, 10);
const weekday = (iso: string) => (new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7; // Mon = 0
const mins = (t: ReplanTask) => t.minutes ?? DEFAULT_MINUTES;
const inHoliday = (d: string, hs: { from: string; to: string }[]) => hs.some((h) => h.from <= d && d <= h.to);
const orderOf = (a: ReplanTask, b: ReplanTask) =>
  (a.due_date ?? "").localeCompare(b.due_date ?? "") || a.sort_order - b.sort_order || a.title.localeCompare(b.title);

interface Attempt {
  placed: Map<string, { date: string; order: number }>;
  unplaced: ReplanTask[];
  load: Map<string, number>;
}

export function replan(input: ReplanInput): ReplanResult {
  const { today, papers, holidays, phaseByDate, useHolidays } = input;
  const paperDays = new Set(Object.values(papers));
  const lastPaper = Object.values(papers).sort().pop() ?? null;

  // blocks that stay put: not movable, or revision/mock/paper blocks already in the run-up
  const isTail = (t: ReplanTask) =>
    t.kind === "mock" ||
    t.kind === "admin" ||
    ["es-revise", "es-exams"].includes(phaseByDate[t.due_date ?? ""] ?? "");
  const es = input.tasks.filter((t) => t.subject_id && papers[t.subject_id]);
  const kept = es.filter((t) => (!t.movable || isTail(t)) && t.due_date && t.due_date >= today);
  const body = es.filter((t) => t.movable && !(isTail(t) && t.due_date && t.due_date >= today)).sort(orderOf);
  const keptIds = new Set(kept.map((t) => t.id));

  const keptLoad = new Map<string, number>();
  for (const t of kept) keptLoad.set(t.due_date!, (keptLoad.get(t.due_date!) ?? 0) + mins(t));

  const empty = (): ReplanResult => ({
    moves: [], stayed: 0, days: [], leftOut: [], movableCount: 0, movableMinutes: 0, overMinutes: 0, mode: "fits", endsOn: null, factor: 1,
  });
  if (!lastPaper || !body.length) return { ...empty(), days: buildDays([], keptLoad, today, lastPaper, input, paperDays, new Map(), es, keptIds) };

  const hardOf = (s: string) => addDays(papers[s], -1);
  // revision starts at the first kept revision/mock block: new material should end before it
  const firstTail = kept.filter(isTail).map((t) => t.due_date!).sort()[0];
  const softCut = firstTail ? addDays(firstTail, -1) : null;

  const attempt = (tasks: ReplanTask[], soft: boolean, factor: number): Attempt => {
    const queues = new Map<string, ReplanTask[]>();
    for (const t of tasks) queues.set(t.subject_id!, [...(queues.get(t.subject_id!) ?? []), t]);
    const deadline = (s: string) => {
      const h = hardOf(s);
      return soft && softCut && softCut >= today && softCut < h ? softCut : h;
    };
    const dates: string[] = [];
    for (let d = today; d <= addDays(lastPaper, -1); d = addDays(d, 1)) dates.push(d);
    const capOf = (d: string) =>
      paperDays.has(d) || (!useHolidays && inHoliday(d, holidays))
        ? 0
        : Math.max(0, Math.floor(WEEKDAY_BUDGET[weekday(d)] * factor) - (keptLoad.get(d) ?? 0));
    const remaining = new Map<string, number>();
    for (const [s, q] of queues) remaining.set(s, q.reduce((a, t) => a + mins(t), 0));

    const placed = new Map<string, { date: string; order: number }>();
    const load = new Map<string, number>();
    dates.forEach((d, i) => {
      const cap = capOf(d);
      if (!cap) return;
      let used = 0;
      let n = 0;
      for (;;) {
        const cands = [...queues.entries()]
          .filter(([s, q]) => q.length && deadline(s) >= d)
          .map(([s, q]) => {
            let capLeft = cap - used;
            for (let j = i + 1; j < dates.length && dates[j] <= deadline(s); j++) capLeft += capOf(dates[j]);
            return { s, t: q[0], urgency: remaining.get(s)! / Math.max(capLeft, 1), dl: deadline(s) };
          })
          .sort((a, b) => b.urgency - a.urgency || a.dl.localeCompare(b.dl));
        const pick = cands.find(({ t }) => used + mins(t) <= cap + 15 || (n === 0 && mins(t) <= cap * 1.35));
        if (!pick) break;
        queues.get(pick.s)!.shift();
        remaining.set(pick.s, remaining.get(pick.s)! - mins(pick.t));
        placed.set(pick.t.id, { date: d, order: n++ });
        used += mins(pick.t);
      }
      load.set(d, used);
    });
    return { placed, unplaced: [...queues.values()].flat(), load };
  };

  let mode: ReplanResult["mode"] = "fits";
  let leftOut: ReplanTask[] = [];
  let work = body;
  let factor = 1;
  let a = attempt(work, true, 1);
  if (a.unplaced.length) a = attempt(work, false, 1);
  const overMinutes = a.unplaced.reduce((s, t) => s + mins(t), 0);
  if (a.unplaced.length) {
    mode = "stretched";
    factor = STRETCH;
    a = attempt(work, false, factor);
    if (input.keepAll) {
      while (a.unplaced.length && factor < 3) a = attempt(work, false, (factor += 0.25));
    }
    // still too much: trim the last drill blocks of the subjects that are short, one at a time
    while (a.unplaced.length && !input.keepAll) {
      const short = new Set(a.unplaced.map((t) => t.subject_id));
      const drill = [...work].reverse().find((t) => t.kind === "drill" && short.has(t.subject_id));
      if (!drill) break;
      work = work.filter((t) => t !== drill);
      leftOut.push(drill);
      mode = "trimmed";
      a = attempt(work, false, STRETCH);
    }
    if (a.unplaced.length) {
      mode = "trimmed";
      leftOut = [...leftOut, ...a.unplaced];
    }
  }
  const used = a;

  const moves: Move[] = [];
  let stayed = 0;
  // sort_order: after what is already on the day
  const maxOrder = new Map<string, number>();
  for (const t of input.tasks) if (t.due_date) maxOrder.set(t.due_date, Math.max(maxOrder.get(t.due_date) ?? -1, t.sort_order));
  for (const t of work) {
    const p = used.placed.get(t.id);
    if (!p) continue;
    const order = (maxOrder.get(p.date) ?? -1) + 1 + p.order;
    if (p.date === t.due_date) stayed++;
    moves.push({ id: t.id, from: t.due_date, to: p.date, sort_order: p.date === t.due_date ? t.sort_order : order });
  }
  const bySubject = new Map<string, ReplanTask>();
  for (const t of work) bySubject.set(t.id, t);
  const days = buildDays(moves, keptLoad, today, lastPaper, input, paperDays, bySubject, es, keptIds);
  const lastDay = moves.length ? moves.map((m) => m.to).sort().pop()! : null;
  return {
    moves,
    stayed,
    days,
    leftOut,
    movableCount: body.length,
    movableMinutes: body.reduce((s, t) => s + mins(t), 0),
    overMinutes,
    mode,
    endsOn: lastDay,
    factor,
  };
}

function buildDays(
  moves: Move[],
  keptLoad: Map<string, number>,
  today: string,
  lastPaper: string | null,
  input: ReplanInput,
  paperDays: Set<string>,
  movedTasks: Map<string, ReplanTask>,
  es: ReplanTask[],
  keptIds: Set<string>,
): DayLoad[] {
  if (!lastPaper) return [];
  const subjOf = new Map(es.map((t) => [t.id, t.subject_id]));
  const out: DayLoad[] = [];
  for (let d = today; d <= lastPaper; d = addDays(d, 1)) {
    const mv = moves.filter((m) => m.to === d);
    const m = mv.reduce((s, x) => s + mins(movedTasks.get(x.id)!), 0);
    const kept = keptLoad.get(d) ?? 0;
    const budget = WEEKDAY_BUDGET[weekday(d)];
    const subjects = [...new Set([...mv.map((x) => subjOf.get(x.id)), ...es.filter((t) => t.due_date === d && !movedTasks.has(t.id) && keptIds.has(t.id)).map((t) => t.subject_id)])].filter(
      (x): x is string => !!x,
    );
    out.push({
      date: d,
      minutes: m + kept,
      budget,
      keptMinutes: kept,
      over: m + kept > budget && !paperDays.has(d),
      isExam: paperDays.has(d),
      isHoliday: inHoliday(d, input.holidays),
      subjects,
    });
  }
  return out;
}

/** "Calculus + DE+CO" style headline for a plan day */
export function headlineOf(names: string[]): string {
  return names.length ? names.join(" + ") : "Rest";
}
