import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client";
import PersonForm from "../components/people/PersonForm";
import EmptyState from "../components/ui/EmptyState";

export default function PersonFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const personQuery = useQuery({
    queryKey: ["person", id],
    queryFn: () => api.person(id),
    enabled: isEditing
  });

  const mutation = useMutation({
    mutationFn: (payload) => (isEditing ? api.updatePerson(id, payload) : api.createPerson(payload)),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["garden"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      navigate(`/people/${person.id}`);
    }
  });

  if (personQuery.isLoading) return <p className="py-8 text-center text-stone-500">Loading form...</p>;
  if (personQuery.error) return <EmptyState title="Could not load person" body={personQuery.error.message} />;

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-semibold text-leaf-700">{isEditing ? "Edit person" : "New person"}</p>
        <h1 className="text-2xl font-bold text-stone-950">{isEditing ? "Update relationship" : "Plant a relationship"}</h1>
      </section>
      {mutation.error ? <p className="rounded-lg bg-clay-100 p-3 text-sm font-medium text-clay-500">{mutation.error.message}</p> : null}
      <PersonForm initialValue={personQuery.data} onSubmit={mutation.mutate} submitting={mutation.isPending} />
    </div>
  );
}
