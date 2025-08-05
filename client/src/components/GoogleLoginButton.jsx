import React from 'react';
import { GoogleLogin } from 'react-google-login';
import { useNavigate } from 'react-router-dom'; // ✅ updated import

const GoogleLoginButton = () => {
    const navigate = useNavigate(); // ✅ useNavigate instead of useHistory

    const responseGoogle = (response) => {
        console.log(response);
        // Send token to your backend for verification
        // Then redirect or update state
        navigate('/'); // ✅ updated usage
    };

    return (
        <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login with Google"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
        />
    );
};

export default GoogleLoginButton;
