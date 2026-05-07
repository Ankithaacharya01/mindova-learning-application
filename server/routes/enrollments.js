const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get student's enrollment for a specific course
router.get('/course/:courseId', auth(['student', 'instructor', 'admin']), async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({ 
            studentId: req.user.role === 'student' ? req.user.id : req.query.studentId, 
            courseId: req.params.courseId 
        }).populate('courseId', 'title');
        
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get enrollment by ID (for certificate)
router.get('/:id', auth(['student', 'admin']), async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id)
            .populate('studentId', 'name')
            .populate('courseId', 'title instructor');
        
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        
        // Ensure only the student who owns the enrollment or an admin can access it
        if (req.user.role === 'student' && enrollment.studentId._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update progress/quiz score
router.post('/quiz-score', auth(['student']), async (req, res) => {
    try {
        const { courseId, quizId, score } = req.body;
        const enrollment = await Enrollment.findOne({ studentId: req.user.id, courseId });
        
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

        // Update or add quiz score
        const scoreIndex = enrollment.quizScores.findIndex(q => q.quizId.toString() === quizId);
        if (scoreIndex > -1) {
            enrollment.quizScores[scoreIndex].score = score;
            enrollment.quizScores[scoreIndex].date = Date.now();
        } else {
            enrollment.quizScores.push({ quizId, score });
        }

        // Update overall progress logic could go here
        await enrollment.save();
        res.json(enrollment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update progress
router.put('/:id/progress', auth(['student']), async (req, res) => {
    try {
        const { progress } = req.body;
        const enrollment = await Enrollment.findOne({ _id: req.params.id, studentId: req.user.id });
        
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        
        enrollment.progress = progress;
        if (progress === 100) enrollment.completed = true;
        
        await enrollment.save();
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status (Admin only)
router.put('/:id/status', auth(['admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);
        
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        
        enrollment.status = status;
        await enrollment.save();

        if (status === 'approved') {
            // Update User and Course legacy arrays
            await User.findByIdAndUpdate(enrollment.studentId, { $addToSet: { enrolledCourses: enrollment.courseId } });
            await Course.findByIdAndUpdate(enrollment.courseId, { $addToSet: { studentsEnrolled: enrollment.studentId } });
        }

        res.json({ message: `Enrollment ${status} successfully`, enrollment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
