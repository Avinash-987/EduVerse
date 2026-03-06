const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, default: 100 },
    submissions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fileUrl: { type: String },
        submittedAt: { type: Date, default: Date.now },
        grade: { type: String },
        score: { type: Number },
        aiScore: { type: Number },
        feedback: { type: String },
        aiFeedback: { type: String },
        status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
