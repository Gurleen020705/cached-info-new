import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('pending-resources');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Data states
    const [pendingResources, setPendingResources] = useState([]);
    const [users, setUsers] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [domains, setDomains] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [resources, setResources] = useState([]);

    // Form states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    // Fetch functions
    const fetchPendingResources = async () => {
        try {
            const { data: resources, error: resourcesError } = await supabase
                .from('resources')
                .select(`
                    *,
                    subjects (
                        name,
                        domains (
                            name,
                            universities (name)
                        )
                    )
                `)
                .eq('is_approved', false)
                .order('created_at', { ascending: false });

            if (resourcesError) throw resourcesError;

            const userIds = [...new Set(resources?.map(r => r.submitted_by).filter(Boolean))];
            let userProfiles = [];

            if (userIds.length > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('user_profiles')
                    .select('id, full_name')
                    .in('id', userIds);

                if (!profilesError) {
                    userProfiles = profiles || [];
                }
            }

            const profileMap = {};
            userProfiles.forEach(profile => {
                profileMap[profile.id] = profile;
            });

            const resourcesWithUsers = (resources || []).map(resource => ({
                ...resource,
                user_profiles: resource.submitted_by ? profileMap[resource.submitted_by] : null
            }));

            setPendingResources(resourcesWithUsers);
        } catch (err) {
            console.error('Error fetching pending resources:', err);
            setError('Failed to fetch pending resources');
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        }
    };

    const fetchUniversities = async () => {
        try {
            const { data, error } = await supabase
                .from('universities')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setUniversities(data || []);
        } catch (err) {
            console.error('Error fetching universities:', err);
            setError('Failed to fetch universities');
        }
    };

    const fetchDomains = async () => {
        try {
            const { data, error } = await supabase
                .from('domains')
                .select(`
                    *,
                    universities (name)
                `)
                .order('name', { ascending: true });

            if (error) throw error;
            setDomains(data || []);
        } catch (err) {
            console.error('Error fetching domains:', err);
            setError('Failed to fetch domains');
        }
    };

    const fetchSubjects = async () => {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select(`
                    *,
                    domains (
                        name,
                        universities (name)
                    )
                `)
                .order('name', { ascending: true });

            if (error) throw error;
            setSubjects(data || []);
        } catch (err) {
            console.error('Error fetching subjects:', err);
            setError('Failed to fetch subjects');
        }
    };

    const fetchResources = async () => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select(`
                    *,
                    subjects (
                        name,
                        domains (
                            name,
                            universities (name)
                        )
                    )
                `)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResources(data || []);
        } catch (err) {
            console.error('Error fetching resources:', err);
            setError('Failed to fetch resources');
        }
    };

    // CRUD Operations
    const handleCreate = async (type, data) => {
        try {
            const { error } = await supabase
                .from(type)
                .insert(data);

            if (error) throw error;

            setSuccess(`${type.slice(0, -1)} created successfully`);
            refreshData(type);
            closeModal();
        } catch (err) {
            console.error(`Error creating ${type}:`, err);
            setError(`Failed to create ${type.slice(0, -1)}`);
        }
    };

    const handleUpdate = async (type, id, data) => {
        try {
            const updateData = { ...data };
            if (type === 'resources' || type === 'user_profiles') {
                updateData.updated_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from(type)
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            setSuccess(`${type.slice(0, -1)} updated successfully`);
            refreshData(type);
            closeModal();
        } catch (err) {
            console.error(`Error updating ${type}:`, err);
            setError(`Failed to update ${type.slice(0, -1)}`);
        }
    };

    const handleDelete = async (type, id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from(type)
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSuccess(`${type.slice(0, -1)} deleted successfully`);
            refreshData(type);
        } catch (err) {
            console.error(`Error deleting ${type}:`, err);
            setError(`Failed to delete ${type.slice(0, -1)}`);
        }
    };

    // Modal handlers
    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);

        if (item) {
            const formDataCopy = { ...item };
            delete formDataCopy.subjects;
            delete formDataCopy.domains;
            delete formDataCopy.universities;
            delete formDataCopy.user_profiles;
            setFormData(formDataCopy);
        } else {
            setFormData({});
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setEditingItem(null);
        setFormData({});
    };

    const handleSubmit = async () => {
        if (editingItem) {
            await handleUpdate(modalType, editingItem.id, formData);
        } else {
            await handleCreate(modalType, formData);
        }
    };

    // Resource approval
    const handleApprovalStatusChange = async (resourceId, newStatus) => {
        if (newStatus === 'pending') return;

        if (newStatus === 'approved') {
            try {
                const { error } = await supabase
                    .from('resources')
                    .update({ is_approved: true, updated_at: new Date().toISOString() })
                    .eq('id', resourceId);

                if (error) throw error;

                setSuccess('Resource approved successfully');
                fetchPendingResources();
            } catch (err) {
                console.error('Error approving resource:', err);
                setError('Failed to approve resource');
            }
        }

        if (newStatus === 'denied') {
            if (!window.confirm('Are you sure you want to deny and delete this resource?')) {
                return;
            }

            try {
                const { error } = await supabase
                    .from('resources')
                    .delete()
                    .eq('id', resourceId);

                if (error) throw error;

                setSuccess('Resource denied and removed');
                fetchPendingResources();
            } catch (err) {
                console.error('Error denying resource:', err);
                setError('Failed to deny resource');
            }
        }
    };

    // User role update
    const updateUserRole = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;

            setSuccess(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Failed to update user role');
        }
    };

    // Refresh data based on type
    const refreshData = (type) => {
        switch (type) {
            case 'universities':
                fetchUniversities();
                break;
            case 'domains':
                fetchDomains();
                break;
            case 'subjects':
                fetchSubjects();
                break;
            case 'resources':
                fetchResources();
                break;
            default:
                break;
        }
    };

    // Load data based on active tab
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                switch (activeTab) {
                    case 'pending-resources':
                        await fetchPendingResources();
                        break;
                    case 'users':
                        await fetchUsers();
                        break;
                    case 'universities':
                        await fetchUniversities();
                        break;
                    case 'domains':
                        await fetchDomains();
                        await fetchUniversities();
                        break;
                    case 'subjects':
                        await fetchSubjects();
                        await fetchDomains();
                        break;
                    case 'resources':
                        await fetchResources();
                        await fetchSubjects();
                        break;
                    default:
                        break;
                }
            } catch (err) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin()) {
            loadData();
        }
    }, [activeTab, isAdmin]);

    // Clear notifications
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    if (!isAdmin()) {
        return (
            <div className="access-denied">
                <div className="access-denied-content">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access the admin dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-inner">
                        <h1 className="dashboard-title">Admin Dashboard</h1>
                        <div className="user-info">
                            Welcome, {user?.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="dashboard-content">
                {/* Tabs */}
                <div className="tab-navigation">
                    {[
                        { id: 'pending-resources', label: `Pending (${pendingResources.length})` },
                        { id: 'resources', label: `Resources (${resources.length})` },
                        { id: 'subjects', label: `Subjects (${subjects.length})` },
                        { id: 'domains', label: `Domains (${domains.length})` },
                        { id: 'universities', label: `Universities (${universities.length})` },
                        { id: 'users', label: `Users (${users.length})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notifications */}
                {success && (
                    <div className="notification notification-success">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="notification notification-error">
                        {error}
                    </div>
                )}

                {/* Content */}
                <div className="content-section">
                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* Pending Resources Tab */}
                            {activeTab === 'pending-resources' && (
                                <div>
                                    <div className="section-header">
                                        <h2 className="section-title">Pending Resource Submissions</h2>
                                    </div>

                                    {pendingResources.length === 0 ? (
                                        <div className="empty-state">
                                            <p>No pending resources to review</p>
                                        </div>
                                    ) : (
                                        <div className="dashboard-card">
                                            {pendingResources.map((resource, index) => (
                                                <div key={resource.id} className="content-item">
                                                    <div className="content-header">
                                                        <div className="content-info">
                                                            <h3 className="content-title">{resource.title}</h3>
                                                            <p className="content-description">
                                                                {resource.description || 'No description provided'}
                                                            </p>
                                                            {resource.url && (
                                                                <div className="content-url">
                                                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                                        {resource.url}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            <div className="content-meta">
                                                                <span className="meta-tag">Subject: {resource.subjects?.name}</span>
                                                                <span className="meta-tag">Domain: {resource.subjects?.domains?.name}</span>
                                                                <span className="meta-tag">University: {resource.subjects?.domains?.universities?.name}</span>
                                                            </div>
                                                            <div className="content-meta">
                                                                <span className="meta-tag">Submitted by: {resource.user_profiles?.full_name || 'Anonymous'}</span>
                                                                <span className="meta-tag">Date: {new Date(resource.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="content-actions">
                                                            <span className="status-badge status-pending">Pending Review</span>
                                                            <select
                                                                value="pending"
                                                                onChange={(e) => handleApprovalStatusChange(resource.id, e.target.value)}
                                                                className="form-select"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="approved">✓ Approve</option>
                                                                <option value="denied">✗ Deny</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Universities Tab */}
                            {activeTab === 'universities' && (
                                <div>
                                    <div className="section-header">
                                        <h2 className="section-title">Universities Management</h2>
                                        <div className="section-actions">
                                            <button
                                                onClick={() => openModal('universities')}
                                                className="btn btn-primary"
                                            >
                                                + Add University
                                            </button>
                                        </div>
                                    </div>

                                    <div className="dashboard-card">
                                        {universities.map((university, index) => (
                                            <div key={university.id} className="content-item">
                                                <div className="content-header">
                                                    <div className="content-info">
                                                        <h3 className="content-title">{university.name}</h3>
                                                        <p className="content-description">
                                                            Created: {new Date(university.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="content-actions">
                                                        <button
                                                            onClick={() => openModal('universities', university)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('universities', university.id, university.name)}
                                                            className="btn btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Domains Tab */}
                            {activeTab === 'domains' && (
                                <div>
                                    <div className="section-header">
                                        <h2 className="section-title">Domains Management</h2>
                                        <div className="section-actions">
                                            <button
                                                onClick={() => openModal('domains')}
                                                className="btn btn-primary"
                                            >
                                                + Add Domain
                                            </button>
                                        </div>
                                    </div>

                                    <div className="dashboard-card">
                                        {domains.map((domain, index) => (
                                            <div key={domain.id} className="content-item">
                                                <div className="content-header">
                                                    <div className="content-info">
                                                        <h3 className="content-title">{domain.name}</h3>
                                                        <p className="content-description">
                                                            University: {domain.universities?.name}
                                                        </p>
                                                        <p className="content-description">
                                                            Created: {new Date(domain.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="content-actions">
                                                        <button
                                                            onClick={() => openModal('domains', domain)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('domains', domain.id, domain.name)}
                                                            className="btn btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subjects Tab */}
                            {activeTab === 'subjects' && (
                                <div>
                                    <div className="section-header">
                                        <h2 className="section-title">Subjects Management</h2>
                                        <div className="section-actions">
                                            <button
                                                onClick={() => openModal('subjects')}
                                                className="btn btn-primary"
                                            >
                                                + Add Subject
                                            </button>
                                        </div>
                                    </div>

                                    <div className="dashboard-card">
                                        {subjects.map((subject, index) => (
                                            <div key={subject.id} className="content-item">
                                                <div className="content-header">
                                                    <div className="content-info">
                                                        <h3 className="content-title">{subject.name}</h3>
                                                        <p className="content-description">
                                                            Domain: {subject.domains?.name}
                                                        </p>
                                                        <p className="content-description">
                                                            University: {subject.domains?.universities?.name}
                                                        </p>
                                                        <p className="content-description">
                                                            Created: {new Date(subject.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="content-actions">
                                                        <button
                                                            onClick={() => openModal('subjects', subject)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('subjects', subject.id, subject.name)}
                                                            className="btn btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resources Tab */}
                            {activeTab === 'resources' && (
                                <div>
                                    <div className="section-header">
                                        <h2 className="section-title">Resources Management</h2>
                                        <div className="section-actions">
                                            <button
                                                onClick={() => openModal('resources')}
                                                className="btn btn-primary"
                                            >
                                                + Add Resource
                                            </button>
                                        </div>
                                    </div>

                                    <div className="dashboard-card">
                                        {resources.map((resource, index) => (
                                            <div key={resource.id} className="content-item">
                                                <div className="content-header">
                                                    <div className="content-info">
                                                        <h3 className="content-title">{resource.title}</h3>
                                                        <p className="content-description">{resource.description}</p>
                                                        <div className="content-meta">
                                                            <span className="meta-tag">Subject: {resource.subjects?.name}</span>
                                                            <span className="meta-tag">Domain: {resource.subjects?.domains?.name}</span>
                                                            <span className="meta-tag">University: {resource.subjects?.domains?.universities?.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="content-actions">
                                                        <button
                                                            onClick={() => openModal('resources', resource)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('resources', resource.id, resource.title)}
                                                            className="btn btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <div className="section-header">
                                        <h2 className="section-title">Registered Users</h2>
                                    </div>

                                    <div className="dashboard-card">
                                        {users.map((user, index) => (
                                            <div key={user.id} className="content-item">
                                                <div className="content-header">
                                                    <div className="content-info">
                                                        <div className="user-header">
                                                            <h3 className="content-title">{user.full_name || 'No name provided'}</h3>
                                                            <span className={`status-badge ${user.role === 'admin' ? 'status-admin' : 'status-user'}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <p className="content-description">
                                                            User ID: {user.id}
                                                        </p>
                                                        <p className="content-description">
                                                            Joined: {new Date(user.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="content-actions">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                            className="form-select"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingItem ? 'Edit' : 'Add'} {modalType.slice(0, -1).charAt(0).toUpperCase() + modalType.slice(1, -1)}
                            </h3>
                            <button onClick={closeModal} className="modal-close">×</button>
                        </div>

                        <div className="modal-body">
                            {/* University Form */}
                            {modalType === 'universities' && (
                                <div className="form-group">
                                    <label className="form-label">University Name</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="form-input"
                                        placeholder="Enter university name"
                                    />
                                </div>
                            )}

                            {/* Domain Form */}
                            {modalType === 'domains' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Domain Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="form-input"
                                            placeholder="Enter domain name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">University</label>
                                        <select
                                            value={formData.university_id || ''}
                                            onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                                            required
                                            className="form-select"
                                        >
                                            <option value="">Select University</option>
                                            {universities.map(uni => (
                                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Subject Form */}
                            {modalType === 'subjects' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Subject Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="form-input"
                                            placeholder="Enter subject name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Domain</label>
                                        <select
                                            value={formData.domain_id || ''}
                                            onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                                            required
                                            className="form-select"
                                        >
                                            <option value="">Select Domain</option>
                                            {domains.map(domain => (
                                                <option key={domain.id} value={domain.id}>
                                                    {domain.name} ({domain.universities?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Resource Form */}
                            {modalType === 'resources' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Resource Title</label>
                                        <input
                                            type="text"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            className="form-input"
                                            placeholder="Enter resource title"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            className="form-textarea"
                                            placeholder="Enter resource description"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">URL</label>
                                        <input
                                            type="url"
                                            value={formData.url || ''}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="form-input"
                                            placeholder="Enter resource URL"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subject</label>
                                        <select
                                            value={formData.subject_id || ''}
                                            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                            required
                                            className="form-select"
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(subject => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name} ({subject.domains?.name} - {subject.domains?.universities?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-checkbox-group">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_approved || false}
                                                onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                                                className="form-checkbox"
                                            />
                                            Approved
                                        </label>
                                    </div>
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="btn-cancel">
                                    Cancel
                                </button>
                                <button onClick={handleSubmit} className="btn-submit">
                                    {editingItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;