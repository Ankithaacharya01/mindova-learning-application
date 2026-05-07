import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetch('http://localhost:5000/api/courses')
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(err => console.error(err));
    }, []);

    const enroll = async (courseId) => {
        if (!user) return alert('Please login to enroll');
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                alert('Enrollment requested successfully! Waiting for admin approval.');
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Featured Courses</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {courses.map(course => (
                    <div key={course._id} className="course-card">
                        <img src={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Thumbnail'} alt={course.title} />
                        <div className="p-4">
                            <h3>{course.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{course.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>₹{course.price || 15000}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link to={`/courses/${course._id}`} className="btn btn-outline">View Details</Link>
                                    <button onClick={() => enroll(course._id)} className="btn btn-primary">Enroll Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseCatalog;
