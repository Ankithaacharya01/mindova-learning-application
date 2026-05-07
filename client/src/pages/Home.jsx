import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Book, Globe, Shield } from 'lucide-react';

const Home = () => {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Master Your Future with Mindova
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                Join thousands of students learning from the best instructors worldwide. Professional courses designed to help you succeed.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/courses" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    Browse Courses <ArrowRight size={20} />
                </Link>
                <Link to="/register" className="btn" style={{ background: 'var(--glass)', color: 'white', textDecoration: 'none' }}>
                    Join for Professional
                </Link>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: '6rem' }}>
                <div className="course-card p-4">
                    <Globe size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3>Learn Anywhere</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Access courses on any device, anytime. Learn at your own pace.</p>
                </div>
                <div className="course-card p-4">
                    <Shield size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3>Expert Instructors</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Learn from industry leaders with years of practical experience.</p>
                </div>
                <div className="course-card p-4">
                    <Book size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3>Interactive Quizzes</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Test your knowledge with hands-on assessments and instant feedback.</p>
                </div>
            </div>

            <div style={{ marginTop: '8rem', padding: '4rem 2rem', background: 'var(--glass)', borderRadius: '24px', textAlign: 'left' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-color)' }}>About Mindova Learning</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                            Mindova Learning is a premier global educational platform committed to bridging the gap between ambition and achievement. We believe that high-quality, professional education should be accessible to everyone, regardless of their location.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                            Our carefully curated curriculum is designed by industry experts to provide hands-on, practical skills that are immediately applicable in today's fast-paced tech landscape. Whether you are looking to start a new career or upskill in your current role, Mindova equips you with the tools you need to succeed.
                        </p>
                    </div>
                    <div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--primary-color)', borderRadius: '50%', padding: '0.5rem', color: 'white', display: 'flex' }}>
                                    <Shield size={20} />
                                </div>
                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Industry-Recognized Certificates</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--primary-color)', borderRadius: '50%', padding: '0.5rem', color: 'white', display: 'flex' }}>
                                    <Globe size={20} />
                                </div>
                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Global Community of Learners</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--primary-color)', borderRadius: '50%', padding: '0.5rem', color: 'white', display: 'flex' }}>
                                    <Book size={20} />
                                </div>
                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Comprehensive Project Portfolio</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
