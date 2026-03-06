const router = require('express').Router();
const Course = require('../models/Course');
const Review = require('../models/Review');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

// GET /api/courses - Public: Get all published courses
router.get('/', async (req, res) => {
    try {
        const { search, category, level, sort, page = 1, limit = 12 } = req.query;
        const query = { isPublished: true };
        if (search) query.$text = { $search: search };
        if (category) query.category = category;
        if (level) query.level = level;

        let sortObj = { createdAt: -1 };
        if (sort === 'popular') sortObj = { enrolledCount: -1 };
        else if (sort === 'rating') sortObj = { rating: -1 };
        else if (sort === 'price-low') sortObj = { price: 1 };
        else if (sort === 'price-high') sortObj = { price: -1 };

        const courses = await Course.find(query)
            .populate('instructor', 'name avatar')
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const total = await Course.countDocuments(query);

        res.json({ success: true, courses, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/courses/faculty/my — Faculty: Get my courses
router.get('/faculty/my', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
        const stats = {
            totalCourses: courses.length,
            publishedCourses: courses.filter(c => c.isPublished).length,
            totalStudents: courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
            totalRevenue: courses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrolledCount || 0)), 0),
            avgRating: courses.length > 0
                ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
                : 0,
        };
        res.json({ success: true, courses, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/courses/:id — Public: Get single course with reviews
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name avatar bio');
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const reviews = await Review.find({ course: req.params.id })
            .populate('user', 'name avatar')
            .sort('-createdAt')
            .limit(20);

        res.json({ success: true, course, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/courses — Faculty: Create course
router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const course = await Course.create({ ...req.body, instructor: req.user._id, currency: 'INR' });
        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/courses/:id — Faculty: Update course
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const course = await Course.findOneAndUpdate(
            { _id: req.params.id, instructor: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/courses/:id
router.delete('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ _id: req.params.id, instructor: req.user._id });
        if (!course) return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
