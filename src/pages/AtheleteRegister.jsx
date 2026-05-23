import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, FormHelperText, Alert, CircularProgress,
  Grid, useTheme, alpha, Chip, IconButton } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const SPORTS = ['Cricket','Football','Badminton','Athletics','Swimming','Basketball','Volleyball','Table Tennis'];
const SPORT_EMOJI = { Cricket:'🏏',Football:'⚽',Badminton:'🏸',Athletics:'🏃',Swimming:'🏊',Basketball:'🏀',Volleyball:'🏐','Table Tennis':'🏓' };
const STEPS = ['Personal','Guardian','Address','Club','Sports','Documents'];
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

const calcAge = (dob) => {
  if (!dob) return '';
  const t = new Date(), b = new Date(dob);
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a >= 0 ? a : '';
};

const INIT = {
  full_name:'',dob:'',age:'',gender:'',mobile:'',email:'',password:'',
  guardian_name:'',guardian_mobile:'',relation:'',
  address:'',city:'',state:'',pincode:'',
  club_name:'',state_association:'',sports_applied:[],competition_name:'',age_group:'',
  photo:null,birth_certificate:null,id_proof:null,
  height_cm:'',weight_kg:'',
};

// Styled input for Stitch dark look
const inputSx = (isDark) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    fontFamily:"'Google Sans','Inter',sans-serif",
    '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' },
    '&:hover fieldset': { borderColor: isDark ? '#06b6d4' : '#004e5c' },
    '&.Mui-focused fieldset': { borderColor: isDark ? '#06b6d4' : '#004e5c', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { fontFamily:"'Google Sans','Inter',sans-serif" },
  '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#06b6d4' : '#004e5c' },
  mb: 0,
});

// Defined OUTSIDE the component to prevent React from treating it as
// a new component type on every render (which causes focus loss).
function RegField({ name, label, type='text', half=false, readOnly=false, rows, max, form, onChange, errors, isDark, ...rest }) {
  return (
    <Grid item xs={12} sm={half ? 6 : 12}>
      <TextField fullWidth label={label} name={name} type={type} value={form[name]||''}
        onChange={onChange} error={!!errors[name]} helperText={errors[name]}
        multiline={!!rows} rows={rows}
        InputProps={{ readOnly, ...(max ? { inputProps:{ maxLength:max } } : {}) }}
        InputLabelProps={type==='date'?{shrink:true}:undefined}
        sx={inputSx(isDark)} {...rest} />
    </Grid>
  );
}

