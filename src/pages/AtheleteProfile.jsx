// ─────────────────────────────────────────────────────────────
// pages/AtheleteProfile.jsx  –  Full profile for Coach (revamped)
// ─────────────────────────────────────────────────────────────
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

const STATUS_CONFIG = {
  Pending: { color: '#FDCB6E', bg: 'rgba(253,203,110,0.12)', border: 'rgba(253,203,110,0.4)' },
  Approved: { color: '#00B894', bg: 'rgba(0,184,148,0.12)', border: 'rgba(0,184,148,0.4)' },
  Rejected: { color: '#E17055', bg: 'rgba(225,112,85,0.12)', border: 'rgba(225,112,85,0.4)' },
};

const SPORT_EMOJIS = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Athletics: '🏃',
  Swimming: '🏊', Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓',
};

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
      <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function SectionCard({ icon, title, children, theme, isDark }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: isDark ? alpha('#1A1A2E', 0.8) : alpha('#fff', 0.9),
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(20px)',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );
}

export default function AtheleteProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('coach')) navigate('/coach/login');
  }, [navigate]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await axios.get(`/api/coaches/students/${id}`);
        setStudent(data);
      } catch {
        setError('Could not load student profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error || 'Athlete not found.'}</Alert>
      </Container>
    );
  }

  const sports = (() => {
    try { return JSON.parse(student.sports_applied); }
    catch { return student.sports_applied ? [student.sports_applied] : []; }
  })();

  const statusCfg = STATUS_CONFIG[student.status] || STATUS_CONFIG.Pending;
  const fileUrl = (path) => path ? `http://localhost:5002/${path}` : null;

  // Initials
  const initials = student.full_name
    ? student.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar title="🏅 Athlete Profile" />

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/coach/dashboard')}
          sx={{ mb: 3, borderRadius: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Back to Dashboard
        </Button>

        {/* Profile header card */}
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{
              position: 'absolute', right: -40 + i * 15, top: -40 + i * 10,
              width: 120 + i * 50, height: 120 + i * 50,
              borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
            }} />
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 800, color: '#fff',
              backdropFilter: 'blur(10px)',
            }}>
              {initials}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
                {student.full_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                {student.email} &nbsp;·&nbsp; {student.mobile}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Registered:{' '}
                {student.created_at
                  ? new Date(student.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </Typography>
            </Box>
            <Chip
              label={student.status || 'Pending'}
              sx={{
                bgcolor: statusCfg.bg,
                color: statusCfg.color,
                border: `1.5px solid ${statusCfg.border}`,
                fontWeight: 700,
                fontSize: '0.85rem',
                px: 1,
                backdropFilter: 'blur(10px)',
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SectionCard icon={<PersonIcon sx={{ color: 'primary.main' }} />} title="Personal Details" theme={theme} isDark={isDark}>
              <InfoRow label="Full Name" value={student.full_name} />
              <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : ''} />
              <InfoRow label="Age" value={student.age} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Mobile" value={student.mobile} />
              <InfoRow label="Email" value={student.email} />
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionCard icon={<FamilyIcon sx={{ color: 'secondary.main' }} />} title="Guardian Details" theme={theme} isDark={isDark}>
              <InfoRow label="Guardian Name" value={student.guardian_name} />
              <InfoRow label="Guardian Mobile" value={student.guardian_mobile} />
              <InfoRow label="Relation" value={student.relation} />
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionCard icon={<LocationOnIcon sx={{ color: '#E17055' }} />} title="Address Details" theme={theme} isDark={isDark}>
              <InfoRow label="Address" value={student.address} />
              <InfoRow label="City" value={student.city} />
              <InfoRow label="State" value={student.state} />
              <InfoRow label="Pincode" value={student.pincode} />
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionCard icon={<GroupsIcon sx={{ color: '#6C5CE7' }} />} title="Club / State Details" theme={theme} isDark={isDark}>
              <InfoRow label="Club Name" value={student.club_name} />
              <InfoRow label="State Association" value={student.state_association} />
              <InfoRow label="Competition" value={student.competition_name} />
              <InfoRow label="Age Group" value={student.age_group} />
            </SectionCard>
          </Grid>

          <Grid item xs={12}>
            <SectionCard icon={<SportsIcon sx={{ color: 'secondary.main' }} />} title="Sports Applied" theme={theme} isDark={isDark}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {sports.map(s => (
                  <Chip
                    key={s}
                    label={`${SPORT_EMOJIS[s] || '🏅'} ${s}`}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      py: 2,
                      px: 1,
                      borderRadius: 2,
                    }}
                  />
                ))}
                {sports.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No sports selected.</Typography>
                )}
              </Box>
            </SectionCard>
          </Grid>

          <Grid item xs={12}>
            <SectionCard icon={<ArticleIcon sx={{ color: '#0984E3' }} />} title="Documents" theme={theme} isDark={isDark}>
              <Grid container spacing={2}>
                {[
                  { key: 'photo', label: 'Athlete Photo', emoji: '🤳' },
                  { key: 'birth_certificate', label: 'Birth Certificate', emoji: '📜' },
                  { key: 'id_proof', label: 'ID Proof', emoji: '🪪' },
                ].map(({ key, label, emoji }) => {
                  const url = fileUrl(student[key]);
                  return (
                    <Grid item xs={12} sm={4} key={key}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          textAlign: 'center',
                          border: `1.5px dashed ${url ? alpha(theme.palette.success.main, 0.5) : theme.palette.divider}`,
                          bgcolor: url ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Typography sx={{ fontSize: 32, mb: 1 }}>{url ? '✅' : emoji}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>{label}</Typography>
                        {url ? (
                          <Button
                            variant="outlined"
                            size="small"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              borderRadius: 2,
                              borderColor: alpha(theme.palette.success.main, 0.5),
                              color: 'success.main',
                              '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.08) },
                            }}
                          >
                            View / Download
                          </Button>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Not uploaded</Typography>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </SectionCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
