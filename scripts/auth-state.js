// Authentication state management
import { supabase } from './supabase-client.js';
import { showNotification } from './auth-utils.js';

// Check if user is already authenticated  
export async function checkAuthState() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            showNotification('Welcome back!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            return;
        }
    } catch (error) {
        console.log('Session check error:', error);
    }
    
    // Check localStorage fallback
    const remember = localStorage.getItem('authRemember');
    const currentPath = window.location.pathname;
    
    if (remember && currentPath.includes('auth.html')) {
        // Verify session is still valid
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            showNotification('Welcome back!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            localStorage.removeItem('authRemember');
        }
    }
}