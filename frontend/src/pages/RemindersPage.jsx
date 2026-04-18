import { Bell, CheckCircle2, Clock3, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import ReminderCard from "../components/reminders/ReminderCard";
import Chip from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";

function groupReminders(reminders) {
  const now = new Date();
  const startTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return {
    overdue: reminders.filter((reminder) => reminder.status !== "done" && new Date(reminder.due_at) < now),
    today: reminders.filter((reminder) => {
      const due = new Date(reminder.due_at);
      return reminder.status !== "done" && due >= now && due < startTomorrow;
    }),
    upcoming: reminders.filter((reminder) => reminder.status !== "done" && new Date(reminder.due_at) >= startTomorrow),
    done: reminders.filter((reminder) => reminder.status === "done")
  };
}

const filters = [
  ["focus", "Focus"],
  ["upcoming", "Upcoming"],
  ["done", "Done"]
];

export default function RemindersPage() {
  const [filter, setFilter] = useState("focus");
  const queryClient = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["reminders"], queryFn: () => api.reminders() });

  const complete = useMutation({
    mutationFn: (reminder) => api.completeReminder(reminder.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
    }
  });

  const snooze = useMutation({
    mutationFn: (reminder) => api.snoozeReminder(reminder.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
    }
  });

  const groups = useMemo(() => groupReminders(data), [data]);
  const focusItems = [...groups.overdue, ...groups.today];
  const visible = filter === "focus" ? focusItems : groups[filter] || [];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-leaf-100 bg-leaf-50 p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-leaf-700">Reminders</p>
            <h1 className="text-2xl font-bold text-stone-950">Gentle nudges</h1>
          </div>
          <Link
            to="/reminders/new"
            className="grid h-11 w-11 place-items-center rounded-lg bg-leaf-700 text-white"
            aria-label="Add reminder"
            title="Add reminder"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryTile icon={Clock3} label="Overdue" value={groups.overdue.length} tone="clay" />
          <SummaryTile icon={Bell} label="Today" value={groups.today.length} tone="sun" />
          <SummaryTile icon={CheckCircle2} label="Done" value={groups.done.length} tone="leaf" />
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 rounded-lg border border-leaf-100 bg-white/70 p-1 shadow-sm">
        {filters.map(([value, label]) => (
          <Chip
            key={value}
            active={filter === value}
            onClick={() => setFilter(value)}
            className="w-full rounded-md border-0 text-xs"
          >
            {label}
          </Chip>
        ))}
      </div>

      {isLoading ? <p className="py-8 text-center text-stone-500">Loading reminders...</p> : null}
      {error ? <EmptyState title="Could not load reminders" body={error.message} /> : null}
      {!isLoading && !error && !data.length ? (
        <EmptyState title="No reminders yet" body="Create follow-ups for the tiny things future-you would love to have remembered." />
      ) : null}

      {!isLoading && !error && data.length ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-950">{sectionTitle(filter)}</h2>
            <span className="text-sm font-medium text-stone-500">{visible.length}</span>
          </div>
          {visible.length ? (
            <div className="space-y-3">
              {visible.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={(item) => complete.mutate(item)}
                  onSnooze={(item) => snooze.mutate(item)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title={emptyTitle(filter)} body={emptyBody(filter)} />
          )}
        </section>
      ) : null}
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, tone }) {
  const styles = {
    clay: "bg-clay-100 text-clay-500",
    sun: "bg-sun-100 text-stone-800",
    leaf: "bg-leaf-100 text-leaf-700"
  };

  return (
    <div className={`rounded-md p-2 text-center ${styles[tone] || styles.leaf}`}>
      <Icon className="mx-auto h-4 w-4" aria-hidden="true" />
      <strong className="mt-1 block text-lg leading-5 text-stone-950">{value}</strong>
      <span className="mt-1 block text-[10px] font-semibold text-stone-600">{label}</span>
    </div>
  );
}

function sectionTitle(filter) {
  if (filter === "upcoming") return "Coming up";
  if (filter === "done") return "Completed";
  return "Needs attention";
}

function emptyTitle(filter) {
  if (filter === "upcoming") return "Nothing scheduled";
  if (filter === "done") return "Nothing completed yet";
  return "No urgent reminders";
}

function emptyBody(filter) {
  if (filter === "upcoming") return "Add a reminder when something would be easy to forget.";
  if (filter === "done") return "Completed reminders will collect here.";
  return "No reminder is asking for attention right now.";
}
