const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/favorites
// @desc    Get user's favorite locations
// @access  Private
router.get('/favorites', authenticateToken, async (req, res) => {
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
                favorites: user.favoriteLocations
            }
        });

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'ფავორიტების ჩატვირთვისას მოხდა შეცდომა'
        });
    }
});

// @route   POST /api/user/favorites
// @desc    Add location to favorites
// @access  Private
router.post('/favorites', [
    authenticateToken,
    body('name').trim().notEmpty().withMessage('ლოკაციის სახელი სავალდებულოა'),
    body('type').trim().notEmpty().withMessage('ლოკაციის ტიპი სავალდებულოა'),
    body('lat').isNumeric().withMessage('გრძედი უნდა იყოს რიცხვი'),
    body('lon').isNumeric().withMessage('განედი უნდა იყოს რიცხვი')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ვალიდაციის შეცდომა',
                errors: errors.array()
            });
        }

        const { name, type, lat, lon } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'მომხმარებელი ვერ მოიძებნა'
            });
        }

        // Check if location already exists in favorites
        const exists = user.favoriteLocations.some(
            fav => Math.abs(fav.lat - lat) < 0.001 && Math.abs(fav.lon - lon) < 0.001
        );

        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'ეს ლოკაცია უკვე დამატებულია ფავორიტებში'
            });
        }

        const newLocation = {
            name: name.trim(),
            type: type.trim(),
            lat: parseFloat(lat),
            lon: parseFloat(lon)
        };

        user.favoriteLocations.push(newLocation);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'ლოკაცია წარმატებით დაემატა ფავორიტებში',
            data: {
                location: newLocation
            }
        });

    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'ფავორიტების დამატებისას მოხდა შეცდომა'
        });
    }
});

// @route   DELETE /api/user/favorites/:id
// @desc    Remove location from favorites
// @access  Private
router.delete('/favorites/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'მომხმარებელი ვერ მოიძებნა'
            });
        }

        const locationId = req.params.id;
        const locationExists = user.favoriteLocations.some(
            fav => fav._id.toString() === locationId
        );

        if (!locationExists) {
            return res.status(404).json({
                success: false,
                message: 'ლოკაცია ვერ მოიძებნა ფავორიტებში'
            });
        }

        user.favoriteLocations = user.favoriteLocations.filter(
            fav => fav._id.toString() !== locationId
        );

        await user.save();

        res.json({
            success: true,
            message: 'ლოკაცია წარმატებით წაიშალა ფავორიტებიდან'
        });

    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'ფავორიტების წაშლისას მოხდა შეცდომა'
        });
    }
});

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
    authenticateToken,
    body('emailNotifications').optional().isBoolean().withMessage('ელ-ფოსტის შეტყობინებები უნდა იყოს boolean'),
    body('language').optional().isIn(['ka', 'en']).withMessage('ენა უნდა იყოს ka ან en'),
    body('temperatureUnit').optional().isIn(['celsius', 'fahrenheit']).withMessage('ტემპერატურის ერთეული უნდა იყოს celsius ან fahrenheit')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ვალიდაციის შეცდომა',
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'მომხმარებელი ვერ მოიძებნა'
            });
        }

        const { emailNotifications, language, temperatureUnit } = req.body;

        // Update only provided preferences
        if (emailNotifications !== undefined) {
            user.preferences.emailNotifications = emailNotifications;
        }
        if (language !== undefined) {
            user.preferences.language = language;
        }
        if (temperatureUnit !== undefined) {
            user.preferences.temperatureUnit = temperatureUnit;
        }

        await user.save();

        res.json({
            success: true,
            message: 'პრეფერენსები წარმატებით განახლდა',
            data: {
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'პრეფერენსების განახლებისას მოხდა შეცდომა'
        });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
    authenticateToken,
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('სახელი უნდა იყოს 2-50 სიმბოლო')
        .matches(/^[ა-ჰa-zA-Z\s]+$/)
        .withMessage('სახელი უნდა შეიცავდეს მხოლოდ ქართულ ან ლათინურ ასოებს'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('გვარი უნდა იყოს 2-50 სიმბოლო')
        .matches(/^[ა-ჰa-zA-Z\s]+$/)
        .withMessage('გვარი უნდა შეიცავდეს მხოლოდ ქართულ ან ლათინურ ასოებს')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ვალიდაციის შეცდომა',
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'მომხმარებელი ვერ მოიძებნა'
            });
        }

        const { firstName, lastName } = req.body;

        // Update only provided fields
        if (firstName !== undefined) {
            user.firstName = firstName.trim();
        }
        if (lastName !== undefined) {
            user.lastName = lastName.trim();
        }

        await user.save();

        res.json({
            success: true,
            message: 'პროფილი წარმატებით განახლდა',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    fullName: user.getFullName()
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'პროფილის განახლებისას მოხდა შეცდომა'
        });
    }
});

module.exports = router;