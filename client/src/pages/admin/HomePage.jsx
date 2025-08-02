import React, { useState, useEffect} from 'react';
import { Container, Grid, Typography, Paper, TextField, MenuItem } from '@material-ui/core';
import SearchBar from '../../components/SearchBar';
import ResourceCard from '../../components/resources/ResourceCard';
import { useAuth } from '../../context/authContext';
import axios from 'axios';

const HomePage = () => {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        university: '',
        domain: '',
        subject: '',
        skill: '',
        exam: ''
    });
    const [universities, setUniversities] = useState([]);
    const [domains, setDomains] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const { authState } = useAuth(); // Cleaner

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/resources');
                setResources(res.data);
                setFilteredResources(res.data);

                const uniRes = await axios.get('/api/universities');
                setUniversities(uniRes.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...resources];

        if (filters.type) {
            filtered = filtered.filter(res => res.type === filters.type);

            if (filters.type === 'university') {
                if (filters.university) {
                    filtered = filtered.filter(res => res.university?._id === filters.university);

                    if (filters.domain) {
                        filtered = filtered.filter(res => res.domain?._id === filters.domain);

                        if (filters.subject) {
                            filtered = filtered.filter(res => res.subject?._id === filters.subject);
                        }
                    }
                }
            } else if (filters.type === 'skill' && filters.skill) {
                filtered = filtered.filter(res => res.skill === filters.skill);
            } else if (filters.type === 'competitive' && filters.exam) {
                filtered = filtered.filter(res => res.exam === filters.exam);
            }
        }

        setFilteredResources(filtered);
    }, [filters, resources]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };

            // Reset dependent filters when parent changes
            if (name === 'type') {
                newFilters.university = '';
                newFilters.domain = '';
                newFilters.subject = '';
                newFilters.skill = '';
                newFilters.exam = '';
            } else if (name === 'university') {
                newFilters.domain = '';
                newFilters.subject = '';
            } else if (name === 'domain') {
                newFilters.subject = '';
            }

            return newFilters;
        });
    };

    const fetchDomains = async (universityId) => {
        try {
            const res = await axios.get(`/api/universities/${universityId}/domains`);
            setDomains(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubjects = async (domainId) => {
        try {
            const res = await axios.get(`/api/domains/${domainId}/subjects`);
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (filters.university) {
            fetchDomains(filters.university);
        }
    }, [filters.university]);

    useEffect(() => {
        if (filters.domain) {
            fetchSubjects(filters.domain);
        }
    }, [filters.domain]);

    const handleSaveResource = async (resourceId) => {
        if (!authState.isAuthenticated) {
            alert('Please login to save resources');
            return;
        }

        try {
            await axios.put(
                `/api/users/save/${resourceId}`,
                {},
                {
                    headers: {
                        'x-auth-token': authState.token
                    }
                }
            );
            alert('Resource saved successfully');
        } catch (err) {
            console.error(err);
            alert('Error saving resource');
        }
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h3" gutterBottom>
                Cached Info
            </Typography>

            <SearchBar />

            <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Resource Type"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="university">University</MenuItem>
                            <MenuItem value="skill">Skill</MenuItem>
                            <MenuItem value="competitive">Competitive Exam</MenuItem>
                        </TextField>
                    </Grid>

                    {filters.type === 'university' && (
                        <>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="University"
                                    name="university"
                                    value={filters.university}
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All Universities</MenuItem>
                                    {universities.map(uni => (
                                        <MenuItem key={uni._id} value={uni._id}>
                                            {uni.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {filters.university && (
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Domain"
                                        name="domain"
                                        value={filters.domain}
                                        onChange={handleFilterChange}
                                    >
                                        <MenuItem value="">All Domains</MenuItem>
                                        {domains.map(domain => (
                                            <MenuItem key={domain._id} value={domain._id}>
                                                {domain.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}

                            {filters.domain && (
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Subject"
                                        name="subject"
                                        value={filters.subject}
                                        onChange={handleFilterChange}
                                    >
                                        <MenuItem value="">All Subjects</MenuItem>
                                        {subjects.map(subject => (
                                            <MenuItem key={subject._id} value={subject._id}>
                                                {subject.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}
                        </>
                    )}

                    {filters.type === 'skill' && (
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Skill"
                                name="skill"
                                value={filters.skill}
                                onChange={handleFilterChange}
                            />
                        </Grid>
                    )}

                    {filters.type === 'competitive' && (
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Exam"
                                name="exam"
                                value={filters.exam}
                                onChange={handleFilterChange}
                            />
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {loading ? (
                <Typography>Loading resources...</Typography>
            ) : (
                <Grid container spacing={3}>
                    {filteredResources.length > 0 ? (
                        filteredResources.map(resource => (
                            <Grid item xs={12} sm={6} md={4} key={resource._id}>
                                <ResourceCard
                                    resource={resource}
                                    onSave={handleSaveResource}
                                    isAuthenticated={authState.isAuthenticated}
                                />
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="h6" style={{ margin: '20px' }}>
                            No resources found matching your filters
                        </Typography>
                    )}
                </Grid>
            )}
        </Container>
    );
};

export default HomePage;