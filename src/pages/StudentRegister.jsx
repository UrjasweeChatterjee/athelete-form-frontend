// ─────────────────────────────────────────────────────────────
// pages/StudentRegister.jsx  –  6-step Athlete Registration
// Revamped: sport cards, premium stepper, dark/light support
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, TextField,
  Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Alert, CircularProgress, Grid,
  useTheme, alpha, Chip, LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

// ── Sport icons mapping ───────────────────────────────────────
const SPORTS_LIST = [
  { name: 'Cricket',      emoji: '🏏', color: '#E17055' },
  { name: 'Football',     emoji: '⚽', color: '#6C5CE7' },
  { name: 'Badminton',    emoji: '🏸', color: '#00CEC9' },
  { name: 'Athletics',    emoji: '🏃', color: '#FDCB6E' },
  { name: 'Swimming',     emoji: '🏊', color: '#0984E3' },
  { name: 'Basketball',   emoji: '🏀', color: '#E17055' },
  { name: 'Volleyball',   emoji: '🏐', color: '#A29BFE' },
  { name: 'Table Tennis', emoji: '🏓', color: '#00B894' },
];

const STEPS = [
  { label: 'Personal',   emoji: '👤' },
  { label: 'Guardian',   emoji: '👨‍👩‍👦' },
  { label: 'Address',    emoji: '📍' },
  { label: 'Club',       emoji: '🏆' },
  { label: 'Sports',     emoji: '⚽' },
  { label: 'Documents',  emoji: '📄' },
];

const calcAge = (dob) => {
  if (!dob) return '';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : '';
};

const INITIAL_FORM = {
  full_name: '', dob: '', age: '', gender: '', mobile: '', email: '', password: '',
  guardian_name: '', guardian_mobile: '', relation: '',
  address: '', city: '', state: '', pincode: '',
  club_name: '', state_association: '',
  sports_applied: [], competition_name: '', age_group: '',
  photo: null, birth_certificate: null, id_proof: null,
};

