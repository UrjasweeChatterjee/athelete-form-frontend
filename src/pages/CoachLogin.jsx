// ─────────────────────────────────────────────────────────────
// pages/CoachLogin.jsx  –  Coach login page
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  Container, Box, Paper, Typography, TextField,
  Button, Alert, CircularProgress, Divider, Chip,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import axios from 'axios';

export default function CoachLogin() {
  const navigate = useNavigate();
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
    setLoading(true);
    setApiError('');
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

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default',
      display: 'flex', alignItems: 'center',
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: '1px solid #e0e6ed', borderRadius: 3 }}>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} className="fade-in" />
            <Typography variant="h5" color="primary" className="fade-in" gutterBottom>
              Coach Login
            </Typography>
            <Typography variant="body2" color="text.secondary" className="slide-up">
              Access the management dashboard
            </Typography>
          </Box>

          {/* Default credentials hint (for demo) */}
          <Box sx={{
            bgcolor: '#e8f5e9', border: '1px solid #c8e6c9',
            borderRadius: 2, p: 2, mb: 3,
          }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Default Coach Credentials:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="coach@gmail.com" size="small" variant="outlined" />
              <Chip label="coach123" size="small" variant="outlined" />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Coach Email" name="email" type="email"
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
              type="submit" variant="contained" color="secondary" fullWidth size="large"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} color="inherit" />}
            >
              {loading ? 'Logging in...' : 'Login as Coach'}
            </Button>
          </Box>

          {/* Student login link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Are you a student?{' '}
              <Link to="/student/login" style={{ color: '#0d47a1', fontWeight: 500 }}>
                Student Login
              </Link>
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}
