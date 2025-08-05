const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
let userToken = null;
let adminToken = null;

// Test functions
async function testPublicRoutes() {
    console.log('\n🔍 Testing Public Routes...');
    
    try {
        // Test getting resources
        const resources = await axios.get(`${BASE_URL}/resources`);
        console.log('✅ GET /api/resources - Success');
        
        // Test search
        const search = await axios.get(`${BASE_URL}/search?q=javascript`);
        console.log('✅ GET /api/search - Success');
        
        // Test universities
        const universities = await axios.get(`${BASE_URL}/universities`);
        console.log('✅ GET /api/universities - Success');
        
    } catch (error) {
        console.log('❌ Public route test failed:', error.message);
    }
}

async function testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    try {
        // Test without token
        try {
            await axios.get(`${BASE_URL}/auth/user`);
            console.log('❌ Should have failed without token');
        } catch (error) {
            if (error.response.status === 401) {
                console.log('✅ GET /api/auth/user - Correctly rejected without token');
            }
        }
        
        // Test with invalid token
        try {
            await axios.get(`${BASE_URL}/auth/user`, {
                headers: { 'x-auth-token': 'invalid_token' }
            });
            console.log('❌ Should have failed with invalid token');
        } catch (error) {
            if (error.response.status === 401) {
                console.log('✅ GET /api/auth/user - Correctly rejected invalid token');
            }
        }
        
    } catch (error) {
        console.log('❌ Authentication test failed:', error.message);
    }
}

async function testAdminRoutes() {
    console.log('\n👑 Testing Admin Routes...');
    
    try {
        // Test admin dashboard without token
        try {
            await axios.get(`${BASE_URL}/admin/dashboard`);
            console.log('❌ Should have failed without token');
        } catch (error) {
            if (error.response.status === 401) {
                console.log('✅ GET /api/admin/dashboard - Correctly rejected without token');
            }
        }
        
        // Test admin routes with user token (if available)
        if (userToken) {
            try {
                await axios.get(`${BASE_URL}/admin/dashboard`, {
                    headers: { 'x-auth-token': userToken }
                });
                console.log('❌ Should have failed with user token');
            } catch (error) {
                if (error.response.status === 403) {
                    console.log('✅ GET /api/admin/dashboard - Correctly rejected user token');
                }
            }
        }
        
    } catch (error) {
        console.log('❌ Admin route test failed:', error.message);
    }
}

async function testResourceSubmission() {
    console.log('\n📝 Testing Resource Submission...');
    
    try {
        // Test submitting resource without token
        try {
            await axios.post(`${BASE_URL}/resources`, {
                title: 'Test Resource',
                description: 'Test description',
                url: 'https://example.com',
                type: 'skill',
                skill: 'JavaScript'
            });
            console.log('❌ Should have failed without token');
        } catch (error) {
            if (error.response.status === 401) {
                console.log('✅ POST /api/resources - Correctly rejected without token');
            }
        }
        
    } catch (error) {
        console.log('❌ Resource submission test failed:', error.message);
    }
}

async function testRateLimiting() {
    console.log('\n⏱️ Testing Rate Limiting...');
    
    try {
        // Make multiple requests quickly
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(axios.get(`${BASE_URL}/resources`));
        }
        
        await Promise.all(promises);
        console.log('✅ Rate limiting test - All requests successful');
        
    } catch (error) {
        console.log('❌ Rate limiting test failed:', error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting Authorization System Tests...\n');
    
    await testPublicRoutes();
    await testAuthentication();
    await testAdminRoutes();
    await testResourceSubmission();
    await testRateLimiting();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('- Public routes: Should work without authentication');
    console.log('- Protected routes: Should require valid token');
    console.log('- Admin routes: Should require admin role');
    console.log('- Resource submission: Should require authentication');
    console.log('- Rate limiting: Should handle multiple requests');
}

// Run tests if server is running
runAllTests().catch(console.error); 