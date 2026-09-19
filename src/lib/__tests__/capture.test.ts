import { describe, expect, it } from "vitest";
import { exifDate, filenameDate, matchSession } from "@/lib/capture";

/** A JPEG with only an APP1/EXIF segment carrying DateTimeOriginal. */
function jpegWithDate(dt: string): Uint8Array {
  const enc = new TextEncoder();
  const ascii = enc.encode(dt + "\0"); // 20 bytes for "YYYY:MM:DD HH:MM:SS\0"
  // TIFF header (8) + IFD0: count(2) + 1 entry(12) + next(4) = 18 → Exif IFD at 26
  // Exif IFD: count(2) + 1 entry(12) + next(4) = 18 → data at 44
  const tiff = new Uint8Array(44 + ascii.length);
  const dv = new DataView(tiff.buffer);
  tiff.set([0x4d, 0x4d, 0x00, 0x2a], 0); // big-endian
  dv.setUint32(4, 8);
  dv.setUint16(8, 1);
  dv.setUint16(10, 0x8769); // ExifIFDPointer
  dv.setUint16(12, 4);
  dv.setUint32(14, 1);
  dv.setUint32(18, 26);
  dv.setUint32(22, 0);
  dv.setUint16(26, 1);
  dv.setUint16(28, 0x9003); // DateTimeOriginal
  dv.setUint16(30, 2); // ASCII
  dv.setUint32(32, ascii.length);
  dv.setUint32(36, 44);
  dv.setUint32(40, 0);
  tiff.set(ascii, 44);
  const app1 = new Uint8Array(2 + 2 + 6 + tiff.length);
  app1.set([0xff, 0xe1]);
  new DataView(app1.buffer).setUint16(2, app1.length - 2);
  app1.set(enc.encode("Exif\0\0"), 4);
  app1.set(tiff, 10);
  return new Uint8Array([0xff, 0xd8, ...app1, 0xff, 0xd9]);
}

describe("exifDate", () => {
  it("reads DateTimeOriginal as local time", () => {
    const d = exifDate(jpegWithDate("2026:09:17 11:40:05"));
    expect(d).not.toBeNull();
    expect([d!.getFullYear(), d!.getMonth(), d!.getDate(), d!.getHours(), d!.getMinutes()]).toEqual([2026, 8, 17, 11, 40]);
  });
  it("returns null for non-JPEGs and JPEGs without EXIF", () => {
    expect(exifDate(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    expect(exifDate(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]))).toBeNull();
  });
});

describe("filenameDate", () => {
  it("understands Android and Mac screenshot names", () => {
    const a = filenameDate("IMG_20260917_114005.jpg")!;
    expect([a.getDate(), a.getHours(), a.getMinutes()]).toEqual([17, 11, 40]);
    const b = filenameDate("Screenshot 2026-09-17 at 2.05.30 PM.png")!;
    expect([b.getDate(), b.getHours(), b.getMinutes()]).toEqual([17, 14, 5]);
    const c = filenameDate("2026-09-17.jpg")!;
    expect(c.getHours()).toBe(12); // noon when the name has no time
  });
  it("gives up on names without a date", () => {
    expect(filenameDate("board.jpg")).toBeNull();
  });
});

const slots = [
  { id: "cdt", day: "Wed", start_time: "10:10", end_time: "11:10", kind: "lecture", lab_group: null },
  { id: "deco", day: "Wed", start_time: "11:10", end_time: "12:10", kind: "lecture", lab_group: null },
  { id: "clab-g1", day: "Wed", start_time: "14:00", end_time: "16:00", kind: "lab", lab_group: 1 },
  { id: "clab-g2", day: "Wed", start_time: "14:00", end_time: "16:00", kind: "lab", lab_group: 2 },
];
const wed = (h: number, m: number) => new Date(2026, 8, 16, h, m); // 16 Sept 2026 is a Wednesday

describe("matchSession", () => {
  it("picks the running class over the one that just ended", () => {
    expect(matchSession(wed(11, 40), slots, 2).slot?.id).toBe("deco");
  });
  it("gives the gap after a class to that class, within 40 minutes", () => {
    expect(matchSession(wed(12, 30), slots, 2).slot?.id).toBe("deco");
    expect(matchSession(wed(13, 0), slots, 2).slot).toBeNull();
  });
  it("lets a photo ten minutes early belong to the next class", () => {
    expect(matchSession(wed(10, 2), slots, 2).slot?.id).toBe("cdt");
    expect(matchSession(wed(9, 50), slots, 2).slot).toBeNull();
  });
  it("only sees your own lab group", () => {
    expect(matchSession(wed(15, 0), slots, 1).slot?.id).toBe("clab-g1");
    expect(matchSession(wed(15, 0), slots, 2).slot?.id).toBe("clab-g2");
  });
  it("finds nothing on a day with no classes", () => {
    expect(matchSession(new Date(2026, 8, 20, 11, 30), slots, 2).slot).toBeNull(); // Sunday
  });
});
