// ─────────────────────────────────────────────────────────────
// pages/AtheleteDashboard.jsx  –  Ticket card style (dark+lime)
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Chip, Grid,
  Alert, useTheme, alpha, Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { STATUS_COLORS } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';

// Use shared status colors from ThemeContext
const STATUS_CONFIG = {
  ...STATUS_COLORS,
  Pending: { ...STATUS_COLORS.Pending, icon: '⏳', label: 'PENDING' },
  Approved: { ...STATUS_COLORS.Approved, icon: '✅', label: 'APPROVED' },
  Rejected: { ...STATUS_COLORS.Rejected, icon: '❌', label: 'REJECTED' },
};

const SPORT_EMOJIS = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Athletics: '🏃',
  Swimming: '🏊', Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓',
};

export default function AtheleteDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [student, setStudent] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (!stored) { navigate('/athelete/login'); return; }
    setStudent(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem('student'); navigate('/'); };
  const parseSports = (raw) => { try { return JSON.parse(raw); } catch { return raw ? [raw] : []; } };

  if (!student) return null;

  const sports = parseSports(student.sports_applied);
  const statusCfg = STATUS_CONFIG[student.status] || STATUS_CONFIG.Pending;
  const registered = student.created_at
    ? new Date(student.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const cardBg = isDark ? '#111827' : '#FFFFFF';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar title="My Dashboard" userName={student.full_name} onLogout={handleLogout} />

      <Container maxWidth="md" sx={{ py: 4 }}>

        {/* Section label */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            ATHLETE PORTAL
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
            YOUR REGISTRATION TICKET
          </Typography>
        </Box>

        {/* ── Ticket Card ─────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: cardBg,
            borderRadius: '24px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 24px 80px rgba(0,0,0,0.6)'
              : '0 8px 40px rgba(0,0,0,0.08)',
            animation: 'fadeInUp 0.6s ease both',
          }}
        >
          {/* ── Status accent strip ─────────────────────────── */}
          <Box sx={{ height: 3, bgcolor: statusCfg.color }} />

          {/* ── Ticket header ───────────────────────────────── */}
          <Box
            sx={{
              px: { xs: 3, sm: 4 },
              pt: 4,
              pb: 3.5,
              bgcolor: isDark ? '#111' : '#FAFAFA',
              borderBottom: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background pattern dots */}
            {[...Array(6)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  right: 20 + i * 60,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6, height: 6,
                  borderRadius: '50%',
                  bgcolor: alpha(statusCfg.color, 0.15 - i * 0.02),
                  display: { xs: 'none', sm: 'block' },
                }}
              />
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.15em' }}>
                  ATHLETE REGISTRATION
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mt: 0.25, letterSpacing: '-0.02em' }}>
                  {student.full_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {student.email}
                </Typography>
              </Box>

              {/* Status badge */}
              <Box
                sx={{
                  px: 2, py: 1.5,
                  borderRadius: '14px',
                  bgcolor: statusCfg.bg,
                  border: `1.5px solid ${statusCfg.border}`,
                  textAlign: 'center',
                  minWidth: 100,
                }}
              >
                <Typography sx={{ fontSize: 28, lineHeight: 1 }}>{statusCfg.icon}</Typography>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: statusCfg.color, letterSpacing: '0.1em', mt: 0.5 }}>
                  {statusCfg.label}
                </Typography>
              </Box>
            </Box>

            {/* Sport chips */}
            {sports.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5 }}>
                {sports.map(s => (
                  <Box
                    key={s}
                    sx={{
                      px: 1.25, py: 0.35,
                      borderRadius: '8px',
                      bgcolor: alpha(statusCfg.color, 0.1),
                      border: `1px solid ${alpha(statusCfg.color, 0.25)}`,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: statusCfg.color }}>
                      {SPORT_EMOJIS[s] || '🏅'} {s}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* ── Ticket perforation ──────────────────────────── */}
          <Box sx={{ position: 'relative', height: 0 }}>
            <Box sx={{ position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: '50%', bgcolor: 'background.default', zIndex: 2 }} />
            <Box sx={{ position: 'absolute', right: -14, top: -14, width: 28, height: 28, borderRadius: '50%', bgcolor: 'background.default', zIndex: 2 }} />
          </Box>

          {/* ── Ticket body ─────────────────────────────────── */}
          <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3.5, pb: 3 }}>

            {/* Status alerts */}
            {student.status === 'Approved' && (
              <Alert severity="success" sx={{ mb: 3 }}>
                🎉 Congratulations! Your application has been approved. Welcome to the club!
              </Alert>
            )}
            {student.status === 'Rejected' && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Your application was rejected. Please contact your coach for more information.
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Personal */}
              <Grid item xs={12} sm={6}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.12em', display: 'block', mb: 2 }}>
                  PERSONAL INFO
                </Typography>
                {[
                  { icon: <CalendarTodayIcon sx={{ fontSize: 14 }} />, label: 'Date of Birth', value: `${student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '—'}${student.age ? ` · Age ${student.age}` : ''}` },
                  { icon: <PhoneIcon sx={{ fontSize: 14 }} />, label: 'Mobile', value: student.mobile || '—' },
                  { icon: <PeopleIcon sx={{ fontSize: 14 }} />, label: 'Gender', value: student.gender || '—' },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ color: 'text.secondary', mt: 0.3 }}>{icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>

              {/* Competition */}
              <Grid item xs={12} sm={6}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.12em', display: 'block', mb: 2 }}>
                  COMPETITION INFO
                </Typography>
                {[
                  { icon: <EmojiEventsIcon sx={{ fontSize: 14 }} />, label: 'Competition', value: student.competition_name || '—' },
                  { icon: <EmojiEventsIcon sx={{ fontSize: 14 }} />, label: 'Age Group', value: student.age_group || '—' },
                  { icon: <LocationOnIcon sx={{ fontSize: 14 }} />, label: 'Club / State', value: [student.club_name, student.state_association].filter(Boolean).join(' · ') || '—' },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ color: 'text.secondary', mt: 0.3 }}>{icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

            {/* Footer */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.6 }}>
                Registered on {registered}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.primary.main,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  px: 1.25, py: 0.4,
                  borderRadius: '6px',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                #{String(student.id || '').padStart(6, '0')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
