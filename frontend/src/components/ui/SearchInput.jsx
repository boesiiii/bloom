import { Search } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder = "Search", className = "" }) {
  return (
    <label className={`flex min-h-12 items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 text-stone-500 shadow-sm ${className}`}>
      <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-400"
      />
    </label>
  );
}
