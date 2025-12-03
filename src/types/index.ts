export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  timezone: string;
  currency: string;
  email: string;
  defaultLocale: string;
  billingEntities: BillingEntity[];
}

export interface BillingEntity {
  id: string;
  name: string;
  legalName: string;
  taxNumber: string;
  address: Address;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
}

export interface Customer {
  id: string;
  externalId: string;
  name: string;
  email: string;
  customerType: 'company' | 'individual';
  timezone?: string;
  currency: string;
  billingAddress: Address;
  taxIdentificationNumber?: string;
  metadata: Record<string, string>;
  subscriptions: Subscription[]; // This might be circular if not careful, maybe just IDs?
  wallet?: Wallet;
  appliedCoupons: AppliedCoupon[];
  createdAt: string; // ISO Date string
}

export interface AppliedCoupon {
  couponId: string;
  name: string;
  amountCents?: number;
  percentageRate?: number;
  frequency: 'once' | 'recurring' | 'forever';
  frequencyDuration?: number; // Remaining periods
  expirationDate?: string;
  appliedAt: string;
}

export interface BillableMetric {
  id: string;
  name: string;
  description?: string;
  aggregationType: 'count' | 'count_unique' | 'sum' | 'max' | 'latest' | 'weighted_sum';
  fieldName?: string;
  recurring: boolean;
  filters?: MetricFilter[];
  roundingFunction?: 'ceil' | 'floor' | 'round';
  roundingPrecision?: number;
  createdAt: string;
}

export interface MetricFilter {
  key: string;
  values: string[];
  operator: 'in' | 'not_in';
}



export interface MinimumCommitment {
  amountCents: number;
  invoiceDisplayName?: string;
  taxCodes?: string[];
}

export interface Threshold {
  amountCents: number;
  recurring: boolean;
}

export type ChargeType = 'fixed' | 'usage' | 'credit' | 'license' | 'entitlement';
export type PricingModel = 'standard' | 'tiered' | 'volume' | 'package' | 'percentage';

export interface Charge {
  id: string;
  type: ChargeType;
  name?: string; // Rate Card Name
  billableMetricId?: string; // For usage-based
  chargeModel?: PricingModel;

  // Common properties
  properties?: any;
  invoiceable: boolean;
  taxes?: Tax[];

  // Usage & License Specifics
  tiers?: Tier[];
  minAmountCents?: number;
  maxAmountCents?: number;

  // Fixed Fee Specifics
  amountCents?: number;
  recurring?: boolean;
  billingInterval?: 'monthly' | 'yearly' | 'quarterly';

  // Credit Specifics
  creditAmountCents?: number;
  creditExpiry?: { type: 'days' | 'months', value: number };

  // Entitlement Specifics
  featureId?: string;
  entitlementLimit?: number;

  // License Specifics
  licenseType?: 'per_seat' | 'named';
}

export interface Tier {
  firstUnit: number;
  lastUnit: number | null; // null for infinity
  unitAmountCents: number;
  flatFeeCents?: number;
  type?: 'flat' | 'per_unit' | 'package';
  packageSize?: number;
}

export interface Tax {
  id: string; // Changed from code to id for consistency if needed, or just remove code if it was the ID
  name: string;
  rate: number;
  description?: string;
}

export interface Subscription {
  id: string;
  externalId: string;
  customerId: string;
  planId: string;
  name?: string;
  status: 'pending' | 'active' | 'terminated' | 'canceled';
  startDate: string;
  endDate?: string;
  billingTime: 'calendar' | 'anniversary';
  overriddenPlan?: Partial<Plan>;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  subscriptionIds: string[];
  issuingDate: string;
  dueDate: string;
  status: 'draft' | 'finalized' | 'paid' | 'overdue' | 'voided';
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  currency: string;
  fees: Fee[];
  subscriptionAmountCents: number;
  chargesAmountCents: number;
  couponsAmountCents: number;
  creditsAmountCents: number;
  taxesAmountCents: number;
  totalAmountCents: number;
  prepaidCreditAmountCents: number;
  createdAt: string;
}

export interface Fee {
  id: string;
  invoiceId: string;
  chargeId?: string;
  subscriptionId?: string;
  type: 'subscription' | 'charge' | 'commitment' | 'credit';
  description: string;
  units: number;
  unitAmountCents: number;
  amountCents: number;
  taxesAmountCents: number;
  totalAmountCents: number;
  eventsCount?: number;
  groupedBy?: any;
}

export interface Event {
  transactionId: string;
  externalSubscriptionId: string;
  eventSchemaId: string;
  timestamp: number; // Unix timestamp in ms
  properties: Record<string, any>;
  preciseAmountCents?: string;
  customerId: string;
  matchedMetric?: BillableMetric;
  warnings?: string[];
}

