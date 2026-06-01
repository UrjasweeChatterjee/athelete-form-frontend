// pages/ResultsCertificates.jsx  –  Coach/Admin: Results & Certificates Management
// Full results management: create, update, publish, generate/upload certificate, send email.

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, Select, MenuItem, useTheme, alpha, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Tooltip,
  IconButton, InputLabel, FormControl, Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import AddIcon         from '@mui/icons-material/Add';
import SaveIcon        from '@mui/icons-material/Save';
import PublishIcon     from '@mui/icons-material/Publish';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EmailIcon       from '@mui/icons-material/Email';
import RefreshIcon     from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon      from '@mui/icons-material/Search';
import InputAdornment  from '@mui/material/InputAdornment';

const medalConfig = {
  Gold:   { color: '#D4AF37', label: '🥇 Gold'   },
  Silver: { color: '#A8A9AD', label: '🥈 Silver' },
  Bronze: { color: '#CD7F32', label: '🥉 Bronze' },
  None:   { color: '#6366f1', label: '🎖️ None'   },
};

export default function ResultsCertificates() {
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

  const [results,        setResults]        = useState([]);
  const [students,       setStudents]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState('');
  const [search,         setSearch]         = useState('');
  const [actionLoading,  setActionLoading]  = useState(null); // resultId
  const [uploadDialog,   setUploadDialog]   = useState({ open: false, resultId: null });
  const [uploadFile,     setUploadFile]     = useState(null);
  const [createDialog,   setCreateDialog]   = useState(false);
  const [editRows,       setEditRows]       = useState({}); // { [resultId]: { attendance, medal, resultText } }

  // ── New result form ───────────────────────────────────────────
  const [newForm, setNewForm] = useState({
    student_id: '', competition_name: '', competition_date: '',
    age_group: '', category_level: '', event_name: '',
  });

  useEffect(() => {
    const coach = localStorage.getItem('coach');
    if (!coach) { navigate('/coach/login'); return; }
    fetchData();
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resData, studData] = await Promise.all([
        axios.get('/api/achievements/admin'),
        axios.get('/api/coaches/students'),
      ]);
      setResults(resData.data.results || []);
      setStudents(studData.data.students || []);
    } catch (err) {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Track per-row edits
  const getEditRow = (row) => editRows[row.id] || {
    attendance_status: row.attendance_status || 'Pending',
    medal_won:         row.medal_won         || 'None',
    result_text:       row.result_text       || 'Participant',
  };

  const updateEditRow = (resultId, field, value) => {
    setEditRows(prev => ({
      ...prev,
      [resultId]: { ...getEditRow({ id: resultId, ...results.find(r => r.id === resultId) }), [field]: value },
    }));
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  // ── Save Result ───────────────────────────────────────────────
  const handleSaveResult = async (resultId) => {
    setActionLoading(`save_${resultId}`);
    try {
      const edits = getEditRow({ id: resultId, ...results.find(r => r.id === resultId) });
      await axios.put(`/api/achievements/${resultId}/result`, edits);
      showSuccess('Result saved successfully.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save result.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Publish Result ────────────────────────────────────────────
  const handlePublish = async (resultId) => {
    setActionLoading(`publish_${resultId}`);
    try {
      await axios.put(`/api/achievements/${resultId}/publish`);
      showSuccess('Result published! Student notification email sent.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish result.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Generate Certificate ──────────────────────────────────────
  const handleGenerateCert = async (resultId) => {
    setActionLoading(`cert_${resultId}`);
    try {
      await axios.post(`/api/achievements/${resultId}/generate-certificate`);
      showSuccess('Certificate generated! Student notification email sent.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate certificate.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Upload Certificate ────────────────────────────────────────
  const handleUploadCert = async () => {
    if (!uploadFile || !uploadDialog.resultId) return;
    setActionLoading(`upload_${uploadDialog.resultId}`);
    try {
      const formData = new FormData();
      formData.append('certificate', uploadFile);
      await axios.post(`/api/achievements/${uploadDialog.resultId}/upload-certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccess('Certificate uploaded! Student notification email sent.');
      setUploadDialog({ open: false, resultId: null });
      setUploadFile(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload certificate.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Send Certificate Email ────────────────────────────────────
  const handleSendCertEmail = async (resultId) => {
    setActionLoading(`email_${resultId}`);
    try {
      const { data } = await axios.post(`/api/achievements/${resultId}/send-certificate-email`);
      showSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Create New Result ─────────────────────────────────────────
  const handleCreateResult = async () => {
    if (!newForm.student_id || !newForm.competition_name) {
      setError('Student and competition name are required.');
      return;
    }
    setActionLoading('create');
    try {
      await axios.post('/api/achievements/admin/create', newForm);
      showSuccess('Competition result record created.');
      setCreateDialog(false);
      setNewForm({ student_id: '', competition_name: '', competition_date: '', age_group: '', category_level: '', event_name: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create record.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filter ────────────────────────────────────────────────────
  const filtered = results.filter(r =>
    !search || r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.competition_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.student_email?.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = (key) => actionLoading === key;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '5%', left: '-3%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="xl" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase', mb: 0.5 }}>
              COMMAND CENTER
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsIcon sx={{ color: LIME, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
                Results & Certificates
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button size="small" startIcon={<RefreshIcon />} onClick={fetchData}
              sx={{ borderRadius: '9999px', border: `1px solid ${border}`, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: CYAN, color: CYAN } }}>
              Refresh
            </Button>
            <Button size="small" startIcon={<AddIcon />} variant="contained" onClick={() => setCreateDialog(true)}
              sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: LIME, color: '#0A0A12', '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' } }}>
              Add Result
            </Button>
            <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/coach/dashboard')}
              sx={{ borderRadius: '9999px', border: `1px solid ${border}`, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: LIME, color: LIME } }}>
              Dashboard
            </Button>
          </Box>
        </Box>

        {/* ── Alerts ────────────────────────────────────────── */}
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* ── Search ────────────────────────────────────────── */}
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by student name, email, or competition..."
            value={search} onChange={e => setSearch(e.target.value)}
            size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: textSec }} /></InputAdornment> }}
            sx={{ maxWidth: 480, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', fontFamily: "'Google Sans',sans-serif" } }}
          />
        </Box>

        {/* ── Table ─────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: LIME }} />
            <Typography sx={{ mt: 2, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Loading results...</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '24px', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', color: textSec, textTransform: 'uppercase' }}>
                {filtered.length} Result Record{filtered.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600 }}>
                  {results.length === 0 ? '📋 No result records yet. Click "Add Result" to create one.' : '🔍 No results match your search.'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Student', 'Competition', 'Date', 'Category', 'Age Group', 'Attendance', 'Medal', 'Result Text', 'Status', 'Certificate', 'Actions'].map(h => (
                        <TableCell key={h} sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.06em', color: textSec, textTransform: 'uppercase', borderColor: border, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', whiteSpace: 'nowrap', py: 1.5 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((row) => {
                      const edit        = getEditRow(row);
                      const isPublished = row.result_status === 'Published';
                      const hasCert     = !!row.certificate_url;
                      const date        = row.competition_date
                        ? new Date(row.competition_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—';

                      return (
                        <TableRow key={row.id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>

                          {/* Student */}
                          <TableCell sx={{ borderColor: border, py: 1.5 }}>
                            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.85rem', color: textPri }}>{row.student_name || '—'}</Typography>
                            <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>{row.student_email || ''}</Typography>
                          </TableCell>

                          {/* Competition */}
                          <TableCell sx={{ borderColor: border, color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem', maxWidth: 180, py: 1.5 }}>
                            <Tooltip title={row.competition_name}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 160 }}>{row.competition_name}</span>
                            </Tooltip>
                          </TableCell>

                          {/* Date */}
                          <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', whiteSpace: 'nowrap', py: 1.5 }}>
                            {date}
                          </TableCell>

                          {/* Category */}
                          <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', py: 1.5 }}>
                            {row.category_level || '—'}
                          </TableCell>

                          {/* Age Group */}
                          <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', py: 1.5 }}>
                            {row.age_group || '—'}
                          </TableCell>

                          {/* Attendance Dropdown */}
                          <TableCell sx={{ borderColor: border, py: 1.5 }}>
                            <Select
                              value={edit.attendance_status}
                              size="small"
                              disabled={isPublished}
                              onChange={e => updateEditRow(row.id, 'attendance_status', e.target.value)}
                              sx={{ fontSize: '0.78rem', fontFamily: "'Google Sans',sans-serif", minWidth: 100, borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                            >
                              {['Present', 'Absent', 'Pending'].map(v => <MenuItem key={v} value={v} sx={{ fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem' }}>{v}</MenuItem>)}
                            </Select>
                          </TableCell>

                          {/* Medal Dropdown */}
                          <TableCell sx={{ borderColor: border, py: 1.5 }}>
                            <Select
                              value={edit.medal_won}
                              size="small"
                              disabled={isPublished}
                              onChange={e => updateEditRow(row.id, 'medal_won', e.target.value)}
                              sx={{ fontSize: '0.78rem', fontFamily: "'Google Sans',sans-serif", minWidth: 110, borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: medalConfig[edit.medal_won]?.color }}
                            >
                              {Object.entries(medalConfig).map(([k, v]) => (
                                <MenuItem key={k} value={k} sx={{ fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem', color: v.color }}>{v.label}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>

                          {/* Result Text */}
                          <TableCell sx={{ borderColor: border, py: 1.5 }}>
                            <TextField
                              value={edit.result_text}
                              size="small"
                              disabled={isPublished}
                              onChange={e => updateEditRow(row.id, 'result_text', e.target.value)}
                              placeholder="e.g. 1st Place"
                              sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { fontSize: '0.78rem', fontFamily: "'Google Sans',sans-serif", borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' } }}
                            />
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ borderColor: border, py: 1.5 }}>
                            <Chip
                              label={isPublished ? 'Published' : 'Draft'}
                              size="small"
                              color={isPublished ? 'success' : 'warning'}
                              sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem' }}
                            />
                          </TableCell>

                          {/* Certificate */}
                          <TableCell sx={{ borderColor: border, py: 1.5 }}>
                            <Chip
                              label={hasCert ? '✓ Ready' : 'None'}
                              size="small"
                              color={hasCert ? 'success' : 'default'}
                              sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem' }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell sx={{ borderColor: border, py: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>

                              {/* Save */}
                              {!isPublished && (
                                <Tooltip title="Save Result">
                                  <IconButton size="small"
                                    disabled={isLoading(`save_${row.id}`)}
                                    onClick={() => handleSaveResult(row.id)}
                                    sx={{ bgcolor: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(0,78,92,0.06)', border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : 'rgba(0,78,92,0.15)'}`, color: CYAN, borderRadius: '8px', '&:hover': { bgcolor: isDark ? 'rgba(6,182,212,0.16)' : 'rgba(0,78,92,0.12)' } }}>
                                    {isLoading(`save_${row.id}`) ? <CircularProgress size={13} sx={{ color: CYAN }} /> : <SaveIcon sx={{ fontSize: 15 }} />}
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Publish */}
                              {!isPublished && (
                                <Tooltip title="Publish Result & Email Student">
                                  <IconButton size="small"
                                    disabled={isLoading(`publish_${row.id}`)}
                                    onClick={() => handlePublish(row.id)}
                                    sx={{ bgcolor: isDark ? 'rgba(212,255,0,0.08)' : 'rgba(83,102,0,0.06)', border: `1px solid ${isDark ? 'rgba(212,255,0,0.2)' : 'rgba(83,102,0,0.15)'}`, color: LIME, borderRadius: '8px', '&:hover': { bgcolor: isDark ? 'rgba(212,255,0,0.16)' : 'rgba(83,102,0,0.12)' } }}>
                                    {isLoading(`publish_${row.id}`) ? <CircularProgress size={13} sx={{ color: LIME }} /> : <PublishIcon sx={{ fontSize: 15 }} />}
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Generate Certificate */}
                              <Tooltip title="Generate PDF Certificate">
                                <IconButton size="small"
                                  disabled={isLoading(`cert_${row.id}`)}
                                  onClick={() => handleGenerateCert(row.id)}
                                  sx={{ bgcolor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(99,102,241,0.15)' } }}>
                                  {isLoading(`cert_${row.id}`) ? <CircularProgress size={13} sx={{ color: '#6366f1' }} /> : <PictureAsPdfIcon sx={{ fontSize: 15 }} />}
                                </IconButton>
                              </Tooltip>

                              {/* Upload Certificate */}
                              <Tooltip title="Upload Custom PDF Certificate">
                                <IconButton size="small"
                                  onClick={() => setUploadDialog({ open: true, resultId: row.id })}
                                  sx={{ bgcolor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(251,191,36,0.15)' } }}>
                                  <CloudUploadIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>

                              {/* Send Certificate Email */}
                              {hasCert && (
                                <Tooltip title="Re-send Certificate Email">
                                  <IconButton size="small"
                                    disabled={isLoading(`email_${row.id}`)}
                                    onClick={() => handleSendCertEmail(row.id)}
                                    sx={{ bgcolor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(52,211,153,0.15)' } }}>
                                    {isLoading(`email_${row.id}`) ? <CircularProgress size={13} sx={{ color: '#34D399' }} /> : <EmailIcon sx={{ fontSize: 15 }} />}
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
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

      {/* ── Upload Certificate Dialog ────────────────────────── */}
      <Dialog open={uploadDialog.open} onClose={() => { setUploadDialog({ open: false, resultId: null }); setUploadFile(null); }}
        PaperProps={{ sx: { bgcolor: isDark ? 'rgba(17,24,39,0.97)' : '#ffffff', backdropFilter: 'blur(20px)', border: `1px solid ${border}`, borderRadius: '20px', minWidth: 360 } }}>
        <DialogTitle sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, color: textPri }}>
          📄 Upload Certificate PDF
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", mb: 2, fontSize: '0.88rem' }}>
            Select a PDF file (max 5 MB). This will replace any existing certificate for this result.
          </Typography>
          <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />}
            sx={{ borderRadius: '12px', fontFamily: "'Google Sans',sans-serif", borderColor: border, color: textSec, '&:hover': { borderColor: LIME, color: LIME }, py: 1.5 }}>
            {uploadFile ? uploadFile.name : 'Choose PDF file...'}
            <input type="file" accept="application/pdf" hidden onChange={e => setUploadFile(e.target.files[0])} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => { setUploadDialog({ open: false, resultId: null }); setUploadFile(null); }}
            sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, color: textSec, border: `1px solid ${border}` }}>
            Cancel
          </Button>
          <Button disabled={!uploadFile || isLoading(`upload_${uploadDialog.resultId}`)} onClick={handleUploadCert} variant="contained"
            sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: LIME, color: '#0A0A12', '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' } }}>
            {isLoading(`upload_${uploadDialog.resultId}`) ? <><CircularProgress size={14} sx={{ color: '#0A0A12', mr: 1 }} />Uploading...</> : 'Upload Certificate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Create New Result Dialog ─────────────────────────── */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)}
        PaperProps={{ sx: { bgcolor: isDark ? 'rgba(17,24,39,0.97)' : '#ffffff', backdropFilter: 'blur(20px)', border: `1px solid ${border}`, borderRadius: '20px', minWidth: 480 } }}>
        <DialogTitle sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, color: textPri }}>
          ➕ Add New Competition Result
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: "'Google Sans',sans-serif" }}>Student *</InputLabel>
                <Select value={newForm.student_id} label="Student *"
                  onChange={e => setNewForm(p => ({ ...p, student_id: e.target.value }))}
                  sx={{ borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" }}>
                  {students.map(s => (
                    <MenuItem key={s.id} value={s.id} sx={{ fontFamily: "'Google Sans',sans-serif", fontSize: '0.85rem' }}>
                      {s.full_name} ({s.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required size="small" label="Competition Name"
                value={newForm.competition_name}
                onChange={e => setNewForm(p => ({ ...p, competition_name: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Competition Date" type="date"
                InputLabelProps={{ shrink: true }}
                value={newForm.competition_date}
                onChange={e => setNewForm(p => ({ ...p, competition_date: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Age Group"
                value={newForm.age_group}
                onChange={e => setNewForm(p => ({ ...p, age_group: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Category / Level"
                placeholder="e.g. District, State, National"
                value={newForm.category_level}
                onChange={e => setNewForm(p => ({ ...p, category_level: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Event Name"
                placeholder="e.g. 100m Sprint"
                value={newForm.event_name}
                onChange={e => setNewForm(p => ({ ...p, event_name: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCreateDialog(false)}
            sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, color: textSec, border: `1px solid ${border}` }}>
            Cancel
          </Button>
          <Button disabled={!newForm.student_id || !newForm.competition_name || isLoading('create')}
            onClick={handleCreateResult} variant="contained"
            sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: LIME, color: '#0A0A12', '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' } }}>
            {isLoading('create') ? <><CircularProgress size={14} sx={{ color: '#0A0A12', mr: 1 }} />Creating...</> : 'Create Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
