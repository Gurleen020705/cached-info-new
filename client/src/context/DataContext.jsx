import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allResources, setAllResources] = useState([]);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Keys for localStorage
    const STORAGE_KEYS = {
        UNIVERSITIES: 'cachedinfo_universities',
        RESOURCES: 'cachedinfo_resources',
        LAST_FETCH: 'cachedinfo_last_fetch',
        INITIAL_LOAD: 'cachedinfo_initial_load'
    };

    // Check if data is fresh (less than 24 hours old)
    const isDataFresh = () => {
        const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
        if (!lastFetch) return false;

        const twentyFourHours = 24 * 60 * 60 * 1000;
        return (Date.now() - parseInt(lastFetch)) < twentyFourHours;
    };

    // Load data from localStorage
    const loadFromStorage = () => {
        try {
            const storedUniversities = localStorage.getItem(STORAGE_KEYS.UNIVERSITIES);
            const storedResources = localStorage.getItem(STORAGE_KEYS.RESOURCES);

            if (storedUniversities && storedResources) {
                const universities = JSON.parse(storedUniversities);
                const resources = JSON.parse(storedResources);

                setUniversities(universities);
                setAllResources(resources);
                return true;
            }
        } catch (error) {
            console.error('Error loading data from storage:', error);
        }
        return false;
    };

    // Save data to localStorage
    const saveToStorage = (universities, resources) => {
        try {
            localStorage.setItem(STORAGE_KEYS.UNIVERSITIES, JSON.stringify(universities));
            localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
            localStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
            localStorage.setItem(STORAGE_KEYS.INITIAL_LOAD, 'true');
        } catch (error) {
            console.error('Error saving data to storage:', error);
        }
    };

    // Fetch fresh data from Supabase
    const fetchUniversityData = async () => {
        try {
            setError(null);

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

            if (universitiesError) {
                console.error('Universities fetch error:', universitiesError);
                throw universitiesError;
            }

            if (!universitiesData || universitiesData.length === 0) {
                const emptyData = [];
                setUniversities(emptyData);
                setAllResources(emptyData);
                saveToStorage(emptyData, emptyData);
                return { universities: emptyData, resources: emptyData };
            }

            // Transform data to match existing format
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
                            .filter(resource => resource && resource.is_approved)
                            .map(resource => ({
                                _id: resource.id,
                                details: {
                                    title: resource.title || 'Untitled Resource',
                                    description: resource.description || 'No description available',
                                    url: resource.url || '#'
                                },
                                submittedBy: {
                                    name: 'Anonymous'
                                },
                                dateAdded: resource.created_at || new Date().toISOString()
                            }))
                    }))
                }))
            }));

            // Create flat resources array
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

            setUniversities(transformedData);
            setAllResources(flatResources);

            // Save to storage
            saveToStorage(transformedData, flatResources);

            return { universities: transformedData, resources: flatResources };

        } catch (err) {
            console.error('Error fetching university data:', err);
            setError(err.message);
            throw err;
        }
    };

    // Initialize data on app start
    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);

                // Check if we have initial load completed before
                const hasInitialLoad = localStorage.getItem(STORAGE_KEYS.INITIAL_LOAD);

                // Try to load from storage first
                const hasStoredData = loadFromStorage();

                if (hasStoredData && isDataFresh() && hasInitialLoad) {
                    // Use cached data if fresh
                    console.log('Using cached data');
                    setInitialLoadComplete(true);
                } else {
                    // Fetch fresh data
                    console.log('Fetching fresh data');
                    await fetchUniversityData();
                    setInitialLoadComplete(true);
                }
            } catch (error) {
                console.error('Failed to initialize data:', error);

                // Try to use cached data as fallback
                const hasStoredData = loadFromStorage();
                if (hasStoredData) {
                    console.log('Using cached data as fallback');
                    setInitialLoadComplete(true);
                } else {
                    setError('Failed to load resources. Please refresh the page.');
                }
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    // Get stats
    const getStats = async () => {
        try {
            const { count: resourceCount, error: resourceError } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('is_approved', true);

            const { count: userCount, error: userError } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true });

            const { count: requestCount, error: requestError } = await supabase
                .from('user_resource_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'fulfilled');

            return {
                totalResources: resourceCount || allResources.length || 0,
                totalUsers: userCount || 0,
                totalRequests: requestCount || 0
            };
        } catch (err) {
            console.error('Error fetching stats:', err);
            return {
                totalResources: allResources.length || 0,
                totalUsers: 0,
                totalRequests: 0
            };
        }
    };

    // Search resources
    const searchResources = (query, limit = 5) => {
        if (!query || !query.trim() || !allResources || allResources.length === 0) {
            return [];
        }

        const searchTerm = query.toLowerCase();
        const filteredResults = allResources.filter(resource => {
            if (!resource) return false;

            return (
                (resource.title && resource.title.toLowerCase().includes(searchTerm)) ||
                (resource.description && resource.description.toLowerCase().includes(searchTerm)) ||
                (resource.subject && resource.subject.name && resource.subject.name.toLowerCase().includes(searchTerm)) ||
                (resource.domain && resource.domain.name && resource.domain.name.toLowerCase().includes(searchTerm)) ||
                (resource.university && resource.university.name && resource.university.name.toLowerCase().includes(searchTerm))
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

    // Extract searchable terms
    const extractSearchableTerms = () => {
        const terms = new Set();

        if (!universities || universities.length === 0) {
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

        // Add university, domain, subject names
        universities.forEach(university => {
            if (university && university.name) {
                terms.add({
                    text: university.name,
                    type: 'university',
                    category: '🏫 University'
                });

                if (university.domains) {
                    university.domains.forEach(domain => {
                        if (domain && domain.name) {
                            terms.add({
                                text: domain.name,
                                type: 'domain',
                                category: '🎯 Domain'
                            });

                            if (domain.subjects) {
                                domain.subjects.forEach(subject => {
                                    if (subject && subject.name) {
                                        terms.add({
                                            text: subject.name,
                                            type: 'subject',
                                            category: '📖 Subject'
                                        });

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

        return Array.from(terms);
    };

    // Force refresh data
    const refreshData = async () => {
        try {
            setLoading(true);
            setError(null);
            await fetchUniversityData();
        } catch (error) {
            console.error('Error refreshing data:', error);
            setError('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    // Clear cached data
    const clearCache = () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        setUniversities([]);
        setAllResources([]);
        setInitialLoadComplete(false);
    };

    const value = {
        universities,
        allResources,
        loading,
        error,
        initialLoadComplete,
        searchResources,
        getRecentResources,
        getStats,
        extractSearchableTerms,
        refreshData,
        clearCache,
        refetchData: fetchUniversityData // Keep for backward compatibility
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