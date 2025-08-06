import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const steps = [
    { icon: '🔍', text: 'Checking Cache', duration: 500 },
    { icon: '🏫', text: 'Loading Universities', duration: 1500 },
    { icon: '📚', text: 'Organizing Resources', duration: 1000 },
    { icon: '✨', text: 'Preparing Interface', duration: 800 }
];

const LoadingScreen = ({ error }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);



    useEffect(() => {
        if (error) return;

        let totalTime = 0;
        const intervals = [];

        steps.forEach((step, index) => {
            const timer = setTimeout(() => {
                setCurrentStep(index);
                setProgress(((index + 1) / steps.length) * 100);
            }, totalTime);

            intervals.push(timer);
            totalTime += step.duration;
        });

        return () => {
            intervals.forEach(clearTimeout);
        };
    }, [error]);

    if (error) {
        return (
            <div className="loading-screen error">
                <div className="loading-content">
                    <div className="error-icon">⚠️</div>
                    <h2>Failed to Load Resources</h2>
                    <p className="error-message">{error}</p>
                    <div className="error-actions">
                        <button
                            onClick={() => window.location.reload()}
                            className="retry-button"
                        >
                            🔄 Retry
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="clear-cache-button"
                        >
                            🗑️ Clear Cache & Retry
                        </button>
                    </div>
                    <div className="error-details">
                        <details>
                            <summary>Technical Details</summary>
                            <p>This error occurred while loading educational resources.
                                Try clearing the cache or check your internet connection.</p>
                        </details>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="app-logo">
                    <h1>Cached<strong>Info</strong></h1>
                    <p>Educational Resources Platform</p>
                </div>

                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>

                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="progress-text">{Math.round(progress)}% Complete</div>
                </div>

                <div className="loading-steps">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
                        >
                            <span className="step-icon">{step.icon}</span>
                            <span className="step-text">{step.text}</span>
                            {index === currentStep && (
                                <div className="step-loader"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="loading-message">
                    <p>Preparing your learning resources...</p>
                    <small>This may take a few moments on first visit</small>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;