// ─────────────────────────────────────────────────────────────
// pages/CoachDashboard.jsx  –  Coach management dashboard
// Shows stats, student table, approve/reject actions,
// CSV export, SQL export.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Box, Typography, AppBar, Toolbar, Button,
  Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Tooltip, Alert, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icons
import LogoutIcon         from '@mui/icons-material/Logout';
import VisibilityIcon     from '@mui/icons-material/Visibility';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import CancelIcon         from '@mui/icons-material/Cancel';
import DownloadIcon       from '@mui/icons-material/Download';
import PeopleIcon         from '@mui/icons-material/People';
import HourglassIcon      from '@mui/icons-material/HourglassEmpty';
import TaskAltIcon        from '@mui/icons-material/TaskAlt';
import BlockIcon          from '@mui/icons-material/Block';
import StorageIcon        from '@mui/icons-material/Storage';

// ── Status chip color mapping ─────────────────────────────────
const STATUS_COLOR = {
  Pending:  'warning',
  Approved: 'success',
  Rejected: 'error',
};

// ── Summary stat card ─────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #e0e6ed' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          bgcolor: `${color}.light`, borderRadius: '50%',
          p: 1.5, display: 'flex', alignItems: 'center',
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function CoachDashboard() {
  const navigate    = useNavigate();
  const [coach, setCoach]         = useState(null);
  const [students, setStudents]   = useState([]);
  const [stats, setStats]         = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // student id being processed
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirm dialog state
  const [dialog, setDialog] = useState({ open: false, studentId: null, status: '', name: '' });

  // ── Auth guard ──────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('coach');
    if (!stored) { navigate('/coach/login'); return; }
    setCoach(JSON.parse(stored));
  }, [navigate]);

  // ── Fetch students ──────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/coaches/students');
      setStudents(data.students);
      setStats(data.stats);
    } catch (err) {
      setError('Failed to load students. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Logout ──────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('coach');
    navigate('/coach/login');
  };

  // ── Open confirm dialog ─────────────────────────────────
  const openDialog = (studentId, status, name) => {
    setDialog({ open: true, studentId, status, name });
  };
  const closeDialog = () => setDialog({ open: false, studentId: null, status: '', name: '' });

  // ── Approve / Reject ────────────────────────────────────
  const handleStatusUpdate = async () => {
    const { studentId, status } = dialog;
    closeDialog();
    setActionLoading(studentId);
    setError('');
    setSuccessMsg('');
    try {
      await axios.put(`/api/coaches/students/${studentId}/status`, { status });
      setSuccessMsg(`Student application ${status.toLowerCase()} successfully. Email sent.`);
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── CSV Export ──────────────────────────────────────────
  const handleCsvExport = () => {
    window.open('/api/coaches/export/csv', '_blank');
  };

  // ── SQL Export ──────────────────────────────────────────
  const handleSqlExport = () => {
    window.open('/api/coaches/export/sql', '_blank');
  };

  // ── Parse sports string ─────────────────────────────────
  const parseSports = (raw) => {
    try { return JSON.parse(raw).join(', '); }
    catch { return raw || '—'; }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* AppBar */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🏅 Sports Club — Coach Dashboard
          </Typography>
          {coach && (
            <Typography variant="body2" sx={{ mr: 2, opacity: 0.85 }}>
              {coach.name}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* Page header + export buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" color="primary">Student Applications</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleCsvExport} size="small">
              Export CSV
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<StorageIcon />} onClick={handleSqlExport} size="small">
              Export SQL
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error      && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

        {/* Stat cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<PeopleIcon   sx={{ color: 'primary.main' }}  />} label="Total Applications" value={stats.total}    color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<HourglassIcon sx={{ color: 'warning.main' }} />} label="Pending"             value={stats.pending}  color="warning" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<TaskAltIcon  sx={{ color: 'success.main' }}  />} label="Approved"            value={stats.approved} color="success" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<BlockIcon    sx={{ color: 'error.main' }}    />} label="Rejected"            value={stats.rejected} color="error"   />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Students Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : students.length === 0 ? (
          <Alert severity="info">No student applications yet.</Alert>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e6ed' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Age Group</TableCell>
                  <TableCell>Sports Applied</TableCell>
                  <TableCell>Competition</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s, idx) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{s.full_name}</Typography>
                    </TableCell>
                    <TableCell>{s.mobile}</TableCell>
                    <TableCell>{s.age_group || '—'}</TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography variant="body2" noWrap title={parseSports(s.sports_applied)}>
                        {parseSports(s.sports_applied)}
                      </Typography>
                    </TableCell>
                    <TableCell>{s.competition_name || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={s.status}
                        color={STATUS_COLOR[s.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {/* View Profile */}
                        <Tooltip title="View Profile">
                          <IconButton size="small" color="primary"
                            onClick={() => navigate(`/coach/student/${s.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Approve */}
                        {s.status !== 'Approved' && (
                          <Tooltip title="Approve">
                            <span>
                              <IconButton size="small" color="success"
                                disabled={actionLoading === s.id}
                                onClick={() => openDialog(s.id, 'Approved', s.full_name)}>
                                {actionLoading === s.id
                                  ? <CircularProgress size={16} />
                                  : <CheckCircleIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}

                        {/* Reject */}
                        {s.status !== 'Rejected' && (
                          <Tooltip title="Reject">
                            <span>
                              <IconButton size="small" color="error"
                                disabled={actionLoading === s.id}
                                onClick={() => openDialog(s.id, 'Rejected', s.full_name)}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      </Container>

      {/* Confirm Dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to <strong>{dialog.status}</strong> the application of{' '}
            <strong>{dialog.name}</strong>?
            {dialog.status === 'Approved'
              ? ' An approval email will be sent to the student.'
              : ' A rejection email will be sent to the student.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            color={dialog.status === 'Approved' ? 'success' : 'error'}
            onClick={handleStatusUpdate}
          >
            Yes, {dialog.status}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
