import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/store';
import { generateSeedData } from './logic/generator';
import { api } from './api/client';
import { Loader2 } from 'lucide-react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { BillableMetrics } from './pages/BillableMetrics';
import { Plans } from './pages/Plans';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { AccountDetail } from './pages/AccountDetail';
import { Settings } from './pages/Settings';
import { Schemas } from './pages/Schemas';
import { Meters } from './pages/Meters';
import { BillableItems } from './pages/BillableItems';
import { PlanFormPage } from './pages/PlanFormPage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { Events } from './pages/Events';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Simulate } from './pages/Simulate';


const DashboardLoader = () => {
    const { dispatch } = useApp();
    const [loading, setLoading] = useState(true);
    const initialized = React.useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const init = async () => {
            // Generate Seed Data (Customers, Plans, etc.)
            const { plans, customers, subscriptions, events, invoices } = generateSeedData();

            // Fetch Real Meters from Backend
            try {
                const meters = await api.getMeters();
                // Convert backend meters to BillableMetric format
                const realMetrics = meters.map((m) => ({
                    id: m.id,
                    name: m.name,
                    code: m.code,
                    description: m.description,
                    aggregationType: m.aggregation,
                    field: m.field,
                    status: 'active'
                }));

                realMetrics.forEach((m) => dispatch({ type: 'ADD_METRIC', payload: m }));
            } catch (e) {
                console.error("Failed to fetch meters", e);
            }

            // Fetch Real Customers from Backend
            try {
                const realCustomers = await api.getCustomers();
                realCustomers.forEach((c) => dispatch({ type: 'ADD_CUSTOMER', payload: c }));
            } catch (e) {
                console.error("Failed to fetch customers", e);
                // Fallback to seed data if fetch fails
                customers.forEach(c => dispatch({ type: 'ADD_CUSTOMER', payload: c }));
            }

            // Fetch Real Plans from Backend
            try {
                const realPlans = await api.getPlans();
                realPlans.forEach((p) => dispatch({ type: 'ADD_PLAN', payload: p }));
            } catch (e) {
                console.error("Failed to fetch plans", e);
                plans.forEach(p => dispatch({ type: 'ADD_PLAN', payload: p }));
            }

            // Fetch Real Subscriptions from Backend
            try {
                const realSubscriptions = await api.getSubscriptions();
                realSubscriptions.forEach((s) => dispatch({ type: 'ADD_SUBSCRIPTION', payload: s }));
            } catch (e) {
                console.error("Failed to fetch subscriptions", e);
                subscriptions.forEach(s => dispatch({ type: 'ADD_SUBSCRIPTION', payload: s }));
            }

            // Fetch Real Add-Ons from Backend
            try {
                const realAddOns = await api.getAddOns();
                realAddOns.forEach((a) => dispatch({ type: 'ADD_ADDON', payload: a }));
            } catch (e) {
                console.error("Failed to fetch add-ons", e);
                console.error("Failed to fetch add-ons", e);
            }

            // Fetch Real Features from Backend
            try {
                const realFeatures = await api.getFeatures();
                dispatch({ type: 'SET_FEATURES', payload: realFeatures });
            } catch (e) {
                console.error("Failed to fetch features", e);
            }

            // Fetch Real Products from Backend
            try {
                const realProducts = await api.getProducts();
                dispatch({ type: 'SET_PRODUCTS', payload: realProducts });
            } catch (e) {
                console.error("Failed to fetch products", e);
            }

            // plans.forEach(p => dispatch({ type: 'ADD_PLAN', payload: p })); // Removed seed plans
            // subscriptions.forEach(s => dispatch({ type: 'ADD_SUBSCRIPTION', payload: s })); // Removed seed subscriptions
            dispatch({ type: 'ADD_EVENTS', payload: events });
            invoices.forEach(i => dispatch({ type: 'ADD_INVOICE', payload: i }));

            setLoading(false);
        };

        init();
    }, [dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">Initializing Metering Engine...</h2>
                    <p className="text-gray-500">Generating mock data and simulating backend</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="customers/:id" element={<CustomerDetail />} />
                    <Route path="accounts/:accountId" element={<AccountDetail />} />
                    <Route path="plans" element={<Plans />} />
                    <Route path="plans/:id" element={<PlanDetailPage />} />
                    <Route path="plans/new" element={<PlanFormPage />} />
                    <Route path="plans/edit/:id" element={<PlanFormPage />} />
                    <Route path="billable-metrics" element={<BillableMetrics />} />
                    <Route path="invoices" element={<PlaceholderPage title="Invoices" />} />
                    <Route path="credit-notes" element={<PlaceholderPage title="Credit Notes" />} />
                    <Route path="events" element={<Events />} />
                    <Route path="simulate" element={<Simulate />} />
                    <Route path="coupons" element={<PlaceholderPage title="Coupons" />} />
                    <Route path="wallets" element={<PlaceholderPage title="Wallets" />} />
                    <Route path="schemas" element={<Schemas />} />
                    <Route path="meters" element={<Meters />} />
                    <Route path="billable-items" element={<BillableItems />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetail />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

function App() {
    return (
        <AppProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#363636',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <DashboardLoader />
        </AppProvider>
    );
}

export default App;
