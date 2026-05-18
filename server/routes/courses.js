const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');

// Get all courses with filtering
router.get('/', async (req, res) => {
    try {
        const { category, instructor } = req.query;
        let query = {};
        if (category) query.category = category;
        if (instructor) query.instructor = instructor;

        const courses = await Course.find(query)
            .populate('instructor', 'name profilePicture')
            .select('-lessons'); // Don't send lessons in catalog view
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create course (Instructors only)
router.post('/', auth(['instructor', 'admin']), async (req, res) => {
    try {
        const course = new Course({ ...req.body, instructor: req.user.id });
        await course.save();

        // Add to instructor's courses if needed (though we can query by instructor ID)
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Enroll in a course (with payment handling)
router.post('/:id/enroll', auth(['student']), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        // Check if already enrolled
        let enrollment = await Enrollment.findOne({ studentId: req.user.id, courseId: course._id });
        if (enrollment) {
            return res.status(400).json({ error: 'Already enrolled' });
        }
        
        // Create new enrollment
        enrollment = new Enrollment({
            studentId: req.user.id,
            courseId: course._id,
            status: req.body.paymentSuccess ? 'approved' : 'pending' // Auto approve if payment succeeded
        });
        await enrollment.save();

        if (req.body.paymentSuccess) {
            // Update legacy arrays
            await User.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: course._id } });
            await Course.findByIdAndUpdate(course._id, { $addToSet: { studentsEnrolled: req.user.id } });
        }

        res.json({ 
            message: req.body.paymentSuccess ? 'Payment successful! Enrollment approved.' : 'Enrollment requested. Waiting for admin approval.', 
            enrollment 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get course by ID with detailed info and lessons
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name bio profilePicture')
            .populate({
                path: 'lessons',
                options: { sort: { 'order': 1 } }
            });
        
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(404).json({ error: 'Course not found' });
    }
});

// Update course
router.put('/:id', auth(['instructor', 'admin']), async (req, res) => {
    try {
        const course = await Course.findOneAndUpdate(
            { _id: req.params.id, instructor: req.user.id },
            req.body,
            { new: true }
        );
        if (!course) return res.status(404).json({ error: 'Course not found or unauthorized' });
        res.json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
