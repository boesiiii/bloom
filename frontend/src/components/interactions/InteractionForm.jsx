import { useEffect, useState } from "react";

import Card from "../ui/Card";
import SearchableSelect from "../ui/SearchableSelect";
import { formatInputDateTime, toIsoFromLocal } from "../../utils/format";

const interactionTypes = [
  ["in_person", "In person"],
  ["call", "Call"],
  ["text", "Text"],
  ["video_call", "Video call"],
  ["event", "Event"],
  ["gift", "Gift"],
  ["other", "Other"]
];

const moods = ["positive", "neutral", "negative", "stressed", "happy", "sad", "anxious"];

export default function InteractionForm({ people = [], initialValue, defaultPersonId, onSubmit, submitting = false }) {
  const [form, setForm] = useState(() => ({
    person: defaultPersonId || "",
    participant_ids: defaultPersonId ? [Number(defaultPersonId)] : [],
    interaction_type: "text",
    title: "",
    body: "",
    mood: "positive",
    interaction_date: formatInputDateTime(),
    was_meaningful: true,
    follow_up_needed: false,
    tag_names: ""
  }));

  useEffect(() => {
    if (!initialValue) return;
    const primaryPerson = initialValue.person || initialValue.person_detail?.id || defaultPersonId || "";
    const participantIds = initialValue.participant_ids?.length
      ? initialValue.participant_ids.map(Number)
      : primaryPerson
        ? [Number(primaryPerson)]
        : [];
    setForm({
      person: primaryPerson,
      participant_ids: participantIds,
      interaction_type: initialValue.interaction_type || "text",
      title: initialValue.title || "",
      body: initialValue.body || "",
      mood: initialValue.mood || "positive",
      interaction_date: formatInputDateTime(initialValue.interaction_date),
      was_meaningful: Boolean(initialValue.was_meaningful),
      follow_up_needed: Boolean(initialValue.follow_up_needed),
      tag_names: initialValue.tags?.map((tag) => tag.name).join(", ") || ""
    });
  }, [initialValue, defaultPersonId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePrimaryPerson(value) {
    const personId = value ? Number(value) : "";
    setForm((current) => {
      return { ...current, person: value, participant_ids: personId ? [personId] : [] };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const primaryId = Number(form.person);
    onSubmit({
      ...form,
      person: primaryId,
      participant_ids: [primaryId],
      interaction_date: toIsoFromLocal(form.interaction_date),
      duration_minutes: initialValue?.duration_minutes ?? null,
      tag_names: form.tag_names.split(",").map((tag) => tag.trim()).filter(Boolean)
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="space-y-4">
        <SearchableSelect
          label="Person"
          required
          value={form.person}
          onChange={updatePrimaryPerson}
          placeholder="Choose someone"
          options={people.map((person) => ({ value: String(person.id), label: person.name }))}
        />
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Quick title</span>
          <input
            required
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Coffee, call, sent a message"
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 text-base outline-none focus:border-leaf-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">What should future-you remember?</span>
          <textarea
            value={form.body}
            onChange={(event) => update("body", event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-3 text-base outline-none focus:border-leaf-500"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <SearchableSelect
            label="Type"
            value={form.interaction_type}
            onChange={(value) => update("interaction_type", value)}
            options={interactionTypes.map(([value, label]) => ({ value, label }))}
          />
          <SearchableSelect
            label="Mood"
            value={form.mood}
            onChange={(value) => update("mood", value)}
            options={moods.map((mood) => ({ value: mood, label: titleLabel(mood) }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Date</span>
            <input
              type="datetime-local"
              value={form.interaction_date}
              onChange={(event) => update("interaction_date", event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Tags</span>
          <input
            value={form.tag_names}
            onChange={(event) => update("tag_names", event.target.value)}
            placeholder="birthday, work, family"
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
          />
        </label>
        <div className="grid grid-cols-1 gap-3">
          <label className="flex min-h-12 items-center justify-between rounded-lg border border-stone-200 bg-white px-3">
            <span className="font-medium text-stone-700">Meaningful interaction</span>
            <input
              type="checkbox"
              checked={form.was_meaningful}
              onChange={(event) => update("was_meaningful", event.target.checked)}
              className="h-5 w-5 accent-leaf-700"
            />
          </label>
          <label className="flex min-h-12 items-center justify-between rounded-lg border border-stone-200 bg-white px-3">
            <span className="font-medium text-stone-700">Follow-up needed</span>
            <input
              type="checkbox"
              checked={form.follow_up_needed}
              onChange={(event) => update("follow_up_needed", event.target.checked)}
              className="h-5 w-5 accent-leaf-700"
            />
          </label>
        </div>
      </Card>
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 w-full rounded-lg bg-leaf-700 px-4 font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Saving..." : "Save interaction"}
      </button>
    </form>
  );
}

function titleLabel(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
