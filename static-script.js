// Static JavaScript for UNFOLD Magazine

// Theme management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        // Check for saved theme or default to light mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        // Add event listener for theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Mobile navigation
class MobileNavigation {
    constructor() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileNav = document.getElementById('mobileNav');
        this.init();
    }

    init() {
        if (this.mobileMenuBtn && this.mobileNav) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMenu());
            
            // Close menu when clicking on links
            const navLinks = this.mobileNav.querySelectorAll('.mobile-nav-link, .mobile-nav-btn');
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.mobileMenuBtn.contains(e.target) && !this.mobileNav.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }
    }

    toggleMenu() {
        const isOpen = this.mobileNav.classList.contains('active');
        if (isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.mobileNav.classList.add('active');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.mobileNav.classList.remove('active');
        this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// Newsletter subscription
class NewsletterManager {
    constructor() {
        this.form = document.getElementById('newsletterForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const emailInput = this.form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (this.validateEmail(email)) {
            this.subscribeUser(email);
            emailInput.value = '';
            this.showMessage('Thanks for subscribing! You\'ll receive our latest updates.', 'success');
        } else {
            this.showMessage('Please enter a valid email address.', 'error');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    subscribeUser(email) {
        // In a real implementation, this would send the email to your backend
        console.log('Subscribing email:', email);
        
        // Store in localStorage for demo purposes
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        }
    }

    showMessage(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Smooth scrolling for anchor links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Animation observer for scroll-triggered animations
class AnimationObserver {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            // Observe all elements with animation classes
            document.querySelectorAll('[class*="animate-"]').forEach(el => {
                this.observer.observe(el);
            });
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// User preferences manager
class UserPreferences {
    constructor() {
        this.preferences = this.loadPreferences();
        this.init();
    }

    init() {
        // Apply saved preferences
        this.applyPreferences();
        
        // Save preferences when user interacts
        this.setupPreferenceListeners();
    }

    loadPreferences() {
        const saved = localStorage.getItem('unfold_preferences');
        return saved ? JSON.parse(saved) : {
            theme: 'light',
            reducedMotion: false,
            fontSize: 'medium'
        };
    }

    savePreferences() {
        localStorage.setItem('unfold_preferences', JSON.stringify(this.preferences));
    }

    applyPreferences() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.preferences.theme);
        
        // Apply reduced motion preference
        if (this.preferences.reducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.01s');
        }
        
        // Apply font size
        document.documentElement.classList.add(`font-size-${this.preferences.fontSize}`);
    }

    setupPreferenceListeners() {
        // Listen for theme changes
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.preferences.theme = this.preferences.theme === 'light' ? 'dark' : 'light';
                this.savePreferences();
            });
        }

        // Listen for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.preferences.reducedMotion = mediaQuery.matches;
        mediaQuery.addListener((e) => {
            this.preferences.reducedMotion = e.matches;
            this.savePreferences();
            this.applyPreferences();
        });
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });

        // Monitor user interactions
        this.setupInteractionTracking();
    }

    measurePageLoad() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
            this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            
            console.log('Page Performance:', this.metrics);
        }
    }

    setupInteractionTracking() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, a[href]')) {
                this.trackInteraction('click', e.target);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackInteraction('form_submit', e.target);
        });
    }

    trackInteraction(type, element) {
        const interaction = {
            type,
            element: element.tagName.toLowerCase(),
            className: element.className,
            timestamp: Date.now()
        };
        
        console.log('User Interaction:', interaction);
        
        // In a real implementation, you might send this data to an analytics service
    }
}

// Accessibility enhancements
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        // Add keyboard support for custom interactive elements
        document.addEventListener('keydown', (e) => {
            // Space or Enter on buttons
            if ((e.key === ' ' || e.key === 'Enter') && e.target.matches('.btn:not(button)')) {
                e.preventDefault();
                e.target.click();
            }

            // Escape to close mobile menu
            if (e.key === 'Escape') {
                const mobileNav = document.getElementById('mobileNav');
                if (mobileNav && mobileNav.classList.contains('active')) {
                    const mobileNavigation = new MobileNavigation();
                    mobileNavigation.closeMenu();
                }
            }
        });
    }

    setupScreenReaderSupport() {
        // Add screen reader announcements for dynamic content
        this.announceToScreenReader = (message) => {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        };
    }

    setupFocusManagement() {
        // Improve focus visibility
        document.addEventListener('focusin', (e) => {
            e.target.setAttribute('data-focused', 'true');
        });

        document.addEventListener('focusout', (e) => {
            e.target.removeAttribute('data-focused');
        });

        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new ThemeManager();
    new MobileNavigation();
    new NewsletterManager();
    new SmoothScroll();
    new AnimationObserver();
    new UserPreferences();
    new PerformanceMonitor();
    new AccessibilityManager();

    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        [data-focused="true"] {
            outline: 2px solid var(--ring);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);

    console.log('UNFOLD Magazine - Static site initialized successfully!');
});

// Export for potential use in other scripts
window.UnfoldMagazine = {
    ThemeManager,
    MobileNavigation,
    NewsletterManager,
    SmoothScroll,
    AnimationObserver,
    UserPreferences,
    PerformanceMonitor,
    AccessibilityManager
};