/**
 * Ranking for the command palette. Pure so it can be tested on its own.
 */

/** Punctuation and case don't carry meaning in a search box: "k-map",
 *  "kmap" and "K-Maps" are the same request, and "don't" should hit "dont". */
export function fold(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]+/g, "");
}

/** Score one query word against a text: prefix > substring > subsequence. */
export function scoreWord(q: string, t: string): number {
  if (!q) return 0;
  const exact = t.indexOf(q);
  if (exact === 0) return 1000;
  if (exact > 0) return t[exact - 1] === " " ? 900 - exact : 800 - exact;

  // subsequence, e.g. "diffeq" -> "differential equations"
  let qi = 0;
  let last = -1;
  let gaps = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (last >= 0) gaps += i - last - 1;
      last = i;
      qi++;
    }
  }
  if (qi < q.length) return -1;
  return 400 - Math.min(gaps, 200);
}

/** Every word in the query has to land somewhere in the text; the result is
 *  the weakest of those hits, so "prime implicant" needs both words. */
export function score(query: string, text: string): number {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const t = fold(text);
  let worst = Infinity;
  for (const w of words) {
    const sc = scoreWord(w, t);
    if (sc < 0) return -1;
    worst = Math.min(worst, sc);
  }
  return worst;
}
