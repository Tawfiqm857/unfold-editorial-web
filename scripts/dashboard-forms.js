// Dashboard form handling
import { supabase, currentUser, userProfile, setUserProfile } from './dashboard-config.js';
import { showNotification } from './dashboard-utils.js';
import { populateUserInfo } from './dashboard-ui.js';
import { logActivity } from './dashboard-activity.js';

export function setupForms() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
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