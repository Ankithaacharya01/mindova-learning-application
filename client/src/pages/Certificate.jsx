import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Download, ArrowLeft } from 'lucide-react';

const Certificate = () => {
    const { enrollmentId } = useParams();
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await fetch(`http://https://mindova-learning-application.onrender.com/api/enrollments/${enrollmentId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.progress === 100) {
                        setEnrollment(data);
                    } else {
                        // User hasn't finished the course yet
                        setEnrollment(null);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificate();
    }, [enrollmentId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="loader" style={{ margin: '5rem auto' }}>Loading Certificate...</div>;

    if (!enrollment) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <h2>Certificate Unavailable</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You must complete the course to view your certificate.</p>
                <Link to="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
            </div>
        );
    }

    const completionDate = new Date(enrollment.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="certificate-wrapper" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Non-printable controls */}
            <div className="no-print" style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <Link to="/dashboard" className="btn" style={{ background: 'var(--glass)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> Download PDF
                </button>
            </div>

            {/* Printable Certificate Area */}
            <div 
                className="certificate-canvas"
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    aspectRatio: '1.414', // A4 Landscape ratio
                    background: '#ffffff', // Force white background for printing
                    color: '#0f172a',
                    padding: '4rem',
                    position: 'relative',
                    border: '8px solid #cbd5e1',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Decorative border */}
                <div style={{
                    position: 'absolute',
                    top: '1rem', right: '1rem', bottom: '1rem', left: '1rem',
                    border: '2px solid #818cf8',
                    pointerEvents: 'none'
                }}></div>

                <Award size={80} color="#818cf8" style={{ marginBottom: '1.5rem' }} />
                
                <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '0.1em', color: '#1e293b', marginBottom: '1rem', textTransform: 'uppercase' }}>
                    Certificate of Completion
                </h1>
                
                <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '2rem', fontStyle: 'italic' }}>
                    This certifies that
                </p>

                <h2 style={{ fontSize: '3.5rem', fontWeight: 700, color: '#818cf8', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', minWidth: '60%' }}>
                    {enrollment.studentId?.name}
                </h2>

                <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '1rem' }}>
                    has successfully completed the course
                </p>

                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '3rem', maxWidth: '80%' }}>
                    {enrollment.courseId?.title}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', marginTop: 'auto', paddingTop: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #94a3b8', width: '200px', marginBottom: '0.5rem', paddingBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
                            {completionDate}
                        </div>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Completed</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #94a3b8', width: '200px', marginBottom: '0.5rem', paddingBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 600, color: '#818cf8', fontFamily: 'cursive' }}>
                            Mindova Academy
                        </div>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authorizing Institution</span>
                    </div>
                </div>
            </div>
            
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-canvas, .certificate-canvas * {
                        visibility: visible;
                    }
                    .certificate-canvas {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw !important;
                        height: 100vh !important;
                        border: none !important;
                        box-shadow: none !important;
                        aspect-ratio: auto !important;
                        transform: scale(1) !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                }
            `}} />
        </div>
    );
};

export default Certificate;
