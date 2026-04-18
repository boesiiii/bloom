import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import SuggestedActionCard from "../components/SuggestedActionCard";
import MiniGardenPreview from "../components/garden/MiniGardenPreview";
import PlantVisual from "../components/garden/PlantVisual";
import NeedsFollowUpWidget from "../components/interactions/NeedsFollowUpWidget";
import HomeRemindersWidget from "../components/reminders/HomeRemindersWidget";
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

  const suggestedActions = uniqueSuggestedActions(data.suggested_actions || []).slice(0, 3);

  return (
    <div className="space-y-5">
      <SearchInput value={search} onChange={handleSearch} placeholder="Search people, notes, reminders" />
      <HomeStatsCard summary={data.relationship_health_summary} />

      <NeedsFollowUpWidget widget={data.needs_follow_up_widget} />
      <HomeRemindersWidget widget={data.reminders_widget} />

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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-stone-950">Suggested actions</h2>
            <p className="mt-0.5 text-xs font-medium text-stone-500">Ideas based on your garden</p>
          </div>
          <Link to="/interactions/new" className="text-sm font-semibold text-leaf-700">
            Quick log
          </Link>
        </div>
        {suggestedActions.length ? (
          <div className="space-y-3">
            {suggestedActions.map((action, index) => (
              <SuggestedActionCard key={`${action.type}-${index}`} action={action} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState title="No suggestions right now" body="You can still log a moment whenever it is fresh." />
        )}
      </section>
    </div>
  );
}

function HomeStatsCard({ summary = {} }) {
  const needsCare = (summary.needs_attention || 0) + (summary.at_risk || 0);
  const plant = summary.thriving ? { growth_stage: "fully_bloomed", growth: 100, disconnection_streak: 0 } : { growth_stage: "blooming", growth: 78, disconnection_streak: 0 };

  return (
    <section className="overflow-hidden rounded-lg border border-leaf-100 bg-leaf-50 p-4 shadow-soft">
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-white/75">
          <PlantVisual plantType="sunflower" health={summary.thriving ? "thriving" : "healthy"} plant={plant} className="h-20 w-20" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-leaf-700">{todayLabel()}</p>
          <h1 className="mt-1 text-xl font-bold leading-tight text-stone-950">Your relationship garden</h1>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat label="People" value={summary.total || 0} tone="water" />
            <MiniStat label="Thriving" value={summary.thriving || 0} tone="leaf" />
            <MiniStat label="Needs care" value={needsCare} tone="sun" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, tone = "leaf" }) {
  const styles = {
    water: "bg-water-100 border-water-100",
    leaf: "bg-leaf-100 border-leaf-100",
    sun: "bg-sun-100 text-stone-800 border-sun-100"
  };

  return (
    <div className={`rounded-md border p-2 text-center ${styles[tone] || styles.leaf}`}>
      <strong className="block text-lg leading-5 text-stone-950">{value}</strong>
      <span className="mt-1 block whitespace-nowrap text-[9px] font-semibold text-stone-600">{label}</span>
    </div>
  );
}

function todayLabel() {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" }).format(new Date());
}

function uniqueSuggestedActions(actions) {
  const seen = new Set();
  return actions.filter((action) => {
    const person = action.person || action.reminder?.person_detail;
    const key = `${action.type}-${person?.id || ""}-${action.text || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
