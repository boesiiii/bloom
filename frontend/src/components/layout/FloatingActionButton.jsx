import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function FloatingActionButton({ to = "/interactions/new", label = "Add interaction" }) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="fixed bottom-24 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-leaf-700 text-white shadow-lg shadow-leaf-700/20 transition hover:bg-leaf-500"
    >
      <Plus className="h-7 w-7" aria-hidden="true" />
    </Link>
  );
}
