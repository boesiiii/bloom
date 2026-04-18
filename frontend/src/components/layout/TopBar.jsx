import { ArrowLeft, LogOut, Settings, Sprout } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { api, setToken } from "../../api/client";

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const showBack = !isBottomNavPage(location.pathname);

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

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackBackPath(location.pathname), { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#f6f7ef]/92 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-1.5">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-stone-700 hover:bg-white active:bg-leaf-100"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
          <Link to="/" className="flex min-h-10 min-w-0 items-center gap-2 font-semibold text-stone-900">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-100 text-leaf-700">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="truncate">Bloom</span>
          </Link>
        </div>
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

function fallbackBackPath(pathname) {
  if (pathname === "/people/new") return "/people";
  if (pathname.match(/^\/people\/[^/]+\/edit$/)) return pathname.replace(/\/edit$/, "");
  if (pathname.match(/^\/people\/[^/]+$/)) return "/people";
  if (pathname.startsWith("/interactions/")) return "/journal";
  if (pathname === "/reminders/new") return "/reminders";
  if (pathname === "/reminders") return "/";
  if (pathname === "/settings") return "/";
  if (pathname === "/garden") return "/";
  if (pathname === "/journal") return "/";
  if (pathname === "/people") return "/";
  return "/";
}

function isBottomNavPage(pathname) {
  return ["/", "/people", "/garden", "/journal"].includes(pathname);
}
