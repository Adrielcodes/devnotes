const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/mysql');
const { hashPassword, comparePassword, generateSessionId } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username must be between 3 and 50 characters' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }
        
        // Check if username already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }
        
        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const [result] = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );
        
        // Set session
        req.session.userId = result.insertId;
        
        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            user: { id: result.insertId, username }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        // Find user
        const [users] = await pool.execute(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
        
        const user = users[0];
        
        // Verify password
        const isValidPassword = await comparePassword(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
        
        // Set session
        req.session.userId = user.id;
        
        // Handle "Remember Me"
        if (rememberMe) {
            const sessionId = generateSessionId();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
            
            await pool.execute(
                'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
                [sessionId, user.id, expiresAt]
            );
            
            res.cookie('rememberMe', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'strict'
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: { id: user.id, username: user.username }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
        });
    }
});

// Logout user
router.post('/logout', async (req, res) => {
    try {
        // Clear remember me cookie if exists
        if (req.cookies.rememberMe) {
            await pool.execute(
                'DELETE FROM sessions WHERE id = ?',
                [req.cookies.rememberMe]
            );
            res.clearCookie('rememberMe');
        }
        
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Logout failed' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Logout successful' 
            });
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Logout failed' 
        });
    }
});

// Check authentication status
router.get('/status', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            success: true, 
            authenticated: true,
            user: req.user || { id: req.session.userId }
        });
    } else {
        res.json({ 
            success: true, 
            authenticated: false 
        });
    }
});

module.exports = router; 