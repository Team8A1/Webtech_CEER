# Environment Configuration

## Backend Setup

1. **Create `.env` file in `backend/` directory:**

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_mongodb_uri

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Allowed Email Domain
ALLOWED_EMAIL_DOMAIN=@kletech.ac.in
```

## Frontend Setup

2. **Update `frontend/src/main.jsx` with your Google Client ID:**

Replace `GOOGLE_CLIENT_ID` in the GoogleOAuthProvider with your actual Google Client ID.

## Google Cloud Console Setup

3. **Configure OAuth 2.0:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (Vite dev server)
     - `http://127.0.0.1:5173`
     - `http://localhost:8000` (Backend)
   - Add authorized redirect URIs:
     - `http://localhost:5173`
     - `http://localhost:8000`

## API Endpoints

### Traditional Login
```
POST /api/student/auth/login
Body: { "email": "student@kletech.ac.in", "password": "password123" }
```

### Google Sign-In
```
POST /api/student/auth/google
Body: { "idToken": "google_id_token" }
```

### Register Student
```
POST /api/student/register
Body: { "email": "student@kletech.ac.in", "name": "Student Name", "password": "optional_password" }
```

## Testing

1. **Start Backend:**
```bash
cd backend
npm start
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Test Login:**
   - Navigate to `http://localhost:5173/login/student`
   - Use email/password login OR Google Sign-In
   - Both methods validate @kletech.ac.in domain
   - Both methods check if user exists in MongoDB
   - Successful login returns JWT token

## Response Format

### Success Response:
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
      "lastLogin": "2025-11-24T00:00:00.000Z"
    }
  }
}
```

### Error Response (Wrong Domain):
```json
{
  "success": false,
  "message": "Access denied. Only users with @kletech.ac.in email addresses are allowed."
}
```

### Error Response (User Not Found):
```json
{
  "success": false,
  "message": "User not registered. Please contact administrator to register your email.",
  "email": "unregistered@kletech.ac.in"
}
```
