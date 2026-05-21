// ─────────────────────────────────────────────────────────────
// theme.js  –  MUI custom theme
// Color palette: Navy Blue, White, Light Grey, Muted Teal
// ─────────────────────────────────────────────────────────────
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:  '#0d47a1',   // Navy Blue
      light: '#1565c0',
      dark:  '#002171',
      contrastText: '#ffffff',
    },
    secondary: {
      main:  '#00796b',   // Muted Teal
      light: '#48a999',
      dark:  '#004c40',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f8',  // Light Grey
      paper:   '#ffffff',
    },
    text: {
      primary:   '#1a2340',
      secondary: '#546e7a',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error:   { main: '#c62828' },
    grey: {
      100: '#f5f7fa',
      200: '#eceff1',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 400, color: '#546e7a' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 22px',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(13,71,161,0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#0d47a1',
            color: '#fff',
            fontWeight: 600,
          },
        },
      },
    },
  },
});

export default theme;
