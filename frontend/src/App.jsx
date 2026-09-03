import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import VivaCases from "./pages/VivaCases";
import Examiners from "./pages/Examiners";
import Schedule from "./pages/Schedule";
import Reports from "./pages/Reports";
import Acknowledgement from "./pages/Acknowledgement";
import PanelResponse from "./pages/PanelResponse";
import ReportSubmission from "./pages/ReportSubmission";
import AnnotatedThesis from "./pages/AnnotatedThesis";

export default function App() {
  return (
    <Routes>

      <Route
  path="/report-submission"
  element={<ReportSubmission />}
/>

      {/* ==================================================
          EXTERNAL EXAMINER RESPONSE
          ================================================== */}

      <Route
        path="/panel-response"
        element={<PanelResponse />}
      />


      {/* ==================================================
          ADMIN APPLICATION
          ================================================== */}

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


        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
  path="/annotated-thesis"
  element={<AnnotatedThesis />}
/>

        <Route
          path="/acknowledgement"
          element={<Acknowledgement />}
        />

      </Route>

    </Routes>
  );
}
