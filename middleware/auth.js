const bcrypt = require('bcryptjs');
const { pool } = require('../config/mysql');

// Middleware to check if user is authenticated
const requireAuth = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        
        // Verify user still exists in database
        const [users] = await pool.execute(
            'SELECT id, username FROM users WHERE id = ?',
            [req.session.userId]
        );
        
        if (users.length === 0) {
            req.session.destroy();
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
};

// Middleware to check "Remember Me" cookie
const checkRememberMe = async (req, res, next) => {
    try {
        if (!req.session.userId && req.cookies.rememberMe) {
            const sessionId = req.cookies.rememberMe;
            
            // Check if session exists and is not expired
            const [sessions] = await pool.execute(
                'SELECT user_id FROM sessions WHERE id = ? AND expires_at > NOW()',
                [sessionId]
            );
            
            if (sessions.length > 0) {
                req.session.userId = sessions[0].user_id;
                
                // Get user info
                const [users] = await pool.execute(
                    'SELECT id, username FROM users WHERE id = ?',
                    [sessions[0].user_id]
                );
                
                if (users.length > 0) {
                    req.user = users[0];
                }
            } else {
                // Clear expired cookie
                res.clearCookie('rememberMe');
            }
        }
        next();
    } catch (error) {
        console.error('Remember me check error:', error);
        next();
    }
};

// Hash password utility
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password utility
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate session ID utility
const generateSessionId = () => {
    return require('crypto').randomBytes(64).toString('hex');
};

module.exports = {
    requireAuth,
    checkRememberMe,
    hashPassword,
    comparePassword,
    generateSessionId
}; 