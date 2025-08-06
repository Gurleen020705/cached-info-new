import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ error }) => {
    if (error) {
        return (
            <div className="loading-screen error">
                <div className="loading-content">
                    <div className="error-icon">⚠️</div>
                    <h2>Failed to Load Data</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="retry-button"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <h2>Loading Resources...</h2>
                <p>Fetching the latest educational materials</p>

                <div className="loading-steps">
                    <div className="step active">
                        <span className="step-icon">🏫</span>
                        <span className="step-text">Loading Universities</span>
                    </div>
                    <div className="step active">
                        <span className="step-icon">📚</span>
                        <span className="step-text">Organizing Resources</span>
                    </div>
                    <div className="step">
                        <span className="step-icon">✨</span>
                        <span className="step-text">Almost Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;