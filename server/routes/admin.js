const router = require('express').Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats — Platform overview with MongoDB aggregation
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalCourses, totalStudents, totalFaculty, pendingApprovals] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments({ isPublished: true }),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'faculty' }),
            User.countDocuments({ role: 'faculty', isApproved: false }),
        ]);

        const revenueAgg = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]);

        const activeEnrollments = await Enrollment.countDocuments();

        // Monthly revenue (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const monthlyRevenue = await Payment.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // User growth (last 12 months)
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Recent users
        const recentUsers = await User.find().select('name email role createdAt').sort('-createdAt').limit(5);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalCourses,
                totalStudents,
                totalFaculty,
                totalRevenue: revenueAgg[0]?.total || 0,
                totalTransactions: revenueAgg[0]?.count || 0,
                activeEnrollments,
                pendingApprovals,
                currency: 'INR',
            },
            monthlyRevenue,
            userGrowth,
            recentUsers,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/analytics — Detailed analytics
router.get('/analytics', async (req, res) => {
    try {
        const [totalUsers, totalCourses, activeEnrollments] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments({ isPublished: true }),
            Enrollment.countDocuments(),
        ]);

        const revenueAgg = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        // Top courses by enrollment
        const topCourses = await Course.find({ isPublished: true })
            .populate('instructor', 'name')
            .sort('-enrolledCount')
            .limit(10)
            .select('title enrolledCount rating price');

        // User distribution by role
        const userDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            analytics: {
                totalUsers,
                totalCourses,
                activeEnrollments,
                totalRevenue: revenueAgg[0]?.total || 0,
                currency: 'INR',
                topCourses,
                userDistribution,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const users = await User.find(query).select('-password').sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));
        const total = await User.countDocuments(query);
        res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/faculty-pending — Faculty awaiting approval
router.get('/faculty-pending', async (req, res) => {
    try {
        const pendingFaculty = await User.find({ role: 'faculty', isApproved: false }).select('-password').sort('-createdAt');
        res.json({ success: true, faculty: pendingFaculty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/faculty/:id/approve
router.put('/faculty/:id/approve', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/faculty/:id/reject
router.put('/faculty/:id/reject', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Faculty application rejected and removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
