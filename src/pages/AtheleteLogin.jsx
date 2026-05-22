// ─────────────────────────────────────────────────────────────
// pages/AtheleteLogin.jsx  –  Dark + lime green athlete login
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button,
  Alert, CircularProgress, useTheme, alpha,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

export default function AtheleteLogin() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

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
      const { data } = await axios.post('/api/students/login', form);
      localStorage.setItem('student', JSON.stringify(data.student));
      navigate('/athelete/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bg     = isDark ? '#0A0A12' : '#FFFFFF';
  const cardBg = isDark ? '#111827' : '#FFFFFF';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', p: 3 }}>

      {/* Background glow */}
      <Box sx={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.07 : 0.12)} 0%, transparent 70%)`,
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
        {/* Green accent top strip */}
        <Box sx={{ height: 3, bgcolor: theme.palette.primary.main }} />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Icon + title */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '14px',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 2.5,
            }}>
              <SportsSoccerIcon sx={{ fontSize: 26, color: 'primary.main' }} />
            </Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.15em' }}>
              ATHLETE PORTAL
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary', mt: 0.25 }}>
              SIGN IN
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Access your registration status
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Email Address" name="email" type="email"
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
              startIcon={loading && <CircularProgress size={14} sx={{ color: theme.palette.primary.contrastText }} />}
              sx={{
                py: 1.5,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 800,
                fontSize: '0.875rem',
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: theme.palette.primary.light,
                  boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                },
                '&:disabled': { opacity: 0.6 },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </Button>
          </Box>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
          </Box>

          {/* Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              New athlete?{' '}
              <Link to="/athelete/register" style={{ color: theme.palette.primary.main, fontWeight: 700, textDecoration: 'none' }}>
                Register here →
              </Link>
            </Typography>
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
