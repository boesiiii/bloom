import { BellPlus, BookOpenText, Flower2, Home, MessageCirclePlus, Plus, Sprout, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const leftItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/people", label: "People", icon: UsersRound }
];

const rightItems = [
  { to: "/garden", label: "Garden", icon: Flower2 },
  { to: "/journal", label: "Journal", icon: BookOpenText }
];

const actions = [
  { to: "/interactions/new", label: "Log interaction", icon: MessageCirclePlus },
  { to: "/people/new", label: "Add people", icon: Sprout },
  { to: "/reminders/new", label: "Add reminder", icon: BellPlus }
];

export default function BottomNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      {open ? <button type="button" aria-label="Close add menu" className="fixed inset-0 z-30 bg-stone-950/10" onClick={() => setOpen(false)} /> : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        {open ? (
          <div className="absolute inset-x-0 bottom-[5.25rem] px-4">
            <div className="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-lg border border-stone-200 bg-white p-2 shadow-xl shadow-stone-900/12">
              {actions.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md bg-leaf-50 px-2 text-center text-[11px] font-semibold text-stone-800 transition hover:bg-leaf-100"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-leaf-700 shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mx-auto grid max-w-md grid-cols-[1fr_1fr_4.5rem_1fr_1fr] items-end">
          {leftItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          <div className="flex min-h-14 items-center justify-center">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              aria-label={open ? "Close add menu" : "Open add menu"}
              title={open ? "Close" : "Add"}
              className="grid h-14 w-14 -translate-y-4 place-items-center rounded-full bg-leaf-700 text-white shadow-lg shadow-leaf-700/25 transition hover:bg-leaf-500"
            >
              {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Plus className="h-7 w-7" aria-hidden="true" />}
            </button>
          </div>

          {rightItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium ${
          isActive ? "text-leaf-700" : "text-stone-500"
        }`
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}
