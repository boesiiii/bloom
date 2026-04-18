import Card from "../ui/Card";

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

export default function ProfileDetailsSection({ person }) {
  const grouped = person.profile_details_grouped || {};
  const entries = Object.entries(grouped).filter(([, values]) => values.length);

  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-stone-950">Profile details</h2>
      <Card className="space-y-3">
        {person.birthday ? (
          <div>
            <p className="text-xs font-semibold uppercase text-stone-400">Birthday</p>
            <p className="mt-1 text-sm text-stone-700">{person.birthday}</p>
          </div>
        ) : null}
        {entries.length ? (
          entries.map(([category, values]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase text-stone-400">{categoryNames[category] || category}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map((value) => (
                  <span key={`${category}-${value}`} className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-stone-600">No details yet. Add one after the next interaction.</p>
        )}
      </Card>
    </section>
  );
}
