import { CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import Card from "./ui/Card";

const logInteractionNudges = [
  "Send a short, low-pressure hello.",
  "Ask one specific thing about their week.",
  "Share one small update from your day.",
  "Leave a quick voice note while it is easy.",
  "Start with a two-line message."
];

export default function SuggestedActionCard({ action, index = 0 }) {
  const person = action.person || action.reminder?.person_detail;
  const to = action.type === "complete_reminder" ? "/reminders" : `/interactions/new?person=${person?.id || ""}`;
  const Icon = action.type === "complete_reminder" ? CheckCircle2 : MessageCircle;
  const suggestion = suggestionText(action, person, index);

  return (
    <Card as={Link} to={to} className="block border-water-100 bg-water-100/35">
      <div className="flex items-start gap-3">
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/80 text-water-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
          <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-sun-100 p-0.5 text-sun-500" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-950">{person?.name || "Action"}</h3>
          <p className="mt-1 text-sm leading-6 text-stone-600">{suggestion}</p>
        </div>
      </div>
    </Card>
  );
}

function suggestionText(action, person, index) {
  if (action.type === "log_interaction" && isGenericReachOut(action.text, person?.name)) {
    return logInteractionNudges[index % logInteractionNudges.length];
  }

  return compactSuggestionText(action.text, person?.name);
}

function isGenericReachOut(text = "", name = "") {
  if (!name) return /^reach out\b/i.test(text);
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^reach out to ${escapedName}\\b`, "i").test(text);
}

function compactSuggestionText(text = "", name = "") {
  if (!name) return text;

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`\\bto\\s+${escapedName}\\b`, "i"), "to them")
    .replace(new RegExp(`\\bfor\\s+${escapedName}\\b`, "i"), "for them")
    .replace(new RegExp(`\\b${escapedName}'s\\b`, "i"), "their")
    .replace(new RegExp(`\\b${escapedName}\\b`, "i"), "them")
    .replace(/\s+/g, " ")
    .trim();
}
