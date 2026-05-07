const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    videoUrl: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);
