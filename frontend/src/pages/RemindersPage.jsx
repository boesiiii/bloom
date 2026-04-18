import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import ReminderCard from "../components/reminders/ReminderCard";
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

export default function RemindersPage() {
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

  const groups = groupReminders(data);

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-leaf-700">Reminders</p>
          <h1 className="text-2xl font-bold text-stone-950">Gentle follow-ups</h1>
        </div>
        <Link
          to="/reminders/new"
          className="grid h-11 w-11 place-items-center rounded-lg bg-leaf-700 text-white"
          aria-label="Add reminder"
          title="Add reminder"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </Link>
      </section>

      {isLoading ? <p className="py-8 text-center text-stone-500">Loading reminders...</p> : null}
      {error ? <EmptyState title="Could not load reminders" body={error.message} /> : null}
      {!isLoading && !error && !data.length ? (
        <EmptyState title="No reminders yet" body="Create follow-ups for the tiny things future-you would love to have remembered." />
      ) : null}

      {Object.entries(groups).map(([label, reminders]) =>
        reminders.length ? (
          <section key={label} className="space-y-3">
            <h2 className="font-semibold capitalize text-stone-950">{label}</h2>
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={(item) => complete.mutate(item)}
                onSnooze={(item) => snooze.mutate(item)}
              />
            ))}
          </section>
        ) : null
      )}
    </div>
  );
}
