// ─────────────────────────────────────────────────────────────
// pages/Success.jsx  –  Registration success page (revamped)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Box, Container, Typography, Button, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Success() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <Box sx={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.12)} 0%, transparent 70%)`,
        filter: 'blur(60px)',
      }} />

      {/* Theme toggle */}
      <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Box
          sx={{
            bgcolor: isDark ? alpha('#1A1A2E', 0.85) : alpha('#fff', 0.9),
            backdropFilter: 'blur(24px)',
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: 4,
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            boxShadow: isDark
              ? '0 24px 80px rgba(0,0,0,0.5)'
              : `0 8px 48px ${alpha(theme.palette.success.main, 0.15)}`,
            animation: 'fadeInUp 0.7s ease both',
          }}
        >
          {/* Animated success icon */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.success.main}, #00b09b)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              fontSize: 48,
              boxShadow: `0 12px 40px ${alpha(theme.palette.success.main, 0.4)}`,
              animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            🎉
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
            You're Registered!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
            Thank you for registering as an athlete at our Sports Club.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Your application is now{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: '#FDCB6E',
                bgcolor: alpha('#FDCB6E', 0.15),
                px: 1,
                py: 0.25,
                borderRadius: 1,
              }}
            >
              ⏳ Pending Review
            </Box>
            {' '}by the coach. You will receive an email once your application is processed.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/athelete/login')}
              sx={{
                borderRadius: 3,
                px: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': { boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.45)}` },
              }}
            >
              View My Dashboard →
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/athelete/register')}
              sx={{
                borderRadius: 3,
                px: 4,
                borderColor: theme.palette.divider,
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              Register Another
            </Button>
          </Box>

          <Typography variant="caption" sx={{ display: 'block', mt: 4, color: 'text.secondary', opacity: 0.5 }}>
            <Box component="span" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              ← Back to Home
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
