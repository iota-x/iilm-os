import { Target } from "lucide-react";
import { getGoalMinutes, getGoals, getSubjects, getTasks, getTopics, getUnits } from "@/lib/queries";
import { NewGoal } from "@/components/goals/new-goal";
import { GoalCard } from "@/components/goals/goal-card";
import { Card, Empty } from "@/components/ui";
import { istToday, MIDSEM_START } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const [goals, subjects, units, topics, tasks, minutesByGoal] = await Promise.all([
    getGoals(),
    getSubjects(),
    getUnits(),
    getTopics(),
    getTasks({ from: "2000-01-01" }),
    getGoalMinutes(),
  ]);
  const today = istToday();
  const active = goals.filter((g) => g.status === "active");
  const past = goals.filter((g) => g.status !== "active");

  return (
    <div className="mx-auto max-w-[820px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--text-page)]">Goals</h1>
          <p className="mt-1 max-w-[56ch] text-[length:var(--text-small)] text-muted">
            Pick what to finish, by when, how much time a day you have and where you&rsquo;re
            starting from. It becomes learn blocks and short drills on your Today page, in weeks
            that each end with a review — and it re-adjusts itself when a day slips.
          </p>
        </div>
        <NewGoal
          subjects={subjects}
          units={units}
          topics={topics}
          defaultDeadline={MIDSEM_START.toISOString().slice(0, 10)}
        />
      </div>

      {active.length ? (
        <ul className="space-y-3">
          {active.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              subject={subjects.find((s) => s.id === g.subject_id) ?? null}
              unit={units.find((u) => u.id === g.unit_id) ?? null}
              tasks={tasks.filter((t) => t.goal_id === g.id)}
              today={today}
              spentMinutes={minutesByGoal.get(g.id) ?? 0}
            />
          ))}
        </ul>
      ) : (
        <Card>
          <Empty
            icon={<Target size={26} strokeWidth={1.5} />}
            title="No goal yet"
            body="Try “Calculus mid-sem scope by 4 October”. You'll see the daily load before you commit."
          />
        </Card>
      )}

      {past.length ? (
        <section>
          <h2 className="text-[length:var(--text-lead)] text-muted">Finished or dropped</h2>
          <ul className="mt-2 space-y-2">
            {past.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                subject={subjects.find((s) => s.id === g.subject_id) ?? null}
                unit={units.find((u) => u.id === g.unit_id) ?? null}
                tasks={tasks.filter((t) => t.goal_id === g.id)}
                today={today}
                spentMinutes={minutesByGoal.get(g.id) ?? 0}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
