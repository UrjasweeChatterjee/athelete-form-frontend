// pages/AtheleteDashboard.jsx  –  Stitch "Digital ID" Design
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Chip, Grid, useTheme, alpha, Divider, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { STATUS_COLORS } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const renderList = (data, textPri) => {
  if (!data) return null;
  if (Array.isArray(data)) {
    return (
      <Box component="ul" sx={{ pl: 2, m: 0, '& li': { mb: 0.5, color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem' } }}>
        {data.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </Box>
    );
  }
  return (
    <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem' }}>
      {data}
    </Typography>
  );
};


const STATUS_CONFIG = {
  Pending: { ...STATUS_COLORS.Pending, icon: '⏳', label: 'PENDING REVIEW' },
  Approved: { ...STATUS_COLORS.Approved, icon: '✅', label: 'APPROVED' },
  Rejected: { ...STATUS_COLORS.Rejected, icon: '❌', label: 'REJECTED' },
};

const SPORT_EMOJIS = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Athletics: '🏃',
  Swimming: '🏊', Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓',
};

export default function AtheleteDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [athlete, setAthlete] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (!stored) { navigate('/athelete/login'); return; }
    setAthlete(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem('student'); navigate('/'); };
  const parseSports = (raw) => { try { return JSON.parse(raw); } catch { return raw ? [raw] : []; } };

  const fetchAiAssistant = async () => {
    if (!athlete) return;
    setAiLoading(true);
    setAiError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`/api/students/${athlete.id}/ai-assistant`, { headers });
      if (data.success && data.assistant) {
        setAiData(data.assistant);
      } else {
        setAiData(data);
      }
    } catch (err) {
      console.error(err);
      setAiError(err.response?.data?.message || 'Failed to generate training suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };


  if (!athlete) return null;

  const sports = parseSports(athlete.sports_applied);
  const statusCfg = STATUS_CONFIG[athlete.status] || STATUS_CONFIG.Pending;
  const registered = athlete.created_at
    ? new Date(athlete.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  // Apex Velocity tokens
  const LIME = isDark ? '#d4ff00' : '#536600';
  const CYAN = isDark ? '#06b6d4' : '#004e5c';
  const INDIGO = '#6366f1';
  const bg = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {/* Mesh blobs */}
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Page Header ────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase', mb: 0.5 }}>
              ATHLETE PORTAL
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
              My Profile
            </Typography>
          </Box>
          <Button
            variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={handleLogout}
            sx={{ borderRadius: '9999px', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: LIME, color: LIME } }}
          >
            Logout
          </Button>
        </Box>

        <Grid container spacing={3}>

          {/* ── Left: Digital ID Card ──────────────────────────── */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${border}`, borderRadius: '24px', overflow: 'hidden',
              backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
            }}>
              {/* Status color bar */}
              <Box sx={{ height: 4, bgcolor: statusCfg.color }} />

              <Box sx={{ p: 3 }}>
                {/* Avatar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Box sx={{
                    width: 88, height: 88, borderRadius: '50%', mb: 1.5,
                    background: `linear-gradient(135deg, ${alpha(statusCfg.color, 0.2)}, ${alpha(INDIGO, 0.2)})`,
                    border: `3px solid ${alpha(statusCfg.color, 0.4)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem', fontWeight: 900,
                    color: statusCfg.color,
                    fontFamily: "'Google Sans Display',sans-serif",
                  }}>
                    {athlete.full_name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, color: textPri, textAlign: 'center', letterSpacing: '-0.01em' }}>
                    {athlete.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
                    {athlete.email}
                  </Typography>
                </Box>

                {/* Status badge */}
                <Box sx={{
                  bgcolor: statusCfg.bg || alpha(statusCfg.color, 0.1),
                  border: `1px solid ${statusCfg.border || alpha(statusCfg.color, 0.3)}`,
                  borderRadius: '12px', p: 2, mb: 2.5, textAlign: 'center',
                }}>
                  <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{statusCfg.icon}</Typography>
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', color: statusCfg.color }}>
                    APPLICATION {statusCfg.label}
                  </Typography>
                </Box>

                {/* ID number / ref */}
                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '10px', p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", display: 'block', mb: 0.25 }}>ATHLETE ID</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: CYAN, fontWeight: 700, letterSpacing: '0.08em' }}>
                    SCM-{String(athlete.id || 0).padStart(6, '0')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: border }} />

                <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", display: 'block', textAlign: 'center' }}>
                  Registered: {registered}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* ── Right: Details ─────────────────────────────────── */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* AI Sports Assistant */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
                boxShadow: isDark ? '0 12px 32px rgba(6,182,212,0.08)' : '0 4px 16px rgba(0,0,0,0.04)',
                borderLeft: `4px solid ${CYAN}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ color: CYAN, fontSize: 18 }} />
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.15em', color: textSec, textTransform: 'uppercase' }}>
                      AI SPORTS ASSISTANT
                    </Typography>
                  </Box>
                  {aiData && (
                    <Button size="small" variant="text" onClick={fetchAiAssistant} disabled={aiLoading} sx={{ fontSize: '0.72rem', textTransform: 'none', color: LIME, fontFamily: "'Google Sans',sans-serif", fontWeight: 600 }}>
                      Recalculate Plan
                    </Button>
                  )}
                </Box>

                {!aiData ? (
                  <Box>
                    <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.9rem', mb: 2, lineHeight: 1.6 }}>
                      Get a personalized athletic development plan tailored to your age classification, sports profile, and competitive background.
                    </Typography>

                    {aiError && (
                      <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" }}>
                        {aiError}
                      </Alert>
                    )}

                    <Button
                      variant="contained"
                      disabled={aiLoading}
                      onClick={fetchAiAssistant}
                      sx={{
                        borderRadius: '9999px',
                        fontFamily: "'Google Sans',sans-serif",
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        bgcolor: isDark ? '#d4ff00' : '#536600',
                        color: isDark ? '#0A0A12' : '#ffffff',
                        boxShadow: isDark ? '0 0 16px rgba(212,255,0,0.3)' : 'none',
                        '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' }
                      }}
                    >
                      {aiLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={12} sx={{ color: isDark ? '#0A0A12' : '#ffffff' }} />
                          <span>Generating plan...</span>
                        </Box>
                      ) : (
                        "Get My Improvement Plan"
                      )}
                    </Button>

                    {aiLoading && (
                      <Typography variant="body2" sx={{ color: textSec, mt: 1.5, fontFamily: "'Google Sans',sans-serif", fontStyle: 'italic' }}>
                        Generating your training suggestions...
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.9rem', fontWeight: 500, fontStyle: 'italic', borderLeft: `3px solid ${LIME}`, pl: 1.5, py: 0.5, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderRadius: '0 8px 8px 0' }}>
                      "{aiData.greeting || `Hello ${athlete.full_name}!`}"
                    </Typography>

                    <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {aiData.athleteSummary}
                    </Typography>

                    <Grid container spacing={2}>
                      {[
                        { label: 'Diet Suggestions', data: aiData.dietSuggestions },
                        { label: 'Training Suggestions', data: aiData.trainingSuggestions },
                        { label: 'Stamina Plan', data: aiData.staminaPlan },
                        { label: 'Strength Focus', data: aiData.strengthFocus },
                        { label: 'Flexibility Tips', data: aiData.flexibilityTips },
                      ].map(({ label, data }) => (
                        <Grid item xs={12} key={label}>
                          <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${border}`, borderRadius: '12px', p: 2 }}>
                            <Typography variant="caption" sx={{ color: CYAN, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                              {label.toUpperCase()}
                            </Typography>
                            {renderList(data, textPri)}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {aiData.weeklyRoutine && (
                      <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${border}`, borderRadius: '12px', p: 2 }}>
                        <Typography variant="caption" sx={{ color: INDIGO, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                          WEEKLY DEVELOPMENT ROUTINE
                        </Typography>
                        {renderList(aiData.weeklyRoutine, textPri)}
                      </Box>
                    )}

                    {aiData.motivationMessage && (
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(212,255,0,0.04)' : 'rgba(83,102,0,0.03)', border: `1px dashed ${alpha(LIME, 0.3)}`, textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem', fontWeight: 500, color: LIME, fontStyle: 'italic' }}>
                          "{aiData.motivationMessage}"
                        </Typography>
                      </Box>
                    )}

                    {aiData.safetyNote && (
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(251,191,36,0.04)' : 'rgba(251,191,36,0.05)', border: `1px solid rgba(251,191,36,0.25)` }}>
                        <Typography variant="caption" sx={{ color: '#FBBF24', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>⚠️ SAFETY NOTE</Typography>
                        <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.85rem', lineHeight: 1.6 }}>{aiData.safetyNote}</Typography>
                      </Box>
                    )}

                    {aiData.disclaimer && (
                      <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.72rem', display: 'block', textAlign: 'center', mt: 1, borderTop: `1px solid ${border}`, pt: 1.5 }}>
                        ⚠️ {aiData.disclaimer}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Personal Info */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <VerifiedIcon sx={{ color: CYAN, fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                    PERSONAL INFORMATION
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { icon: <CalendarTodayIcon sx={{ fontSize: 15 }} />, label: 'Date of Birth', value: athlete.dob ? `${new Date(athlete.dob).toLocaleDateString('en-IN')}${athlete.age ? ` · Age ${athlete.age}` : ''}` : '—' },
                    { icon: <PhoneIcon sx={{ fontSize: 15 }} />, label: 'Mobile', value: athlete.mobile || '—' },
                    { icon: <PeopleIcon sx={{ fontSize: 15 }} />, label: 'Gender', value: athlete.gender || '—' },
                    { icon: <LocationOnIcon sx={{ fontSize: 15 }} />, label: 'Location', value: [athlete.city, athlete.state].filter(Boolean).join(', ') || '—' },
                  ].map(({ icon, label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{ color: textSec, mt: 0.2, flexShrink: 0 }}>{icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}>
                            {label.toUpperCase()}
                          </Typography>
                          <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: '0.88rem' }}>
                            {value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Sports & Competition */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <EmojiEventsIcon sx={{ color: isDark ? '#d4ff00' : '#536600', fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                    SPORTS & COMPETITION
                  </Typography>
                </Box>

                {/* Sport chips */}
                {sports.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                    {sports.map(sport => (
                      <Chip
                        key={sport}
                        label={`${SPORT_EMOJIS[sport] || '🏅'} ${sport}`}
                        sx={{
                          fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.8rem',
                          bgcolor: isDark ? 'rgba(212,255,0,0.1)' : 'rgba(83,102,0,0.08)',
                          color: isDark ? '#d4ff00' : '#536600',
                          border: `1px solid ${isDark ? 'rgba(212,255,0,0.25)' : 'rgba(83,102,0,0.2)'}`,
                          borderRadius: '9999px',
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Grid container spacing={2}>
                  {[
                    { icon: <EmojiEventsIcon sx={{ fontSize: 15 }} />, label: 'Competition', value: athlete.competition_name || '—' },
                    { icon: <EmojiEventsIcon sx={{ fontSize: 15 }} />, label: 'Age Group', value: athlete.age_group || '—' },
                    { icon: <LocationOnIcon sx={{ fontSize: 15 }} />, label: 'Club', value: athlete.club_name || '—' },
                    { icon: <LocationOnIcon sx={{ fontSize: 15 }} />, label: 'State Assoc.', value: athlete.state_association || '—' },
                  ].map(({ icon, label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{ color: textSec, mt: 0.2, flexShrink: 0 }}>{icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}>
                            {label.toUpperCase()}
                          </Typography>
                          <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: '0.88rem' }}>
                            {value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Guardian Info */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <PeopleIcon sx={{ color: INDIGO, fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                    GUARDIAN DETAILS
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: 'Guardian Name', value: athlete.guardian_name || '—' },
                    { label: 'Relation', value: athlete.relation || '—' },
                    { label: 'Mobile', value: athlete.guardian_mobile || '—' },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={4} key={label}>
                      <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: '0.88rem' }}>
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>

            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
