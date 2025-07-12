// Dashboard activity logging
import { supabase, currentUser } from './dashboard-config.js';

export async function logActivity(action, details = null) {
    if (!currentUser) {
        console.warn('Cannot log activity: user not authenticated');
        return;
    }
    
    try {
        // Get user agent and IP info
        const userAgent = navigator.userAgent;
        
        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: currentUser.id,
                action: action,
                details: details,
                user_agent: userAgent
            });
        
        if (error) {
            console.error('Failed to log activity:', error);
        }
    } catch (error) {
        console.error('Activity logging error:', error);
    }
}

export async function getRecentActivity(limit = 10) {
    if (!currentUser) return [];
    
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) {
            console.error('Failed to fetch activity:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Activity fetch error:', error);
        return [];
    }
}