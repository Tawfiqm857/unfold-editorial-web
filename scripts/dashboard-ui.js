// Dashboard UI management functions
import { currentUser, userProfile, userOrders, userActivity } from './dashboard-config.js';
import { formatAmount, formatDate, getStatusClass, getInitials, getActivityIcon, getActivityTitle } from './dashboard-utils.js';

export function populateUserInfo() {
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.textContent = userProfile?.full_name || currentUser?.email || 'User';
    }
    
    // Update avatar display
    const avatar = document.getElementById('profile-avatar');
    const placeholder = document.getElementById('avatar-placeholder');
    const initials = document.getElementById('avatar-initials');
    
    if (avatar && placeholder && initials) {
        if (userProfile?.avatar_url) {
            avatar.src = userProfile.avatar_url;
            avatar.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            const nameInitials = getInitials(userProfile?.full_name || 'User');
            initials.textContent = nameInitials;
            avatar.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }
}

export function populateAnalytics() {
    const totalOrders = userOrders.length;
    const completedOrders = userOrders.filter(order => order.order_status === 'completed').length;
    const pendingOrders = userOrders.filter(order => order.order_status === 'pending' || order.payment_status === 'pending').length;
    const totalSpent = userOrders
        .filter(order => order.payment_status === 'paid')
        .reduce((sum, order) => sum + order.total_amount, 0);
    
    const totalOrdersEl = document.getElementById('total-orders');
    const completedOrdersEl = document.getElementById('completed-orders');
    const pendingOrdersEl = document.getElementById('pending-orders');
    const totalSpentEl = document.getElementById('total-spent');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (totalSpentEl) totalSpentEl.textContent = formatAmount(totalSpent);
}

export function setupTabs() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const tabName = trigger.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

export function switchTab(tabName) {
    // Update trigger states
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        trigger.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Update content states
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) activeContent.classList.add('active');
}

export function populateOverviewTab() {
    // This function is for future tab-based navigation
    // Currently the dashboard shows all content at once
}

export function populateOrdersTab() {
    const ordersList = document.getElementById('orders-list');
    const emptyOrders = document.getElementById('empty-orders');
    
    if (!ordersList || !emptyOrders) return;
    
    if (userOrders.length === 0) {
        ordersList.style.display = 'none';
        emptyOrders.style.display = 'block';
    } else {
        emptyOrders.style.display = 'none';
        ordersList.style.display = 'block';
        
        ordersList.innerHTML = userOrders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.order_number}</h4>
                        <p class="order-date">${formatDate(order.created_at)}</p>
                    </div>
                    <div class="order-amount">
                        <p class="amount">${formatAmount(order.total_amount)}</p>
                        <p class="quantity">Qty: ${order.quantity}</p>
                    </div>
                </div>
                <div class="order-badges">
                    <span class="badge ${getStatusClass(order.payment_status)}">
                        ${order.payment_status}
                    </span>
                    <span class="badge ${getStatusClass(order.order_status)}">
                        ${order.order_status}
                    </span>
                </div>
            </div>
        `).join('');
    }
}

export function populateProfileTab() {
    // Populate profile display fields
    const profileElements = {
        'profile-name': userProfile?.full_name || 'Not provided',
        'profile-email': userProfile?.email || currentUser?.email || 'Not provided',
        'profile-phone': userProfile?.phone || 'Not provided',
        'profile-address': userProfile?.address || 'Not provided',
        'profile-city': userProfile?.city || 'Not provided',
        'profile-state': userProfile?.state || 'Not provided',
        'profile-country': userProfile?.country || 'Not provided'
    };
    
    Object.entries(profileElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // Setup profile editing
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const profileView = document.getElementById('profile-view');
    const profileEdit = document.getElementById('profile-edit');
    const profileForm = document.getElementById('profile-form');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            // Populate form with current data
            const formFields = {
                'fullName': userProfile?.full_name || '',
                'phone': userProfile?.phone || '',
                'address': userProfile?.address || '',
                'city': userProfile?.city || '',
                'state': userProfile?.state || '',
                'country': userProfile?.country || '',
                'bio': userProfile?.bio || ''
            };
            
            Object.entries(formFields).forEach(([name, value]) => {
                const field = document.getElementById(name);
                if (field) field.value = value;
            });
            
            profileView.classList.add('hidden');
            profileEdit.classList.remove('hidden');
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            profileView.classList.remove('hidden');
            profileEdit.classList.add('hidden');
        });
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const { handleProfileUpdate } = await import('./dashboard-forms.js');
                await handleProfileUpdate(e);
                
                // Hide form and show view
                profileView.classList.remove('hidden');
                profileEdit.classList.add('hidden');
                
                // Refresh profile display
                populateProfileTab();
                populateUserInfo();
                
            } catch (error) {
                console.error('Profile update error:', error);
            }
        });
    }
}

export function populateActivityTab() {
    // This would populate activity data if we had an activity section
    // For now, this is a placeholder
}

// Make switchTab available globally for potential future use
window.switchTab = switchTab;