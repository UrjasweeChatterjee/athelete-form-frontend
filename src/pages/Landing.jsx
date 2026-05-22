// ─────────────────────────────────────────────────────────────
// pages/Landing.jsx  –  Landing with sidebar + three action cards
// Professional: indigo + cyan palette, white light bg
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  Box, Typography, useTheme, alpha, Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddAltIcon       from '@mui/icons-material/PersonAddAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon              from '@mui/icons-material/Login';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  // Accent colors come from theme — no hardcoding
  const CARDS = [
    {
      id:       'register',
      label:    'REGISTER AS ATHLETE',
      sublabel: 'Start your athletic journey today',
      icon:     PersonAddAltIcon,
      path:     '/student/register',
      accent:   theme.palette.primary.main,
      tag:      'New Registration',
      stats:    [{ value: '8+', label: 'Sports' }, { value: '6', label: 'Steps' }, { value: 'Free', label: 'Entry' }],
    },
    {
      id:       'athlete-login',
      label:    'ATHLETE LOGIN',
      sublabel: 'Track your application & profile',
      icon:     LoginIcon,
      path:     '/student/login',
      accent:   '#22c55e',
      tag:      'Athlete Portal',
      stats:    [{ value: '24/7', label: 'Access' }, { value: 'Live', label: 'Status' }, { value: 'Free', label: 'Entry' }],
    },
    {
      id:       'admin',
      label:    'ADMIN LOGIN',
      sublabel: 'Manage applications & athletes',
      icon:     AdminPanelSettingsIcon,
      path:     '/coach/login',
      accent:   theme.palette.secondary.main,
      tag:      'Admin Portal',
      stats:    [{ value: '∞', label: 'Athletes' }, { value: 'CSV', label: 'Export' }, { value: 'Live', label: 'Data' }],
    },
  ];

  const bg     = isDark ? '#0A0A12' : '#FFFFFF';
  const cardBg = isDark ? '#111827' : '#FFFFFF';
  const sidebar = isDark ? '#0D1117' : '#F8FAFC';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: bg }}>

      {/* ── Left icon sidebar ──────────────────────────────────── */}
      <Box
        sx={{
          width: 64,
          bgcolor: sidebar,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2.5,
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Logo mark */}
        <Box
          sx={{
            width: 36, height: 36,
            borderRadius: '10px',
            bgcolor: theme.palette.primary.main,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.8rem',
            color: theme.palette.primary.contrastText,
            mb: 1,
          }}
        >
          SC
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {['🏆', '📊', '🔔'].map((icon, i) => (
            <Tooltip key={i} title={['Overview', 'Stats', 'Notifications'][i]} placement="right">
              <Box
                sx={{
                  width: 40, height: 40,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                  bgcolor: i === 0 ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                {icon}
              </Box>
            </Tooltip>
          ))}
        </Box>

        <ThemeToggle />
      </Box>

      {/* ── Main content ──────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4, py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? 'rgba(10,10,18,0.9)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.62rem' }}>
              SPORTS CLUB MANAGEMENT
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
              WELCOME
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </Typography>
        </Box>

        {/* Cards area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, md: 6 },
            gap: { xs: 3, md: 4 },
            flexWrap: 'wrap',
          }}
        >
          {CARDS.map((card) => (
            <Box
              key={card.id}
              onClick={() => navigate(card.path)}
              sx={{
                width: { xs: '100%', sm: 360 },
                bgcolor: cardBg,
                borderRadius: '24px',
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.32s cubic-bezier(0.4,0,0.2,1)',
                position: 'relative',
                boxShadow: isDark
                  ? 'none'
                  : '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.06)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  borderColor: alpha(card.accent, 0.45),
                  boxShadow: `0 16px 48px ${alpha(card.accent, isDark ? 0.2 : 0.14)}`,
                  '& .card-arrow': { transform: 'translate(3px, -3px)' },
                  '& .card-icon-bg': { transform: 'scale(1.08) rotate(-3deg)' },
                },
              }}
            >
              {/* Accent top strip */}
              <Box sx={{ height: 3, bgcolor: card.accent }} />

              <Box sx={{ p: 3.5 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box
                    className="card-icon-bg"
                    sx={{
                      width: 56, height: 56,
                      borderRadius: '16px',
                      bgcolor: alpha(card.accent, 0.1),
                      border: `1px solid ${alpha(card.accent, 0.2)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <card.icon sx={{ fontSize: 28, color: card.accent }} />
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        bgcolor: alpha(card.accent, 0.08),
                        border: `1px solid ${alpha(card.accent, 0.22)}`,
                        borderRadius: '8px',
                        px: 1.25, py: 0.4, mb: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.63rem', fontWeight: 700, color: card.accent, letterSpacing: '0.06em' }}>
                        {card.tag}
                      </Typography>
                    </Box>
                    <Typography
                      className="card-arrow"
                      sx={{ display: 'block', fontSize: '1.1rem', color: card.accent, transition: 'transform 0.3s ease', lineHeight: 1 }}
                    >
                      ↗
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.75, lineHeight: 1.1, color: 'text.primary' }}>
                  {card.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.55 }}>
                  {card.sublabel}
                </Typography>

                <Box sx={{ height: 1, bgcolor: 'divider', mb: 3 }} />

                {/* Mini stats */}
                <Box sx={{ display: 'flex', gap: 3 }}>
                  {card.stats.map((s) => (
                    <Box key={s.label}>
                      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: card.accent, lineHeight: 1 }}>
                        {s.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.68rem' }}>
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 4, py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.45 }}>
            © 2026 Sports Club Management System
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {['Athlete Login', 'Admin Login'].map((link, i) => (
              <Typography
                key={link}
                variant="caption"
                onClick={() => navigate(i === 0 ? '/student/login' : '/coach/login')}
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  opacity: 0.55,
                  fontWeight: 600,
                  '&:hover': { opacity: 1, color: 'primary.main' },
                  transition: 'all 0.2s ease',
                }}
              >
                {link}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
