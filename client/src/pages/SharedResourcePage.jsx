import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ShareableResourceCard from '../components/ShareableResourceCard';
import './SharedResourcePage.css';

const SharedResourcePage = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedResource();
  }, [shareId]);

  const loadSharedResource = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/resources/shared/${shareId}`);
      setResource(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load shared resource');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (savedResource) => {
    // Handle save functionality
    console.log('Resource saved:', savedResource);
  };

  const handleRemove = (resourceId) => {
    // Handle remove functionality
    console.log('Resource removed:', resourceId);
  };

  if (loading) {
    return (
      <div className="shared-resource-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading shared resource...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-resource-page">
        <div className="error-container">
          <h2>Resource Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-resource-page">
      <div className="shared-resource-header">
        <h1>Shared Resource</h1>
        <p>This resource was shared with you</p>
      </div>

      <div className="shared-resource-content">
        {resource && (
          <ShareableResourceCard
            resource={resource}
            onSave={handleSave}
            onRemove={handleRemove}
            isSaved={false}
          />
        )}
      </div>

      <div className="shared-resource-footer">
        <button onClick={() => navigate('/')} className="explore-btn">
          Explore More Resources
        </button>
      </div>
    </div>
  );
};

export default SharedResourcePage; 