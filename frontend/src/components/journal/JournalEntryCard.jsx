import { BellPlus, CalendarDays, CheckCircle2, Gift, MessageCircle, Phone, UsersRound, Video } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate, initials } from "../../utils/format";
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

const typeLabels = {
  in_person: "In person",
  call: "Call",
  text: "Text",
  video_call: "Video call",
  event: "Event",
  gift: "Gift",
  other: "Other"
};

const moodStyles = {
  positive: "bg-leaf-50 text-leaf-700",
  happy: "bg-leaf-50 text-leaf-700",
  neutral: "bg-stone-100 text-stone-700",
  stressed: "bg-sun-100 text-stone-800",
  anxious: "bg-sun-100 text-stone-800",
  sad: "bg-water-100 text-water-500",
  negative: "bg-clay-100 text-clay-500"
};

export default function JournalEntryCard({ interaction }) {
  const person = interaction.person_detail;
  const participants = interaction.participant_details?.length ? interaction.participant_details : person ? [person] : [];
  const isGroup = participants.length > 1;
  const Icon = icons[interaction.interaction_type] || MessageCircle;
  const pointLabel = interaction.was_meaningful ? "+5 pts" : "+1 note";
  const tags = interaction.tags || [];

  return (
    <Card as={Link} to={`/interactions/${interaction.id}/edit`} className="block p-0 transition hover:border-leaf-100 hover:bg-leaf-50">
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <ParticipantAvatars participants={participants} fallback={interaction.title} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-stone-950">{participantLabel(participants) || "Journal entry"}</h3>
                <p className="mt-0.5 truncate text-sm font-medium text-stone-500">{interaction.title}</p>
              </div>
              <span className="shrink-0 text-sm font-medium text-stone-400">{friendlyEntryDate(interaction.interaction_date)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-stone-100 px-2.5 text-xs font-semibold text-stone-700">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {isGroup ? "Group" : typeLabels[interaction.interaction_type] || "Other"}
          </span>
          <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold capitalize ${moodStyles[interaction.mood] || moodStyles.neutral}`}>
            {interaction.mood}
          </span>
          <span className="inline-flex min-h-7 items-center rounded-full bg-leaf-100 px-2.5 text-xs font-semibold text-leaf-700">
            {pointLabel}
          </span>
        </div>

        {interaction.body ? <p className="text-base leading-7 text-stone-700">{interaction.body}</p> : null}

        {tags.length ? (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag.id || tag.slug} className="rounded-full bg-leaf-50 px-2 py-1 text-xs font-medium text-leaf-700">
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}

        {interaction.follow_up_needed ? (
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-sun-100 px-2.5 text-xs font-semibold text-stone-800">
            <BellPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Needs follow-up
          </span>
        ) : interaction.follow_up_completed_at ? (
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-leaf-100 px-2.5 text-xs font-semibold text-leaf-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Follow-up done
          </span>
        ) : null}
      </div>
    </Card>
  );
}

function ParticipantAvatars({ participants, fallback }) {
  if (!participants.length) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-water-100 text-sm font-bold text-water-500">
        {initials(fallback)}
      </span>
    );
  }

  if (participants.length === 1) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-water-100 text-sm font-bold text-water-500">
        {initials(participants[0].name || participants[0].nickname)}
      </span>
    );
  }

  const visibleParticipants = participants.length > 2 ? participants.slice(0, 1) : participants.slice(0, 2);
  const hiddenCount = participants.length - visibleParticipants.length;

  return (
    <span className="flex h-9 w-14 shrink-0 items-center">
      {visibleParticipants.map((participant, index) => (
        <span
          key={participant.id || index}
          className="-ml-1.5 grid h-8 min-w-8 place-items-center rounded-full bg-water-100 text-[10px] font-bold text-water-500 ring-2 ring-white first:ml-0"
        >
          {initials(participant.name || participant.nickname)}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="-ml-1.5 grid h-8 min-w-8 place-items-center rounded-full bg-stone-200 text-[10px] font-bold text-stone-600 ring-2 ring-white">
          +{hiddenCount}
        </span>
      ) : null}
    </span>
  );
}

function participantLabel(participants) {
  if (!participants.length) return "";
  if (participants.length === 1) return participants[0].name;
  const first = participants[0].name;
  const moreCount = participants.length - 1;
  return `${first} + ${moreCount} more`;
}

function friendlyEntryDate(value) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(value);
}
