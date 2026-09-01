import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import VivaCases from "./pages/VivaCases";
import Examiners from "./pages/Examiners";
import Schedule from "./pages/Schedule";
import PanelResponse from "./pages/PanelResponse";

export default function App() {
  return (
    <Routes>

      {/* =========================================
          PUBLIC PANEL RESPONSE PAGE
          ========================================= */}
      <Route
        path="/panel-response"
        element={<PanelResponse />}
      />

      {/* =========================================
          MAIN SYSTEM
          ========================================= */}
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
          path="/vivacases"
          element={<VivaCases />}
        />

        <Route
          path="/examiners"
          element={<Examiners />}
        />

        <Route
          path="/schedule"
          element={<Schedule />}
        />

      </Route>

    </Routes>
  );
}
