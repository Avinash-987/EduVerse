const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Create HTTP server for both Express and Socket.IO
const server = http.createServer(app);

// Socket.IO server with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = require('../config/db');
connectDB();

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/courses', require('../routes/courses'));
app.use('/api/enrollments', require('../routes/enrollments'));
app.use('/api/assignments', require('../routes/assignments'));
app.use('/api/payments', require('../routes/payments'));
app.use('/api/users', require('../routes/users'));
app.use('/api/chat', require('../routes/chat'));
app.use('/api/live', require('../routes/live'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/ai', require('../routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', locale: 'en-IN', currency: 'INR' });
});

// ─── Socket.IO Authentication Middleware ─────────────────────────────────────
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        socket.userId = decoded.id;
        socket.userName = decoded.name || 'User';
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

// ─── Socket.IO Signaling for Live Classes ────────────────────────────────────
// Tracks which users (by socketId) are in which room
// roomParticipants: Map<roomId, Map<socketId, { userId, userName }>>
const roomParticipants = new Map();

io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id} (user: ${socket.userId})`);

    // ── Join a live class room ────────────────────────────────────────────
    socket.on('join-room', ({ roomId, userName }) => {
        const displayName = userName || socket.userName || 'User';
        socket.join(roomId);
        socket.currentRoom = roomId;

        // Track participant
        if (!roomParticipants.has(roomId)) {
            roomParticipants.set(roomId, new Map());
        }
        const room = roomParticipants.get(roomId);
        room.set(socket.id, { userId: socket.userId, userName: displayName });

        // Build participant list for the joiner
        const existingParticipants = [];
        room.forEach((info, sid) => {
            if (sid !== socket.id) {
                existingParticipants.push({ socketId: sid, userId: info.userId, userName: info.userName });
            }
        });

        // Tell the new user about existing participants
        socket.emit('room-participants', existingParticipants);

        // Tell existing participants about the new user
        socket.to(roomId).emit('user-joined', {
            socketId: socket.id,
            userId: socket.userId,
            userName: displayName,
        });

        // Broadcast updated participant count
        io.to(roomId).emit('participant-count', room.size);

        console.log(`[Socket] ${displayName} joined room ${roomId} (${room.size} participants)`);
    });

    // ── WebRTC Signaling: Offer ───────────────────────────────────────────
    socket.on('offer', ({ to, offer }) => {
        socket.to(to).emit('offer', {
            from: socket.id,
            offer,
        });
    });

    // ── WebRTC Signaling: Answer ──────────────────────────────────────────
    socket.on('answer', ({ to, answer }) => {
        socket.to(to).emit('answer', {
            from: socket.id,
            answer,
        });
    });

    // ── WebRTC Signaling: ICE Candidate ───────────────────────────────────
    socket.on('ice-candidate', ({ to, candidate }) => {
        socket.to(to).emit('ice-candidate', {
            from: socket.id,
            candidate,
        });
    });

    // ── Track state change (mic/camera) broadcast ────────────────────────
    socket.on('track-toggle', ({ roomId, kind, enabled }) => {
        socket.to(roomId).emit('track-toggle', {
            socketId: socket.id,
            kind,
            enabled,
        });
    });

    // ── Screen share started/stopped ──────────────────────────────────────
    socket.on('screen-share', ({ roomId, sharing }) => {
        socket.to(roomId).emit('screen-share', {
            socketId: socket.id,
            sharing,
        });
    });

    // ── Hand raise ────────────────────────────────────────────────────────
    socket.on('hand-raise', ({ roomId, raised }) => {
        socket.to(roomId).emit('hand-raise', {
            socketId: socket.id,
            userId: socket.userId,
            raised,
        });
    });

    // ── Chat message in meeting ───────────────────────────────────────────
    socket.on('meeting-chat', ({ roomId, message }) => {
        io.to(roomId).emit('meeting-chat', {
            socketId: socket.id,
            userId: socket.userId,
            userName: socket.userName,
            message,
            timestamp: new Date().toISOString(),
        });
    });

    // ── Leave room ────────────────────────────────────────────────────────
    socket.on('leave-room', ({ roomId }) => {
        handleLeaveRoom(socket, roomId);
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
        console.log(`[Socket] Disconnected: ${socket.id}`);
        if (socket.currentRoom) {
            handleLeaveRoom(socket, socket.currentRoom);
        }
    });
});

function handleLeaveRoom(socket, roomId) {
    socket.leave(roomId);
    const room = roomParticipants.get(roomId);
    if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
            roomParticipants.delete(roomId);
        } else {
            io.to(roomId).emit('participant-count', room.size);
        }
    }
    // Notify remaining participants to tear down peer connection
    socket.to(roomId).emit('user-left', { socketId: socket.id });
    socket.currentRoom = null;
    console.log(`[Socket] ${socket.id} left room ${roomId}`);
}

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start server — use `server.listen` so Socket.IO works
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} | Socket.IO enabled | Locale: India (IST)`));
}

module.exports = app;
