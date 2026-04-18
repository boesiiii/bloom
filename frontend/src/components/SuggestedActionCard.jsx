import { CheckCircle2, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import Card from "./ui/Card";

export default function SuggestedActionCard({ action }) {
  const person = action.person || action.reminder?.person_detail;
  const to = action.type === "complete_reminder" ? "/reminders" : `/interactions/new?person=${person?.id || ""}`;
  const Icon = action.type === "complete_reminder" ? CheckCircle2 : MessageCircle;

  return (
    <Card as={Link} to={to} className="block">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-water-100 text-water-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-semibold text-stone-950">{person?.name || "Action"}</h3>
          <p className="mt-1 text-sm leading-6 text-stone-600">{action.text}</p>
        </div>
      </div>
    </Card>
  );
}
