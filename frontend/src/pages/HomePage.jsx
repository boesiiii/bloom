import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import FocusCard from "../components/FocusCard";
import HealthSummaryCard from "../components/HealthSummaryCard";
import SuggestedActionCard from "../components/SuggestedActionCard";
import MiniGardenPreview from "../components/garden/MiniGardenPreview";
import InteractionTimeline from "../components/interactions/InteractionTimeline";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import SearchInput from "../components/ui/SearchInput";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ["home"], queryFn: api.home });

  function handleSearch(value) {
    setSearch(value);
    if (value.trim().length > 1) navigate(`/people?q=${encodeURIComponent(value.trim())}`);
  }

  if (isLoading) return <p className="py-8 text-center text-stone-500">Loading your garden...</p>;
  if (error) return <EmptyState title="Could not load home" body={error.message} />;

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-semibold text-leaf-700">{data.greeting}</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-950">A few tiny ways to stay connected</h1>
      </section>

      <SearchInput value={search} onChange={handleSearch} placeholder="Search people, notes, reminders" />

      <FocusCard person={data.today_focus?.[0]} />
      <HealthSummaryCard summary={data.relationship_health_summary} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-950">Suggested actions</h2>
          <Link to="/interactions/new" className="text-sm font-semibold text-leaf-700">
            Quick log
          </Link>
        </div>
        {data.suggested_actions?.length ? (
          <div className="space-y-3">
            {data.suggested_actions.slice(0, 3).map((action, index) => (
              <SuggestedActionCard key={`${action.type}-${index}`} action={action} />
            ))}
          </div>
        ) : (
          <EmptyState title="No suggestions right now" body="You can still log a moment whenever it is fresh." />
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-stone-950">Mini garden</h2>
          <Link to="/garden" className="text-sm font-semibold text-leaf-700">
            Open
          </Link>
        </div>
        <Card>
          <MiniGardenPreview people={data.garden_preview || []} />
        </Card>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-stone-950">Recent interactions</h2>
          <Link to="/interactions/new" className="text-sm font-semibold text-leaf-700">
            Add
          </Link>
        </div>
        <InteractionTimeline interactions={data.recent_interactions || []} />
      </section>
    </div>
  );
}
