const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get lesson by ID
router.get('/:id', async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('quizId');
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Lesson (Instructors only)
router.post('/', auth(['instructor', 'admin']), async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findOne({ _id: courseId, instructor: req.user.id });
        if (!course) return res.status(403).json({ error: 'Unauthorized to add lessons to this course' });

        const lesson = new Lesson(req.body);
        await lesson.save();

        // Add reference to course
        course.lessons.push(lesson._id);
        await course.save();

        res.status(201).json(lesson);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update Lesson
router.put('/:id', auth(['instructor', 'admin']), async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        const course = await Course.findOne({ _id: lesson.courseId, instructor: req.user.id });
        if (!course) return res.status(403).json({ error: 'Unauthorized' });

        Object.assign(lesson, req.body);
        await lesson.save();
        res.json(lesson);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Lesson
router.delete('/:id', auth(['instructor', 'admin']), async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        const course = await Course.findOne({ _id: lesson.courseId, instructor: req.user.id });
        if (!course) return res.status(403).json({ error: 'Unauthorized' });

        await Course.findByIdAndUpdate(lesson.courseId, { $pull: { lessons: lesson._id } });
        await lesson.deleteOne();
        
        res.json({ message: 'Lesson deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
