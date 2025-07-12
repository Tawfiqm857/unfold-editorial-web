// Dashboard configuration and global state
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

const supabaseUrl = 'https://atwlsvlzejxitpsltapl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0d2xzdmx6ZWp4aXRwc2x0YXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjgzMTAsImV4cCI6MjA2NjM0NDMxMH0.-XGrPL0VywL4fA7paNn22vpGqfHTu_KF199P7ycYWQ8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Global state
export let currentUser = null;
export let userProfile = null;
export let userOrders = [];
export let userActivity = [];

// State setters
export function setCurrentUser(user) {
    currentUser = user;
}

export function setUserProfile(profile) {
    userProfile = profile;
}

export function setUserOrders(orders) {
    userOrders = orders;
}

export function setUserActivity(activity) {
    userActivity = activity;
}