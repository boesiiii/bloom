import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { api } from "../../api/client";
import Card from "../ui/Card";
import SearchableSelect from "../ui/SearchableSelect";
import { useToast } from "../ui/ToastProvider";

const categoryNames = {
  hobby: "Hobbies",
  like: "Likes",
  dislike: "Dislikes",
  food: "Food",
  trait: "Traits",
  gift_idea: "Gift ideas",
  important_date: "Important dates",
  topic: "Topics",
  habit: "Habits",
  preference: "Preferences",
  allergy: "Allergies",
  other: "Other"
};

const categoryOptions = [
  ["hobby", "Hobby"],
  ["like", "Like"],
  ["dislike", "Dislike"],
  ["food", "Food"],
  ["trait", "Trait"],
  ["gift_idea", "Gift idea"],
  ["important_date", "Important date"],
  ["topic", "Topic"],
  ["habit", "Habit"],
  ["preference", "Preference"],
  ["allergy", "Allergy"],
  ["other", "Other"]
].map(([value, label]) => ({ value, label }));

export default function ProfileDetailsSection({ person }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const details = person.profile_details || [];
  const groupedDetails = groupDetails(details);
  const [editMode, setEditMode] = useState(false);
  const [draftRows, setDraftRows] = useState([]);

  function refreshPerson() {
    queryClient.invalidateQueries({ queryKey: ["person", String(person.id)] });
    queryClient.invalidateQueries({ queryKey: ["people"] });
    queryClient.invalidateQueries({ queryKey: ["home"] });
    queryClient.invalidateQueries({ queryKey: ["garden"] });
  }

  const saveDetails = useMutation({
    mutationFn: async (rows) => {
      const cleanRows = rows
        .map((row) => ({ ...row, value: row.value.trim() }))
        .filter((row) => row.value);
      const keptIds = new Set(cleanRows.filter((row) => row.id).map((row) => row.id));
      const deletedDetails = details.filter((detail) => !keptIds.has(detail.id));
      const changedRows = cleanRows.filter((row) => {
        if (!row.id) return true;
        const original = details.find((detail) => detail.id === row.id);
        return original && (original.category !== row.category || original.value !== row.value);
      });

      await Promise.all([
        ...deletedDetails.map((detail) => api.deleteProfileDetail(detail.id)),
        ...changedRows.map((row) =>
          row.id
            ? api.updateProfileDetail(row.id, { category: row.category, value: row.value })
            : api.addProfileDetail(person.id, { category: row.category, value: row.value })
        )
      ]);
    },
    onSuccess: () => {
      setEditMode(false);
      setDraftRows([]);
      refreshPerson();
      toast.success("Profile details saved.");
    }
  });

  function startEditing() {
    setDraftRows(
      details.length
        ? details.map((detail) => ({
            key: `detail-${detail.id}`,
            id: detail.id,
            category: detail.category,
            value: detail.value
          }))
        : [emptyDraftRow()]
    );
    setEditMode(true);
  }

  function cancelEditing() {
    setEditMode(false);
    setDraftRows([]);
  }

  function updateDraftRow(key, field, value) {
    setDraftRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  }

  function addDraftRow() {
    setDraftRows((current) => [...current, emptyDraftRow()]);
  }

  function removeDraftRow(key) {
    setDraftRows((current) => current.filter((row) => row.key !== key));
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-stone-950">Profile details</h2>
        {editMode ? (
          <button
            type="button"
            onClick={cancelEditing}
            disabled={saveDetails.isPending}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-stone-700 shadow-sm disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-leaf-100 px-3 text-sm font-semibold text-leaf-700"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
        )}
      </div>

      <Card className="space-y-4">
        {person.birthday ? (
          <div>
            <p className="text-xs font-semibold uppercase text-stone-400">Birthday</p>
            <p className="mt-1 text-sm text-stone-700">{person.birthday}</p>
          </div>
        ) : null}

        {editMode ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              saveDetails.mutate(draftRows);
            }}
          >
            {draftRows.map((row, index) => (
              <EditableDetailRow
                key={row.key}
                row={row}
                index={index}
                canRemove={draftRows.length > 1 || Boolean(row.id)}
                disabled={saveDetails.isPending}
                onChange={updateDraftRow}
                onRemove={removeDraftRow}
              />
            ))}

            <button
              type="button"
              onClick={addDraftRow}
              disabled={saveDetails.isPending}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-leaf-100 bg-leaf-50 px-3 text-sm font-semibold text-leaf-700 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add another entry
            </button>

            <button
              type="submit"
              disabled={saveDetails.isPending}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-leaf-700 px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {saveDetails.isPending ? "Saving..." : "Save profile details"}
            </button>
          </form>
        ) : groupedDetails.length ? (
          groupedDetails.map(([category, values]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase text-stone-400">{categoryNames[category] || category}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map((detail) => (
                  <div key={detail.id} className="rounded-full bg-stone-50 px-3 py-1.5">
                    <p className="text-sm text-stone-700">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-stone-600">No details yet. Tap edit to add a memory item.</p>
        )}

        {saveDetails.error ? (
          <p className="rounded-lg bg-clay-100 p-3 text-sm font-semibold text-clay-500">{saveDetails.error.message}</p>
        ) : null}
      </Card>
    </section>
  );
}

function EditableDetailRow({ row, index, canRemove, disabled, onChange, onRemove }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase text-stone-400">Entry {index + 1}</p>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(row.key)}
            disabled={disabled}
            className="grid h-8 w-8 place-items-center rounded-md text-clay-500 hover:bg-clay-100 disabled:opacity-50"
            aria-label="Remove detail entry"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3">
        <SearchableSelect
          label="Category"
          value={row.category}
          onChange={(value) => onChange(row.key, "category", value)}
          options={categoryOptions}
        />
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Detail</span>
          <input
            value={row.value}
            onChange={(event) => onChange(row.key, "value", event.target.value)}
            placeholder="sushi, yoga, quiet cafes"
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 text-base outline-none focus:border-leaf-500"
          />
        </label>
      </div>
    </div>
  );
}

function emptyDraftRow() {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    category: "like",
    value: ""
  };
}

function groupDetails(details) {
  const grouped = new Map();
  details.forEach((detail) => {
    const values = grouped.get(detail.category) || [];
    values.push(detail);
    grouped.set(detail.category, values);
  });
  return Array.from(grouped.entries());
}
