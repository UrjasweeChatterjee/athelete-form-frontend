// ─────────────────────────────────────────────────────────────
// pages/StudentDashboard.jsx  –  Student's personal dashboard
// Shows name, sports applied, and application status.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Paper, Chip, Grid,
  AppBar, Toolbar, Button, Divider, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SportsIcon from '@mui/icons-material/Sports';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// ── Status chip colors ────────────────────────────────────────
const STATUS_COLOR = {
  Pending:  'warning',
  Approved: 'success',
  Rejected: 'error',
};

export default function StudentDashboard() {
  const navigate  = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // Load student from localStorage session
    const stored = localStorage.getItem('student');
    if (!stored) {
      navigate('/student/login');
      return;
    }
    setStudent(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('student');
    navigate('/student/login');
  };

  const parseSports = (raw) => {
    try { return JSON.parse(raw); }
    catch { return raw ? [raw] : []; }
  };

  if (!student) return null;

  const sports = parseSports(student.sports_applied);

  // ── Info row component ──────────────────────────────────
  const InfoRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, fontWeight: 500 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* AppBar */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🏅 Sports Club — Student Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Welcome header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Welcome, {student.full_name} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's a summary of your athlete registration application.
          </Typography>
        </Box>

        {/* Application Status Banner */}
        <Paper elevation={0} sx={{
          p: 2.5, mb: 3,
          border: '1px solid #e0e6ed',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <CheckCircleIcon color={STATUS_COLOR[student.status] || 'warning'} sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Application Status</Typography>
            <Chip
              label={student.status || 'Pending'}
              color={STATUS_COLOR[student.status] || 'warning'}
              size="medium"
              sx={{ fontWeight: 700, fontSize: '1rem', mt: 0.5 }}
            />
          </Box>
        </Paper>

        {student.status === 'Rejected' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Your application was rejected. Please contact your coach for further information.
          </Alert>
        )}
        {student.status === 'Approved' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            🎉 Congratulations! Your application has been approved. Welcome to the club!
          </Alert>
        )}

        <Grid container spacing={2}>

          {/* Personal Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e6ed', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Personal Details</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <InfoRow label="Full Name"   value={student.full_name} />
              <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : ''} />
              <InfoRow label="Age"         value={student.age} />
              <InfoRow label="Gender"      value={student.gender} />
              <InfoRow label="Mobile"      value={student.mobile} />
              <InfoRow label="Email"       value={student.email} />
            </Paper>
          </Grid>

          {/* Sports Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e6ed', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SportsIcon color="secondary" />
                <Typography variant="h6">Sports & Competition</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Sports Applied For:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {sports.map(s => (
                  <Chip key={s} label={s} variant="outlined" color="secondary" size="small" />
                ))}
              </Box>
              <InfoRow label="Competition"  value={student.competition_name} />
              <InfoRow label="Age Group"    value={student.age_group} />
              <InfoRow label="Club"         value={student.club_name} />
              <InfoRow label="State Assoc." value={student.state_association} />
            </Paper>
          </Grid>

        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Registered on:{' '}
            {student.created_at ? new Date(student.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            }) : '—'}
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}
