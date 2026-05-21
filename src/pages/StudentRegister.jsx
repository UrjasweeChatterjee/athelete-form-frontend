// ─────────────────────────────────────────────────────────────
// pages/StudentRegister.jsx  –  6-step Athlete Registration Form
// Uses MUI Stepper, TextField, Select, Checkbox, etc.
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  Container, Box, Paper, Typography, Button, Stepper, Step, StepLabel,
  TextField, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Checkbox, FormControlLabel, FormGroup,
  Alert, CircularProgress, Grid, Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Available sports list ─────────────────────────────────────
const SPORTS_LIST = [
  'Cricket','Football','Badminton','Athletics',
  'Swimming','Basketball','Volleyball','Table Tennis',
];

// ── Form steps ────────────────────────────────────────────────
const STEPS = [
  'Personal Details',
  'Guardian Details',
  'Address Details',
  'Club / State Details',
  'Sports / Competition',
  'Document Uploads',
];

// ── Helper: auto-calculate age from date of birth ─────────────
const calcAge = (dob) => {
  if (!dob) return '';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : '';
};

// ── Initial form state ────────────────────────────────────────
const INITIAL_FORM = {
  // Step 1
  full_name: '', dob: '', age: '', gender: '', mobile: '', email: '', password: '',
  // Step 2
  guardian_name: '', guardian_mobile: '', relation: '',
  // Step 3
  address: '', city: '', state: '', pincode: '',
  // Step 4
  club_name: '', state_association: '',
  // Step 5
  sports_applied: [], competition_name: '', age_group: '',
  // Step 6
  photo: null, birth_certificate: null, id_proof: null,
};

