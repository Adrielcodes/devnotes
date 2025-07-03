# 🧑‍💻 DevNotes

A modern, secure developer notebook application with MySQL backend and beautiful UI.

## ✨ Features

- **🔐 Secure Authentication**: User registration and login with password hashing
- **💾 MySQL Database**: Robust data storage with user-specific notes
- **🎨 Beautiful UI**: Modern, responsive design with smooth animations
- **📝 Rich Note Taking**: Create, edit, and organize developer notes
- **🏷️ Custom Categories**: Add any category you want (JavaScript, React, DevOps, etc.)
- **⭐ Important Notes**: Mark notes as important for quick access
- **🔒 Remember Me**: Stay logged in between sessions
- **📊 Statistics**: View your note statistics and overview
- **⌨️ Keyboard Shortcuts**: Quick actions with keyboard shortcuts
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd devnotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL**
   ```bash
   # Start MySQL service
   brew services start mysql
   
   # Create database
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS devnotes;"
   ```

4. **Configure environment variables**
   ```bash
   # Copy .env.example to .env and update values
   cp .env.example .env
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
devnotes/
├── config/
│   └── mysql.js          # Database configuration
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   └── auth.js           # Authentication routes
├── public/
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styles and animations
│   └── script.js         # Frontend JavaScript
├── server.js             # Express server
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=devnotes

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Database Schema

The application automatically creates these tables:

- **users**: User accounts with hashed passwords
- **notes**: User notes with categories and metadata
- **sessions**: Remember me functionality

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "developer",
  "password": "securepassword123"
}
```

**Response:**
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

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "username": "developer",
  "password": "securepassword123",
  "rememberMe": true
}
```

#### POST `/api/auth/logout`
Logout and clear session.

#### GET `/api/auth/status`
Check authentication status.

### Notes Endpoints

#### GET `/api/notes`
Get all notes for the authenticated user.

**Response:**
```json
{
  "success": true,
  "notes": [
    {
      "id": 1,
      "user_id": 1,
      "title": "React Hooks",
      "content": "useState and useEffect examples...",
      "category": "react",
      "is_important": true,
      "created_at": "2025-07-03T21:30:34.000Z"
    }
  ]
}
```

#### POST `/api/notes`
Create a new note.

**Request Body:**
```json
{
  "title": "Note Title",
  "content": "Note content...",
  "category": "javascript",
  "isImportant": false
}
```

#### DELETE `/api/notes/:id`
Delete a specific note.

## 🎨 Frontend Features

### Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Save note
- **Escape**: Clear form

### Categories

The application supports any custom category. Popular examples:
- Programming Languages: JavaScript, Python, Java, C#, etc.
- Frameworks: React, Vue, Angular, Django, Flask, etc.
- Databases: MySQL, PostgreSQL, MongoDB, Redis, etc.
- DevOps: Docker, Kubernetes, AWS, Azure, etc.
- Tools: Git, VS Code, Terminal, etc.

### UI Components

- **Loading Animation**: Beautiful intro with particles
- **Authentication Forms**: Clean login/register interface
- **Note Cards**: Responsive cards with category colors
- **Statistics**: Real-time note statistics
- **Responsive Design**: Works on all screen sizes

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: Secure session handling
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: SameSite cookies
- **Input Validation**: Server-side validation

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

### Database Management

```bash
# Connect to MySQL
mysql -u root devnotes

# View tables
SHOW TABLES;

# View users
SELECT * FROM users;

# View notes
SELECT * FROM notes;
```

### File Structure Guidelines

- **Backend**: MVC pattern with clear separation
- **Frontend**: Modular JavaScript with clear sections
- **Styling**: CSS custom properties for theming
- **Database**: Normalized schema with foreign keys

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```env
   NODE_ENV=production
   SESSION_SECRET=your-production-secret
   DB_PASSWORD=your-production-password
   ```

2. **Database**
   - Use a production MySQL instance
   - Set up proper backups
   - Configure connection pooling

3. **Server**
   - Use a process manager (PM2)
   - Set up reverse proxy (Nginx)
   - Configure SSL certificates

### Example PM2 Configuration

```json
{
  "name": "devnotes",
  "script": "server.js",
  "instances": "max",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify MySQL is running
3. Check environment variables
4. Ensure all dependencies are installed

## 🎯 Roadmap

- [ ] Note search functionality
- [ ] Note tags and filtering
- [ ] Note sharing between users
- [ ] Markdown support
- [ ] File attachments
- [ ] Note templates
- [ ] Export functionality
- [ ] Dark/light theme toggle

---

**Built with ❤️ for developers**