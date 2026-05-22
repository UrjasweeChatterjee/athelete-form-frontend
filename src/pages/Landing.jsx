// pages/Landing.jsx  –  Stitch "Elite Core" Design
import React from 'react';
import { Box, Typography, Button, Container, Grid, Chip, alpha, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import ShieldIcon from '@mui/icons-material/Shield';
import ThemeToggle from '../components/ThemeToggle';

const NAV_CARDS = [
  { id: 'register', label: 'Athlete Registration', sub: 'Commence Intake', icon: PersonAddAltIcon, path: '/athelete/register', accent: '#d4ff00', iconBg: 'rgba(212,255,0,0.1)' },
  { id: 'athlete', label: 'Athlete Terminal', sub: 'Authenticate', icon: LoginIcon, path: '/athelete/login', accent: '#06b6d4', iconBg: 'rgba(6,182,212,0.1)' },
  { id: 'admin', label: 'Command Center', sub: 'Access Control', icon: AdminPanelSettingsIcon, path: '/coach/login', accent: '#6366f1', iconBg: 'rgba(99,102,241,0.1)' },
];

const FEATURES = [
  { icon: GroupsIcon, title: 'Roster Management', desc: 'Full athlete lifecycle from intake to elite status.' },
  { icon: SpeedIcon, title: 'Performance Tracking', desc: 'Real-time metrics and performance baselines.' },
  { icon: BarChartIcon, title: 'Analytics Dashboard', desc: 'Data-driven decisions for coaching staff.' },
  { icon: CloudDoneIcon, title: 'Secure Document Vault', desc: 'Encrypted storage for all athlete records.' },
  { icon: ShieldIcon, title: 'Access Control', desc: 'Role-based permissions for coaches & admins.' },
];

const STATS = [
  { label: 'Total Athletes', value: '1,248', color: '#d4ff00', sub: '↑ 12% this month' },
  { label: 'Pending Approvals', value: '42', color: '#FBBF24', sub: 'Needs review' },
  { label: 'Active Sports', value: '8+', color: '#06b6d4', sub: 'Disciplines tracked' },
  { label: 'Approved', value: '1,199', color: '#34D399', sub: 'Verified athletes' },
];

export default function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardBg = isDark ? 'rgba(17,24,39,0.65)' : 'rgba(255,255,255,0.85)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.58)';
  const limeMain = isDark ? '#d4ff00' : '#536600';
  const cyanMain = isDark ? '#06b6d4' : '#004e5c';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0A0A12' : '#F0F4F8', position: 'relative', overflow: 'hidden' }}>

      {/* Mesh gradient blobs — dark only */}
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '-8%', left: '-4%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '5%', right: '-4%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', top: '40%', right: '22%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        bgcolor: isDark ? 'rgba(10,10,18,0.85)' : 'rgba(240,244,248,0.92)',
        borderBottom: `1px solid ${border}`,
        px: { xs: 2, md: 6 }, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #d4ff00, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#0A0A12', fontFamily: "'Google Sans', sans-serif" }}>SC</Typography>
          </Box>
          <Typography sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, fontSize: '0.95rem', color: textPri, letterSpacing: '-0.01em' }}>
            Sports Club Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {['Athletes', 'Coaches', 'Analytics'].map(l => (
            <Typography key={l} variant="body2" sx={{ color: textSec, cursor: 'pointer', fontFamily: "'Google Sans',sans-serif", fontWeight: 500, '&:hover': { color: textPri }, transition: 'color 0.2s' }}>{l}</Typography>
          ))}
          {/* <ThemeToggle /> */}
        </Box>
      </Box>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', mb: { xs: 6, md: 10 } }}>
          <Chip label="• NEXT-GEN PLATFORM" size="small" sx={{
            mb: 3, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em',
            bgcolor: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(0,78,92,0.08)',
            color: isDark ? '#06b6d4' : '#004e5c',
            border: `1px solid ${isDark ? 'rgba(6,182,212,0.3)' : 'rgba(0,78,92,0.2)'}`,
            borderRadius: '9999px', height: 28,
          }} />

          <Typography sx={{
            fontFamily: "'Google Sans Display','Montserrat',sans-serif",
            fontWeight: 800, fontSize: { xs: '2.4rem', md: '3.8rem' },
            lineHeight: 1.1, letterSpacing: '-0.03em', mb: 3,
            background: isDark
              ? 'linear-gradient(135deg, #ffffff 0%, #e2e4cf 40%, #06b6d4 100%)'
              : 'linear-gradient(135deg, #1F313E 0%, #004e5c 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Command Performance.<br />Elevate The Elite.
          </Typography>

          <Typography variant="body1" sx={{ color: textSec, maxWidth: 540, mx: 'auto', mb: 5, lineHeight: 1.7, fontSize: '1.05rem', fontFamily: "'Google Sans',sans-serif" }}>
            The ultimate digital cockpit for sports clubs. Streamline operations, optimize training, and manage elite talent on one secure platform.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/athelete/register')} sx={{
              borderRadius: '9999px', px: 4, py: 1.4,
              fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.95rem',
              background: isDark ? '#d4ff00' : '#536600', color: isDark ? '#0A0A12' : '#ffffff',
              boxShadow: isDark ? '0 0 28px rgba(212,255,0,0.28)' : 'none',
              '&:hover': { background: isDark ? '#e8ff4d' : '#3e4c00', boxShadow: isDark ? '0 0 40px rgba(212,255,0,0.42)' : 'none', transform: 'translateY(-2px)' },
            }}>
              Register as Athlete
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/coach/login')} sx={{
              borderRadius: '9999px', px: 4, py: 1.4,
              fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.95rem',
              borderColor: isDark ? 'rgba(6,182,212,0.45)' : 'rgba(0,78,92,0.4)',
              color: isDark ? '#06b6d4' : '#004e5c',
              '&:hover': { borderColor: isDark ? '#06b6d4' : '#004e5c', bgcolor: isDark ? 'rgba(6,182,212,0.07)' : 'rgba(0,78,92,0.05)', transform: 'translateY(-2px)' },
            }}>
              Admin Access →
            </Button>
          </Box>
        </Box>

        {/* ── 3 Portal Cards ─────────────────────────────────────── */}
        <Grid container spacing={3} sx={{ mb: { xs: 6, md: 10 } }}>
          {NAV_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} md={4} key={card.id}>
                <Box onClick={() => navigate(card.path)} sx={{
                  cursor: 'pointer',
                  bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${border}`, borderRadius: '24px', p: 3.5,
                  backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-6px)', border: `1px solid ${alpha(card.accent, 0.4)}`, boxShadow: `0 20px 40px ${alpha(card.accent, 0.14)}` },
                }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: card.iconBg, border: `1px solid ${alpha(card.accent, 0.22)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                    <Icon sx={{ color: card.accent, fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '1rem', color: textPri, mb: 0.5 }}>
                    {card.label}
                  </Typography>
                  <Typography sx={{ color: card.accent, fontWeight: 600, fontSize: '0.85rem', fontFamily: "'Google Sans',sans-serif" }}>
                    {card.sub} →
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* ── Features + Stats ────────────────────────────────────── */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: { xs: 6, md: 10 } }}>
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.7rem', color: cyanMain, mb: 1, textTransform: 'uppercase' }}>
              PLATFORM CAPABILITIES
            </Typography>
            <Typography sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.2rem' }, letterSpacing: '-0.02em', color: textPri, mb: 3.5, lineHeight: 1.2 }}>
              Engineered for Dominance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {FEATURES.map(f => {
                const FIcon = f.icon;
                return (
                  <Box key={f.title} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', flexShrink: 0, bgcolor: isDark ? 'rgba(212,255,0,0.07)' : 'rgba(83,102,0,0.07)', border: `1px solid ${isDark ? 'rgba(212,255,0,0.14)' : 'rgba(83,102,0,0.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FIcon sx={{ color: limeMain, fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: textPri, mb: 0.3, fontSize: '0.93rem', fontFamily: "'Google Sans',sans-serif" }}>{f.title}</Typography>
                      <Typography variant="body2" sx={{ color: textSec, lineHeight: 1.5, fontFamily: "'Google Sans',sans-serif" }}>{f.desc}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '24px', p: 3, backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)' : 'none' }}>
              <Typography sx={{ fontWeight: 700, color: textPri, mb: 2.5, fontFamily: "'Google Sans',sans-serif", fontSize: '0.85rem', letterSpacing: '0.06em' }}>
                LIVE PLATFORM STATS
              </Typography>
              <Grid container spacing={2}>
                {STATS.map(s => (
                  <Grid item xs={6} key={s.label}>
                    <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '16px', p: 2 }}>
                      <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: s.color, fontFamily: "'Google Sans Display','Montserrat',sans-serif", letterSpacing: '-0.02em', lineHeight: 1.1 }}>{s.value}</Typography>
                      <Typography sx={{ fontSize: '0.77rem', color: textPri, fontWeight: 600, mt: 0.5, fontFamily: "'Google Sans',sans-serif" }}>{s.label}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: s.color, mt: 0.25, fontFamily: "'Google Sans',sans-serif" }}>{s.sub}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Box sx={{ borderTop: `1px solid ${border}`, px: { xs: 3, md: 6 }, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
          © 2026 Sports Club Management Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {['Privacy', 'Terms', 'Support'].map(l => (
            <Typography key={l} variant="caption" sx={{ color: textSec, cursor: 'pointer', fontFamily: "'Google Sans',sans-serif", '&:hover': { color: textPri }, transition: 'color 0.2s' }}>{l}</Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
