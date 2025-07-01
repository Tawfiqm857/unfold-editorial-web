// Authentication utility functions

// Email validation helper
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
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

// Password visibility toggle
export function addPasswordToggle(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle';
    toggleBtn.innerHTML = '👁️';
    toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
    
    // Style the toggle button
    Object.assign(toggleBtn.style, {
        position: 'absolute',
        right: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem'
    });
    
    // Make input container relative
    const container = input.parentElement;
    container.style.position = 'relative';
    container.appendChild(toggleBtn);
    
    toggleBtn.addEventListener('click', function() {
        if (input.type === 'password') {
            input.type = 'text';
            toggleBtn.innerHTML = '🙈';
        } else {
            input.type = 'password';
            toggleBtn.innerHTML = '👁️';
        }
    });
}