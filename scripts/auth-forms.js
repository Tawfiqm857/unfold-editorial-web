// Authentication form handlers
import { supabase } from './supabase-client.js';
import { isValidEmail, showNotification } from './auth-utils.js';

// Handle sign in form submission
export function handleSignInForm(signInForm) {
    if (!signInForm) return;
    
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
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    });
}

// Handle sign up form submission
export function handleSignUpForm(signUpForm) {
    if (!signUpForm) return;
    
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
        
        const redirectUrl = `${window.location.origin}/dashboard.html`;
        
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
                const signInCard = document.querySelector('.auth-card:not(.sign-up-card)');
                const signUpCard = document.getElementById('signUpCard');
                setTimeout(() => {
                    signUpCard.style.display = 'none';
                    signInCard.style.display = 'block';
                    signInCard.classList.add('animate-scale-in');
                }, 2000);
            }
        });
    });
}

// Handle Google authentication
export function handleGoogleAuth(action) {
    showNotification(`${action} with Google...`, 'info');
    
    // In a real app, this would integrate with Google OAuth
    setTimeout(() => {
        showNotification(`${action} successful! Redirecting...`, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 2000);
}