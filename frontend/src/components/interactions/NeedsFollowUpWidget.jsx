import { BellPlus, Check, MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import { formatDate } from "../../utils/format";
import PlantVisual from "../garden/PlantVisual";

export default function NeedsFollowUpWidget({ widget = {} }) {
  const queryClient = useQueryClient();
  const items = widget.items || [];
  const complete = useMutation({
    mutationFn: (interaction) => api.completeInteractionFollowUp(interaction.id),
    onSuccess: (interaction) => {
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["interactions"] });
      if (interaction?.person) queryClient.invalidateQueries({ queryKey: ["person", String(interaction.person)] });
    }
  });

  if (!items.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-stone-950">Needs follow-up</h2>
          <p className="mt-0.5 text-xs font-medium text-stone-600">
            {widget.count || items.length} open loop{(widget.count || items.length) === 1 ? "" : "s"}
          </p>
        </div>
        <Link to="/journal" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-leaf-700 shadow-sm">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Journal
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-5">
        <div className="flex snap-x gap-3">
          {items.slice(0, 5).map((interaction) => (
            <FollowUpTile
              key={interaction.id}
              interaction={interaction}
              onDone={() => complete.mutate(interaction)}
              disabled={complete.isPending}
            />
          ))}
        </div>
      </div>

      {complete.error ? <p className="text-xs font-semibold text-clay-500">{complete.error.message}</p> : null}
    </section>
  );
}

function FollowUpTile({ interaction, onDone, disabled }) {
  const person = interaction.person_detail;
  const reminderText = encodeURIComponent(`Follow up on: ${interaction.title}`);
  const reminderLink = interaction.person ? `/reminders/new?person=${interaction.person}&interaction=${interaction.id}&text=${reminderText}` : "/reminders/new";

  return (
    <article className="min-w-[82%] snap-start rounded-lg border border-sun-100 bg-sun-50 p-4 shadow-soft sm:min-w-[68%]">
      <div className="flex gap-3">
        <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg bg-white/75">
          <PlantVisual
            plantType={person?.plant_type}
            health={person?.relationship_health}
            plant={person?.plant}
            className="h-20 w-20"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-stone-950">{person?.name || "Journal entry"}</h3>
            <span className="shrink-0 text-xs font-semibold text-stone-500">{formatDate(interaction.interaction_date)}</span>
          </div>
          {interaction.body ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{interaction.body}</p> : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to={reminderLink}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-sm font-semibold text-stone-800 shadow-sm"
        >
          <BellPlus className="h-4 w-4" aria-hidden="true" />
          Reminder
        </Link>
        <button
          type="button"
          onClick={onDone}
          disabled={disabled}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-leaf-700 px-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Done
        </button>
      </div>
    </article>
  );
}
