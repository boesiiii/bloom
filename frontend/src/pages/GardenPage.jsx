import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "../api/client";
import GardenGrid from "../components/garden/GardenGrid";
import Chip from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";

const filters = [
  ["", "All"],
  ["sunflower", "Sunflowers"],
  ["tulip", "Tulips"],
  ["orchid", "Orchids"],
  ["cactus", "Cactus"],
  ["needs_attention", "Needs care"],
  ["at_risk", "At risk"]
];

const sortOptions = [
  ["needs_attention", "Care first"],
  ["thriving", "Thriving first"],
  ["cadence", "Cadence"],
  ["recent", "Recent"]
];

export default function GardenPage() {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("needs_attention");
  const params =
    ["sunflower", "tulip", "orchid", "cactus"].includes(filter)
      ? { plant_type: filter, sort }
      : { health: filter, sort };
  const { data, isLoading, error } = useQuery({
    queryKey: ["garden", params],
    queryFn: () => api.garden(params)
  });

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-semibold text-leaf-700">Garden</p>
        <h1 className="text-2xl font-bold text-stone-950">Relationship health at a glance</h1>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(([value, label]) => (
          <Chip key={label} active={filter === value} onClick={() => setFilter(value)} className="shrink-0">
            {label}
          </Chip>
        ))}
      </div>

      <label className="block">
        <span className="sr-only">Sort garden</span>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 text-stone-700 outline-none focus:border-leaf-500"
        >
          {sortOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {isLoading ? <p className="py-8 text-center text-stone-500">Loading garden...</p> : null}
      {error ? <EmptyState title="Could not load garden" body={error.message} /> : null}
      {!isLoading && !error ? <GardenGrid people={data?.plants || []} /> : null}
    </div>
  );
}
