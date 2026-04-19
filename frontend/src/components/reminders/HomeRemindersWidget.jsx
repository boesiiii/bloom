import { Bell, Check, Clock3, Gift, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import { formatDateTime, isOverdue } from "../../utils/format";
import Card from "../ui/Card";
import { useToast } from "../ui/ToastProvider";

export default function HomeRemindersWidget({ widget = {} }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const reminders = widget.items || [];
  const complete = useMutation({
    mutationFn: (reminder) => api.completeReminder(reminder.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast.success("Reminder completed.");
    }
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-stone-950">Reminders</h2>
          <p className="mt-0.5 text-xs font-medium text-stone-500">{summaryText(widget)}</p>
        </div>
        <Link to="/reminders" className="text-sm font-semibold text-leaf-700">
          Open
        </Link>
      </div>

      {reminders.length ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-5">
          <div className="flex snap-x gap-3">
            {reminders.slice(0, 5).map((reminder) => (
              <ReminderTile
                key={reminder.id}
                reminder={reminder}
                onDone={() => complete.mutate(reminder)}
                disabled={complete.isPending}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-leaf-100 bg-leaf-50">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-leaf-700">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-stone-950">Nothing due right now</h3>
              <p className="mt-1 text-sm text-stone-600">Future-you has a quiet moment.</p>
            </div>
            <Link to="/reminders/new" className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-700 text-white" aria-label="Add reminder">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      )}

      {complete.error ? <p className="text-xs font-semibold text-clay-500">{complete.error.message}</p> : null}
    </section>
  );
}

function ReminderTile({ reminder, onDone, disabled }) {
  const overdue = isOverdue(reminder.due_at);
  const Icon = reminder.kind === "birthday" ? Gift : Bell;

  return (
    <article className="min-w-[72%] snap-start rounded-lg border border-leaf-100 bg-leaf-50/90 p-2.5 shadow-soft sm:min-w-[56%]">
      <div className="flex items-start gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${reminder.kind === "birthday" ? "bg-sun-100 text-stone-800" : "bg-white/80 text-leaf-700"}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-stone-950">{reminder.person_detail?.name || "Reminder"}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${overdue ? "bg-clay-100 text-clay-500" : "bg-white/80 text-leaf-700"}`}>
              {overdue ? "Overdue" : reminder.kind === "birthday" ? "Birthday" : "Due"}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm leading-5 text-stone-700">{reminder.text}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1 text-xs font-medium text-stone-500">
          <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{formatDateTime(reminder.due_at)}</span>
        </p>
        <button
          type="button"
          onClick={onDone}
          disabled={disabled}
          className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-full border border-leaf-100 bg-leaf-100 px-2.5 text-xs font-semibold text-leaf-700 disabled:opacity-60"
          aria-label={`Complete ${reminder.text}`}
          title="Done"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Done
        </button>
      </div>
    </article>
  );
}

function summaryText(widget) {
  const overdue = widget.overdue_count || 0;
  const today = widget.today_count || 0;
  if (overdue && today) return `${overdue} overdue, ${today} due today`;
  if (overdue) return `${overdue} overdue`;
  if (today) return `${today} due today`;
  return "Upcoming gentle nudges";
}
