// ─────────────────────────────────────────────────────────────
// pages/StudentPayments.jsx  –  Athlete: My Payments
//
// Shows competition fees, Pay Now via Razorpay checkout,
// payment history table, and receipt download.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert,
  CircularProgress, Card, CardContent, Divider, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl, Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PaymentIcon        from '@mui/icons-material/Payment';
import DownloadIcon       from '@mui/icons-material/Download';
import ArrowBackIcon      from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon    from '@mui/icons-material/ReceiptLong';
import AddCardIcon        from '@mui/icons-material/AddCard';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon   from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CreditCardIcon     from '@mui/icons-material/CreditCard';
import QrCodeIcon         from '@mui/icons-material/QrCode';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContactPhoneIcon   from '@mui/icons-material/ContactPhone';

// ── Status chip config ────────────────────────────────────────
const statusConfig = {
  Paid:    { color: 'success', icon: CheckCircleIcon,    label: 'Paid'    },
  Pending: { color: 'warning', icon: HourglassEmptyIcon, label: 'Pending' },
  Failed:  { color: 'error',   icon: ErrorOutlineIcon,   label: 'Failed'  },
};

// ── Load Razorpay checkout script ─────────────────────────────
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


export default function StudentPayments() {
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

  const [athlete,   setAthlete]   = useState(null);
  const [payments,  setPayments]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [paying,    setPaying]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [downloading, setDownloading] = useState(null);

  // New payments & tournaments state
  const [tournaments, setTournaments] = useState([]);

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

  const fetchTournaments = useCallback(async (studentId) => {
    try {
      const { data } = await axios.get(`/api/tournaments/student/${studentId}`);
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  }, []);

  const fetchPayments = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`/api/payments/student/${id}`);
      setPayments(data.payments || []);
    } catch {
      setError('Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async (id) => {
    fetchPayments(id);
    fetchTournaments(id);
  }, [fetchPayments, fetchTournaments]);

  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (!stored) { navigate('/athelete/login'); return; }
    const parsed = JSON.parse(stored);
    setAthlete(parsed);
    refreshData(parsed.id);
  }, [navigate, refreshData]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 5000); };

  // ── Download receipt ──────────────────────────────────────────
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
      setError('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // ── Sandbox Mode Simulator handlers ────────────────────────────
  const handleSimulateSuccess = async (order) => {
    setPaying(true);
    setSandboxDialog(false);
    setError('');
    try {
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = `sig_mock_${Date.now()}`;
      await axios.post('/api/payments/verify', {
        payment_record_id:  order.payment_record_id,
        razorpay_order_id:  order.razorpay_order_id,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature:  mockSignature,
      });
      showSuccess('🎉 [TEST MODE] Simulated successful payment! Your receipt is ready.');
      refreshData(athlete.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation verification failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleSimulateFailure = async (order) => {
    setPaying(true);
    setSandboxDialog(false);
    setError('');
    try {
      await axios.post('/api/payments/failed', {
        payment_record_id: order.payment_record_id,
        failure_reason:    'Simulated payment failure (User cancelled).',
      });
      setError('❌ [TEST MODE] Simulated payment cancellation/failure.');
      refreshData(athlete.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failure logging failed.');
    } finally {
      setPaying(false);
    }
  };

  // ── Razorpay payment flow ─────────────────────────────────────
  const handlePayNow = async (existingPayment) => {
    if (!existingPayment) return;
    setPaying(true);
    setError('');

    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Failed to load payment gateway. Please check your internet connection.');
      setPaying(false);
      return;
    }

    // Determine what we're paying for
    const paymentData = {
      student_id:       athlete.id,
      competition_name: existingPayment.competition_name,
      fee_type:         existingPayment.fee_type,
      amount:           existingPayment.amount,
      tournament_id:    existingPayment.tournament_id,
    };

    let orderData;
    try {
      const { data } = await axios.post('/api/payments/create-order', paymentData);
      orderData = data;

      // Sandbox Mode Intercept: if order ID is mock, bypass Razorpay SDK and open Simulation Dialog
      if (orderData.razorpay_order_id.startsWith('order_mock_')) {
        setSandboxOrder(orderData);
        setSandboxDialog(true);
        setPaying(false);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment order.');
      setPaying(false);
      return;
    }

    // Open Razorpay checkout
    const options = {
      key:         orderData.key_id,
      amount:      orderData.amount,       // paise
      currency:    orderData.currency,
      name:        'Sports Club Management',
      description: `${paymentData.fee_type} – ${paymentData.competition_name || 'Competition'}`,
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
          // User closed checkout without paying → mark as failed
          try {
            await axios.post('/api/payments/failed', {
              payment_record_id: orderData.payment_record_id,
              failure_reason:    'Payment cancelled by user.',
            });
          } catch { /* non-fatal */ }
          setError('Payment was cancelled. You can retry from the table below.');
          setPaying(false);
          refreshData(athlete.id);
        },
      },
      handler: async (paymentResponse) => {
        // Payment succeeded in Razorpay → verify on backend
        try {
          const { data: verifyData } = await axios.post('/api/payments/verify', {
            payment_record_id:  orderData.payment_record_id,
            razorpay_order_id:  paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature:  paymentResponse.razorpay_signature,
          });
          showSuccess('🎉 Payment successful! Your receipt is ready to download.');
          refreshData(athlete.id);
        } catch (verifyErr) {
          setError(verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.');
          refreshData(athlete.id);
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
      } catch { /* non-fatal */ }
      setError(`Payment failed: ${response.error?.description || 'Unknown error.'}`);
      setPaying(false);
      refreshData(athlete.id);
    });

    rzp.open();
  };

  const handlePayNowForTournament = async (t) => {
    setPaying(true);
    setError('');

    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError('Failed to load payment gateway. Please check your internet connection.');
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
      setError(err.response?.data?.message || 'Failed to create payment order.');
      setPaying(false);
      return;
    }

    // Sandbox Mode Intercept: if order ID is mock, bypass Razorpay SDK and open Simulation Dialog
    if (orderData.razorpay_order_id.startsWith('order_mock_')) {
      setSandboxOrder(orderData);
      setSandboxDialog(true);
      setPaying(false);
      return;
    }

    // Open Razorpay checkout
    const options = {
      key:         orderData.key_id,
      amount:      orderData.amount,       // paise
      currency:    orderData.currency,
      name:        'Sports Club Management',
      description: `${paymentData.fee_type} – ${paymentData.competition_name}`,
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
          } catch { /* non-fatal */ }
          setError('Payment was cancelled. You can retry from the table below.');
          setPaying(false);
          refreshData(athlete.id);
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
          showSuccess('🎉 Payment successful! Your registration is complete.');
          refreshData(athlete.id);
        } catch (verifyErr) {
          setError(verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.');
          refreshData(athlete.id);
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
      } catch { /* non-fatal */ }
      setError(`Payment failed: ${response.error?.description || 'Unknown error.'}`);
      setPaying(false);
      refreshData(athlete.id);
    });

    rzp.open();
  };

  // ── Formatting helpers ────────────────────────────────────────
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '—';

  // ── Summary stats ─────────────────────────────────────────────
  const paidCount    = payments.filter(p => p.payment_status === 'Paid').length;
  const totalRevenue = payments
    .filter(p => p.payment_status === 'Paid')
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  if (!athlete) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: bg, position: 'relative' }}>
      {isDark && (
        <>
          <Box sx={{ position: 'fixed', top: '-5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <Box sx={{ position: 'fixed', bottom: '10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        </>
      )}

      <Navbar title="Sports Club Management" />

      <Container maxWidth="lg" sx={{ py: 5, position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.12em', color: LIME, textTransform: 'uppercase', mb: 0.5 }}>
              ATHLETE PORTAL
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon sx={{ color: LIME, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontFamily: "'Google Sans Display','Montserrat',sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: textPri }}>
                My Payments
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined" size="small" startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/athelete/dashboard')}
              sx={{ borderRadius: '9999px', borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, '&:hover': { borderColor: LIME, color: LIME } }}
            >
              Dashboard
            </Button>
          </Box>
        </Box>

        {/* ── Alerts ─────────────────────────────────────────── */}
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}



        {/* ── Stats row ───────────────────────────────────────── */}
        {!loading && (
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Total',       value: payments.length,    color: CYAN          },
              { label: 'Paid',        value: paidCount,          color: '#34D399'     },
              { label: 'Pending',     value: payments.filter(p => p.payment_status === 'Pending').length, color: '#FBBF24' },
              { label: 'Failed',      value: payments.filter(p => p.payment_status === 'Failed').length,  color: '#ffb4ab' },
              { label: 'Total Spent', value: `₹${totalRevenue.toFixed(0)}`,           color: LIME          },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '16px', px: 3, py: 2, backdropFilter: 'blur(12px)', minWidth: 110, textAlign: 'center' }}>
                <Typography sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 800, fontSize: '1.7rem', color, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Loading ─────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: LIME }} />
            <Typography sx={{ mt: 2, color: textSec, fontFamily: "'Google Sans',sans-serif" }}>Loading payments...</Typography>
          </Box>
        ) : payments.length === 0 ? (
          /* ── Empty state ────────────────────────────────────── */
          <Box sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '24px', p: 6, textAlign: 'center', backdropFilter: 'blur(12px)' }}>
            <ReceiptLongIcon sx={{ fontSize: 64, color: isDark ? 'rgba(212,255,0,0.12)' : 'rgba(83,102,0,0.1)', mb: 2 }} />
            <Typography variant="h5" sx={{ fontFamily: "'Google Sans Display',sans-serif", fontWeight: 700, color: textPri, mb: 1 }}>
              No Payment Records Yet
            </Typography>
            <Typography sx={{ color: textSec, fontFamily: "'Google Sans',sans-serif", maxWidth: 420, mx: 'auto' }}>
              Your tournament payment logs and registration receipts will appear here once you complete a registration above.
            </Typography>
          </Box>
        ) : (
          /* ── Payment History Table ──────────────────────────── */
          <Box sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: '24px', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${border}` }}>
              <Typography sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', color: textSec, textTransform: 'uppercase' }}>
                {payments.length} Payment Record{payments.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Competition', 'Fee Type', 'Amount', 'Status', 'Razorpay ID', 'Date', 'Action'].map(h => (
                      <TableCell key={h} sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', color: textSec, textTransform: 'uppercase', borderColor: border, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((row) => {
                    const sc         = statusConfig[row.payment_status] || statusConfig.Pending;
                    const StatusIcon = sc.icon;
                    const hasCert    = !!row.receipt_url;
                    const canRetry   = row.payment_status === 'Failed' || row.payment_status === 'Pending';
                    const isPaid     = row.payment_status === 'Paid';

                    return (
                      <TableRow key={row.id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }, transition: 'background 0.15s' }}>
                        <TableCell sx={{ borderColor: border, color: textPri, fontFamily: "'Google Sans',sans-serif", fontWeight: 600, fontSize: '0.87rem' }}>
                          {row.competition_name || '—'}
                        </TableCell>
                        <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.82rem' }}>
                          {row.fee_type}
                        </TableCell>
                        <TableCell sx={{ borderColor: border, fontFamily: "'Google Sans Display',sans-serif", fontWeight: 700, color: LIME, fontSize: '0.95rem' }}>
                          ₹{parseFloat(row.amount).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ borderColor: border }}>
                          <Chip
                            icon={<StatusIcon style={{ fontSize: 13 }} />}
                            label={sc.label}
                            size="small"
                            color={sc.color}
                            sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.75rem', maxWidth: 170 }}>
                          <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                            {row.razorpay_payment_id || (row.payment_status === 'Failed' ? (
                              <Typography component="span" sx={{ color: '#ffb4ab', fontSize: '0.72rem', fontFamily: "'Google Sans',sans-serif", fontStyle: 'italic' }}>
                                {row.failure_reason ? row.failure_reason.substring(0, 35) + '…' : 'Failed'}
                              </Typography>
                            ) : '—')}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderColor: border, color: textSec, fontFamily: "'Google Sans',sans-serif", fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {isPaid ? fmtDate(row.paid_at) : fmtDate(row.created_at)}
                        </TableCell>
                        <TableCell sx={{ borderColor: border }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {/* Retry payment */}
                            {canRetry && (
                              <Button
                                size="small" variant="contained"
                                startIcon={paying ? <CircularProgress size={11} sx={{ color: '#0A0A12' }} /> : <PaymentIcon />}
                                disabled={paying}
                                onClick={() => handlePayNow(row)}
                                sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem', bgcolor: LIME, color: '#0A0A12', whiteSpace: 'nowrap', '&:hover': { bgcolor: isDark ? '#e8ff4d' : '#3e4c00' }, '&:disabled': { opacity: 0.5 } }}
                              >
                                {paying ? 'Processing…' : 'Pay Now'}
                              </Button>
                            )}
                            {/* Download receipt */}
                            {isPaid && (
                              <Button
                                size="small" variant="outlined"
                                startIcon={downloading === row.id ? <CircularProgress size={11} sx={{ color: 'inherit' }} /> : <DownloadIcon />}
                                disabled={!hasCert || downloading === row.id}
                                onClick={() => handleDownloadReceipt(row.id)}
                                sx={{ borderRadius: '9999px', fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: '0.7rem', borderColor: isDark ? 'rgba(52,211,153,0.4)' : 'rgba(5,150,105,0.4)', color: '#34D399', whiteSpace: 'nowrap', '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(52,211,153,0.06)' }, '&:disabled': { opacity: 0.4 } }}
                              >
                                {!hasCert ? 'No Receipt' : downloading === row.id ? 'Downloading…' : 'Receipt'}
                              </Button>
                            )}
                          </Box>
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
        {/* ── Razorpay Style Header ───────────────────────────────── */}
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

        {/* ── Main Body: Razorpay replica Columns ──────────────────── */}
        <DialogContent sx={{ p: 0, minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
          {!outcomeOpen ? (
            <Grid container sx={{ flex: 1 }}>
              {/* Left Column: Navigation menu */}
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
                {/* Sandbox notice */}
                <Box sx={{ p: 2, mt: 'auto', borderTop: `1px solid ${border}`, textAlign: 'center' }}>
                  <Chip label="TEST SANDBOX" size="small" sx={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, bgcolor: 'rgba(212,255,0,0.1)', color: LIME, fontSize: '0.62rem' }} />
                </Box>
              </Grid>

              {/* Right Column: Forms panel */}
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
                    
                    {/* Simulated QR Code */}
                    <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', display: 'inline-flex', justifyContent: 'center', mb: 0.5 }}>
                      <Box sx={{ width: 110, height: 110, display: 'flex', flexWrap: 'wrap', p: 0.5 }}>
                        {/* Mock QR generator using MUI Box segments */}
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
            /* ── Simulation Outcome Selector Slide-up Overlay ────────── */
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

        {/* ── Footer Action Button ────────────────────────────────── */}
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
