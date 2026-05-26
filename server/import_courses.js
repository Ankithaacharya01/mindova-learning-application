const mongoose = require('mongoose');
const fs = require('fs');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';
const COURSES_JSON_PATH = 'C:\\Users\\Ankitha\\Downloads\\mindova_35_courses.json';

const importCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        if (!fs.existsSync(COURSES_JSON_PATH)) {
            console.error(`Courses file not found at ${COURSES_JSON_PATH}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(COURSES_JSON_PATH, 'utf-8');
        const coursesData = JSON.parse(rawData);

        console.log(`Loaded ${coursesData.length} courses from JSON`);

        // Find or create an instructor
        let instructor = await User.findOne({ role: 'instructor' });
        if (!instructor) {
            console.log('No instructor found in DB. Creating a default one...');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('password123', 10);
            instructor = new User({
                name: 'John Smith',
                email: 'john@example.com',
                password: hashedPassword,
                role: 'instructor'
            });
            await instructor.save();
            console.log('Default instructor created:', instructor.email);
        } else {
            console.log('Using existing instructor:', instructor.email);
        }

        // Clear existing courses and lessons to prevent duplication
        console.log('Cleaning up existing courses and lessons...');
        await Course.deleteMany({});
        await Lesson.deleteMany({});
        console.log('Clean up complete.');

        let createdCoursesCount = 0;

        for (const item of coursesData) {
            // Create the course document
            const newCourse = new Course({
                title: item.title,
                description: item.description,
                price: item.price || 15000,
                thumbnail: item.image,
                videoUrl: item.videoUrl,
                instructor: instructor._id,
                lessons: []
            });

            await newCourse.save();

            // Create a default lesson for this course so students can access it
            const defaultLesson = new Lesson({
                title: `Introduction to ${item.title}`,
                content: `Welcome to the ${item.title} course! Start learning by watching this comprehensive tutorial.`,
                videoUrl: item.videoUrl,
                courseId: newCourse._id,
                order: 0
            });

            await defaultLesson.save();

            // Reference the lesson in the course
            newCourse.lessons.push(defaultLesson._id);
            await newCourse.save();

            createdCoursesCount++;
        }

        console.log(`Successfully created ${createdCoursesCount} courses and lessons!`);
        process.exit(0);
    } catch (err) {
        console.error('Error importing courses:', err);
        process.exit(1);
    }
};

importCourses();
