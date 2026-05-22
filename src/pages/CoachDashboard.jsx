// pages/CoachDashboard.jsx  –  Stitch "Admin Terminal" Design
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, TextField, Button, Grid,
  Chip, CircularProgress, Alert, MenuItem, Select,
  InputAdornment, useTheme, alpha, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupsIcon from '@mui/icons-material/Groups';
import PendingIcon from '@mui/icons-material/Pending';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';

const STATUS_CONFIG = {
  Pending: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  Approved: { color: '#d4ff00', bg: 'rgba(212,255,0,0.1)', border: 'rgba(212,255,0,0.28)' },
  Rejected: { color: '#ffb4ab', bg: 'rgba(255,180,171,0.1)', border: 'rgba(255,180,171,0.25)' },
};

const SPORT_EMOJIS = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Athletics: '🏃',
  Swimming: '🏊', Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓',
};

function parseSports(raw) { try { return JSON.parse(raw); } catch { return raw ? [raw] : []; } }

// ── Athlete Row Card ──────────────────────────────────────────
function AthleteCard({ athlete, onView, onApprove, onReject, actionLoading, isDark, cardBg, border, textPri, textSec }) {
  const sc = STATUS_CONFIG[athlete.status] || STATUS_CONFIG.Pending;
  const sports = parseSports(athlete.sports_applied);
  const initials = athlete.full_name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  return (
    <Box sx={{
      bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${border}`, borderRadius: '20px', p: 2.5,
      backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
      transition: 'all 0.25s ease',
      '&:hover': { transform: 'translateY(-3px)', border: `1px solid ${alpha(sc.color, 0.35)}`, boxShadow: `0 12px 32px ${alpha(sc.color, 0.1)}` },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Avatar */}
        <Box sx={{ width: 46, height: 46, borderRadius: '14px', flexShrink: 0, background: `linear-gradient(135deg, ${alpha(sc.color, 0.2)}, rgba(99,102,241,0.2))`, border: `2px solid ${alpha(sc.color, 0.35)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: sc.color, fontSize: '0.95rem', fontFamily: "'Google Sans Display',sans-serif" }}>
          {initials}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.93rem', color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {athlete.full_name}
            </Typography>
            <Chip label={athlete.status || 'Pending'} size="small" sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em', height: 20, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: '9999px' }} />
          </Box>
          <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
            {athlete.mobile} · {athlete.age_group || 'N/A'} · {athlete.competition_name || 'N/A'}
          </Typography>
          {sports.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {sports.slice(0, 3).map(s => (
                <Typography key={s} variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
                  {SPORT_EMOJIS[s] || '🏅'} {s}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Tooltip title="View Profile">
            <IconButton size="small" onClick={() => onView(athlete.id)} sx={{ bgcolor: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(0,78,92,0.06)', border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(0,78,92,0.15)'}`, color: isDark ? '#06b6d4' : '#004e5c', borderRadius: '10px', '&:hover': { bgcolor: isDark ? 'rgba(6,182,212,0.15)' : 'rgba(0,78,92,0.12)' } }}>
              <VisibilityIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {(!athlete.status || athlete.status === 'Pending') && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" onClick={() => onApprove(athlete.id, athlete.full_name)} disabled={actionLoading === athlete.id} sx={{ bgcolor: isDark ? 'rgba(212,255,0,0.08)' : 'rgba(83,102,0,0.06)', border: `1px solid ${isDark ? 'rgba(212,255,0,0.2)' : 'rgba(83,102,0,0.15)'}`, color: isDark ? '#d4ff00' : '#536600', borderRadius: '10px', '&:hover': { bgcolor: isDark ? 'rgba(212,255,0,0.15)' : 'rgba(83,102,0,0.12)' } }}>
                  {actionLoading === athlete.id ? <CircularProgress size={14} sx={{ color: isDark ? '#d4ff00' : '#536600' }} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" onClick={() => onReject(athlete.id, athlete.full_name)} disabled={actionLoading === athlete.id} sx={{ bgcolor: 'rgba(255,180,171,0.07)', border: '1px solid rgba(255,180,171,0.2)', color: '#ffb4ab', borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255,180,171,0.14)' } }}>
                  <CancelIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function CoachDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [athletes, setAthletes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, athleteId: null, status: '', name: '' });

  const LIME = isDark ? '#d4ff00' : '#536600';
  const CYAN = isDark ? '#06b6d4' : '#004e5c';
  const INDIGO = '#6366f1';
  const bg = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  const fetchAthletes = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/coaches/students', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setAthletes(data.students);
      setFiltered(data.students);
      setStats(data.stats || {});
    } catch {
      setError('Failed to load athletes. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const coach = localStorage.getItem('coach');
    if (!coach) { navigate('/coach/login'); return; }
    fetchAthletes();
  }, [navigate, fetchAthletes]);

  useEffect(() => {
    let result = athletes;
    if (filter !== 'All') result = result.filter(a => a.status === filter);
    if (search) result = result.filter(a =>
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.mobile?.includes(search)
    );
    setFiltered(result);
  }, [athletes, search, filter]);

  const openApprove = (id, name) => setDialog({ open: true, athleteId: id, status: 'Approved', name });
  const openReject = (id, name) => setDialog({ open: true, athleteId: id, status: 'Rejected', name });
  const closeDialog = () => setDialog({ open: false, athleteId: null, status: '', name: '' });

  const confirmAction = async () => {
    const { athleteId, status } = dialog;
    closeDialog();
    setActionLoading(athleteId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/coaches/students/${athleteId}/status`, { status }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await fetchAthletes();
    } catch (e) {
      setError(`Failed to update: ${e.response?.data?.message || 'Try again.'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/export-athletes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'athletes_export.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError('Export failed. Please try again.'); }
    finally { setExporting(false); }
  };

  const handleLogout = () => { localStorage.removeItem('coach'); localStorage.removeItem('token'); navigate('/'); };

  const statCards = [
    { label: 'Total Athletes', value: stats.total || athletes.length, icon: GroupsIcon, color: CYAN },
    { label: 'Pending', value: stats.pending || athletes.filter(a => a.status === 'Pending').length, icon: PendingIcon, color: '#FBBF24' },
    { label: 'Approved', value: stats.approved || athletes.filter(a => a.status === 'Approved').length, icon: VerifiedIcon, color: isDark ? '#d4ff00' : '#536600' },
    { label: 'Rejected', value: stats.rejected || athletes.filter(a => a.status === 'Rejected').length, icon: BlockIcon, color: '#ffb4ab' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '5%', left: '-3%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase', mb: 0.5 }}>
              COMMAND CENTER
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
              Athlete Management
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button size="small" startIcon={<RefreshIcon />} onClick={fetchAthletes} sx={{ borderRadius: '9999px', borderColor: border, color: textSec, border: `1px solid ${border}`, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: CYAN, color: CYAN } }}>
              Refresh
            </Button>
            <Button size="small" startIcon={exporting ? <CircularProgress size={13} sx={{ color: '#0A0A12' }} /> : <FileDownloadIcon />} onClick={handleExport} disabled={exporting}
              sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.82rem', bgcolor: isDark ? '#d4ff00' : '#536600', color: isDark ? '#0A0A12' : '#ffffff', boxShadow: isDark ? '0 0 16px rgba(212,255,0,0.25)' : 'none', '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' }, '&:disabled': { opacity: 0.6 } }}>
              {exporting ? 'Exporting...' : 'Export Excel'}
            </Button>
            <Button size="small" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ borderRadius: '9999px', borderColor: 'rgba(255,180,171,0.35)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.35)', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: '#ffb4ab', bgcolor: 'rgba(255,180,171,0.06)' } }}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Grid item xs={6} md={3} key={label}>
              <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '20px', p: 2.5, backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ fontSize: 18, color }} />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, fontSize: '2rem', color, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {value ?? '—'}
                </Typography>
                <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em' }}>
                  {label.toUpperCase()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}

        {/* ── Search + Filter ────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search athletes…" value={search} onChange={e => setSearch(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: textSec }} /></InputAdornment> }}
            sx={{
              flex: 1, minWidth: 220,
              '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', fontFamily: "'Google Sans',sans-serif" }
            }}
          />
          <Select value={filter} onChange={e => setFilter(e.target.value)} size="small"
            startAdornment={<FilterListIcon sx={{ fontSize: 16, color: textSec, mr: 0.5 }} />}
            sx={{ minWidth: 140, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, color: textPri }}>
            {['All', 'Pending', 'Approved', 'Rejected'].map(s => <MenuItem key={s} value={s} sx={{ fontFamily: "'Google Sans',sans-serif" }}>{s}</MenuItem>)}
          </Select>
        </Box>

        {/* ── Athletes List ─────────────────────────────────── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: CYAN }} />
            <Typography sx={{ mt: 2, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Loading athlete data…</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, display: 'block', mb: 2 }}>
              Showing {filtered.length} of {athletes.length} athletes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h5" sx={{ mb: 1, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
                    {athletes.length === 0 ? '🚀' : '🔍'}
                  </Typography>
                  <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600 }}>
                    {athletes.length === 0 ? 'No registrations yet' : 'No results found'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSec, mt: 0.5, fontFamily: "'Google Sans',sans-serif" }}>
                    {athletes.length === 0 ? 'Athlete registrations will appear here.' : 'Try adjusting search or filter.'}
                  </Typography>
                </Box>
              ) : (
                filtered.map(athlete => (
                  <AthleteCard
                    key={athlete.id} athlete={athlete}
                    onView={id => navigate(`/coach/athelete/${id}`)}
                    onApprove={openApprove} onReject={openReject}
                    actionLoading={actionLoading}
                    isDark={isDark} cardBg={cardBg} border={border} textPri={textPri} textSec={textSec}
                  />
                ))
              )}
            </Box>
          </>
        )}
      </Container>

      {/* ── Confirm Dialog ────────────────────────────────────── */}
      <Dialog open={dialog.open} onClose={closeDialog} PaperProps={{ sx: { bgcolor: isDark ? 'rgba(17,24,39,0.95)' : '#ffffff', backdropFilter: 'blur(20px)', border: `1px solid ${border}`, borderRadius: '20px', minWidth: 340 } }}>
        <DialogTitle sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, color: textPri, pb: 1 }}>
          Confirm {dialog.status}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
            Are you sure you want to <strong style={{ color: dialog.status === 'Approved' ? (isDark ? '#d4ff00' : '#536600') : '#ffb4ab' }}>{dialog.status?.toLowerCase()}</strong> the application for <strong style={{ color: textPri }}>{dialog.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, color: textSec, border: `1px solid ${border}` }}>
            Cancel
          </Button>
          <Button onClick={confirmAction} variant="contained"
            sx={{
              borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700,
              bgcolor: dialog.status === 'Approved' ? (isDark ? '#d4ff00' : '#536600') : '#93000a',
              color: dialog.status === 'Approved' ? '#0A0A12' : '#ffffff',
              '&:hover': { bgcolor: dialog.status === 'Approved' ? '#e8ff4d' : '#7d0008' },
            }}>
            Confirm {dialog.status}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
