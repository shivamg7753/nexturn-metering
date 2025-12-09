import {
  EventSchemaModel,
  MeterModel,
  EventModel,
  CustomerModel,
  PlanModel,
  SubscriptionModel,
  AddOnModel,
  FeatureModel
} from './models';

// --- Interfaces (Kept for backward compatibility with existing code) ---

export interface EventSchema {
  id: string;
  name: string;
  description: string | null;
  dimensions: string; // JSON string
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Meter {
  id: string;
  name: string;
  description: string | null;
  eventSchemaId: string;
  aggregation: string;
  field: string | null;
  filter: string | null; // JSON string
  window: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  transactionId: string;
  eventSchemaId: string;
  timestamp: string; // ISO string
  properties: string; // JSON string
  customerId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  externalId: string;
  name: string;
  email: string;
  currency: string;
  customerType: string;
  billingAddress: string | null; // JSON string
  metadata: string | null; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  type: string;
  interval: string;
  intervalCount: number;
  amountCents: number;
  currency: string;
  payInAdvance: boolean;
  trialPeriod: number;
  charges: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  externalId: string;
  status: string;
  startDate: string; // ISO string
  endDate: string | null; // ISO string
  customerId: string;
  planId: string;
  billingTime: string;
  overriddenPlan: string | null; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface AddOn {
  id: string;
  name: string;
  type: 'license' | 'fixed_fee' | 'credit';
  creditAmountCents?: number;
  createdAt: string;
}

export interface Feature {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
}

// Export a db object that maps to the Mongoose Models
// This allows imports to remain { db } from './db' but methods will change
export const db = {
  eventSchemas: EventSchemaModel,
  meters: MeterModel,
  events: EventModel,
  customers: CustomerModel,
  plans: PlanModel,
  subscriptions: SubscriptionModel,
  addOns: AddOnModel,
  features: FeatureModel,
};
