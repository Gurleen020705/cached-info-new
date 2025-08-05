# 🔐 Authorization System Documentation

## Overview

This backend implements a comprehensive authorization system using JWT (JSON Web Tokens) with role-based access control (RBAC). The system supports Google OAuth authentication and provides different levels of access based on user roles.

## 🔑 Authentication Flow

### 1. Google OAuth Login
```
User clicks Google Login → Frontend gets Google token → Backend verifies token → Creates/updates user → Returns JWT
```

### 2. JWT Token Structure
```javascript
{
  "user": {
    "id": "user_id_here",
    "role": "user" // or "admin"
  }
}
```

**Token Expiration**: 7 days

## 🛡️ Authorization Middleware

### 1. Basic Authentication (`authMiddleware`)
- **Purpose**: Verifies JWT token and adds user to request
- **Usage**: `authMiddleware`
- **Headers Required**: `x-auth-token`
- **Response**: 401 if no token or invalid token

```javascript
// Example usage
router.get('/protected', authMiddleware, (req, res) => {
  // req.user contains decoded token data
  res.json({ user: req.user });
});
```

### 2. Admin Authorization (`authMiddleware.adminAuth`)
- **Purpose**: Ensures user is authenticated AND has admin role
- **Usage**: `authMiddleware.adminAuth`
- **Access**: Admin users only
- **Response**: 403 if not admin, 401 if not authenticated

```javascript
// Example usage
router.get('/admin/dashboard', authMiddleware.adminAuth, (req, res) => {
  // req.currentUser contains full user object from database
  res.json({ admin: req.currentUser });
});
```

### 3. Resource Owner Authorization (`authMiddleware.resourceOwnerOrAdmin`)
- **Purpose**: Allows resource owners or admins to modify resources
- **Usage**: `authMiddleware.resourceOwnerOrAdmin`
- **Access**: Resource owner OR admin
- **Response**: 403 if not owner and not admin

```javascript
// Example usage
router.put('/resources/:id', authMiddleware.resourceOwnerOrAdmin, (req, res) => {
  // req.resource contains the resource being modified
  // req.currentUser contains the authenticated user
});
```

### 4. Optional Authentication (`authMiddleware.optionalAuth`)
- **Purpose**: Adds user data if token exists, but doesn't fail if no token
- **Usage**: `authMiddleware.optionalAuth`
- **Access**: Any user (authenticated or not)
- **Response**: Continues with or without user data

```javascript
// Example usage
router.get('/public-data', authMiddleware.optionalAuth, (req, res) => {
  // req.user might be null or contain user data
  const isLoggedIn = !!req.user;
  res.json({ data: 'public', isLoggedIn });
});
```

## 👥 User Roles

### 1. User Role (`user`)
- **Permissions**:
  - Submit new resources (pending approval)
  - View approved resources
  - Save resources to favorites
  - Submit resource requests
  - Edit own resources (if implemented)

### 2. Admin Role (`admin`)
- **Permissions**:
  - All user permissions
  - Approve/reject resources
  - Delete any resource
  - Manage users (change roles)
  - Add/edit universities, domains, subjects
  - View admin dashboard
  - Access all statistics

## 🔒 Protected Routes

### Public Routes (No Authentication Required)
```
GET  /api/resources          - Get all approved resources
GET  /api/search            - Search resources
GET  /api/universities      - Get universities list
GET  /api/domains          - Get domains list
GET  /api/subjects         - Get subjects list
POST /api/requests         - Submit resource request
```

### User Routes (Authentication Required)
```
POST /api/auth/google      - Google OAuth login
GET  /api/auth/user       - Get current user data
POST /api/resources       - Submit new resource
```

### Admin Routes (Admin Authentication Required)
```
GET  /api/admin/dashboard              - Admin dashboard stats
GET  /api/admin/resources/pending      - Get pending resources
PUT  /api/admin/resources/:id/approve  - Approve resource
DELETE /api/admin/resources/:id        - Delete resource
GET  /api/admin/users                  - Get all users
PUT  /api/admin/users/:id/role        - Update user role
POST /api/admin/universities          - Add university
POST /api/admin/domains               - Add domain
POST /api/admin/subjects              - Add subject
```

## 🚀 Implementation Examples

### 1. Frontend Token Storage
```javascript
// After successful login
localStorage.setItem('token', response.data.token);
```

### 2. Frontend API Calls
```javascript
// Making authenticated requests
const token = localStorage.getItem('token');
const response = await axios.get('/api/auth/user', {
  headers: {
    'x-auth-token': token
  }
});
```

### 3. Route Protection
```javascript
// Protect admin routes
router.use('/admin', authMiddleware.adminAuth);

// Protect specific routes
router.get('/admin/dashboard', authMiddleware.adminAuth, dashboardController);
```

### 4. Error Handling
```javascript
// Handle authentication errors
if (response.status === 401) {
  // Token expired or invalid
  localStorage.removeItem('token');
  redirectToLogin();
}

if (response.status === 403) {
  // Insufficient permissions
  showError('Access denied');
}
```

## 🔧 Security Features

### 1. JWT Security
- **Secret Key**: Stored in environment variables
- **Expiration**: 7 days
- **Algorithm**: HS256 (HMAC SHA256)

### 2. Role Verification
- **Database Check**: Admin middleware verifies role in database
- **Real-time**: Role changes take effect immediately
- **Secure**: Cannot bypass role checks

### 3. Resource Ownership
- **Ownership Check**: Users can only modify their own resources
- **Admin Override**: Admins can modify any resource
- **Validation**: Server-side ownership verification

### 4. Rate Limiting
```javascript
// Basic rate limiting (100 requests per 15 minutes)
app.use('/api/', authMiddleware.rateLimiter(100, 15 * 60 * 1000));
```

## 🛠️ Setup Instructions

### 1. Environment Variables
```env
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 2. Testing Authorization
```bash
# Test admin access
curl -H "x-auth-token: YOUR_JWT_TOKEN" \
     http://localhost:5000/api/admin/dashboard

# Test user access
curl -H "x-auth-token: YOUR_JWT_TOKEN" \
     http://localhost:5000/api/auth/user
```

### 3. Creating Admin User
```javascript
// In MongoDB shell or through admin route
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

## 📝 Best Practices

### 1. Token Management
- Store tokens securely (localStorage/sessionStorage)
- Clear tokens on logout
- Handle token expiration gracefully

### 2. Error Handling
- Always check response status codes
- Provide meaningful error messages
- Log authentication failures

### 3. Security
- Never expose JWT secret
- Use HTTPS in production
- Implement proper CORS settings
- Validate all inputs

### 4. Performance
- Use database indexes for user lookups
- Cache frequently accessed data
- Implement proper error logging

## 🔍 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if token is sent in header
   - Verify token hasn't expired
   - Ensure JWT_SECRET is correct

2. **403 Forbidden**
   - Verify user has required role
   - Check if resource ownership is correct
   - Ensure admin privileges

3. **Token Expired**
   - Implement token refresh logic
   - Redirect to login page
   - Clear stored tokens

4. **Google OAuth Issues**
   - Verify GOOGLE_CLIENT_ID is correct
   - Check CORS settings
   - Ensure Google OAuth is properly configured 