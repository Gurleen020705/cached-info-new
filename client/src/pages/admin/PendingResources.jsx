import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress
} from '@material-ui/core';
import axios from 'axios';
import { useAuth } from '../../../context/authContext';

const PendingResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authState } = useAuth();

    useEffect(() => {
        const fetchPendingResources = async () => {
            try {
                const res = await axios.get('/api/resources/pending', {
                    headers: {
                        'x-auth-token': authState.token
                    }
                });
                setResources(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingResources();
    }, [authState.token]);

    const handleApprove = async (id) => {
        try {
            await axios.put(`/api/resources/approve/${id}`, {}, {
                headers: {
                    'x-auth-token': authState.token
                }
            });
            setResources(resources.filter(res => res._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Submitted By</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {resources.map((resource) => (
                        <TableRow key={resource._id}>
                            <TableCell>{resource.title}</TableCell>
                            <TableCell>{resource.type}</TableCell>
                            <TableCell>{resource.submittedBy?.name || 'Unknown'}</TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleApprove(resource._id)}
                                >
                                    Approve
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PendingResources;