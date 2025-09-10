const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Registration validation rules
const registerValidation = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('სახელი უნდა იყოს 2-50 სიმბოლო')
        .matches(/^[ა-ჰa-zA-Z\s]+$/)
        .withMessage('სახელი უნდა შეიცავდეს მხოლოდ ქართულ ან ლათინურ ასოებს'),
    
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('გვარი უნდა იყოს 2-50 სიმბოლო')
        .matches(/^[ა-ჰa-zA-Z\s]+$/)
        .withMessage('გვარი უნდა შეიცავდეს მხოლოდ ქართულ ან ლათინურ ასოებს'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('პაროლი უნდა შეიცავდეს: მცირე ასო, დიდი ასო, ციფრი და სპეციალური სიმბოლო'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('პაროლების დადასტურება არ ემთხვევა');
            }
            return true;
        }),
    
];

// Login validation rules
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი'),
    
    body('password')
        .notEmpty()
        .withMessage('პაროლი სავალდებულოა'),
    
];

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ვალიდაციის შეცდომა',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, password } = req.body;


        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'ამ ელ-ფოსტით მომხმარებელი უკვე რეგისტრირებულია'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'რეგისტრაცია წარმატებით დასრულდა',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    fullName: user.getFullName(),
                    lastLogin: user.lastLogin
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'რეგისტრაციისას მოხდა შეცდომა'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ვალიდაციის შეცდომა',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;


        // Find user and include password for comparison
        const user = await User.findByEmail(email).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'არასწორი ელ-ფოსტა ან პაროლი'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'ანგარიში დეაქტივირებულია'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'არასწორი ელ-ფოსტა ან პაროლი'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'წარმატებით შეხვედით სისტემაში',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    fullName: user.getFullName(),
                    lastLogin: user.lastLogin,
                    preferences: user.preferences,
                    favoriteLocations: user.favoriteLocations
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'შესვლისას მოხდა შეცდომა'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'მომხმარებელი ვერ მოიძებნა'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    fullName: user.getFullName(),
                    lastLogin: user.lastLogin,
                    preferences: user.preferences,
                    favoriteLocations: user.favoriteLocations,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'მომხმარებლის მონაცემების ჩატვირთვისას მოხდა შეცდომა'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'წარმატებით გახვედით სისტემიდან'
    });
});

module.exports = router;