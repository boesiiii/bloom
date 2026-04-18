import Card from "../ui/Card";
import PlantVisual from "../garden/PlantVisual";
import { formatDate, frequencyLabels, plantLabels } from "../../utils/format";

export default function CadenceCard({ person }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4">
        <PlantVisual plantType={person.plant_type} health={person.relationship_health} className="h-28 w-28 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-leaf-700">{plantLabels[person.plant_type]}</p>
          <h2 className="mt-1 text-lg font-bold text-stone-950">{frequencyLabels[person.contact_frequency]} relationship</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Interact by {formatDate(person.next_goal_due_at)} to keep this plant cared for.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-leaf-50 p-2">
              <span className="block text-stone-500">Streak</span>
              <strong className="text-stone-950">{person.current_streak}</strong>
            </div>
            <div className="rounded-lg bg-water-100 p-2">
              <span className="block text-stone-600">Best</span>
              <strong className="text-stone-950">{person.longest_streak}</strong>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
