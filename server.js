const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import MySQL database connection
const { pool, initializeDatabase, testConnection } = require('./config/mysql');
const { checkRememberMe, requireAuth } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize MySQL database
const initializeApp = async () => {
    try {
        // Test database connection
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Failed to connect to MySQL. Please check your database configuration.');
            process.exit(1);
        }
        
        // Initialize database tables
        await initializeDatabase();
        console.log('✅ Database initialization complete');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

// Initialize the app
initializeApp();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'devnotes-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    }
}));

// Check "Remember Me" cookie before other middleware
app.use(checkRememberMe);

// Routes
app.use('/api/auth', authRoutes);

// API Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'DevNotes API is working!', 
        timestamp: new Date().toISOString(),
        database: 'Connected to MySQL!',
        authenticated: !!req.session.userId
    });
});

// Get all notes (protected route)
app.get('/api/notes', requireAuth, async (req, res) => {
    try {
        const [notes] = await pool.execute(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, notes });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new note (protected route)
app.post('/api/notes', requireAuth, async (req, res) => {
    try {
        const { title, content, tags, category, isImportant } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO notes (user_id, title, content, tags, category, is_important) VALUES (?, ?, ?, ?, ?, ?)',
            [
                req.user.id,
                title,
                content,
                JSON.stringify(tags || []),
                category || 'general',
                isImportant || false
            ]
        );
        
        const [newNote] = await pool.execute(
            'SELECT * FROM notes WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({ success: true, note: newNote[0] });
        
    } catch (error) {
        console.error('Create note error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete a note (protected route)
app.delete('/api/notes/:id', requireAuth, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM notes WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }
        
        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 DevNotes server running on http://localhost:${PORT}`);
    console.log(`📝 Ready to take some notes!`);
    console.log(`🔐 Authentication system enabled`);
});

module.exports = app;