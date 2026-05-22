// ─────────────────────────────────────────────────────────────
// context/ThemeContext.jsx  –  "Apex Velocity" Design System
// Source: Google Stitch project 8828308964239004662
//
// Primary   : Lime Green  #d4ff00  (high-visibility athletic)
// Secondary : Indigo      #6366f1  (professional nav/states)
// Tertiary  : Cyan        #06b6d4  (info / data viz)
// Dark bg   : Slate Navy  #0A0A12  (premium depth)
// Font      : Google Sans (display) + Inter (body)
// ─────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();
export const useThemeMode = () => useContext(ThemeContext);

// ── Design Tokens (from Apex Velocity Stitch system) ─────────
// Dark mode
const LIME        = '#d4ff00';   // primary – lime green
const LIME_DIM    = '#b0d500';   // primary dim
const INDIGO      = '#6366f1';   // secondary
const INDIGO_CONT = '#3131c0';   // secondary container
const CYAN        = '#06b6d4';   // tertiary
const CYAN_LIGHT  = '#4cd7f6';   // tertiary dim

// Light mode equivalents
const LIME_L      = '#536600';   // inverse-primary
const INDIGO_L    = '#2f2ebe';   // on-secondary-fixed-variant
const CYAN_L      = '#004e5c';   // on-tertiary-fixed-variant

// Surface hierarchy (dark)
const BG          = '#0A0A12';   // deepest bg (slightly warmer than pure Stitch #121508)
const SURFACE     = '#111827';   // cards / paper
const SURFACE_HI  = '#1e2113';   // surface-container
const SURFACE_HHI = '#292b1d';   // surface-container-high

