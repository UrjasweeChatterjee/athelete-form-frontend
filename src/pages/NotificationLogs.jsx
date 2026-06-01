// pages/NotificationLogs.jsx  –  Coach/Admin: Notification Logs & Manual Send
// Shows all notification audit logs and allows sending manual emails.

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, useTheme, alpha, Select, MenuItem, InputAdornment,
  Divider, Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ArrowBackIcon  from '@mui/icons-material/ArrowBack';
import RefreshIcon    from '@mui/icons-material/Refresh';
import SendIcon       from '@mui/icons-material/Send';
import EmailIcon      from '@mui/icons-material/Email';
import FilterListIcon from '@mui/icons-material/FilterList';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import ErrorIcon         from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const statusConfig = {
  Sent:    { color: 'success', icon: CheckCircleIcon },
  Failed:  { color: 'error',   icon: ErrorIcon },
  Pending: { color: 'warning', icon: HourglassEmptyIcon },
};

export default function NotificationLogs() {
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

  const [logs,        setLogs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sending,     setSending]     = useState(false);

  // Manual email form
  const [manualForm, setManualForm] = useState({ to: '', subject: '', message: '' });

  useEffect(() => {
    const coach = localStorage.getItem('coach');
    if (!coach) { navigate('/coach/login'); return; }
    fetchLogs();
  }, [navigate]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
      const { data } = await axios.get(`/api/notifications/logs${params}`);
      setLogs(data.logs || []);
    } catch (err) {
      setError('Failed to load notification logs.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  // ── Send Manual Email ─────────────────────────────────────────
  const handleManualSend = async () => {
    if (!manualForm.to || !manualForm.subject || !manualForm.message) {
      setError('Please fill in all fields: recipient email, subject, and message.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const { data } = await axios.post('/api/notifications/send-manual', manualForm);
      showSuccess(data.message);
      setManualForm({ to: '', subject: '', message: '' });
      await fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  // ── Test Email ────────────────────────────────────────────────
  const handleTestEmail = async () => {
    setSending(true);
    try {
      const { data } = await axios.post('/api/notifications/test-email', {});
      showSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'SMTP test failed.');
    } finally {
      setSending(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────
  const allLogs = logs;
  const sentCount   = allLogs.filter(l => l.status === 'Sent').length;
  const failedCount = allLogs.filter(l => l.status === 'Failed').length;
  const emailCount  = allLogs.length; // all notifications are email

  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '5%', left: '-3%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Header ────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase', mb: 0.5 }}>
              COMMAND CENTER
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon sx={{ color: LIME, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
                Notification Logs
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button size="small" startIcon={<RefreshIcon />} onClick={fetchLogs}
              sx={{ borderRadius: '9999px', border: `1px solid ${border}`, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: CYAN, color: CYAN } }}>
              Refresh
            </Button>
            <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/coach/dashboard')}
              sx={{ borderRadius: '9999px', border: `1px solid ${border}`, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: LIME, color: LIME } }}>
              Dashboard
            </Button>
          </Box>
        </Box>

        {/* ── Stats Row ─────────────────────────────────────── */}
        {!loading && (
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: allLogs.length, color: CYAN },
              { label: 'Sent', value: sentCount, color: '#34D399' },
              { label: 'Failed', value: failedCount, color: '#ffb4ab' },
              { label: 'Emails', value: emailCount, color: LIME },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '16px', px: 3, py: 2, backdropFilter: 'blur(12px)', minWidth: 90, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, fontSize: '1.8rem', color, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em' }}>{label.toUpperCase()}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Alerts ────────────────────────────────────────── */}
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

          {/* ── Left: Logs Table ─────────────────────────────── */}
          <Box sx={{ flex: 1 }}>
            {/* Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FilterListIcon sx={{ color: textSec, fontSize: 18 }} />
              <Select value={statusFilter} size="small"
                onChange={e => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, color: textPri, minWidth: 120 }}>
                {['All', 'Sent', 'Failed', 'Pending'].map(s => (
                  <MenuItem key={s} value={s} sx={{ fontFamily: "'Google Sans',sans-serif" }}>{s}</MenuItem>
                ))}
              </Select>
              <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
                Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '20px', overflow: 'hidden' }}>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: LIME }} />
                  <Typography sx={{ mt: 2, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Loading logs...</Typography>
                </Box>
              ) : logs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <EmailIcon sx={{ fontSize: 48, color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)', mb: 2 }} />
                  <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600 }}>
                    No notification logs yet.
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
                    Logs will appear here when emails or SMS are sent.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['Recipient', 'Type', 'Channel', 'Subject', 'Status', 'Sent At', 'Error'].map(h => (
                          <TableCell key={h} sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.06em', color: textSec, textTransform: 'uppercase', borderColor: border, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', whiteSpace: 'nowrap', py: 1.5 }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => {
                        const sc = statusConfig[log.status] || statusConfig.Pending;
                        return (
                          <TableRow key={log.id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>
                            <TableCell sx={{ borderColor: border, color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem', py: 1.2 }}>
                              {log.recipient}
                            </TableCell>
                            <TableCell sx={{ borderColor: border, py: 1.2 }}>
                              <Chip label={log.notification_type} size="small"
                                sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.68rem', bgcolor: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(0,78,92,0.06)', color: CYAN, border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(0,78,92,0.15)'}` }} />
                            </TableCell>
                            <TableCell sx={{ borderColor: border, py: 1.2 }}>
                              <Chip label="Email" size="small" color="info"
                                sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.68rem' }} />
                            </TableCell>
                            <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', maxWidth: 180, py: 1.2 }}>
                              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                                {log.subject || '—'}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderColor: border, py: 1.2 }}>
                              <Chip label={log.status} size="small" color={sc.color}
                                sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem' }} />
                            </TableCell>
                            <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.78rem', whiteSpace: 'nowrap', py: 1.2 }}>
                              {fmtDate(log.sent_at)}
                            </TableCell>
                            <TableCell sx={{ borderColor: border, color: '#ffb4ab', fontFamily: "'Google Sans',sans-serif", fontSize: '0.75rem', maxWidth: 200, py: 1.2 }}>
                              {log.error_message ? (
                                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }} title={log.error_message}>
                                  {log.error_message}
                                </Box>
                              ) : '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          </Box>

          {/* ── Right: Manual Email Form ──────────────────────── */}
          <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
            <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '20px', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <SendIcon sx={{ color: LIME, fontSize: 18 }} />
                <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                  Send Manual Email
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Recipient Email *"
                  type="email"
                  size="small"
                  fullWidth
                  value={manualForm.to}
                  onChange={e => setManualForm(p => ({ ...p, to: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }}
                />
                <TextField
                  label="Subject *"
                  size="small"
                  fullWidth
                  value={manualForm.subject}
                  onChange={e => setManualForm(p => ({ ...p, subject: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }}
                />
                <TextField
                  label="Message *"
                  size="small"
                  fullWidth
                  multiline
                  rows={5}
                  value={manualForm.message}
                  onChange={e => setManualForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Type your message here..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={sending ? <CircularProgress size={14} sx={{ color: '#0A0A12' }} /> : <SendIcon />}
                  disabled={sending || !manualForm.to || !manualForm.subject || !manualForm.message}
                  onClick={handleManualSend}
                  sx={{ borderRadius: '12px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: LIME, color: '#0A0A12', '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' }, py: 1.2 }}
                >
                  {sending ? 'Sending...' : 'Send Email'}
                </Button>
              </Box>

              <Divider sx={{ my: 3, borderColor: border }} />

              {/* Test Email button */}
              <Button variant="outlined" fullWidth startIcon={<EmailIcon />}
                disabled={sending} onClick={handleTestEmail}
                sx={{ borderRadius: '12px', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, borderColor: isDark ? 'rgba(6,182,212,0.3)' : 'rgba(0,78,92,0.2)', color: CYAN, '&:hover': { borderColor: CYAN, bgcolor: isDark ? 'rgba(6,182,212,0.06)' : 'rgba(0,78,92,0.04)' } }}>
                Test SMTP Config
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: textSec, fontFamily: "'Google Sans',sans-serif", textAlign: 'center', fontSize: '0.72rem' }}>
                Sends a test email to the configured MAIL_USER
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
