import React from 'react';
import { GoogleLogin } from 'react-google-login';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const onSuccess = (response) => {
        googleLogin(response.tokenId);
        navigate('/');
    };

    const onFailure = (error) => {
        console.error('Google Login Failed:', error);
    };

    return (
        <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login with Google"
            onSuccess={onSuccess}
            onFailure={onFailure}
            cookiePolicy={'single_host_origin'}
        />
    );
};

export default GoogleLoginButton;