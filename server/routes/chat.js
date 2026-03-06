const router = require('express').Router();
const Chat = require('../models/Chat');
const protect = require('../middleware/auth');

// GET /api/chat/conversations — Get user's conversations
router.get('/conversations', protect, async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', 'name avatar role')
            .populate('course', 'title')
            .sort('-lastMessage');

        // Format with last message preview and unread count
        const formatted = chats.map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const unread = chat.messages.filter(
                m => !m.readBy?.includes(req.user._id) && m.sender?.toString() !== req.user._id.toString()
            ).length;
            return {
                _id: chat._id,
                type: chat.type,
                name: chat.name || chat.participants.find(p => p._id.toString() !== req.user._id.toString())?.name || 'Unknown',
                course: chat.course,
                participants: chat.participants,
                lastMessage: lastMsg?.content || '',
                lastMessageTime: lastMsg?.createdAt || chat.updatedAt,
                unread,
            };
        });

        res.json({ success: true, conversations: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/chat/:id/messages — Get messages for a conversation
router.get('/:id/messages', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id).populate('messages.sender', 'name avatar');
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
        if (!chat.participants.includes(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });

        // Mark messages as read
        chat.messages.forEach(m => {
            if (!m.readBy?.includes(req.user._id)) m.readBy.push(req.user._id);
        });
        await chat.save();

        res.json({ success: true, messages: chat.messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/chat/course/:courseId — Get or create course group chat
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        let chat = await Chat.findOne({ course: req.params.courseId, type: 'group' })
            .populate('messages.sender', 'name avatar');

        if (!chat) {
            return res.json({ success: true, messages: [], chatId: null });
        }

        res.json({ success: true, messages: chat.messages, chatId: chat._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/chat/send — Send a message
router.post('/send', protect, async (req, res) => {
    try {
        const { chatId, content, fileUrl } = req.body;
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
        if (!chat.participants.includes(req.user._id)) return res.status(403).json({ success: false, message: 'Not authorized' });

        chat.messages.push({ sender: req.user._id, content, fileUrl, readBy: [req.user._id] });
        chat.lastMessage = new Date();
        await chat.save();

        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
