// pages/Achievements.jsx  –  Student: My Competitions & Achievements
// Shows all competition results and certificates for the logged-in athlete.

import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Alert, CircularProgress,
  Paper, useTheme, alpha, Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// ── Medal chip config ──────────────────────────────────────────
const medalConfig = {
  Gold:   { color: 'warning',   icon: '🥇', label: 'Gold Medal'   },
  Silver: { color: 'default',   icon: '🥈', label: 'Silver Medal' },
  Bronze: { color: 'secondary', icon: '🥉', label: 'Bronze Medal' },
  None:   { color: 'info',      icon: '🎖️', label: 'Participant'  },
};

// ── Result status chip config ─────────────────────────────────
const resultStatusConfig = {
  Published: { color: 'success', label: 'Published' },
  Draft:     { color: 'warning', label: 'Pending'   },
};

export default function Achievements() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const [athlete,  setAthlete]  = useState(null);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [downloading, setDownloading] = useState(null);

  // ── Apex Velocity color tokens ────────────────────────────────
  const LIME   = isDark ? '#d4ff00' : '#536600';
  const CYAN   = isDark ? '#06b6d4' : '#004e5c';
  const bg     = isDark ? '#0A0A12'             : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.7)'  : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (!stored) { navigate('/athelete/login'); return; }
    const parsed = JSON.parse(stored);
    setAthlete(parsed);
    fetchResults(parsed.id);
  }, [navigate]);

  const fetchResults = async (studentId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`/api/achievements/student/${studentId}`);
      setResults(data.results || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resultId, competitionName) => {
    setDownloading(resultId);
    try {
      const res = await axios.get(`/api/achievements/${resultId}/download-certificate`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `Certificate_${(competitionName || 'Competition').replace(/\s+/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (!athlete) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {/* Background blobs */}
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Header ───────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: LIME, textTransform: 'uppercase', mb: 0.5 }}>
              ATHLETE PORTAL
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsIcon sx={{ color: LIME, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
                My Competitions & Achievements
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/athelete/dashboard')}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '9999px', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: CYAN, color: CYAN } }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* ── Stats row ─────────────────────────────────────────── */}
        {!loading && results.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: results.length, color: CYAN },
              { label: 'Published', value: results.filter(r => r.result_status === 'Published').length, color: '#34D399' },
              { label: 'Gold Medals', value: results.filter(r => r.medal_won === 'Gold').length, color: '#D4AF37' },
              { label: 'Certificates', value: results.filter(r => r.certificate_url).length, color: LIME },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '16px', px: 3, py: 2, backdropFilter: 'blur(12px)', minWidth: 100, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, fontSize: '1.8rem', color, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em' }}>{label.toUpperCase()}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Error Alert ───────────────────────────────────────── */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>
        )}

        {/* ── Loading ───────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: LIME }} />
            <Typography sx={{ mt: 2, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Loading your achievements...</Typography>
          </Box>
        ) : results.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────── */
          <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '24px', p: 6, textAlign: 'center' }}>
            <WorkspacePremiumIcon sx={{ fontSize: 64, color: isDark ? 'rgba(212,255,0,0.15)' : 'rgba(83,102,0,0.1)', mb: 2 }} />
            <Typography variant="h5" sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 700, color: textPri, mb: 1 }}>
              No Competition Records Yet
            </Typography>
            <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", maxWidth: 400, mx: 'auto' }}>
              Your coach will add your competition results here once they are available. Check back after your next competition!
            </Typography>
          </Box>
        ) : (
          /* ── Results Table ────────────────────────────────────── */
          <Box sx={{ bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: '24px', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${border}` }}>
              <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', color: textSec, textTransform: 'uppercase' }}>
                {results.length} Competition Record{results.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Competition', 'Date', 'Category / Level', 'Age Group', 'Attendance', 'Medal', 'Result', 'Status', 'Certificate'].map(h => (
                      <TableCell key={h} sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', color: textSec, textTransform: 'uppercase', borderColor: border, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row) => {
                    const medal       = medalConfig[row.medal_won] || medalConfig.None;
                    const statusConf  = resultStatusConfig[row.result_status] || resultStatusConfig.Draft;
                    const hasCert     = !!row.certificate_url;
                    const isPublished = row.result_status === 'Published';
                    const date        = row.competition_date
                      ? new Date(row.competition_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—';

                    return (
                      <TableRow key={row.id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }, transition: 'background 0.15s' }}>
                        {/* Competition Name */}
                        <TableCell sx={{ borderColor: border, color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.88rem' }}>
                          {row.competition_name}
                          {row.event_name && (
                            <Typography variant="caption" sx={{ display: 'block', color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
                              {row.event_name}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          {date}
                        </TableCell>

                        {/* Category */}
                        <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem' }}>
                          {row.category_level || '—'}
                        </TableCell>

                        {/* Age Group */}
                        <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem' }}>
                          {row.age_group || '—'}
                        </TableCell>

                        {/* Attendance */}
                        <TableCell sx={{ borderColor: border }}>
                          <Chip
                            label={row.attendance_status || 'Pending'}
                            size="small"
                            color={row.attendance_status === 'Present' ? 'success' : row.attendance_status === 'Absent' ? 'error' : 'warning'}
                            sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        {/* Medal */}
                        <TableCell sx={{ borderColor: border }}>
                          {isPublished ? (
                            <Chip
                              label={`${medal.icon} ${medal.label}`}
                              size="small"
                              color={medal.color}
                              sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          ) : (
                            <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontStyle: 'italic' }}>—</Typography>
                          )}
                        </TableCell>

                        {/* Result */}
                        <TableCell sx={{ borderColor: border, color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem' }}>
                          {isPublished ? (row.result_text || 'Participant') : (
                            <Typography variant="caption" sx={{ color: '#FBBF24', fontFamily: "'Google Sans',sans-serif", fontStyle: 'italic' }}>Result Pending</Typography>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell sx={{ borderColor: border }}>
                          <Chip
                            label={statusConf.label}
                            size="small"
                            color={statusConf.color}
                            sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>

                        {/* Certificate Download */}
                        <TableCell sx={{ borderColor: border }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={downloading === row.id ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <DownloadIcon />}
                            disabled={!hasCert || downloading === row.id}
                            onClick={() => handleDownload(row.id, row.competition_name)}
                            sx={{
                              borderRadius: '9999px',
                              fontFamily: "'Google Sans',sans-serif",
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              bgcolor: hasCert ? (isDark ? '#d4ff00' : '#536600') : undefined,
                              color: hasCert ? '#0A0A12' : undefined,
                              '&:disabled': { opacity: 0.45 },
                              '&:hover': hasCert ? { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' } : {},
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {!hasCert ? 'Not Ready' : downloading === row.id ? 'Downloading...' : 'Download'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
    </Box>
  );
}
