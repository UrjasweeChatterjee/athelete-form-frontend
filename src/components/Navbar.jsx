// ─────────────────────────────────────────────────────────────
// components/Navbar.jsx  –  Top bar (screenshot-inspired)
// Dark glass bar with logo, title, theme toggle, user/logout
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  AppBar, Toolbar, Typography, Button,
  Box, useTheme, Avatar, alpha,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ title, onLogout, userName }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Initials from userName
  const initials = userName
    ? userName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : null;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDark
          ? 'rgba(10,10,10,0.85)'
          : 'rgba(237,250,218,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '60px !important' }}>
        {/* Logo mark */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1rem',
            color: theme.palette.primary.contrastText,
            flexShrink: 0,
            letterSpacing: '-0.05em',
          }}
        >
          SC
        </Box>

        {/* Title */}
        <Typography
          variant="body1"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
        >
          {title || 'Sports Club'}
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ThemeToggle />

          {userName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                }}
              >
                {initials}
              </Avatar>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {userName}
              </Typography>
            </Box>
          )}

          {onLogout && (
            <Button
              size="small"
              onClick={onLogout}
              startIcon={<LogoutIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                borderRadius: '10px',
                px: 1.5,
                py: 0.75,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
                border: `1px solid ${theme.palette.divider}`,
                fontSize: '0.75rem',
                minWidth: 0,
                '&:hover': {
                  bgcolor: 'rgba(255,77,77,0.12)',
                  borderColor: '#FF4D4D',
                  color: '#FF4D4D',
                },
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
