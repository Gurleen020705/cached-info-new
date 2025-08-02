import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const ProtectedRoute = ({ component: Component, admin = false, ...rest }) => {
    const { authState } = useContext(AuthContext);

    return (
        <Route
            {...rest}
            render={props =>
                !authState.isAuthenticated ? (
                    <Redirect to="/login" />
                ) : admin && authState.user.role !== 'admin' ? (
                    <Redirect to="/" />
                ) : (
                    <Component {...props} />
                )
            }
        />
    );
};

export default ProtectedRoute;