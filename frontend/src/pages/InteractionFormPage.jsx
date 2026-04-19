import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import InteractionForm from "../components/interactions/InteractionForm";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/ToastProvider";

export default function InteractionFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const defaultPersonId = params.get("person") || "";
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const peopleQuery = useQuery({ queryKey: ["people", "form"], queryFn: () => api.people() });
  const interactionQuery = useQuery({
    queryKey: ["interaction", id],
    queryFn: () => api.interaction(id),
    enabled: isEditing
  });

  const mutation = useMutation({
    mutationFn: (payload) => (isEditing ? api.updateInteraction(id, payload) : api.createInteraction(payload)),
    onSuccess: (interaction) => {
      const participantIds = interaction.participant_ids?.length ? interaction.participant_ids : [interaction.person];
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["garden"] });
      queryClient.invalidateQueries({ queryKey: ["interactions"] });
      participantIds.forEach((personId) => queryClient.invalidateQueries({ queryKey: ["person", String(personId)] }));
      toast.success(isEditing ? "Interaction updated." : "Interaction logged.");
      navigate("/journal");
    }
  });

  if (peopleQuery.isLoading || interactionQuery.isLoading) return <p className="py-8 text-center text-stone-500">Loading form...</p>;
  if (peopleQuery.error || interactionQuery.error) {
    const error = peopleQuery.error || interactionQuery.error;
    return <EmptyState title="Could not load interaction form" body={error.message} />;
  }

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-semibold text-leaf-700">{isEditing ? "Edit interaction" : "Fast memory capture"}</p>
        <h1 className="text-2xl font-bold text-stone-950">{isEditing ? "Update interaction" : "Log an interaction"}</h1>
      </section>
      {mutation.error ? <p className="rounded-lg bg-clay-100 p-3 text-sm font-medium text-clay-500">{mutation.error.message}</p> : null}
      <InteractionForm
        people={peopleQuery.data || []}
        initialValue={interactionQuery.data}
        defaultPersonId={defaultPersonId}
        onSubmit={mutation.mutate}
        submitting={mutation.isPending}
      />
    </div>
  );
}
