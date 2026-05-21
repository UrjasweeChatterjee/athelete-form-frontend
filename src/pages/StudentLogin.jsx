// ─────────────────────────────────────────────────────────────
// pages/StudentLogin.jsx  –  Student login page
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  Container, Box, Paper, Typography, TextField,
  Button, Alert, CircularProgress, Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
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
    setLoading(true);
    setApiError('');
    try {
      const { data } = await axios.post('/api/students/login', form);
      // Save student info in localStorage for session
      localStorage.setItem('student', JSON.stringify(data.student));
      navigate('/student/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
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
            <Typography variant="h5" color="primary" className="fade-in" gutterBottom>
              Student Login
            </Typography>
            <Typography variant="body2" color="text.secondary" className="slide-up">
              Access your application status and profile
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

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
              type="submit" variant="contained" fullWidth size="large"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} color="inherit" />}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          {/* Links */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              New athlete?{' '}
              <Link to="/student/register" style={{ color: '#0d47a1', fontWeight: 500 }}>
                Register here
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Coach?{' '}
              <Link to="/coach/login" style={{ color: '#00796b', fontWeight: 500 }}>
                Coach Login
              </Link>
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}
