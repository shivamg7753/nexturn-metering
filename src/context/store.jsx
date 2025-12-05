import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
    organization: {
        id: 'org_1',
        name: 'Demo Corp',
        timezone: 'UTC',
        currency: 'USD',
        email: 'billing@demo.com',
        defaultLocale: 'en-US',
        billingEntities: []
    },
    customers: [],
    plans: [],
    billableMetrics: [],
    subscriptions: [],
    invoices: [],
    events: [],
    wallets: [],
    coupons: [],
    creditNotes: [],
    addOns: [],
    features: []
};

const appReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_CUSTOMER':
            return { ...state, customers: [...state.customers, action.payload] };
        case 'UPDATE_CUSTOMER':
            return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'DELETE_CUSTOMER':
            return { ...state, customers: state.customers.filter(c => c.id !== action.payload) };
        case 'ADD_PLAN':
            return { ...state, plans: [...state.plans, action.payload] };
        case 'UPDATE_PLAN':
            return { ...state, plans: state.plans.map(p => p.id === action.payload.id ? action.payload : p) };
        case 'DELETE_PLAN':
            return { ...state, plans: state.plans.filter(p => p.id !== action.payload) };
        case 'ADD_METRIC':
            return { ...state, billableMetrics: [...state.billableMetrics, action.payload] };
        case 'UPDATE_METRIC':
            return { ...state, billableMetrics: state.billableMetrics.map(m => m.id === action.payload.id ? action.payload : m) };
        case 'DELETE_METRIC':
            return { ...state, billableMetrics: state.billableMetrics.filter(m => m.id !== action.payload) };
        case 'ADD_ADDON':
            return { ...state, addOns: [...state.addOns, action.payload] };
        case 'ADD_FEATURE':
            return { ...state, features: [...state.features, action.payload] };
        case 'ADD_SUBSCRIPTION':
            return { ...state, subscriptions: [...state.subscriptions, action.payload] };
        case 'UPDATE_SUBSCRIPTION':
            return { ...state, subscriptions: state.subscriptions.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'CANCEL_SUBSCRIPTION':
            return {
                ...state,
                subscriptions: state.subscriptions.map(s => s.id === action.payload ? { ...s, status: 'terminated', endDate: new Date().toISOString() } : s)
            };
        case 'ADD_INVOICE':
            return { ...state, invoices: [...state.invoices, action.payload] };
        case 'UPDATE_INVOICE':
            return { ...state, invoices: state.invoices.map(i => i.id === action.payload.id ? action.payload : i) };
        case 'ADD_EVENT':
            return { ...state, events: [...state.events, action.payload] };
        case 'ADD_EVENTS':
            return { ...state, events: [...state.events, ...action.payload] };
        case 'ADD_WALLET':
            return { ...state, wallets: [...state.wallets, action.payload] };
        case 'UPDATE_WALLET':
            return { ...state, wallets: state.wallets.map(w => w.id === action.payload.id ? action.payload : w) };
        case 'ADD_COUPON':
            return { ...state, coupons: [...state.coupons, action.payload] };
        case 'UPDATE_COUPON':
            return { ...state, coupons: state.coupons.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'SET_STATE':
            return action.payload;
        default:
            return state;
    }
};

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
