
// Authentication JavaScript with Supabase integration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const supabaseUrl = 'https://atwlsvlzejxitpsltapl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2xzdmx6ZWp4aXRwc2x0YXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjgzMTAsImV4cCI6MjA2NjM0NDMxMH0.-XGrPL0VywL4fA7paNn22vpGqfHTu_KF199P7ycYWQ8';

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const signInCard = document.querySelector('.auth-card:not(.sign-up-card)');
    const signUpCard = document.getElementById('signUpCard');
    const showSignUpLink = document.getElementById('showSignUp');
    const showSignInLink = document.getElementById('showSignIn');

    // Toggle between sign in and sign up
    if (showSignUpLink) {
        showSignUpLink.addEventListener('click', function(e) {
            e.preventDefault();
            signInCard.style.display = 'none';
            signUpCard.style.display = 'block';
            signUpCard.classList.add('animate-scale-in');
        });
    }

    if (showSignInLink) {
        showSignInLink.addEventListener('click', function(e) {
            e.preventDefault();
            signUpCard.style.display = 'none';
            signInCard.style.display = 'block';
            signInCard.classList.add('animate-scale-in');
        });
    }

    // Handle sign in form submission
    if (signInForm) {
        signInForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Basic validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Real Supabase sign in
            const submitBtn = signInForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            
            supabase.auth.signInWithPassword({
                email: email,
                password: password,
            }).then(({ data, error }) => {
                if (error) {
                    showNotification(error.message, 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                } else {
                    showNotification('Welcome back! Redirecting...', 'success');
                    
                    // Store auth state if remember me is checked
                    if (remember) {
                        localStorage.setItem('authRemember', 'true');
                    }
                    
                    // Redirect to React app
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                }
            });
        });
    }

    // Handle sign up form submission
    if (signUpForm) {
        signUpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Validation
            if (!fullName || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Password must be at least 6 characters long', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (!agreeTerms) {
                showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // Real Supabase sign up
            const submitBtn = signUpForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;
            
            const redirectUrl = `${window.location.origin}/dashboard`;
            
            supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        full_name: fullName
                    }
                }
            }).then(({ data, error }) => {
                if (error) {
                    showNotification(error.message, 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                } else {
                    showNotification('Account created successfully! Please check your email to verify your account.', 'success');
                    
                    // Reset form
                    signUpForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    // Switch to sign in form
                    setTimeout(() => {
                        signUpCard.style.display = 'none';
                        signInCard.style.display = 'block';
                        signInCard.classList.add('animate-scale-in');
                    }, 2000);
                }
            });
        });
    }

    // Handle Google sign in/up
    const googleSignInBtn = document.getElementById('googleSignIn');
    const googleSignUpBtn = document.getElementById('googleSignUp');
    
    function handleGoogleAuth(action) {
        showNotification(`${action} with Google...`, 'info');
        
        // In a real app, this would integrate with Google OAuth
        setTimeout(() => {
            showNotification(`${action} successful! Redirecting...`, 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 2000);
    }
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => handleGoogleAuth('Signing in'));
    }
    
    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', () => handleGoogleAuth('Signing up'));
    }

    // Password visibility toggle (if needed)
    function addPasswordToggle(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
        
        // Style the toggle button
        Object.assign(toggleBtn.style, {
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem'
        });
        
        // Make input container relative
        const container = input.parentElement;
        container.style.position = 'relative';
        container.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.innerHTML = '🙈';
            } else {
                input.type = 'password';
                toggleBtn.innerHTML = '👁️';
            }
        });
    }

    // Check if user is already authenticated
    function checkAuthState() {
        const remember = localStorage.getItem('authRemember');
        const currentPath = window.location.pathname;
        
        // If user is on auth page but should be remembered, redirect
        if (remember && currentPath.includes('auth.html')) {
            showNotification('Welcome back!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    // Initialize auth state check
    checkAuthState();
});

// Email validation helper (imported from main.js)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system (imported from main.js)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}
