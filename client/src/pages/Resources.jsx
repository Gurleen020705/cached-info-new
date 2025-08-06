import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import dummyData from '../data/dummyData.json';
import './Resources.css';

const Resources = () => {
    const { authState } = useContext(AuthContext);

    // Filter states
    const [filters, setFilters] = useState({
        domain: '',
        university: '',
        subject: ''
    });

    // Data states
    const [domains, setDomains] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);

    // Modal states
    const [selectedResource, setSelectedResource] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Extract unique domains and universities from dummyData
    const extractFilterOptions = () => {
        const uniqueDomains = [];
        const uniqueUniversities = [];
        const allSubjects = [];

        dummyData.universities.forEach(university => {
            // Add university if not already added
            if (!uniqueUniversities.find(u => u._id === university._id)) {
                uniqueUniversities.push({
                    _id: university._id,
                    name: university.name
                });
            }

            university.domains.forEach(domain => {
                // Add domain if not already added
                if (!uniqueDomains.find(d => d._id === domain._id)) {
                    uniqueDomains.push({
                        _id: domain._id,
                        name: domain.name
                    });
                }

                // Add subjects with university and domain info
                domain.subjects.forEach(subject => {
                    // Add each resource as a separate item with subject context
                    subject.resources.forEach(resource => {
                        allSubjects.push({
                            ...resource,
                            subjectId: subject._id,
                            subjectName: subject.name,
                            universityId: university._id,
                            universityName: university.name,
                            domainId: domain._id,
                            domainName: domain.name,
                            title: resource.details.title,
                            description: resource.details.description,
                            type: 'university',
                            university: { name: university.name },
                            domain: { name: domain.name },
                            subject: { name: subject.name }
                        });
                    });
                });
            });
        });

        return { uniqueDomains, uniqueUniversities, allSubjects };
    };

    // Filter subjects based on current filters
    const filterSubjects = (allSubjects, currentFilters) => {
        return allSubjects.filter(subject => {
            if (currentFilters.university && subject.universityId !== currentFilters.university) {
                return false;
            }
            if (currentFilters.domain && subject.domainId !== currentFilters.domain) {
                return false;
            }
            return true;
        });
    };

    // Load data on component mount
    useEffect(() => {
        const { uniqueDomains, uniqueUniversities, allSubjects } = extractFilterOptions();

        setDomains(uniqueDomains);
        setUniversities(uniqueUniversities);
        setSubjects(allSubjects);
        setFilteredSubjects(allSubjects);
    }, []);

    // Update filtered data when filters change
    useEffect(() => {
        const filtered = filterSubjects(subjects, filters);
        setFilteredSubjects(filtered);
    }, [filters, subjects]);

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
        setFilteredSubjects(subjects);
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
        if (!authState.isAuthenticated) {
            alert('Please login to save resources');
            return;
        }
        alert('Resource saved successfully!');
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
        if (filteredSubjects.length === 0) {
            return <p className="no-data">No resources found. Please select filters above.</p>;
        }

        return (
            <div className="resources-grid">
                {filteredSubjects.map(resource => (
                    <div
                        key={`${resource.universityId}-${resource.domainId}-${resource.subjectId}-${resource._id}`}
                        className="resource-card"
                        onClick={() => handleResourceClick(resource)}
                    >
                        <div className="card-header">
                            <div className="resource-type-badge">
                                {resource.type}
                            </div>
                            <div className="card-actions">
                                {authState.isAuthenticated && (
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
                                    🏫 {resource.universityName}
                                </span>
                                <span className="meta-item">
                                    📚 {resource.domainName}
                                </span>
                                <span className="meta-item">
                                    📖 {resource.subjectName}
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
                                    <strong>University:</strong> {selectedResource.universityName}
                                </div>
                                <div className="detail-item">
                                    <strong>Domain:</strong> {selectedResource.domainName}
                                </div>
                                <div className="detail-item">
                                    <strong>Subject:</strong> {selectedResource.subjectName}
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
                                disabled={!authState.isAuthenticated}
                            >
                                {authState.isAuthenticated ? 'Save Resource' : 'Login to Save'}
                            </button>
                            <button className="share-resource-btn" disabled>
                                Share (Coming Soon)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;