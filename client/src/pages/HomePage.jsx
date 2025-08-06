import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import dummyData from '../data/dummyData.json';

const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentResources, setRecentResources] = useState([]);
    const [stats, setStats] = useState({
        totalResources: 0,
        totalUsers: 0,
        totalRequests: 0
    });

    // Fetch recent resources and stats on component mount
    useEffect(() => {
        loadRecentResources();
        loadStats();
    }, []);

    // Transform dummy data into resources format
    const transformDummyDataToResources = () => {
        const resources = [];

        dummyData.universities.forEach(university => {
            university.domains.forEach(domain => {
                domain.subjects.forEach(subject => {
                    resources.push({
                        _id: `resource_${university._id}_${domain._id}_${subject._id}`,
                        title: `${subject.name} - ${university.name}`,
                        description: `Comprehensive learning materials for ${subject.name} in ${domain.name} at ${university.name}. This resource includes lecture notes, assignments, and study guides.`,
                        type: 'university',
                        university: {
                            name: university.name,
                            _id: university._id
                        },
                        domain: {
                            name: domain.name,
                            _id: domain._id
                        },
                        subject: {
                            name: subject.name,
                            _id: subject._id
                        },
                        dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
                    });
                });
            });
        });

        // Add some skill-based and competitive exam resources
        const additionalResources = [
            {
                _id: 'skill_001',
                title: 'Full Stack Web Development Bootcamp',
                description: 'Complete guide to modern web development including React, Node.js, MongoDB, and deployment strategies.',
                type: 'skill',
                subject: { name: 'Web Development' },
                dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                _id: 'skill_002',
                title: 'Data Science with Python',
                description: 'Learn data analysis, visualization, and machine learning using Python, pandas, and scikit-learn.',
                type: 'skill',
                subject: { name: 'Data Science' },
                dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                _id: 'competitive_001',
                title: 'GATE Computer Science Preparation',
                description: 'Comprehensive preparation materials for GATE CS including previous years papers, mock tests, and solutions.',
                type: 'competitive',
                subject: { name: 'GATE CS' },
                dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                _id: 'competitive_002',
                title: 'JEE Advanced Physics',
                description: 'Advanced physics problems and solutions for JEE preparation with detailed explanations.',
                type: 'competitive',
                subject: { name: 'JEE Physics' },
                dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        return [...resources, ...additionalResources];
    };

    const loadRecentResources = () => {
        try {
            const allResources = transformDummyDataToResources();
            // Sort by date and get the 6 most recent
            const recent = allResources
                .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                .slice(0, 6);
            setRecentResources(recent);
        } catch (error) {
            console.error('Error loading recent resources:', error);
        }
    };

    const loadStats = () => {
        try {
            const allResources = transformDummyDataToResources();
            setStats({
                totalResources: allResources.length,
                totalUsers: 1250, // Static dummy value
                totalRequests: 48   // Static dummy value
            });
        } catch (error) {
            console.error('Error loading stats:', error);
            setStats({
                totalResources: 150,
                totalUsers: 1200,
                totalRequests: 45
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);

        // Simulate API delay
        setTimeout(() => {
            try {
                const allResources = transformDummyDataToResources();
                const filteredResults = allResources.filter(resource =>
                    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (resource.subject && resource.subject.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (resource.domain && resource.domain.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (resource.university && resource.university.name.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                setSearchResults(filteredResults.slice(0, 5)); // Limit to 5 results for dropdown
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms delay to simulate API call
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim() === '') {
            setSearchResults([]);
        }
    };

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Discover Learning Resources
                        <span className="highlight"> That Matter</span>
                    </h1>
                    <p className="hero-subtitle">
                        Find the best educational resources for your academic journey.
                        From university materials to skill development, we've got you covered.
                    </p>

                    {/* Universal Search Bar */}
                    <div className="search-container">
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search by topic, resource, subject, domain, or field..."
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    className="search-input"
                                />
                                <button type="submit" className="search-button" disabled={isSearching}>
                                    {isSearching ? (
                                        <div className="search-spinner"></div>
                                    ) : (
                                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map((result, index) => (
                                    <Link
                                        key={index}
                                        to={`/resources/${result._id}`}
                                        className="search-result-item"
                                        onClick={() => setSearchResults([])}
                                    >
                                        <div className="result-icon">
                                            {result.type === 'university' && '🎓'}
                                            {result.type === 'skill' && '💡'}
                                            {result.type === 'competitive' && '📚'}
                                        </div>
                                        <div className="result-content">
                                            <h4>{result.title}</h4>
                                            <p>{result.description.substring(0, 80)}...</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <Link to="/submit" className="action-button primary">
                            <span className="action-icon">📤</span>
                            Submit a Resource
                        </Link>
                        <Link to="/request" className="action-button secondary">
                            <span className="action-icon">📥</span>
                            Request a Resource
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-number">{stats.totalResources.toLocaleString()}</div>
                        <div className="stat-label">Resources Available</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.totalRequests}</div>
                        <div className="stat-label">Requests Fulfilled</div>
                    </div>
                </div>
            </section>

            {/* Recent Resources Section */}
            <section className="recent-resources">
                <div className="section-header">
                    <h2>Recently Added Resources</h2>
                    <Link to="/resources" className="view-all-link">View All Resources</Link>
                </div>

                <div className="resources-grid">
                    {recentResources.map((resource) => (
                        <div key={resource._id} className="resource-card">
                            <div className="resource-type-badge">
                                {resource.type === 'university' && '🎓 University'}
                                {resource.type === 'skill' && '💡 Skill'}
                                {resource.type === 'competitive' && '📚 Exam'}
                            </div>
                            <h3 className="resource-title">{resource.title}</h3>
                            <p className="resource-description">
                                {resource.description.substring(0, 100)}...
                            </p>
                            <div className="resource-meta">
                                {resource.university && (
                                    <span className="meta-item">🏫 {resource.university.name}</span>
                                )}
                                {resource.subject && (
                                    <span className="meta-item">📖 {resource.subject.name}</span>
                                )}
                                {resource.domain && (
                                    <span className="meta-item">🎯 {resource.domain.name}</span>
                                )}
                            </div>
                            <Link to={`/resources/${resource._id}`} className="resource-link">
                                View Details →
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-container">
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Universal Search</h3>
                        <p>Find resources across all categories with our powerful search engine</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📚</div>
                        <h3>Curated Content</h3>
                        <p>Hand-picked resources verified by our community of educators</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Fast Access</h3>
                        <p>Quick and easy access to learning materials when you need them</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Can't Find What You're Looking For?</h2>
                    <p>Request a resource and our team will help you find it!</p>
                    <div className="cta-buttons">
                        <Link to="/request" className="cta-button primary">Request Resource</Link>
                        <Link to="/submit" className="cta-button secondary">Submit Resource</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;