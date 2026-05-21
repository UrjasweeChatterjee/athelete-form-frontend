// ─────────────────────────────────────────────────────────────
// pages/Success.jsx  –  Registration success confirmation page
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default',
      display: 'flex', alignItems: 'center',
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{
          p: { xs: 4, sm: 6 },
          border: '1px solid #e0e6ed',
          borderRadius: 3,
          textAlign: 'center',
        }}>
          {/* Success icon */}
          <CheckCircleOutlineIcon
            sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
            className="fade-in"
          />

          <Typography variant="h5" color="primary" className="fade-in" gutterBottom>
            Registration Successful!
          </Typography>

          <Typography variant="body1" color="text.secondary" className="slide-up" sx={{ mb: 1 }}>
            Thank you for registering as an athlete.
          </Typography>
          <Typography variant="body2" color="text.secondary" className="slide-up" sx={{ mb: 4 }}>
            Your application is now <strong>Pending Review</strong> by the coach.
            You will receive an email once your application is approved or rejected.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/student/login')}
            sx={{ mr: 1 }}
          >
            Login to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/student/register')}
          >
            Register Another
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
