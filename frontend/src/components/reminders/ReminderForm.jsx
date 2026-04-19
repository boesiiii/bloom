import { useEffect, useState } from "react";

import Card from "../ui/Card";
import SearchableSelect from "../ui/SearchableSelect";
import { formatInputDateTime, toIsoFromLocal } from "../../utils/format";

const repeats = [
  ["none", "No repeat"],
  ["daily", "Daily"],
  ["weekly", "Weekly"],
  ["biweekly", "Bi-weekly"],
  ["monthly", "Monthly"],
  ["yearly", "Yearly"]
];

export default function ReminderForm({
  people = [],
  initialValue,
  defaultPersonId,
  defaultInteractionId,
  defaultText = "",
  onSubmit,
  submitting = false
}) {
  const [form, setForm] = useState({
    person: defaultPersonId || "",
    interaction: defaultInteractionId || "",
    text: defaultText,
    due_at: formatInputDateTime(),
    repeat: "none",
    status: "pending"
  });

  useEffect(() => {
    if (!initialValue) return;
    setForm({
      person: initialValue.person || initialValue.person_detail?.id || defaultPersonId || "",
      interaction: initialValue.interaction || defaultInteractionId || "",
      text: initialValue.text || "",
      due_at: formatInputDateTime(initialValue.due_at),
      repeat: initialValue.repeat || "none",
      status: initialValue.status || "pending"
    });
  }, [initialValue, defaultPersonId, defaultInteractionId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      person: Number(form.person),
      interaction: form.interaction ? Number(form.interaction) : null,
      due_at: toIsoFromLocal(form.due_at)
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="space-y-4">
        <SearchableSelect
          label="Person"
          required
          value={form.person}
          onChange={(value) => update("person", value)}
          placeholder="Choose someone"
          options={people.map((person) => ({ value: String(person.id), label: person.name }))}
        />
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Reminder</span>
          <textarea
            required
            value={form.text}
            onChange={(event) => update("text", event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-3 outline-none focus:border-leaf-500"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Due</span>
            <input
              type="datetime-local"
              value={form.due_at}
              onChange={(event) => update("due_at", event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
            />
          </label>
          <SearchableSelect
            label="Repeat"
            value={form.repeat}
            onChange={(value) => update("repeat", value)}
            options={repeats.map(([value, label]) => ({ value, label }))}
          />
        </div>
      </Card>
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 w-full rounded-lg bg-leaf-700 px-4 font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save reminder"}
      </button>
    </form>
  );
}
