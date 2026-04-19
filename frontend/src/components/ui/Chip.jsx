export default function Chip({ children, active = false, className = "", ...props }) {
  const base = active
    ? "border-leaf-500 bg-leaf-100 text-leaf-700"
    : "border-stone-200 bg-white text-stone-600";
  return (
    <button
      type="button"
      className={`inline-flex min-h-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
