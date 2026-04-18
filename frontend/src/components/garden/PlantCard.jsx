import { Link } from "react-router-dom";

import Card from "../ui/Card";
import PlantStatusBadge from "./PlantStatusBadge";
import PlantVisual from "./PlantVisual";
import { formatDate, frequencyLabels, plantLabels } from "../../utils/format";

export default function PlantCard({ person, compact = false }) {
  return (
    <Card as={Link} to={`/people/${person.id}`} className="block p-3 transition hover:border-leaf-100 hover:bg-leaf-50">
      <div className="flex items-start justify-between gap-3">
        <PlantVisual
          plantType={person.plant_type}
          health={person.relationship_health}
          className={compact ? "h-20 w-20 shrink-0" : "h-24 w-24 shrink-0"}
        />
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-stone-950">{person.name}</h3>
            <PlantStatusBadge health={person.relationship_health} />
          </div>
          <p className="mt-1 text-sm text-stone-600">
            {frequencyLabels[person.contact_frequency]} {plantLabels[person.plant_type]?.toLowerCase()}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-stone-900">{person.relationship_points} pts</span>
            <span className={person.is_overdue ? "font-semibold text-clay-500" : "text-stone-500"}>
              Due {formatDate(person.next_goal_due_at)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
