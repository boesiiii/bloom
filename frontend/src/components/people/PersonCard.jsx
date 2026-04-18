import { Link } from "react-router-dom";

import Avatar from "../ui/Avatar";
import Card from "../ui/Card";
import PlantVisual from "../garden/PlantVisual";
import HealthBadge from "./HealthBadge";
import { formatDate, frequencyLabels } from "../../utils/format";

export default function PersonCard({ person }) {
  return (
    <Card as={Link} to={`/people/${person.id}`} className="block transition hover:border-leaf-100 hover:bg-leaf-50">
      <div className="flex gap-3">
        <Avatar person={person} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-stone-950">{person.name}</h3>
              <p className="truncate text-sm text-stone-500">{person.nickname || person.relationship_type}</p>
            </div>
            <PlantVisual plantType={person.plant_type} health={person.relationship_health} plant={person.plant} className="h-14 w-14 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <HealthBadge health={person.relationship_health} />
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
              {person.plant?.growth ?? person.plant_growth ?? 0}/100 growth
            </span>
            {person.is_overdue ? (
              <span className="rounded-full bg-clay-100 px-2.5 py-1 text-xs font-semibold text-clay-500">Gentle nudge</span>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-stone-600">
            {frequencyLabels[person.contact_frequency]} cadence · due {formatDate(person.next_goal_due_at)}
          </p>
        </div>
      </div>
    </Card>
  );
}
