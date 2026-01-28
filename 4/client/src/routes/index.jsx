import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import UsageBillingPage from '../pages/UsageBillingPage';
import ProductCataloguePage from '../pages/ProductCataloguePage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerDetailPage from '../pages/CustomerDetailPage';
import SubscriptionDetailPage from '../pages/SubscriptionDetailPage';
import PlaceholderPage from '../pages/PlaceholderPage';

/**
 * Router Configuration
 * Defines all application routes using React Router
 */

/**
 * Create the application router with all route definitions
 * @param {string} themeMode - Current theme mode
 * @param {Function} onThemeToggle - Theme toggle handler
 * @returns {Router} Configured router instance
 */
export const createAppRouter = (themeMode, onThemeToggle) => {
    return createBrowserRouter([
        {
            path: '/',
            element: <Layout themeMode={themeMode} onThemeToggle={onThemeToggle} />,
            children: [
                {
                    index: true,
                    element: <Navigate to="/usage-billing" replace />,
                },
                {
                    path: 'home',
                    element: <HomePage themeMode={themeMode} />,
                },
                {
                    path: 'usage-billing',
                    element: <UsageBillingPage themeMode={themeMode} />,
                },
                {
                    path: 'products',
                    element: <ProductCataloguePage themeMode={themeMode} />,
                },
                {
                    path: 'products/:productId',
                    element: <ProductDetailPage themeMode={themeMode} />,
                },
                {
                    path: 'customers',
                    element: <CustomersPage themeMode={themeMode} />,
                },
                {
                    path: 'customers/:customerId',
                    element: <CustomerDetailPage themeMode={themeMode} />,
                },
                {
                    path: 'subscriptions/:subscriptionId',
                    element: <SubscriptionDetailPage themeMode={themeMode} />,
                },
                {
                    path: 'balances',
                    element: (
                        <PlaceholderPage
                            title="Balances"
                            description="View and manage account balances"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'transactions',
                    element: (
                        <PlaceholderPage
                            title="Transactions"
                            description="View transaction history"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'revenue',
                    element: (
                        <PlaceholderPage
                            title="Revenue Recovery"
                            description="Track and recover revenue"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'billing-overview',
                    element: (
                        <PlaceholderPage
                            title="Billing Overview"
                            description="View billing summary and metrics"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'invoices',
                    element: (
                        <PlaceholderPage
                            title="Invoices"
                            description="Manage and view invoices"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'subscriptions',
                    element: (
                        <PlaceholderPage
                            title="Subscriptions"
                            description="Manage customer subscriptions"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'payments',
                    element: (
                        <PlaceholderPage
                            title="Payments"
                            description="View and manage payments"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'billing',
                    element: (
                        <PlaceholderPage
                            title="Billing"
                            description="Configure billing settings"
                            themeMode={themeMode}
                        />
                    ),
                },
                {
                    path: 'reporting',
                    element: (
                        <PlaceholderPage
                            title="Reporting"
                            description="View reports and analytics"
                            themeMode={themeMode}
                        />
                    ),
                },
            ],
        },
    ]);
};

/**
 * Route path constants for type-safe navigation
 */
export const ROUTES = {
    HOME: '/home',
    USAGE_BILLING: '/usage-billing',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:productId',
    CUSTOMERS: '/customers',
    CUSTOMER_DETAIL: '/customers/:customerId',
    SUBSCRIPTION_DETAIL: '/subscriptions/:subscriptionId',
    BALANCES: '/balances',
    TRANSACTIONS: '/transactions',
    REVENUE: '/revenue',
    BILLING_OVERVIEW: '/billing-overview',
    INVOICES: '/invoices',
    SUBSCRIPTIONS: '/subscriptions',
    PAYMENTS: '/payments',
    BILLING: '/billing',
    REPORTING: '/reporting',
};

/**
 * Helper to build route paths with parameters
 */
export const buildPath = {
    productDetail: (productId) => `/products/${productId}`,
    customerDetail: (customerId) => `/customers/${customerId}`,
    subscriptionDetail: (subscriptionId) => `/subscriptions/${subscriptionId}`,
};

export default createAppRouter;