// Shared
const CARD_SHADOW   = '0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.07)';
const GLASS_SHADOW  = '0 20px 40px rgba(0,0,0,0.4)';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          primary:    { main: LIME,    light: '#e8ff4d', dark: LIME_DIM,   contrastText: '#0A0A12' },
          secondary:  { main: INDIGO,  light: '#818cf8', dark: INDIGO_CONT, contrastText: '#ffffff' },
          tertiary:   { main: CYAN,    light: CYAN_LIGHT, dark: '#0891b2', contrastText: '#001f26' },
          background: { default: BG,   paper: SURFACE },
          text:       { primary: '#e2e4cf', secondary: 'rgba(197,201,172,0.75)' },
          success:    { main: '#34D399', contrastText: '#001a0f' },
          warning:    { main: '#FBBF24', contrastText: '#1a1000' },
          error:      { main: '#ffb4ab', contrastText: '#690005' },
          divider:    'rgba(255,255,255,0.07)',
          action:     { hover: 'rgba(212,255,0,0.06)', selected: 'rgba(212,255,0,0.12)' },
          // Extra surfaces for glass layering
          surfaceContainer:     SURFACE_HI,
          surfaceContainerHigh: SURFACE_HHI,
        }
      : {
          primary:    { main: LIME_L,   light: '#6f8700', dark: '#3e4c00', contrastText: '#ffffff' },
          secondary:  { main: INDIGO_L, light: INDIGO,    dark: '#07006c', contrastText: '#ffffff' },
          tertiary:   { main: CYAN_L,   light: '#006e81', dark: '#001f26', contrastText: '#ffffff' },
          background: { default: '#F8F9FA', paper: '#FFFFFF' },
          text:       { primary: '#1F313E', secondary: 'rgba(31,49,62,0.6)' },
          success:    { main: '#059669' },
          warning:    { main: '#D97706' },
          error:      { main: '#DC2626' },
          divider:    'rgba(15,23,42,0.09)',
          action:     { hover: 'rgba(83,102,0,0.05)', selected: 'rgba(83,102,0,0.1)' },
        }),
  },

  typography: {
    // Google Sans as display face, Inter as body — matching Stitch design spec
    fontFamily: "'Google Sans', 'Inter', 'Segoe UI', sans-serif",
    h1: { fontFamily: "'Google Sans Display', 'Montserrat', sans-serif", fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontFamily: "'Google Sans Display', 'Montserrat', sans-serif", fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontFamily: "'Google Sans Display', 'Montserrat', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: "'Google Sans', 'Montserrat', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontFamily: "'Google Sans', sans-serif", fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontFamily: "'Google Sans', sans-serif", fontWeight: 700 },
    subtitle1: { fontFamily: "'Google Sans', sans-serif", fontWeight: 500 },
    subtitle2: { fontFamily: "'Google Sans', sans-serif", fontWeight: 500 },
    body1:   { fontFamily: "'Google Sans', 'Inter', sans-serif", fontWeight: 400 },
    body2:   { fontFamily: "'Google Sans', 'Inter', sans-serif", fontWeight: 400 },
    caption: { fontFamily: "'Google Sans', 'Inter', sans-serif", fontWeight: 500 },
    overline:{ fontFamily: "'Google Sans', sans-serif", fontWeight: 700, letterSpacing: '0.14em' },
    button:  { fontFamily: "'Google Sans', sans-serif", textTransform: 'none', fontWeight: 700 },
  },

  // 8px = DEFAULT, 24px for containers (Stitch spec)
  shape: { borderRadius: 16 },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;700&display=swap');
      `,
    },

    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          padding: '10px 24px',
          fontFamily: "'Google Sans', sans-serif",
          fontWeight: 700,
          fontSize: '0.875rem',
          transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: 'none',
          letterSpacing: '0.01em',
        }),
        contained: ({ theme }) => ({
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark'
              ? `0 0 0 4px rgba(212,255,0,0.18), 0 4px 20px rgba(212,255,0,0.2)`
              : `0 4px 20px rgba(83,102,0,0.3)`,
            transform: 'translateY(-1px)',
          },
        }),
        outlined: {
          '&:hover': { transform: 'translateY(-1px)' },
        },
        containedPrimary: ({ theme }) => ({
          // Lime button: black text on lime bg
          color: theme.palette.mode === 'dark' ? '#0A0A12' : '#ffffff',
        }),
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 20,
          ...(theme.palette.mode === 'dark'
            ? {
                background: 'rgba(17,24,39,0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.07)',
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
              }
            : { boxShadow: CARD_SHADOW }),
        }),
      },
    },

    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 24,
          ...(theme.palette.mode === 'dark'
            ? {
                background: 'rgba(17,24,39,0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.07)',
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
              }
            : { boxShadow: CARD_SHADOW }),
        }),
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontFamily: "'Google Sans', 'Inter', sans-serif",
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(15,23,42,0.03)',
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? LIME : LIME_L },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.mode === 'dark' ? LIME : LIME_L,
              borderWidth: 1.5,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 0 0 3px rgba(212,255,0,0.12)'
                : 'none',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: theme.palette.mode === 'dark' ? LIME : LIME_L,
          },
        }),
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          fontFamily: "'Google Sans', 'Inter', sans-serif",
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(15,23,42,0.03)',
        }),
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Google Sans', 'Inter', sans-serif",
          fontWeight: 600,
          // Pill shape per Stitch spec
          borderRadius: 9999,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 24,
          ...(theme.palette.mode === 'dark' && {
            background: 'rgba(17,24,39,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: GLASS_SHADOW,
          }),
        }),
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, fontFamily: "'Google Sans', 'Inter', sans-serif" },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          ...(theme.palette.mode === 'dark' && {
            background: 'rgba(10,10,18,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }),
        }),
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 99,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(212,255,0,0.12)'
            : 'rgba(83,102,0,0.12)',
        }),
        bar: ({ theme }) => ({
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(90deg, ${LIME}, ${CYAN})`
            : `linear-gradient(90deg, ${LIME_L}, ${CYAN_L})`,
        }),
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "'Google Sans', 'Inter', sans-serif",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: "'Google Sans', 'Inter', sans-serif",
          fontSize: '0.75rem',
          borderRadius: 8,
        },
      },
    },
  },
});

// ── Exported status colors (used across pages) ────────────────
// Updated to match Apex Velocity palette
export const STATUS_COLORS = {
  Pending:  { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.28)'  },
  Approved: { color: '#d4ff00', bg: 'rgba(212,255,0,0.1)',    border: 'rgba(212,255,0,0.3)'    },
  Rejected: { color: '#ffb4ab', bg: 'rgba(255,180,171,0.1)',  border: 'rgba(255,180,171,0.3)'  },
};

// ── Exported accent pairs ────────────────────────────────────
export const CARD_ACCENTS = {
  register: { color: LIME,   light: LIME_L   },
  athlete:  { color: '#34D399', light: '#059669' },
  admin:    { color: INDIGO, light: INDIGO_L  },
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
