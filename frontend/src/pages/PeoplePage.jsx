import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import PersonCard from "../components/people/PersonCard";
import Chip from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import SearchInput from "../components/ui/SearchInput";

const filters = [
  ["", "All"],
  ["thriving", "Thriving"],
  ["healthy", "Healthy"],
  ["needs_attention", "Needs care"],
  ["overdue", "Gentle nudges"]
];

export default function PeoplePage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setSearch(params.get("q") || "");
  }, [params]);

  const queryParams = {
    q: search,
    health: filter && filter !== "overdue" ? filter : "",
    overdue: filter === "overdue" ? "true" : ""
  };
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["people", queryParams],
    queryFn: () => api.people(queryParams)
  });

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-leaf-700">People</p>
          <h1 className="text-2xl font-bold text-stone-950">Relationship memory</h1>
        </div>
        <Link
          to="/people/new"
          className="grid h-11 w-11 place-items-center rounded-lg bg-leaf-700 text-white"
          aria-label="Add person"
          title="Add person"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </Link>
      </section>

      <SearchInput value={search} onChange={setSearch} placeholder="Search people or details" />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map(([value, label]) => (
          <Chip key={label} active={filter === value} onClick={() => setFilter(value)} className="shrink-0">
            {label}
          </Chip>
        ))}
      </div>

      {isLoading ? <p className="py-8 text-center text-stone-500">Loading people...</p> : null}
      {error ? <EmptyState title="Could not load people" body={error.message} /> : null}
      {!isLoading && !error && data.length ? (
        <div className="space-y-3">
          {data.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : null}
      {!isLoading && !error && !data.length ? (
        <EmptyState
          title="Add someone with just a name"
          body="Details can come later, after real interactions."
          action={
            <Link to="/people/new" className="rounded-lg bg-leaf-700 px-4 py-2 text-sm font-semibold text-white">
              Add person
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
