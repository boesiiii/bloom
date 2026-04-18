import Card from "./ui/Card";

export default function HealthSummaryCard({ summary = {} }) {
  const stats = [
    ["Thriving", summary.thriving || 0, "text-leaf-700"],
    ["Healthy", summary.healthy || 0, "text-water-500"],
    ["Needs care", (summary.needs_attention || 0) + (summary.at_risk || 0), "text-clay-500"]
  ];

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-stone-950">Relationship health</h2>
        <span className="text-sm text-stone-500">{summary.total || 0} people</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map(([label, value, color]) => (
          <div key={label} className="rounded-lg bg-stone-50 p-3 text-center">
            <strong className={`block text-2xl ${color}`}>{value}</strong>
            <span className="mt-1 block text-xs font-medium text-stone-500">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-sun-100 p-3 text-sm font-medium text-stone-800">
        {summary.overdue_goals || 0} cadence goals and {summary.overdue_reminders || 0} reminders need a gentle look.
      </p>
    </Card>
  );
}
