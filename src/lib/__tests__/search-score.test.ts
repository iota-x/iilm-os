import { describe, expect, it } from "vitest";
import { fold, score, scoreWord } from "@/lib/search-score";

describe("fold", () => {
  it("drops case and punctuation", () => {
    expect(fold("K-Maps (Karnaugh)")).toBe("kmaps karnaugh");
    expect(fold("Don't")).toBe("dont");
  });
});

describe("scoreWord", () => {
  it("prefers prefix, then word-start, then substring, then subsequence", () => {
    const prefix = scoreWord("diff", "differential equations");
    const wordStart = scoreWord("equ", "differential equations");
    const inside = scoreWord("fer", "differential equations");
    const subseq = scoreWord("diffeq", "differential equations");
    expect(prefix).toBeGreaterThan(wordStart);
    expect(wordStart).toBeGreaterThan(inside);
    expect(inside).toBeGreaterThan(subseq);
    expect(subseq).toBeGreaterThan(0);
  });
  it("rejects letters that don't appear in order", () => {
    expect(scoreWord("xyz", "differential")).toBe(-1);
  });
});

describe("score", () => {
  it("matches k-map against Karnaugh maps however it's typed", () => {
    expect(score("k-map", "Karnaugh maps (K-maps)")).toBeGreaterThan(0);
    expect(score("kmap", "K-Maps")).toBeGreaterThan(0);
  });
  it("needs every word to land", () => {
    expect(score("prime implicant", "Prime implicants and essential prime implicants")).toBeGreaterThan(0);
    expect(score("prime banana", "Prime implicants")).toBe(-1);
  });
  it("is the weakest word's score", () => {
    const both = score("prime implicant", "Prime implicants");
    expect(both).toBe(Math.min(scoreWord("prime", "prime implicants"), scoreWord("implicant", "prime implicants")));
  });
  it("scores an empty query as neutral", () => {
    expect(score("  ", "anything")).toBe(0);
  });
});
