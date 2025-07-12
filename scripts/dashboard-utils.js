// Dashboard utility functions
export function showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });

    // Set background color based on type
    const colors = {
        success: '#059669',
        error: '#dc2626',
        warning: '#d97706',
        info: '#667eea'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    // Add to DOM
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

export function formatAmount(amount) {
    // Amount is in kobo, convert to naira
    const naira = amount / 100;
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(naira);
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export function getStatusClass(status) {
    const statusClasses = {
        'completed': 'badge-success',
        'paid': 'badge-success', 
        'pending': 'badge-warning',
        'processing': 'badge-warning',
        'failed': 'badge-error',
        'cancelled': 'badge-error'
    };
    return statusClasses[status] || 'badge-default';
}

export function getInitials(name) {
    if (!name) return '?';
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

export function getActivityIcon(action) {
    const icons = {
        'user_login': '🔐',
        'user_logout': '🚪',
        'user_signup': '👋',
        'profile_updated': '✏️',
        'order_created': '🛒',
        'payment_completed': '💳',
        'dashboard_visit': '📊'
    };
    return icons[action] || '📝';
}

export function getActivityTitle(action) {
    const titles = {
        'user_login': 'Signed in',
        'user_logout': 'Signed out',
        'user_signup': 'Account created',
        'profile_updated': 'Profile updated',
        'order_created': 'New order placed',
        'payment_completed': 'Payment completed',
        'dashboard_visit': 'Visited dashboard'
    };
    return titles[action] || 'Activity';
}