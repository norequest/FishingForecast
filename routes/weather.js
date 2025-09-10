const express = require('express');
const { body, validationResult } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/weather/forecast
// @desc    Get weather forecast for location
// @access  Public (with optional auth for personalized features)
router.get('/forecast', [
    optionalAuth,
    body('lat').optional().isNumeric().withMessage('გრძედი უნდა იყოს რიცხვი'),
    body('lon').optional().isNumeric().withMessage('განედი უნდა იყოს რიცხვი')
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

        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'კოორდინატები სავალდებულოა'
            });
        }

        // For now, return simulated data
        // In production, you would integrate with actual weather APIs here
        const weatherData = generateSimulatedWeatherData(parseFloat(lat), parseFloat(lon));

        res.json({
            success: true,
            data: {
                coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
                current: weatherData.current,
                forecast: weatherData.forecast,
                fishingScore: weatherData.fishingScore,
                isAuthenticated: !!req.user
            }
        });

    } catch (error) {
        console.error('Weather forecast error:', error);
        res.status(500).json({
            success: false,
            message: 'ამინდის პროგნოზის ჩატვირთვისას მოხდა შეცდომა'
        });
    }
});

// @route   POST /api/weather/fishing-score
// @desc    Calculate fishing score for custom parameters
// @access  Public
router.post('/fishing-score', [
    body('temperature').isNumeric().withMessage('ტემპერატურა უნდა იყოს რიცხვი'),
    body('windSpeed').isNumeric().withMessage('ქარის სიჩქარე უნდა იყოს რიცხვი'),
    body('pressure').isNumeric().withMessage('წნევა უნდა იყოს რიცხვი'),
    body('humidity').isNumeric().withMessage('ნესტიანობა უნდა იყოს რიცხვი'),
    body('uvIndex').optional().isNumeric().withMessage('UV ინდექსი უნდა იყოს რიცხვი'),
    body('precipitation').optional().isNumeric().withMessage('ნალექები უნდა იყოს რიცხვი')
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

        const { temperature, windSpeed, pressure, humidity, uvIndex = 5, precipitation = 0 } = req.body;

        const fishingScore = calculateFishingScore({
            temperature,
            windSpeed,
            pressure,
            humidity,
            uvIndex,
            precipitation,
            moonPhase: 'full' // Default for custom calculation
        });

        res.json({
            success: true,
            data: {
                score: fishingScore.score,
                description: fishingScore.description,
                factors: fishingScore.factors
            }
        });

    } catch (error) {
        console.error('Fishing score calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'თევზაობის ინდექსის გამოთვლისას მოხდა შეცდომა'
        });
    }
});

// Helper function to generate simulated weather data
function generateSimulatedWeatherData(lat, lon) {
    const temperature = Math.round(Math.random() * 25 + 10); // 10-35°C
    const windSpeed = Math.round(Math.random() * 20 + 5); // 5-25 km/h
    const pressure = Math.round(Math.random() * 30 + 1000); // 1000-1030 hPa
    const humidity = Math.round(Math.random() * 40 + 40); // 40-80%
    const uvIndex = Math.round(Math.random() * 10); // 0-10
    const precipitation = Math.round(Math.random() * 10); // 0-10mm

    const current = {
        temperature,
        windSpeed,
        pressure,
        humidity,
        uvIndex,
        precipitation,
        moonPhase: getMoonPhase(),
        timestamp: new Date().toISOString()
    };

    // Calculate fishing score
    const fishingScore = calculateFishingScore(current);

    // Generate 5-day forecast
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const dayData = {
            date: date.toISOString().split('T')[0],
            temperature: Math.round(Math.random() * 25 + 10),
            windSpeed: Math.round(Math.random() * 20 + 5),
            pressure: Math.round(Math.random() * 30 + 1000),
            humidity: Math.round(Math.random() * 40 + 40),
            uvIndex: Math.round(Math.random() * 10),
            precipitation: Math.round(Math.random() * 10)
        };

        dayData.fishingScore = calculateFishingScore(dayData).score;
        forecast.push(dayData);
    }

    return {
        current,
        forecast,
        fishingScore
    };
}

// Helper function to calculate fishing score
function calculateFishingScore(data) {
    let score = 5; // Base score
    const factors = {};

    // Temperature scoring (ideal 15-25°C)
    if (data.temperature >= 15 && data.temperature <= 25) {
        score += 2;
        factors.temperature = 'მეტად შესაფერისი';
    } else if (data.temperature >= 10 && data.temperature <= 30) {
        score += 1;
        factors.temperature = 'შესაფერისი';
    } else {
        score -= 1;
        factors.temperature = 'არაშესაფერისი';
    }

    // Wind scoring (ideal 5-15 km/h)
    if (data.windSpeed >= 5 && data.windSpeed <= 15) {
        score += 1.5;
        factors.wind = 'იდეალური';
    } else if (data.windSpeed > 20) {
        score -= 1;
        factors.wind = 'ძალიან ძლიერი';
    } else {
        factors.wind = 'მისაღები';
    }

    // Pressure scoring (stable pressure is good)
    if (data.pressure >= 1013 && data.pressure <= 1020) {
        score += 1;
        factors.pressure = 'მუდმივი';
    } else if (data.pressure < 1000 || data.pressure > 1030) {
        score -= 0.5;
        factors.pressure = 'არამუდმივი';
    } else {
        factors.pressure = 'მისაღები';
    }

    // Humidity scoring (40-70% is ideal)
    if (data.humidity >= 40 && data.humidity <= 70) {
        score += 0.5;
        factors.humidity = 'იდეალური';
    } else {
        factors.humidity = 'მისაღები';
    }

    // UV scoring (lower is better for fishing)
    if (data.uvIndex <= 3) {
        score += 0.5;
        factors.uv = 'დაბალი - შესანიშნავი';
    } else if (data.uvIndex >= 8) {
        score -= 0.5;
        factors.uv = 'მაღალი';
    } else {
        factors.uv = 'საშუალო';
    }

    // Precipitation scoring (light rain can be good)
    if (data.precipitation >= 1 && data.precipitation <= 5) {
        score += 0.5;
        factors.precipitation = 'მსუბუქი წვიმა';
    } else if (data.precipitation > 10) {
        score -= 1;
        factors.precipitation = 'ძლიერი წვიმა';
    } else {
        factors.precipitation = 'მშრალი';
    }

    const finalScore = Math.max(1, Math.min(10, Math.round(score)));

    let description;
    if (finalScore >= 8) description = 'შესანიშნავი - იდეალური პირობები თევზაობისთვის!';
    else if (finalScore >= 6) description = 'კარგი - მოსალოდნელია კარგი ნადავლი';
    else if (finalScore >= 4) description = 'საშუალო - შესაძლოა რამე დაიჭიროთ';
    else description = 'ცუდი - უმჯობესია მეორე დღეს სცადოთ';

    return {
        score: finalScore,
        description,
        factors
    };
}

// Helper function to get current moon phase
function getMoonPhase() {
    const phases = ['ახალმთვარე', 'მზარდი ნახევარმთვარე', 'პირველი მეოთხედი', 'მზარდი', 
                   'სავსემთვარე', 'კლებადი', 'ბოლო მეოთხედი', 'კლებადი ნახევარმთვარე'];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return phases[Math.floor(dayOfYear / 3.7) % 8];
}

module.exports = router;