const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    timezone: { type: String, default: 'Asia/Kolkata' },
    meetingUrl: { type: String },
    status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recordingUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
