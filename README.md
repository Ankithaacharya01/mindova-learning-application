
Mindova Learning Application

Mindova is a modern MERN-stack based online learning platform developed for students and learners to access courses, improve skills, and manage learning activities through a responsive and interactive interface.

The project demonstrates the implementation of a full-stack web application using React JS for the frontend, Node.js and Express.js for the backend, and MongoDB Atlas for database management.

Features
User Registration and Login
JWT Authentication
Course Management
Responsive Dashboard
REST API Integration
MongoDB Database Connectivity
Modern UI Design
Fully Responsive Layout
Frontend Deployment using Vercel
Backend Deployment using Render
Technologies Used
Frontend
React JS
Vite
Tailwind CSS
React Router DOM
Axios
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
Database
MongoDB Atlas
Deployment
Vercel (Frontend Hosting)
Render (Backend Hosting)


Project Structure
Mindova-Learning-Application/
│
├── client/        # Frontend React Application
├── server/        # Backend Express Server
├── models/        # MongoDB Models
├── routes/        # API Routes
├── controllers/   # Backend Controllers
├── middleware/    # Authentication Middleware
└── README.md


Installation and Setup
Clone the Repository
git clone https://github.com/your-username/mindova-learning-application.git
Navigate to Project Folder

cd mindova-learning-application

Frontend Setup
cd client
npm install
npm run dev

Backend Setup
cd server
npm install
npm start

Environment Variables
Create a .env file inside the server folder and add the following:
MONGO_URI=your_mongodb_atlas_connection_string
PORT=10000
MongoDB Atlas Configuration
Create a MongoDB Atlas account
Create a cluster
Connect the application using the MongoDB connection string
Add the connection string inside the .env file
Deployment
Frontend Deployment – Vercel

The frontend application is deployed using Vercel for fast and reliable hosting.

Backend Deployment – Render

The backend APIs and server are deployed using Render.

Database Hosting – MongoDB Atlas

MongoDB Atlas is used for cloud database hosting and secure data storage.

## Live Demo

The application is successfully deployed and can be accessed using the link below:

🔗 https://mindova-learning-application-345mu7cj3.vercel.app/
Future Enhancements
AI-Based Course Recommendation
Quiz and Certification Module
Real-Time Notifications
Admin Dashboard
Payment Integration
Student Progress Tracking
Conclusion

Mindova Learning Application is a full-stack MERN project developed to provide an efficient and user-friendly online learning platform. The project combines modern frontend technologies, secure backend APIs, cloud database integration, and deployment platforms like Vercel and Render to create a scalable e-learning application. It also helped in gaining practical knowledge of full-stack web development and deployment processes.
