import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'
import './SignIn.css';

const SignIn = () => {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading, user } = useAuth();

    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [emailSignInLoading, setEmailSignInLoading] = useState(false);

    if (loading) {
        return (
            <div className="signin-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (user) {
        return <div>Redirecting to dashboard...</div>;
    }



    const handleGoogleSignIn = async () => {
        try {
            setIsSigningIn(true);
            setError('');
            await signInWithGoogle();


        } catch (error) {
            console.error('Google sign in failed:', error.message);
            setError('Google sign in failed. Please try again.');
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setEmailSignInLoading(true);
            setError('');

            if (isSignUp) {
                const result = await signUpWithEmail(email, password);
                if (result.user && !result.session) {
                    setError('Please check your email and click the confirmation link to complete your registration.');
                }
            } else {
                await signInWithEmail(email, password);
            }
        } catch (error) {
            console.error('Email auth failed:', error.message);

            // Handle specific Supabase error messages
            if (error.message.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (error.message.includes('User already registered')) {
                setError('This email is already registered. Please sign in instead.');
            } else if (error.message.includes('Email not confirmed')) {
                setError('Please check your email and click the confirmation link first.');
            } else {
                setError(isSignUp ? 'Sign up failed. Please try again.' : 'Sign in failed. Please try again.');
            }
        } finally {
            setEmailSignInLoading(false);
        }
    };



    return (
        <div className="signin-container">
            <div className="signin-wrapper">
                <div className="signin-header">
                    <h2>Welcome {isSignUp ? 'to our platform!' : 'back!'}</h2>
                    <p>{isSignUp ? 'Create an account to start your learning journey.' : 'Sign in to access your learning resources and continue your journey.'}</p>
                </div>

                <div className="signin-form">
                    {error && (
                        <div className="signin-error">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn || emailSignInLoading}
                        className={`google-signin-btn ${isSigningIn ? 'signing-in' : ''}`}
                    >
                        <div className="btn-content">
                            {isSigningIn ? (
                                <div className="signin-spinner"></div>
                            ) : (
                                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span>{isSigningIn ? 'Signing in...' : 'Continue with Google'}</span>
                        </div>
                    </button>

                    <div className="signin-divider">
                        <span>or</span>
                    </div>

                    <form onSubmit={handleEmailAuth} className="email-signin">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="email-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={emailSignInLoading || isSigningIn}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="email-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={emailSignInLoading || isSigningIn}
                            required
                            minLength="6"
                        />
                        <button
                            type="submit"
                            className="email-signin-btn"
                            disabled={emailSignInLoading || isSigningIn}
                        >
                            {emailSignInLoading ? (
                                <span>
                                    <div className="signin-spinner"></div>
                                    {isSignUp ? 'Creating Account...' : 'Signing in...'}
                                </span>
                            ) : (
                                <span>{isSignUp ? 'Create Account' : 'Continue with Email'}</span>
                            )}
                        </button>
                    </form>

                    <div className="auth-toggle">
                        <p>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setEmail('');
                                    setPassword('');
                                }}
                                className="toggle-btn"
                                disabled={emailSignInLoading || isSigningIn}
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;