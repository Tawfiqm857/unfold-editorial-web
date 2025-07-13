
// Optimized Order JavaScript with faster loading
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const supabaseUrl = 'https://atwlsvlzejxitpsltapl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2xzdmx6ZWp4aXRwc2x0YXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjgzMTAsImV4cCI6MjA2NjM0NDMxMH0.-XGrPL0VywL4fA7paNn22vpGqfHTu_KF199P7ycYWQ8';

const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let userProfile = null;
const magazinePrice = 2500; // ₦25.00 in kobo

// Optimized initialization
document.addEventListener('DOMContentLoaded', async function() {
    initializeUI();
    await checkAuthFast();
    
    if (currentUser) {
        await loadUserProfileFast();
    }
    
    setupOrderForm();
});

function initializeUI() {
    // Show content immediately for better UX
    const orderLoading = document.getElementById('orderLoading');
    const orderContent = document.getElementById('orderContent');
    
    if (orderLoading && orderContent) {
        orderLoading.style.display = 'none';
        orderContent.style.display = 'block';
    }
    
    // Initialize form handlers immediately
    setupFormHandlers();
}

async function checkAuthFast() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.warn('Auth check warning:', error);
            // Don't redirect immediately, allow guest checkout
            return;
        }
        
        if (session?.user) {
            currentUser = session.user;
            updateAuthUI(true);
        } else {
            updateAuthUI(false);
        }
        
        // Set up auth listener for future changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                currentUser = null;
                updateAuthUI(false);
            } else if (session?.user) {
                currentUser = session.user;
                updateAuthUI(true);
            }
        });
        
    } catch (error) {
        console.warn('Auth check failed:', error);
        // Allow guest checkout
    }
}

function updateAuthUI(isLoggedIn) {
    const signOutBtns = document.querySelectorAll('#signOutBtn, #mobileSignOutBtn');
    const authLinks = document.querySelectorAll('a[href="auth.html"]');
    
    signOutBtns.forEach(btn => {
        if (btn) btn.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    authLinks.forEach(link => {
        if (link && isLoggedIn) {
            link.textContent = 'Dashboard';
            link.href = 'dashboard.html';
        }
    });
}

async function loadUserProfileFast() {
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
            
        if (!profileError && profile) {
            userProfile = profile;
            prefillForm();
        }
        
    } catch (error) {
        console.warn('Profile loading failed:', error);
        // Continue without profile data
    }
}

function prefillForm() {
    if (!userProfile) return;
    
    const fields = {
        'fullName': userProfile.full_name || '',
        'phone': userProfile.phone || '',
        'address': userProfile.address || '',
        'city': userProfile.city || '',
        'state': userProfile.state || '',
        'country': userProfile.country || 'Nigeria'
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    });
}

function setupFormHandlers() {
    const quantitySelect = document.getElementById('quantity');
    const signOutBtns = document.querySelectorAll('#signOutBtn, #mobileSignOutBtn');
    
    if (quantitySelect) {
        quantitySelect.addEventListener('change', updateOrderSummary);
    }
    
    signOutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', handleSignOut);
        }
    });
    
    updateOrderSummary();
}

function setupOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
}

function updateOrderSummary() {
    const quantityElement = document.getElementById('quantity');
    const quantity = quantityElement ? parseInt(quantityElement.value) : 1;
    const total = quantity * magazinePrice;
    
    const summaryQuantity = document.getElementById('summaryQuantity');
    const summaryTotal = document.getElementById('summaryTotal');
    const submitBtn = document.getElementById('orderSubmitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    
    if (summaryQuantity) summaryQuantity.textContent = quantity;
    if (summaryTotal) summaryTotal.textContent = formatAmount(total);
    if (btnText) btnText.textContent = `Proceed to Payment (${formatAmount(total)})`;
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
    
    // Quick validation
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
        showError(`Please fill in: ${missingFields.join(', ')}`);
        return;
    }
    
    const total = orderData.quantity * magazinePrice;
    const orderNumber = `UNF-${Date.now()}`;
    
    try {
        showLoading(true);
        hideError();
        
        // Create order (guest checkout supported)
        const orderPayload = {
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
        };
        
        // Add user_id only if user is logged in
        if (currentUser) {
            orderPayload.user_id = currentUser.id;
        }
        
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderPayload)
            .select()
            .single();
            
        if (orderError) {
            throw orderError;
        }
        
        // Log activity if user is logged in
        if (currentUser) {
            await logActivity('order_created', { order_id: order.id, order_number: orderNumber });
        }
        
        showNotification('Order created successfully! Redirecting to payment...', 'success');
        
        // Simulate payment redirect
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
    if (currentUser) {
        await logActivity('user_logout');
    }
    await supabase.auth.signOut();
    localStorage.removeItem('authRemember');
    window.location.href = 'index.html';
}

async function logActivity(action, details = {}) {
    if (!currentUser) return;
    
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
        console.warn('Activity logging failed:', error);
    }
}

function showLoading(show) {
    const submitBtn = document.getElementById('orderSubmitBtn');
    if (!submitBtn) return;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (show) {
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
    } else {
        if (btnText) btnText.style.display = 'block';
        if (btnLoading) btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function showError(message) {
    const errorEl = document.getElementById('orderError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideError() {
    const errorEl = document.getElementById('orderError');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

function formatAmount(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount / 100);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Optimized styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999',
        padding: '12px 24px',
        borderRadius: '8px',
        color: type === 'success' ? '#000' : '#fff',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#fff' : type === 'error' ? '#000' : '#333',
        border: `1px solid ${type === 'success' ? '#000' : 'transparent'}`
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
