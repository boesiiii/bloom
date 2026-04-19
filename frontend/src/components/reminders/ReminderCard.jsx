import { Bell, Check, Clock3, Gift, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import { formatDateTime, isOverdue } from "../../utils/format";

export default function ReminderCard({ reminder, onComplete, onSnooze }) {
  const person = reminder.person_detail;
  const overdue = isOverdue(reminder.due_at);
  const Icon = reminder.kind === "birthday" ? Gift : Bell;

  return (
    <Card className={`space-y-3 p-3 ${overdue && reminder.status !== "done" ? "border-clay-100 bg-clay-100/35" : ""}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${reminder.kind === "birthday" ? "bg-sun-100 text-stone-800" : "bg-leaf-100 text-leaf-700"}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-semibold leading-5 text-stone-950">{reminder.text}</p>
              {person ? (
                <Link to={`/people/${person.id}`} className="mt-1.5 inline-flex items-center gap-2 text-xs font-semibold text-stone-600">
                  <Avatar person={person} size="sm" />
                  <span className="truncate">{person.name}</span>
                </Link>
              ) : null}
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle(reminder, overdue)}`}>
              {statusLabel(reminder, overdue)}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-stone-500">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDateTime(reminder.due_at)}
          </p>
        </div>
      </div>

      {reminder.status !== "done" ? (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onComplete(reminder)}
            className="grid h-9 w-9 place-items-center rounded-md bg-leaf-700 text-white"
            aria-label={`Complete ${reminder.text}`}
            title="Done"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onSnooze(reminder)}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Later
          </button>
        </div>
      ) : (
        <span className="inline-flex min-h-8 items-center rounded-full bg-leaf-100 px-3 text-sm font-semibold text-leaf-700">
          Completed
        </span>
      )}
    </Card>
  );
}

function statusLabel(reminder, overdue) {
  if (reminder.status === "done") return "Done";
  if (overdue) return "Overdue";
  if (reminder.kind === "birthday") return "Birthday";
  if (reminder.status === "snoozed") return "Snoozed";
  return "Upcoming";
}

function statusStyle(reminder, overdue) {
  if (reminder.status === "done") return "bg-leaf-100 text-leaf-700";
  if (overdue) return "bg-clay-100 text-clay-500";
  if (reminder.kind === "birthday") return "bg-sun-100 text-stone-800";
  if (reminder.status === "snoozed") return "bg-water-100 text-water-500";
  return "bg-stone-100 text-stone-600";
}
