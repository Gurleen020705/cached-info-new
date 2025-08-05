import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourceForm.css';

const ResourceForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        url: '',
        university: '',
        domain: '',
        subject: '',
        skill: '',
        exam: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [domains, setDomains] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Dropdown options
    const resourceTypes = [
        { value: 'university', label: 'University' },
        { value: 'skill', label: 'Skill' },
        { value: 'competitive', label: 'Competitive Exam' }
    ];

    // Fetch universities on component mount
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const res = await axios.get('/api/universities');
                setUniversities(res.data);
            } catch (err) {
                console.error('Error fetching universities:', err);
            }
        };
        fetchUniversities();
    }, []);

    // Fetch domains when university changes
    useEffect(() => {
        if (formData.university) {
            const fetchDomains = async () => {
                try {
                    const res = await axios.get(`/api/universities/${formData.university}/domains`);
                    setDomains(res.data);
                } catch (err) {
                    console.error('Error fetching domains:', err);
                }
            };
            fetchDomains();
        }
    }, [formData.university]);

    // Fetch subjects when domain changes
    useEffect(() => {
        if (formData.domain) {
            const fetchSubjects = async () => {
                try {
                    const res = await axios.get(`/api/domains/${formData.domain}/subjects`);
                    setSubjects(res.data);
                } catch (err) {
                    console.error('Error fetching subjects:', err);
                }
            };
            fetchSubjects();
        }
    }, [formData.domain]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Resource title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        }

        if (!formData.type) {
            newErrors.type = 'Please select a resource type';
        }

        if (!formData.url.trim()) {
            newErrors.url = 'URL is required';
        } else if (!isValidUrl(formData.url)) {
            newErrors.url = 'Please enter a valid URL';
        }

        // Validate based on resource type
        if (formData.type === 'university') {
            if (!formData.university) {
                newErrors.university = 'Please select a university';
            }
            if (!formData.domain) {
                newErrors.domain = 'Please select a domain';
            }
            if (!formData.subject) {
                newErrors.subject = 'Please select a subject';
            }
        } else if (formData.type === 'skill') {
            if (!formData.skill.trim()) {
                newErrors.skill = 'Skill name is required';
            }
        } else if (formData.type === 'competitive') {
            if (!formData.exam.trim()) {
                newErrors.exam = 'Exam name is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Reset dependent fields when type changes
        if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                university: '',
                domain: '',
                subject: '',
                skill: '',
                exam: ''
            }));
            setDomains([]);
            setSubjects([]);
        } else if (name === 'university') {
            setFormData(prev => ({
                ...prev,
                domain: '',
                subject: ''
            }));
            setSubjects([]);
        } else if (name === 'domain') {
            setFormData(prev => ({
                ...prev,
                subject: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data based on resource type
            const submitData = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                url: formData.url
            };

            if (formData.type === 'university') {
                submitData.university = formData.university;
                submitData.domain = formData.domain;
                submitData.subject = formData.subject;
            } else if (formData.type === 'skill') {
                submitData.skill = formData.skill;
            } else if (formData.type === 'competitive') {
                submitData.exam = formData.exam;
            }

            // Send to backend
            await axios.post('/api/resources', submitData, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token') // Add auth token if available
                }
            });

            setSubmitSuccess(true);
            setFormData({
                title: '',
                description: '',
                type: '',
                url: '',
                university: '',
                domain: '',
                subject: '',
                skill: '',
                exam: ''
            });

            // Reset success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Error submitting resource:', error);
            if (error.response?.data?.errors) {
                const serverErrors = {};
                error.response.data.errors.forEach(err => {
                    serverErrors[err.param] = err.msg;
                });
                setErrors(serverErrors);
            } else {
                setErrors(prev => ({
                    ...prev,
                    submit: 'Failed to submit resource. Please try again.'
                }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (name, label, type = 'text', options = null, required = true) => (
        <div className="form-field">
            <label htmlFor={name} className="form-label">
                {label} {required && <span className="required">*</span>}
            </label>

            {type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className={`form-select ${errors[name] ? 'error' : ''}`}
                >
                    <option value="">Select {label}</option>
                    {options.map(option => (
                        <option key={option.value || option._id} value={option.value || option._id}>
                            {option.label || option.name}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    rows={4}
                    className={`form-textarea ${errors[name] ? 'error' : ''}`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className={`form-input ${errors[name] ? 'error' : ''}`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            )}

            {errors[name] && (
                <p className="error-message">{errors[name]}</p>
            )}
        </div>
    );

    return (
        <div className="resource-form-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <h1>Submit a Resource</h1>
                    <p>Share valuable learning resources with the community</p>
                </div>

                {submitSuccess && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <p>Resource submitted successfully!</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="resource-form">
                    {renderField('title', 'Resource Title', 'text')}
                    {renderField('description', 'Description', 'textarea')}
                    {renderField('type', 'Type', 'select', resourceTypes)}
                    {renderField('url', 'Resource URL', 'url')}

                    {formData.type === 'university' && (
                        <>
                            {renderField('university', 'University', 'select', universities)}
                            {formData.university && renderField('domain', 'Domain', 'select', domains)}
                            {formData.domain && renderField('subject', 'Subject', 'select', subjects)}
                        </>
                    )}

                    {formData.type === 'skill' && (
                        renderField('skill', 'Skill Name', 'text')
                    )}

                    {formData.type === 'competitive' && (
                        renderField('exam', 'Exam Name', 'text')
                    )}

                    {errors.submit && (
                        <div className="error-alert">
                            <p>{errors.submit}</p>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    title: '',
                                    description: '',
                                    type: '',
                                    url: '',
                                    university: '',
                                    domain: '',
                                    subject: '',
                                    skill: '',
                                    exam: ''
                                });
                                setErrors({});
                            }}
                            className="btn btn-secondary"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceForm; 