export default function AtheleteRegister() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const CYAN  = isDark ? '#06b6d4' : '#004e5c';
  const LIME  = isDark ? '#d4ff00' : '#536600';
  const bg    = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg= isDark ? 'rgba(17,24,39,0.82)' : 'rgba(255,255,255,0.95)';
  const brd   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const tPri  = isDark ? '#e2e4cf' : '#1F313E';
  const tSec  = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  const height = parseFloat(form.height_cm);
  const weight = parseFloat(form.weight_kg);
  let liveBmi = null;
  let liveBmiCategory = '';

  if (!isNaN(height) && height > 0 && !isNaN(weight) && weight > 0) {
    const bmiVal = weight / ((height / 100) * (height / 100));
    liveBmi = bmiVal.toFixed(2);

    const b = parseFloat(liveBmi);
    if (b < 18.5) liveBmiCategory = 'Underweight';
    else if (b >= 18.5 && b <= 24.9) liveBmiCategory = 'Normal';
    else if (b >= 25 && b <= 29.9) liveBmiCategory = 'Overweight';
    else if (b >= 30) liveBmiCategory = 'Obese';
  }

  const change = (e) => {
    const { name, value } = e.target;
    if ((name === 'height_cm' || name === 'weight_kg') && value !== '') {
      const val = parseFloat(value);
      if (val < 0) {
        setErrors(p => ({ ...p, [name]: 'Negative values are not allowed.' }));
      } else {
        setErrors(p => ({ ...p, [name]: '' }));
      }
    }
    setForm(p => ({ ...p, [name]: value, ...(name==='dob' ? { age: calcAge(value) } : {}) }));
    if (name !== 'height_cm' && name !== 'weight_kg' && errors[name]) {
      setErrors(p => ({ ...p, [name]: '' }));
    }
    setApiError('');
  };
  const toggleSport = (s) => {
    setForm(p => ({ ...p, sports_applied: p.sports_applied.includes(s) ? p.sports_applied.filter(x=>x!==s) : [...p.sports_applied,s] }));
    if (errors.sports_applied) setErrors(p=>({...p,sports_applied:''}));
  };
  const fileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) { setForm(p=>({...p,[name]:files[0]})); if(errors[name]) setErrors(p=>({...p,[name]:''})); }
  };

  const validate = () => {
    const e = {};
    if (step===0) {
      if (!form.full_name.trim()) e.full_name='Full name is required.';
      if (!form.dob) e.dob='Date of birth is required.';
      if (!form.gender) e.gender='Gender is required.';
      if (!/^\d{10}$/.test(form.mobile)) e.mobile='10-digit mobile required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Valid email required.';
      if (!form.password||form.password.length<6) e.password='Min 6 characters.';

      if (form.height_cm !== '') {
        const hVal = parseFloat(form.height_cm);
        if (isNaN(hVal) || hVal <= 0) {
          e.height_cm = 'Height must be a positive number.';
        }
      }
      if (form.weight_kg !== '') {
        const wVal = parseFloat(form.weight_kg);
        if (isNaN(wVal) || wVal <= 0) {
          e.weight_kg = 'Weight must be a positive number.';
        }
      }
    }
    if (step===1) {
      if (!form.guardian_name.trim()) e.guardian_name='Guardian name required.';
      if (!/^\d{10}$/.test(form.guardian_mobile)) e.guardian_mobile='10-digit mobile required.';
      if (!form.relation) e.relation='Relation required.';
    }
    if (step===2) {
      if (!form.address.trim()) e.address='Address required.';
      if (!form.city.trim()) e.city='City required.';
      if (!form.state.trim()) e.state='State required.';
      if (!/^\d{6}$/.test(form.pincode)) e.pincode='6-digit pincode required.';
    }
    if (step===4 && form.sports_applied.length===0) e.sports_applied='Select at least one sport.';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const next = () => { if (validate()) setStep(p=>p+1); };
  const back = () => {
    setApiError('');
    setStep(p => p - 1);
  };

  const submit = async () => {
    setLoading(true); setApiError('');
    try {
      const fd = new FormData();
      ['full_name','dob','age','gender','mobile','email','password','guardian_name','guardian_mobile','relation',
       'address','city','state','pincode','club_name','state_association','competition_name','age_group',
       'height_cm','weight_kg']
        .forEach(f => fd.append(f, form[f]||''));
      fd.append('sports_applied', JSON.stringify(form.sports_applied));
      if (form.photo) fd.append('photo', form.photo);
      if (form.birth_certificate) fd.append('birth_certificate', form.birth_certificate);
      if (form.id_proof) fd.append('id_proof', form.id_proof);
      await axios.post('/api/students/register', fd, { headers:{'Content-Type':'multipart/form-data'} });
      navigate('/success');
    } catch(err) {
      setApiError(err.response?.data?.message||'Registration failed. Try again.');
    } finally { setLoading(false); }
  };



  const stepContent = [
    // Step 0 – Personal
    <Grid container spacing={2.5} key="s0">
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="full_name" label="Full Name" half />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="dob" label="Date of Birth" type="date" half />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="age" label="Age (auto-calculated)" half readOnly />
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.gender} sx={inputSx(isDark)}>
          <InputLabel>Gender</InputLabel>
          <Select name="gender" value={form.gender} onChange={change} label="Gender">
            {['Male','Female','Other'].map(g=><MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        </FormControl>
      </Grid>
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="mobile" label="Mobile Number" half max={10} />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="email" label="Email Address" type="email" half />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="password" label="Password" type="password" />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="height_cm" label="Height (cm)" type="number" half />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="weight_kg" label="Weight (kg)" type="number" half />
      {liveBmi && (
        <Grid item xs={12}>
          <Box sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(0, 78, 92, 0.04)',
            border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(0, 78, 92, 0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            transition: 'all 0.3s ease',
          }}>
            <Box>
              <Typography variant="caption" sx={{ color: tSec, display: 'block', mb: 0.5, fontFamily: "'Google Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500 }}>
                Live Calculated BMI
              </Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: CYAN, lineHeight: 1, fontFamily: "'Google Sans', sans-serif" }}>
                {liveBmi}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: tSec, display: 'block', mb: 0.5, fontFamily: "'Google Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500 }}>
                Category
              </Typography>
              <Chip
                label={liveBmiCategory}
                size="small"
                sx={{
                  fontFamily: "'Google Sans', sans-serif",
                  fontWeight: 700,
                  bgcolor:
                    liveBmiCategory === 'Normal' ? (isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.1)') :
                    liveBmiCategory === 'Underweight' ? (isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)') :
                    (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
                  color:
                    liveBmiCategory === 'Normal' ? '#34D399' :
                    liveBmiCategory === 'Underweight' ? '#FBBF24' : '#EF4444',
                  border: `1px solid ${
                    liveBmiCategory === 'Normal' ? 'rgba(52, 211, 153, 0.3)' :
                    liveBmiCategory === 'Underweight' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                  }`
                }}
              />
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>,

    // Step 1 – Guardian
    <Grid container spacing={2.5} key="s1">
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="guardian_name" label="Guardian Name" half />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="guardian_mobile" label="Guardian Mobile" half max={10} />
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.relation} sx={inputSx(isDark)}>
          <InputLabel>Relation</InputLabel>
          <Select name="relation" value={form.relation} onChange={change} label="Relation">
            {['Father','Mother','Guardian','Sibling','Other'].map(r=><MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
          {errors.relation && <FormHelperText>{errors.relation}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>,

    // Step 2 – Address
    <Grid container spacing={2.5} key="s2">
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="address" label="Address" rows={2} />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="city" label="City" half />
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.state} sx={inputSx(isDark)}>
          <InputLabel>State</InputLabel>
          <Select name="state" value={form.state || ''} onChange={change} label="State">
            <MenuItem value="" disabled>Select State</MenuItem>
            {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
        </FormControl>
      </Grid>
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="pincode" label="Pincode" half max={6} />
    </Grid>,

    // Step 3 – Club
    <Grid container spacing={2.5} key="s3">
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="club_name" label="Club Name (optional)" half />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="state_association" label="State Association (optional)" half />
      <RegField form={form} onChange={change} errors={errors} isDark={isDark} name="competition_name" label="Competition Name (optional)" half />
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth sx={inputSx(isDark)}>
          <InputLabel>Age Group (optional)</InputLabel>
          <Select name="age_group" value={form.age_group} onChange={change} label="Age Group (optional)">
            {['Under-14','Under-17','Under-19','Under-23','Senior'].map(a=><MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
    </Grid>,

    // Step 4 – Sports
    <Box key="s4">
      <Typography variant="body2" sx={{ mb:2.5, color:tSec, fontFamily:"'Google Sans',sans-serif" }}>
        Select all sports you are applying for:
      </Typography>
      {errors.sports_applied && <Alert severity="error" sx={{ mb:2, borderRadius:'12px' }}>{errors.sports_applied}</Alert>}
      <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.5 }}>
        {SPORTS.map(s => {
          const sel = form.sports_applied.includes(s);
          return (
            <Button key={s} onClick={()=>toggleSport(s)} sx={{
              borderRadius:'9999px', px:2.5, py:1,
              fontFamily:"'Google Sans',sans-serif", fontWeight:600, fontSize:'0.85rem',
              border:`1.5px solid ${sel ? CYAN : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)')}`,
              bgcolor: sel ? (isDark ? 'rgba(6,182,212,0.15)' : 'rgba(0,78,92,0.1)') : 'transparent',
              color: sel ? CYAN : tSec,
              transition:'all 0.2s ease',
              '&:hover':{ borderColor: CYAN, color: CYAN, bgcolor: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(0,78,92,0.06)' },
            }}>
              {SPORT_EMOJI[s]} {s}
            </Button>
          );
        })}
      </Box>
      {form.sports_applied.length > 0 && (
        <Box sx={{ mt:2.5, display:'flex', flexWrap:'wrap', gap:1, alignItems:'center' }}>
          <Typography variant="caption" sx={{ color:tSec, fontFamily:"'Google Sans',sans-serif" }}>Selected:</Typography>
          {form.sports_applied.map(s=>(
            <Chip key={s} label={`${SPORT_EMOJI[s]} ${s}`} size="small" onDelete={()=>toggleSport(s)}
              sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:600, borderRadius:'9999px',
                bgcolor: isDark ? 'rgba(6,182,212,0.12)' : 'rgba(0,78,92,0.08)',
                color: CYAN, border:`1px solid ${isDark ? 'rgba(6,182,212,0.3)' : 'rgba(0,78,92,0.25)'}` }} />
          ))}
        </Box>
      )}
    </Box>,

    // Step 5 – Documents
    <Box key="s5">
      <Alert severity="info" sx={{ mb:2.5, borderRadius:'12px' }}>Accepted: JPG, PNG, PDF. Max 2 MB each.</Alert>
      <Grid container spacing={2.5}>
        {[
          { name:'photo', label:'Athlete Photo', emoji:'🤳', accept:'image/jpeg,image/png' },
          { name:'birth_certificate', label:'Birth Certificate', emoji:'📜', accept:'image/jpeg,image/png,application/pdf' },
          { name:'id_proof', label:'ID Proof', emoji:'🪪', accept:'image/jpeg,image/png,application/pdf' },
        ].map(({ name, label, emoji, accept }) => (
          <Grid item xs={12} sm={4} key={name}>
            <Box component="label" htmlFor={`file-${name}`} sx={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:1.5, p:3, borderRadius:'16px', border:'2px dashed',
              borderColor: form[name] ? '#34D399' : errors[name] ? '#ffb4ab' : (isDark ? 'rgba(6,182,212,0.35)' : 'rgba(0,78,92,0.3)'),
              bgcolor: form[name] ? 'rgba(52,211,153,0.06)' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
              cursor:'pointer', transition:'all 0.25s ease',
              position: 'relative',
              '&:hover':{ borderColor: CYAN, bgcolor: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(0,78,92,0.05)', transform:'translateY(-2px)' },
            }}>
              <input id={`file-${name}`} type="file" name={name} accept={accept} hidden onChange={fileChange} />
              {form[name] && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setForm(p => ({ ...p, [name]: null }));
                    const inputEl = document.getElementById(`file-${name}`);
                    if (inputEl) inputEl.value = '';
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    '&:hover': {
                      bgcolor: '#EF4444',
                      color: '#ffffff',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
                    },
                    zIndex: 2,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
              <Typography sx={{ fontSize:36 }}>{form[name] ? '✅' : emoji}</Typography>
              <Typography variant="caption" sx={{ fontWeight:600, color:tPri, textAlign:'center', fontFamily:"'Google Sans',sans-serif" }}>{label}</Typography>
              <Typography variant="caption" sx={{ color:tSec, textAlign:'center', fontSize:'0.7rem', fontFamily:"'Google Sans',sans-serif" }}>
                {form[name] ? form[name].name : 'Click to upload'}
              </Typography>
            </Box>
            {errors[name] && <Typography color="error" variant="caption" sx={{ mt:0.5, display:'block' }}>{errors[name]}</Typography>}
          </Grid>
        ))}
      </Grid>
    </Box>,
  ];

  return (
    <Box sx={{ minHeight:'100vh', bgcolor: bg, display:'flex', flexDirection:'column', position:'relative' }}>
      {/* Mesh blobs */}
      {isDark && <>
        <Box sx={{ position:'fixed', top:'-5%', left:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
        <Box sx={{ position:'fixed', bottom:'-5%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      </>}

      {/* Back to Home */}
      <Box sx={{ position:'absolute', top:20, left:24, zIndex:10 }}>
        <Link to="/" style={{ color: isDark ? 'rgba(197,201,172,0.5)' : 'rgba(31,49,62,0.45)', textDecoration:'none', fontSize:'0.82rem', fontFamily:"'Google Sans', sans-serif", fontWeight:500 }}>
          ← Back to Home
        </Link>
      </Box>

      {/* Page header */}
      <Box sx={{ textAlign:'center', pt:{ xs:4, md:6 }, pb:2, position:'relative', zIndex:1 }}>
        <Typography sx={{ fontFamily:"'Google Sans Display','Montserrat',sans-serif", fontWeight:800, fontSize:{ xs:'1.8rem', md:'2.4rem' }, letterSpacing:'-0.02em', color: tPri }}>
          Athlete Registration
        </Typography>
        <Typography variant="body2" sx={{ color: tSec, mt:0.75, fontFamily:"'Google Sans',sans-serif" }}>
          Step {step+1} of {STEPS.length}: {STEPS[step]} Details
        </Typography>
      </Box>

      {/* Step indicator */}
      <Box sx={{ px:{ xs:2, md:0 }, maxWidth:660, mx:'auto', width:'100%', pt:3, pb:1, position:'relative', zIndex:1 }}>
        <Box sx={{ display:'flex', alignItems:'center', position:'relative' }}>
          {/* Full connector */}
          <Box sx={{ position:'absolute', top:'20px', left:'20px', right:'20px', height:2, bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', zIndex:0 }} />
          {/* Progress connector */}
          <Box sx={{ position:'absolute', top:'20px', left:'20px', width:`${(step/(STEPS.length-1))*100}%`, height:2, background:`linear-gradient(90deg, ${CYAN}, ${LIME})`, zIndex:0, transition:'width 0.45s ease', maxWidth:'calc(100% - 40px)' }} />
          {STEPS.map((s, i) => {
            const done = i < step, active = i === step;
            return (
              <Box key={s} sx={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', zIndex:1 }}>
                <Box sx={{
                  width:40, height:40, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:"'Google Sans',sans-serif", fontWeight:800, fontSize:'0.9rem',
                  bgcolor: done ? CYAN : active ? CYAN : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
                  color: done||active ? (isDark ? '#0A0A12' : '#ffffff') : tSec,
                  boxShadow: active ? `0 0 0 4px ${alpha(CYAN, 0.25)}` : 'none',
                  transition:'all 0.3s ease',
                  border: active ? `2px solid ${CYAN}` : 'none',
                }}>
                  {done ? '✓' : i+1}
                </Box>
                <Typography variant="caption" sx={{ mt:0.75, fontFamily:"'Google Sans',sans-serif", fontWeight: active ? 700 : 500, color: active ? CYAN : done ? CYAN : tSec, display:{ xs:'none', sm:'block' } }}>
                  {s}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Form card */}
      <Box sx={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', px:2, pt:3, pb:6, position:'relative', zIndex:1 }}>
        <Box sx={{
          width:'100%', maxWidth:660,
          bgcolor: cardBg, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
          border:`1px solid ${brd}`, borderRadius:'24px',
          backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
          boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)',
          overflow:'hidden',
        }}>
          {/* Cyan top bar */}
          <Box sx={{ height:3, background:`linear-gradient(90deg, ${CYAN}, ${LIME})` }} />

          <Box sx={{ p:{ xs:3, sm:4.5 } }}>
            {/* Step title */}
            <Box sx={{ mb:3.5 }}>
              <Typography sx={{ fontFamily:"'Google Sans Display','Montserrat',sans-serif", fontWeight:800, fontSize:'1.3rem', letterSpacing:'-0.01em', color: tPri }}>
                {STEPS[step]} Details
              </Typography>
            </Box>

            {/* Step content */}
            <Box sx={{ minHeight:200 }}>
              {stepContent[step]}
            </Box>

            {apiError && <Alert severity="error" sx={{ mt:2.5, borderRadius:'12px' }}>{apiError}</Alert>}

            {/* Navigation */}
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:4, gap:2 }}>
              <Button onClick={back} disabled={step===0}
                sx={{ borderRadius:'9999px', fontFamily:"'Google Sans',sans-serif", fontWeight:600, px:3, py:1.2,
                  border:`1px solid ${brd}`, color: tSec, opacity: step===0 ? 0.4 : 1,
                  '&:hover':{ borderColor: CYAN, color: CYAN } }}>
                ← Back
              </Button>

              {step < STEPS.length-1 ? (
                <Button onClick={next} sx={{
                  borderRadius:'9999px', px:4, py:1.2,
                  fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.95rem',
                  background: `linear-gradient(135deg, ${CYAN}, ${LIME})`,
                  color: isDark ? '#0A0A12' : '#ffffff',
                  boxShadow: isDark ? `0 4px 20px ${alpha(CYAN, 0.35)}` : 'none',
                  '&:hover':{ boxShadow: isDark ? `0 6px 28px ${alpha(CYAN, 0.5)}` : 'none', transform:'translateY(-1px)' },
                }}>
                  Next Step →
                </Button>
              ) : (
                <Button onClick={submit} disabled={loading}
                  startIcon={loading && <CircularProgress size={14} sx={{ color: isDark ? '#0A0A12' : '#fff' }} />}
                  sx={{
                    borderRadius:'9999px', px:4, py:1.2,
                    fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.95rem',
                    background: loading ? undefined : `linear-gradient(135deg, #34D399, #06b6d4)`,
                    color: '#0A0A12',
                    boxShadow: isDark ? '0 4px 20px rgba(52,211,153,0.35)' : 'none',
                    '&:hover':{ boxShadow: isDark ? '0 6px 28px rgba(52,211,153,0.5)' : 'none', transform:'translateY(-1px)' },
                    '&:disabled':{ opacity:0.6 },
                  }}>
                  {loading ? 'Submitting…' : '🎉 Submit Registration'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign:'center', pb:3, position:'relative', zIndex:1 }}>
        <Typography variant="caption" sx={{ color: tSec, fontFamily:"'Google Sans',sans-serif" }}>
          Secure Enrollment Portal • Elite Core Sports Management
        </Typography>
      </Box>
    </Box>
  );
}
