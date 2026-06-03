const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const isApproved = role !== 'student'; // Students require admin approval
        const user = new User({ name, email, password, role, isApproved });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.role === 'student' && !user.isApproved) {
            return res.status(403).json({ error: 'Your student account is pending approval by the admin.' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve student (Admin only)
router.put('/approve-student/:id', auth(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Student not found' });
        if (user.role !== 'student') return res.status(400).json({ error: 'Only student accounts can be approved' });

        user.isApproved = true;
        await user.save();
        res.json({ message: 'Student account approved successfully', user: { id: user._id, name: user.name, isApproved: user.isApproved } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
