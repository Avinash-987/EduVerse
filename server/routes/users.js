const router = require('express').Router();
const User = require('../models/User');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, bio, phone, location } = req.body;

        // Only allow updating safe fields
        const updateFields = {};
        if (name !== undefined) updateFields.name = name.trim();
        if (bio !== undefined) updateFields.bio = bio.trim();
        if (phone !== undefined) updateFields.phone = phone.trim();
        if (location !== undefined) updateFields.location = location.trim();

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, user, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/users/avatar
router.put('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        // Convert to base64 data URL for storage (no Cloudinary needed)
        const base64 = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

        // Check file size (limit to 2MB for base64 storage)
        if (req.file.size > 2 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'Image must be smaller than 2MB' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: dataUrl },
            { new: true }
        );

        res.json({ success: true, user, message: 'Photo updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/users/avatar
router.delete('/avatar', protect, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: '' },
            { new: true }
        );
        res.json({ success: true, user, message: 'Photo removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
