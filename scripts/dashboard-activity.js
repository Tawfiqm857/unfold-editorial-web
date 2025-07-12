// Dashboard activity logging
import { supabase, currentUser } from './dashboard-config.js';

export async function logActivity(action, details = {}) {
    try {
        await supabase
            .from('activity_logs')
            .insert({
                user_id: currentUser.id,
                action,
                details,
                ip_address: 'web',
                user_agent: navigator.userAgent
            });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}