import { LogOut, Settings, Sprout } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { api, setToken } from "../../api/client";

export default function TopBar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Local logout still matters if the backend is offline.
    }
    setToken(null);
    queryClient.clear();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f6f7ef]/92 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link to="/" className="flex min-h-10 items-center gap-2 font-semibold text-stone-900">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-100 text-leaf-700">
            <Sprout className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>Second Brain</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/settings"
            className="grid h-10 w-10 place-items-center rounded-lg text-stone-600 hover:bg-white"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-10 w-10 place-items-center rounded-lg text-stone-600 hover:bg-white"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
