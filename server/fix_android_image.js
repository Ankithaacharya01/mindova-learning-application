const mongoose = require('mongoose');
const Course = require('./models/Course');

const MONGO_URI = 'mongodb://localhost:27017/eduflow';

const fixImage = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        
        // Find course matching android app development case-insensitively
        const course = await Course.findOne({ title: { $regex: /android/i } });
        
        if (course) {
            console.log('Found course:', course.title);
            course.thumbnail = 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&q=80';
            await course.save();
            console.log('Updated thumbnail to a valid Android image.');
        } else {
            console.log('Course not found');
            
            // let's list all courses just to see
            const allCourses = await Course.find({}, 'title');
            console.log('Available courses:', allCourses.map(c => c.title));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

fixImage();
