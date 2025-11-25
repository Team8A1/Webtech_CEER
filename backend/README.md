# Google Authentication API - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Required environment variables:
- `GOOGLE_CLIENT_ID`: Get from Google Cloud Console
- `JWT_SECRET`: Generate a strong random secret
- `MONGODB_URI`: Your MongoDB connection string

### 3. Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Add authorized JavaScript origins (e.g., `http://localhost:5173`)
7. Copy the Client ID to `.env`

### 4. Start MongoDB
Make sure MongoDB is running locally or update `MONGODB_URI` with your cloud MongoDB URI.

### 5. Seed Test User (Optional)
Create a test user in MongoDB:
```javascript
{
  "email": "student@kletech.ac.in",
  "name": "Test Student",
  "role": "student",
  "isActive": true
}
```

### 6. Start Server
```bash
node server.js
```

## API Endpoints

### POST `/api/student/auth/google`
Authenticate user with Google ID token

**Request Body:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "student@kletech.ac.in",
      "name": "Student Name",
      "role": "student",
      "profilePicture": "url",
      "lastLogin": "2025-11-23T00:00:00.000Z"
    }
  }
}
```

**Error Response - Invalid Domain (403):**
```json
{
  "success": false,
  "message": "Access denied. Only users with @kletech.ac.in email addresses are allowed.",
  "providedEmail": "user@gmail.com"
}
```

**Error Response - User Not Found (404):**
```json
{
  "success": false,
  "message": "User not registered. Please contact administrator to register your email.",
  "email": "unregistered@kletech.ac.in"
}
```

**Error Response - Invalid Token (401):**
```json
{
  "success": false,
  "message": "Invalid Google ID token",
  "error": "error_details"
}
```

## Frontend Integration Example

```javascript
// Using Google Sign-In button
import { GoogleLogin } from '@react-oauth/google';

function LoginButton() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:5000/api/student/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store JWT token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        // Redirect to dashboard
      } else {
        // Show error message
        alert(data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

## Protected Routes Usage

```javascript
const { protect, authorize } = require('./middleware/authMiddleware');

// Protect route - requires valid JWT
router.get('/profile', protect, getProfile);

// Protect and authorize - requires specific role
router.get('/admin-only', protect, authorize('admin'), adminFunction);
```

## Security Features
- Google ID token verification using official library
- Email domain validation (@kletech.ac.in)
- Database user verification
- JWT token generation with expiration
- Account status checking (isActive)
- Last login tracking
- Role-based access control

## Project Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   └── authMiddleware.js    # JWT verification
├── models/
│   └── User.js             # User schema
├── routes/
│   └── studentAuthRoutes.js # Auth routes
├── utils/
│   └── tokenUtils.js       # JWT utilities
├── .env                    # Environment variables
├── .env.example           # Environment template
└── server.js              # Main server file
```
