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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <div className="text-sm text-gray-500">
                            Welcome, {user?.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'resources'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Pending Resources ({pendingResources.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Users ({users.length})
                        </button>
                    </nav>
                </div>
            </div>

            {/* Notifications */}
            {(success || error) && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Pending Resources Tab */}
                        {activeTab === 'resources' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Pending Resource Submissions
                                </h2>

                                {pendingResources.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">No pending resources to review</p>
                                    </div>
                                ) : (
                                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                        <ul className="divide-y divide-gray-200">
                                            {pendingResources.map((resource) => (
                                                <li key={resource.id} className="px-6 py-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-lg font-medium text-blue-600 truncate">
                                                                    {resource.title}
                                                                </p>
                                                                <div className="ml-2 flex-shrink-0 flex">
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                        Pending
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="text-sm text-gray-600">
                                                                    {resource.description || 'No description provided'}
                                                                </p>
                                                            </div>
                                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                                <span>
                                                                    Subject: {resource.subjects?.name} |
                                                                    Domain: {resource.subjects?.domains?.name} |
                                                                    University: {resource.subjects?.domains?.universities?.name}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                                <span>
                                                                    Submitted by: {resource.user_profiles?.full_name || 'Anonymous'} |
                                                                    Date: {new Date(resource.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4 flex space-x-2">
                                                            <button
                                                                onClick={() => approveResource(resource.id)}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => rejectResource(resource.id)}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Registered Users
                                </h2>

                                {users.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">No users found</p>
                                    </div>
                                ) : (
                                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                        <ul className="divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <li key={user.id} className="px-6 py-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center">
                                                                <p className="text-lg font-medium text-gray-900 truncate">
                                                                    {user.full_name || 'No name provided'}
                                                                </p>
                                                                <span className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {user.role}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1">
                                                                <p className="text-sm text-gray-600">
                                                                    User ID: {user.id}
                                                                </p>
                                                            </div>
                                                            <div className="mt-1">
                                                                <p className="text-sm text-gray-500">
                                                                    Joined: {new Date(user.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;