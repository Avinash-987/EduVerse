const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    name: { type: String }, // for group chats
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // for course group chat
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema],
    lastMessage: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
