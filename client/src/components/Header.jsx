import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, User as UserIcon } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-nav">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
                    <BookOpen size={30} color="var(--primary)" />
                    Mindova
                </h1>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Link to="/courses" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Courses</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                                background: user.role === 'admin' ? '#ef4444' : user.role === 'instructor' ? 'var(--primary)' : '#10b981',
                                color: 'white',
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                            }}>
                                {user.role}
                            </div>
                            <UserIcon size={20} />
                        </Link>
                        <button onClick={logout} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign In</Link>
                )}
            </div>
        </nav>
    );
};

export default Header;
