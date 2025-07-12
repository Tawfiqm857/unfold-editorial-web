// Main dashboard orchestrator
import { checkAuth } from './dashboard-auth.js';
import { loadUserData } from './dashboard-data.js';
import { populateUserInfo, populateAnalytics, setupTabs, populateOverviewTab, populateOrdersTab, populateProfileTab, populateActivityTab } from './dashboard-ui.js';
import { setupForms } from './dashboard-forms.js';
import { handleSignOut } from './dashboard-auth.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const isAuthenticated = await checkAuth();
    
    if (isAuthenticated) {
        await loadUserData();
        initializeDashboard();
    }
});

function initializeDashboard() {
    // Populate user info (including avatar)
    populateUserInfo();
    
    // Populate analytics
    populateAnalytics();
    
    // Setup tabs (if using tabs)
    setupTabs();
    
    // Setup forms
    setupForms();
    
    // Setup sign out buttons
    setupSignOut();
    
    // Populate content sections
    populateOverviewTab();
    populateOrdersTab();
    populateProfileTab();
    populateActivityTab();
    
    // Setup quick action buttons
    setupQuickActions();
}

function setupSignOut() {
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleSignOut);
    }
}

function setupQuickActions() {
    // Setup order magazine buttons
    const orderButtons = document.querySelectorAll('button');
    orderButtons.forEach(btn => {
        if (btn.textContent.includes('Order Magazine') || btn.textContent.includes('Order Now')) {
            btn.addEventListener('click', () => {
                window.location.href = 'order.html';
            });
        }
        if (btn.textContent.includes('Browse Articles')) {
            btn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    });
}