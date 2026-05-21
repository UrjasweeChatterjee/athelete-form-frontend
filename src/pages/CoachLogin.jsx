// ─────────────────────────────────────────────────────────────
// pages/CoachLogin.jsx  –  Dark + orange admin login
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button,
  Alert, CircularProgress, useTheme, alpha, Chip,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function CoachLogin() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const ACCENT   = theme.palette.secondary.main;   // cyan
  const ACCENTL  = theme.palette.secondary.light;

  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError('');
    try {
      const { data } = await axios.post('/api/coaches/login', form);
      localStorage.setItem('coach', JSON.stringify(data.coach));
      navigate('/coach/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const bg     = isDark ? '#0A0A12' : '#FFFFFF';
  const cardBg = isDark ? '#111827' : '#FFFFFF';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', p: 3 }}>

      {/* Background glow — orange for admin */}
      <Box sx={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(ACCENT, isDark ? 0.07 : 0.1)} 0%, transparent 70%)`,
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Theme toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </Box>

      {/* Login card */}
      <Box
        sx={{
          width: '100%', maxWidth: 420,
          bgcolor: cardBg,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.7)' : '0 8px 40px rgba(0,0,0,0.1)',
          animation: 'fadeInUp 0.6s ease both',
          zIndex: 1,
        }}
      >
        {/* Orange accent strip */}
        <Box sx={{ height: 3, bgcolor: ACCENT }} />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Icon + title */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '14px',
              bgcolor: alpha(ACCENT, 0.1),
              border: `1px solid ${alpha(ACCENT, 0.22)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 2.5,
            }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 26, color: ACCENT }} />
            </Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.15em' }}>
              ADMIN PORTAL
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary', mt: 0.25 }}>
              ADMIN LOGIN
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Access the management dashboard
            </Typography>
          </Box>

          {/* Credentials hint */}
          <Box
            sx={{
              bgcolor: alpha(ACCENT, 0.07),
              border: `1px solid ${alpha(ACCENT, 0.18)}`,
              borderRadius: '12px',
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1, letterSpacing: '0.05em' }}>
              🔑 DEFAULT CREDENTIALS
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="coach@gmail.com" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', height: 24 }} />
              <Chip label="coach123" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', height: 24 }} />
            </Box>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Admin Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              error={!!errors.email} helperText={errors.email}
              sx={{ mb: 2 }} required
            />
            <TextField
              fullWidth label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              error={!!errors.password} helperText={errors.password}
              sx={{ mb: 3 }} required
            />

            {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

            <Button
              type="submit"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading && <CircularProgress size={14} sx={{ color: theme.palette.secondary.contrastText }} />}
              sx={{
                py: 1.5,
                bgcolor: ACCENT,
                color: theme.palette.secondary.contrastText,
                fontWeight: 800,
                fontSize: '0.875rem',
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: ACCENTL,
                  boxShadow: `0 4px 24px ${alpha(ACCENT, 0.35)}`,
                },
                '&:disabled': { opacity: 0.6 },
              }}
            >
              {loading ? 'Signing in...' : 'Enter Dashboard →'}
            </Button>
          </Box>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
          </Box>

          {/* Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              <Link to="/" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', fontWeight: 500, textDecoration: 'none', fontSize: '0.8rem' }}>
                ← Back to Home
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
