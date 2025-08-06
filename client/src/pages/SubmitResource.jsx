import React, { useState, useEffect } from 'react';
import './SubmitResource.css';
import dummyData from '../data/dummyData.json';

const SubmitResource = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        url: '',
        university: '',
        domain: '',
        subject: '',
        skillCategory: '',
        skill: '',
        examCategory: '',
        exam: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [domains, setDomains] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [skillCategories, setSkillCategories] = useState([]);
    const [skills, setSkills] = useState([]);
    const [examCategories, setExamCategories] = useState([]);
    const [exams, setExams] = useState([]);

    // Dropdown options
    const resourceTypes = [
        { value: 'university', label: 'University' },
        { value: 'skill', label: 'Skill' },
        { value: 'competitive', label: 'Competitive Exam' }
    ];

    // Dummy skill categories and skills
    const dummySkillCategories = [
        { _id: 'skill_cat_001', name: 'Programming Languages' },
        { _id: 'skill_cat_002', name: 'Web Development' },
        { _id: 'skill_cat_003', name: 'Data Science' },
        { _id: 'skill_cat_004', name: 'Design' }
    ];

    const dummySkills = {
        'skill_cat_001': [
            { _id: 'skill_001', name: 'JavaScript' },
            { _id: 'skill_002', name: 'Python' },
            { _id: 'skill_003', name: 'Java' },
            { _id: 'skill_004', name: 'C++' }
        ],
        'skill_cat_002': [
            { _id: 'skill_005', name: 'React' },
            { _id: 'skill_006', name: 'Angular' },
            { _id: 'skill_007', name: 'Vue.js' },
            { _id: 'skill_008', name: 'Node.js' }
        ],
        'skill_cat_003': [
            { _id: 'skill_009', name: 'Machine Learning' },
            { _id: 'skill_010', name: 'Data Analysis' },
            { _id: 'skill_011', name: 'SQL' },
            { _id: 'skill_012', name: 'R Programming' }
        ],
        'skill_cat_004': [
            { _id: 'skill_013', name: 'UI/UX Design' },
            { _id: 'skill_014', name: 'Graphic Design' },
            { _id: 'skill_015', name: 'Figma' },
            { _id: 'skill_016', name: 'Adobe Creative Suite' }
        ]
    };

    // Dummy exam categories and exams
    const dummyExamCategories = [
        { _id: 'exam_cat_001', name: 'Engineering' },
        { _id: 'exam_cat_002', name: 'Medical' },
        { _id: 'exam_cat_003', name: 'Management' },
        { _id: 'exam_cat_004', name: 'Government Jobs' }
    ];

    const dummyExams = {
        'exam_cat_001': [
            { _id: 'exam_001', name: 'JEE Main' },
            { _id: 'exam_002', name: 'JEE Advanced' },
            { _id: 'exam_003', name: 'GATE' },
            { _id: 'exam_004', name: 'BITSAT' }
        ],
        'exam_cat_002': [
            { _id: 'exam_005', name: 'NEET' },
            { _id: 'exam_006', name: 'AIIMS' },
            { _id: 'exam_007', name: 'JIPMER' }
        ],
        'exam_cat_003': [
            { _id: 'exam_008', name: 'CAT' },
            { _id: 'exam_009', name: 'XAT' },
            { _id: 'exam_010', name: 'GMAT' },
            { _id: 'exam_011', name: 'GRE' }
        ],
        'exam_cat_004': [
            { _id: 'exam_012', name: 'UPSC Civil Services' },
            { _id: 'exam_013', name: 'SSC CGL' },
            { _id: 'exam_014', name: 'Banking PO' },
            { _id: 'exam_015', name: 'Railway Recruitment' }
        ]
    };

    // Load initial data on component mount
    useEffect(() => {
        setUniversities(dummyData.universities);
        setSkillCategories(dummySkillCategories);
        setExamCategories(dummyExamCategories);
    }, []);

    // Load domains when university changes
    useEffect(() => {
        if (formData.university) {
            const selectedUniversity = dummyData.universities.find(uni => uni._id === formData.university);
            if (selectedUniversity) {
                setDomains(selectedUniversity.domains);
            }
        } else {
            setDomains([]);
        }
    }, [formData.university]);

    // Load subjects when domain changes
    useEffect(() => {
        if (formData.domain) {
            const selectedUniversity = dummyData.universities.find(uni => uni._id === formData.university);
            if (selectedUniversity) {
                const selectedDomain = selectedUniversity.domains.find(domain => domain._id === formData.domain);
                if (selectedDomain) {
                    setSubjects(selectedDomain.subjects);
                }
            }
        } else {
            setSubjects([]);
        }
    }, [formData.domain, formData.university]);

    // Load skills when skill category changes
    useEffect(() => {
        if (formData.skillCategory) {
            setSkills(dummySkills[formData.skillCategory] || []);
        } else {
            setSkills([]);
        }
    }, [formData.skillCategory]);

    // Load exams when exam category changes
    useEffect(() => {
        if (formData.examCategory) {
            setExams(dummyExams[formData.examCategory] || []);
        } else {
            setExams([]);
        }
    }, [formData.examCategory]);

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
            if (!formData.skillCategory) {
                newErrors.skillCategory = 'Please select a skill category';
            }
            if (!formData.skill) {
                newErrors.skill = 'Please select a skill';
            }
        } else if (formData.type === 'competitive') {
            if (!formData.examCategory) {
                newErrors.examCategory = 'Please select an exam category';
            }
            if (!formData.exam) {
                newErrors.exam = 'Please select an exam';
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
                skillCategory: '',
                skill: '',
                examCategory: '',
                exam: ''
            }));
            setDomains([]);
            setSubjects([]);
            setSkills([]);
            setExams([]);
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
        } else if (name === 'skillCategory') {
            setFormData(prev => ({
                ...prev,
                skill: ''
            }));
        } else if (name === 'examCategory') {
            setFormData(prev => ({
                ...prev,
                exam: ''
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
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Prepare data based on resource type
            const submitData = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                url: formData.url,
                id: Date.now().toString() // Generate simple ID
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

            // Add to dummy data (simulate saving)
            dummyData.submittedResources.push(submitData);
            console.log('Resource submitted:', submitData);
            console.log('All submitted resources:', dummyData.submittedResources);

            setSubmitSuccess(true);
            setFormData({
                title: '',
                description: '',
                type: '',
                url: '',
                university: '',
                domain: '',
                subject: '',
                skillCategory: '',
                skill: '',
                examCategory: '',
                exam: ''
            });

            // Reset success message after 3 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Error submitting resource:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Failed to submit resource. Please try again.'
            }));
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
                        <>
                            {renderField('skillCategory', 'Skill Category', 'select', skillCategories)}
                            {formData.skillCategory && renderField('skill', 'Skill', 'select', skills)}
                        </>
                    )}

                    {formData.type === 'competitive' && (
                        <>
                            {renderField('examCategory', 'Exam Category', 'select', examCategories)}
                            {formData.examCategory && renderField('exam', 'Exam', 'select', exams)}
                        </>
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
                                    skillCategory: '',
                                    skill: '',
                                    examCategory: '',
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

export default SubmitResource;