import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Paper,
    Typography,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import axios from 'axios';
import { useAuth } from '../../../context/authContext';

const ManageDomains = () => {
    const [domains, setDomains] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [newDomain, setNewDomain] = useState({
        name: '',
        university: ''
    });
    const { authState } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [domainsRes, universitiesRes] = await Promise.all([
                    axios.get('/api/domains'),
                    axios.get('/api/universities')
                ]);
                setDomains(domainsRes.data);
                setUniversities(universitiesRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const handleAddDomain = async () => {
        if (!newDomain.name.trim() || !newDomain.university) return;

        try {
            const res = await axios.post('/api/domains', newDomain, {
                headers: {
                    'x-auth-token': authState.token
                }
            });
            setDomains([...domains, res.data]);
            setNewDomain({ name: '', university: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/domains/${id}`, {
                headers: {
                    'x-auth-token': authState.token
                }
            });
            setDomains(domains.filter(domain => domain._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
                Manage Domains
            </Typography>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TextField
                    label="Domain Name"
                    variant="outlined"
                    value={newDomain.name}
                    onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                    fullWidth
                />
                <FormControl variant="outlined" fullWidth>
                    <InputLabel>University</InputLabel>
                    <Select
                        value={newDomain.university}
                        onChange={(e) => setNewDomain({ ...newDomain, university: e.target.value })}
                        label="University"
                    >
                        {universities.map(uni => (
                            <MenuItem key={uni._id} value={uni._id}>
                                {uni.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddDomain}
                >
                    Add
                </Button>
            </div>
            <List>
                {domains.map((domain) => (
                    <ListItem key={domain._id}>
                        <ListItemText
                            primary={domain.name}
                            secondary={domain.university?.name}
                        />
                        <IconButton edge="end" onClick={() => handleDelete(domain._id)}>
                            <Delete color="error" />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default ManageDomains;