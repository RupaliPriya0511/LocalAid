import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Tabs, Tab, Alert, Container, CircularProgress } from '@mui/material';
import axios from 'axios';
import { keyframes } from '@emotion/react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function AuthPage({ onAuthSuccess }) {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: '#f5f5f5',
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: '100vw', md: '50vw' },
          p: 0,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
          }}
        >
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {tab === 1 && (
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                margin="normal"
              />
            )}
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (tab === 0 ? 'Login' : 'Register')}
            </Button>
            {error && (
              <Alert severity={error.includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
      {!isMobile && (
        <Box
          sx={{
            width: '50vw',
            minWidth: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'white',
            px: 6,
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
      )}
    </Box>
  );
}