export interface Wallet {
  id: string;
  customerId: string;
  name?: string;
  balanceCents: number;
  ongoingBalanceCents: number;
  creditsBalanceCents: number;
  creditValueCents: number;
  currency: string;
  expirationDate?: string;
  transactions: WalletTransaction[];
  recurringRules?: RecurringTopUpRule[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amountCents: number;
  creditAmountCents: number;
  type: 'inbound' | 'outbound';
  status: 'pending' | 'settled' | 'failed';
  createdAt: string;
  metadata?: any;
}

export interface RecurringTopUpRule {
  id: string;
  walletId: string;
  amountCents: number;
  trigger: 'interval' | 'threshold';
  interval?: 'weekly' | 'monthly';
  thresholdCents?: number;
}

export interface Coupon {
  id: string;
  name: string;
  code: string;
  couponType: 'fixed_amount' | 'percentage';
  amountCents?: number;
  percentageRate?: number;
  frequency: 'once' | 'recurring' | 'forever';
  frequencyDuration?: number;
  reusable: boolean;
  expirationDate?: string;
  limitedPlans: string[];
  limitedBillableMetrics: string[];
  currency?: string;
  createdAt: string;
}

export interface CreditNote {
  id: string;
  number: string;
  customerId: string;
  invoiceId: string;
  reason: 'duplicate' | 'fraudulent' | 'order_change' | 'product_unsatisfactory' | 'other';
  description?: string;
  creditAmountCents: number;
  refundAmountCents: number;
  balanceAmountCents: number;
  status: 'draft' | 'finalized' | 'voided';
  issuingDate: string;
  createdAt: string;
}



export interface Plan {
  id: string;
  name: string;
  description?: string;
  type: 'recurring' | 'one_time';
  interval: 'weekly' | 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  intervalCount: number;
  amountCents: number;
  currency: string;
  payInAdvance: boolean;
  trialPeriod: number;
  charges: Charge[];
  minimumCommitment?: MinimumCommitment;
  progressiveBillingThresholds?: Threshold[];
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface MinimumCommitment {
  amountCents: number;
  invoiceDisplayName?: string;
  taxCodes?: string[];
}

export interface Threshold {
  amountCents: number;
  recurring: boolean;
}


export interface Subscription {
  id: string;
  externalId: string;
  customerId: string;
  planId: string;
  name?: string;
  status: 'pending' | 'active' | 'terminated' | 'canceled';
  startDate: string;
  endDate?: string;
  billingTime: 'calendar' | 'anniversary';
  overriddenPlan?: Partial<Plan>;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  subscriptionIds: string[];
  issuingDate: string;
  dueDate: string;
  status: 'draft' | 'finalized' | 'paid' | 'overdue' | 'voided';
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  currency: string;
  fees: Fee[];
  subscriptionAmountCents: number;
  chargesAmountCents: number;
  couponsAmountCents: number;
  creditsAmountCents: number;
  taxesAmountCents: number;
  totalAmountCents: number;
  prepaidCreditAmountCents: number;
  createdAt: string;
}

export interface Fee {
  id: string;
  invoiceId: string;
  chargeId?: string;
  subscriptionId?: string;
  type: 'subscription' | 'charge' | 'commitment' | 'credit';
  description: string;
  units: number;
  unitAmountCents: number;
  amountCents: number;
  taxesAmountCents: number;
  totalAmountCents: number;
  eventsCount?: number;
  groupedBy?: any;
}

export interface Event {
  transactionId: string;
  externalSubscriptionId: string;
  code: string;
  timestamp: number; // Unix timestamp in ms
  properties: Record<string, any>;
  preciseAmountCents?: string;
  customerId: string;
  matchedMetric?: BillableMetric;
  warnings?: string[];
}

export interface Wallet {
  id: string;
  customerId: string;
  name?: string;
  balanceCents: number;
  ongoingBalanceCents: number;
  creditsBalanceCents: number;
  creditValueCents: number;
  currency: string;
  expirationDate?: string;
  transactions: WalletTransaction[];
  recurringRules?: RecurringTopUpRule[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amountCents: number;
  creditAmountCents: number;
  type: 'inbound' | 'outbound';
  status: 'pending' | 'settled' | 'failed';
  createdAt: string;
  metadata?: any;
}

export interface RecurringTopUpRule {
  id: string;
  walletId: string;
  amountCents: number;
  trigger: 'interval' | 'threshold';
  interval?: 'weekly' | 'monthly';
  thresholdCents?: number;
}

export interface Coupon {
  id: string;
  name: string;
  couponType: 'fixed_amount' | 'percentage';
  amountCents?: number;
  percentageRate?: number;
  frequency: 'once' | 'recurring' | 'forever';
  frequencyDuration?: number;
  reusable: boolean;
  expirationDate?: string;
  limitedPlans: string[];
  limitedBillableMetrics: string[];
  currency?: string;
  createdAt: string;
}

export interface CreditNote {
  id: string;
  number: string;
  customerId: string;
  invoiceId: string;
  reason: 'duplicate' | 'fraudulent' | 'order_change' | 'product_unsatisfactory' | 'other';
  description?: string;
  creditAmountCents: number;
  refundAmountCents: number;
  balanceAmountCents: number;
  status: 'draft' | 'finalized' | 'voided';
  issuingDate: string;
  createdAt: string;
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
  description?: string;
  type: 'boolean' | 'metered';
  associations?: FeatureAssociation[];
  limit?: number;
  createdAt: string;
}

export interface FeatureAssociation {
  eventSchemaId: string;
  attribute: string; // The field name in the schema
}

export interface EventSchema {
  id: string;
  name: string;
  dimensions: Record<string, any>;
  createdAt: string;
}
