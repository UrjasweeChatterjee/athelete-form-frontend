// pages/Success.jsx  –  Stitch Apex Velocity Design
import React from 'react';
import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoginIcon       from '@mui/icons-material/Login';
import PersonAddIcon   from '@mui/icons-material/PersonAdd';

export default function Success() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';

  const LIME    = isDark ? '#d4ff00' : '#536600';
  const CYAN    = isDark ? '#06b6d4' : '#004e5c';
  const bg      = isDark ? '#0A0A12' : '#F0F4F8';
  const cardBg  = isDark ? 'rgba(17,24,39,0.75)' : 'rgba(255,255,255,0.92)';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const textPri = isDark ? '#e2e4cf' : '#1F313E';
  const textSec = isDark ? 'rgba(197,201,172,0.65)' : 'rgba(31,49,62,0.55)';

  return (
    <Box sx={{ minHeight:'100vh', bgcolor: bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', p: 3 }}>

      {/* Mesh blobs */}
      {isDark && <>
        <Box sx={{ position:'fixed', top:'10%', left:'10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,255,0,0.08) 0%, transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
        <Box sx={{ position:'fixed', bottom:'10%', right:'10%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
      </>}

      <Box sx={{
        width:'100%', maxWidth:500, zIndex:1,
        bgcolor: cardBg, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
        border:`1px solid ${border}`, borderRadius:'28px', overflow:'hidden',
        backgroundImage: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 50%)' : 'none',
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)',
        animation:'fadeInUp 0.55s ease both',
        textAlign:'center',
      }}>
        {/* Lime accent top bar */}
        <Box sx={{ height:4, background:`linear-gradient(90deg, ${LIME}, ${CYAN})` }} />

        <Box sx={{ p:{ xs:4, sm:5 } }}>
          {/* Success icon */}
          <Box sx={{
            width:80, height:80, borderRadius:'50%', mx:'auto', mb:3,
            bgcolor: isDark ? 'rgba(212,255,0,0.1)' : 'rgba(83,102,0,0.08)',
            border:`3px solid ${isDark ? 'rgba(212,255,0,0.3)' : 'rgba(83,102,0,0.25)'}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: isDark ? '0 0 32px rgba(212,255,0,0.2)' : 'none',
          }}>
            <CheckCircleIcon sx={{ fontSize:42, color: LIME }} />
          </Box>

          {/* Overline */}
          <Typography sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.65rem', letterSpacing:'0.14em', color: isDark ? '#d4ff00' : '#536600', textTransform:'uppercase', mb:1 }}>
            REGISTRATION COMPLETE
          </Typography>

          {/* Headline */}
          <Typography variant="h4" sx={{
            fontFamily:"'Google Sans Display','Montserrat',sans-serif", fontWeight:800,
            letterSpacing:'-0.02em', color: textPri, mb:2, lineHeight:1.2,
          }}>
            You're In the System
          </Typography>

          {/* Body */}
          <Typography sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif", lineHeight:1.7, mb:1.5, fontSize:'0.95rem' }}>
            Your athlete application has been received and is now <strong style={{ color: '#FBBF24' }}>pending review</strong> by the coaching staff.
          </Typography>
          <Typography variant="body2" sx={{ color: textSec, fontFamily:"'Google Sans',sans-serif", lineHeight:1.6, mb:4 }}>
            You'll receive an email notification once your application has been reviewed. Use your login credentials to track your status anytime.
          </Typography>

          {/* Status indicator */}
          <Box sx={{ bgcolor: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)', border:`1px solid rgba(251,191,36,0.25)`, borderRadius:'12px', p:2, mb:4 }}>
            <Typography sx={{ fontFamily:"'Google Sans',sans-serif", fontWeight:700, fontSize:'0.78rem', color:'#FBBF24' }}>
              ⏳ APPLICATION STATUS: PENDING REVIEW
            </Typography>
          </Box>

          {/* CTAs */}
          <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
            <Button
              fullWidth variant="contained" size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/athelete/login')}
              sx={{
                borderRadius:'12px', py:1.4,
                fontFamily:"'Google Sans',sans-serif", fontWeight:700,
                background: isDark ? `linear-gradient(135deg, #06b6d4, #d4ff00)` : `linear-gradient(135deg, #004e5c, #536600)`,
                color: isDark ? '#0A0A12' : '#ffffff',
                boxShadow: isDark ? '0 4px 20px rgba(6,182,212,0.25)' : 'none',
                '&:hover':{ boxShadow: isDark ? '0 6px 28px rgba(212,255,0,0.3)' : 'none', transform:'translateY(-1px)' },
              }}
            >
              Track My Application
            </Button>
            <Button
              fullWidth variant="outlined" size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/athelete/register')}
              sx={{
                borderRadius:'12px', py:1.4,
                fontFamily:"'Google Sans',sans-serif", fontWeight:600,
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                color: textSec,
                '&:hover':{ borderColor: isDark ? 'rgba(212,255,0,0.4)' : 'rgba(83,102,0,0.4)', color: LIME },
              }}
            >
              Register Another Athlete
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
