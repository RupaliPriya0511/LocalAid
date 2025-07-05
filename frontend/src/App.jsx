// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App



// import Button from '@mui/material/Button';

// function App() {
//   return (
//     <div style={{ padding: 32 }}>
//       <h1>Hello LocalAid!</h1>
//       <Button variant="contained" color="primary">
//         Material UI Button
//       </Button>
//     </div>
//   );
// }

// export default App;





// import Home from './pages/Home';

// function App() {
//   return <Home />;
// }

// export default App;








import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import { Box, CssBaseline } from '@mui/material';
import Footer from './components/Footer';
import { BACKEND_URL } from './config';

// Utility to normalize avatar URL
const normalizeUserAvatar = (user) => {
  if (!user) return user;
  let avatar = user.avatar;
  if (avatar && avatar.startsWith('/')) {
    avatar = `${BACKEND_URL}${avatar}`;
  }
  // Always ensure 'id' is present
  const id = user.id || user._id;
  return { ...user, avatar, id };
};

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    const parsed = saved ? JSON.parse(saved) : null;
    return normalizeUserAvatar(parsed);
  });

  const [socket, setSocket] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        // Emit user info to server for better tracking
        newSocket.emit('userConnected', { userId: user._id || user.id, userName: user.name });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Listen for user profile updates from other devices
      newSocket.on('userProfileUpdated', (data) => {
        console.log('Profile update received via WebSocket:', data);
        console.log('Current user ID:', user._id || user.id);
        console.log('Event user ID:', data.userId);
        console.log('User IDs match?', (data.userId === user._id || data.userId === user.id));
        
        // Check if this update is for the current user
        if (data.userId === user._id || data.userId === user.id) {
          console.log('Updating current user profile from WebSocket event');
          const normalized = normalizeUserAvatar(data.user);
          console.log('Normalized user data:', normalized);
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
          console.log('User state updated successfully');
        } else {
          console.log('WebSocket event not for current user');
        }
      });



      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.close();
      };
    }
  }, [user]);

  const handleAuthSuccess = (user) => {
    const normalized = normalizeUserAvatar(user);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  // Add callback to update user state from child components
  const handleUserUpdate = (updatedUser) => {
    const normalized = normalizeUserAvatar(updatedUser);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (socket) {
      socket.close();
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            backgroundColor: 'background.default',
            pt: 8
          }}
        >

          <Routes>
            <Route path="/" element={<Home user={user} socket={socket} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Box>
      </Box>
    </Router>
  );
}

export default App;