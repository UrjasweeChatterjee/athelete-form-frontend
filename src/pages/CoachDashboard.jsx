// ─────────────────────────────────────────────────────────────
// pages/CoachDashboard.jsx  –  Admin dashboard
// Professional: dark cards, indigo + cyan accents
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback } from 'react';
import { STATUS_COLORS } from '../context/ThemeContext';
import {
  Box, Container, Typography, Button, Grid,
  Chip, CircularProgress, Alert, useTheme, alpha,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField, InputAdornment, MenuItem, Select, FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import CancelIcon       from '@mui/icons-material/Cancel';
import VisibilityIcon   from '@mui/icons-material/Visibility';
import DownloadIcon     from '@mui/icons-material/Download';
import StorageIcon      from '@mui/icons-material/Storage';
import PeopleIcon       from '@mui/icons-material/People';
import HourglassIcon    from '@mui/icons-material/HourglassEmpty';
import TaskAltIcon      from '@mui/icons-material/TaskAlt';
import BlockIcon        from '@mui/icons-material/Block';
import SearchIcon       from '@mui/icons-material/Search';

const SPORT_EMOJIS = {
  Cricket:'🏏', Football:'⚽', Badminton:'🏸', Athletics:'🏃',
  Swimming:'🏊', Basketball:'🏀', Volleyball:'🏐', 'Table Tennis':'🏓',
};

// Use shared status colors from ThemeContext
const STATUS_CONFIG = STATUS_COLORS;

// ── Stat card (screenshot style) ──────────────────────────────
function StatCard({ icon, label, value, accent, theme, isDark }) {
  return (
    <Box
      sx={{
        bgcolor: isDark ? '#111827' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
        borderRadius: '20px',
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(accent, 0.4),
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 32px ${alpha(accent, 0.12)}`,
        },
      }}
    >
      {/* Top strip */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: accent }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', fontSize: '0.6rem', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}
          >
            {label}
          </Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: accent, lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 40, height: 40,
            borderRadius: '12px',
            bgcolor: alpha(accent, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon, { sx: { color: accent, fontSize: 20 } })}
        </Box>
      </Box>
    </Box>
  );
}

// ── Athlete horizontal card ────────────────────────────────────
function AthleteCard({ student, onView, onApprove, onReject, actionLoading, theme, isDark }) {
  const statusCfg = STATUS_CONFIG[student.status] || STATUS_CONFIG.Pending;
  const parseSports = (raw) => { try { return JSON.parse(raw); } catch { return raw ? [raw] : []; } };
  const sports = parseSports(student.sports_applied);
  const initials = student.full_name
    ? student.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        p: 2.5,
        bgcolor: isDark ? '#111827' : '#FFFFFF',
        borderRadius: '16px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'}`,
        transition: 'all 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        '&:hover': {
          borderColor: alpha(statusCfg.color, 0.35),
          '& .left-accent': { opacity: 1 },
        },
      }}
    >
      {/* Left accent bar */}
      <Box
        className="left-accent"
        sx={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          bgcolor: statusCfg.color,
          opacity: 0.4,
          borderRadius: '16px 0 0 16px',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Avatar */}
      <Box
        sx={{
          width: 48, height: 48,
          borderRadius: '14px',
          bgcolor: alpha(statusCfg.color, 0.15),
          border: `1.5px solid ${alpha(statusCfg.color, 0.3)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontWeight: 800,
          fontSize: '0.9rem',
          color: statusCfg.color,
          letterSpacing: '-0.02em',
        }}
      >
        {initials}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {student.full_name}
          </Typography>
          <Box
            sx={{
              px: 1, py: 0.2,
              borderRadius: '6px',
              bgcolor: statusCfg.bg,
              border: `1px solid ${statusCfg.border}`,
            }}
          >
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: statusCfg.color, letterSpacing: '0.05em' }}>
              {student.status?.toUpperCase() || 'PENDING'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          📞 {student.mobile}
          {student.age_group ? ` · ${student.age_group}` : ''}
          {student.competition_name ? ` · ${student.competition_name}` : ''}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {sports.slice(0, 4).map(s => (
            <Box
              key={s}
              sx={{
                px: 1, py: 0.15,
                borderRadius: '6px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'primary.main' }}>
                {SPORT_EMOJIS[s] || '🏅'} {s}
              </Typography>
            </Box>
          ))}
          {sports.length > 4 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
              +{sports.length - 4}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          onClick={() => onView(student.id)}
          sx={{
            borderRadius: '10px',
            px: 1.5, py: 0.75,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            color: 'text.secondary',
            border: `1px solid ${theme.palette.divider}`,
            fontSize: '0.72rem',
            '&:hover': { borderColor: theme.palette.primary.main, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
          startIcon={<VisibilityIcon sx={{ fontSize: '13px !important' }} />}
        >
          View
        </Button>

        {student.status !== 'Approved' && (
          <Button
            size="small"
            onClick={() => onApprove(student.id, student.full_name)}
            disabled={actionLoading === student.id}
            sx={{
              borderRadius: '10px',
              px: 1.5, py: 0.75,
              bgcolor: STATUS_COLORS.Approved.bg,
              color: STATUS_COLORS.Approved.color,
              border: `1px solid ${STATUS_COLORS.Approved.border}`,
              fontSize: '0.72rem',
              '&:hover': { bgcolor: `rgba(52,211,153,0.2)` },
            }}
            startIcon={actionLoading === student.id
              ? <CircularProgress size={10} sx={{ color: STATUS_COLORS.Approved.color }} />
              : <CheckCircleIcon sx={{ fontSize: '13px !important' }} />}
          >
            Approve
          </Button>
        )}

        {student.status !== 'Rejected' && (
          <Button
            size="small"
            onClick={() => onReject(student.id, student.full_name)}
            disabled={actionLoading === student.id}
            sx={{
              borderRadius: '10px',
              px: 1.5, py: 0.75,
              bgcolor: STATUS_COLORS.Rejected.bg,
              color: STATUS_COLORS.Rejected.color,
              border: `1px solid ${STATUS_COLORS.Rejected.border}`,
              fontSize: '0.72rem',
              '&:hover': { bgcolor: `rgba(248,113,113,0.2)` },
            }}
            startIcon={<CancelIcon sx={{ fontSize: '13px !important' }} />}
          >
            Reject
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function CoachDashboard() {
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isDark    = theme.palette.mode === 'dark';

  const [coach, setCoach]                 = useState(null);
  const [students, setStudents]           = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [stats, setStats]                 = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const [search, setSearch]               = useState('');
  const [filter, setFilter]               = useState('All');
  const [dialog, setDialog]               = useState({ open: false, studentId: null, status: '', name: '' });

  useEffect(() => {
    const stored = localStorage.getItem('coach');
    if (!stored) { navigate('/coach/login'); return; }
    setCoach(JSON.parse(stored));
  }, [navigate]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/coaches/students');
      setStudents(data.students);
      setFiltered(data.students);
      setStats(data.stats);
    } catch {
      setError('Failed to load students. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    let result = students;
    if (filter !== 'All') result = result.filter(s => s.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.mobile?.includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [students, search, filter]);

  const handleLogout = () => { localStorage.removeItem('coach'); navigate('/'); };
  const openApprove  = (id, name) => setDialog({ open: true, studentId: id, status: 'Approved', name });
  const openReject   = (id, name) => setDialog({ open: true, studentId: id, status: 'Rejected', name });
  const closeDialog  = () => setDialog({ open: false, studentId: null, status: '', name: '' });

  const handleStatusUpdate = async () => {
    const { studentId, status } = dialog;
    closeDialog();
    setActionLoading(studentId);
    setError(''); setSuccessMsg('');
    try {
      await axios.put(`/api/coaches/students/${studentId}/status`, { status });
      setSuccessMsg(`Application ${status.toLowerCase()} successfully. Email sent.`);
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar title="Admin Dashboard" userName={coach?.name} onLogout={handleLogout} />

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Section header (screenshot style) */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            MANAGEMENT
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary' }}>
            ATHLETE APPLICATIONS
          </Typography>
        </Box>

        {/* Stat cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { icon: <PeopleIcon />,    label: 'TOTAL REGISTERED', value: stats.total,    accent: theme.palette.primary.main },
            { icon: <HourglassIcon />, label: 'PENDING REVIEW',   value: stats.pending,  accent: STATUS_COLORS.Pending.color },
            { icon: <TaskAltIcon />,   label: 'APPROVED',          value: stats.approved, accent: STATUS_COLORS.Approved.color },
            { icon: <BlockIcon />,     label: 'REJECTED',          value: stats.rejected, accent: STATUS_COLORS.Rejected.color },
          ].map((s) => (
            <Grid item xs={6} sm={3} key={s.label}>
              <StatCard {...s} theme={theme} isDark={isDark} />
            </Grid>
          ))}
        </Grid>

        {/* Alerts */}
        {error      && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center',
            bgcolor: isDark ? '#111827' : '#FFFFFF',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '16px',
            p: 2,
          }}
        >
          <TextField
            placeholder="Search by name, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button
              size="small"
              startIcon={<DownloadIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => window.open('/api/coaches/export/csv', '_blank')}
              sx={{
                borderRadius: '10px', px: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                fontSize: '0.72rem',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
              }}
            >
              CSV
            </Button>
            <Button
              size="small"
              startIcon={<StorageIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => window.open('/api/coaches/export/sql', '_blank')}
              sx={{
                borderRadius: '10px', px: 1.5,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: 'secondary.main',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                fontSize: '0.72rem',
                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.18) },
              }}
            >
              SQL
            </Button>
          </Box>
        </Box>

        {/* Athlete list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center', py: 10,
              bgcolor: isDark ? '#111827' : '#FFFFFF',
              borderRadius: '20px',
              border: `2px dashed ${theme.palette.divider}`,
            }}
          >
            <Typography sx={{ fontSize: 48, mb: 1 }}>🔍</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {students.length === 0 ? 'No registrations yet' : 'No results found'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.6 }}>
              {students.length === 0 ? 'Athlete registrations will appear here.' : 'Try adjusting your search or filter.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Showing {filtered.length} of {students.length} applications
            </Typography>
            {filtered.map((student) => (
              <AthleteCard
                key={student.id}
                student={student}
                theme={theme}
                isDark={isDark}
                actionLoading={actionLoading}
                onView={(id) => navigate(`/coach/student/${id}`)}
                onApprove={openApprove}
                onReject={openReject}
              />
            ))}
          </Box>
        )}
      </Container>

      {/* Confirm dialog */}
      <Dialog
        open={dialog.open}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#111827' : '#FFFFFF',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '20px',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Are you sure you want to <strong style={{ color: 'inherit' }}>{dialog.status}</strong> the application of{' '}
            <strong style={{ color: 'inherit' }}>{dialog.name}</strong>?
            {dialog.status === 'Approved'
              ? ' An approval email will be sent.'
              : ' A rejection email will be sent.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={closeDialog}
            sx={{
              borderRadius: '10px',
              color: 'text.secondary',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              bgcolor: dialog.status === 'Approved' ? STATUS_COLORS.Approved.bg : STATUS_COLORS.Rejected.bg,
              color:   dialog.status === 'Approved' ? STATUS_COLORS.Approved.color : STATUS_COLORS.Rejected.color,
              border: `1px solid ${dialog.status === 'Approved' ? STATUS_COLORS.Approved.border : STATUS_COLORS.Rejected.border}`,
              '&:hover': {
                bgcolor: dialog.status === 'Approved' ? 'rgba(52,211,153,0.22)' : 'rgba(248,113,113,0.22)',
              },
            }}
          >
            Yes, {dialog.status}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
