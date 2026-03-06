const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'pdf', 'quiz'], default: 'video' },
    content: { type: String }, // URL to video/pdf
    duration: { type: Number, default: 0 }, // in minutes
    order: { type: Number },
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    order: { type: Number },
    lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: String, default: '' },
    previewVideo: { type: String, default: '' },
    category: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    tags: [String],
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    discountPrice: { type: Number },
    modules: [moduleSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    requirements: [String],
    learningOutcomes: [String],
    language: { type: String, default: 'English' },
}, { timestamps: true });

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
