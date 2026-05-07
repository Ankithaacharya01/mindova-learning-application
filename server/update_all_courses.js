const mongoose = require('mongoose');
const Course = require('./models/Course');

const MONGO_URI = 'mongodb://localhost:27017/eduflow';

const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=8mAITcNt710';
const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

const updateCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await Course.updateMany(
            {}, 
            { 
                $set: { 
                    videoUrl: DEFAULT_VIDEO_URL,
                    thumbnail: DEFAULT_THUMBNAIL
                } 
            }
        );

        console.log(`Successfully updated ${result.modifiedCount} courses.`);
    } catch (err) {
        console.error('Error updating courses:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateCourses();
