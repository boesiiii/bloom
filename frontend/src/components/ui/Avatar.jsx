import { initials } from "../../utils/format";

export default function Avatar({ person, size = "md" }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-9 w-9 text-sm" : "h-12 w-12 text-base";

  if (person?.avatar_url) {
    return (
      <img
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white`}
        src={person.avatar_url}
        alt=""
      />
    );
  }

  return (
    <div className={`${sizeClass} grid shrink-0 place-items-center rounded-full bg-water-100 font-semibold text-water-500 ring-2 ring-white`}>
      {initials(person?.name || person?.nickname)}
    </div>
  );
}
