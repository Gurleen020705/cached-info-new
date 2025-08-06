import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allResources, setAllResources] = useState([]);

    // Fetch hierarchical data from Supabase
    const fetchUniversityData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data with relationships
            const { data: universitiesData, error: universitiesError } = await supabase
                .from('universities')
                .select(`
          *,
          domains (
            *,
            subjects (
              *,
              resources (
                *
              )
            )
          )
        `);

            if (universitiesError) throw universitiesError;

            if (!universitiesData || universitiesData.length === 0) {
                setUniversities([]);
                setAllResources([]);
                return;
            }

            // Transform data to match the existing format
            const transformedData = universitiesData.map(university => ({
                _id: university.id,
                name: university.name || 'Unknown University',
                domains: (university.domains || []).map(domain => ({
                    _id: domain.id,
                    name: domain.name || 'Unknown Domain',
                    subjects: (domain.subjects || []).map(subject => ({
                        _id: subject.id,
                        name: subject.name || 'Unknown Subject',
                        resources: (subject.resources || [])
                            .filter(resource => resource && resource.is_approved) // Only approved resources
                            .map(resource => ({
                                _id: resource.id,
                                details: {
                                    title: resource.title || 'Untitled Resource',
                                    description: resource.description || 'No description available',
                                    url: resource.url || '#'
                                },
                                submittedBy: {
                                    name: 'Anonymous' // We'll fetch this separately if needed
                                },
                                dateAdded: resource.created_at || new Date().toISOString()
                            }))
                    }))
                }))
            }));

            setUniversities(transformedData);

            // Create flat resources array for search functionality
            const flatResources = transformedData.reduce((acc, university) => {
                university.domains.forEach(domain => {
                    domain.subjects.forEach(subject => {
                        subject.resources.forEach(resource => {
                            acc.push({
                                _id: `resource_${university._id}_${domain._id}_${subject._id}_${resource._id}`,
                                title: resource.details.title,
                                description: resource.details.description,
                                url: resource.details.url,
                                type: 'university',
                                university: {
                                    name: university.name,
                                    _id: university._id
                                },
                                domain: {
                                    name: domain.name,
                                    _id: domain._id
                                },
                                subject: {
                                    name: subject.name,
                                    _id: subject._id
                                },
                                submittedBy: resource.submittedBy,
                                dateAdded: resource.dateAdded
                            });
                        });
                    });
                });
                return acc;
            }, []);

            setAllResources(flatResources);

        } catch (err) {
            console.error('Error fetching university data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch additional resource types (skills, competitive exams)
    const fetchAdditionalResources = async () => {
        try {
            // For now, we'll skip additional resources to avoid the relationship error
            // You can add this back once you have resources not tied to subjects

            // Example: If you want to fetch resources without subject_id
            // const { data: generalResources, error } = await supabase
            //   .from('resources')
            //   .select('*')
            //   .is('subject_id', null)
            //   .eq('is_approved', true);

            // if (error) throw error;

            // const additionalResources = (generalResources || []).map(resource => ({
            //   _id: resource.id,
            //   title: resource.title || 'Untitled Resource',
            //   description: resource.description || 'No description available',
            //   url: resource.url || '#',
            //   type: resource.type || 'general',
            //   skill: resource.skill || null,
            //   exam: resource.exam || null,
            //   submittedBy: {
            //     name: 'Anonymous'
            //   },
            //   dateAdded: resource.created_at || new Date().toISOString()
            // }));

            // setAllResources(prev => [...prev, ...additionalResources]);

        } catch (err) {
            console.error('Error fetching additional resources:', err);
            // Don't set error for this since it's optional
        }
    };

    // Get stats
    const getStats = async () => {
        try {
            // Get total resources count
            const { count: resourceCount, error: resourceError } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('is_approved', true);

            if (resourceError) {
                console.error('Error fetching resource count:', resourceError);
            }

            // Get total users count
            const { count: userCount, error: userError } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true });

            if (userError) {
                console.error('Error fetching user count:', userError);
            }

            // Get total requests count
            const { count: requestCount, error: requestError } = await supabase
                .from('user_resource_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'fulfilled');

            if (requestError) {
                console.error('Error fetching request count:', requestError);
            }

            return {
                totalResources: resourceCount || 0,
                totalUsers: userCount || 0,
                totalRequests: requestCount || 0
            };
        } catch (err) {
            console.error('Error fetching stats:', err);
            return {
                totalResources: 0,
                totalUsers: 0,
                totalRequests: 0
            };
        }
    };

    // Search resources
    const searchResources = (query, limit = 5) => {
        if (!query || !query.trim()) return [];
        if (!allResources || allResources.length === 0) return [];

        const searchTerm = query.toLowerCase();
        const filteredResults = allResources.filter(resource => {
            if (!resource) return false;

            return (
                (resource.title && resource.title.toLowerCase().includes(searchTerm)) ||
                (resource.description && resource.description.toLowerCase().includes(searchTerm)) ||
                (resource.subject && resource.subject.name && resource.subject.name.toLowerCase().includes(searchTerm)) ||
                (resource.domain && resource.domain.name && resource.domain.name.toLowerCase().includes(searchTerm)) ||
                (resource.university && resource.university.name && resource.university.name.toLowerCase().includes(searchTerm)) ||
                (resource.skill && resource.skill.toLowerCase().includes(searchTerm)) ||
                (resource.exam && resource.exam.toLowerCase().includes(searchTerm))
            );
        });

        return filteredResults.slice(0, limit);
    };

    // Get recent resources
    const getRecentResources = (limit = 6) => {
        if (!allResources || allResources.length === 0) return [];

        return allResources
            .filter(resource => resource && resource.dateAdded)
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, limit);
    };

    // Extract searchable terms for autocomplete
    const extractSearchableTerms = () => {
        const terms = new Set();

        if (!universities || universities.length === 0) {
            // Add common terms even if no universities loaded
            const commonTerms = [
                'algorithms', 'data structures', 'machine learning', 'artificial intelligence',
                'database', 'networking', 'programming', 'software engineering',
                'calculus', 'linear algebra', 'statistics', 'probability',
                'physics', 'chemistry', 'biology', 'mathematics',
                'business', 'finance', 'marketing', 'management',
                'engineering', 'computer science', 'electrical', 'mechanical'
            ];

            commonTerms.forEach(term => {
                terms.add({
                    text: term,
                    type: 'general',
                    category: '🔍 General'
                });
            });

            return Array.from(terms);
        }

        // Add university names
        universities.forEach(university => {
            if (university && university.name) {
                terms.add({
                    text: university.name,
                    type: 'university',
                    category: '🏫 University'
                });

                // Add domain names
                if (university.domains) {
                    university.domains.forEach(domain => {
                        if (domain && domain.name) {
                            terms.add({
                                text: domain.name,
                                type: 'domain',
                                category: '🎯 Domain'
                            });

                            // Add subject names
                            if (domain.subjects) {
                                domain.subjects.forEach(subject => {
                                    if (subject && subject.name) {
                                        terms.add({
                                            text: subject.name,
                                            type: 'subject',
                                            category: '📖 Subject'
                                        });

                                        // Add resource titles
                                        if (subject.resources) {
                                            subject.resources.forEach(resource => {
                                                if (resource && resource.details && resource.details.title) {
                                                    terms.add({
                                                        text: resource.details.title,
                                                        type: 'resource',
                                                        category: '📄 Resource'
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });

        // Add common search terms
        const commonTerms = [
            'algorithms', 'data structures', 'machine learning', 'artificial intelligence',
            'database', 'networking', 'programming', 'software engineering',
            'calculus', 'linear algebra', 'statistics', 'probability',
            'physics', 'chemistry', 'biology', 'mathematics',
            'business', 'finance', 'marketing', 'management',
            'engineering', 'computer science', 'electrical', 'mechanical'
        ];

        commonTerms.forEach(term => {
            terms.add({
                text: term,
                type: 'general',
                category: '🔍 General'
            });
        });

        return Array.from(terms);
    };

    // Initialize data on mount
    useEffect(() => {
        const initializeData = async () => {
            await fetchUniversityData();
            await fetchAdditionalResources();
        };

        initializeData();
    }, []);

    const value = {
        universities,
        allResources,
        loading,
        error,
        searchResources,
        getRecentResources,
        getStats,
        extractSearchableTerms,
        refetchData: fetchUniversityData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);

    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }

    return context;
};