// ─────────────────────────────────────────────────────────────
// pages/PaymentTracking.jsx  –  Coach/Admin: Payment Tracking
//
// Shows all student payments with filters, summary cards,
// CSV export, and receipt download.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert,
  CircularProgress, TextField, Select, MenuItem, useTheme,
  InputAdornment, Tooltip, IconButton, Grid, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ArrowBackIcon      from '@mui/icons-material/ArrowBack';
import RefreshIcon        from '@mui/icons-material/Refresh';
import DownloadIcon       from '@mui/icons-material/Download';
import FileDownloadIcon   from '@mui/icons-material/FileDownload';
import SearchIcon         from '@mui/icons-material/Search';
import FilterListIcon     from '@mui/icons-material/FilterList';
import PaymentIcon        from '@mui/icons-material/Payment';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon   from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CurrencyRupeeIcon  from '@mui/icons-material/CurrencyRupee';
import EmojiEventsIcon    from '@mui/icons-material/EmojiEvents';
import DeleteIcon         from '@mui/icons-material/Delete';

const statusConfig = {
  Paid:    { color: 'success', icon: CheckCircleIcon,    label: 'Paid'    },
  Pending: { color: 'warning', icon: HourglassEmptyIcon, label: 'Pending' },
  Failed:  { color: 'error',   icon: ErrorOutlineIcon,   label: 'Failed'  },
};

