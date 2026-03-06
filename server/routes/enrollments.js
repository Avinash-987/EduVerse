const router = require('express').Router();
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const LiveClass = require('../models/LiveClass');
const protect = require('../middleware/auth');

// POST /api/enrollments
router.post('/', protect, async (req, res) => {
    try {
        const enrollment = await Enrollment.create({ student: req.user._id, course: req.body.courseId, payment: req.body.paymentId });
        res.status(201).json({ success: true, enrollment });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Already enrolled' });
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/enrollments/my — Student Dashboard primary data
router.get('/my', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name avatar' }
            })
            .sort('-createdAt');
        res.json({ success: true, enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/enrollments/my-dashboard — Full student dashboard data
router.get('/my-dashboard', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name avatar' }
            })
            .sort('-createdAt');

        // Get assignments for enrolled courses
        const courseIds = enrollments.map(e => e.course?._id).filter(Boolean);
        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'title');

        // Get upcoming live classes
        const liveClasses = await LiveClass.find({
            course: { $in: courseIds },
            scheduledAt: { $gte: new Date() },
            status: { $in: ['scheduled', 'live'] }
        })
            .populate('course', 'title')
            .populate('instructor', 'name')
            .sort('scheduledAt')
            .limit(5);

        // Calculate stats
        const completedCount = enrollments.filter(e => e.isCompleted).length;
        const totalProgress = enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
            : 0;

        // Count student's submissions
        let assignmentCount = 0;
        for (const a of assignments) {
            const hasSub = a.submissions?.some(s => s.student?.toString() === req.user._id.toString());
            if (hasSub) assignmentCount++;
        }

        const hoursLearned = enrollments.reduce((sum, e) => {
            const totalLessons = e.course?.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0;
            return sum + Math.round((e.progress / 100) * totalLessons * 0.5); // ~30min per lesson
        }, 0);

        res.json({
            success: true,
            enrollments,
            assignments,
            liveClasses,
            stats: {
                enrolledCount: enrollments.length,
                completedCount,
                hoursLearned,
                assignmentCount,
                avgProgress: totalProgress,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/enrollments/:id/progress
router.put('/:id/progress', protect, async (req, res) => {
    try {
        const update = { progress: req.body.progress };
        if (req.body.lessonId) update.$addToSet = { completedLessons: req.body.lessonId };
        if (req.body.progress >= 100) {
            update.isCompleted = true;
            update.completedAt = new Date();
        }
        const enrollment = await Enrollment.findOneAndUpdate(
            { _id: req.params.id, student: req.user._id },
            update,
            { new: true }
        );
        res.json({ success: true, enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
