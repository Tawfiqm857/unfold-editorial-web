// Dashboard data loading functions
import { supabase, currentUser, setUserProfile, setUserOrders, setUserActivity } from './dashboard-config.js';

export async function loadUserData() {
    try {
        // Show loading state
        document.getElementById('dashboardLoading').style.display = 'flex';
        document.getElementById('dashboardContent').style.display = 'none';
        
        // Load critical data first (profile and recent orders) in parallel
        const [profileResult, ordersResult] = await Promise.allSettled([
            supabase
                .from('profiles')
                .select('*')
                .eq('user_id', currentUser.id)
                .single(),
            supabase
                .from('orders')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(5) // Load only recent orders first
        ]);
        
        // Process profile data
        if (profileResult.status === 'fulfilled') {
            const { data: profile, error: profileError } = profileResult.value;
            if (profileError && profileError.code !== 'PGRST116') {
                console.error('Profile error:', profileError);
            } else if (profile) {
                setUserProfile(profile);
            }
        }
        
        // Process orders data
        if (ordersResult.status === 'fulfilled') {
            const { data: orders, error: ordersError } = ordersResult.value;
            if (ordersError) {
                console.error('Orders error:', ordersError);
            } else {
                setUserOrders(orders || []);
            }
        }
        
        // Show dashboard immediately with critical data
        document.getElementById('dashboardLoading').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        
        // Load remaining data in background
        loadNonCriticalData();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('dashboardLoading').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
    }
}

async function loadNonCriticalData() {
    try {
        // Load remaining orders and activity in parallel
        const [allOrdersResult, activityResult] = await Promise.allSettled([
            supabase
                .from('orders')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false }),
            supabase
                .from('activity_logs')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10)
        ]);
        
        // Process all orders
        if (allOrdersResult.status === 'fulfilled') {
            const { data: orders, error: ordersError } = allOrdersResult.value;
            if (!ordersError) {
                setUserOrders(orders || []);
                // Update orders tab and analytics
                const { populateOrdersTab, populateAnalytics } = await import('./dashboard-ui.js');
                populateOrdersTab();
                populateAnalytics();
            }
        }
        
        // Process activity data
        if (activityResult.status === 'fulfilled') {
            const { data: activity, error: activityError } = activityResult.value;
            if (!activityError) {
                setUserActivity(activity || []);
                const { populateActivityTab } = await import('./dashboard-ui.js');
                populateActivityTab();
            }
        }
        
        // Log dashboard visit (non-blocking)
        const { logActivity } = await import('./dashboard-activity.js');
        logActivity('dashboard_visit').catch(err => console.error('Activity log error:', err));
        
    } catch (error) {
        console.error('Error loading non-critical data:', error);
    }
}