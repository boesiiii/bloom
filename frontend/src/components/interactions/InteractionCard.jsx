import { BellPlus, CalendarDays, Check, CheckCircle2, Gift, MessageCircle, Phone, UsersRound, Video } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import { formatDateTime } from "../../utils/format";
import Card from "../ui/Card";

const icons = {
  in_person: UsersRound,
  call: Phone,
  text: MessageCircle,
  video_call: Video,
  event: CalendarDays,
  gift: Gift,
  other: MessageCircle
};

export default function InteractionCard({ interaction }) {
  const queryClient = useQueryClient();
  const Icon = icons[interaction.interaction_type] || MessageCircle;
  const tags = interaction.tags || [];
  const personId = interaction.person || interaction.person_detail?.id;
  const followUpCompleted = Boolean(interaction.follow_up_completed_at);
  const followUpOpen = Boolean(interaction.follow_up_needed && !followUpCompleted);
  const reminderText = encodeURIComponent(`Follow up on: ${interaction.title}`);
  const reminderLink = personId ? `/reminders/new?person=${personId}&interaction=${interaction.id}&text=${reminderText}` : "/reminders/new";

  const completeFollowUp = useMutation({
    mutationFn: () => api.completeInteractionFollowUp(interaction.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["interactions"] });
      if (personId) queryClient.invalidateQueries({ queryKey: ["person", String(personId)] });
    }
  });

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-water-100 text-water-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-stone-950">{interaction.title}</h3>
            <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold capitalize text-stone-600">
              {interaction.mood}
            </span>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {interaction.person_detail?.name ? `${interaction.person_detail.name} - ` : ""}
            {formatDateTime(interaction.interaction_date)}
          </p>
        </div>
      </div>
      {interaction.body ? <p className="text-sm leading-6 text-stone-700">{interaction.body}</p> : null}
      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag.id || tag.slug} className="rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-medium text-leaf-700">
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}
      {followUpOpen ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-sun-100 px-3 py-2">
          <p className="text-sm font-semibold text-stone-900">Needs follow-up</p>
          <div className="flex flex-wrap gap-1.5">
            <Link
              to={reminderLink}
              className="inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-semibold text-stone-800 shadow-sm"
            >
              <BellPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Add reminder
            </Link>
            <button
              type="button"
              onClick={() => completeFollowUp.mutate()}
              disabled={completeFollowUp.isPending}
              className="inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md bg-leaf-700 px-2.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Done
            </button>
          </div>
          {completeFollowUp.error ? <p className="basis-full text-xs font-semibold text-clay-500">{completeFollowUp.error.message}</p> : null}
        </div>
      ) : followUpCompleted ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3 py-1.5 text-sm font-semibold text-leaf-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Follow-up completed
        </p>
      ) : null}
    </Card>
  );
}
