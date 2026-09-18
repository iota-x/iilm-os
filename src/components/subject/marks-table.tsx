"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { setComponentMark } from "@/lib/actions";
import type { Component } from "@/lib/db-types";
import { cn } from "@/lib/utils";
import { Badge, Button, inputCls } from "@/components/ui";

export function MarksTable({ components }: { components: Component[] }) {
  const theory = components.filter((c) => c.track === "theory");
  const lab = components.filter((c) => c.track === "lab");

  return (
    <div className="space-y-5">
      {theory.length ? <Track title="Theory" rows={theory} /> : null}
      {lab.length ? (
        <Track
          title="Lab"
          rows={lab}
          note="Lab courses are 100% continuous assessment. There is no written end-semester paper."
        />
      ) : null}
    </div>
  );
}

function Track({
  title,
  rows,
  note,
}: {
  title: string;
  rows: Component[];
  note?: string;
}) {
  const scored = rows.filter((r) => r.obtained !== null);
  const got = scored.reduce((a, r) => a + (r.obtained ?? 0), 0);
  const outOf = scored.reduce((a, r) => a + r.marks, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-[length:var(--text-small)] font-medium text-subtle">
          {title}
        </h3>
        {scored.length ? (
          <span className="text-[length:var(--text-micro)] text-muted tabular-nums">
            {got}/{outOf} recorded ·{" "}
            <span className="font-semibold text-fg">
              {outOf ? Math.round((got / outOf) * 100) : 0}%
            </span>
          </span>
        ) : null}
      </div>

      <div className="border border-line rounded-[12px] overflow-hidden bg-surface">
        <table className="w-full text-[length:var(--text-small)]">
          <thead>
            <tr className="bg-surface-2 text-subtle">
              <th className="text-left font-medium px-3 py-2">Component</th>
              <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Covers</th>
              <th className="text-right font-medium px-3 py-2 w-[70px]">Marks</th>
              <th className="text-right font-medium px-3 py-2 w-[110px]">Scored</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((c) => (
              <Row key={c.id} c={c} />
            ))}
          </tbody>
        </table>
      </div>

      {note ? <p className="text-[length:var(--text-micro)] text-muted mt-2">{note}</p> : null}
    </div>
  );
}

function Row({ c }: { c: Component }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(c.obtained?.toString() ?? "");
  const [pending, start] = useTransition();

  function save() {
    const n = value.trim() === "" ? null : Number(value);
    start(async () => {
      await setComponentMark(c.id, n);
      setEditing(false);
    });
  }

  return (
    <tr className={cn(pending && "opacity-50")}>
      <td className="px-3 py-2.5 align-top">
        <p className="font-medium">{c.name}</p>
        <p className="text-[length:var(--text-micro)] text-muted mt-0.5 flex flex-wrap items-center gap-1.5">
          {c.timing ? <span>{c.timing}</span> : null}
          {c.co && c.co !== "Not confirmed" && c.co !== "Unknown" ? (
            <Badge tone="neutral">{c.co}</Badge>
          ) : null}
        </p>
        <p className="text-[length:var(--text-micro)] text-muted mt-1 sm:hidden">{c.scope}</p>
      </td>
      <td className="px-3 py-2.5 align-top text-muted hidden sm:table-cell">{c.scope}</td>
      <td className="px-3 py-2.5 align-top text-right tabular-nums">
        {c.marks}
        {c.weightage !== c.marks ? (
          <span className="text-subtle block text-[length:var(--text-micro)]">{c.weightage}%</span>
        ) : null}
      </td>
      <td className="px-3 py-2.5 align-top text-right">
        {editing ? (
          <div className="flex items-center gap-1 justify-end">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setEditing(false);
              }}
              type="number"
              min={0}
              max={c.marks}
              className={`${inputCls} h-7 w-[60px] text-right text-[length:var(--text-micro)] px-2`}
            />
            <Button variant="ghost" size="icon" onClick={save} aria-label="Save">
              <Check size={13} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(false)}
              aria-label="Cancel"
            >
              <X size={13} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-muted hover:text-fg transition-colors focus-ring rounded px-1"
          >
            {c.obtained !== null ? (
              <span className="font-semibold text-fg tabular-nums">
                {c.obtained}
                <span className="text-subtle font-normal">/{c.marks}</span>
              </span>
            ) : (
              <span className="text-subtle">—</span>
            )}
            <Pencil size={11} />
          </button>
        )}
      </td>
    </tr>
  );
}
