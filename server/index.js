import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Room management
io.on('connection', (socket) => {
  console.log(`[SYS] SIGNAL_LINK_ESTABLISHED: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    
    if (roomSize >= 2) {
      socket.emit('error', 'ROOM_CAPACITY_EXCEEDED');
      return;
    }

    socket.join(roomId);
    console.log(`[SYS] PEER_${socket.id} JOINED_ROOM: ${roomId}`);

    if (roomSize === 1) {
      // Notify the existing peer that a new one joined
      socket.to(roomId).emit('peer-joined', socket.id);
    }
  });

  socket.on('signal', ({ targetId, signal }) => {
    console.log(`[SYS] TRANSFERRING_SIGNAL: ${socket.id} -> ${targetId}`);
    io.to(targetId).emit('signal', {
      senderId: socket.id,
      signal
    });
  });

  socket.on('chat-message', ({ roomId, message }) => {
    console.log(`[SYS] CHAT_MSG: ${socket.id} -> ROOM_${roomId}`);
    socket.to(roomId).emit('chat-message', {
      senderId: socket.id,
      message,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log(`[SYS] SIGNAL_LINK_LOST: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[SYS] CYBERASCII_SIGNAL_SERVER_ACTIVE: PORT_${PORT}`);
});
