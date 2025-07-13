
// Main dashboard orchestrator
import { checkAuth } from './dashboard-auth.js';
import { loadUserData } from './dashboard-data.js';
import { populateUserInfo, populateAnalytics, setupTabs, populateOverviewTab, populateOrdersTab, populateProfileTab, populateActivityTab } from './dashboard-ui.js';
import { setupForms } from './dashboard-forms.js';
import { handleSignOut } from './dashboard-auth.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    
    if (isAuthenticated) {
        // Initialize dashboard structure immediately
        initializeDashboardStructure();
        
        // Load data in background
        await loadUserData();
        
        // Populate with loaded data
        initializeDashboardContent();
    }
});

function initializeDashboardStructure() {
    // Setup interactive elements that don't require data
    setupTabs();
    setupForms();
    setupSignOut();
    setupQuickActions();
}

function initializeDashboardContent() {
    // Populate sections with data
    populateUserInfo();
    populateAnalytics();
    populateOverviewTab();
    populateOrdersTab();
    populateProfileTab();
    populateActivityTab();
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
