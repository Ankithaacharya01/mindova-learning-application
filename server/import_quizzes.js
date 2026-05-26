const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Quiz = require('./models/Quiz');
const Course = require('./models/Course');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';
const QUIZZES_JSON_PATH = 'C:\\Users\\Ankitha\\Downloads\\mindova_35_quizzes.json';

const importQuizzes = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        if (!fs.existsSync(QUIZZES_JSON_PATH)) {
            console.error(`Quizzes file not found at ${QUIZZES_JSON_PATH}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(QUIZZES_JSON_PATH, 'utf-8');
        const quizzesData = JSON.parse(rawData);

        console.log(`Loaded ${quizzesData.length} quizzes from JSON`);

        // We will remove existing course-level quizzes to prevent duplicates
        // Course-level quizzes are those that have a courseId or a courseTitle, but NO lessonId
        const deleteResult = await Quiz.deleteMany({
            $or: [
                { courseId: { $exists: true } },
                { courseTitle: { $exists: true } }
            ],
            lessonId: { $exists: false }
        });
        console.log(`Deleted ${deleteResult.deletedCount} existing course-level quizzes`);

        let importedCount = 0;
        let missingCourseCount = 0;

        for (const quizItem of quizzesData) {
            const courseTitle = quizItem.courseTitle;
            
            // Find the course in DB (case-insensitive, trimming whitespace)
            const cleanedTitle = courseTitle.trim();
            const escapedTitle = cleanedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const course = await Course.findOne({
                title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') }
            });

            if (!course) {
                console.log(`Warning: Course not found in DB for title "${courseTitle}"`);
                missingCourseCount++;
            }

            // Convert questions to Mongoose format
            const questions = quizItem.questions.map(q => {
                // Find correct option index
                let correctOptionIndex = q.options.findIndex(opt => opt.trim() === q.answer.trim());
                if (correctOptionIndex === -1) {
                    // Try case-insensitive matching
                    correctOptionIndex = q.options.findIndex(opt => opt.trim().toLowerCase() === q.answer.trim().toLowerCase());
                }
                if (correctOptionIndex === -1) {
                    console.log(`Warning: Correct answer "${q.answer}" not found in options for question "${q.question}"`);
                    correctOptionIndex = 0; // fallback to first option
                }

                return {
                    questionText: q.question,
                    options: q.options,
                    correctOption: correctOptionIndex
                };
            });

            const newQuiz = new Quiz({
                title: `Final Quiz: ${courseTitle}`,
                courseTitle: courseTitle,
                questions: questions,
                courseId: course ? course._id : undefined
            });

            await newQuiz.save();
            importedCount++;
        }

        console.log(`Successfully imported ${importedCount} course-level quizzes!`);
        console.log(`Courses not found in DB count: ${missingCourseCount}`);
        process.exit(0);
    } catch (err) {
        console.error('Error importing quizzes:', err);
        process.exit(1);
    }
};

importQuizzes();
