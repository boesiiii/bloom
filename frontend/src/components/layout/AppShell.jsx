import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getToken } from "../../api/client";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function AppShell() {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen pb-28">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
