// ─────────────────────────────────────────────────────────────
// App.jsx  –  Root component with ThemeContext + Router
// ─────────────────────────────────────────────────────────────
import axios from 'axios';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeContextProvider } from './context/ThemeContext';

// Dynamically configure Axios Base URL for hosted production environments
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Pages
import AtheleteDashboard    from './pages/AtheleteDashboard.jsx';
import AtheleteLogin        from './pages/AtheleteLogin.jsx';
import AtheleteProfile      from './pages/AtheleteProfile.jsx';
import AtheleteRegister     from './pages/AtheleteRegister.jsx';
import CoachDashboard       from './pages/CoachDashboard.jsx';
import CoachLogin           from './pages/CoachLogin.jsx';
import Landing              from './pages/Landing';
import Success              from './pages/Success.jsx';
// ── Module 6 & 7 pages ────────────────────────────────────────
import Achievements         from './pages/Achievements.jsx';
import ResultsCertificates  from './pages/ResultsCertificates.jsx';
import NotificationLogs     from './pages/NotificationLogs.jsx';
import VerifyCertificate    from './pages/VerifyCertificate.jsx';
// ── Fee Payment Module pages ──────────────────────────────────
import StudentPayments      from './pages/StudentPayments.jsx';
import PaymentTracking      from './pages/PaymentTracking.jsx';

function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Landing />} />

          {/* Athlete routes */}
          <Route path="/athelete/register"      element={<AtheleteRegister />} />
          <Route path="/athelete/login"         element={<AtheleteLogin />} />
          <Route path="/athelete/dashboard"     element={<AtheleteDashboard />} />
          <Route path="/athelete/achievements"  element={<Achievements />} />
          <Route path="/athelete/payments"      element={<StudentPayments />} />
          <Route path="/verify-certificate/:id" element={<VerifyCertificate />} />
          <Route path="/success"                element={<Success />} />

          {/* Coach / Admin routes */}
          <Route path="/coach/login"                element={<CoachLogin />} />
          <Route path="/coach/dashboard"            element={<CoachDashboard />} />
          <Route path="/coach/athelete/:id"         element={<AtheleteProfile />} />
          <Route path="/coach/results-certificates" element={<ResultsCertificates />} />
          <Route path="/coach/notification-logs"    element={<NotificationLogs />} />
          <Route path="/coach/payments"             element={<PaymentTracking />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;

