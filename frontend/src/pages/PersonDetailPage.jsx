import { BellPlus, MessageCirclePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client";
import CadenceCard from "../components/people/CadenceCard";
import PersonHeader from "../components/people/PersonHeader";
import PointsHistoryList from "../components/people/PointsHistoryList";
import ProfileDetailsSection from "../components/people/ProfileDetailsSection";
import InteractionTimeline from "../components/interactions/InteractionTimeline";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";

export default function PersonDetailPage() {
  const { id } = useParams();
  const { data: person, isLoading, error } = useQuery({
    queryKey: ["person", id],
    queryFn: () => api.person(id)
  });

  if (isLoading) return <p className="py-8 text-center text-stone-500">Loading person...</p>;
  if (error) return <EmptyState title="Could not load person" body={error.message} />;

  return (
    <div className="space-y-5 pb-16">
      <PersonHeader person={person} />
      <CadenceCard person={person} />

      {person.notes_summary ? (
        <Card>
          <h2 className="font-semibold text-stone-950">Memory summary</h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">{person.notes_summary}</p>
        </Card>
      ) : null}

      <ProfileDetailsSection person={person} />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-stone-950">Recent interactions</h2>
          <Link to={`/interactions/new?person=${person.id}`} className="text-sm font-semibold text-leaf-700">
            Add
          </Link>
        </div>
        <InteractionTimeline interactions={person.recent_interactions || []} />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-stone-950">Reminders</h2>
          <Link to={`/reminders/new?person=${person.id}`} className="text-sm font-semibold text-leaf-700">
            New
          </Link>
        </div>
        <div className="space-y-3">
          {(person.reminders || []).length ? (
            person.reminders.map((reminder) => (
              <Card key={reminder.id}>
                <p className="font-medium text-stone-950">{reminder.text}</p>
                <p className="mt-1 text-sm text-stone-500">{reminder.status}</p>
              </Card>
            ))
          ) : (
            <EmptyState title="No reminders" body="Add one when a follow-up would be easy to forget." />
          )}
        </div>
      </section>

      <PointsHistoryList events={person.score_events || []} />

      <div className="fixed inset-x-0 bottom-20 z-20 px-4">
        <div className="mx-auto flex max-w-md gap-2">
          <Link
            to={`/interactions/new?person=${person.id}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-leaf-700 px-3 font-semibold text-white shadow-lg shadow-leaf-700/20"
          >
            <MessageCirclePlus className="h-5 w-5" aria-hidden="true" />
            Log
          </Link>
          <Link
            to={`/reminders/new?person=${person.id}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 font-semibold text-stone-700 shadow-lg"
            aria-label="Add reminder"
            title="Add reminder"
          >
            <BellPlus className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
