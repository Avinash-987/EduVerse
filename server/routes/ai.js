const router = require('express').Router();
const protect = require('../middleware/auth');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/ai/tutor - Proxy to AI tutor
router.post('/tutor', protect, async (req, res) => {
    try {
        // In production: forward to AI microservice
        // const response = await fetch(`${AI_SERVICE_URL}/api/tutor`, { method: 'POST', body: JSON.stringify(req.body), headers: { 'Content-Type': 'application/json' } });
        res.json({
            success: true,
            response: `AI Tutor Response: Great question about "${req.body.message}"! Here\'s what you need to know...`,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/ai/grade - Auto-grade assignment
router.post('/grade', protect, async (req, res) => {
    try {
        res.json({ success: true, score: 85, grade: 'B+', feedback: 'Good work! Consider improving your error handling.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/ai/recommend - Course recommendation
router.post('/recommend', protect, async (req, res) => {
    try {
        res.json({ success: true, recommendations: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
