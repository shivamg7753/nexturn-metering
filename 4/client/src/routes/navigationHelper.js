/**
 * Navigation Helper
 * Provides navigation utilities and state management
 */

/**
 * Navigation context for managing application navigation
 */
export class NavigationManager {
    constructor() {
        this.currentRoute = 'usage-billing';
        this.params = {};
        this.history = [];
    }

    /**
     * Navigate to a route
     * @param {string} routeKey - Route key to navigate to
     * @param {Object} params - Optional route parameters
     */
    navigate(routeKey, params = {}) {
        this.history.push({
            route: this.currentRoute,
            params: { ...this.params },
        });
        this.currentRoute = routeKey;
        this.params = params;
    }

    /**
     * Navigate back to previous route
     * @returns {Object|null} Previous route or null if no history
     */
    goBack() {
        if (this.history.length === 0) return null;
        const previous = this.history.pop();
        this.currentRoute = previous.route;
        this.params = previous.params;
        return previous;
    }

    /**
     * Get current route
     * @returns {string} Current route key
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Get current params
     * @returns {Object} Current route parameters
     */
    getParams() {
        return this.params;
    }

    /**
     * Clear navigation history
     */
    clearHistory() {
        this.history = [];
    }
}

/**
 * Navigation helper functions
 */

/**
 * Build navigation handlers for common patterns
 * @param {Function} setActivePage - State setter for active page
 * @param {Function} setParam - State setter for route parameter
 * @returns {Object} Navigation handler functions
 */
export const buildNavigationHandlers = (setActivePage, setParam) => {
    return {
        navigateToCustomer: (customerId) => {
            setParam('customerId', customerId);
            setActivePage('customer-detail');
        },
        navigateBackToCustomers: () => {
            setParam('customerId', null);
            setActivePage('customers');
        },
        navigateToSubscription: (subscriptionId) => {
            setParam('subscriptionId', subscriptionId);
            setActivePage('subscription-detail');
        },
        navigateBackFromSubscription: (customerId) => {
            setParam('subscriptionId', null);
            if (customerId) {
                setActivePage('customer-detail');
            } else {
                setActivePage('customers');
            }
        },
        navigateToProduct: (productId) => {
            setParam('productId', productId);
            setActivePage('product-detail');
        },
        navigateBackToProducts: () => {
            setParam('productId', null);
            setActivePage('products');
        },
    };
};

export default NavigationManager;
