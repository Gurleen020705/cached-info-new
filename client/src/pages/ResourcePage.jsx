import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import { sampleData, filterData } from '../data/sampleData';
import './resources.css';

const ResourcePage = () => {
    const { authState } = useContext(AuthContext);

    // Filter states
    const [filters, setFilters] = useState({
        domain: '',
        university: '',
        semester: '',
        branch: ''
    });

    // Data states
    const [domains, setDomains] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [branches, setBranches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [resources, setResources] = useState([]);

    // Loading states
    const [loading, setLoading] = useState({
        filters: true,
        subjects: false,
        topics: false,
        resources: false
    });

    const [error, setError] = useState(null);
    const [usingStaticData, setUsingStaticData] = useState(false);

    // Fetch filter options on component mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                // Try to fetch from MongoDB first
                const [domainsRes, universitiesRes, semestersRes, branchesRes] = await Promise.all([
                    axios.get('/api/domains'),
                    axios.get('/api/universities'),
                    axios.get('/api/semesters'),
                    axios.get('/api/branches')
                ]);

                setDomains(domainsRes.data);
                setUniversities(universitiesRes.data);
                setSemesters(semestersRes.data);
                setBranches(branchesRes.data);
                setUsingStaticData(false);
            } catch (err) {
                // Fallback to static data if MongoDB connection fails
                console.warn('MongoDB connection failed, using static data:', err);
                setDomains(sampleData.domains);
                setUniversities(sampleData.universities);
                setSemesters(sampleData.semesters);
                setBranches(sampleData.branches);
                setUsingStaticData(true);
                setError('Using demo data - MongoDB connection unavailable');
            } finally {
                setLoading(prev => ({ ...prev, filters: false }));
            }
        };

        fetchFilterOptions();
    }, []);

    // Fetch data when filters change
    useEffect(() => {
        if (filters.domain || filters.university || filters.semester || filters.branch) {
            if (usingStaticData) {
                fetchStaticData();
            } else {
                fetchFilteredData();
            }
        } else {
            // If no filters selected, show all data
            if (usingStaticData) {
                setSubjects(sampleData.subjects);
                setTopics(sampleData.topics);
                setResources(sampleData.resources);
            }
        }
    }, [filters, usingStaticData]);

    const fetchStaticData = () => {
        setLoading({
            filters: false,
            subjects: true,
            topics: true,
            resources: true
        });

        // Simulate async operation
        setTimeout(() => {
            const filteredSubjects = filterData(sampleData.subjects, filters);
            const filteredTopics = filterData(sampleData.topics, filters);
            const filteredResources = filterData(sampleData.resources, filters);

            setSubjects(filteredSubjects);
            setTopics(filteredTopics);
            setResources(filteredResources);

            setLoading({
                filters: false,
                subjects: false,
                topics: false,
                resources: false
            });
        }, 500); // Simulate network delay
    };

    const fetchFilteredData = async () => {
        setLoading({
            filters: false,
            subjects: true,
            topics: true,
            resources: true
        });

        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const [subjectsRes, topicsRes, resourcesRes] = await Promise.all([
                axios.get(`/api/subjects?${queryParams}`),
                axios.get(`/api/topics?${queryParams}`),
                axios.get(`/api/resources?${queryParams}`)
            ]);

            setSubjects(subjectsRes.data);
            setTopics(topicsRes.data);
            setResources(resourcesRes.data);
        } catch (err) {
            console.warn('Failed to fetch filtered data, using static data:', err);
            // Fallback to static data filtering
            const filteredSubjects = filterData(sampleData.subjects, filters);
            const filteredTopics = filterData(sampleData.topics, filters);
            const filteredResources = filterData(sampleData.resources, filters);

            setSubjects(filteredSubjects);
            setTopics(filteredTopics);
            setResources(filteredResources);
            setUsingStaticData(true);
            setError('Using demo data - API unavailable');
        } finally {
            setLoading({
                filters: false,
                subjects: false,
                topics: false,
                resources: false
            });
        }
    };

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
            semester: '',
            branch: ''
        });

        // Show all data when filters are cleared
        if (usingStaticData) {
            setSubjects(sampleData.subjects);
            setTopics(sampleData.topics);
            setResources(sampleData.resources);
        } else {
            setSubjects([]);
            setTopics([]);
            setResources([]);
        }
    };

    const handleSaveResource = async (resourceId) => {
        if (!authState.isAuthenticated) {
            alert('Please login to save resources');
            return;
        }

        if (usingStaticData) {
            alert('Resource saved successfully! (Demo mode)');
            return;
        }

        try {
            await axios.put(
                `/api/users/save/${resourceId}`,
                {},
                { headers: { 'x-auth-token': authState.token } }
            );
            alert('Resource saved successfully!');
        } catch (err) {
            alert('Error saving resource');
        }
    };

    const renderDropdown = (label, options, filterKey, valueField = '_id', labelField = 'name') => (
        <div className="filter-dropdown">
            <label>{label}</label>
            <select
                value={filters[filterKey]}
                onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                disabled={loading.filters}
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

    const renderSubjects = () => {
        if (loading.subjects) {
            return <div className="loader" />;
        }

        if (subjects.length === 0) {
            return <p className="no-data">No subjects found. Please select filters above.</p>;
        }

        return (
            <div className="subjects-grid">
                {subjects.map(subject => (
                    <div key={subject._id} className="subject-card">
                        <h4>{subject.name}</h4>
                        <p>{subject.code}</p>
                        <span className="credit-hours">{subject.creditHours} Credits</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderTopics = () => {
        if (loading.topics) {
            return <div className="loader" />;
        }

        if (topics.length === 0) {
            return <p className="no-data">No topics found. Please select filters above.</p>;
        }

        return (
            <div className="topics-list">
                {topics.map(topic => (
                    <div key={topic._id} className="topic-item">
                        <h5>{topic.name}</h5>
                        <p>{topic.description}</p>
                        <span className="topic-subject">{topic.subject?.name}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderResources = () => {
        if (loading.resources) {
            return <div className="loader" />;
        }

        if (resources.length === 0) {
            return <p className="no-data">No resources found. Please select filters above.</p>;
        }

        return (
            <div className="resources-grid">
                {resources.map(resource => (
                    <div key={resource._id} className="resource-card">
                        <div className="resource-header">
                            <h4>{resource.title}</h4>
                            <span className={`type-badge ${resource.type}`}>
                                {resource.type.toUpperCase()}
                            </span>
                        </div>
                        <p className="resource-description">{resource.description}</p>
                        <div className="resource-actions">
                            <Link
                                to={`/resource/${resource._id}`}
                                className="view-btn"
                            >
                                View Details
                            </Link>
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="visit-btn"
                            >
                                Visit Resource
                            </a>
                            <button
                                onClick={() => handleSaveResource(resource._id)}
                                className="save-btn"
                                disabled={!authState.isAuthenticated}
                            >
                                Save
                            </button>
                        </div>
                        {resource.submittedBy && (
                            <p className="submitted-by">By: {resource.submittedBy.name}</p>
                        )}
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
                {usingStaticData && (
                    <div className="demo-notice">
                        📘 Demo Mode: Showing sample data
                    </div>
                )}
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <h2>Filter Resources</h2>
                <div className="filters-grid">
                    {renderDropdown('Domain', domains, 'domain')}
                    {renderDropdown('University', universities, 'university')}
                    {renderDropdown('Semester', semesters, 'semester', '_id', 'name')}
                    {renderDropdown('Branch', branches, 'branch')}
                </div>
                <button onClick={clearFilters} className="clear-filters-btn">
                    Clear All Filters
                </button>
            </div>

            {/* Subjects Section */}
            <section className="content-section">
                <h2>Subjects</h2>
                {renderSubjects()}
            </section>

            {/* Topics Section */}
            <section className="content-section">
                <h2>Topics</h2>
                {renderTopics()}
            </section>

            {/* Resources Section */}
            <section className="content-section">
                <h2>Available Resources</h2>
                {renderResources()}
            </section>
        </div>
    );
};

export default ResourcePage;