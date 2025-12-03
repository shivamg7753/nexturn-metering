import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  Customer, Plan, BillableMetric, Subscription, Invoice, Event, Wallet, Coupon, Organization, CreditNote, AddOn, Feature
} from '../types';

interface AppState {
  metrics: any;
  organization: Organization;
  customers: Customer[];
  plans: Plan[];
  billableMetrics: BillableMetric[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  events: Event[];
  wallets: Wallet[];
  coupons: Coupon[];
  creditNotes: CreditNote[];
  addOns: AddOn[];
  features: Feature[];
}

// Initial Mock State (Empty for now, will be populated by generators)
const initialState: AppState = {
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

type Action =
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_PLAN'; payload: Plan }
  | { type: 'UPDATE_PLAN'; payload: Plan }
  | { type: 'DELETE_PLAN'; payload: string }
  | { type: 'ADD_METRIC'; payload: BillableMetric }
  | { type: 'UPDATE_METRIC'; payload: BillableMetric }
  | { type: 'DELETE_METRIC'; payload: string }
  | { type: 'ADD_ADDON'; payload: AddOn }
  | { type: 'ADD_FEATURE'; payload: Feature }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'CANCEL_SUBSCRIPTION'; payload: string }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'ADD_EVENTS'; payload: Event[] }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'ADD_COUPON'; payload: Coupon }
  | { type: 'UPDATE_COUPON'; payload: Coupon }
  | { type: 'SET_STATE'; payload: AppState }; // For loading mock data

const appReducer = (state: AppState, action: Action): AppState => {
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

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
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
