const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const Post = require('./models/Post');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const path = require('path');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] // Replace with your actual frontend domain
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

app.set('io', io);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your actual frontend domain
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/helpers', require('./routes/helpers'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));

// Test route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Store user socket mappings
const userSockets = new Map();

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (username) => {
    userSockets.set(username, socket.id);
    console.log(`User ${username} authenticated with socket ${socket.id}`);
  });

  // Handle user connection
  socket.on('userConnected', (userData) => {
    console.log('User connected event received:', userData);
    userSockets.set(userData.userName, socket.id);
    console.log(`User ${userData.userName} connected with socket ${socket.id}`);
  });

  // Handle chat rooms
  socket.on('joinRoom', (roomId) => {
    console.log(`User ${socket.id} joining room:`, roomId);
    socket.join(roomId);
    console.log('Current rooms for socket:', Array.from(socket.rooms));
  });

  // Handle messages
  socket.on('sendMessage', async (data) => {
    try {
      const { postId, sender, receiver, text, roomId } = data;

      const message = new Message({
        postId,
        sender,
        receiver,
        text,
        roomId,
        timestamp: new Date()
      });
      const savedMessage = await message.save();

      // Broadcast to all clients in the room
      io.to(roomId).emit('receiveMessage', savedMessage);

      // Create and send notification
      const post = await Post.findById(postId);
      if (post) {
        const notification = new Notification({
          recipient: receiver,
          sender,
          type: 'MESSAGE',
          postId,
          message: `New message on "${post.title}" from ${sender}`
        });
        const savedNotification = await notification.save();

        const recipientSocketId = userSockets.get(receiver);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('notification', savedNotification);
        }
      }
    } catch (err) {
      console.error('Error in sendMessage:', err);
    }
  });

  // Handle notifications
  socket.on('notification', (data) => {
    const recipientSocketId = userSockets.get(data.recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('notification', data);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from socket mapping
    for (const [username, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(username);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));