# DevNotes API Documentation

## Overview

The DevNotes API provides endpoints for user authentication and note management. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:3000/api`

## Authentication

Most endpoints require authentication. Include session cookies or use the "Remember Me" functionality for persistent authentication.

### Session Management

- Sessions are managed via HTTP-only cookies
- Session timeout: 24 hours
- "Remember Me" extends session to 30 days

## Endpoints

### Authentication Endpoints

#### POST `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-50 characters)",
  "password": "string (minimum 6 characters)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "developer"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or username already exists
- `500 Internal Server Error`: Server error

#### POST `/auth/login`

Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": "boolean (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "developer"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing credentials
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

#### POST `/auth/logout`

Logout user and clear session.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET `/auth/status`

Check current authentication status.

**Response (200 OK):**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "developer"
  }
}
```

### Notes Endpoints

#### GET `/notes`

Retrieve all notes for the authenticated user.

**Headers:**
- `Cookie`: Session cookie (automatic)

**Response (200 OK):**
```json
{
  "success": true,
  "notes": [
    {
      "id": 1,
      "user_id": 1,
      "title": "React Hooks Tutorial",
      "content": "useState and useEffect examples...",
      "tags": ["react", "hooks", "tutorial"],
      "category": "react",
      "is_important": true,
      "created_at": "2025-07-03T21:30:34.000Z",
      "updated_at": "2025-07-03T21:30:34.000Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### POST `/notes`

Create a new note.

**Request Body:**
```json
{
  "title": "string (required)",
  "content": "string (required)",
  "category": "string (optional, default: 'general')",
  "isImportant": "boolean (optional, default: false)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "note": {
    "id": 2,
    "user_id": 1,
    "title": "New Note",
    "content": "Note content...",
    "tags": [],
    "category": "general",
    "is_important": false,
    "created_at": "2025-07-03T22:15:00.000Z",
    "updated_at": "2025-07-03T22:15:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### DELETE `/notes/:id`

Delete a specific note.

**Parameters:**
- `id`: Note ID (integer)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Note not found or not owned by user
- `500 Internal Server Error`: Server error

### Utility Endpoints

#### GET `/test`

Test API connectivity and status.

**Response (200 OK):**
```json
{
  "message": "DevNotes API is working!",
  "timestamp": "2025-07-03T22:15:00.000Z",
  "database": "Connected to MySQL!",
  "authenticated": true
}
```

## Data Models

### User

```json
{
  "id": "integer (auto-increment)",
  "username": "string (unique, 3-50 characters)",
  "password": "string (hashed with bcrypt)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Note

```json
{
  "id": "integer (auto-increment)",
  "user_id": "integer (foreign key to users.id)",
  "title": "string (1-100 characters)",
  "content": "text",
  "tags": "json array",
  "category": "string (50 characters)",
  "is_important": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Session

```json
{
  "id": "string (128 characters)",
  "user_id": "integer (foreign key to users.id)",
  "expires_at": "timestamp",
  "created_at": "timestamp"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length: 6 characters
- No password complexity requirements (can be enhanced)

### Session Security
- Sessions use HTTP-only cookies
- Secure flag enabled in production
- SameSite=strict for CSRF protection
- Session timeout: 24 hours

### Input Validation
- Server-side validation for all inputs
- SQL injection protection via parameterized queries
- XSS protection via input sanitization

### Rate Limiting
- Not currently implemented (can be added with express-rate-limit)

## Examples

### Complete Authentication Flow

```javascript
// 1. Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username: 'developer',
    password: 'securepass123'
  })
});

// 2. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username: 'developer',
    password: 'securepass123',
    rememberMe: true
  })
});

// 3. Create note
const noteResponse = await fetch('/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    title: 'API Documentation',
    content: 'This is a test note',
    category: 'documentation',
    isImportant: true
  })
});

// 4. Get all notes
const notesResponse = await fetch('/api/notes', {
  credentials: 'include'
});

// 5. Logout
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
```

### Error Handling Example

```javascript
try {
  const response = await fetch('/api/notes', {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  console.log('Notes:', data.notes);
  
} catch (error) {
  console.error('Error:', error.message);
}
```

## Development Notes

### Database Schema

The application automatically creates the required tables on startup:

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  tags JSON,
  category VARCHAR(50) DEFAULT 'general',
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Environment Variables

Required environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=devnotes
SESSION_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
``` 