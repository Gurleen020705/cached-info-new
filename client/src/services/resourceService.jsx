import axios from 'axios';

const API_URL = '/api/resources';

// Get all resources
export const getResources = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Get single resource
export const getResource = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Submit new resource
export const submitResource = async (resourceData, token) => {
    const config = {
        headers: {
            'x-auth-token': token
        }
    };
    const response = await axios.post(API_URL, resourceData, config);
    return response.data;
};

// Save resource to user's list
export const saveResource = async (resourceId, token) => {
    const config = {
        headers: {
            'x-auth-token': token
        }
    };
    const response = await axios.put(
        `/api/users/save/${resourceId}`,
        {},
        config
    );
    return response.data;
};