import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "../api/client";
import HealthSummaryCard from "../components/HealthSummaryCard";
import GardenGrid from "../components/garden/GardenGrid";
import GardenScene from "../components/garden/GardenScene";
import Chip from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";

const filters = [
  ["needs_attention", "Needs care"],
  ["at_risk", "At risk"]
];

export default function GardenPage() {
  const [filter, setFilter] = useState("");
  const params = filter ? { health: filter } : {};
  const { data, isLoading, error } = useQuery({
    queryKey: ["garden", params],
    queryFn: () => api.garden(params)
  });

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-semibold text-leaf-700">Garden</p>
        <h1 className="text-2xl font-bold leading-tight text-stone-950">Your friendship garden</h1>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-leaf-100 bg-white/70 p-1 shadow-sm">
        {filters.map(([value, label]) => (
          <Chip
            key={label}
            active={filter === value}
            onClick={() => setFilter(filter === value ? "" : value)}
            className="w-full rounded-md border-0"
          >
            {label}
          </Chip>
        ))}
      </div>

      {isLoading ? <p className="py-8 text-center text-stone-500">Loading garden...</p> : null}
      {error ? <EmptyState title="Could not load garden" body={error.message} /> : null}
      {!isLoading && !error ? (
        <>
          <GardenScene people={data?.plants || []} />
          <HealthSummaryCard summary={data?.relationship_health_summary} />
          <section className="space-y-3">
            <h2 className="font-semibold text-stone-950">Friendship plots</h2>
            <GardenGrid people={data?.plants || []} />
          </section>
        </>
      ) : null}
    </div>
  );
}
