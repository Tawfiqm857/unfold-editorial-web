// Order JavaScript with Supabase integration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const supabaseUrl = 'https://atwlsvlzejxitpsltapl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2xzdmx6ZWp4aXRwc2x0YXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjgzMTAsImV4cCI6MjA2NjM0NDMxMH0.-XGrPL0VywL4fA7paNn22vpGqfHTu_KF199P7ycYWQ8';

const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let userProfile = null;
const magazinePrice = 2500; // ₦25.00 in kobo

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    await checkAuth();
    
    if (currentUser) {
        await loadUserProfile();
        initializeOrderForm();
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

async function loadUserProfile() {
    try {
        // Show loading state
        document.getElementById('orderLoading').style.display = 'flex';
        document.getElementById('orderContent').style.display = 'none';
        
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
        
    } catch (error) {
        console.error('Error loading user profile:', error);
    } finally {
        // Hide loading state
        document.getElementById('orderLoading').style.display = 'none';
        document.getElementById('orderContent').style.display = 'block';
    }
}

function initializeOrderForm() {
    // Pre-fill form with user profile data
    if (userProfile) {
        document.getElementById('fullName').value = userProfile.full_name || '';
        document.getElementById('phone').value = userProfile.phone || '';
        document.getElementById('address').value = userProfile.address || '';
        document.getElementById('city').value = userProfile.city || '';
        document.getElementById('state').value = userProfile.state || '';
        document.getElementById('country').value = userProfile.country || 'Nigeria';
    }
    
    // Setup form handlers
    const orderForm = document.getElementById('orderForm');
    const quantitySelect = document.getElementById('quantity');
    const signOutBtns = document.querySelectorAll('#signOutBtn, #mobileSignOutBtn');
    
    // Handle quantity changes
    quantitySelect.addEventListener('change', updateOrderSummary);
    
    // Handle form submission
    orderForm.addEventListener('submit', handleOrderSubmit);
    
    // Setup sign out buttons
    signOutBtns.forEach(btn => {
        btn.addEventListener('click', handleSignOut);
    });
    
    // Initial summary update
    updateOrderSummary();
}

function updateOrderSummary() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const total = quantity * magazinePrice;
    
    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('summaryTotal').textContent = formatAmount(total);
    
    // Update submit button text
    const submitBtn = document.getElementById('orderSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    btnText.textContent = `Proceed to Payment (${formatAmount(total)})`;
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const orderData = {
        quantity: parseInt(formData.get('quantity')),
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        country: formData.get('country')
    };
    
    // Validation
    if (!orderData.fullName || !orderData.phone || !orderData.address || !orderData.city || !orderData.state) {
        showError('Please fill in all required fields');
        return;
    }
    
    const total = orderData.quantity * magazinePrice;
    const orderNumber = `UNF-${Date.now()}`;
    
    try {
        // Show loading state
        showLoading(true);
        hideError();
        
        // Create order in database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: currentUser.id,
                order_number: orderNumber,
                quantity: orderData.quantity,
                total_amount: total,
                shipping_address: {
                    full_name: orderData.fullName,
                    phone: orderData.phone,
                    address: orderData.address,
                    city: orderData.city,
                    state: orderData.state,
                    country: orderData.country
                }
            })
            .select()
            .single();
            
        if (orderError) {
            throw orderError;
        }
        
        // Log order creation activity
        await logActivity('order_created', { order_id: order.id, order_number: orderNumber });
        
        // In a real implementation, you would integrate with a payment processor
        // For now, we'll simulate a successful order creation
        showNotification('Order created successfully! Payment integration coming soon.', 'success');
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('Order creation error:', error);
        showError(error.message || 'Failed to create order. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleSignOut() {
    await logActivity('user_logout');
    await supabase.auth.signOut();
    localStorage.removeItem('authRemember');
    window.location.href = 'index.html';
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

function showLoading(show) {
    const submitBtn = document.getElementById('orderSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (show) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function showError(message) {
    const errorEl = document.getElementById('orderError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideError() {
    const errorEl = document.getElementById('orderError');
    errorEl.style.display = 'none';
}

function formatAmount(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount / 100);
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