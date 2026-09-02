import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import VivaCases from "./pages/VivaCases";
import Examiners from "./pages/Examiners";
import Schedule from "./pages/Schedule";
import PanelResponses from "./pages/PanelResponses";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <Routes>

      {/* ADMIN APPLICATION */}
      <Route element={<MainLayout />}>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/students"
          element={<Students />}
        />

        <Route
          path="/examiners"
          element={<Examiners />}
        />

        <Route
          path="/vivacases"
          element={<VivaCases />}
        />

        <Route
          path="/schedule"
          element={<Schedule />}
        />

        {/* ADMIN PANEL RESPONSES */}
        <Route
          path="/panel-responses"
          element={<PanelResponses />}
        />

        <Route
  path="/reports"
  element={<Reports />}
/>

      </Route>

    </Routes>
  );
}
