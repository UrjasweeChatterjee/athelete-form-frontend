// pages/AtheleteDashboard.jsx  –  Stitch "Digital ID" Design
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Chip, Grid, useTheme, alpha, Divider, Button, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { STATUS_COLORS } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PaymentIcon from '@mui/icons-material/Payment';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';

const renderList = (data, textPri) => {
  if (!data) return null;
  if (Array.isArray(data)) {
    return (
      <Box component="ul" sx={{ pl: 2, m: 0, '& li': { mb: 0.5, color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem' } }}>
        {data.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </Box>
    );
  }
  return (
    <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem' }}>
      {data}
    </Typography>
  );
};


const STATUS_CONFIG = {
  Pending: { ...STATUS_COLORS.Pending, icon: '⏳', label: 'PENDING REVIEW' },
  Approved: { ...STATUS_COLORS.Approved, icon: '✅', label: 'APPROVED' },
  Rejected: { ...STATUS_COLORS.Rejected, icon: '❌', label: 'REJECTED' },
};

const SPORT_EMOJIS = {
  Cricket: '🏏', Football: '⚽', Badminton: '🏸', Athletics: '🏃',
  Swimming: '🏊', Basketball: '🏀', Volleyball: '🏐', 'Table Tennis': '🏓',
};

export default function AtheleteDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [athlete, setAthlete] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [bmiChartData, setBmiChartData] = useState([]);
  const [bmiChartLoading, setBmiChartLoading] = useState(true);

  // New tournaments & payments state
  const [tournaments, setTournaments] = useState([]);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [downloading, setDownloading] = useState(null);

  // Sandbox Mode Simulator state
  const [sandboxDialog, setSandboxDialog] = useState(false);
  const [sandboxOrder, setSandboxOrder]   = useState(null);
  
  // High-fidelity Razorpay simulator inputs
  const [activeMethod,  setActiveMethod]  = useState('card');
  const [simUpi,        setSimUpi]        = useState('');
  const [simCardNo,     setSimCardNo]     = useState('');
  const [simCardExp,    setSimCardExp]    = useState('');
  const [simCardCvv,    setSimCardCvv]    = useState('');
  const [simCardName,   setSimCardName]   = useState('');
  const [simBank,       setSimBank]       = useState('');
  const [outcomeOpen,   setOutcomeOpen]   = useState(false);

  // Load Razorpay checkout script
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) { resolve(true); return; }
      const script    = document.createElement('script');
      script.id       = 'razorpay-script';
      script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload   = () => resolve(true);
      script.onerror  = () => resolve(false);
      document.body.appendChild(script);
    });

  const fetchTournaments = useCallback(async (studentId) => {
    try {
      const { data } = await axios.get(`/api/tournaments/student/${studentId}`);
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  }, []);

  const handleDownloadReceipt = async (paymentId) => {
    setDownloading(paymentId);
    try {
      const res = await axios.get(`/api/payments/receipt/${paymentId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `payment-receipt-${paymentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setPaymentError('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleSimulateSuccess = async (order) => {
    setPaying(true);
    setSandboxDialog(false);
    setPaymentError('');
    try {
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = `sig_mock_${Date.now()}`;
      await axios.post('/api/payments/verify', {
        payment_record_id:  order.payment_record_id,
        razorpay_order_id:  order.razorpay_order_id,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature:  mockSignature,
      });
      setPaymentSuccess('🎉 [TEST MODE] Simulated successful payment! Your registration is complete.');
      setTimeout(() => setPaymentSuccess(''), 5000);
      fetchTournaments(athlete.id);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Simulation verification failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleSimulateFailure = async (order) => {
    setPaying(true);
    setSandboxDialog(false);
    setPaymentError('');
    try {
      await axios.post('/api/payments/failed', {
        payment_record_id: order.payment_record_id,
        failure_reason:    'Simulated payment failure (User cancelled).',
      });
      setPaymentError('❌ [TEST MODE] Simulated payment cancellation/failure.');
      fetchTournaments(athlete.id);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Simulation failure logging failed.');
    } finally {
      setPaying(false);
    }
  };

  const handlePayNowForTournament = async (t) => {
    setPaying(true);
    setPaymentError('');

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPaymentError('Failed to load payment gateway. Please check your internet connection.');
      setPaying(false);
      return;
    }

    const paymentData = {
      student_id:       athlete.id,
      competition_name: t.name,
      fee_type:         'Competition Fee',
      amount:           t.fee_amount,
      tournament_id:    t.id,
    };

    let orderData;
    try {
      const { data } = await axios.post('/api/payments/create-order', paymentData);
      orderData = data;
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Failed to create payment order.');
      setPaying(false);
      return;
    }

    if (orderData.razorpay_order_id.startsWith('order_mock_')) {
      setSandboxOrder(orderData);
      setSandboxDialog(true);
      setPaying(false);
      return;
    }

    const options = {
      key:         orderData.key_id,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        'Sports Club Management',
      description: `Competition Fee – ${paymentData.competition_name}`,
      order_id:    orderData.razorpay_order_id,
      prefill: {
        name:    athlete.full_name || '',
        email:   athlete.email    || '',
        contact: athlete.mobile   || '',
      },
      theme: {
        color: '#d4ff00',
      },
      modal: {
        ondismiss: async () => {
          try {
            await axios.post('/api/payments/failed', {
              payment_record_id: orderData.payment_record_id,
              failure_reason:    'Payment cancelled by user.',
            });
          } catch {}
          setPaymentError('Payment was cancelled. You can retry anytime.');
          setPaying(false);
          fetchTournaments(athlete.id);
        },
      },
      handler: async (paymentResponse) => {
        try {
          await axios.post('/api/payments/verify', {
            payment_record_id:  orderData.payment_record_id,
            razorpay_order_id:  paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature:  paymentResponse.razorpay_signature,
          });
          setPaymentSuccess('🎉 Payment successful! Your registration is complete.');
          setTimeout(() => setPaymentSuccess(''), 5000);
          fetchTournaments(athlete.id);
        } catch (verifyErr) {
          setPaymentError(verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.');
          fetchTournaments(athlete.id);
        } finally {
          setPaying(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async (response) => {
      try {
        await axios.post('/api/payments/failed', {
          payment_record_id: orderData.payment_record_id,
          failure_reason:    response.error?.description || 'Payment failed.',
        });
      } catch {}
      setPaymentError(`Payment failed: ${response.error?.description || 'Unknown error.'}`);
      setPaying(false);
      fetchTournaments(athlete.id);
    });

    rzp.open();
  };

  useEffect(() => {
    const fetchBmiStats = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/urjasweechatterjee/sports-club-management/main/age_bmi_stats.json');
        if (!response.ok) throw new Error('Failed to fetch open-source API');
        const data = await response.json();
        setBmiChartData(data);
      } catch (err) {
        // Safe, scientific fallback data representing average BMIs by age group
        setBmiChartData([
          { ageGroup: 'Under 18', avgBmi: 20.2 },
          { ageGroup: '18–25', avgBmi: 22.8 },
          { ageGroup: '26–35', avgBmi: 24.6 },
          { ageGroup: '36–45', avgBmi: 25.4 },
          { ageGroup: '46–55', avgBmi: 26.2 },
          { ageGroup: 'Over 55', avgBmi: 27.0 }
        ]);
      } finally {
        setBmiChartLoading(false);
      }
    };
    fetchBmiStats();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (!stored) { navigate('/athelete/login'); return; }
    const parsed = JSON.parse(stored);
    setAthlete(parsed);
    fetchTournaments(parsed.id);
  }, [navigate, fetchTournaments]);

  const handleLogout = () => { localStorage.removeItem('student'); navigate('/'); };
  const parseSports = (raw) => { try { return JSON.parse(raw); } catch { return raw ? [raw] : []; } };

  const fetchAiAssistant = async () => {
    if (!athlete) return;
    setAiLoading(true);
    setAiError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`/api/students/${athlete.id}/ai-assistant`, { headers });
      if (data.success && data.assistant) {
        setAiData(data.assistant);
      } else {
        setAiData(data);
      }
    } catch (err) {
      console.error(err);
      setAiError(err.response?.data?.message || 'Failed to generate training suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };


  if (!athlete) return null;

  const sports = parseSports(athlete.sports_applied);
  const statusCfg = STATUS_CONFIG[athlete.status] || STATUS_CONFIG.Pending;
  const registered = athlete.created_at
    ? new Date(athlete.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  // Apex Velocity tokens
  const LIME = isDark ? '#d4ff00' : '#536600';
  const CYAN = isDark ? '#06b6d4' : '#004e5c';
  const INDIGO = '#6366f1';
  const bg = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg = isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {/* Mesh blobs */}
      {isDark && <>
        <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <Box sx={{ position: 'fixed', bottom: '10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Page Header ────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase', mb: 0.5 }}>
              ATHLETE PORTAL
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
              My Profile
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {/* ── My Achievements link (Module 6) ── */}
            <Button
              variant="outlined" size="small"
              startIcon={<WorkspacePremiumIcon />}
              onClick={() => navigate('/athelete/achievements')}
              sx={{ borderRadius: '9999px', borderColor: isDark ? 'rgba(212,255,0,0.3)' : 'rgba(83,102,0,0.25)', color: LIME, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: LIME, bgcolor: isDark ? 'rgba(212,255,0,0.06)' : 'rgba(83,102,0,0.04)' } }}
            >
              My Achievements
            </Button>
            {/* ── My Payments & Fees link (Module 8) ── */}
            <Button
              variant="outlined" size="small"
              startIcon={<PaymentIcon />}
              onClick={() => navigate('/athelete/payments')}
              sx={{ borderRadius: '9999px', borderColor: isDark ? 'rgba(6,182,212,0.3)' : 'rgba(0,78,92,0.25)', color: CYAN, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: CYAN, bgcolor: isDark ? 'rgba(6,182,212,0.06)' : 'rgba(0,78,92,0.04)' } }}
            >
              Payments & Fees
            </Button>
            <Button
              variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={handleLogout}
              sx={{ borderRadius: '9999px', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: LIME, color: LIME } }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>

          {/* ── Left: Digital ID Card ──────────────────────────── */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${border}`, borderRadius: '24px', overflow: 'hidden',
              backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
            }}>
              {/* Status color bar */}
              <Box sx={{ height: 4, bgcolor: statusCfg.color }} />

              <Box sx={{ p: 3 }}>
                {/* Avatar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Box sx={{
                    width: 88, height: 88, borderRadius: '50%', mb: 1.5,
                    background: `linear-gradient(135deg, ${alpha(statusCfg.color, 0.2)}, ${alpha(INDIGO, 0.2)})`,
                    border: `3px solid ${alpha(statusCfg.color, 0.4)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem', fontWeight: 900,
                    color: statusCfg.color,
                    fontFamily: "'Google Sans Display',sans-serif",
                  }}>
                    {athlete.full_name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, color: textPri, textAlign: 'center', letterSpacing: '-0.01em' }}>
                    {athlete.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif" }}>
                    {athlete.email}
                  </Typography>
                </Box>

                {/* Status badge */}
                <Box sx={{
                  bgcolor: statusCfg.bg || alpha(statusCfg.color, 0.1),
                  border: `1px solid ${statusCfg.border || alpha(statusCfg.color, 0.3)}`,
                  borderRadius: '12px', p: 2, mb: 2.5, textAlign: 'center',
                }}>
                  <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{statusCfg.icon}</Typography>
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', color: statusCfg.color }}>
                    APPLICATION {statusCfg.label}
                  </Typography>
                </Box>

                {/* ID number / ref */}
                <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '10px', p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", display: 'block', mb: 0.25 }}>ATHLETE ID</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: CYAN, fontWeight: 700, letterSpacing: '0.08em' }}>
                    SCM-{String(athlete.id || 0).padStart(6, '0')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: border }} />

                <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", display: 'block', textAlign: 'center' }}>
                  Registered: {registered}
                </Typography>
              </Box>
            </Box>

            {/* Age Group vs BMI Comparison Card */}
            {athlete.bmi && (
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '24px', mt: 3, p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <BarChartIcon sx={{ color: CYAN, fontSize: 18 }} />
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', color: textSec, textTransform: 'uppercase' }}>
                      Age Group vs BMI Comparison
                    </Typography>
                  </Box>
                </Box>

                {/* Legend mimicking the uploaded chart style precisely */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mb: 3, mt: 1 }}>
                  {[
                    { label: 'Normal (v6)', color: '#3b82f6' },
                    { label: 'Overweight (v7)', color: '#fbbf24' },
                    { label: 'Obese (v8)', color: '#ef4444' }
                  ].map((leg) => (
                    <Box key={leg.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 3, bgcolor: leg.color, borderRadius: '2px' }} />
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: textSec, fontFamily: "'Google Sans', sans-serif" }}>
                        {leg.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {bmiChartLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={20} sx={{ color: CYAN }} />
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', position: 'relative' }}>
                    {/* SVG Responsive Stacked Area Chart */}
                    <Box sx={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
                      <svg viewBox="0 0 450 280" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
                        {/* Define gradients for the stacked areas */}
                        <defs>
                          {/* Royal Blue Area Gradient */}
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.15} />
                          </linearGradient>
                          {/* Amber Yellow Area Gradient */}
                          <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.15} />
                          </linearGradient>
                          {/* Red Pink Area Gradient */}
                          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.15} />
                          </linearGradient>
                        </defs>

                        {/* Chart Grid Lines & Ticks */}
                        {/* Horizontal guidelines */}
                        {[0, 10, 20, 30, 40].map((gridBmi) => {
                          const y = 245 - (gridBmi / 40) * 210;
                          return (
                            <g key={gridBmi}>
                              <line
                                x1="45"
                                y1={y}
                                x2="435"
                                y2={y}
                                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
                                strokeDasharray={gridBmi === 0 ? '0' : '3 3'}
                                strokeWidth={gridBmi === 0 ? 1.5 : 1}
                              />
                              <text
                                x="35"
                                y={y + 4}
                                textAnchor="end"
                                fill={textSec}
                                fontSize="9px"
                                fontFamily="'Google Sans', sans-serif"
                                fontWeight={600}
                              >
                                {gridBmi === 40 ? '40' : gridBmi === 30 ? '30' : gridBmi === 20 ? '20' : gridBmi === 10 ? '10' : '0'}
                              </text>
                            </g>
                          );
                        })}

                        {/* Determine User Group Column and Position */}
                        {(() => {
                          const userAge = athlete.age || 20;
                          let activeIdx = 1;
                          let activeGroupName = '18–25';
                          
                          if (userAge < 18) { activeIdx = 0; activeGroupName = 'Under 18'; }
                          else if (userAge <= 25) { activeIdx = 1; activeGroupName = '18–25'; }
                          else if (userAge <= 35) { activeIdx = 2; activeGroupName = '26–35'; }
                          else if (userAge <= 45) { activeIdx = 3; activeGroupName = '36–45'; }
                          else if (userAge <= 55) { activeIdx = 4; activeGroupName = '46–55'; }
                          else { activeIdx = 5; activeGroupName = 'Over 55'; }

                          const userBmiVal = parseFloat(athlete.bmi || 23.15);
                          const userX = 45 + (activeIdx / 5) * 390;
                          const userY = 245 - (userBmiVal / 40) * 210;

                          return (
                            <>
                              {/* Background highlight region for matching user group */}
                              <rect
                                x={userX - 25}
                                y="35"
                                width="50"
                                height="210"
                                fill={isDark ? 'rgba(6, 182, 212, 0.04)' : 'rgba(0, 78, 92, 0.02)'}
                                rx="8"
                              />

                              {/* Stacked Area Fills (Organic peaks/troughs styled like the upload) */}
                              {/* Series 3: Obese (Top Area, Red) */}
                              <path
                                d="M 45,108.5 L 45,66.5 L 123,48.1 L 201,61.2 L 279,40.25 L 357,53.3 L 435,35.0 L 435,71.75 L 357,90.1 L 279,77.0 L 201,98.0 L 123,84.8 Z"
                                fill="url(#redGrad)"
                              />

                              {/* Series 2: Overweight (Middle Area, Yellow) */}
                              <path
                                d="M 45,150.5 L 45,108.5 L 123,84.8 L 201,98.0 L 279,77.0 L 357,90.1 L 435,71.75 L 435,119.0 L 357,134.75 L 279,124.25 L 201,142.6 L 123,129.5 Z"
                                fill="url(#yellowGrad)"
                              />

                              {/* Series 1: Normal (Bottom Area, Blue) */}
                              <path
                                d="M 45,245 L 45,150.5 L 123,129.5 L 201,142.6 L 279,124.25 L 357,134.75 L 435,119.0 L 435,245 Z"
                                fill="url(#blueGrad)"
                              />

                              {/* High-contrast stroke outlines of each boundary */}
                              <path
                                d="M 45,66.5 L 123,48.1 L 201,61.2 L 279,40.25 L 357,53.3 L 435,35.0"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2"
                              />
                              <path
                                d="M 45,108.5 L 123,84.8 L 201,98.0 L 279,77.0 L 357,90.1 L 435,71.75"
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="2"
                              />
                              <path
                                d="M 45,150.5 L 123,129.5 L 201,142.6 L 279,124.25 L 357,134.75 L 435,119.0"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                              />

                              {/* Vertical Tracking Line at User Group */}
                              <line
                                x1={userX}
                                y1="35"
                                x2={userX}
                                y2="245"
                                stroke={LIME}
                                strokeDasharray="4 4"
                                strokeWidth="1.5"
                              />

                              {/* Target Marker Pointer for Athlete's personal BMI */}
                              <g transform={`translate(${userX}, ${userY})`}>
                                {/* Outer pulsing ring */}
                                <circle r="11" fill="none" stroke={LIME} strokeWidth="1.5">
                                  <animate attributeName="r" values="6;16;6" dur="2.5s" repeatCount="indefinite" />
                                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
                                </circle>
                                {/* Solid center indicator */}
                                <circle r="6" fill={LIME} stroke="#ffffff" strokeWidth="2" style={{ filter: 'drop-shadow(0px 0px 6px rgba(212,255,0,0.8))' }} />
                              </g>

                              {/* Floating speech bubble label above the pointer pin */}
                              <g transform={`translate(${userX}, ${userY - 14})`}>
                                <rect
                                  x="-42"
                                  y="-28"
                                  width="84"
                                  height="22"
                                  rx="6"
                                  fill={isDark ? 'rgba(23, 23, 37, 0.95)' : '#ffffff'}
                                  stroke={LIME}
                                  strokeWidth="1.5"
                                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))' }}
                                />
                                <text
                                  x="0"
                                  y="-14"
                                  textAnchor="middle"
                                  fill={LIME}
                                  fontSize="9px"
                                  fontWeight={800}
                                  fontFamily="'Google Sans', sans-serif"
                                >
                                  YOU: {userBmiVal.toFixed(2)}
                                </text>
                                {/* Mini pointer triangle */}
                                <path
                                  d="M -4,-6 L 0,-1 L 4,-6 Z"
                                  fill={isDark ? 'rgba(23, 23, 37, 0.95)' : '#ffffff'}
                                  stroke={LIME}
                                  strokeWidth="1"
                                />
                              </g>

                              {/* X-axis labels at bottom */}
                              {[
                                { text: 'U18', idx: 0 },
                                { text: '18-25', idx: 1 },
                                { text: '26-35', idx: 2 },
                                { text: '36-45', idx: 3 },
                                { text: '46-55', idx: 4 },
                                { text: '55+', idx: 5 }
                              ].map((lbl) => {
                                const x = 45 + (lbl.idx / 5) * 390;
                                const isSelected = lbl.idx === activeIdx;
                                return (
                                  <text
                                    key={lbl.text}
                                    x={x}
                                    y="265"
                                    textAnchor="middle"
                                    fill={isSelected ? LIME : textSec}
                                    fontSize="10px"
                                    fontFamily="'Google Sans', sans-serif"
                                    fontWeight={isSelected ? 800 : 500}
                                  >
                                    {lbl.text}
                                  </text>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </Box>

                    {/* Small helpful description sub-card */}
                    <Box sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      border: `1px solid ${border}`,
                      textAlign: 'center'
                    }}>
                      <Typography sx={{ fontSize: '0.74rem', color: textPri, fontFamily: "'Google Sans', sans-serif", lineHeight: 1.4 }}>
                        Your BMI of <strong style={{ color: LIME }}>{parseFloat(athlete.bmi).toFixed(2)}</strong> is plotted against population averages for standard classifications across age demographics.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* ── Upcoming Tournaments Timeline Section ──────────────── */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
                boxShadow: isDark ? '0 12px 32px rgba(212,255,0,0.08)' : '0 4px 16px rgba(0,0,0,0.04)',
                borderLeft: `4px solid ${LIME}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <EmojiEventsIcon sx={{ color: LIME, fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.15em', color: textSec, textTransform: 'uppercase' }}>
                    UPCOMING TOURNAMENTS TIMELINE
                  </Typography>
                  <Chip 
                    label={`${tournaments.length} Scheduled`} 
                    size="small" 
                    sx={{ bgcolor: isDark ? 'rgba(212,255,0,0.1)' : 'rgba(83,102,0,0.08)', color: LIME, fontWeight: 700, fontFamily: "'Google Sans',sans-serif", height: 18, fontSize: '0.62rem' }} 
                  />
                </Box>

                {paymentError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setPaymentError('')}>{paymentError}</Alert>}
                {paymentSuccess && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setPaymentSuccess('')}>{paymentSuccess}</Alert>}

                {tournaments.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem' }}>
                      No upcoming tournaments listed yet. Check back soon!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    maxHeight: '380px', 
                    overflowY: 'auto', 
                    pr: 1.5,
                    position: 'relative',
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: border, borderRadius: '10px' }
                  }}>
                    {/* Vertical Timeline Line */}
                    <Box sx={{
                      position: 'absolute',
                      left: '16px',
                      top: '8px',
                      bottom: '8px',
                      width: '2px',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
                    }} />

                    {tournaments.map((t, index) => {
                      const isPaid = t.payment_status === 'Paid';
                      const formattedDate = new Date(t.event_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      });

                      return (
                        <Box key={t.id} sx={{ 
                          position: 'relative', 
                          pl: '40px', 
                          mb: index === tournaments.length - 1 ? 0 : 3.5 
                        }}>
                          {/* Timeline Dot */}
                          <Box sx={{
                            position: 'absolute',
                            left: '10px',
                            top: '4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            bgcolor: isPaid ? '#34D399' : CYAN,
                            border: `3px solid ${bg}`,
                            boxShadow: isPaid ? '0 0 10px rgba(52,211,153,0.5)' : `0 0 10px ${alpha(CYAN, 0.5)}`,
                            zIndex: 2,
                            transition: 'all 0.3s ease'
                          }} />

                          {/* Content Card */}
                          <Box sx={{
                            p: 2.5,
                            border: `1px solid ${isPaid ? 'rgba(52,211,153,0.2)' : border}`,
                            borderRadius: '16px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                            transition: 'transform 0.2s, border-color 0.2s',
                            '&:hover': {
                              transform: 'translateX(3px)',
                              borderColor: isPaid ? '#34D399' : CYAN
                            }
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 700, color: textPri, lineHeight: 1.3 }}>
                                  {t.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                  <Chip 
                                    label={t.sport} 
                                    size="small" 
                                    sx={{ height: 16, fontSize: '0.6rem', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(0,78,92,0.08)', color: CYAN }} 
                                  />
                                  <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600 }}>
                                    📅 {formattedDate}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, color: LIME, fontSize: '1.05rem' }}>
                                ₹{parseFloat(t.fee_amount).toFixed(0)}
                              </Typography>
                            </Box>

                            {t.description && (
                              <Typography variant="body2" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', lineHeight: 1.4, mb: 2 }}>
                                {t.description}
                              </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                              {isPaid ? (
                                <>
                                  <Chip 
                                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#34D399 !important' }} />}
                                    label="Registered & Paid"
                                    color="success"
                                    size="small"
                                    sx={{ 
                                      fontFamily: "'Google Sans',sans-serif", 
                                      fontWeight: 700, 
                                      fontSize: '0.72rem',
                                      bgcolor: 'rgba(52,211,153,0.12)',
                                      color: '#34D399',
                                      border: '1px solid rgba(52,211,153,0.2)'
                                    }}
                                  />
                                  {t.receipt_url && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleDownloadReceipt(t.payment_id)}
                                      disabled={downloading === t.payment_id}
                                      sx={{ 
                                        borderRadius: '8px', 
                                        borderColor: 'rgba(52,211,153,0.3)', 
                                        color: '#34D399', 
                                        py: 0.2, px: 1.5,
                                        fontSize: '0.72rem',
                                        fontFamily: "'Google Sans',sans-serif",
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(52,211,153,0.05)' } 
                                      }}
                                    >
                                      {downloading === t.payment_id ? <CircularProgress size={11} sx={{ color: '#34D399' }} /> : 'Receipt'}
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handlePayNowForTournament(t)}
                                  disabled={paying}
                                  sx={{ 
                                    borderRadius: '8px', 
                                    fontFamily: "'Google Sans',sans-serif", 
                                    fontWeight: 700, 
                                    fontSize: '0.72rem',
                                    py: 0.4, px: 2,
                                    bgcolor: LIME, 
                                    color: '#0A0A12', 
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' } 
                                  }}
                                >
                                  Apply Now
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* AI Sports Assistant */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
                boxShadow: isDark ? '0 12px 32px rgba(6,182,212,0.08)' : '0 4px 16px rgba(0,0,0,0.04)',
                borderLeft: `4px solid ${CYAN}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ color: CYAN, fontSize: 18 }} />
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.15em', color: textSec, textTransform: 'uppercase' }}>
                      AI SPORTS ASSISTANT
                    </Typography>
                  </Box>
                  {aiData && (
                    <Button size="small" variant="text" onClick={fetchAiAssistant} disabled={aiLoading} sx={{ fontSize: '0.72rem', textTransform: 'none', color: LIME, fontFamily: "'Google Sans',sans-serif", fontWeight: 600 }}>
                      Recalculate Plan
                    </Button>
                  )}
                </Box>

                {!aiData ? (
                  <Box>
                    <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.9rem', mb: 2, lineHeight: 1.6 }}>
                      Get a personalized athletic development plan tailored to your age classification, sports profile, and competitive background.
                    </Typography>

                    {aiError && (
                      <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', fontFamily: "'Google Sans',sans-serif" }}>
                        {aiError}
                      </Alert>
                    )}

                    <Button
                      variant="contained"
                      disabled={aiLoading}
                      onClick={fetchAiAssistant}
                      sx={{
                        borderRadius: '9999px',
                        fontFamily: "'Google Sans',sans-serif",
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        bgcolor: isDark ? '#d4ff00' : '#536600',
                        color: isDark ? '#0A0A12' : '#ffffff',
                        boxShadow: isDark ? '0 0 16px rgba(212,255,0,0.3)' : 'none',
                        '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' }
                      }}
                    >
                      {aiLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={12} sx={{ color: isDark ? '#0A0A12' : '#ffffff' }} />
                          <span>Generating plan...</span>
                        </Box>
                      ) : (
                        "Get My Improvement Plan"
                      )}
                    </Button>

                    {aiLoading && (
                      <Typography variant="body2" sx={{ color: textSec, mt: 1.5, fontFamily: "'Google Sans',sans-serif", fontStyle: 'italic' }}>
                        Generating your training suggestions...
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.9rem', fontWeight: 500, fontStyle: 'italic', borderLeft: `3px solid ${LIME}`, pl: 1.5, py: 0.5, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderRadius: '0 8px 8px 0' }}>
                      "{aiData.greeting || `Hello ${athlete.full_name}!`}"
                    </Typography>

                    <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {aiData.athleteSummary}
                    </Typography>

                    <Grid container spacing={2}>
                      {[
                        { label: 'Diet Suggestions', data: aiData.dietSuggestions },
                        { label: 'Training Suggestions', data: aiData.trainingSuggestions },
                        { label: 'Stamina Plan', data: aiData.staminaPlan },
                        { label: 'Strength Focus', data: aiData.strengthFocus },
                        { label: 'Flexibility Tips', data: aiData.flexibilityTips },
                      ].map(({ label, data }) => (
                        <Grid item xs={12} key={label}>
                          <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${border}`, borderRadius: '12px', p: 2 }}>
                            <Typography variant="caption" sx={{ color: CYAN, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                              {label.toUpperCase()}
                            </Typography>
                            {renderList(data, textPri)}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {aiData.weeklyRoutine && (
                      <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${border}`, borderRadius: '12px', p: 2 }}>
                        <Typography variant="caption" sx={{ color: INDIGO, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                          WEEKLY DEVELOPMENT ROUTINE
                        </Typography>
                        {renderList(aiData.weeklyRoutine, textPri)}
                      </Box>
                    )}

                    {aiData.motivationMessage && (
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(212,255,0,0.04)' : 'rgba(83,102,0,0.03)', border: `1px dashed ${alpha(LIME, 0.3)}`, textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem', fontWeight: 500, color: LIME, fontStyle: 'italic' }}>
                          "{aiData.motivationMessage}"
                        </Typography>
                      </Box>
                    )}

                    {aiData.safetyNote && (
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(251,191,36,0.04)' : 'rgba(251,191,36,0.05)', border: `1px solid rgba(251,191,36,0.25)` }}>
                        <Typography variant="caption" sx={{ color: '#FBBF24', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>⚠️ SAFETY NOTE</Typography>
                        <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontSize: '0.85rem', lineHeight: 1.6 }}>{aiData.safetyNote}</Typography>
                      </Box>
                    )}

                    {aiData.disclaimer && (
                      <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.72rem', display: 'block', textAlign: 'center', mt: 1, borderTop: `1px solid ${border}`, pt: 1.5 }}>
                        ⚠️ {aiData.disclaimer}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Fitness Profile */}
              {athlete.height_cm && athlete.weight_kg && (
                <Box sx={{
                  bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                  backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <AutoAwesomeIcon sx={{ color: CYAN, fontSize: 18 }} />
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                      FITNESS PROFILE
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Height', value: `${athlete.height_cm} cm` },
                      { label: 'Weight', value: `${athlete.weight_kg} kg` },
                      { label: 'Calculated BMI', value: athlete.bmi || '—' },
                    ].map(({ label, value }) => (
                      <Grid item xs={12} sm={4} key={label}>
                        <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}>
                          {label.toUpperCase()}
                        </Typography>
                        <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '1.1rem' }}>
                          {value}
                        </Typography>
                      </Grid>
                    ))}
                    {athlete.bmi_category && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em' }}>
                            FITNESS STATUS:
                          </Typography>
                          <Chip
                            label={athlete.bmi_category}
                            size="small"
                            sx={{
                              fontFamily: "'Google Sans',sans-serif",
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              bgcolor:
                                athlete.bmi_category === 'Normal' ? (isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.1)') :
                                athlete.bmi_category === 'Underweight' ? (isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)') :
                                (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
                              color:
                                athlete.bmi_category === 'Normal' ? '#34D399' :
                                athlete.bmi_category === 'Underweight' ? '#FBBF24' : '#EF4444',
                              border: `1px solid ${
                                athlete.bmi_category === 'Normal' ? 'rgba(52, 211, 153, 0.3)' :
                                athlete.bmi_category === 'Underweight' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                              }`
                            }}
                          />
                        </Box>
                      </Grid>
                    )}

                    {/* BMI Visualization Chart */}
                    {athlete.bmi && (
                      <Grid item xs={12} sx={{ mt: 4, pt: 1 }}>
                        <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.12em', display: 'block', mb: 4.5, textTransform: 'uppercase' }}>
                          BMI Reference Chart & Indicator
                        </Typography>
                        
                        <Box sx={{ position: 'relative', px: 1.5, mb: 4.5 }}>
                          {/* Segmented Gradient Track */}
                          <Box sx={{
                            height: '10px',
                            borderRadius: '9999px',
                            background: 'linear-gradient(90deg, #FBBF24 0%, #FBBF24 14%, #34D399 14%, #34D399 40%, #FB7185 40%, #FB7185 60%, #EF4444 60%, #EF4444 100%)',
                            boxShadow: isDark ? '0 0 10px rgba(0,0,0,0.5) inset' : '0 2px 4px rgba(0,0,0,0.06) inset',
                            position: 'relative'
                          }}>
                            {/* Segment ticks */}
                            {[14, 40, 60].map((tick) => (
                              <Box key={tick} sx={{
                                position: 'absolute',
                                left: `${tick}%`,
                                top: -2,
                                width: '2px',
                                height: '14px',
                                bgcolor: isDark ? '#0A0A12' : '#ffffff',
                                zIndex: 1
                              }} />
                            ))}
                          </Box>

                          {/* Indicator Pin */}
                          {(() => {
                            const bmiVal = parseFloat(athlete.bmi);
                            const minBmi = 15;
                            const maxBmi = 40;
                            const pct = Math.min(100, Math.max(0, ((bmiVal - minBmi) / (maxBmi - minBmi)) * 100));
                            
                            const getBmiColor = (b) => {
                              if (b < 18.5) return '#FBBF24'; // Amber
                              if (b >= 18.5 && b <= 24.9) return '#34D399'; // Emerald
                              if (b >= 25 && b <= 29.9) return '#FB7185'; // Rose
                              return '#EF4444'; // Red
                            };
                            const markerColor = getBmiColor(bmiVal);
                            
                            return (
                              <Box sx={{
                                position: 'absolute',
                                left: `${pct}%`,
                                top: '-2px',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                transition: 'left 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                zIndex: 2
                              }}>
                                {/* Pulsing indicator dot */}
                                <Box sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  bgcolor: markerColor,
                                  border: `2px solid ${isDark ? '#0A0A12' : '#ffffff'}`,
                                  boxShadow: `0 0 12px ${markerColor}, 0 4px 10px rgba(0,0,0,0.35)`,
                                  position: 'relative',
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: -6,
                                    left: -6,
                                    right: -6,
                                    bottom: -6,
                                    borderRadius: '50%',
                                    border: `2px solid ${markerColor}`,
                                    animation: 'bmiPulse 2s infinite ease-in-out',
                                    '@keyframes bmiPulse': {
                                      '0%': { transform: 'scale(0.9)', opacity: 0.9 },
                                      '50%': { transform: 'scale(1.6)', opacity: 0 },
                                      '100%': { transform: 'scale(0.9)', opacity: 0 }
                                    }
                                  }
                                }} />
                                
                                {/* Dynamic Floating Tag */}
                                <Box sx={{
                                  position: 'absolute',
                                  bottom: '22px',
                                  bgcolor: isDark ? 'rgba(23, 23, 37, 0.95)' : '#ffffff',
                                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                  borderRadius: '8px',
                                  px: 1.2,
                                  py: 0.4,
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                  whiteSpace: 'nowrap',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  backdropFilter: 'blur(8px)'
                                }}>
                                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: markerColor, fontFamily: "'Google Sans', sans-serif" }}>
                                    {bmiVal.toFixed(2)}
                                  </Typography>
                                  <Box sx={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    width: 8,
                                    height: 8,
                                    bgcolor: isDark ? 'rgba(23, 23, 37, 0.95)' : '#ffffff',
                                    borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                    transform: 'rotate(45deg)'
                                  }} />
                                </Box>
                              </Box>
                            );
                          })()}
                        </Box>

                        {/* Reference labels */}
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {[
                            { name: 'Underweight', range: '< 18.5', color: '#FBBF24' },
                            { name: 'Normal', range: '18.5 - 24.9', color: '#34D399' },
                            { name: 'Overweight', range: '25.0 - 29.9', color: '#FB7185' },
                            { name: 'Obese', range: '≥ 30.0', color: '#EF4444' },
                          ].map((seg) => (
                            <Grid item xs={3} key={seg.name} sx={{ textAlign: 'center' }}>
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: seg.color }} />
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: textPri, fontFamily: "'Google Sans', sans-serif" }}>
                                  {seg.name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: textSec, display: 'block', fontFamily: "'Google Sans', sans-serif", fontSize: '0.65rem' }}>
                                {seg.range}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Personal Info */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <VerifiedIcon sx={{ color: CYAN, fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                    PERSONAL INFORMATION
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { icon: <CalendarTodayIcon sx={{ fontSize: 15 }} />, label: 'Date of Birth', value: athlete.dob ? `${new Date(athlete.dob).toLocaleDateString('en-IN')}${athlete.age ? ` · Age ${athlete.age}` : ''}` : '—' },
                    { icon: <PhoneIcon sx={{ fontSize: 15 }} />, label: 'Mobile', value: athlete.mobile || '—' },
                    { icon: <PeopleIcon sx={{ fontSize: 15 }} />, label: 'Gender', value: athlete.gender || '—' },
                    { icon: <LocationOnIcon sx={{ fontSize: 15 }} />, label: 'Location', value: [athlete.city, athlete.state].filter(Boolean).join(', ') || '—' },
                  ].map(({ icon, label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{ color: textSec, mt: 0.2, flexShrink: 0 }}>{icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}>
                            {label.toUpperCase()}
                          </Typography>
                          <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: '0.88rem' }}>
                            {value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Sports & Competition */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <EmojiEventsIcon sx={{ color: isDark ? '#d4ff00' : '#536600', fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                    SPORTS & COMPETITION
                  </Typography>
                </Box>

                {/* Sport chips */}
                {sports.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                    {sports.map(sport => (
                      <Chip
                        key={sport}
                        label={`${SPORT_EMOJIS[sport] || '🏅'} ${sport}`}
                        sx={{
                          fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.8rem',
                          bgcolor: isDark ? 'rgba(212,255,0,0.1)' : 'rgba(83,102,0,0.08)',
                          color: isDark ? '#d4ff00' : '#536600',
                          border: `1px solid ${isDark ? 'rgba(212,255,0,0.25)' : 'rgba(83,102,0,0.2)'}`,
                          borderRadius: '9999px',
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Grid container spacing={2}>
                  {[
                    { icon: <EmojiEventsIcon sx={{ fontSize: 15 }} />, label: 'Competition', value: athlete.competition_name || '—' },
                    { icon: <EmojiEventsIcon sx={{ fontSize: 15 }} />, label: 'Age Group', value: athlete.age_group || '—' },
                    { icon: <LocationOnIcon sx={{ fontSize: 15 }} />, label: 'Club', value: athlete.club_name || '—' },
                    { icon: <LocationOnIcon sx={{ fontSize: 15 }} />, label: 'State Assoc.', value: athlete.state_association || '—' },
                  ].map(({ icon, label, value }) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{ color: textSec, mt: 0.2, flexShrink: 0 }}>{icon}</Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}>
                            {label.toUpperCase()}
                          </Typography>
                          <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: '0.88rem' }}>
                            {value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Guardian Info */}
              <Box sx={{
                bgcolor: cardBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${border}`, borderRadius: '20px', p: 3,
                backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <PeopleIcon sx={{ color: INDIGO, fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: textSec, textTransform: 'uppercase' }}>
                    GUARDIAN DETAILS
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: 'Guardian Name', value: athlete.guardian_name || '—' },
                    { label: 'Relation', value: athlete.relation || '—' },
                    { label: 'Mobile', value: athlete.guardian_mobile || '—' },
                  ].map(({ label, value }) => (
                    <Grid item xs={12} sm={4} key={label}>
                      <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', display: 'block' }}>
                        {label.toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 500, fontSize: '0.88rem' }}>
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>

            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── Test Mode Sandbox Simulator Dialog (Razorpay Replica) ──────────────────── */}
      <Dialog
        open={sandboxDialog}
        onClose={() => !paying && setSandboxDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0A0A12' : '#ffffff',
            border: `1px solid ${border}`,
            borderRadius: '24px',
            overflow: 'hidden',
            maxWidth: '650px',
            boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.7)' : '0 8px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ bgcolor: '#111827', color: '#ffffff', p: 3, borderBottom: `1px solid ${border}`, position: 'relative' }}>
          <Box sx={{ height: 3, width: '100%', position: 'absolute', top: 0, left: 0, background: `linear-gradient(90deg, ${CYAN}, ${LIME})` }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 44, height: 44, bgcolor: '#1F2937', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: LIME, fontSize: '1.1rem' }}>
                SC
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, lineHeight: 1.2 }}>
                  Sports Club Management
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Google Sans',sans-serif" }}>
                  {sandboxOrder?.fee_type || 'Competition Fee'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Amount to Pay
              </Typography>
              <Typography sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, fontSize: '1.4rem', color: LIME }}>
                ₹{(sandboxOrder?.amount / 100).toLocaleString()}.00
              </Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0, minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
          {!outcomeOpen ? (
            <Grid container sx={{ flex: 1 }}>
              <Grid item xs={4} sx={{ borderRight: `1px solid ${border}`, bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { id: 'card',    label: 'Card',     icon: CreditCardIcon },
                    { id: 'upi',     label: 'UPI / QR', icon: QrCodeIcon },
                    { id: 'netbank', label: 'Netbanking', icon: AccountBalanceIcon },
                    { id: 'contact', label: 'Details',  icon: ContactPhoneIcon },
                  ].map(m => {
                    const active = activeMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <Button
                        key={m.id}
                        onClick={() => setActiveMethod(m.id)}
                        sx={{
                          justifyContent: 'flex-start',
                          px: 2.5, py: 2,
                          borderRadius: 0,
                          fontFamily: "'Google Sans',sans-serif",
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: active ? CYAN : textSec,
                          borderLeft: `4px solid ${active ? CYAN : 'transparent'}`,
                          bgcolor: active ? (isDark ? 'rgba(6,182,212,0.05)' : 'rgba(0,78,92,0.03)') : 'transparent',
                          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' },
                        }}
                        startIcon={<Icon sx={{ color: active ? CYAN : textSec }} />}
                      >
                        {m.label}
                      </Button>
                    );
                  })}
                </Box>
                <Box sx={{ p: 2, mt: 'auto', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
                  <Chip label="TEST SANDBOX" size="small" sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: 'rgba(212,255,0,0.1)', color: LIME, fontSize: '0.62rem' }} />
                </Box>
              </Grid>

              <Grid item xs={8} sx={{ p: 3 }}>
                {activeMethod === 'card' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: textPri }}>
                      Credit or Debit Card
                    </Typography>
                    <TextField
                      size="small" fullWidth label="Card Number" placeholder="4111 1111 1111 1111"
                      value={simCardNo} onChange={e => setSimCardNo(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        size="small" label="Expiry (MM/YY)" placeholder="12/29"
                        value={simCardExp} onChange={e => setSimCardExp(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                      <TextField
                        size="small" label="CVV" placeholder="123" type="password"
                        value={simCardCvv} onChange={e => setSimCardCvv(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>
                    <TextField
                      size="small" fullWidth label="Cardholder Name" placeholder="Mr. Athlete Name"
                      value={simCardName} onChange={e => setSimCardName(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <Box sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${border}`, borderRadius: '12px', p: 1.5, mt: 1 }}>
                      <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", lineHeight: 1.4 }}>
                        🔒 <strong>Razorpay Mock Checkout:</strong> Safe to use dummy card details to proceed.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {activeMethod === 'upi' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: textPri, width: '100%', textAlign: 'left' }}>
                      Scan QR Code or Pay via UPI
                    </Typography>
                    <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', display: 'inline-flex', justifyContent: 'center', mb: 0.5 }}>
                      <Box sx={{ width: 110, height: 110, display: 'flex', flexWrap: 'wrap', p: 0.5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', width: '100%', height: '100%' }}>
                          {[
                            1,0,1,1,
                            0,1,0,0,
                            1,0,1,1,
                            1,1,0,1
                          ].map((x, i) => (
                            <Box key={i} sx={{ bgcolor: x ? '#000000' : 'transparent', borderRadius: '3px' }} />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", mb: 1 }}>
                      Scan above code using any mock UPI App
                    </Typography>
                    <Divider sx={{ width: '100%', my: 0.5 }}>OR</Divider>
                    <TextField
                      size="small" fullWidth label="UPI ID / VPA" placeholder="athlete@upi"
                      value={simUpi} onChange={e => setSimUpi(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>
                )}

                {activeMethod === 'netbank' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: textPri }}>
                      Popular Banks
                    </Typography>
                    <Grid container spacing={1.5}>
                      {[
                        { id: 'sbi',   name: 'State Bank of India', code: 'SBI'  },
                        { id: 'hdfc',  name: 'HDFC Bank',           code: 'HDFC' },
                        { id: 'icici', name: 'ICICI Bank',          code: 'ICICI'},
                        { id: 'axis',  name: 'Axis Bank',           code: 'AXIS' },
                        { id: 'kotak', name: 'Kotak Mahindra',      code: 'KOTAK'},
                        { id: 'pnb',   name: 'Punjab National',     code: 'PNB'  },
                      ].map(b => {
                        const sel = simBank === b.id;
                        return (
                          <Grid item xs={6} key={b.id}>
                            <Button
                              fullWidth
                              onClick={() => setSimBank(b.id)}
                              variant={sel ? 'contained' : 'outlined'}
                              sx={{
                                py: 1.5,
                                borderRadius: '12px',
                                fontFamily: "'Google Sans',sans-serif",
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                border: sel ? 'none' : `1px solid ${border}`,
                                color: sel ? '#0A0A12' : textPri,
                                bgcolor: sel ? LIME : 'transparent',
                                '&:hover': {
                                  bgcolor: sel ? '#e8ff4d' : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                                  borderColor: LIME,
                                },
                              }}
                            >
                              🏦 {b.code}
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                {activeMethod === 'contact' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: textPri }}>
                      Athlete Details
                    </Typography>
                    <TextField
                      size="small" fullWidth label="Full Name" value={athlete.full_name || ''} InputProps={{ readOnly: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                      size="small" fullWidth label="Email" value={athlete.email || ''} InputProps={{ readOnly: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                      size="small" fullWidth label="Phone" value={athlete.mobile || ''} InputProps={{ readOnly: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1, gap: 2 }}>
              <Typography variant="h5" sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, color: LIME }}>
                ⚡ Simulate Transaction Outcome
              </Typography>
              <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.88rem', maxWidth: 440, mb: 1, lineHeight: 1.5 }}>
                Choose the mock status outcome for your sandbox transaction. This lets you test both payment confirmation logs and failure warnings immediately.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 400, flexDirection: 'column' }}>
                <Button
                  variant="contained" fullWidth size="large"
                  onClick={() => {
                    handleSimulateSuccess(sandboxOrder);
                    setOutcomeOpen(false);
                  }}
                  sx={{ borderRadius: '9999px', py: 1.5, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: '#34D399', color: '#0A0A12', '&:hover': { bgcolor: '#10B981' } }}
                >
                  ✓ Succeed Payment (Simulate Success)
                </Button>
                
                <Button
                  variant="outlined" fullWidth size="large"
                  onClick={() => {
                    handleSimulateFailure(sandboxOrder);
                    setOutcomeOpen(false);
                  }}
                  sx={{ borderRadius: '9999px', py: 1.5, fontFamily: "'Google Sans',sans-serif", fontWeight: 700, borderColor: '#EF4444', color: '#EF4444', '&:hover': { borderColor: '#DC2626', bgcolor: 'rgba(239,68,68,0.05)' } }}
                >
                  ✗ Fail Payment (Simulate Cancellation)
                </Button>

                <Button
                  variant="text" fullWidth
                  onClick={() => setOutcomeOpen(false)}
                  sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 600, color: textSec }}
                >
                  ← Change Payment Details
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>

        {!outcomeOpen && (
          <Box sx={{ p: 2.5, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
            <Button
              onClick={() => setSandboxDialog(false)}
              sx={{ borderRadius: '9999px', px: 3, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, color: textSec }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setOutcomeOpen(true)}
              sx={{
                borderRadius: '9999px', px: 4, py: 1.2,
                fontFamily: "'Google Sans',sans-serif", fontWeight: 700,
                bgcolor: CYAN, color: '#0A0A12',
                '&:hover': { bgcolor: isDark ? '#22d3ee' : '#0891b2' }
              }}
            >
              Pay ₹{(sandboxOrder?.amount / 100).toLocaleString()}.00 →
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
