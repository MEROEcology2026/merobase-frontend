import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { SampleFormProvider } from "./context/SampleFormContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SearchSample from "./pages/SearchSample";
import EditSample from "./pages/EditSample";
import SampleDetails from "./pages/SampleDetails";

import AddSampleWizard from "./pages/addsample/AddSampleWizard";
import Step1_Metadata from "./pages/addsample/Step1_Metadata";
import Step2_Morphology from "./pages/addsample/Step2_Morphology";
import Step3A_PrimaryIsolated from "./pages/addsample/Step3A_PrimaryIsolated";
import Step3B_IsolatedMorphology from "./pages/addsample/Step3B_IsolatedMorphology";
import Step3C_Misc from "./pages/addsample/Step3C_Misc";
import Step4_Molecular from "./pages/addsample/Step4_Molecular";
import Step5_Publication from "./pages/addsample/Step5_Publication";
import Step6_ReviewSubmit from "./pages/addsample/Step6_ReviewSubmit";

export default function App() {
  return (
    <Router>
      <SampleFormProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/searchsample" element={
            <ProtectedRoute><SearchSample /></ProtectedRoute>
          } />

          <Route path="/editsample" element={
            <ProtectedRoute><EditSample /></ProtectedRoute>
          } />

          <Route path="/sampledetails/:id" element={
            <ProtectedRoute><SampleDetails /></ProtectedRoute>
          } />

          {/* Wizard */}
          <Route path="/add" element={
            <ProtectedRoute><AddSampleWizard /></ProtectedRoute>
          }>
            <Route index element={<Navigate to="step1" replace />} />
            <Route path="step1" element={<Step1_Metadata />} />
            <Route path="step2" element={<Step2_Morphology />} />
            <Route path="step3a" element={<Step3A_PrimaryIsolated />} />
            <Route path="step3b" element={<Step3B_IsolatedMorphology />} />
            <Route path="step3c" element={<Step3C_Misc />} />
            <Route path="step4" element={<Step4_Molecular />} />
            <Route path="step5" element={<Step5_Publication />} />
            <Route path="review" element={<Step6_ReviewSubmit />} />
          </Route>

          {/* Redirects */}
          <Route path="/addsample" element={<Navigate to="/add/step1" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SampleFormProvider>
    </Router>
  );
}