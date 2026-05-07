const mongoose = require('mongoose');
const Course = require('./models/Course');

const MONGO_URI = 'mongodb://localhost:27017/eduflow'; // As seen in update_all_courses.js

const updateCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await Course.updateMany(
            {}, 
            { 
                $set: { 
                    price: 15000
                } 
            }
        );

        console.log(`Successfully updated ${result.modifiedCount} courses to price 15000.`);
    } catch (err) {
        console.error('Error updating courses:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateCourses();
