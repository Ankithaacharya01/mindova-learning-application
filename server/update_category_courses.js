const mongoose = require('mongoose');
const Course = require('./models/Course');

const MONGO_URI = 'mongodb://localhost:27017/eduflow';

const CATEGORY_MAP = [
    {
        regexes: [/\bandroid\b/i, /\bapp\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=fis26HvvDII',
        thumbnail: 'https://images.unsplash.com/photo-1607252656733-fd742ca4c659?w=800&q=80'
    },
    {
        regexes: [/\bweb develpoment\b/i, /\bweb development\b/i, /\bweb\b/i, /\bfull stack\b/i, /\breact\b/i, /\bhtml\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'
    },
    {
        regexes: [/\bartificial intelligence\b/i, /\bai\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80'
    },
    {
        regexes: [/\bmachine learning\b/i, /\bdata science\b/i, /\bdata analytics\b/i, /\bdata\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=GwIoAwK1w-A',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
    },
    {
        regexes: [/\bpython\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80'
    },
    {
        regexes: [/\bjava\b/i, /\bc\+\+\b/i, /\bc\b/i, /\bsql\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'
    },
    {
        regexes: [/\bcyber security\b/i, /\bcyber\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'
    },
    {
        regexes: [/\bux\/ui\b/i, /\bui\/ux\b/i, /\bgraphic\b/i, /\bdesign\b/i, /\bdesigning\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80'
    },
    {
        regexes: [/\bmarketing\b/i, /\bsales\b/i, /\bdigital\b/i],
        videoUrl: 'https://www.youtube.com/watch?v=bixR-KIJKYM',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
    }
];

const DEFAULT_MAP = {
    videoUrl: 'https://www.youtube.com/watch?v=8mAITcNt710',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
};

const updateCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const courses = await Course.find();
        let updatedCount = 0;

        for (let course of courses) {
            let matchFound = false;

            for (let category of CATEGORY_MAP) {
                if (category.regexes.some(regex => regex.test(course.title))) {
                    course.videoUrl = category.videoUrl;
                    course.thumbnail = category.thumbnail;
                    matchFound = true;
                    break;
                }
            }

            if (!matchFound) {
                course.videoUrl = DEFAULT_MAP.videoUrl;
                course.thumbnail = DEFAULT_MAP.thumbnail;
            }

            await course.save();
            updatedCount++;
            console.log(`Updated: ${course.title} -> ${matchFound ? 'Matched Category' : 'Default'}`);
        }

        console.log(`Successfully mapped ${updatedCount} courses.`);
    } catch (err) {
        console.error('Error updating courses:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateCourses();
