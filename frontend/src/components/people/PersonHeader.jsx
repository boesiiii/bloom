import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

import Avatar from "../ui/Avatar";
import HealthBadge from "./HealthBadge";

export default function PersonHeader({ person }) {
  return (
    <section className="flex items-start gap-4">
      <Avatar person={person} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-stone-950">{person.name}</h1>
            <p className="text-sm capitalize text-stone-500">{person.nickname || person.relationship_type}</p>
          </div>
          <Link
            to={`/people/${person.id}/edit`}
            className="grid h-10 w-10 place-items-center rounded-lg border border-stone-200 bg-white text-stone-600"
            aria-label="Edit person"
            title="Edit person"
          >
            <Edit className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <HealthBadge health={person.relationship_health} />
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-700">
            {person.relationship_points} points
          </span>
        </div>
      </div>
    </section>
  );
}
