const router = require('express').Router();
const Assignment = require('../models/Assignment');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');

// GET /api/assignments/course/:courseId
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId });
        res.json({ success: true, assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/assignments - Faculty create assignment
router.post('/', protect, authorize('faculty'), async (req, res) => {
    try {
        const assignment = await Assignment.create({ ...req.body, instructor: req.user._id });
        res.status(201).json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/assignments/:id/submit - Student submit
router.post('/:id/submit', protect, authorize('student'), upload.single('file'), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });
        assignment.submissions.push({ student: req.user._id, fileUrl: req.body.fileUrl || 'uploaded' });
        await assignment.save();
        res.json({ success: true, message: 'Submission received' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/assignments/:id/grade - Faculty grade
router.put('/:id/grade', protect, authorize('faculty'), async (req, res) => {
    try {
        const { submissionId, grade, score, feedback } = req.body;
        const assignment = await Assignment.findById(req.params.id);
        const submission = assignment.submissions.id(submissionId);
        if (submission) {
            submission.grade = grade;
            submission.score = score;
            submission.feedback = feedback;
            submission.status = 'graded';
            await assignment.save();
        }
        res.json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
