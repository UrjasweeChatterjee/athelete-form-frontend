// pages/AtheleteDashboard.jsx  –  Stitch "Digital ID" Design
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Chip, Grid, useTheme, alpha, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { STATUS_COLORS } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';

const STATUS_CONFIG = {
  Pending:  { ...STATUS_COLORS.Pending,  icon: '⏳', label: 'PENDING REVIEW'  },
  Approved: { ...STATUS_COLORS.Approved, icon: '✅', label: 'APPROVED'         },
  Rejected: { ...STATUS_COLORS.Rejected, icon: '❌', label: 'REJECTED'         },
};

const SPORT_EMOJIS = {
  Cricket:'🏏', Football:'⚽', Badminton:'🏸', Athletics:'🏃',
  Swimming:'🏊', Basketball:'🏀', Volleyball:'🏐', 'Table Tennis':'🏓',
};

export default function AtheleteDashboard() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (!stored) { navigate('/athelete/login'); return; }
    setAthlete(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem('student'); navigate('/'); };
  const parseSports  = (raw) => { try { return JSON.parse(raw); } catch { return raw ? [raw] : []; } };

  if (!athlete) return null;

  const sports    = parseSports(athlete.sports_applied);
  const statusCfg = STATUS_CONFIG[athlete.status] || STATUS_CONFIG.Pending;
  const registered = athlete.created_at
    ? new Date(athlete.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
    : '—';

  // Apex Velocity tokens
  const LIME   = isDark ? '#d4ff00' : '#536600';
  const CYAN   = isDark ? '#06b6d4' : '#004e5c';
  const INDIGO = '#6366f1';
  const bg     = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {/* Mesh blobs */}
      {isDark && <>
        <Box sx={{ position:'fixed', top:'-5%', right:'5%', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
        <Box sx={{ position:'fixed', bottom:'10%', left:'-5%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Page Header ────────────────────────────────────────── */}
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb: 4 }}>
          <Box>
            <Typography sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.65rem', letterSpacing:'0.12em', color: CYAN, textTransform:'uppercase', mb:0.5 }}>
              ATHLETE PORTAL
            </Typography>
            <Typography variant="h4" sx={{ fontFamily:"'Google Sans Display','Montserrat',sans-serif", fontWeight:800, letterSpacing:'-0.02em', color: textPri }}>
              My Profile
            </Typography>
          </Box>
          <Button
            variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={handleLogout}
            sx={{ borderRadius:'9999px', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', color: textSec, fontFamily:"'Google Sans',sans-serif", fontWeight:600, '&:hover':{ borderColor: LIME, color: LIME } }}
          >
            Logout
          </Button>
        </Box>

        <Grid container spacing={3}>

          {/* ── Left: Digital ID Card ──────────────────────────── */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              bgcolor: cardBg, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
              border:`1px solid ${border}`, borderRadius:'24px', overflow:'hidden',
              backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
            }}>
              {/* Status color bar */}
              <Box sx={{ height: 4, bgcolor: statusCfg.color }} />

              <Box sx={{ p: 3 }}>
                {/* Avatar */}
                <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', mb: 3 }}>
                  <Box sx={{
                    width: 88, height: 88, borderRadius: '50%', mb: 1.5,
                    background: `linear-gradient(135deg, ${alpha(statusCfg.color, 0.2)}, ${alpha(INDIGO, 0.2)})`,
                    border: `3px solid ${alpha(statusCfg.color, 0.4)}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: '2.2rem', fontWeight:900,
                    color: statusCfg.color,
                    fontFamily:"'Google Sans Display',sans-serif",
                  }}>
                    {athlete.full_name?.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() || '?'}
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily:"'Google Sans Display','Montserrat',sans-serif", fontWeight:800, color: textPri, textAlign:'center', letterSpacing:'-0.01em' }}>
                    {athlete.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif" }}>
                    {athlete.email}
                  </Typography>
                </Box>

                {/* Status badge */}
                <Box sx={{
                  bgcolor: statusCfg.bg || alpha(statusCfg.color, 0.1),
                  border: `1px solid ${statusCfg.border || alpha(statusCfg.color, 0.3)}`,
                  borderRadius:'12px', p: 2, mb: 2.5, textAlign:'center',
                }}>
                  <Typography sx={{ fontSize:'1.4rem', mb:0.5 }}>{statusCfg.icon}</Typography>
                  <Typography sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.1em', color: statusCfg.color }}>
                    APPLICATION {statusCfg.label}
                  </Typography>
                </Box>

                {/* ID number / ref */}
                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius:'10px', p: 1.5, textAlign:'center' }}>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif", display:'block', mb:0.25 }}>ATHLETE ID</Typography>
                  <Typography sx={{ fontFamily:'monospace', fontSize:'0.8rem', color: CYAN, fontWeight:700, letterSpacing:'0.08em' }}>
                    SCM-{String(athlete.id || 0).padStart(6, '0')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: border }} />

                <Typography variant="caption" sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif", display:'block', textAlign:'center' }}>
                  Registered: {registered}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* ── Right: Details ─────────────────────────────────── */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display:'flex', flexDirection:'column', gap: 3 }}>

              {/* Personal Info */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
                border:`1px solid ${border}`, borderRadius:'20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb: 2.5 }}>
                  <VerifiedIcon sx={{ color: CYAN, fontSize: 18 }} />
                  <Typography sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.1em', color: textSec, textTransform:'uppercase' }}>
                    PERSONAL INFORMATION
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { icon:<CalendarTodayIcon sx={{fontSize:15}}/>, label:'Date of Birth', value: athlete.dob ? `${new Date(athlete.dob).toLocaleDateString('en-IN')}${athlete.age ? ` · Age ${athlete.age}` : ''}` : '—' },
                    { icon:<PhoneIcon sx={{fontSize:15}}/>,         label:'Mobile',        value: athlete.mobile || '—' },
                    { icon:<PeopleIcon sx={{fontSize:15}}/>,        label:'Gender',        value: athlete.gender || '—' },
                    { icon:<LocationOnIcon sx={{fontSize:15}}/>,    label:'Location',      value: [athlete.city, athlete.state].filter(Boolean).join(', ') || '—' },
                  ].map(({ icon, label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display:'flex', gap:1.5, alignItems:'flex-start' }}>
                        <Box sx={{ color: textSec, mt:0.2, flexShrink:0 }}>{icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif", fontWeight:600, letterSpacing:'0.04em', display:'block' }}>
                            {label.toUpperCase()}
                          </Typography>
                          <Typography sx={{ color: textPri, fontFamily:"'Google Sans',sans-serif", fontWeight:500, fontSize:'0.88rem' }}>
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
                bgcolor: cardBg, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
                border:`1px solid ${border}`, borderRadius:'20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb: 2.5 }}>
                  <EmojiEventsIcon sx={{ color: isDark ? '#d4ff00' : '#536600', fontSize: 18 }} />
                  <Typography sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.1em', color: textSec, textTransform:'uppercase' }}>
                    SPORTS & COMPETITION
                  </Typography>
                </Box>

                {/* Sport chips */}
                {sports.length > 0 && (
                  <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mb: 2.5 }}>
                    {sports.map(sport => (
                      <Chip
                        key={sport}
                        label={`${SPORT_EMOJIS[sport] || '🏅'} ${sport}`}
                        sx={{
                          fontFamily:"'Google Sans',sans-serif", fontWeight:600, fontSize:'0.8rem',
                          bgcolor: isDark ? 'rgba(212,255,0,0.1)' : 'rgba(83,102,0,0.08)',
                          color: isDark ? '#d4ff00' : '#536600',
                          border: `1px solid ${isDark ? 'rgba(212,255,0,0.25)' : 'rgba(83,102,0,0.2)'}`,
                          borderRadius:'9999px',
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Grid container spacing={2}>
                  {[
                    { icon:<EmojiEventsIcon sx={{fontSize:15}}/>, label:'Competition', value: athlete.competition_name || '—' },
                    { icon:<EmojiEventsIcon sx={{fontSize:15}}/>, label:'Age Group',   value: athlete.age_group || '—' },
                    { icon:<LocationOnIcon sx={{fontSize:15}}/>,  label:'Club',        value: athlete.club_name || '—' },
                    { icon:<LocationOnIcon sx={{fontSize:15}}/>,  label:'State Assoc.',value: athlete.state_association || '—' },
                  ].map(({ icon, label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display:'flex', gap:1.5, alignItems:'flex-start' }}>
                        <Box sx={{ color: textSec, mt:0.2, flexShrink:0 }}>{icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif", fontWeight:600, letterSpacing:'0.04em', display:'block' }}>
                            {label.toUpperCase()}
                          </Typography>
                          <Typography sx={{ color: textPri, fontFamily:"'Google Sans',sans-serif", fontWeight:500, fontSize:'0.88rem' }}>
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
                bgcolor: cardBg, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
                border:`1px solid ${border}`, borderRadius:'20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb: 2.5 }}>
                  <PeopleIcon sx={{ color: INDIGO, fontSize: 18 }} />
                  <Typography sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.1em', color: textSec, textTransform:'uppercase' }}>
                    GUARDIAN DETAILS
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label:'Guardian Name', value: athlete.guardian_name || '—' },
                    { label:'Relation',      value: athlete.relation || '—'      },
                    { label:'Mobile',        value: athlete.guardian_mobile || '—'},
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={4} key={label}>
                      <Typography variant="caption" sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif", fontWeight:600, letterSpacing:'0.04em', display:'block' }}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: textPri, fontFamily:"'Google Sans',sans-serif", fontWeight:500, fontSize:'0.88rem' }}>
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
