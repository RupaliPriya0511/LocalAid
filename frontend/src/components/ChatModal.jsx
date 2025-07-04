import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import io from 'socket.io-client';

const SOCKET_URL = 'https://localaid.onrender.com';

export default function ChatModal({ open, onClose, post, currentUser, chatTarget }) {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Get the chat room ID based on post and users
  const getChatRoomId = () => {
    if (!post || !currentUser) return null;
    const currentUserName = typeof currentUser === 'object' ? currentUser.name : currentUser;
    const otherUser = chatTarget || (typeof post.user === 'object' ? post.user.name : post.user);
    // Sort names to ensure consistent room ID regardless of who initiates
    const [user1, user2] = [otherUser, currentUserName].sort();
    return `${post._id}_${user1}_${user2}`;
  };

  // Initialize socket connection
  useEffect(() => {
    if (!open) return;

    console.log('Initializing socket connection...');
    const newSocket = io(SOCKET_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection...');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [open]);

  // Join room and fetch messages when modal opens
  useEffect(() => {
    if (!open || !post || !currentUser || !socket) return;

    const chatRoomId = getChatRoomId();
    if (!chatRoomId) return;

    socket.emit('joinRoom', chatRoomId);

    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`https://localaid.onrender.com/api/messages/${post._id}`, {
          params: {
            userA: chatTarget || (typeof post.user === 'object' ? post.user.name : post.user),
            userB: typeof currentUser === 'object' ? currentUser.name : currentUser
          }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      }
    };

    fetchMessages();

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      if (message.roomId === chatRoomId) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [open, post, currentUser, socket, chatTarget]);

  const handleSend = async () => {
    if (!newMessage.trim() || !socket || !post || !currentUser) return;

    try {
      const chatRoomId = getChatRoomId();
      if (!chatRoomId) return;

      const senderName = typeof currentUser === 'object' ? currentUser.name : currentUser;
      const receiverName = chatTarget || (typeof post.user === 'object' ? post.user.name : post.user);

      const messageData = {
        postId: post._id,
        sender: senderName,
        receiver: receiverName,
        text: newMessage.trim(),
        roomId: chatRoomId
      };

      // Emit message through socket for server to handle
      socket.emit('sendMessage', messageData);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!post || !currentUser) return null;

  const postCreator = typeof post.user === 'object' ? post.user.name : post.user;
  const currentUserName = typeof currentUser === 'object' ? currentUser.name : currentUser;
  const otherUser = chatTarget || postCreator;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        pb: 2
      }}>
        <Avatar 
          src={typeof post.user === 'object' ? post.user.avatar : null}
          sx={{ width: 32, height: 32 }}
        >
          {otherUser[0]}
        </Avatar>
        Chat with {otherUser}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, height: '400px', overflowY: 'auto' }}>
        {messages.map((msg, idx) => {
          const isOwn = msg.sender === currentUserName;
          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: isOwn ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.grey[200], 0.5),
                  color: 'text.primary',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                {!isOwn && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    {msg.sender}
                  </Typography>
                )}
                <Typography variant="body1">{msg.text}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                  {msg.time}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={!newMessage.trim()}
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}









// // import React from 'react';
// // import { Dialog, Box, Typography } from '@mui/material';

// // export default function ChatModal({ open, onClose }) {
// //   return (
// //     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
// //       <Box sx={{ p: 2 }}>
// //         <Typography variant="h6">Chat Modal Test</Typography>
// //       </Box>
// //     </Dialog>
// //   );
// // }






// import React from 'react';
// import { Dialog, Box, Typography } from '@mui/material';

// export default function ChatModal({ open, onClose }) {
//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6">Chat Modal Test</Typography>
//       </Box>
//     </Dialog>
//   );
// }




// import React, { useState } from 'react';
// import { Dialog, Box, Typography, TextField, Button } from '@mui/material';

// export default function ChatModal({ open, onClose }) {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState([]);

//   const handleSend = () => {
//     if (input.trim()) {
//       setMessages(prev => [...prev, { text: input, sender: 'You', time: new Date().toLocaleTimeString() }]);
//       setInput('');
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6">Chat Modal Test</Typography>
//         <Box sx={{ minHeight: 100, maxHeight: 200, overflowY: 'auto', my: 2 }}>
//           {messages.map((msg, idx) => (
//             <Box key={idx} sx={{ mb: 1 }}>
//               <Typography variant="body2"><b>{msg.sender}:</b> {msg.text}</Typography>
//               <Typography variant="caption" color="text.secondary">{msg.time}</Typography>
//             </Box>
//           ))}
//         </Box>
//         <TextField
//           fullWidth
//           placeholder="Type your message..."
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           sx={{ mt: 2 }}
//         />
//         <Button variant="contained" sx={{ mt: 2 }} onClick={handleSend}>Send</Button>
//       </Box>
//     </Dialog>
//   );
// }