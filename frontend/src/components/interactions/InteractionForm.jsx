import { useEffect, useState } from "react";

import Card from "../ui/Card";
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
    duration_minutes: "",
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
      duration_minutes: initialValue.duration_minutes || "",
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
      const participantIds = personId
        ? [personId, ...current.participant_ids.filter((id) => id !== personId)]
        : current.participant_ids;
      return { ...current, person: value, participant_ids: participantIds };
    });
  }

  function toggleParticipant(personId) {
    setForm((current) => {
      const primaryId = current.person ? Number(current.person) : null;
      if (personId === primaryId) return current;
      const selected = current.participant_ids.includes(personId);
      return {
        ...current,
        participant_ids: selected
          ? current.participant_ids.filter((id) => id !== personId)
          : [...current.participant_ids, personId]
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const primaryId = Number(form.person);
    const participantIds = [primaryId, ...form.participant_ids.filter((id) => id !== primaryId)];
    onSubmit({
      ...form,
      person: primaryId,
      participant_ids: participantIds,
      interaction_date: toIsoFromLocal(form.interaction_date),
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      tag_names: form.tag_names.split(",").map((tag) => tag.trim()).filter(Boolean)
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Person</span>
          <select
            required
            value={form.person}
            onChange={(event) => updatePrimaryPerson(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 text-base outline-none focus:border-leaf-500"
          >
            <option value="">Choose someone</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        {people.length ? (
          <div>
            <span className="text-sm font-semibold text-stone-700">People there</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {people.map((person) => {
                const personId = Number(person.id);
                const active = form.participant_ids.includes(personId);
                const isPrimary = Number(form.person) === personId;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => toggleParticipant(personId)}
                    className={`min-h-9 rounded-full border px-3 text-sm font-semibold transition ${
                      active
                        ? "border-leaf-500 bg-leaf-100 text-leaf-700"
                        : "border-stone-200 bg-white text-stone-600"
                    }`}
                  >
                    {person.name}
                    {isPrimary ? " (main)" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
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
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Type</span>
            <select
              value={form.interaction_type}
              onChange={(event) => update("interaction_type", event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
            >
              {interactionTypes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Mood</span>
            <select
              value={form.mood}
              onChange={(event) => update("mood", event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 capitalize outline-none focus:border-leaf-500"
            >
              {moods.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Date</span>
            <input
              type="datetime-local"
              value={form.interaction_date}
              onChange={(event) => update("interaction_date", event.target.value)}
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-leaf-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Minutes</span>
            <input
              type="number"
              min="0"
              value={form.duration_minutes}
              onChange={(event) => update("duration_minutes", event.target.value)}
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
