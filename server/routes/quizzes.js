const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
// Get Quiz by Course ID
const Course = require('../models/Course');

router.get('/course/:courseId', async (req, res) => {
    try {

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        const quiz = await Quiz.findOne({
            courseTitle: course.title
        });

        if (!quiz) {
            return res.status(404).json({
                error: 'Course quiz not found'
            });
        }

        res.json(quiz);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});
// Get Quiz by ID
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        res.json(quiz);
    } catch (err) {
        res.status(404).json({ error: 'Quiz not found' });
    }
});

// Create Quiz (Instructors)
router.post('/', auth(['instructor', 'admin']), async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
