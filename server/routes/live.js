const router = require('express').Router();
const LiveClass = require('../models/LiveClass');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

// GET /api/live/upcoming — Get upcoming live classes for enrolled courses
router.get('/upcoming', protect, async (req, res) => {
    try {
        const Enrollment = require('../models/Enrollment');
        let courseIds = [];

        if (req.user.role === 'student') {
            const enrollments = await Enrollment.find({ student: req.user._id }).select('course');
            courseIds = enrollments.map(e => e.course);
        } else if (req.user.role === 'faculty') {
            const Course = require('../models/Course');
            const courses = await Course.find({ instructor: req.user._id }).select('_id');
            courseIds = courses.map(c => c._id);
        }

        const liveClasses = await LiveClass.find({
            course: { $in: courseIds },
            scheduledAt: { $gte: new Date() },
            status: { $in: ['scheduled', 'live'] },
        })
            .populate('course', 'title')
            .populate('instructor', 'name avatar')
            .sort('scheduledAt')
            .limit(10);

        res.json({ success: true, liveClasses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/live — Faculty: Schedule a live class
router.post('/', protect, authorize('faculty'), async (req, res) => {
    try {
        const liveClass = await LiveClass.create({
            ...req.body,
            instructor: req.user._id,
            timezone: 'Asia/Kolkata',
        });
        res.status(201).json({ success: true, liveClass });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/live/:id/status — Faculty: Update live class status
router.put('/:id/status', protect, authorize('faculty'), async (req, res) => {
    try {
        const liveClass = await LiveClass.findOneAndUpdate(
            { _id: req.params.id, instructor: req.user._id },
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, liveClass });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
