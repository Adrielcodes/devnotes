const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection and models
const connectDB = require('./config/database');
const Note = require('./models/note');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files from public folder

// API Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'DevNotes API is working!', 
        timestamp: new Date().toISOString(),
        database: 'Connected to MongoDB!'
    });
});

// Get all notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 }); // Sort by newest first
        res.json({ success: true, notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new note
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content, tags, category, isImportant } = req.body;
        
        const note = new Note({
            title,
            content,
            tags: tags || [],
            category: category || 'general',
            isImportant: isImportant || false
        });
        
        await note.save();
        res.status(201).json({ success: true, note });
        
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
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
});

module.exports = app;