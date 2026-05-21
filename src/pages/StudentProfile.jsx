// ─────────────────────────────────────────────────────────────
// pages/StudentProfile.jsx  –  Full student profile for Coach
// Accessed via /coach/student/:id
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, AppBar, Toolbar, Button,
  Grid, Paper, Chip, Divider, CircularProgress, Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import FamilyIcon from '@mui/icons-material/FamilyRestroom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsIcon from '@mui/icons-material/Sports';
import ArticleIcon from '@mui/icons-material/Article';
import GroupsIcon from '@mui/icons-material/Groups';

// ── Status chip mapping ───────────────────────────────────────
const STATUS_COLOR = { Pending: 'warning', Approved: 'success', Rejected: 'error' };

// ── Reusable info row ─────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 500 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Box>
  );
}

// ── Section card wrapper ──────────────────────────────────────
function SectionCard({ icon, title, children }) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e6ed', borderRadius: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Auth guard ──────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem('coach')) {
      navigate('/coach/login');
    }
  }, [navigate]);

  // ── Fetch student ───────────────────────────────────────
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await axios.get(`/api/coaches/students/${id}`);
        setStudent(data);
      } catch (err) {
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
        <Alert severity="error">{error || 'Student not found.'}</Alert>
      </Container>
    );
  }

  const sports = (() => {
    try { return JSON.parse(student.sports_applied); }
    catch { return student.sports_applied ? [student.sports_applied] : []; }
  })();

  // ── File URL builder ────────────────────────────────────
  const fileUrl = (path) => path ? `http://localhost:5001/${path}` : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* AppBar */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Button color="inherit" startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/coach/dashboard')} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Student Profile
          </Typography>
          <Chip
            label={student.status}
            color={STATUS_COLOR[student.status] || 'default'}
            sx={{ color: '#fff', fontWeight: 600 }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" color="primary">{student.full_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Registered on:{' '}
            {student.created_at
              ? new Date(student.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'}
          </Typography>
        </Box>

        <Grid container spacing={3}>

          {/* ── Personal Details ── */}
          <Grid item xs={12} md={6}>
            <SectionCard icon={<PersonIcon color="primary" />} title="Personal Details">
              <InfoRow label="Full Name" value={student.full_name} />
              <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : ''} />
              <InfoRow label="Age" value={student.age} />
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Mobile" value={student.mobile} />
              <InfoRow label="Email" value={student.email} />
            </SectionCard>
          </Grid>

          {/* ── Guardian Details ── */}
          <Grid item xs={12} md={6}>
            <SectionCard icon={<FamilyIcon color="secondary" />} title="Guardian Details">
              <InfoRow label="Guardian Name" value={student.guardian_name} />
              <InfoRow label="Guardian Mobile" value={student.guardian_mobile} />
              <InfoRow label="Relation" value={student.relation} />
            </SectionCard>
          </Grid>

          {/* ── Address Details ── */}
          <Grid item xs={12} md={6}>
            <SectionCard icon={<LocationOnIcon sx={{ color: '#e65100' }} />} title="Address Details">
              <InfoRow label="Address" value={student.address} />
              <InfoRow label="City" value={student.city} />
              <InfoRow label="State" value={student.state} />
              <InfoRow label="Pincode" value={student.pincode} />
            </SectionCard>
          </Grid>

          {/* ── Club / State Details ── */}
          <Grid item xs={12} md={6}>
            <SectionCard icon={<GroupsIcon sx={{ color: '#6a1b9a' }} />} title="Club / State Details">
              <InfoRow label="Club Name" value={student.club_name} />
              <InfoRow label="State Association" value={student.state_association} />
            </SectionCard>
          </Grid>

          {/* ── Sports / Competition ── */}
          <Grid item xs={12}>
            <SectionCard icon={<SportsIcon color="secondary" />} title="Sports & Competition Details">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Sports Applied For:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {sports.map(s => (
                  <Chip key={s} label={s} variant="outlined" color="secondary" />
                ))}
              </Box>
              <InfoRow label="Competition Name" value={student.competition_name} />
              <InfoRow label="Age Group" value={student.age_group} />
            </SectionCard>
          </Grid>

          {/* ── Documents ── */}
          <Grid item xs={12}>
            <SectionCard icon={<ArticleIcon sx={{ color: '#0277bd' }} />} title="Documents">
              <Grid container spacing={2}>
                {[
                  { key: 'photo', label: 'Athlete Photo' },
                  { key: 'birth_certificate', label: 'Birth Certificate' },
                  { key: 'id_proof', label: 'ID Proof' },
                ].map(({ key, label }) => {
                  const url = fileUrl(student[key]);
                  return (
                    <Grid item xs={12} sm={4} key={key}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>{label}</Typography>
                        {url ? (
                          <Button
                            variant="contained"
                            size="small"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View / Download
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Not uploaded</Typography>
                        )}
                      </Paper>
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
