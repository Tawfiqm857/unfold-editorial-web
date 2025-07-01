// Dashboard JavaScript with Supabase integration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const supabaseUrl = 'https://atwlsvlzejxitpsltapl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2xzdmx6ZWp4aXRwc2x0YXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjgzMTAsImV4cCI6MjA2NjM0NDMxMH0.-XGrPL0VywL4fA7paNn22vpGqfHTu_KF199P7ycYWQ8';

const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let userProfile = null;
let userOrders = [];
let userActivity = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    await checkAuth();
    
    if (currentUser) {
        await loadUserData();
        initializeDashboard();
    }
});

async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth error:', error);
            redirectToAuth();
            return;
        }
        
        if (!session || !session.user) {
            redirectToAuth();
            return;
        }
        
        currentUser = session.user;
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                redirectToAuth();
            }
        });
        
    } catch (error) {
        console.error('Auth check failed:', error);
        redirectToAuth();
    }
}

function redirectToAuth() {
    window.location.href = 'auth.html';
}

async function loadUserData() {
    try {
        // Show loading state
        document.getElementById('dashboardLoading').style.display = 'flex';
        document.getElementById('dashboardContent').style.display = 'none';
        
        // Load user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
            
        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile error:', profileError);
        } else if (profile) {
            userProfile = profile;
        }
        
        // Load user orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
            
        if (ordersError) {
            console.error('Orders error:', ordersError);
        } else {
            userOrders = orders || [];
        }
        
        // Load user activity
        const { data: activity, error: activityError } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (activityError) {
            console.error('Activity error:', activityError);
        } else {
            userActivity = activity || [];
        }
        
        // Log dashboard visit
        await logActivity('dashboard_visit');
        
    } catch (error) {
        console.error('Error loading user data:', error);
    } finally {
        // Hide loading state
        document.getElementById('dashboardLoading').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
    }
}

function initializeDashboard() {
    // Populate user info
    populateUserInfo();
    
    // Populate analytics
    populateAnalytics();
    
    // Setup tabs
    setupTabs();
    
    // Setup forms
    setupForms();
    
    // Setup sign out buttons
    setupSignOut();
    
    // Populate content for each tab
    populateOverviewTab();
    populateOrdersTab();
    populateProfileTab();
    populateActivityTab();
}

function populateUserInfo() {
    const userName = userProfile?.full_name || currentUser?.email || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userInitials').textContent = userInitials;
}

function populateAnalytics() {
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const lastOrderDate = userOrders.length > 0 ? new Date(userOrders[0].created_at).toLocaleDateString() : 'Never';
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = formatAmount(totalSpent);
    document.getElementById('lastOrder').textContent = lastOrderDate;
}

function setupTabs() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const tabName = trigger.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update trigger states
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        trigger.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content states
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function setupForms() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

function setupSignOut() {
    const signOutBtns = document.querySelectorAll('#signOutBtn, #mobileSignOutBtn');
    signOutBtns.forEach(btn => {
        btn.addEventListener('click', handleSignOut);
    });
}

async function handleSignOut() {
    await logActivity('user_logout');
    await supabase.auth.signOut();
    localStorage.removeItem('authRemember');
    window.location.href = 'index.html';
}

function populateOverviewTab() {
    const recentOrdersList = document.getElementById('recentOrdersList');
    
    if (userOrders.length === 0) {
        recentOrdersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Start by ordering your first magazine copy!</p>
                <button class="btn btn-primary" onclick="window.location.href='order.html'">
                    🛒 Order Now
                </button>
            </div>
        `;
    } else {
        const recentOrders = userOrders.slice(0, 3);
        recentOrdersList.innerHTML = recentOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.order_number}</h4>
                        <p class="order-date">${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="order-amount">
                        <p class="amount">${formatAmount(order.total_amount)}</p>
                        <p class="quantity">Qty: ${order.quantity}</p>
                    </div>
                </div>
                <div class="order-status">
                    <span class="status-badge ${getStatusClass(order.payment_status)}">
                        Payment: ${order.payment_status}
                    </span>
                    <span class="status-badge ${getStatusClass(order.order_status)}">
                        Order: ${order.order_status}
                    </span>
                </div>
            </div>
        `).join('');
        
        if (userOrders.length > 3) {
            recentOrdersList.innerHTML += `
                <button class="btn btn-outline view-all-btn" onclick="switchTab('orders')">
                    View All Orders
                </button>
            `;
        }
    }
}

