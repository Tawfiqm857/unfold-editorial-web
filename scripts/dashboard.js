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
    // Populate user info
    populateUserInfo();
    
    // Populate analytics
    populateAnalytics();
    
    // Setup tabs
    setupTabs();
    
    // Setup forms
    setupForms();
    
    // Setup sign out buttons
    setupSignOut();
    
    // Populate content for each tab
    populateOverviewTab();
    populateOrdersTab();
    populateProfileTab();
    populateActivityTab();
}

function setupSignOut() {
    const signOutBtns = document.querySelectorAll('#signOutBtn, #mobileSignOutBtn');
    signOutBtns.forEach(btn => {
        btn.addEventListener('click', handleSignOut);
    });
}