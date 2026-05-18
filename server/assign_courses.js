const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';

const assignCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the most recently created instructor
        const instructor = await User.findOne({ role: 'instructor' }).sort({ _id: -1 });
        
        if (!instructor) {
            console.log('No instructor found in the database. Please create an instructor account first.');
            process.exit(1);
        }

        console.log(`Found Instructor: ${instructor.email}`);

        // Update all courses to belong to this instructor
        const result = await Course.updateMany({}, { $set: { instructor: instructor._id } });
        
        console.log(`Successfully assigned ${result.modifiedCount} courses to ${instructor.email}.`);
        process.exit(0);
    } catch (err) {
        console.error('Error assigning courses:', err);
        process.exit(1);
    }
};

assignCourses();
