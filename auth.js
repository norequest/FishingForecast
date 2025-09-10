// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.baseUrl = window.location.origin; // Will be http://localhost:3000 when running on server
        this.init();
    }

    init() {
        // Check for existing token in localStorage
        const savedToken = localStorage.getItem('fishing_app_token');
        if (savedToken) {
            this.token = savedToken;
            this.validateToken();
        }

        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async validateToken() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.data.user;
                this.updateUI();
            } else {
                // Token is invalid
                this.logout(false);
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            this.logout(false);
        }
    }

    async handleLogin() {
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        const recaptchaResponse = grecaptcha.getResponse();

        // Clear previous errors
        this.clearFormErrors('login');

        // Basic validation
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            this.showError('login', 'ყველა ველი სავალდებულოა');
            return;
        }

        if (!recaptchaResponse) {
            this.showError('login-recaptcha', 'გთხოვთ დაადასტუროთ რომ არ ხართ რობოტი');
            return;
        }

        this.setLoading('login', true);

        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    recaptchaToken: recaptchaResponse
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                this.token = data.data.token;
                this.currentUser = data.data.user;
                
                localStorage.setItem('fishing_app_token', this.token);
                
                this.closeModal();
                this.updateUI();
                this.showSuccessMessage('წარმატებით შეხვედით სისტემაში!');
                
                // Reset form
                form.reset();
                grecaptcha.reset();
            } else {
                // Login failed
                if (data.errors && data.errors.length > 0) {
                    this.displayValidationErrors('login', data.errors);
                } else {
                    this.showError('login', data.message || 'შესვლისას მოხდა შეცდომა');
                }
                grecaptcha.reset();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login', 'კავშირის შეცდომა. სცადეთ თავიდან.');
            grecaptcha.reset();
        } finally {
            this.setLoading('login', false);
        }
    }

    async handleRegister() {
        const form = document.getElementById('register-form');
        const formData = new FormData(form);
        const recaptchaResponse = grecaptcha.getResponse(1); // Second reCAPTCHA widget

        // Clear previous errors
        this.clearFormErrors('register');

        // Get form data
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Basic validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            this.showError('register', 'ყველა ველი სავალდებულოა');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('register-confirm-password', 'პაროლები არ ემთხვევა');
            return;
        }

        if (!recaptchaResponse) {
            this.showError('register-recaptcha', 'გთხოვთ დაადასტუროთ რომ არ ხართ რობოტი');
            return;
        }

        // Client-side password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (password.length < 8 || !passwordRegex.test(password)) {
            this.showError('register-password', 'პაროლი უნდა შეიცავდეს: მცირე ასო, დიდი ასო, ციფრი და სპეციალური სიმბოლო (მინ. 8 სიმბოლო)');
            return;
        }

        this.setLoading('register', true);

        try {
            const response = await fetch(`${this.baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    confirmPassword,
                    recaptchaToken: recaptchaResponse
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Registration successful
                this.token = data.data.token;
                this.currentUser = data.data.user;
                
                localStorage.setItem('fishing_app_token', this.token);
                
                this.closeModal();
                this.updateUI();
                this.showSuccessMessage('რეგისტრაცია წარმატებით დასრულდა!');
                
                // Reset form
                form.reset();
                grecaptcha.reset(1);
            } else {
                // Registration failed
                if (data.errors && data.errors.length > 0) {
                    this.displayValidationErrors('register', data.errors);
                } else {
                    this.showError('register', data.message || 'რეგისტრაციისას მოხდა შეცდომა');
                }
                grecaptcha.reset(1);
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showError('register', 'კავშირის შეცდომა. სცადეთ თავიდან.');
            grecaptcha.reset(1);
        } finally {
            this.setLoading('register', false);
        }
    }

    logout(showMessage = true) {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('fishing_app_token');
        this.updateUI();
        
        if (showMessage) {
            this.showSuccessMessage('წარმატებით გახვედით სისტემიდან');
        }
    }

    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');

        if (this.currentUser) {
            // User is logged in
            authButtons.style.display = 'none';
            userMenu.style.display = 'block';
            userName.textContent = this.currentUser.fullName || `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        } else {
            // User is not logged in
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    showLoginModal() {
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'block';
        document.getElementById('register-modal').style.display = 'none';
        
        // Reset reCAPTCHA
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
    }

    showRegisterModal() {
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('register-modal').style.display = 'block';
        
        // Reset reCAPTCHA
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset(1);
        }
    }

    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
        this.clearFormErrors('login');
        this.clearFormErrors('register');
        
        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
        
        // Reset reCAPTCHA
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
            grecaptcha.reset(1);
        }
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }

    setLoading(form, isLoading) {
        const button = document.getElementById(`${form}-submit`);
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (isLoading) {
            button.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
        } else {
            button.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    }

    showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }

        // Also add error class to input if it exists
        const inputElement = document.getElementById(fieldId);
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    clearFormErrors(form) {
        const errorElements = document.querySelectorAll(`#${form}-modal .error-message`);
        errorElements.forEach(element => {
            element.textContent = '';
        });

        const inputElements = document.querySelectorAll(`#${form}-modal input`);
        inputElements.forEach(element => {
            element.classList.remove('error');
        });
    }

    displayValidationErrors(form, errors) {
        errors.forEach(error => {
            if (error.param) {
                this.showError(`${form}-${error.param}`, error.msg);
            }
        });
    }

    showSuccessMessage(message) {
        // Create and show a temporary success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message success';
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '10001';
        messageDiv.style.maxWidth = '300px';

        document.body.appendChild(messageDiv);

        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    // Get current user data
    getCurrentUser() {
        return this.currentUser;
    }

    // Get authentication header for API requests
    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.currentUser;
    }
}

// Global auth manager instance
let authManager;

// Global functions for HTML onclick handlers
function showLoginModal() {
    authManager.showLoginModal();
}

function showRegisterModal() {
    authManager.showRegisterModal();
}

function closeModal() {
    authManager.closeModal();
}

function toggleUserDropdown() {
    authManager.toggleUserDropdown();
}

function logout() {
    authManager.logout();
}

function showFavorites() {
    // TODO: Implement favorites modal
    alert('ფავორიტების ფუნქცია მალე დაემატება');
}

function showProfile() {
    // TODO: Implement profile modal
    alert('პროფილის ფუნქცია მალე დაემატება');
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    
    // Make it globally accessible for debugging
    window.authManager = authManager;
});