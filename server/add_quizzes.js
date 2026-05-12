const mongoose = require('mongoose');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';

const generateQuizForLesson = (lessonTitle) => {
    return {
        title: `Quiz: ${lessonTitle}`,
        questions: [
            {
                questionText: `What is the main topic of ${lessonTitle}?`,
                options: [
                    "The core concepts discussed in the lesson.",
                    "Something completely unrelated.",
                    "Advanced topics not covered yet.",
                    "Historical background only."
                ],
                correctOption: 0
            },
            {
                questionText: `Which of the following is true regarding ${lessonTitle}?`,
                options: [
                    "It is rarely used in practice.",
                    "It is a fundamental building block.",
                    "It was deprecated recently.",
                    "It only applies to backend development."
                ],
                correctOption: 1
            }
        ]
    };
};

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // First, let's fix the seed issue if it exists (where lessons are embedded instead of referenced)
        const courses = await Course.find({});
        for (let course of courses) {
            let updatedLessons = [];
            
            // Check if course.lessons contains objects that are not ObjectIds
            // If they are populated or subdocs, we need to extract them and create actual Lesson docs
            for (let i = 0; i < course.lessons.length; i++) {
                let lessonItem = course.lessons[i];
                let lessonDoc;

                if (mongoose.Types.ObjectId.isValid(lessonItem) && typeof lessonItem === 'object' && !lessonItem.title) {
                    // It's likely just an ObjectId
                    lessonDoc = await Lesson.findById(lessonItem);
                } else if (lessonItem.title) {
                    // It's an embedded object that needs to be moved to Lesson collection
                    lessonDoc = new Lesson({
                        title: lessonItem.title,
                        content: lessonItem.content,
                        courseId: course._id,
                        order: i
                    });
                    await lessonDoc.save();
                } else {
                    lessonDoc = await Lesson.findById(lessonItem);
                }

                if (lessonDoc) {
                    // Check if lesson has a quiz
                    if (!lessonDoc.quizId) {
                        const quizData = generateQuizForLesson(lessonDoc.title);
                        quizData.lessonId = lessonDoc._id;
                        const newQuiz = new Quiz(quizData);
                        await newQuiz.save();

                        lessonDoc.quizId = newQuiz._id;
                        await lessonDoc.save();
                        console.log(`Created quiz for lesson: ${lessonDoc.title}`);
                    }
                    updatedLessons.push(lessonDoc._id);
                }
            }

            // Update course lessons array
            if (updatedLessons.length > 0) {
                course.lessons = updatedLessons;
                await course.save();
            }
        }

        console.log('Finished generating quizzes for all lessons!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
