import { Link } from "react-router-dom";

import Card from "./ui/Card";
import PlantVisual from "./garden/PlantVisual";
import { formatDate } from "../utils/format";

export default function FocusCard({ person }) {
  if (!person) {
    return (
      <Card className="bg-leaf-50">
        <p className="text-sm font-semibold text-leaf-700">Today focus</p>
        <h2 className="mt-2 text-lg font-bold text-stone-950">Your garden is quiet today</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">No urgent relationship goals are asking for attention.</p>
      </Card>
    );
  }

  return (
    <Card as={Link} to={`/people/${person.id}`} className="block bg-leaf-50">
      <div className="flex gap-4">
        <PlantVisual plantType={person.plant_type} health={person.relationship_health} className="h-24 w-24 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-leaf-700">Today focus</p>
          <h2 className="mt-1 text-lg font-bold text-stone-950">{person.name}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            A small message counts. Next goal: {formatDate(person.next_goal_due_at)}.
          </p>
        </div>
      </div>
    </Card>
  );
}
