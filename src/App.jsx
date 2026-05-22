// ─────────────────────────────────────────────────────────────
// App.jsx  –  Root component with ThemeContext + Router
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContextProvider } from './context/ThemeContext';

// Pages
import Landing from './pages/Landing';
import AtheleteRegister from './pages/AtheleteRegister.jsx';
import AtheleteLogin from './pages/AtheleteLogin.jsx';
import AtheleteDashboard from './pages/AtheleteDashboard.jsx';
import Success from './pages/Success.jsx';
import CoachLogin from './pages/CoachLogin.jsx';
import CoachDashboard from './pages/CoachDashboard.jsx';
import AtheleteProfile from './pages/AtheleteProfile.jsx';

function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Landing />} />

          {/* Athlete routes */}
          <Route path="/athelete/register"  element={<AtheleteRegister />} />
          <Route path="/athelete/login"     element={<AtheleteLogin />} />
          <Route path="/athelete/dashboard" element={<AtheleteDashboard />} />
          <Route path="/success"            element={<Success />} />

          {/* Coach / Admin routes */}
          <Route path="/coach/login"          element={<CoachLogin />} />
          <Route path="/coach/dashboard"      element={<CoachDashboard />} />
          <Route path="/coach/athelete/:id"   element={<AtheleteProfile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;