export default function StudentRegister() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm]             = useState(INITIAL_FORM);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState('');

  const progress = ((activeStep) / (STEPS.length - 1)) * 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob') updated.age = calcAge(value);
      return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSportToggle = (sport) => {
    setForm(prev => {
      const exists = prev.sports_applied.includes(sport);
      return {
        ...prev,
        sports_applied: exists
          ? prev.sports_applied.filter(s => s !== sport)
          : [...prev.sports_applied, sport],
      };
    });
    if (errors.sports_applied) setErrors(prev => ({ ...prev, sports_applied: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = () => {
    const errs = {};
    if (activeStep === 0) {
      if (!form.full_name.trim()) errs.full_name = 'Full name is required.';
      if (!form.dob) errs.dob = 'Date of birth is required.';
      if (!form.gender) errs.gender = 'Gender is required.';
      if (!/^\d{10}$/.test(form.mobile)) errs.mobile = 'Mobile must be exactly 10 digits.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
      if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    }
    if (activeStep === 1) {
      if (!form.guardian_name.trim()) errs.guardian_name = 'Guardian name is required.';
      if (!/^\d{10}$/.test(form.guardian_mobile)) errs.guardian_mobile = 'Guardian mobile must be 10 digits.';
      if (!form.relation) errs.relation = 'Relation is required.';
    }
    if (activeStep === 2) {
      if (!form.address.trim()) errs.address = 'Address is required.';
      if (!form.city.trim()) errs.city = 'City is required.';
      if (!form.state.trim()) errs.state = 'State is required.';
      if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Pincode must be exactly 6 digits.';
    }
    if (activeStep === 4) {
      if (form.sports_applied.length === 0) errs.sports_applied = 'Please select at least one sport.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setActiveStep(p => p + 1); };
  const handleBack = () => setActiveStep(p => p - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setApiError('');
    try {
      const formData = new FormData();
      ['full_name','dob','age','gender','mobile','email','password',
       'guardian_name','guardian_mobile','relation',
       'address','city','state','pincode',
       'club_name','state_association','competition_name','age_group',
      ].forEach(f => formData.append(f, form[f] || ''));
      formData.append('sports_applied', JSON.stringify(form.sports_applied));
      if (form.photo)             formData.append('photo',             form.photo);
      if (form.birth_certificate) formData.append('birth_certificate', form.birth_certificate);
      if (form.id_proof)          formData.append('id_proof',          form.id_proof);

      await axios.post('/api/students/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/success');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step field style helper ───────────────────────────────
  const fieldSx = { mb: 2 };

  // ── Render step content ───────────────────────────────────
  const renderStep = () => {
    switch (activeStep) {

      case 0: return (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Full Name" name="full_name" sx={fieldSx}
              value={form.full_name} onChange={handleChange}
              error={!!errors.full_name} helperText={errors.full_name} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Date of Birth" name="dob" type="date" sx={fieldSx}
              value={form.dob} onChange={handleChange} InputLabelProps={{ shrink: true }}
              error={!!errors.dob} helperText={errors.dob} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Age (auto-calculated)" name="age" sx={fieldSx}
              value={form.age} InputProps={{ readOnly: true }}
              helperText="Calculated from Date of Birth" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.gender} required sx={fieldSx}>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={form.gender} onChange={handleChange} label="Gender">
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Mobile Number" name="mobile" sx={fieldSx}
              value={form.mobile} onChange={handleChange} inputProps={{ maxLength: 10 }}
              error={!!errors.mobile} helperText={errors.mobile} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email Address" name="email" type="email" sx={fieldSx}
              value={form.email} onChange={handleChange}
              error={!!errors.email} helperText={errors.email} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Password" name="password" type="password" sx={fieldSx}
              value={form.password} onChange={handleChange}
              error={!!errors.password} helperText={errors.password} required />
          </Grid>
        </Grid>
      );

      case 1: return (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Guardian Name" name="guardian_name" sx={fieldSx}
              value={form.guardian_name} onChange={handleChange}
              error={!!errors.guardian_name} helperText={errors.guardian_name} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Guardian Mobile" name="guardian_mobile" sx={fieldSx}
              value={form.guardian_mobile} onChange={handleChange} inputProps={{ maxLength: 10 }}
              error={!!errors.guardian_mobile} helperText={errors.guardian_mobile} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.relation} required sx={fieldSx}>
              <InputLabel>Relation</InputLabel>
              <Select name="relation" value={form.relation} onChange={handleChange} label="Relation">
                <MenuItem value="Father">Father</MenuItem>
                <MenuItem value="Mother">Mother</MenuItem>
                <MenuItem value="Guardian">Guardian</MenuItem>
                <MenuItem value="Sibling">Sibling</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.relation && <FormHelperText>{errors.relation}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>
      );

      case 2: return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Address" name="address" multiline rows={2} sx={fieldSx}
              value={form.address} onChange={handleChange}
              error={!!errors.address} helperText={errors.address} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="City" name="city" sx={fieldSx}
              value={form.city} onChange={handleChange}
              error={!!errors.city} helperText={errors.city} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="State" name="state" sx={fieldSx}
              value={form.state} onChange={handleChange}
              error={!!errors.state} helperText={errors.state} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Pincode" name="pincode" sx={fieldSx}
              value={form.pincode} onChange={handleChange} inputProps={{ maxLength: 6 }}
              error={!!errors.pincode} helperText={errors.pincode} required />
          </Grid>
        </Grid>
      );

      case 3: return (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Club Name (optional)" name="club_name" sx={fieldSx}
              value={form.club_name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="State Association (optional)" name="state_association" sx={fieldSx}
              value={form.state_association} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Competition Name (optional)" name="competition_name" sx={fieldSx}
              value={form.competition_name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Age Group (optional)</InputLabel>
              <Select name="age_group" value={form.age_group} onChange={handleChange} label="Age Group (optional)">
                <MenuItem value="Under-14">Under-14</MenuItem>
                <MenuItem value="Under-17">Under-17</MenuItem>
                <MenuItem value="Under-19">Under-19</MenuItem>
                <MenuItem value="Under-23">Under-23</MenuItem>
                <MenuItem value="Senior">Senior</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      );

      case 4: return (
        <Box>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Select the sports you are applying for. You can choose multiple.
          </Typography>
          {errors.sports_applied && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{errors.sports_applied}</Alert>
          )}
          <Grid container spacing={2}>
            {SPORTS_LIST.map((sport) => {
              const selected = form.sports_applied.includes(sport.name);
              return (
                <Grid item xs={6} sm={4} md={3} key={sport.name}>
                  <Box
                    onClick={() => handleSportToggle(sport.name)}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `2px solid`,
                      borderColor: selected ? sport.color : alpha(theme.palette.divider, 0.8),
                      bgcolor: selected
                        ? alpha(sport.color, isDark ? 0.2 : 0.1)
                        : isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: sport.color,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 24px ${alpha(sport.color, 0.25)}`,
                      },
                    }}
                  >
                    {selected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: sport.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: '#fff',
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </Box>
                    )}
                    <Typography sx={{ fontSize: 32, mb: 1 }}>{sport.emoji}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: selected ? sport.color : 'text.secondary',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                    >
                      {sport.name}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          {form.sports_applied.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1, alignSelf: 'center' }}>
                Selected:
              </Typography>
              {form.sports_applied.map(s => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onDelete={() => handleSportToggle(s)}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', fontWeight: 600 }}
                />
              ))}
            </Box>
          )}
        </Box>
      );

      case 5: return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ borderRadius: 2, mb: 1 }}>
              Accepted: JPG, PNG, PDF. Images compressed to under 1 MB. PDFs max 2 MB.
            </Alert>
          </Grid>
          {[
            { name: 'photo',             label: 'Athlete Photo',           emoji: '🤳', accept: 'image/jpeg,image/png' },
            { name: 'birth_certificate', label: 'Birth Certificate',       emoji: '📜', accept: 'image/jpeg,image/png,application/pdf' },
            { name: 'id_proof',          label: 'ID Proof',                emoji: '🪪', accept: 'image/jpeg,image/png,application/pdf' },
          ].map(({ name, label, emoji, accept }) => (
            <Grid item xs={12} sm={4} key={name}>
              <Box
                component="label"
                htmlFor={`file-${name}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  p: 3,
                  borderRadius: 3,
                  border: `2px dashed`,
                  borderColor: form[name]
                    ? theme.palette.success.main
                    : errors[name]
                    ? theme.palette.error.main
                    : alpha(theme.palette.primary.main, 0.4),
                  bgcolor: form[name]
                    ? alpha(theme.palette.success.main, 0.06)
                    : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <input
                  id={`file-${name}`}
                  type="file"
                  name={name}
                  accept={accept}
                  hidden
                  onChange={handleFileChange}
                />
                <Typography sx={{ fontSize: 36 }}>{form[name] ? '✅' : emoji}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center' }}>
                  {label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.7rem' }}>
                  {form[name] ? form[name].name : 'Click to upload'}
                </Typography>
              </Box>
              {errors[name] && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  {errors[name]}
                </Typography>
              )}
            </Grid>
          ))}
        </Grid>
      );

      default: return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar title="🏅 Athlete Registration" />

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.15),
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        }}
      />

      <Container maxWidth="md" sx={{ py: 5 }}>

        {/* Custom step indicator */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', mb: 2 }}>
            {/* connector line */}
            <Box sx={{
              position: 'absolute',
              top: '20px',
              left: '8%',
              right: '8%',
              height: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              zIndex: 0,
            }} />
            <Box sx={{
              position: 'absolute',
              top: '20px',
              left: '8%',
              width: `${(activeStep / (STEPS.length - 1)) * 84}%`,
              height: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              zIndex: 0,
              transition: 'width 0.5s ease',
            }} />

            {STEPS.map((step, idx) => {
              const done = idx < activeStep;
              const active = idx === activeStep;
              return (
                <Box key={step.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: active ? 20 : done ? 14 : 18,
                    transition: 'all 0.3s ease',
                    bgcolor: done
                      ? theme.palette.success.main
                      : active
                      ? theme.palette.primary.main
                      : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                    boxShadow: active ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.25)}` : 'none',
                    color: done ? '#fff' : active ? '#fff' : 'text.secondary',
                    fontWeight: 700,
                  }}>
                    {done ? '✓' : step.emoji}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.75,
                      fontWeight: active ? 700 : 500,
                      color: active ? 'primary.main' : done ? 'success.main' : 'text.secondary',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Form card */}
        <Box
          sx={{
            bgcolor: isDark ? alpha('#1A1A2E', 0.9) : '#fff',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            boxShadow: isDark
              ? '0 24px 64px rgba(0,0,0,0.4)'
              : '0 8px 40px rgba(108,92,231,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Step header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {STEPS[activeStep].emoji} {STEPS[activeStep].label} Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Step {activeStep + 1} of {STEPS.length}
            </Typography>
          </Box>

          {/* Step content */}
          <Box sx={{ minHeight: 200 }}>
            {renderStep()}
          </Box>

          {/* API error */}
          {apiError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{apiError}</Alert>
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                borderColor: theme.palette.divider,
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              ← Back
            </Button>

            {activeStep < STEPS.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                  '&:hover': { boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.45)}` },
                }}
              >
                Continue →
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircularProgress size={16} color="inherit" />}
                sx={{
                  background: loading ? undefined : `linear-gradient(135deg, ${theme.palette.success.main}, #00b09b)`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.35)}`,
                }}
              >
                {loading ? 'Submitting...' : '🎉 Submit Registration'}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
