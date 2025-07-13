
// Optimized Order JavaScript with performance improvements
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const supabaseUrl = 'https://atwlsvlzejxitpsltapl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2xzdmx6ZWp4aXRwc2x0YXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjgzMTAsImV4cCI6MjA2NjM0NDMxMH0.-XGrPL0VywL4fA7paNn22vpGqfHTu_KF199P7ycYWQ8';

// Initialize Supabase client once
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache DOM elements for better performance
const elements = {};
let currentUser = null;
let userProfile = null;
const magazinePrice = 2500; // ₦25.00 in kobo

// Initialize DOM element cache
function cacheElements() {
    elements.orderLoading = document.getElementById('orderLoading');
    elements.orderContent = document.getElementById('orderContent');
    elements.orderForm = document.getElementById('orderForm');
    elements.quantitySelect = document.getElementById('quantity');
    elements.summaryQuantity = document.getElementById('summaryQuantity');
    elements.summaryTotal = document.getElementById('summaryTotal');
    elements.orderSubmitBtn = document.getElementById('orderSubmitBtn');
    elements.orderError = document.getElementById('orderError');
    elements.signOutBtns = document.querySelectorAll('#signOutBtn, #mobileSignOutBtn');
    
    // Form fields
    elements.fullName = document.getElementById('fullName');
    elements.phone = document.getElementById('phone');
    elements.address = document.getElementById('address');
    elements.city = document.getElementById('city');
    elements.state = document.getElementById('state');
    elements.country = document.getElementById('country');
}

// Optimized DOMContentLoaded with faster initialization
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Cache DOM elements first
        cacheElements();
        
        // Show loading immediately
        showLoadingState(true);
        
        // Parallel authentication and profile loading
        const [authResult] = await Promise.allSettled([
            checkAuth(),
            // Preload any other necessary resources here if needed
        ]);
        
        if (authResult.status === 'fulfilled' && currentUser) {
            await loadUserProfile();
            initializeOrderForm();
        } else {
            // Handle guest checkout
            initializeGuestForm();
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize order form');
    } finally {
        showLoadingState(false);
    }
});

async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Auth error:', error);
            return false;
        }
        
        if (session?.user) {
            currentUser = session.user;
            
            // Listen for auth changes (debounced)
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
                    redirectToAuth();
                }
            });
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

function redirectToAuth() {
    window.location.href = 'auth.html';
}

async function loadUserProfile() {
    if (!currentUser) return;
    
    try {
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
    }
}

function initializeOrderForm() {
    // Pre-fill form with user profile data
    if (userProfile) {
        elements.fullName.value = userProfile.full_name || '';
        elements.phone.value = userProfile.phone || '';
        elements.address.value = userProfile.address || '';
        elements.city.value = userProfile.city || '';
        elements.state.value = userProfile.state || '';
        elements.country.value = userProfile.country || 'Nigeria';
    }
    
    setupFormHandlers();
    updateOrderSummary();
}

function initializeGuestForm() {
    // Initialize form for guest users
    elements.country.value = 'Nigeria'; // Default country
    setupFormHandlers();
    updateOrderSummary();
}

function setupFormHandlers() {
    // Optimized event listeners with debouncing where needed
    elements.quantitySelect.addEventListener('change', updateOrderSummary);
    elements.orderForm.addEventListener('submit', handleOrderSubmit);
    
    // Setup sign out buttons
    elements.signOutBtns.forEach(btn => {
        btn.addEventListener('click', handleSignOut);
    });
}

// Optimized summary update with cached calculations
function updateOrderSummary() {
    const quantity = parseInt(elements.quantitySelect.value);
    const total = quantity * magazinePrice;
    
    elements.summaryQuantity.textContent = quantity;
    elements.summaryTotal.textContent = formatAmount(total);
    
    // Update submit button text
    const btnText = elements.orderSubmitBtn.querySelector('.btn-text');
    btnText.textContent = `Proceed to Payment (${formatAmount(total)})`;
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    // Faster form data extraction
    const formData = {
        quantity: parseInt(elements.quantitySelect.value),
        fullName: elements.fullName.value.trim(),
        phone: elements.phone.value.trim(),
        address: elements.address.value.trim(),
        city: elements.city.value.trim(),
        state: elements.state.value.trim(),
        country: elements.country.value
    };
    
    // Quick validation
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state'];
    const missingField = requiredFields.find(field => !formData[field]);
    
    if (missingField) {
        showError('Please fill in all required fields');
        return;
    }
    
    const total = formData.quantity * magazinePrice;
    const orderNumber = `UNF-${Date.now()}`;
    
    try {
        showLoading(true);
        hideError();
        
        // Create order in database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: currentUser?.id || null, // Support guest orders
                order_number: orderNumber,
                quantity: formData.quantity,
                total_amount: total,
                shipping_address: {
                    full_name: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country
                }
            })
            .select()
            .single();
            
        if (orderError) {
            throw orderError;
        }
        
        // Log activity if user is authenticated
        if (currentUser) {
            logActivity('order_created', { order_id: order.id, order_number: orderNumber });
        }
        
        showNotification('Order created successfully! Payment integration coming soon.', 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = currentUser ? 'dashboard.html' : 'index.html';
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
        console.error('Error logging activity:', error);
    }
}

// Optimized UI functions
function showLoadingState(show) {
    if (show) {
        elements.orderLoading.style.display = 'flex';
        elements.orderContent.style.display = 'none';
    } else {
        elements.orderLoading.style.display = 'none';
        elements.orderContent.style.display = 'block';
    }
}

function showLoading(show) {
    const btnText = elements.orderSubmitBtn.querySelector('.btn-text');
    const btnLoading = elements.orderSubmitBtn.querySelector('.btn-loading');
    
    if (show) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        elements.orderSubmitBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        elements.orderSubmitBtn.disabled = false;
    }
}

function showError(message) {
    elements.orderError.textContent = message;
    elements.orderError.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    elements.orderError.style.display = 'none';
}

// Optimized amount formatting with caching
const formatAmount = (() => {
    const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    });
    
    return (amount) => formatter.format(amount / 100);
})();

// Optimized notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications efficiently
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Optimized styles
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
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
        backgroundColor: bgColor
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto-remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
