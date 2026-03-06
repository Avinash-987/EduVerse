const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    stripePaymentId: { type: String },
    stripeSessionId: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String },
    invoiceUrl: { type: String },
    couponCode: { type: String },
    discount: { type: Number, default: 0 },
    refundedAt: { type: Date },
    refundReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