export default function PaymentTracking() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const LIME    = isDark ? '#d4ff00' : '#536600';
  const CYAN    = isDark ? '#06b6d4' : '#004e5c';
  const bg      = isDark ? '#0A0A12'                : '#F0F4F8';
  const cardBg  = isDark ? 'rgba(17,24,39,0.7)'     : 'rgba(255,255,255,0.9)';
  const border  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf'                : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  const [payments,     setPayments]     = useState([]);
  const [summary,      setSummary]      = useState({ total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [filter,       setFilter]       = useState('All');
  const [search,       setSearch]       = useState('');
  const [downloading,  setDownloading]  = useState(null);
  const [exporting,    setExporting]    = useState(false);

  // Tournaments states
  const [tournaments, setTournaments] = useState([]);
  const [tDialog, setTDialog]         = useState(false);
  const [tLoading, setTLoading]       = useState(false);
  const [tForm, setTForm]             = useState({ name: '', sport: 'Athletics', event_date: '', fee_amount: 1000, description: '' });

  const fetchTournaments = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/tournaments');
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  }, []);

  useEffect(() => {
    const coach = localStorage.getItem('coach');
    if (!coach) { navigate('/coach/login'); return; }
    fetchPayments();
    fetchTournaments();
  }, [navigate, fetchTournaments]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/payments/admin/all');
      setPayments(data.payments || []);
      setSummary(data.summary  || { total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 });
    } catch {
      setError('Failed to load payment records.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setTLoading(true);
    setError('');
    try {
      await axios.post('/api/tournaments/create', tForm);
      showSuccess('🏆 Tournament created successfully!');
      setTForm({ name: '', sport: 'Athletics', event_date: '', fee_amount: 1000, description: '' });
      fetchTournaments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament.');
    } finally {
      setTLoading(false);
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    setError('');
    try {
      await axios.delete(`/api/tournaments/${id}`);
      showSuccess('Tournament deleted successfully.');
      fetchTournaments();
    } catch (err) {
      setError('Failed to delete tournament.');
    }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  // ── CSV Export ────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get('/api/payments/admin/export', { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `payments_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showSuccess('Payment records exported successfully.');
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ── Download receipt ──────────────────────────────────────────
  const handleDownload = async (paymentId) => {
    setDownloading(paymentId);
    try {
      const res = await axios.get(`/api/payments/receipt/${paymentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `receipt-${paymentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Receipt not available for this payment.');
    } finally {
      setDownloading(null);
    }
  };

  // ── Filter + search ───────────────────────────────────────────
  const filtered = payments.filter(p => {
    const matchFilter = filter === 'All' || p.payment_status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.student_name?.toLowerCase().includes(q)  ||
      p.student_email?.toLowerCase().includes(q) ||
      p.competition_name?.toLowerCase().includes(q) ||
      p.razorpay_payment_id?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '—';

  // ── Summary stat cards config ─────────────────────────────────
  const statCards = [
    { label: 'Total Payments', value: summary.total,                         color: CYAN,      icon: PaymentIcon        },
    { label: 'Paid',           value: summary.paid,                          color: '#34D399', icon: CheckCircleIcon    },
    { label: 'Pending',        value: summary.pending,                       color: '#FBBF24', icon: HourglassEmptyIcon },
    { label: 'Failed',         value: summary.failed,                        color: '#ffb4ab', icon: ErrorOutlineIcon   },
    { label: 'Total Revenue',  value: `₹${(summary.revenue || 0).toFixed(0)}`, color: LIME,   icon: CurrencyRupeeIcon  },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {isDark && (
        <>
          <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <Box sx={{ position: 'fixed', bottom: '5%', left: '-3%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        </>
      )}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase', mb: 0.5 }}>
              COMMAND CENTER
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon sx={{ color: LIME, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
                Payment Tracking
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>

            <Button
              size="small" startIcon={exporting ? <CircularProgress size={13} /> : <FileDownloadIcon />}
              onClick={handleExport} disabled={exporting || payments.length === 0}
              sx={{ borderRadius: '9999px', border: `1px solid ${isDark ? 'rgba(212,255,0,0.3)' : 'rgba(83,102,0,0.25)'}`, color: LIME, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, '&:hover': { bgcolor: isDark ? 'rgba(212,255,0,0.06)' : 'rgba(83,102,0,0.04)' } }}
            >
              Export CSV
            </Button>
            <Button
              size="small" startIcon={<RefreshIcon />} onClick={fetchPayments}
              sx={{ borderRadius: '9999px', border: `1px solid ${border}`, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: CYAN, color: CYAN } }}
            >
              Refresh
            </Button>
            <Button
              size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/coach/dashboard')}
              sx={{ borderRadius: '9999px', border: `1px solid ${border}`, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: LIME, color: LIME } }}
            >
              Dashboard
            </Button>
          </Box>
        </Box>

        {/* ── Alerts ─────────────────────────────────────────── */}
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* ── Summary Cards ───────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {statCards.map(({ label, value, color, icon: Icon }) => (
            <Box
              key={label}
              sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '20px', px: 3, py: 2.5, backdropFilter: 'blur(12px)', flex: '1 1 140px', minWidth: 120, position: 'relative', overflow: 'hidden' }}
            >
              <Icon sx={{ position: 'absolute', right: 14, top: 14, fontSize: 28, color: color, opacity: 0.18 }} />
              <Typography sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, fontSize: '2rem', color, lineHeight: 1, mb: 0.5 }}>
                {value}
              </Typography>
              <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ── Filters row ─────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <TextField
            size="small" placeholder="Search name, email, competition…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: textSec }} /></InputAdornment> }}
            sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', fontFamily: "'Google Sans',sans-serif" } }}
          />

          {/* Status filter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: textSec, fontSize: 18 }} />
            {['All', 'Paid', 'Pending', 'Failed'].map(f => (
              <Button
                key={f} size="small"
                onClick={() => setFilter(f)}
                variant={filter === f ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: '9999px',
                  fontFamily: "'Google Sans',sans-serif",
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  minWidth: 70,
                  ...(filter === f
                    ? { bgcolor: f === 'Paid' ? '#34D399' : f === 'Failed' ? '#ffb4ab' : f === 'Pending' ? '#FBBF24' : LIME, color: '#0A0A12', '&:hover': { bgcolor: f === 'Paid' ? '#22c55e' : f === 'Failed' ? '#fca5a5' : f === 'Pending' ? '#f59e0b' : (isDark ? '#e8ff4d' : '#3e4c00') } }
                    : { borderColor: border, color: textSec, '&:hover': { borderColor: LIME, color: LIME } }
                  ),
                }}
              >
                {f}
              </Button>
            ))}
          </Box>

          <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", ml: 'auto' }}>
            Showing {filtered.length} of {payments.length} records
          </Typography>
        </Box>

        {/* ── Table ──────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: LIME }} />
            <Typography sx={{ mt: 2, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Loading payments…</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '24px', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PaymentIcon sx={{ fontSize: 48, color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', mb: 2 }} />
                <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600 }}>
                  {payments.length === 0 ? 'No payment records yet.' : 'No records match your filter.'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Student', 'Email', 'Mobile', 'Competition', 'Fee Type', 'Amount', 'Status', 'Razorpay Pay. ID', 'Paid At', 'Receipt'].map(h => (
                        <TableCell key={h} sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.67rem', letterSpacing: '0.06em', color: textSec, textTransform: 'uppercase', borderColor: border, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', whiteSpace: 'nowrap', py: 1.5, px: 2 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((row) => {
                      const sc         = statusConfig[row.payment_status] || statusConfig.Pending;
                      const StatusIcon = sc.icon;
                      const isPaid     = row.payment_status === 'Paid';

                      return (
                        <TableRow key={row.id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>

                          {/* Student */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2 }}>
                            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.85rem', color: textPri }}>{row.student_name || '—'}</Typography>
                          </TableCell>

                          {/* Email */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem' }}>
                            {row.student_email || '—'}
                          </TableCell>

                          {/* Mobile */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {row.student_mobile || '—'}
                          </TableCell>

                          {/* Competition */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2, maxWidth: 160 }}>
                            <Tooltip title={row.competition_name || '—'}>
                              <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem', color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                                {row.competition_name || '—'}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* Fee Type */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {row.fee_type}
                          </TableCell>

                          {/* Amount */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2 }}>
                            <Typography sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 700, color: LIME, fontSize: '0.9rem' }}>
                              ₹{parseFloat(row.amount).toFixed(2)}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2 }}>
                            <Chip
                              icon={<StatusIcon style={{ fontSize: 13 }} />}
                              label={sc.label}
                              size="small"
                              color={sc.color}
                              sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem' }}
                            />
                          </TableCell>

                          {/* Razorpay ID */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2, maxWidth: 160 }}>
                            <Tooltip title={row.razorpay_payment_id || (row.failure_reason || '—')}>
                              <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontSize: '0.75rem', color: isPaid ? textSec : '#ffb4ab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                                {row.razorpay_payment_id || (row.failure_reason ? row.failure_reason.substring(0, 28) + '…' : '—')}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* Paid At */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {isPaid ? fmtDate(row.paid_at) : '—'}
                          </TableCell>

                          {/* Receipt */}
                          <TableCell sx={{ borderColor: border, py: 1.5, px: 2 }}>
                            {isPaid && row.receipt_url ? (
                              <Tooltip title="Download Receipt PDF">
                                <IconButton
                                  size="small"
                                  disabled={downloading === row.id}
                                  onClick={() => handleDownload(row.id)}
                                  sx={{ bgcolor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(52,211,153,0.15)' } }}
                                >
                                  {downloading === row.id
                                    ? <CircularProgress size={13} sx={{ color: '#34D399' }} />
                                    : <DownloadIcon sx={{ fontSize: 15 }} />}
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontStyle: 'italic' }}>
                                {isPaid ? 'No receipt' : '—'}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </Container>


    </Box>
  );
}
