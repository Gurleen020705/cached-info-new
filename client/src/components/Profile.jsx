import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import ResourceCard from './ResourceCard';
import './Profile.css';

const Profile = () => {
  const { authState, logout } = useAuth();
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');

  useEffect(() => {
    if (authState.user) {
      loadSavedResources();
    }
  }, [authState.user]);

  const loadSavedResources = async () => {
    try {
      const response = await axios.get('/api/users/saved-resources', {
        headers: {
          'x-auth-token': authState.token
        }
      });
      setSavedResources(response.data);
    } catch (error) {
      console.error('Error loading saved resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedResource = async (resourceId) => {
    try {
      await axios.delete(`/api/users/saved-resources/${resourceId}`, {
        headers: {
          'x-auth-token': authState.token
        }
      });
      setSavedResources(prev => prev.filter(resource => resource._id !== resourceId));
    } catch (error) {
      console.error('Error removing saved resource:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!authState.user) {
    return <div className="profile-container">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {authState.user.avatar ? (
              <img src={authState.user.avatar} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {authState.user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h2>{authState.user.name}</h2>
            <p>{authState.user.email}</p>
            <span className={`role-badge ${authState.user.role}`}>
              {authState.user.role}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Resources ({savedResources.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          Submitted Resources
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'saved' && (
          <div className="saved-resources">
            {loading ? (
              <div className="loading">Loading saved resources...</div>
            ) : savedResources.length > 0 ? (
              <div className="resources-grid">
                {savedResources.map(resource => (
                  <div key={resource._id} className="resource-item">
                    <ResourceCard resource={resource} />
                    <button
                      className="remove-btn"
                      onClick={() => removeSavedResource(resource._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No saved resources yet</h3>
                <p>Start exploring and save resources you find useful!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submitted' && (
          <div className="submitted-resources">
            <div className="empty-state">
              <h3>Submitted Resources</h3>
              <p>Resources you've submitted will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 