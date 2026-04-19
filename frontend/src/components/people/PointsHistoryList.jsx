import Card from "../ui/Card";
import { formatDateTime } from "../../utils/format";

export default function PointsHistoryList({ events = [] }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-stone-950">Points history</h2>
      <Card className="space-y-3">
        {events.length ? (
          events.map((event) => (
            <div key={event.id} className="flex gap-3">
              <span className={`min-w-10 font-bold ${event.points_delta >= 0 ? "text-leaf-700" : "text-clay-500"}`}>
                {event.points_delta >= 0 ? "+" : ""}
                {event.points_delta}
              </span>
              <div>
                <p className="text-sm font-medium text-stone-800">{event.reason}</p>
                <p className="text-xs text-stone-500">{formatDateTime(event.created_at)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-stone-600">No score events yet.</p>
        )}
      </Card>
    </section>
  );
}
