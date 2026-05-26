const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true } // Index of options array
});

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseTitle: { type: String },
    questions: [QuestionSchema]
});

module.exports = mongoose.model('Quiz', QuizSchema);
