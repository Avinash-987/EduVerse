const router = require('express').Router();
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const protect = require('../middleware/auth');

// POST /api/payments/create-checkout — Create Razorpay/Stripe order
router.post('/create-checkout', protect, async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
        if (existingEnrollment) return res.status(400).json({ success: false, message: 'Already enrolled in this course' });

        const amount = course.discountPrice || course.price;

        // Create payment record
        const payment = await Payment.create({
            user: req.user._id,
            course: courseId,
            amount,
            currency: 'INR',
            status: 'pending',
        });

        // In production with Razorpay:
        const Razorpay = require('razorpay');
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_replace_me') {
            return res.status(500).json({ success: false, message: 'High Security Alert: Razorpay Keys are not configured in your .env file. Real payments disabled.' });
        }

        const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

        // Ensure amount is minimally 1 INR (Razorpay takes paisa = amount * 100)
        let rzpAmount = Math.round(amount * 100);
        const order = await rzp.orders.create({ amount: rzpAmount, currency: 'INR', receipt: payment._id.toString() });

        return res.json({ success: true, orderId: order.id, amount: rzpAmount, currency: 'INR', paymentId: payment._id, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/payments/verify — Verify Razorpay payment
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

        // Verify signature strictly
        const crypto = require('crypto');
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Security Alert: Invalid payment signature! Possible spoofing attempt.' });
        }

        const payment = await Payment.findByIdAndUpdate(paymentId, {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            status: 'completed',
            paymentMethod: 'Razorpay',
        }, { new: true });

        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        // Check if already enrolled to prevent duplicates from rapid calls
        const existingEnrollment = await Enrollment.findOne({ student: req.user._id, course: payment.course });
        if (!existingEnrollment) {
            await Enrollment.create({ student: req.user._id, course: payment.course, payment: payment._id });
            await Course.findByIdAndUpdate(payment.course, { $inc: { enrolledCount: 1 }, $addToSet: { enrolledStudents: req.user._id } });
        }

        res.json({ success: true, payment, message: 'Payment verified securely. Enrolled successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/my
router.get('/my', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id }).populate('course', 'title thumbnail price currency').sort('-createdAt');
        const totalSpent = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
        res.json({ success: true, payments, totalSpent, currency: 'INR' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/payments/refund/:id
router.post('/refund/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, user: req.user._id });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        if (payment.status === 'refunded') return res.status(400).json({ success: false, message: 'Already refunded' });

        payment.status = 'refunded';
        payment.refundedAt = new Date();
        payment.refundReason = req.body.reason || 'Customer request';
        await payment.save();

        // Remove enrollment
        await Enrollment.findOneAndDelete({ student: req.user._id, course: payment.course });
        await Course.findByIdAndUpdate(payment.course, { $inc: { enrolledCount: -1 }, $pull: { enrolledStudents: req.user._id } });

        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/payments/invoice/:id
router.get('/invoice/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('course', 'title price currency')
            .populate('user', 'name email phone location');
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.json({ success: true, invoice: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
