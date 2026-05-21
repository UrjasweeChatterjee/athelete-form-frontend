// ─────────────────────────────────────────────────────────────
// App.jsx  –  Root component with MUI ThemeProvider + Router
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

// Pages
import StudentRegister  from './pages/StudentRegister.jsx';
import StudentLogin     from './pages/StudentLogin.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import Success          from './pages/Success.jsx';
import CoachLogin       from './pages/CoachLogin.jsx';
import CoachDashboard   from './pages/CoachDashboard.jsx';
import StudentProfile   from './pages/StudentProfile.jsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalizes browser defaults */}
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/student/login" replace />} />

          {/* Student routes */}
          <Route path="/student/register"  element={<StudentRegister />} />
          <Route path="/student/login"     element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/success"           element={<Success />} />

          {/* Coach routes */}
          <Route path="/coach/login"       element={<CoachLogin />} />
          <Route path="/coach/dashboard"   element={<CoachDashboard />} />
          <Route path="/coach/student/:id" element={<StudentProfile />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
