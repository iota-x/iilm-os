import type { Attempt, Question } from "@/lib/db-types";

export interface QuestionStats {
  tries: number;
  correct: number;
  partial: number;
  wrong: number;
  /** most recent attempt first */
  history: Attempt["outcome"][];
  lastOutcome: Attempt["outcome"] | null;
  /** consecutive correct answers, most recent first */
  streak: number;
  /** never attempted */
  fresh: boolean;
  /** two clean answers in a row — stop drilling it */
  settled: boolean;
  /** got it wrong more often than right, or last go was wrong */
  shaky: boolean;
}

export function statsFor(question: Question, attempts: Attempt[]): QuestionStats {
  const mine = attempts
    .filter((a) => a.question_id === question.id)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  const history = mine.map((a) => a.outcome);
  const correct = history.filter((o) => o === "correct").length;
  const partial = history.filter((o) => o === "partial").length;
  const wrong = history.filter((o) => o === "wrong").length;

  let streak = 0;
  for (const o of history) {
    if (o === "correct") streak++;
    else break;
  }

  const lastOutcome = history[0] ?? null;

  return {
    tries: history.length,
    correct,
    partial,
    wrong,
    history,
    lastOutcome,
    streak,
    fresh: history.length === 0,
    settled: streak >= 2,
    shaky: lastOutcome === "wrong" || wrong > correct,
  };
}

/**
 * Drill order. Highest first: things you got wrong last time, then things
 * you've failed repeatedly, then ones you've never tried. Anything answered
 * correctly twice running drops to the bottom — it isn't what's going to
 * cost you marks.
 */
export function drillScore(s: QuestionStats, weight = 3): number {
  if (s.settled) return -1;

  let score = 0;
  if (s.lastOutcome === "wrong") score += 100;
  else if (s.lastOutcome === "partial") score += 60;
  score += s.wrong * 20;
  score += s.partial * 8;
  if (s.fresh) score += 40;
  score += weight * 2; // exam weight of the parent topic breaks ties
  return score;
}

export function accuracyOf(questions: Question[], attempts: Attempt[]) {
  const all = questions.flatMap((q) => statsFor(q, attempts).history);
  if (!all.length) return null;
  const right = all.filter((o) => o === "correct").length;
  return Math.round((right / all.length) * 100);
}

export const OUTCOME_LABEL: Record<Attempt["outcome"], string> = {
  correct: "Got it",
  partial: "Half right",
  wrong: "Got it wrong",
};
