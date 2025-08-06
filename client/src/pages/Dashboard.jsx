import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

import './Dashboard.css';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('resources');
    const [pendingResources, setPendingResources] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch pending resources with user details
    const fetchPendingResources = async () => {
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
                    ),
                    user_profiles!resources_submitted_by_fkey (
                        full_name
                    )
                `)
                .eq('is_approved', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPendingResources(data || []);
        } catch (err) {
            console.error('Error fetching pending resources:', err);
            setError('Failed to fetch pending resources');
        }
    };

    // Fetch all users
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

    // Approve resource
    const approveResource = async (resourceId) => {
        try {
            const { error } = await supabase
                .from('resources')
                .update({ is_approved: true, updated_at: new Date().toISOString() })
                .eq('id', resourceId);

            if (error) throw error;

            setSuccess('Resource approved successfully');
            fetchPendingResources(); // Refresh list
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error approving resource:', err);
            setError('Failed to approve resource');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Reject/Delete resource
    const rejectResource = async (resourceId) => {
        if (!window.confirm('Are you sure you want to reject and delete this resource?')) return;

        try {
            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', resourceId);

            if (error) throw error;

            setSuccess('Resource rejected and removed');
            fetchPendingResources(); // Refresh list
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error rejecting resource:', err);
            setError('Failed to reject resource');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Update user role
    const updateUserRole = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;

            setSuccess(`User role updated to ${newRole}`);
            fetchUsers(); // Refresh list
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Failed to update user role');
            setTimeout(() => setError(null), 3000);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (activeTab === 'resources') {
                await fetchPendingResources();
            } else {
                await fetchUsers();
            }
            setLoading(false);
        };

        if (isAdmin()) {
            loadData();
        }
    }, [activeTab, isAdmin]);

    // Check if user is admin
    if (!isAdmin()) {
        return (
            <div className="dashboard-container">
                <div className="access-denied">
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
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
                        <h1 className="dashboard-title">Admin Dashboard</h1>
                        <div className="user-info">
                            Welcome, {user?.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
                {/* Tabs */}
                <div className="tab-navigation">
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
                    >
                        <span>Pending Resources ({pendingResources.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    >
                        <span>Users ({users.length})</span>
                    </button>
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
                <div style={{ padding: '2rem 0' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* Pending Resources Tab */}
                            {activeTab === 'resources' && (
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1.5rem' }}>
                                        Pending Resource Submissions
                                    </h2>

                                    {pendingResources.length === 0 ? (
                                        <div className="empty-state">
                                            <p style={{ fontSize: '1.125rem' }}>No pending resources to review</p>
                                        </div>
                                    ) : (
                                        <div className="dashboard-card">
                                            {pendingResources.map((resource) => (
                                                <div key={resource.id} className="resource-item">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ flex: '1', minWidth: '0' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                <h3 className="resource-title">
                                                                    {resource.title}
                                                                </h3>
                                                                <span className="status-badge status-pending">
                                                                    Pending
                                                                </span>
                                                            </div>
                                                            <p className="resource-description">
                                                                {resource.description || 'No description provided'}
                                                            </p>
                                                            <div className="resource-meta">
                                                                <span>
                                                                    Subject: {resource.subjects?.name}
                                                                </span>
                                                                <span>
                                                                    Domain: {resource.subjects?.domains?.name}
                                                                </span>
                                                                <span>
                                                                    University: {resource.subjects?.domains?.universities?.name}
                                                                </span>
                                                            </div>
                                                            <div className="resource-meta">
                                                                <span>
                                                                    Submitted by: {resource.user_profiles?.full_name || 'Anonymous'}
                                                                </span>
                                                                <span>
                                                                    Date: {new Date(resource.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => approveResource(resource.id)}
                                                                className="btn btn-approve"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => rejectResource(resource.id)}
                                                                className="btn btn-reject"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1.5rem' }}>
                                        Registered Users
                                    </h2>

                                    {users.length === 0 ? (
                                        <div className="empty-state">
                                            <p style={{ fontSize: '1.125rem' }}>No users found</p>
                                        </div>
                                    ) : (
                                        <div className="dashboard-card">
                                            {users.map((user) => (
                                                <div key={user.id} className="user-item">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ flex: '1', minWidth: '0' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                                <h3 className="user-name">
                                                                    {user.full_name || 'No name provided'}
                                                                </h3>
                                                                <span className={`status-badge ${user.role === 'admin' ? 'status-admin' : 'status-user'}`}>
                                                                    {user.role}
                                                                </span>
                                                            </div>
                                                            <div className="user-meta">
                                                                <p>User ID: {user.id}</p>
                                                            </div>
                                                            <div className="user-meta">
                                                                <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{ marginLeft: '1rem' }}>
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                                className="role-select"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;