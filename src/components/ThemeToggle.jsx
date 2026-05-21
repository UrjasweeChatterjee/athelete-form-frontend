// ─────────────────────────────────────────────────────────────
// components/ThemeToggle.jsx  –  Animated dark/light toggle
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { IconButton, Tooltip, useTheme, alpha } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon  from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../context/ThemeContext';

export default function ThemeToggle({ sx = {} }) {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton
        onClick={toggleMode}
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          color: isDark ? theme.palette.primary.main : theme.palette.primary.dark,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            transform: 'rotate(15deg) scale(1.1)',
          },
          ...sx,
        }}
      >
        {isDark ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
      </IconButton>
    </Tooltip>
  );
}
