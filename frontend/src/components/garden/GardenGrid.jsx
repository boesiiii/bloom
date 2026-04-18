import EmptyState from "../ui/EmptyState";
import PlantCard from "./PlantCard";

export default function GardenGrid({ people = [] }) {
  if (!people.length) {
    return <EmptyState title="No plants here yet" body="Add a person and choose a cadence to plant the first relationship." />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {people.map((person) => (
        <PlantCard key={person.id} person={person} />
      ))}
    </div>
  );
}
