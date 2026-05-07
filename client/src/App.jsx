import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import Dashboard from './pages/Dashboard';
import LessonView from './pages/LessonView';
import CreateCourse from './pages/CreateCourse';
import Certificate from './pages/Certificate';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course/:courseId/lesson/:lessonId?" element={<LessonView />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/certificate/:enrollmentId" element={<Certificate />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
