import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Choose one",
  required = false,
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));
  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function choose(option) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  return (
    <label ref={rootRef} className={`relative block ${className}`}>
      {label ? <span className="text-sm font-semibold text-stone-700">{label}</span> : null}
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
        <input
          required={required}
          value={open ? query : selected?.label || ""}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && open && visibleOptions[0]) {
              event.preventDefault();
              choose(visibleOptions[0]);
            }
            if (event.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
          }}
          placeholder={placeholder}
          className="min-h-12 w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-10 text-base outline-none focus:border-leaf-500"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        <button
          type="button"
          onClick={() => {
            setOpen((current) => !current);
            setQuery("");
          }}
          className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-md text-stone-500"
          aria-label={open ? "Close options" : "Open options"}
        >
          <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 shadow-xl shadow-stone-900/10">
          {visibleOptions.length ? (
            visibleOptions.map((option) => {
              const active = String(option.value) === String(value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => choose(option)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 text-left text-sm font-semibold ${
                    active ? "bg-leaf-100 text-leaf-700" : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {active ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-3 text-sm font-medium text-stone-500">No matches</p>
          )}
        </div>
      ) : null}
    </label>
  );
}