function populateOrdersTab() {
    const allOrdersList = document.getElementById('allOrdersList');
    
    if (userOrders.length === 0) {
        allOrdersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Start by ordering your first magazine copy!</p>
                <button class="btn btn-primary" onclick="window.location.href='order.html'">
                    🛒 Order Now
                </button>
            </div>
        `;
    } else {
        allOrdersList.innerHTML = userOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.order_number}</h4>
                        <p class="order-date">${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="order-amount">
                        <p class="amount">${formatAmount(order.total_amount)}</p>
                        <p class="quantity">Qty: ${order.quantity}</p>
                    </div>
                </div>
                <div class="order-status">
                    <span class="status-badge ${getStatusClass(order.payment_status)}">
                        Payment: ${order.payment_status}
                    </span>
                    <span class="status-badge ${getStatusClass(order.order_status)}">
                        Order: ${order.order_status}
                    </span>
                </div>
            </div>
        `).join('');
    }
}

function populateProfileTab() {
    // Pre-fill profile form
    if (userProfile) {
        document.getElementById('profileFullName').value = userProfile.full_name || '';
        document.getElementById('profilePhone').value = userProfile.phone || '';
        document.getElementById('profileAddress').value = userProfile.address || '';
        document.getElementById('profileCity').value = userProfile.city || '';
        document.getElementById('profileState').value = userProfile.state || '';
        document.getElementById('profileCountry').value = userProfile.country || '';
        document.getElementById('profileBio').value = userProfile.bio || '';
    }
    
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('securityEmail').textContent = currentUser.email;
}

function populateActivityTab() {
    const activityFeed = document.getElementById('activityFeed');
    
    if (userActivity.length === 0) {
        activityFeed.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No activity yet</h3>
                <p>Your account activity will appear here</p>
            </div>
        `;
    } else {
        activityFeed.innerHTML = userActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${getActivityIcon(activity.action)}</div>
                <div class="activity-details">
                    <h4>${getActivityTitle(activity.action)}</h4>
                    <p class="activity-time">${new Date(activity.created_at).toLocaleString()}</p>
                </div>
            </div>
        `).join('');
    }
}

async function handleProfileUpdate(e) {
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
        userProfile = { ...userProfile, ...profileData };
        
        // Update user info display
        populateUserInfo();
        
        showNotification('Profile updated successfully!', 'success');
        await logActivity('profile_updated');
        
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
    }
}

async function logActivity(action, details = {}) {
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

// Utility functions
function formatAmount(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount / 100);
}

function getStatusClass(status) {
    switch (status) {
        case 'paid':
        case 'completed':
        case 'delivered':
            return 'status-success';
        case 'pending':
        case 'processing':
            return 'status-warning';
        case 'failed':
        case 'cancelled':
            return 'status-error';
        case 'shipped':
            return 'status-info';
        default:
            return 'status-default';
    }
}

function getActivityIcon(action) {
    const icons = {
        'user_signup': '👋',
        'user_login': '🔑',
        'user_logout': '🚪',
        'dashboard_visit': '📊',
        'profile_updated': '👤',
        'order_created': '🛒',
        'order_updated': '📦'
    };
    return icons[action] || '📋';
}

function getActivityTitle(action) {
    const titles = {
        'user_signup': 'Account Created',
        'user_login': 'Signed In',
        'user_logout': 'Signed Out',
        'dashboard_visit': 'Visited Dashboard',
        'profile_updated': 'Profile Updated',
        'order_created': 'Order Created',
        'order_updated': 'Order Updated'
    };
    return titles[action] || 'Activity';
}

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

// Make switchTab available globally
window.switchTab = switchTab;