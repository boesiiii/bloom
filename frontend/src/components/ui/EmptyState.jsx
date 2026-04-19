import { Sprout } from "lucide-react";

import Card from "./Card";

export default function EmptyState({ title, body, action }) {
  return (
    <Card className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-leaf-100 text-leaf-700">
        <Sprout className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        {body ? <p className="mt-1 text-sm leading-6 text-stone-600">{body}</p> : null}
      </div>
      {action}
    </Card>
  );
}
