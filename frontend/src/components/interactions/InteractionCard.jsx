import { MessageCircle, Phone, UsersRound, Video, Gift, CalendarDays } from "lucide-react";

import Card from "../ui/Card";
import { formatDateTime } from "../../utils/format";

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
  const Icon = icons[interaction.interaction_type] || MessageCircle;
  const tags = interaction.tags || [];

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
            {interaction.person_detail?.name ? `${interaction.person_detail.name} · ` : ""}
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
      {interaction.follow_up_needed ? (
        <p className="rounded-lg bg-sun-100 p-2 text-sm font-medium text-stone-800">Follow-up needed</p>
      ) : null}
    </Card>
  );
}
