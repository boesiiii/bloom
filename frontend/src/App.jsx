import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import GardenPage from "./pages/GardenPage";
import GardenShopPage from "./pages/GardenShopPage";
import HomePage from "./pages/HomePage";
import InteractionFormPage from "./pages/InteractionFormPage";
import JournalPage from "./pages/JournalPage";
import LoginPage from "./pages/LoginPage";
import PeoplePage from "./pages/PeoplePage";
import PersonDetailPage from "./pages/PersonDetailPage";
import PersonFormPage from "./pages/PersonFormPage";
import ReminderFormPage from "./pages/ReminderFormPage";
import RemindersPage from "./pages/RemindersPage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/people/new" element={<PersonFormPage />} />
        <Route path="/people/:id" element={<PersonDetailPage />} />
        <Route path="/people/:id/edit" element={<PersonFormPage />} />
        <Route path="/interactions/new" element={<InteractionFormPage />} />
        <Route path="/interactions/:id/edit" element={<InteractionFormPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/reminders/new" element={<ReminderFormPage />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/garden/shop" element={<GardenShopPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
