require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const http = require('http');
const { Server } = require('socket.io');

// --- Create Express App ---
const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

// --- Health Check Route ---
// This is a special route to diagnose the database connection.
app.get('/api/health', async (req, res) => {
    try {
        // Try to establish a connection.
        await connectDB();
        // If we reach here, the connection was successful.
        res.status(200).json({
            status: 'ok',
            message: 'Database connection successful.'
        });
    } catch (error) {
        // If connectDB throws an error, we catch it here.
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed.',
            // Send back the specific error message for easier debugging.
            error: error.message
        });
    }
});

// --- API Routes ---
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/course', require('../routes/courseRoutes'));
app.use('/api/lecture', require('../routes/lectureRoutes'));
app.use('/api/user', require('../routes/userRoutes'));
app.use('/api/razorpay', require('../routes/paymentRoutes'));

// --- Socket.io Setup ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', credentials: true } });

global.io = io;

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// --- Vercel Serverless Export ---
module.exports = server;
