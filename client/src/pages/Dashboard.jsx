import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

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

    // CRUD Operations - FIXED
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
            // Only add updated_at if the table has this column
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

        // Set form data properly for editing
        if (item) {
            const formDataCopy = { ...item };
            // Remove joined data that shouldn't be in the form
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
                        await fetchUniversities(); // For dropdown
                        break;
                    case 'subjects':
                        await fetchSubjects();
                        await fetchDomains(); // For dropdown
                        break;
                    case 'resources':
                        await fetchResources();
                        await fetchSubjects(); // For dropdown
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
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '48px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    <h2 style={{ color: '#ff6b6b', marginBottom: '16px', fontWeight: '700' }}>Access Denied</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>You don't have permission to access the admin dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                        <h1 style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontWeight: 800,
                            fontSize: '2rem',
                            letterSpacing: '-0.025em'
                        }}>
                            Admin Dashboard
                        </h1>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            color: 'white',
                            fontWeight: 500
                        }}>
                            Welcome, {user?.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
                {/* Tabs */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '8px',
                    margin: '24px 0',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                }}>
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
                            style={{
                                position: 'relative',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                border: 'none',
                                background: activeTab === tab.id
                                    ? 'rgba(255, 255, 255, 0.25)'
                                    : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)',
                                boxShadow: activeTab === tab.id ? '0 6px 20px rgba(255, 255, 255, 0.2)' : 'none'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notifications */}
                {success && (
                    <div style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(72, 187, 120, 0.4)',
                        background: 'rgba(72, 187, 120, 0.2)',
                        color: '#22c55e'
                    }}>
                        {success}
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        fontWeight: 500,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(248, 113, 113, 0.4)',
                        background: 'rgba(248, 113, 113, 0.2)',
                        color: '#ff6b6b'
                    }}>
                        {error}
                    </div>
                )}

                {/* Content */}
                <div style={{ padding: '2rem 0' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                border: '4px solid rgba(255, 255, 255, 0.3)',
                                borderLeft: '4px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                        </div>
                    ) : (
                        <>
                            {/* Pending Resources Tab */}
                            {activeTab === 'pending-resources' && (
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1.5rem' }}>
                                        Pending Resource Submissions
                                    </h2>

                                    {pendingResources.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '64px 24px',
                                            color: 'rgba(255, 255, 255, 0.7)'
                                        }}>
                                            <p style={{ fontSize: '1.125rem' }}>No pending resources to review</p>
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                            overflow: 'hidden'
                                        }}>
                                            {pendingResources.map((resource, index) => (
                                                <div key={resource.id} style={{
                                                    padding: '24px',
                                                    borderBottom: index < pendingResources.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ flex: '1', minWidth: '0' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                <h3 style={{
                                                                    color: 'white',
                                                                    fontWeight: 700,
                                                                    fontSize: '1.125rem',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    {resource.title}
                                                                </h3>
                                                                <span style={{
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.025em',
                                                                    border: '1px solid rgba(255, 193, 7, 0.4)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    background: 'rgba(255, 193, 7, 0.2)',
                                                                    color: '#ffd60a'
                                                                }}>
                                                                    Pending Review
                                                                </span>
                                                            </div>
                                                            <p style={{
                                                                color: 'rgba(255, 255, 255, 0.7)',
                                                                fontSize: '0.875rem',
                                                                lineHeight: 1.5,
                                                                marginBottom: '12px'
                                                            }}>
                                                                {resource.description || 'No description provided'}
                                                            </p>
                                                            {resource.url && (
                                                                <p style={{ marginBottom: '12px' }}>
                                                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{
                                                                        color: '#60a5fa',
                                                                        textDecoration: 'none',
                                                                        fontSize: '0.875rem',
                                                                        fontWeight: 500,
                                                                        transition: 'all 0.3s ease'
                                                                    }}>
                                                                        {resource.url}
                                                                    </a>
                                                                </p>
                                                            )}
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '16px',
                                                                fontSize: '0.75rem',
                                                                color: 'rgba(255, 255, 255, 0.6)',
                                                                marginBottom: '16px',
                                                                flexWrap: 'wrap'
                                                            }}>
                                                                <span style={{
                                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                                }}>
                                                                    Subject: {resource.subjects?.name}
                                                                </span>
                                                                <span style={{
                                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                                }}>
                                                                    Domain: {resource.subjects?.domains?.name}
                                                                </span>
                                                                <span style={{
                                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                                }}>
                                                                    University: {resource.subjects?.domains?.universities?.name}
                                                                </span>
                                                            </div>
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '16px',
                                                                fontSize: '0.75rem',
                                                                color: 'rgba(255, 255, 255, 0.6)',
                                                                flexWrap: 'wrap'
                                                            }}>
                                                                <span style={{
                                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                                }}>
                                                                    Submitted by: {resource.user_profiles?.full_name || 'Anonymous'}
                                                                </span>
                                                                <span style={{
                                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                                }}>
                                                                    Date: {new Date(resource.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ marginLeft: '1rem' }}>
                                                            <select
                                                                value="pending"
                                                                onChange={(e) => handleApprovalStatusChange(resource.id, e.target.value)}
                                                                style={{
                                                                    padding: '10px 14px',
                                                                    borderRadius: '10px',
                                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                                                    color: 'white',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.875rem',
                                                                    cursor: 'pointer',
                                                                    minWidth: '140px',
                                                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                                                }}
                                                            >
                                                                <option value="pending" style={{ color: '#333' }}>Pending</option>
                                                                <option value="approved" style={{ color: '#333' }}>✓ Approve</option>
                                                                <option value="denied" style={{ color: '#333' }}>✗ Deny</option>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>
                                            Universities Management
                                        </h2>
                                        <button
                                            onClick={() => openModal('universities')}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: 'rgba(34, 197, 94, 0.8)',
                                                color: 'white',
                                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            + Add University
                                        </button>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        overflow: 'hidden'
                                    }}>
                                        {universities.map((university, index) => (
                                            <div key={university.id} style={{
                                                padding: '24px',
                                                borderBottom: index < universities.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <h3 style={{
                                                        fontWeight: 700,
                                                        fontSize: '1.125rem',
                                                        color: 'white',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {university.name}
                                                    </h3>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                                                        Created: {new Date(university.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => openModal('universities', university)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(59, 130, 246, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('universities', university.id, university.name)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(239, 68, 68, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Domains Tab */}
                            {activeTab === 'domains' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>
                                            Domains Management
                                        </h2>
                                        <button
                                            onClick={() => openModal('domains')}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: 'rgba(34, 197, 94, 0.8)',
                                                color: 'white',
                                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            + Add Domain
                                        </button>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        overflow: 'hidden'
                                    }}>
                                        {domains.map((domain, index) => (
                                            <div key={domain.id} style={{
                                                padding: '24px',
                                                borderBottom: index < domains.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <h3 style={{
                                                        fontWeight: 700,
                                                        fontSize: '1.125rem',
                                                        color: 'white',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {domain.name}
                                                    </h3>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '4px' }}>
                                                        University: {domain.universities?.name}
                                                    </p>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                                                        Created: {new Date(domain.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => openModal('domains', domain)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(59, 130, 246, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('domains', domain.id, domain.name)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(239, 68, 68, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subjects Tab */}
                            {activeTab === 'subjects' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>
                                            Subjects Management
                                        </h2>
                                        <button
                                            onClick={() => openModal('subjects')}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: 'rgba(34, 197, 94, 0.8)',
                                                color: 'white',
                                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            + Add Subject
                                        </button>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        overflow: 'hidden'
                                    }}>
                                        {subjects.map((subject, index) => (
                                            <div key={subject.id} style={{
                                                padding: '24px',
                                                borderBottom: index < subjects.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <h3 style={{
                                                        fontWeight: 700,
                                                        fontSize: '1.125rem',
                                                        color: 'white',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {subject.name}
                                                    </h3>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '4px' }}>
                                                        Domain: {subject.domains?.name}
                                                    </p>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '4px' }}>
                                                        University: {subject.domains?.universities?.name}
                                                    </p>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                                                        Created: {new Date(subject.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => openModal('subjects', subject)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(59, 130, 246, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('subjects', subject.id, subject.name)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(239, 68, 68, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resources Tab */}
                            {activeTab === 'resources' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>
                                            Resources Management
                                        </h2>
                                        <button
                                            onClick={() => openModal('resources')}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: 'rgba(34, 197, 94, 0.8)',
                                                color: 'white',
                                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            + Add Resource
                                        </button>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        overflow: 'hidden'
                                    }}>
                                        {resources.map((resource, index) => (
                                            <div key={resource.id} style={{
                                                padding: '24px',
                                                borderBottom: index < resources.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{
                                                        fontWeight: 700,
                                                        fontSize: '1.125rem',
                                                        color: 'white',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {resource.title}
                                                    </h3>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '8px' }}>
                                                        {resource.description}
                                                    </p>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '16px',
                                                        fontSize: '0.75rem',
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        <span>Subject: {resource.subjects?.name}</span>
                                                        <span>Domain: {resource.subjects?.domains?.name}</span>
                                                        <span>University: {resource.subjects?.domains?.universities?.name}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => openModal('resources', resource)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(59, 130, 246, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('resources', resource.id, resource.title)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: 'rgba(239, 68, 68, 0.8)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1.5rem' }}>
                                        Registered Users
                                    </h2>

                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        overflow: 'hidden'
                                    }}>
                                        {users.map((user, index) => (
                                            <div key={user.id} style={{
                                                padding: '24px',
                                                borderBottom: index < users.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <h3 style={{
                                                            fontWeight: 700,
                                                            fontSize: '1.125rem',
                                                            color: 'white',
                                                            marginRight: '12px'
                                                        }}>
                                                            {user.full_name || 'No name provided'}
                                                        </h3>
                                                        <span style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.025em',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                                            backdropFilter: 'blur(10px)',
                                                            background: user.role === 'admin'
                                                                ? 'rgba(34, 197, 94, 0.3)'
                                                                : 'rgba(255, 255, 255, 0.2)',
                                                            color: user.role === 'admin' ? '#22c55e' : 'rgba(255, 255, 255, 0.8)'
                                                        }}>
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '4px' }}>
                                                        User ID: {user.id}
                                                    </p>
                                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                                                        Joined: {new Date(user.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                        style={{
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            background: 'rgba(255, 255, 255, 0.2)',
                                                            backdropFilter: 'blur(10px)',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            cursor: 'pointer',
                                                            minWidth: '120px',
                                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                                        }}
                                                    >
                                                        <option value="user" style={{ color: '#333' }}>User</option>
                                                        <option value="admin" style={{ color: '#333' }}>Admin</option>
                                                    </select>
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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {editingItem ? 'Edit' : 'Add'} {modalType.slice(0, -1).charAt(0).toUpperCase() + modalType.slice(1, -1)}
                            </h3>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    padding: '4px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div>
                            {/* University Form */}
                            {modalType === 'universities' && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                        University Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '2px solid rgba(0, 0, 0, 0.1)',
                                            fontSize: '16px',
                                            background: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                        placeholder="Enter university name"
                                    />
                                </div>
                            )}

                            {/* Domain Form */}
                            {modalType === 'domains' && (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            Domain Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                            placeholder="Enter domain name"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            University
                                        </label>
                                        <select
                                            value={formData.university_id || ''}
                                            onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
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
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            Subject Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                            placeholder="Enter subject name"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            Domain
                                        </label>
                                        <select
                                            value={formData.domain_id || ''}
                                            onChange={(e) => setFormData({ ...formData, domain_id: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
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
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            Resource Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                            placeholder="Enter resource title"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)',
                                                resize: 'vertical'
                                            }}
                                            placeholder="Enter resource description"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.url || ''}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                            placeholder="Enter resource URL"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151' }}>
                                            Subject
                                        </label>
                                        <select
                                            value={formData.subject_id || ''}
                                            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(0, 0, 0, 0.1)',
                                                fontSize: '16px',
                                                background: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(subject => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name} ({subject.domains?.name} - {subject.domains?.universities?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: '#374151' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_approved || false}
                                                onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                                                style={{ marginRight: '8px' }}
                                            />
                                            Approved
                                        </label>
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        border: '2px solid #d1d5db',
                                        background: 'white',
                                        color: '#6b7280',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {editingItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;