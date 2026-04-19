import { useEffect, useState } from "react";

import Card from "../ui/Card";
import SearchableSelect from "../ui/SearchableSelect";

const relationshipTypes = [
  ["friend", "Friend"],
  ["family", "Family"],
  ["work", "Work"],
  ["partner", "Partner"],
  ["other", "Other"]
];

const frequencies = [
  ["daily", "Daily"],
  ["weekly", "Weekly"],
  ["biweekly", "Bi-weekly"],
  ["monthly", "Monthly"]
];

export default function PersonForm({ initialValue, onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    relationship_type: "friend",
    birthday: "",
    avatar_url: "",
    notes_summary: "",
    is_favorite: false,
    contact_frequency: "weekly"
  });

  useEffect(() => {
    if (!initialValue) return;
    setForm({
      name: initialValue.name || "",
      nickname: initialValue.nickname || "",
      relationship_type: initialValue.relationship_type || "friend",
      birthday: initialValue.birthday || "",
      avatar_url: initialValue.avatar_url || "",
      notes_summary: initialValue.notes_summary || "",
      is_favorite: Boolean(initialValue.is_favorite),
      contact_frequency: initialValue.contact_frequency || "weekly"
    });
  }, [initialValue]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...form, birthday: form.birthday || null });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Name</span>
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Name is enough to begin"
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 text-base outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Nickname</span>
          <input
            value={form.nickname}
            onChange={(event) => update("nickname", event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <SearchableSelect
            label="Relationship"
            value={form.relationship_type}
            onChange={(value) => update("relationship_type", value)}
            options={relationshipTypes.map(([value, label]) => ({ value, label }))}
          />
          <SearchableSelect
            label="Cadence"
            value={form.contact_frequency}
            onChange={(value) => update("contact_frequency", value)}
            options={frequencies.map(([value, label]) => ({ value, label }))}
          />
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Birthday</span>
          <input
            type="date"
            value={form.birthday}
            onChange={(event) => update("birthday", event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Avatar URL</span>
          <input
            type="url"
            value={form.avatar_url}
            onChange={(event) => update("avatar_url", event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Notes summary</span>
          <textarea
            value={form.notes_summary}
            onChange={(event) => update("notes_summary", event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-3 outline-none focus:border-leaf-500"
          />
        </label>
        <label className="flex min-h-12 items-center justify-between rounded-lg border border-stone-200 bg-white px-3">
          <span className="font-medium text-stone-700">Favorite</span>
          <input
            type="checkbox"
            checked={form.is_favorite}
            onChange={(event) => update("is_favorite", event.target.checked)}
            className="h-5 w-5 accent-leaf-700"
          />
        </label>
      </Card>
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 w-full rounded-lg bg-leaf-700 px-4 font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save person"}
      </button>
    </form>
  );
}
