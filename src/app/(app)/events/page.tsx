import { CalendarPlus, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { getEvents, getProfile } from "@/lib/queries";
import { deleteEvent } from "@/lib/actions";
import { eventWhen, istDate } from "@/lib/event-time";
import { Markdown } from "@/components/markdown";
import { NewEvent } from "@/components/events/new-event";
import { Going } from "@/components/events/going";
import { ActionButton } from "@/components/staff/action-button";
import { Card, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

/**
 * Workshops, fests, talks, club meets — the whole university's, in one list.
 * Tap "I'm going" and it comes up on Today the evening before; "Add to
 * calendar" puts it on the phone with a reminder.
 */
export default async function EventsPage() {
  const [events, profile] = await Promise.all([getEvents(), getProfile()]);
  const byDay = new Map<string, typeof events>();
  for (const e of events) {
    const d = istDate(e.starts_at);
    byDay.set(d, [...(byDay.get(d) ?? []), e]);
  }

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--text-page)]">Events</h1>
          <p className="mt-1 max-w-xl text-[length:var(--text-small)] text-muted">
            Workshops, fests, talks and club meets across the university. Tap &ldquo;I&rsquo;m going&rdquo; and it
            shows up on your Today the evening before.
          </p>
        </div>
        <NewEvent />
      </div>

      {events.length ? (
        [...byDay.entries()].map(([day, list]) => (
          <section key={day} className="space-y-2">
            <h2 className="text-[length:var(--text-small)] font-semibold text-muted">
              {new Date(`${day}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
            </h2>
            {list.map((e) => (
              <Card key={e.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-[length:var(--text-lead)] font-semibold">{e.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[length:var(--text-small)] text-muted">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {eventWhen(e.starts_at, e.ends_at)}</span>
                      {e.venue ? <span className="inline-flex items-center gap-1"><MapPin size={13} /> {e.venue}</span> : null}
                      {e.organiser ? <span>by {e.organiser}</span> : null}
                    </p>
                  </div>
                  <Going id={e.id} count={e.going} mine={e.mine} />
                </div>
                {e.body ? (
                  <div className="prose-note mt-3 text-[length:var(--text-small)]">
                    <Markdown>{e.body}</Markdown>
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-2.5 text-[length:var(--text-micro)]">
                  <a href={`/api/events/${e.id}/ics`} className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline focus-ring rounded">
                    <CalendarPlus size={12} /> Add to calendar
                  </a>
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline focus-ring rounded">
                      <ExternalLink size={12} /> Register
                    </a>
                  ) : null}
                  <span className="text-subtle">posted by {e.author}</span>
                  {e.user_id === profile?.id || profile?.is_admin ? (
                    <span className="ml-auto">
                      <ActionButton action={deleteEvent.bind(null, e.id)} confirm="Delete?" done="Deleted" variant="ghost">Delete</ActionButton>
                    </span>
                  ) : null}
                </div>
              </Card>
            ))}
          </section>
        ))
      ) : (
        <Card>
          <Empty
            icon={<CalendarDays size={26} strokeWidth={1.5} />}
            title="Nothing coming up"
            body="Running a workshop or a club meet? Post it once and the whole university sees it."
          />
        </Card>
      )}
    </div>
  );
}
