import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Paper, Tab, Tabs, Box } from '@material-ui/core';
import { AuthContext } from '../../context/authContext';
import axios from 'axios';
import PendingResources from './PendingResources';
import ManageUniversities from './ManageUniversities';
import ManageDomains from './ManageDomains';
import ManageSubjects from './ManageSubjects';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const AdminDashboard = () => {
    const [value, setValue] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const { authState } = useContext(AuthContext);

    useEffect(() => {
        if (authState.user?.role === 'admin') {
            const fetchPendingCount = async () => {
                try {
                    const res = await axios.get('/api/resources/pending/count');
                    setPendingCount(res.data.count);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchPendingCount();
        }
    }, [authState]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
        return (
            <Container>
                <Typography variant="h4" color="error">
                    Unauthorized Access
                </Typography>
                <Typography>
                    You must be an admin to access this page.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h3" gutterBottom>
                Admin Dashboard
            </Typography>

            <Paper elevation={3}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Pending Approvals" />
                    <Tab label="Manage Universities" />
                    <Tab label="Manage Domains" />
                    <Tab label="Manage Subjects" />
                    {pendingCount > 0 && (
                        <Tab label={`Pending (${pendingCount})`} disabled />
                    )}
                </Tabs>

                <TabPanel value={value} index={0}>
                    <PendingResources />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <ManageUniversities />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <ManageDomains />
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <ManageSubjects />
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default AdminDashboard;