import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <Link to="/" className="my-brand">Phonak</Link>
            <div className="nav-links">
                
                <Link to="/" style={{ color: location.pathname === '/' ? 'var(--accent-color)' : '' }}>Home</Link>
                <Link to="/create" style={{ color: location.pathname === '/create' ? 'var(--accent-color)' : '' }}>Create</Link>
                <Link to="/login" style={{ color: location.pathname === '/login' ? 'var(--accent-color)' : '' }}>Log In</Link>
                <Link to="/signup">
                    <button className="go-button" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Sign Up</button>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
