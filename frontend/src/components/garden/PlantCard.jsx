import { Link } from "react-router-dom";

import Card from "../ui/Card";
import PlantStatusBadge from "./PlantStatusBadge";
import PlantVisual from "./PlantVisual";
import { formatDate, frequencyLabels, plantLabels } from "../../utils/format";

export default function PlantCard({ person, compact = false }) {
  const growth = person.plant?.growth ?? person.plant_growth ?? 0;
  const plantLabel = plantLabels[person.plant_type] || person.plant_type;
  const cadenceLabel = frequencyLabels[person.contact_frequency] || person.contact_frequency;
  const isDisconnected = Boolean(person.disconnection_streak);

  return (
    <Card
      as={Link}
      to={`/people/${person.id}`}
      className="block overflow-hidden p-0 transition hover:border-leaf-100 hover:bg-leaf-50"
    >
      <div className="flex min-h-14 items-center justify-between gap-2 border-b border-stone-100 px-3 py-2.5">
        <h3 className="min-w-0 truncate text-base font-semibold text-stone-950">{person.name}</h3>
        <PlantStatusBadge health={person.relationship_health} />
      </div>

      <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 px-3 py-3">
        <div className="flex min-h-28 items-center justify-center rounded-md bg-leaf-50/70">
          <PlantVisual
            plantType={person.plant_type}
            health={person.relationship_health}
            plant={person.plant}
            className={compact ? "h-20 w-20 shrink-0" : "h-24 w-24 shrink-0"}
          />
        </div>

        <div className="min-w-0 space-y-3 overflow-hidden">
          <div>
            <p className="truncate text-sm font-semibold text-stone-800">{cadenceLabel}</p>
            <p className="truncate text-sm capitalize text-stone-500">{plantLabel.toLowerCase()}</p>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-leaf-500" style={{ width: `${Math.max(0, Math.min(100, growth))}%` }} />
            </div>
            <p className="text-sm font-semibold text-stone-950">{growth}/100 growth</p>
          </div>

          <div className="space-y-1.5 text-sm">
            <p className={person.is_overdue ? "font-semibold text-clay-500" : "text-stone-600"}>
              <span className="text-stone-500">Due </span>
              <span className="whitespace-nowrap">{formatDate(person.next_goal_due_at)}</span>
            </p>
            {isDisconnected ? (
              <p className="inline-flex max-w-full items-center rounded-full bg-clay-100 px-2 py-1 text-xs font-semibold text-clay-500">
                <span className="truncate">Disconnection {person.disconnection_streak}/10</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
