const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';

const updateThumbnails = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        
        // Map of keywords to images
        const imageMap = {
            'web': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
            'javascript': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80',
            'react': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
            'python': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
            'data': 'https://images.unsplash.com/photo-1551288049-bbda38a5f971?w=800&q=80',
            'default': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
        };

        const courses = await Course.find({ $or: [{ thumbnail: "" }, { thumbnail: null }] });
        
        for (const course of courses) {
            let selectedImage = imageMap.default;
            const title = course.title.toLowerCase();
            
            for (const [key, val] of Object.entries(imageMap)) {
                if (title.includes(key)) {
                    selectedImage = val;
                    break;
                }
            }
            
            course.thumbnail = selectedImage;
            await course.save();
            console.log(`Updated "${course.title}" with image.`);
        }
        
        console.log('Finished updating course images.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateThumbnails();
