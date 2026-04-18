import { Link } from "react-router-dom";

import PlantVisual from "./PlantVisual";

export default function MiniGardenPreview({ people = [] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {people.slice(0, 4).map((person) => (
        <Link
          key={person.id}
          to={`/people/${person.id}`}
          className="flex min-h-28 flex-col items-center justify-between rounded-lg border border-stone-200 bg-white p-2 text-center"
        >
          <PlantVisual plantType={person.plant_type} health={person.relationship_health} className="h-16 w-16" />
          <span className="w-full truncate text-xs font-medium text-stone-700">{person.name}</span>
        </Link>
      ))}
    </div>
  );
}
