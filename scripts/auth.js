
// Main authentication orchestrator
import { handleSignInForm, handleSignUpForm, handleGoogleAuth } from './auth-forms.js';
import { checkAuthState } from './auth-state.js';
import { addPasswordToggle } from './auth-utils.js';

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

    // Handle form submissions
    handleSignInForm(signInForm);
    handleSignUpForm(signUpForm);

    // Handle Google authentication
    const googleSignInBtn = document.getElementById('googleSignIn');
    const googleSignUpBtn = document.getElementById('googleSignUp');
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => handleGoogleAuth('Signing in'));
    }
    
    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', () => handleGoogleAuth('Signing up'));
    }

    // Add password toggles if needed
    addPasswordToggle('password');
    addPasswordToggle('signUpPassword');
    addPasswordToggle('confirmPassword');

    // Initialize auth state check
    checkAuthState();
});
