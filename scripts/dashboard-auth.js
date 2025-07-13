
// Dashboard authentication handling
import { supabase, setCurrentUser } from './dashboard-config.js';

export async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth error:', error);
            redirectToAuth();
            return false;
        }
        
        if (!session || !session.user) {
            console.log('No active session found, redirecting to auth');
            redirectToAuth();
            return false;
        }
        
        console.log('User authenticated:', session.user.email);
        console.log('User metadata:', session.user.user_metadata);
        setCurrentUser(session.user);
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_OUT' || !session) {
                redirectToAuth();
            }
        });
        
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        redirectToAuth();
        return false;
    }
}

export function redirectToAuth() {
    window.location.href = 'auth.html';
}

export async function handleSignOut() {
    const { logActivity } = await import('./dashboard-activity.js');
    await logActivity('user_logout');
    await supabase.auth.signOut();
    localStorage.removeItem('authRemember');
    window.location.href = 'index.html';
}
