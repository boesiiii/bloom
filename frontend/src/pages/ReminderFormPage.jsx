import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import ReminderForm from "../components/reminders/ReminderForm";
import EmptyState from "../components/ui/EmptyState";

export default function ReminderFormPage() {
  const [params] = useSearchParams();
  const defaultPersonId = params.get("person") || "";
  const defaultInteractionId = params.get("interaction") || "";
  const defaultText = params.get("text") || "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const peopleQuery = useQuery({ queryKey: ["people", "form"], queryFn: () => api.people() });
  const mutation = useMutation({
    mutationFn: api.createReminder,
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      navigate(`/people/${reminder.person}`);
    }
  });

  if (peopleQuery.isLoading) return <p className="py-8 text-center text-stone-500">Loading form...</p>;
  if (peopleQuery.error) return <EmptyState title="Could not load reminder form" body={peopleQuery.error.message} />;

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-semibold text-leaf-700">New reminder</p>
        <h1 className="text-2xl font-bold text-stone-950">Create a gentle nudge</h1>
      </section>
      {mutation.error ? <p className="rounded-lg bg-clay-100 p-3 text-sm font-medium text-clay-500">{mutation.error.message}</p> : null}
      <ReminderForm
        people={peopleQuery.data || []}
        defaultPersonId={defaultPersonId}
        defaultInteractionId={defaultInteractionId}
        defaultText={defaultText}
        onSubmit={mutation.mutate}
        submitting={mutation.isPending}
      />
    </div>
  );
}
