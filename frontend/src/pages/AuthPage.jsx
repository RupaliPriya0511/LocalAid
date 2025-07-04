import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';
import axios from 'axios';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function AuthPage({ onAuthSuccess }) {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 1) {
        // Register
        await axios.post('https://localaid.onrender.com/api/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setTab(0); // Switch to login after successful registration
        setError('Registration successful! Please log in.');
        setForm({ name: '', email: '', password: '' });
      } else {
        // Login
        const res = await axios.post('https://localaid.onrender.com/api/auth/login', {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (onAuthSuccess) onAuthSuccess(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', display: 'flex', bgcolor: '#f5f5f5' }}>
      {/* Left: Auth Form */}
      <Box sx={{
        width: '50vw',
        minWidth: 0,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}>
        <Paper sx={{ p: 4, minWidth: 350, boxShadow: 3, borderRadius: 3 }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {tab === 1 && (
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                required
              />
            )}
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600, fontSize: 16, mt: 1 }}
            >
              {loading ? 'Please wait...' : (tab === 0 ? 'Login' : 'Register')}
            </Button>
            {error && (
              <Alert severity={error.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Paper>
      </Box>
      {/* Right: Animated App Name and About */}
      <Box
        sx={{
          width: '50vw',
          minWidth: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          px: 6,
          animation: `${fadeIn} 1.2s ease`,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            color: 'primary.main',
            letterSpacing: 2,
            mb: 2,
            textShadow: '0 4px 24px rgba(25, 118, 210, 0.15)',
            animation: `${fadeIn} 1.5s cubic-bezier(.4,0,.2,1)`
          }}
        >
          LocalAid
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
            mb: 3,
            maxWidth: 500,
            textAlign: 'center',
            animation: `${fadeIn} 2s cubic-bezier(.4,0,.2,1)`
          }}
        >
          Empowering communities to connect, help, and thrive.<br />
          <span style={{ color: '#1976d2', fontWeight: 600 }}>Find help, offer services, and stay safe together.</span>
        </Typography>
      </Box>
      {/* Responsive: Stack vertically on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .MuiBox-root[style*='display: flex'][style*='min-height: 100vh'] {
            flex-direction: column !important;
          }
          .MuiBox-root[style*='width: 50vw'] {
            width: 100vw !important;
            min-width: 0 !important;
            height: 50vh !important;
            min-height: 0 !important;
          }
        }
      `}</style>
    </Box>
  );
}