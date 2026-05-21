// ─────────────────────────────────────────────────────────────
// App.jsx  –  Root component with ThemeContext + Router
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContextProvider } from './context/ThemeContext';

// Pages
import Landing         from './pages/Landing';
import StudentRegister from './pages/StudentRegister.jsx';
import StudentLogin    from './pages/StudentLogin.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import Success         from './pages/Success.jsx';
import CoachLogin      from './pages/CoachLogin.jsx';
import CoachDashboard  from './pages/CoachDashboard.jsx';
import StudentProfile  from './pages/StudentProfile.jsx';

function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/"                    element={<Landing />} />

          {/* Student routes */}
          <Route path="/student/register"  element={<StudentRegister />} />
          <Route path="/student/login"     element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/success"           element={<Success />} />

          {/* Coach / Admin routes */}
          <Route path="/coach/login"       element={<CoachLogin />} />
          <Route path="/coach/dashboard"   element={<CoachDashboard />} />
          <Route path="/coach/student/:id" element={<StudentProfile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;
