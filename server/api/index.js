require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ status: 'ok', message: 'Database connection successful.' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed.',
      error: error.message
    });
  }
});

app.use('/api/auth', require('../routes/auth'));
app.use('/api/course', require('../routes/courses'));
app.use('/api/lecture', require('../routes/live'));
app.use('/api/user', require('../routes/users'));
app.use('/api/razorpay', require('../routes/payments'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/ai', require('../routes/ai'));
app.use('/api/assignments', require('../routes/assignments'));
app.use('/api/chat', require('../routes/chat'));
app.use('/api/enrollments', require('../routes/enrollments'));


module.exports = app;
