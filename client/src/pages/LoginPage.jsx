import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import { Container, Paper, Typography, Box } from '@material-ui/core';

const LoginPage = () => {
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();

    if (authState.isAuthenticated) {
       navigate('/dashboard');
        return null;
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} style={{ padding: '2rem', marginTop: '4rem' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Login to Cached Info
                </Typography>
                <Typography variant="body1" align="center" paragraph>
                    Access saved resources and submit new content
                </Typography>
                <Box display="flex" justifyContent="center" mt={4}>
                    <GoogleLoginButton />
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;