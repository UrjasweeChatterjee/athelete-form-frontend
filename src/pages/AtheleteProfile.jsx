// pages/AtheleteProfile.jsx  –  Stitch "Athlete Profile Review" Design
import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, Grid,
  Chip, CircularProgress, Alert, useTheme, alpha, Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import FamilyIcon from '@mui/icons-material/FamilyRestroom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsIcon from '@mui/icons-material/Sports';
import ArticleIcon from '@mui/icons-material/Article';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const STATUS_CONFIG = {
  Pending: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.28)', label: 'PENDING' },
  Approved: { color: '#d4ff00', bg: 'rgba(212,255,0,0.1)', border: 'rgba(212,255,0,0.3)', label: 'APPROVED' },
  Rejected: { color: '#ffb4ab', bg: 'rgba(255,180,171,0.1)', border: 'rgba(255,180,171,0.28)', label: 'REJECTED' },
};

const SPORT_EMOJIS = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Athletics: '🏃',
  Swimming: '🏊', Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓',
};

// Reusable section card
function SectionCard({ icon: Icon, iconColor, title, children, isDark, cardBg, border }) {
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';
  return (
    <Box sx={{
      bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${border}`, borderRadius: '20px', p: 3,
      backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Icon sx={{ color: iconColor, fontSize: 17 }} />
        <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function InfoRow({ label, value, textPri, textSec }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.05em', display: 'block' }}>
        {label.toUpperCase()}
      </Typography>
      <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: '0.88rem', mt: 0.2 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function AtheleteProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/coaches/students/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setAthlete(data);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load athlete profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchAthlete();
  }, [id]);

  const updateStatus = async (status) => {
    setActionLoading(true); setActionMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/coaches/students/${id}/status`, { status }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setAthlete(prev => ({ ...prev, status }));
      setActionMsg(`✅ Status updated to ${status}`);
    } catch (e) {
      setActionMsg(`❌ Failed: ${e.response?.data?.message || 'Try again.'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Tokens
  const LIME = isDark ? '#d4ff00' : '#536600';
  const CYAN = isDark ? '#06b6d4' : '#004e5c';
  const INDIGO = '#6366f1';
  const bg = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar title="Sports Club Management" />
      <CircularProgress sx={{ color: CYAN }} />
    </Box>
  );

  if (error || !athlete) return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg }}>
      <Navbar title="Sports Club Management" />
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error || 'Athlete not found.'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/coach/dashboard')} sx={{ mt: 2, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
          Back to Dashboard
        </Button>
      </Container>
    </Box>
  );

  const statusCfg = STATUS_CONFIG[athlete.status] || STATUS_CONFIG.Pending;
  const sports = (() => { try { return JSON.parse(athlete.sports_applied); } catch { return athlete.sports_applied ? [athlete.sports_applied] : []; } })();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {isDark && <>
        <Box sx={{ position: 'fixed', top: 0, right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '5%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* Back + header */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/coach/dashboard')}
            sx={{ mb: 2, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, borderRadius: '9999px', border: `1px solid ${border}`, px: 2, py: 0.7, '&:hover': { borderColor: CYAN, color: CYAN } }}>
            Back to Dashboard
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase', mb: 0.5 }}>
                ATHLETE PROFILE REVIEW
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
                {athlete.full_name}
              </Typography>
            </Box>
            {/* Status + action buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip label={statusCfg.label} sx={{
                fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em',
                bgcolor: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`,
                borderRadius: '9999px', height: 30,
              }} />
              {(!athlete.status || athlete.status === 'Pending') && (
                <>
                  <Button variant="contained" size="small" startIcon={actionLoading ? <CircularProgress size={12} sx={{ color: '#0A0A12' }} /> : <CheckCircleIcon />}
                    disabled={actionLoading}
                    onClick={() => updateStatus('Approved')}
                    sx={{
                      borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.8rem',
                      bgcolor: isDark ? '#d4ff00' : '#536600', color: isDark ? '#0A0A12' : '#ffffff',
                      boxShadow: isDark ? '0 0 16px rgba(212,255,0,0.3)' : 'none',
                      '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' }
                    }}>
                    Approve
                  </Button>
                  <Button variant="outlined" size="small" startIcon={actionLoading ? <CircularProgress size={12} /> : <CancelIcon />}
                    disabled={actionLoading}
                    onClick={() => updateStatus('Rejected')}
                    sx={{
                      borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.8rem',
                      borderColor: 'rgba(255,180,171,0.4)', color: '#ffb4ab',
                      '&:hover': { borderColor: '#ffb4ab', bgcolor: 'rgba(255,180,171,0.06)' }
                    }}>
                    Reject
                  </Button>
                </>
              )}
            </Box>
          </Box>
          {actionMsg && (
            <Alert severity={actionMsg.startsWith('✅') ? 'success' : 'error'} sx={{ mt: 2, borderRadius: '12px' }}>
              {actionMsg}
            </Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={4}>
            {/* ID card */}
            <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '24px', overflow: 'hidden', backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none', mb: 3 }}>
              <Box sx={{ height: 4, bgcolor: statusCfg.color }} />
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2, background: `linear-gradient(135deg, ${alpha(statusCfg.color, 0.2)}, ${alpha(INDIGO, 0.2)})`, border: `3px solid ${alpha(statusCfg.color, 0.4)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.9rem', fontWeight: 900, color: statusCfg.color, fontFamily: "'Google Sans Display',sans-serif" }}>
                  {athlete.full_name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                </Box>
                <Typography variant="h6" sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, color: textPri, letterSpacing: '-0.01em' }}>{athlete.full_name}</Typography>
                <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>{athlete.email}</Typography>
                <Divider sx={{ my: 2, borderColor: border }} />
                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '10px', p: 1.5 }}>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", display: 'block', mb: 0.25 }}>ATHLETE ID</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: CYAN, fontWeight: 700, letterSpacing: '0.08em' }}>
                    SCM-{String(athlete.id || 0).padStart(6, '0')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Documents */}
            <SectionCard icon={ArticleIcon} iconColor={CYAN} title="Documents" isDark={isDark} cardBg={cardBg} border={border}>
              {['photo', 'birth_certificate', 'id_proof'].map(doc => {
                const docUrl = athlete[doc];
                const labels = { photo: 'Athlete Photo', birth_certificate: 'Birth Certificate', id_proof: 'ID Proof' };
                return (
                  <Box key={doc} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>{labels[doc].toUpperCase()}</Typography>
                    {docUrl ? (
                      <Button size="small" variant="outlined" href={`http://localhost:5002${docUrl}`} target="_blank" rel="noopener noreferrer"
                        sx={{ borderRadius: '8px', fontSize: '0.75rem', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, borderColor: isDark ? 'rgba(6,182,212,0.35)' : 'rgba(0,78,92,0.3)', color: CYAN, textTransform: 'none', '&:hover': { borderColor: CYAN } }}>
                        View Document ↗
                      </Button>
                    ) : (
                      <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Not uploaded</Typography>
                    )}
                  </Box>
                );
              })}
            </SectionCard>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              <SectionCard icon={PersonIcon} iconColor={CYAN} title="Personal Information" isDark={isDark} cardBg={cardBg} border={border}>
                <Grid container spacing={2.5}>
                  {[
                    { label: 'Date of Birth', value: athlete.dob ? new Date(athlete.dob).toLocaleDateString('en-IN') : '—' },
                    { label: 'Age', value: athlete.age ? `${athlete.age} years` : '—' },
                    { label: 'Gender', value: athlete.gender },
                    { label: 'Mobile', value: athlete.mobile },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <InfoRow label={label} value={value} textPri={textPri} textSec={textSec} />
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>

              <SectionCard icon={FamilyIcon} iconColor={INDIGO} title="Guardian Details" isDark={isDark} cardBg={cardBg} border={border}>
                <Grid container spacing={2.5}>
                  {[
                    { label: 'Guardian Name', value: athlete.guardian_name },
                    { label: 'Relation', value: athlete.relation },
                    { label: 'Mobile', value: athlete.guardian_mobile },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={4} key={label}>
                      <InfoRow label={label} value={value} textPri={textPri} textSec={textSec} />
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>

              <SectionCard icon={LocationOnIcon} iconColor={INDIGO} title="Address" isDark={isDark} cardBg={cardBg} border={border}>
                <Grid container spacing={2.5}>
                  {[
                    { label: 'Address', value: athlete.address },
                    { label: 'City', value: athlete.city },
                    { label: 'State', value: athlete.state },
                    { label: 'Pincode', value: athlete.pincode },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <InfoRow label={label} value={value} textPri={textPri} textSec={textSec} />
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>

              <SectionCard icon={SportsIcon} iconColor={isDark ? '#d4ff00' : '#536600'} title="Sports & Competition" isDark={isDark} cardBg={cardBg} border={border}>
                {sports.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                    {sports.map(s => (
                      <Chip key={s} label={`${SPORT_EMOJIS[s] || '🏅'} ${s}`} sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.8rem', bgcolor: isDark ? 'rgba(212,255,0,0.1)' : 'rgba(83,102,0,0.08)', color: isDark ? '#d4ff00' : '#536600', border: `1px solid ${isDark ? 'rgba(212,255,0,0.25)' : 'rgba(83,102,0,0.2)'}`, borderRadius: '9999px' }} />
                    ))}
                  </Box>
                )}
                <Grid container spacing={2.5}>
                  {[
                    { label: 'Club Name', value: athlete.club_name },
                    { label: 'State Assoc.', value: athlete.state_association },
                    { label: 'Competition', value: athlete.competition_name },
                    { label: 'Age Group', value: athlete.age_group },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <InfoRow label={label} value={value} textPri={textPri} textSec={textSec} />
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>

            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
