import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="header">
            <div className="logo">Cached<strong>Info</strong></div>

            <button
                className={`hamburger-menu ${isMenuOpen ? 'hamburger-active' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
                <Link
                    to="/"
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    onClick={closeMenu}
                >
                    Home
                </Link>
                <Link
                    to="/resources"
                    className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
                    onClick={closeMenu}
                >
                    Resources
                </Link>
                <Link
                    to="/request"
                    className={`nav-link ${isActive('/request') ? 'active' : ''}`}
                    onClick={closeMenu}
                >
                    Request Resource
                </Link>
                <Link
                    to="/submit"
                    className={`nav-link ${isActive('/submit') ? 'active' : ''}`}
                    onClick={closeMenu}
                >
                    Submit Resource
                </Link>
                <Link
                    to="/our-story"
                    className={`nav-link ${isActive('/our-story') ? 'active' : ''}`}
                    onClick={closeMenu}
                >
                    Our Story
                </Link>
            </nav>
        </header>
    );
};

export default Header;