export default function StudentRegister() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep]   = useState(0);
  const [form, setForm]               = useState(INITIAL_FORM);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState('');

  // ── Field change handler ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate age when DOB changes
      if (name === 'dob') updated.age = calcAge(value);
      return updated;
    });
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Sports checkbox handler ───────────────────────────────
  const handleSportToggle = (sport) => {
    setForm(prev => {
      const exists = prev.sports_applied.includes(sport);
      const updated = exists
        ? prev.sports_applied.filter(s => s !== sport)
        : [...prev.sports_applied, sport];
      return { ...prev, sports_applied: updated };
    });
    if (errors.sports_applied) setErrors(prev => ({ ...prev, sports_applied: '' }));
  };

  // ── File change handler ───────────────────────────────────
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ── Validate current step ─────────────────────────────────
  const validateStep = () => {
    const errs = {};

    if (activeStep === 0) {
      if (!form.full_name.trim())  errs.full_name = 'Full name is required.';
      if (!form.dob)               errs.dob       = 'Date of birth is required.';
      if (!form.gender)            errs.gender    = 'Gender is required.';
      if (!/^\d{10}$/.test(form.mobile)) errs.mobile = 'Mobile must be exactly 10 digits.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
      if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    }

    if (activeStep === 1) {
      if (!form.guardian_name.trim()) errs.guardian_name   = 'Guardian name is required.';
      if (!/^\d{10}$/.test(form.guardian_mobile)) errs.guardian_mobile = 'Guardian mobile must be 10 digits.';
      if (!form.relation)             errs.relation         = 'Relation is required.';
    }

    if (activeStep === 2) {
      if (!form.address.trim()) errs.address = 'Address is required.';
      if (!form.city.trim())    errs.city    = 'City is required.';
      if (!form.state.trim())   errs.state   = 'State is required.';
      if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Pincode must be exactly 6 digits.';
    }

    if (activeStep === 4) {
      if (form.sports_applied.length === 0) errs.sports_applied = 'Please select at least one sport.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Step navigation ───────────────────────────────────────
  const handleNext = () => {
    if (validateStep()) setActiveStep(prev => prev + 1);
  };
  const handleBack = () => setActiveStep(prev => prev - 1);

  // ── Final form submit ─────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setApiError('');
    try {
      const formData = new FormData();

      // Append all text fields
      const textFields = [
        'full_name','dob','age','gender','mobile','email','password',
        'guardian_name','guardian_mobile','relation',
        'address','city','state','pincode',
        'club_name','state_association','competition_name','age_group',
      ];
      textFields.forEach(f => formData.append(f, form[f] || ''));

      // Sports applied as JSON string
      formData.append('sports_applied', JSON.stringify(form.sports_applied));

      // File uploads
      if (form.photo)             formData.append('photo',             form.photo);
      if (form.birth_certificate) formData.append('birth_certificate', form.birth_certificate);
      if (form.id_proof)          formData.append('id_proof',          form.id_proof);

      await axios.post('/api/students/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render each step ──────────────────────────────────────
  const renderStep = () => {
    switch (activeStep) {

      // ── Step 1: Personal Details ───────────────────────────
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" name="full_name"
                value={form.full_name} onChange={handleChange}
                error={!!errors.full_name} helperText={errors.full_name} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Date of Birth" name="dob" type="date"
                value={form.dob} onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.dob} helperText={errors.dob} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Age (auto-calculated)" name="age"
                value={form.age} InputProps={{ readOnly: true }}
                helperText="Calculated from Date of Birth" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender} required>
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
              <TextField fullWidth label="Mobile Number" name="mobile"
                value={form.mobile} onChange={handleChange}
                inputProps={{ maxLength: 10 }}
                error={!!errors.mobile} helperText={errors.mobile} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Address" name="email" type="email"
                value={form.email} onChange={handleChange}
                error={!!errors.email} helperText={errors.email} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Password" name="password" type="password"
                value={form.password} onChange={handleChange}
                error={!!errors.password} helperText={errors.password} required />
            </Grid>
          </Grid>
        );

      // ── Step 2: Guardian Details ───────────────────────────
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Guardian Name" name="guardian_name"
                value={form.guardian_name} onChange={handleChange}
                error={!!errors.guardian_name} helperText={errors.guardian_name} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Guardian Mobile" name="guardian_mobile"
                value={form.guardian_mobile} onChange={handleChange}
                inputProps={{ maxLength: 10 }}
                error={!!errors.guardian_mobile} helperText={errors.guardian_mobile} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.relation} required>
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

      // ── Step 3: Address Details ────────────────────────────
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" multiline rows={2}
                value={form.address} onChange={handleChange}
                error={!!errors.address} helperText={errors.address} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" name="city"
                value={form.city} onChange={handleChange}
                error={!!errors.city} helperText={errors.city} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="State" name="state"
                value={form.state} onChange={handleChange}
                error={!!errors.state} helperText={errors.state} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Pincode" name="pincode"
                value={form.pincode} onChange={handleChange}
                inputProps={{ maxLength: 6 }}
                error={!!errors.pincode} helperText={errors.pincode} required />
            </Grid>
          </Grid>
        );

      // ── Step 4: Club / State Details ──────────────────────
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Club Name (optional)" name="club_name"
                value={form.club_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="State Association (optional)" name="state_association"
                value={form.state_association} onChange={handleChange} />
            </Grid>
          </Grid>
        );

      // ── Step 5: Sports / Competition Details ───────────────
      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                Sports Applying For *
              </Typography>
              <FormGroup row>
                {SPORTS_LIST.map(sport => (
                  <FormControlLabel key={sport}
                    control={
                      <Checkbox
                        checked={form.sports_applied.includes(sport)}
                        onChange={() => handleSportToggle(sport)}
                        size="small"
                      />
                    }
                    label={sport}
                    sx={{ width: '180px' }}
                  />
                ))}
              </FormGroup>
              {errors.sports_applied && (
                <Typography color="error" variant="caption">{errors.sports_applied}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Competition Name (optional)" name="competition_name"
                value={form.competition_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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

      // ── Step 6: Document Uploads ───────────────────────────
      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 1 }}>
                Accepted formats: JPG, PNG, PDF. Images will be compressed to under 1 MB. PDFs max 2 MB.
              </Alert>
            </Grid>
            {[
              { name: 'photo',             label: 'Athlete Photo (JPG/PNG)',   accept: 'image/jpeg,image/png' },
              { name: 'birth_certificate', label: 'Birth Certificate (JPG/PNG/PDF)', accept: 'image/jpeg,image/png,application/pdf' },
              { name: 'id_proof',          label: 'ID Proof (JPG/PNG/PDF)',    accept: 'image/jpeg,image/png,application/pdf' },
            ].map(({ name, label, accept }) => (
              <Grid item xs={12} key={name}>
                <Box sx={{
                  border: '1.5px dashed',
                  borderColor: errors[name] ? 'error.main' : 'primary.light',
                  borderRadius: 2, p: 2,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  <Button variant="outlined" component="label" size="small">
                    Choose File
                    <input type="file" name={name} accept={accept} hidden onChange={handleFileChange} />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {form[name] ? form[name].name : label}
                  </Typography>
                </Box>
                {errors[name] && (
                  <Typography color="error" variant="caption">{errors[name]}</Typography>
                )}
              </Grid>
            ))}
          </Grid>
        );

      default: return null;
    }
  };

  // ── Main render ───────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 5 }}>
      <Container maxWidth="md">

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary" className="fade-in" gutterBottom>
            🏅 Athlete Registration Form
          </Typography>
          <Typography variant="subtitle1" className="slide-up">
            Register to join our Sports Club — Phase 1 Enrollment
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, border: '1px solid #e0e6ed', borderRadius: 3 }}>

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          {/* Step content */}
          <Box sx={{ minHeight: 200 }}>
            {renderStep()}
          </Box>

          {/* API error */}
          {apiError && (
            <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>
          )}

          {/* Navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>

            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircularProgress size={16} color="inherit" />}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            )}
          </Box>

          {/* Login link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already registered?{' '}
              <Link to="/student/login" style={{ color: '#0d47a1', fontWeight: 500 }}>
                Student Login
              </Link>
            </Typography>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}
