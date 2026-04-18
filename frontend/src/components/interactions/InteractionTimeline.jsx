import EmptyState from "../ui/EmptyState";
import InteractionCard from "./InteractionCard";

export default function InteractionTimeline({ interactions = [] }) {
  if (!interactions.length) {
    return <EmptyState title="No interactions yet" body="A quick note after a chat is enough to start the memory trail." />;
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => (
        <InteractionCard key={interaction.id} interaction={interaction} />
      ))}
    </div>
  );
}
