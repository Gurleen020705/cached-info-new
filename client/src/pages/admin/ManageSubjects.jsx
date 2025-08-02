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

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [domains, setDomains] = useState([]);
    const [newSubject, setNewSubject] = useState({
        name: '',
        domain: ''
    });
    const { authState } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, domainsRes] = await Promise.all([
                    axios.get('/api/subjects'),
                    axios.get('/api/domains')
                ]);
                setSubjects(subjectsRes.data);
                setDomains(domainsRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const handleAddSubject = async () => {
        if (!newSubject.name.trim() || !newSubject.domain) return;

        try {
            const res = await axios.post('/api/subjects', newSubject, {
                headers: {
                    'x-auth-token': authState.token
                }
            });
            setSubjects([...subjects, res.data]);
            setNewSubject({ name: '', domain: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/subjects/${id}`, {
                headers: {
                    'x-auth-token': authState.token
                }
            });
            setSubjects(subjects.filter(subject => subject._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
                Manage Subjects
            </Typography>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TextField
                    label="Subject Name"
                    variant="outlined"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    fullWidth
                />
                <FormControl variant="outlined" fullWidth>
                    <InputLabel>Domain</InputLabel>
                    <Select
                        value={newSubject.domain}
                        onChange={(e) => setNewSubject({ ...newSubject, domain: e.target.value })}
                        label="Domain"
                    >
                        {domains.map(domain => (
                            <MenuItem key={domain._id} value={domain._id}>
                                {domain.name} ({domain.university?.name})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddSubject}
                >
                    Add
                </Button>
            </div>
            <List>
                {subjects.map((subject) => (
                    <ListItem key={subject._id}>
                        <ListItemText
                            primary={subject.name}
                            secondary={`${subject.domain?.name} (${subject.domain?.university?.name})`}
                        />
                        <IconButton edge="end" onClick={() => handleDelete(subject._id)}>
                            <Delete color="error" />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default ManageSubjects;