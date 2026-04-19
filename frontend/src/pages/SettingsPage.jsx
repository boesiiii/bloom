import { Bell, EyeOff, HeartHandshake } from "lucide-react";
import { useState } from "react";

import Card from "../components/ui/Card";

export default function SettingsPage() {
  const [gentleMode, setGentleMode] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [notifications, setNotifications] = useState(false);

  return (
    <div className="space-y-4">
      <section>
        <p className="text-sm font-semibold text-leaf-700">Settings</p>
        <h1 className="text-2xl font-bold text-stone-950">Make the garden feel right</h1>
      </section>

      <Card className="space-y-3">
        <SettingRow
          icon={HeartHandshake}
          title="Gentle mode"
          body="Use encouraging copy and softer reminders."
          checked={gentleMode}
          onChange={setGentleMode}
        />
        <SettingRow
          icon={EyeOff}
          title="Show points"
          body="Keep numbers visible alongside plants."
          checked={showPoints}
          onChange={setShowPoints}
        />
        <SettingRow
          icon={Bell}
          title="Notifications"
          body="Prototype toggle for future push reminders."
          checked={notifications}
          onChange={setNotifications}
        />
      </Card>
    </div>
  );
}

function SettingRow({ icon: Icon, title, body, checked, onChange }) {
  return (
    <label className="flex min-h-16 items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-water-100 text-water-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-stone-950">{title}</span>
        <span className="block text-sm leading-5 text-stone-500">{body}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-leaf-700" />
    </label>
  );
}
