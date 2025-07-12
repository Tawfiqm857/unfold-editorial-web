// Dashboard UI management and population
import { currentUser, userProfile, userOrders, userActivity } from './dashboard-config.js';
import { formatAmount, getStatusClass, getActivityIcon, getActivityTitle } from './dashboard-utils.js';

export function populateUserInfo() {
    const userName = userProfile?.full_name || currentUser?.email || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userInitials').textContent = userInitials;
}

export function populateAnalytics() {
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const lastOrderDate = userOrders.length > 0 ? new Date(userOrders[0].created_at).toLocaleDateString() : 'Never';
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = formatAmount(totalSpent);
    document.getElementById('lastOrder').textContent = lastOrderDate;
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
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content states
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

export function populateOverviewTab() {
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

export function populateOrdersTab() {
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

export function populateProfileTab() {
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

export function populateActivityTab() {
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

// Make switchTab available globally
window.switchTab = switchTab;