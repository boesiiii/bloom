import { Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "../api/client";
import JournalEntryCard from "../components/journal/JournalEntryCard";
import Chip from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import SearchInput from "../components/ui/SearchInput";

const filters = [
  ["all", "All"],
  ["one_on_one", "One-on-one"],
  ["group", "Group"],
  ["call", "Call"],
  ["text", "Text"],
  ["in_person", "In person"],
  ["event", "Event"],
  ["gift", "Gift"]
];

export default function JournalPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const queryText = search.trim();
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["interactions", "journal", queryText],
    queryFn: () => api.interactions(queryText ? { q: queryText } : {})
  });

  const filteredEntries = useMemo(() => {
    if (filter === "all") return data;
    if (filter === "one_on_one") return data.filter((entry) => (entry.participant_details?.length || 1) <= 1);
    if (filter === "group") return data.filter((entry) => (entry.participant_details?.length || 1) > 1);
    return data.filter((entry) => entry.interaction_type === filter);
  }, [data, filter]);

  const groups = useMemo(() => groupByMonth(filteredEntries), [filteredEntries]);

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-leaf-700">Journal</p>
          <h1 className="text-2xl font-bold text-stone-950">Relationship journal</h1>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-stone-500">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
        </span>
      </section>

      <SearchInput value={search} onChange={setSearch} placeholder="Search people or topics..." />

      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex min-w-max gap-2">
          {filters.map(([value, label]) => (
            <Chip key={value} active={filter === value} onClick={() => setFilter(value)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {isLoading ? <p className="py-8 text-center text-stone-500">Loading journal...</p> : null}
      {error ? <EmptyState title="Could not load journal" body={error.message} /> : null}

      {!isLoading && !error && !filteredEntries.length ? (
        <EmptyState title="No journal entries" body="Log a quick interaction after a message, call, or meet-up." />
      ) : null}

      {!isLoading && !error && filteredEntries.length ? (
        <div className="space-y-5">
          {groups.map(([label, entries]) => (
            <section key={label} className="space-y-3">
              <h2 className="text-sm font-bold uppercase text-stone-500">{label}</h2>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <JournalEntryCard key={entry.id} interaction={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function groupByMonth(entries) {
  const formatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
  const grouped = new Map();

  entries.forEach((entry) => {
    const key = formatter.format(new Date(entry.interaction_date)).toUpperCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(entry);
  });

  return Array.from(grouped.entries());
}
