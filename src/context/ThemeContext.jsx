// ─────────────────────────────────────────────────────────────
// context/ThemeContext.jsx
// Professional palette: Indigo primary · Cyan secondary
// Light mode: white bg, soft card shadows
// Dark mode: near-black bg, subtle borders
// ─────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();
export const useThemeMode = () => useContext(ThemeContext);

// ── Tokens ───────────────────────────────────────────────────
const PRIMARY_DARK  = '#818CF8';   // indigo-400   – bright on dark bg
const PRIMARY_LIGHT = '#4F46E5';   // indigo-600   – strong on white
const SEC_DARK      = '#22D3EE';   // cyan-400
const SEC_LIGHT     = '#0891B2';   // cyan-600
const CARD_SHADOW   = '0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.07)';
const CARD_SHADOW_H = '0 2px 6px rgba(0,0,0,0.09), 0 8px 32px rgba(0,0,0,0.09)';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          primary:    { main: PRIMARY_DARK,  light: '#A5B4FC', dark: '#6366F1', contrastText: '#0A0A12' },
          secondary:  { main: SEC_DARK,      light: '#67E8F9', dark: '#06B6D4', contrastText: '#0A0A12' },
          background: { default: '#0A0A12',  paper: '#111827' },
          text:       { primary: '#F1F5F9',  secondary: 'rgba(241,245,249,0.48)' },
          success:    { main: '#34D399' },
          warning:    { main: '#FBBF24' },
          error:      { main: '#F87171' },
          divider:    'rgba(255,255,255,0.07)',
          action:     { hover: 'rgba(129,140,248,0.07)', selected: 'rgba(129,140,248,0.12)' },
        }
      : {
          primary:    { main: PRIMARY_LIGHT, light: '#6366F1', dark: '#3730A3', contrastText: '#FFFFFF' },
          secondary:  { main: SEC_LIGHT,     light: '#06B6D4', dark: '#0E7490', contrastText: '#FFFFFF' },
          background: { default: '#FFFFFF',  paper: '#FFFFFF' },
          text:       { primary: '#0F172A',  secondary: 'rgba(15,23,42,0.52)' },
          success:    { main: '#059669' },
          warning:    { main: '#D97706' },
          error:      { main: '#DC2626' },
          divider:    'rgba(15,23,42,0.09)',
          action:     { hover: 'rgba(79,70,229,0.05)', selected: 'rgba(79,70,229,0.1)' },
        }),
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h3:  { fontWeight: 900, letterSpacing: '-0.03em' },
    h4:  { fontWeight: 800, letterSpacing: '-0.02em' },
    h5:  { fontWeight: 700, letterSpacing: '-0.01em' },
    h6:  { fontWeight: 700 },
    overline: { fontWeight: 700, letterSpacing: '0.14em' },
    button:   { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 700,
          fontSize: '0.875rem',
          transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: 'none',
        },
        contained: {
          '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
        },
        outlined: {
          '&:hover': { transform: 'translateY(-1px)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 20,
          ...(theme.palette.mode === 'light' && {
            boxShadow: CARD_SHADOW,
          }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 20,
          ...(theme.palette.mode === 'light' && {
            boxShadow: CARD_SHADOW,
          }),
        }),
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(15,23,42,0.03)',
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: theme.palette.primary.main },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: 1.5,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(15,23,42,0.03)',
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99 },
      },
    },
  },
});

// ── Exported status colors (used across pages) ────────────────
export const STATUS_COLORS = {
  Pending:  { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)'  },
  Approved: { color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
  Rejected: { color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
};

// ── Exported accent pairs for landing cards ───────────────────
export const CARD_ACCENTS = {
  register: { color: PRIMARY_DARK,  light: PRIMARY_LIGHT  },
  admin:    { color: SEC_DARK,      light: SEC_LIGHT       },
};

export function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');

  const toggleMode = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
