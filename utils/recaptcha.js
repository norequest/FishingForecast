const axios = require('axios');

/**
 * Verify Google reCAPTCHA v2 token
 * @param {string} token - The reCAPTCHA token from the client
 * @returns {boolean} - True if verification successful, false otherwise
 */
const verifyRecaptcha = async (token) => {
    try {
        if (!token) {
            console.log('No reCAPTCHA token provided');
            return false;
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            console.error('RECAPTCHA_SECRET_KEY not configured');
            return false;
        }

        // Google's reCAPTCHA verification endpoint
        const verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
        
        const response = await axios.post(verifyURL, null, {
            params: {
                secret: secretKey,
                response: token,
                remoteip: undefined // Optional: can add client IP
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000 // 10 second timeout
        });

        const { success, score, action, hostname, challenge_ts, error_codes } = response.data;

        // Log the response for debugging (remove in production)
        if (process.env.NODE_ENV === 'development') {
            console.log('reCAPTCHA verification response:', {
                success,
                score,
                action,
                hostname,
                challenge_ts,
                error_codes
            });
        }

        // Check for errors
        if (error_codes && error_codes.length > 0) {
            console.error('reCAPTCHA verification errors:', error_codes);
            return false;
        }

        // For reCAPTCHA v2, we only need to check the success field
        // For reCAPTCHA v3, you would also check the score (0.0 to 1.0)
        return success === true;

    } catch (error) {
        console.error('reCAPTCHA verification failed:', error.message);
        
        // If it's a network error or timeout, we might want to allow the request
        // depending on your security requirements
        if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') {
            console.log('reCAPTCHA service unavailable, allowing request (security decision)');
            // In production, you might want to return false here for stricter security
            return process.env.NODE_ENV === 'development';
        }
        
        return false;
    }
};

/**
 * Verify reCAPTCHA v3 with score checking
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} expectedAction - The expected action name
 * @param {number} minimumScore - Minimum score threshold (default: 0.5)
 * @returns {boolean} - True if verification successful and score meets threshold
 */
const verifyRecaptchaV3 = async (token, expectedAction = 'submit', minimumScore = 0.5) => {
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            console.error('RECAPTCHA_SECRET_KEY not configured');
            return false;
        }

        const verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
        
        const response = await axios.post(verifyURL, null, {
            params: {
                secret: secretKey,
                response: token
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
        });

        const { success, score, action, error_codes } = response.data;

        if (process.env.NODE_ENV === 'development') {
            console.log('reCAPTCHA v3 verification response:', {
                success,
                score,
                action,
                expectedAction,
                minimumScore,
                error_codes
            });
        }

        if (error_codes && error_codes.length > 0) {
            console.error('reCAPTCHA verification errors:', error_codes);
            return false;
        }

        // Check success, score, and action
        return success === true && 
               score >= minimumScore && 
               action === expectedAction;

    } catch (error) {
        console.error('reCAPTCHA v3 verification failed:', error.message);
        return false;
    }
};

module.exports = {
    verifyRecaptcha,
    verifyRecaptchaV3
};