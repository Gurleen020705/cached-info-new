import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Box
} from '@material-ui/core';
import axios from 'axios';

const ResourceSubmissionForm = ({ open, onClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [resourceType, setResourceType] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        university: '',
        domain: '',
        subject: '',
        skill: '',
        exam: ''
    });
    const [universities, setUniversities] = useState([]);
    const [domains, setDomains] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper function to validate URL format
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setActiveStep(0);
        setResourceType('');
        setFormData({
            title: '',
            description: '',
            url: '',
            university: '',
            domain: '',
            subject: '',
            skill: '',
            exam: ''
        });
        setErrors({});
        setDomains([]);
        setSubjects([]);
        setIsSubmitting(false);
    };

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    useEffect(() => {
        if (resourceType === 'university') {
            const fetchUniversities = async () => {
                try {
                    const res = await axios.get('/api/universities');
                    setUniversities(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchUniversities();
        }
    }, [resourceType]);

    useEffect(() => {
        if (formData.university) {
            const fetchDomains = async () => {
                try {
                    const res = await axios.get(`/api/universities/${formData.university}/domains`);
                    setDomains(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchDomains();
        }
    }, [formData.university]);

    useEffect(() => {
        if (formData.domain) {
            const fetchSubjects = async () => {
                try {
                    const res = await axios.get(`/api/domains/${formData.domain}/subjects`);
                    setSubjects(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchSubjects();
        }
    }, [formData.domain]);

    const handleNext = () => {
        if (activeStep === 0 && !resourceType) {
            setErrors({ resourceType: 'Please select a resource type' });
            return;
        }
        setErrors({});
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleClear = () => {
        resetForm();
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.url) newErrors.url = 'URL is required';
        else if (!isValidUrl(formData.url)) newErrors.url = 'Please enter a valid URL';
        if (!formData.description) newErrors.description = 'Description is required';

        if (resourceType === 'university') {
            if (!formData.university) newErrors.university = 'University is required';
            if (!formData.domain) newErrors.domain = 'Domain is required';
            if (!formData.subject) newErrors.subject = 'Subject is required';
        } else if (resourceType === 'skill' && !formData.skill) {
            newErrors.skill = 'Skill is required';
        } else if (resourceType === 'competitive' && !formData.exam) {
            newErrors.exam = 'Exam is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                url: formData.url,
                type: resourceType
            };

            if (resourceType === 'university') {
                payload.university = formData.university;
                payload.domain = formData.domain;
                payload.subject = formData.subject;
            } else if (resourceType === 'skill') {
                payload.skill = formData.skill;
            } else if (resourceType === 'competitive') {
                payload.exam = formData.exam;
            }

            await axios.post('/api/resources', payload);
            onClose(true);
            resetForm();
        } catch (err) {
            console.error(err);
            setErrors({ submit: err.response?.data?.msg || 'Submission failed' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = ['Select Resource Type', 'Enter Resource Details'];

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
            <DialogTitle>Submit a New Resource</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                            What type of resource are you submitting?
                        </Typography>
                        <FormControl fullWidth error={!!errors.resourceType}>
                            <InputLabel>Resource Type</InputLabel>
                            <Select
                                value={resourceType}
                                onChange={e => setResourceType(e.target.value)}
                                label="Resource Type"
                            >
                                <MenuItem value="university">University Exam Resource</MenuItem>
                                <MenuItem value="skill">Skill-Based Resource</MenuItem>
                                <MenuItem value="competitive">Competitive Exam Resource</MenuItem>
                            </Select>
                            {errors.resourceType && (
                                <Typography color="error" variant="caption">
                                    {errors.resourceType}
                                </Typography>
                            )}
                        </FormControl>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box mt={3}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            margin="normal"
                            error={!!errors.title}
                            helperText={errors.title}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={4}
                            error={!!errors.description}
                            helperText={errors.description}
                            required
                        />

                        <TextField
                            fullWidth
                            label="URL"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            margin="normal"
                            error={!!errors.url}
                            helperText={errors.url}
                            required
                        />

                        {resourceType === 'university' && (
                            <>
                                <FormControl fullWidth margin="normal" error={!!errors.university}>
                                    <InputLabel>University</InputLabel>
                                    <Select
                                        name="university"
                                        value={formData.university}
                                        onChange={handleChange}
                                        label="University"
                                        required
                                    >
                                        {universities.map(uni => (
                                            <MenuItem key={uni._id} value={uni._id}>
                                                {uni.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.university && (
                                        <Typography color="error" variant="caption">
                                            {errors.university}
                                        </Typography>
                                    )}
                                </FormControl>

                                <FormControl fullWidth margin="normal" error={!!errors.domain}>
                                    <InputLabel>Domain</InputLabel>
                                    <Select
                                        name="domain"
                                        value={formData.domain}
                                        onChange={handleChange}
                                        label="Domain"
                                        disabled={!formData.university}
                                        required
                                    >
                                        {domains.map(domain => (
                                            <MenuItem key={domain._id} value={domain._id}>
                                                {domain.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.domain && (
                                        <Typography color="error" variant="caption">
                                            {errors.domain}
                                        </Typography>
                                    )}
                                </FormControl>

                                <FormControl fullWidth margin="normal" error={!!errors.subject}>
                                    <InputLabel>Subject</InputLabel>
                                    <Select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        label="Subject"
                                        disabled={!formData.domain}
                                        required
                                    >
                                        {subjects.map(subject => (
                                            <MenuItem key={subject._id} value={subject._id}>
                                                {subject.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.subject && (
                                        <Typography color="error" variant="caption">
                                            {errors.subject}
                                        </Typography>
                                    )}
                                </FormControl>
                            </>
                        )}

                        {resourceType === 'skill' && (
                            <TextField
                                fullWidth
                                label="Skill"
                                name="skill"
                                value={formData.skill}
                                onChange={handleChange}
                                margin="normal"
                                error={!!errors.skill}
                                helperText={errors.skill}
                                required
                            />
                        )}

                        {resourceType === 'competitive' && (
                            <TextField
                                fullWidth
                                label="Exam"
                                name="exam"
                                value={formData.exam}
                                onChange={handleChange}
                                margin="normal"
                                error={!!errors.exam}
                                helperText={errors.exam}
                                required
                            />
                        )}

                        {errors.submit && (
                            <Typography color="error" paragraph>
                                {errors.submit}
                            </Typography>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleBack} disabled={activeStep === 0 || isSubmitting}>
                    Back
                </Button>
                {activeStep === steps.length - 1 ? (
                    <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                ) : (
                    <Button onClick={handleNext} color="primary" variant="contained" disabled={isSubmitting}>
                        Next
                    </Button>
                )}
                <Button onClick={handleClear} color="secondary" variant="outlined" disabled={isSubmitting}>
                    Clear
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ResourceSubmissionForm;