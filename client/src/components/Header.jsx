import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">DigiBridge</div>
            <nav className="nav">
                <Link to="/resources" className="nav-link">Resources</Link>
                <Link to="/request" className="nav-link">Request Resource</Link>
                <Link to="/submit" className="nav-link">Submit Resource</Link>
                <Link to="/our-story" className="nav-link">Our Story</Link>
            </nav>
        </header>
    );
};

export default Header;