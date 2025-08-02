# 🚀 Cached Info Backend API

A comprehensive backend API for the Cached Info platform, built with Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)

## ✨ Features

- **Authentication System** - JWT-based authentication with Google OAuth
- **Resource Management** - CRUD operations for educational resources
- **Search Functionality** - Full-text search across resources
- **User Management** - User registration, login, and profile management
- **Request System** - Resource request submission and tracking
- **Statistics API** - Real-time platform statistics
- **CORS Support** - Cross-origin resource sharing for frontend integration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: bcryptjs for password hashing
- **CORS**: Cross-origin resource sharing
- **Environment**: dotenv for configuration

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 2. Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Configuration

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/cached-info
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/cached-info

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

```bash
# Seed the database with sample data
npm run seed

# Or run the seed script directly
node seedData.js
```

### 5. Start the Server

```bash
# Development mode (with nodemon)
npm run server

# Production mode
npm start

# Run both frontend and backend
npm run dev
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | User registration |
| POST | `/login` | User login |
| POST | `/google` | Google OAuth login |
| GET | `/me` | Get current user |
| POST | `/logout` | User logout |

### Resource Routes (`/api/resources`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all resources |
| POST | `/` | Create new resource |
| GET | `/:id` | Get resource by ID |
| PUT | `/:id` | Update resource |
| DELETE | `/:id` | Delete resource |

### Additional API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/universities` | Get all universities |
| GET | `/api/domains` | Get all domains |
| GET | `/api/subjects` | Get all subjects |
| GET | `/api/search?q=query` | Search resources |
| POST | `/api/requests` | Submit resource request |
| GET | `/api/resources/count` | Get resource count |
| GET | `/api/users/count` | Get user count |
| GET | `/api/requests/count` | Get request count |

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  googleId: String,
  avatar: String,
  role: String,
  createdAt: Date
}
```

### Resource Model
```javascript
{
  title: String,
  description: String,
  url: String,
  type: String, // 'university', 'skill', 'competitive'
  university: ObjectId,
  domain: ObjectId,
  subject: ObjectId,
  skill: String,
  exam: String,
  submittedBy: ObjectId,
  createdAt: Date
}
```

### University Model
```javascript
{
  name: String,
  location: String,
  description: String
}
```

### Domain Model
```javascript
{
  name: String,
  description: String
}
```

### Subject Model
```javascript
{
  name: String,
  description: String
}
```

## 🔧 Available Scripts

```bash
# Start development server
npm run server

# Start production server
npm start

# Run frontend and backend concurrently
npm run dev

# Seed database with sample data
npm run seed

# Run frontend only
npm run client
```

## 🌐 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## 🔒 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error (server errors)

## 📊 Database Seeding

The seed script (`seedData.js`) populates the database with:

- 8 universities (MIT, Stanford, Harvard, etc.)
- 8 domains (Computer Science, Data Science, etc.)
- 10 subjects (JavaScript, Python, React, etc.)
- 6 sample resources

## 🔧 Development

### Project Structure
```
server/
├── models/          # Database models
├── routes/          # API routes
│   └── controllers/ # Route controllers
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── seedData.js      # Database seeding script
└── package.json     # Dependencies and scripts
```

### Adding New Endpoints

1. Create route file in `routes/`
2. Add controller in `routes/controllers/`
3. Import and use in `server.js`
4. Update this README

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=your-frontend-domain
```

### Deployment Platforms
- **Heroku**: Connect GitHub repository
- **Vercel**: Deploy with Vercel CLI
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Deploy with App Platform

## 📞 Support

For questions or issues:
1. Check the API documentation
2. Review error logs
3. Test endpoints with Postman
4. Check MongoDB connection

## 📝 License

This project is licensed under the MIT License. 