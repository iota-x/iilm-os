import { describe, expect, it } from "vitest";
import { isWhatsAppExport, sameDeadline, trimWhatsApp } from "@/lib/deadlines";

const ANDROID = `12/08/26, 9:01 am - Messages and calls are end-to-end encrypted.
12/08/26, 9:05 am - Riya: welcome everyone
20/10/26, 6:14 pm - CR Aman: DE assignment 3 submit by Friday
20/10/26, 6:15 pm - CR Aman: <Media omitted>
21/10/26, 10:02 am - Neha: ok
and a second line of Neha's message`;

const IPHONE = `[20/10/26, 6:14:03 PM] CR Aman: DE assignment 3 submit by Friday
[21/10/26, 10:02:11 AM] Neha: ok
[22/10/26, 8:00:00 AM] Sir: quiz on 4/11`;

describe("WhatsApp exports", () => {
  it("recognises Android and iPhone exports, not a pasted message", () => {
    expect(isWhatsAppExport(ANDROID)).toBe(true);
    expect(isWhatsAppExport(IPHONE)).toBe(true);
    expect(isWhatsAppExport("DE assignment 3 submit by Friday")).toBe(false);
  });

  it("keeps recent messages with their continuation lines, drops old ones and media placeholders", () => {
    const t = trimWhatsApp(ANDROID, "2026-10-25");
    expect(t).not.toContain("welcome everyone");
    expect(t).not.toContain("end-to-end");
    expect(t).not.toContain("Media omitted");
    expect(t).toContain("DE assignment 3 submit by Friday");
    expect(t).toContain("a second line of Neha's message");
  });

  it("keeps the newest text when it's too long", () => {
    const t = trimWhatsApp(IPHONE, "2026-10-25", 45, 40);
    expect(t.length).toBe(40);
    expect(t.endsWith("quiz on 4/11")).toBe(true);
  });
});

describe("sameDeadline", () => {
  it("matches the same thing caught twice", () => {
    expect(sameDeadline({ title: "Submit DE assignment 3", due_date: "2026-10-30" }, { title: "DE assignment 3", due_date: "2026-10-30" })).toBe(true);
  });
  it("needs the same day", () => {
    expect(sameDeadline({ title: "DE assignment 3", due_date: "2026-10-30" }, { title: "DE assignment 3", due_date: "2026-10-31" })).toBe(false);
  });
  it("tells different deadlines on one day apart", () => {
    expect(sameDeadline({ title: "C quiz on pointers", due_date: "2026-11-04" }, { title: "Linux lab file", due_date: "2026-11-04" })).toBe(false);
  });
});
