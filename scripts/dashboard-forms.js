// Dashboard form handling
import { supabase, currentUser, userProfile, setUserProfile } from './dashboard-config.js';
import { showNotification } from './dashboard-utils.js';
import { populateUserInfo } from './dashboard-ui.js';
import { logActivity } from './dashboard-activity.js';

export function setupForms() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Newsletter form
    setupNewsletterForm();
}

export async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        full_name: formData.get('fullName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        country: formData.get('country'),
        bio: formData.get('bio')
    };
    
    try {
        // Upsert profile data
        const { error } = await supabase
            .from('profiles')
            .upsert({
                user_id: currentUser.id,
                email: currentUser.email,
                ...profileData
            });
            
        if (error) {
            throw error;
        }
        
        // Update local profile
        setUserProfile({ ...userProfile, ...profileData });
        
        // Update user info display
        populateUserInfo();
        
        showNotification('Profile updated successfully!', 'success');
        await logActivity('profile_updated');
        
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
    }
}

export function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterUpdate);
    }
}

export async function handleNewsletterUpdate(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const subscriptions = formData.getAll('newsletters');
        
        // Create notification preferences object
        const notificationPrefs = {
            email: subscriptions.includes('weekly') || subscriptions.includes('releases'),
            marketing: subscriptions.includes('promotions'),
            push: false, // Default value
            newsletters: subscriptions
        };
        
        // Update profile with notification preferences
        const { error } = await supabase
            .from('profiles')
            .update({
                notification_preferences: notificationPrefs
            })
            .eq('user_id', currentUser.id);
        
        if (error) {
            throw error;
        }
        
        // Update local profile
        setUserProfile({ 
            ...userProfile, 
            notification_preferences: notificationPrefs 
        });
        
        // Update subscription status display
        const statusElement = document.getElementById('subscription-status');
        if (statusElement) {
            const subscriptionCount = subscriptions.length;
            if (subscriptionCount === 0) {
                statusElement.textContent = 'Not subscribed';
                statusElement.style.color = '#6b7280';
            } else {
                statusElement.textContent = `Subscribed to ${subscriptionCount} newsletter${subscriptionCount > 1 ? 's' : ''}`;
                statusElement.style.color = '#059669';
            }
        }
        
        showNotification('Newsletter preferences updated successfully!', 'success');
        await logActivity('newsletter_updated', { subscriptions });
        
    } catch (error) {
        console.error('Newsletter update error:', error);
        showNotification('Failed to update newsletter preferences. Please try again.', 'error');
    }
}