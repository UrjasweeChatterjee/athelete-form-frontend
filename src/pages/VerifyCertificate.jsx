// pages/VerifyCertificate.jsx  –  Public: Certificate Verification Page
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Paper, useTheme, alpha, Alert } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon       from '@mui/icons-material/Error';
import DownloadIcon    from '@mui/icons-material/Download';
import VerifiedIcon    from '@mui/icons-material/Verified';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';

export default function VerifyCertificate() {
  const { id } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Apex Velocity theme colors
  const LIME = isDark ? '#d4ff00' : '#536600';
  const CYAN = isDark ? '#06b6d4' : '#004e5c';
  const bg = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.75)' : 'rgba(255,255,255,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  useEffect(() => {
    fetchVerification();
  }, [id]);

  const fetchVerification = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/achievements/public/verify/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate verification failed. The ID might be invalid or not yet published.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const res = await axios.get(`/api/achievements/${id}/download-certificate`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${(data.competition_name || 'Competition').replace(/\s+/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', p: 3 }}>
      {/* Background neon mesh blobs */}
      {isDark && (
        <>
          <Box sx={{ position: 'fixed', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'fixed', bottom: '10%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        </>
      )}

      <Box sx={{
        width: '100%', maxWidth: 580, zIndex: 1,
        bgcolor: cardBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${border}`, borderRadius: '28px', overflow: 'hidden',
        backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        {/* Neon top banner border */}
        <Box sx={{ height: 5, background: `linear-gradient(90deg, ${LIME}, ${CYAN})` }} />

        <Box sx={{ p: { xs: 4, sm: 5 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, mb: 4 }}>
            <SportsKabaddiIcon sx={{ color: LIME, fontSize: 26 }} />
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.15em', color: LIME, textTransform: 'uppercase' }}>
              Sports Club Verification Center
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ py: 6 }}>
              <CircularProgress sx={{ color: LIME, mb: 2 }} />
              <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Verifying Certificate Authenticity...</Typography>
            </Box>
          ) : error || !data ? (
            /* ❌ Verification Failure State */
            <Box sx={{ py: 2 }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ErrorIcon sx={{ fontSize: 40, color: '#EF4444' }} />
              </Box>
              <Typography variant="h5" sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, color: textPri, mb: 1.5 }}>
                Verification Failed
              </Typography>
              <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", mb: 4, fontSize: '0.92rem', lineHeight: 1.6 }}>
                {error || 'This certificate record is invalid, has been deleted, or remains in draft/pending state.'}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => window.location.reload()}
                sx={{
                  borderRadius: '12px', py: 1.2,
                  fontFamily: "'Google Sans',sans-serif", fontWeight: 600,
                  borderColor: border, color: textSec,
                  '&:hover': { borderColor: LIME, color: LIME }
                }}
              >
                Try Again
              </Button>
            </Box>
          ) : (
            /* 🏆 Verification Success State */
            <Box>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 2,
                bgcolor: isDark ? 'rgba(212,255,0,0.1)' : 'rgba(83,102,0,0.08)',
                border: `2px solid ${isDark ? 'rgba(212,255,0,0.3)' : 'rgba(83,102,0,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isDark ? '0 0 24px rgba(212,255,0,0.15)' : 'none',
              }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: LIME }} />
              </Box>

              <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: LIME, letterSpacing: '0.04em', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <VerifiedIcon sx={{ fontSize: 16 }} /> VERIFIED AUTHENTIC DOCUMENT
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, color: textPri, letterSpacing: '-0.02em', mb: 3 }}>
                Certificate Verified
              </Typography>

              {/* Certificate Details list */}
              <Box sx={{
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${border}`,
                borderRadius: '16px',
                p: 3, mb: 4,
                textAlign: 'left',
              }}>
                {[
                  { label: 'Athlete Name', value: data.student_name },
                  { label: 'Competition', value: data.competition_name },
                  { label: 'Date of Competition', value: formatDate(data.competition_date) },
                  { label: 'Event / Category', value: [data.event_name, data.category_level].filter(Boolean).join(' - ') || '—' },
                  { label: 'Age Group', value: data.age_group || '—' },
                  { label: 'Result Standing', value: data.result_text || 'Participant' },
                  { label: 'Medal Awarded', value: data.medal_won && data.medal_won !== 'None' ? `${data.medal_won} Medal` : 'Participation Certificate' },
                  { label: 'Generated On', value: formatDate(data.certificate_generated_at) }
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                    <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', mb: 0.2 }}>
                      {label}
                    </Typography>
                    <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth variant="contained" size="large"
                  startIcon={downloading ? <CircularProgress size={16} sx={{ color: '#0A0A12' }} /> : <DownloadIcon />}
                  onClick={handleDownload}
                  disabled={downloading}
                  sx={{
                    borderRadius: '12px', py: 1.3,
                    fontFamily: "'Google Sans',sans-serif", fontWeight: 700,
                    background: isDark ? `linear-gradient(135deg, #06b6d4, #d4ff00)` : `linear-gradient(135deg, #004e5c, #536600)`,
                    color: isDark ? '#0A0A12' : '#ffffff',
                    boxShadow: isDark ? '0 4px 20px rgba(6,182,212,0.25)' : 'none',
                    '&:hover': { boxShadow: isDark ? '0 6px 28px rgba(212,255,0,0.3)' : 'none', transform: 'translateY(-1px)' },
                  }}
                >
                  {downloading ? 'Downloading Official PDF...' : 'Download Official PDF'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
