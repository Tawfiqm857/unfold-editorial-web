// Dashboard utility functions
export function formatAmount(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount / 100);
}

export function getStatusClass(status) {
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

export function getActivityIcon(action) {
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

export function getActivityTitle(action) {
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

export function showNotification(message, type = 'info') {
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