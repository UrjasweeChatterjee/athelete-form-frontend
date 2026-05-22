// pages/AtheleteLogin.jsx  –  Stitch "Athlete Terminal" Design
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, useTheme, alpha } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import LoginIcon from '@mui/icons-material/Login';

export default function AtheleteLogin() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  // Apex Velocity — cyan accent for athlete portal
  const CYAN = '#06b6d4';
  const LIME = '#d4ff00';
  const bg = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.75)' : 'rgba(255,255,255,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', p: 3 }}>

      {/* Mesh blobs */}
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'fixed', bottom: '10%', left: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      </>}

      {/* <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <ThemeToggle />
      </Box> */}
      <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
        <Link to="/" style={{ color: isDark ? 'rgba(197,201,172,0.5)' : 'rgba(31,49,62,0.45)', textDecoration: 'none', fontSize: '0.82rem', fontFamily: "'Google Sans', sans-serif", fontWeight: 500 }}>
          ← Back to Home
        </Link>
      </Box>

      {/* Card */}
      <Box sx={{
        width: '100%', maxWidth: 440, zIndex: 1,
        bgcolor: cardBg,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${border}`,
        borderRadius: '28px',
        overflow: 'hidden',
        backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.6)' : '0 8px 40px rgba(0,0,0,0.1)',
        animation: 'fadeInUp 0.5s ease both',
      }}>
        {/* Cyan-to-lime accent bar */}
        <Box sx={{ height: 3, background: `linear-gradient(90deg, ${CYAN}, ${LIME})` }} />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '16px', mb: 2.5,
              bgcolor: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(0,78,92,0.07)',
              border: `1px solid ${isDark ? 'rgba(6,182,212,0.22)' : 'rgba(0,78,92,0.15)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LoginIcon sx={{ fontSize: 26, color: CYAN }} />
            </Box>
            <Typography sx={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.14em', color: isDark ? CYAN : '#004e5c', textTransform: 'uppercase', mb: 0.5 }}>
              ATHLETE TERMINAL
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: "'Google Sans Display', 'Montserrat', sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri, mb: 0.5 }}>
              Athlete Login
            </Typography>
            <Typography variant="body2" sx={{ color: textSec, fontFamily: "'Google Sans', sans-serif" }}>
              Access your application status and profile
            </Typography>
          </Box>

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

            {apiError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{apiError}</Alert>}

            <Button
              type="submit" fullWidth size="large" disabled={loading}
              startIcon={loading && <CircularProgress size={14} sx={{ color: '#0A0A12' }} />}
              sx={{
                py: 1.5, borderRadius: '12px',
                fontFamily: "'Google Sans', sans-serif", fontWeight: 700,
                background: loading ? undefined : isDark
                  ? `linear-gradient(135deg, ${CYAN}, ${LIME})`
                  : `linear-gradient(135deg, #004e5c, #536600)`,
                color: isDark ? '#0A0A12' : '#ffffff',
                boxShadow: isDark ? `0 4px 20px rgba(6,182,212,0.3)` : 'none',
                '&:hover': { boxShadow: isDark ? `0 6px 28px rgba(6,182,212,0.45)` : `0 4px 16px rgba(0,78,92,0.25)`, transform: 'translateY(-1px)' },
                '&:disabled': { opacity: 0.6 },
              }}
            >
              {loading ? 'Authenticating...' : 'Access Portal →'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: textSec, fontFamily: "'Google Sans', sans-serif" }}>
              New athlete?{' '}
              <Link to="/athelete/register" style={{ color: isDark ? LIME : '#536600', fontWeight: 700, textDecoration: 'none' }}>
                Register here →
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ color: textSec, fontFamily: "'Google Sans', sans-serif" }}>
              Coach or Admin?{' '}
              <Link to="/coach/login" style={{ color: isDark ? '#6366f1' : '#2f2ebe', fontWeight: 700, textDecoration: 'none' }}>
                Command Center →
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
