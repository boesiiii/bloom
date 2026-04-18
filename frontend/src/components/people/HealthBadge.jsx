import { healthLabels } from "../../utils/format";

const styles = {
  thriving: "bg-leaf-100 text-leaf-700 border-leaf-100",
  healthy: "bg-water-100 text-water-500 border-water-100",
  needs_attention: "bg-sun-100 text-stone-800 border-sun-100",
  at_risk: "bg-clay-100 text-clay-500 border-clay-100",
  dormant: "bg-stone-200 text-stone-700 border-stone-200"
};

export default function HealthBadge({ health }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${styles[health] || styles.needs_attention}`}>
      {healthLabels[health] || health}
    </span>
  );
}
