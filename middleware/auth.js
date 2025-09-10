const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'წვდომა უარყოფილია - ტოკენი საჭიროა'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ტოკენი არასწორია - მომხმარებელი ვერ მოიძებნა'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'ანგარიში დეაქტივირებულია'
            });
        }

        // Add user to request
        req.user = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'არასწორი ტოკენი'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'ტოკენის ვადა ამოიწურა'
            });
        }

        res.status(500).json({
            success: false,
            message: 'ავტორიზაციისას მოხდა შეცდომა'
        });
    }
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
            req.user = {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};