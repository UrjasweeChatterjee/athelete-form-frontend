// components/Navbar.jsx  –  Apex Velocity Glass Navbar
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ title, onLogout, userName }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const initials = userName
    ? userName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : null;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDark ? 'rgba(10,10,18,0.85)' : 'rgba(240,244,248,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
        color: 'text.primary',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '60px !important', px: { xs: 2, md: 4 } }}>

        {/* Logo mark — lime-to-cyan gradient */}
        <Box sx={{
          width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #d4ff00, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '0.75rem', color: '#0A0A12',
          fontFamily: "'Google Sans', sans-serif", letterSpacing: '-0.02em',
        }}>
          SC
        </Box>

        {/* Title */}
        <Typography sx={{
          flexGrow: 1,
          fontFamily: "'Google Sans Display', 'Montserrat', sans-serif",
          fontWeight: 700, fontSize: '0.92rem',
          color: isDark ? '#e2e4cf' : '#1F313E',
          letterSpacing: '-0.01em',
        }}>
          {title || 'Sports Club Management'}
        </Typography>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* <ThemeToggle /> */}

          {userName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{
                width: 32, height: 32, borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                color: '#ffffff', fontSize: '0.72rem', fontWeight: 800,
                fontFamily: "'Google Sans', sans-serif",
              }}>
                {initials}
              </Avatar>
              <Typography variant="caption" sx={{
                color: isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)',
                fontWeight: 600, fontFamily: "'Google Sans', sans-serif",
                display: { xs: 'none', sm: 'block' },
              }}>
                {userName}
              </Typography>
            </Box>
          )}

          {onLogout && (
            <Button
              size="small" onClick={onLogout}
              startIcon={<LogoutIcon sx={{ fontSize: '14px !important' }} />}
              sx={{
                borderRadius: '9999px', px: 1.5, py: 0.65,
                fontFamily: "'Google Sans', sans-serif", fontWeight: 600,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                fontSize: '0.75rem', minWidth: 0,
                '&:hover': { bgcolor: 'rgba(255,180,171,0.1)', borderColor: '#ffb4ab', color: '#ffb4ab' },
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
