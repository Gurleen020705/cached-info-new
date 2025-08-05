import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            // The auth context will handle the redirect based on user role
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleError = () => {
        console.error('Google login failed');
    };

    return (
        <div className="google-login-container">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
            />
        </div>
    );
};

export default GoogleLoginButton;
