import { Check, Clock3, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import PlantVisual from "../garden/PlantVisual";
import { formatDateTime } from "../../utils/format";

export default function ReminderCard({ reminder, onComplete, onSnooze }) {
  const person = reminder.person_detail;

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar person={person} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/people/${person?.id}`} className="font-semibold text-stone-950">
                {person?.name}
              </Link>
              <p className="mt-1 text-sm leading-6 text-stone-700">{reminder.text}</p>
            </div>
            <PlantVisual plantType={person?.plant_type} health={person?.relationship_health} className="h-14 w-14 shrink-0" />
          </div>
          <p className="mt-2 flex items-center gap-1 text-sm text-stone-500">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {formatDateTime(reminder.due_at)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {reminder.status !== "done" ? (
          <>
            <button
              type="button"
              onClick={() => onComplete(reminder)}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-leaf-700 px-3 text-sm font-semibold text-white"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Done
            </button>
            <button
              type="button"
              onClick={() => onSnooze(reminder)}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Snooze
            </button>
          </>
        ) : (
          <span className="rounded-full bg-leaf-100 px-3 py-1 text-sm font-semibold text-leaf-700">Completed</span>
        )}
      </div>
    </Card>
  );
}
