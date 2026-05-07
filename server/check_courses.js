const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';

const checkCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const courses = await Course.find({}, 'title thumbnail');
        console.log('Courses in DB:', JSON.stringify(courses, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCourses();
