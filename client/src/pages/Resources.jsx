import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './Resources.css';

const Resources = () => {
    const { user } = useAuth();
    const { universities, allResources, loading, error } = useData();

    // Filter states
    const [filters, setFilters] = useState({
        domain: '',
        university: '',
        subject: ''
    });

    // Data states
    const [domains, setDomains] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);

    // Modal states
    const [selectedResource, setSelectedResource] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Extract unique domains and subjects from universities data
    const extractFilterOptions = () => {
        const uniqueDomains = [];
        const uniqueSubjects = [];

        universities.forEach(university => {
            university.domains.forEach(domain => {
                // Add domain if not already added
                if (!uniqueDomains.find(d => d._id === domain._id)) {
                    uniqueDomains.push({
                        _id: domain._id,
                        name: domain.name
                    });
                }

                domain.subjects.forEach(subject => {
                    // Add subject if not already added
                    if (!uniqueSubjects.find(s => s._id === subject._id)) {
                        uniqueSubjects.push({
                            _id: subject._id,
                            name: subject.name,
                            domainId: domain._id,
                            universityId: university._id
                        });
                    }
                });
            });
        });

        return { uniqueDomains, uniqueSubjects };
    };

    // Filter resources based on current filters
    const filterResources = (resources, currentFilters) => {
        return resources.filter(resource => {
            if (currentFilters.university && resource.university._id !== currentFilters.university) {
                return false;
            }
            if (currentFilters.domain && resource.domain._id !== currentFilters.domain) {
                return false;
            }
            if (currentFilters.subject && resource.subject._id !== currentFilters.subject) {
                return false;
            }
            return true;
        });
    };

    // Load data when universities change
    useEffect(() => {
        if (universities.length > 0) {
            const { uniqueDomains, uniqueSubjects } = extractFilterOptions();
            setDomains(uniqueDomains);
            setSubjects(uniqueSubjects);
            setFilteredResources(allResources);
        }
    }, [universities, allResources]);

    // Update filtered data when filters change
    useEffect(() => {
        const filtered = filterResources(allResources, filters);
        setFilteredResources(filtered);
    }, [filters, allResources]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            domain: '',
            university: '',
            subject: ''
        });
        setFilteredResources(allResources);
    };

    const handleResourceClick = (resource) => {
        setSelectedResource(resource);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedResource(null);
    };

    const handleSaveResource = (resourceId) => {
        if (!user) {
            alert('Please login to save resources');
            return;
        }

        // Get existing saved resources from localStorage
        const savedResources = JSON.parse(localStorage.getItem('savedResources') || '[]');

        if (!savedResources.includes(resourceId)) {
            savedResources.push(resourceId);
            localStorage.setItem('savedResources', JSON.stringify(savedResources));
            alert('Resource saved successfully!');
        } else {
            alert('Resource already saved!');
        }
    };

    const renderDropdown = (label, options, filterKey, valueField = '_id', labelField = 'name') => (
        <div className="filter-dropdown">
            <label>{label}</label>
            <select
                value={filters[filterKey]}
                onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            >
                <option value="">Select {label}</option>
                {options.map(option => (
                    <option key={option[valueField]} value={option[valueField]}>
                        {option[labelField]}
                    </option>
                ))}
            </select>
        </div>
    );

    const renderResources = () => {
        if (loading) {
            return <div className="loading">Loading resources...</div>;
        }

        if (error) {
            return <div className="error">Error loading resources: {error}</div>;
        }

        if (filteredResources.length === 0) {
            return <p className="no-data">No resources found. Please adjust filters above.</p>;
        }

        return (
            <div className="resources-grid">
                {filteredResources.map(resource => (
                    <div
                        key={resource._id}
                        className="resource-card"
                        onClick={() => handleResourceClick(resource)}
                    >
                        <div className="card-header">
                            <div className="resource-type-badge">
                                {resource.type}
                            </div>
                            <div className="card-actions">
                                {user && (
                                    <button
                                        className="save-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveResource(resource._id);
                                        }}
                                        title="Save resource"
                                    >
                                        🤍
                                    </button>
                                )}
                                <button
                                    className="share-btn"
                                    disabled
                                    title="Share resource (coming soon)"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    📤
                                </button>
                            </div>
                        </div>

                        <div className="card-content">
                            <h4 className="resource-title">{resource.title}</h4>
                            <p className="resource-description">{resource.description}</p>

                            <div className="resource-meta">
                                <span className="meta-item">
                                    🏫 {resource.university.name}
                                </span>
                                <span className="meta-item">
                                    📚 {resource.domain.name}
                                </span>
                                <span className="meta-item">
                                    📖 {resource.subject.name}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="resources-container">
            <div className="resources-header">
                <h1>Learning Resources</h1>
                <p>Find resources tailored to your academic needs</p>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <h2>Filter Resources</h2>
                <div className="filters-grid">
                    {renderDropdown('University', universities, 'university')}
                    {renderDropdown('Domain', domains, 'domain')}
                </div>
                <button onClick={clearFilters} className="clear-filters-btn">
                    Clear All Filters
                </button>
            </div>

            {/* Resources Section */}
            <section className="content-section">
                <h2>Available Resources</h2>
                {renderResources()}
            </section>

            {/* Modal */}
            {showModal && selectedResource && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedResource.title}</h3>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="resource-details">
                                <div className="detail-item">
                                    <strong>University:</strong> {selectedResource.university.name}
                                </div>
                                <div className="detail-item">
                                    <strong>Domain:</strong> {selectedResource.domain.name}
                                </div>
                                <div className="detail-item">
                                    <strong>Subject:</strong> {selectedResource.subject.name}
                                </div>
                                <div className="detail-item">
                                    <strong>Type:</strong> {selectedResource.type}
                                </div>
                            </div>

                            <div className="description-section">
                                <h4>Description:</h4>
                                <p>{selectedResource.description}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="save-resource-btn"
                                onClick={() => handleSaveResource(selectedResource._id)}
                                disabled={!user}
                            >
                                {user ? 'Save Resource' : 'Login to Save'}
                            </button>
                            <a
                                href={selectedResource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="save-resource-btn"
                                style={{
                                    background: '#007bff',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    textAlign: 'center'
                                }}
                            >
                                Visit Resource
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;