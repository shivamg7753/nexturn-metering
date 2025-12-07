import mongoose from 'mongoose';
import crypto from 'crypto';

// --- Event Schema ---
const eventSchemaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  name: { type: String, required: true },
  description: { type: String },
  dimensions: { type: String, required: true }, // Keeping as JSON string for now to match interface
  status: { type: String, required: true, enum: ['draft', 'active', 'archived'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const EventSchemaModel = mongoose.model('EventSchema', eventSchemaSchema);

// --- Meter ---
const meterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  name: { type: String, required: true },
  description: { type: String },
  eventSchemaId: { type: String, required: true },
  aggregation: { type: String, required: true },
  field: { type: String },
  filter: { type: String }, // JSON string
  window: { type: String },
  eventLevelCalculation: { type: String },
  status: { type: String, required: true, enum: ['draft', 'active', 'archived'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const MeterModel = mongoose.model('Meter', meterSchema);

// --- Event ---
const eventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  transactionId: { type: String, required: true, unique: true },
  eventSchemaId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  properties: { type: String, required: true }, // JSON string
  customerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const EventModel = mongoose.model('Event', eventSchema);

// --- Customer ---
const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  externalId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  currency: { type: String, required: true },
  customerType: { type: String, required: true },
  billingAddress: { type: String }, // JSON string
  metadata: { type: String }, // JSON string
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const CustomerModel = mongoose.model('Customer', customerSchema);

// --- Plan ---
const planSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true },
  interval: { type: String, required: true },
  intervalCount: { type: Number, required: true },
  amountCents: { type: Number, required: true },
  currency: { type: String, required: true },
  payInAdvance: { type: Boolean, required: true },
  trialPeriod: { type: Number, required: true },
  charges: { type: String, required: true }, // JSON string
  status: { type: String, required: true, enum: ['draft', 'active', 'archived'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PlanModel = mongoose.model('Plan', planSchema);

// --- Subscription ---
const subscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => crypto.randomUUID() },
  externalId: { type: String, required: true },
  status: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  customerId: { type: String, required: true },
  planId: { type: String, required: true },
  billingTime: { type: String, required: true },
  overriddenPlan: { type: String }, // JSON string
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);

// --- AddOn ---
const addOnSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => `addon_${Date.now()}` }, // Matching old format for addons
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['license', 'fixed_fee', 'credit'] },
  creditAmountCents: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export const AddOnModel = mongoose.model('AddOn', addOnSchema);

// --- Feature ---
const featureSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, default: () => `feat_${Date.now()}` }, // Matching old format for features
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  associations: { type: String }, // JSON string
  createdAt: { type: Date, default: Date.now },
});

export const FeatureModel = mongoose.model('Feature', featureSchema);
