import {
  Customer, Plan, BillableMetric, Subscription, Invoice, Event, Wallet, Coupon, Charge, BillingEntity, Address
} from '../types';
import { generateId } from '../lib/utils';
import { addDays, subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

// --- Constants & Helpers ---

const CURRENCIES = ['USD', 'EUR', 'GBP'];
const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'CA'];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// --- Generators ---

export const generateAddress = (): Address => ({
  line1: `${randomInt(1, 999)} ${randomItem(['Main St', 'Broadway', '5th Ave', 'Park Ln', 'Market St'])}`,
  city: randomItem(['New York', 'London', 'Berlin', 'Paris', 'San Francisco', 'Tokyo']),
  zip: `${randomInt(10000, 99999)}`,
  country: randomItem(COUNTRIES),
});

export const generateBillableMetrics = (): BillableMetric[] => [
  {
    id: 'bm_api_calls',
    name: 'API Calls',
    code: 'api_calls',
    description: 'Number of API requests made',
    aggregationType: 'count',
    recurring: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm_storage',
    name: 'Storage',
    code: 'storage_gb',
    description: 'Storage used in GB',
    aggregationType: 'latest',
    fieldName: 'storage_gb',
    recurring: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm_users',
    name: 'Active Users',
    code: 'active_users',
    description: 'Unique active users',
    aggregationType: 'count_unique',
    fieldName: 'user_id',
    recurring: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm_compute',
    name: 'Compute Hours',
    code: 'compute_hours',
    description: 'Total compute hours used',
    aggregationType: 'sum',
    fieldName: 'duration_hours',
    recurring: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm_bandwidth',
    name: 'Bandwidth',
    code: 'bandwidth_gb',
    description: 'Data transferred in GB',
    aggregationType: 'sum',
    fieldName: 'bytes',
    recurring: false,
    createdAt: new Date().toISOString(),
  }
];

export const generatePlans = (metrics: BillableMetric[]): Plan[] => {
  const plans: Plan[] = [
    {
      id: 'plan_free',
      name: 'Free Tier',
      code: 'free',
      description: 'For hobbyists and side projects',
      interval: 'monthly',
      amountCents: 0,
      currency: 'USD',
      payInAdvance: true,
      trialPeriod: 0,
      charges: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'plan_starter',
      name: 'Starter',
      code: 'starter',
      description: 'Essential features for small teams',
      interval: 'monthly',
      amountCents: 2900,
      currency: 'USD',
      payInAdvance: true,
      trialPeriod: 14,
      charges: [
        {
          id: generateId('ch_'),
          billableMetricId: 'bm_api_calls',
          chargeModel: 'standard',
          properties: { amountCents: 1 }, // $0.01 per call? Maybe too high. 0.1 cents? Let's say 0.001 USD = 0.1 cents. 
          // Wait, amountCents is integer. So 1 cent per call is minimum unless we use precise amounts.
          // Let's assume standard model properties has `amountCents`.
          // For micro-transactions, usually we need more precision. 
          // For this mock, let's say 1 cent per 100 calls (package) or just 1 cent per call for simplicity.
          payInAdvance: false,
          prorated: false,
          invoiceable: true,
        }
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'plan_pro',
      name: 'Professional',
      code: 'pro',
      description: 'Advanced features for scaling businesses',
      interval: 'monthly',
      amountCents: 9900,
      currency: 'USD',
      payInAdvance: true,
      trialPeriod: 14,
      charges: [
        {
          id: generateId('ch_'),
          billableMetricId: 'bm_users',
          chargeModel: 'graduated',
          properties: {
            graduatedRanges: [
              { to: 10, perUnitAmountCents: 0, flatAmountCents: 0 },
              { to: 50, perUnitAmountCents: 500, flatAmountCents: 0 },
              { to: null, perUnitAmountCents: 300, flatAmountCents: 0 },
            ]
          },
          payInAdvance: true,
          prorated: true,
          invoiceable: true,
        }
      ],
      createdAt: new Date().toISOString(),
    }
  ];
  return plans;
};

export const generateCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: generateId('cus_'),
    externalId: `ext_${randomInt(1000, 9999)}`,
    name: randomItem(['Acme Corp', 'Globex', 'Soylent Corp', 'Umbrella Corp', 'Stark Ind', 'Wayne Ent', 'Cyberdyne', 'Massive Dynamic']),
    email: `billing@${generateId()}.com`,
    customerType: randomItem(['company', 'individual']),
    currency: 'USD',
    billingAddress: generateAddress(),
    metadata: {},
    subscriptions: [],
    appliedCoupons: [],
    createdAt: subMonths(new Date(), randomInt(1, 12)).toISOString(),
  }));
};

// --- Main Seed Function ---

export const generateSeedData = () => {
  const metrics = generateBillableMetrics();
  const plans = generatePlans(metrics);
  const customers = generateCustomers(20);

  // Assign some subscriptions
  const subscriptions: Subscription[] = [];
  customers.forEach(customer => {
    if (Math.random() > 0.3) { // 70% have a subscription
      const plan = randomItem(plans);
      const startDate = new Date(customer.createdAt);
      subscriptions.push({
        id: generateId('sub_'),
        externalId: `sub_${randomInt(10000, 99999)}`,
        customerId: customer.id,
        planId: plan.id,
        status: 'active',
        startDate: startDate.toISOString(),
        billingTime: 'calendar',
        createdAt: startDate.toISOString(),
      });
    }
  });

  return {
    metrics,
    plans,
    customers,
    subscriptions,
    events: generateHistoricalEvents(customers, metrics),
    invoices: generateHistoricalInvoices(subscriptions, plans),
  };
};

export const generateHistoricalEvents = (customers: Customer[], metrics: BillableMetric[]): Event[] => {
  const events: Event[] = [];
  const now = new Date();
  const threeMonthsAgo = subMonths(now, 3);

  customers.forEach(customer => {
    // Generate 50-100 events per customer
    const eventCount = randomInt(50, 100);
    for (let i = 0; i < eventCount; i++) {
      const metric = randomItem(metrics);
      const date = randomDate(threeMonthsAgo, now);

      let properties: any = {};
      if (metric.code === 'api_calls') {
        properties = { method: randomItem(['GET', 'POST', 'PUT']), path: '/v1/users' };
      } else if (metric.code === 'storage_gb') {
        properties = { storage_gb: randomInt(1, 100) };
      } else if (metric.code === 'compute_hours') {
        properties = { duration_hours: Math.random() * 10 };
      } else if (metric.code === 'active_users') {
        properties = { user_id: `user_${randomInt(1, 20)}` };
      } else if (metric.code === 'bandwidth_gb') {
        properties = { bytes: randomInt(1000, 1000000) };
      }

      events.push({
        transactionId: generateId('evt_'),
        externalSubscriptionId: `sub_${customer.externalId}`, // Simplified linking
        code: metric.code,
        timestamp: date.getTime(),
        properties,
        customerId: customer.id,
        matchedMetric: metric,
      });
    }
  });

  return events.sort((a, b) => b.timestamp - a.timestamp);
};

export const generateHistoricalInvoices = (subscriptions: Subscription[], plans: Plan[]): Invoice[] => {
  const invoices: Invoice[] = [];
  const now = new Date();

  subscriptions.forEach(sub => {
    const plan = plans.find(p => p.id === sub.planId);
    if (!plan) return;

    // Generate 1-3 past invoices
    const invoiceCount = randomInt(1, 3);
    for (let i = 1; i <= invoiceCount; i++) {
      const date = subMonths(now, i);
      const amount = plan.amountCents + randomInt(0, 5000); // Base + random usage

      invoices.push({
        id: generateId('inv_'),
        number: `INV-${format(date, 'yyyyMM')}-${randomInt(1000, 9999)}`,
        customerId: sub.customerId,
        subscriptionIds: [sub.id],
        issuingDate: date.toISOString(),
        dueDate: addDays(date, 14).toISOString(),
        status: 'paid',
        paymentStatus: 'succeeded',
        currency: plan.currency,
        fees: [], // Simplified for now
        subscriptionAmountCents: plan.amountCents,
        chargesAmountCents: amount - plan.amountCents,
        couponsAmountCents: 0,
        creditsAmountCents: 0,
        taxesAmountCents: 0,
        totalAmountCents: amount,
        prepaidCreditAmountCents: 0,
        createdAt: date.toISOString(),
      });
    }
  });

  return invoices.sort((a, b) => new Date(b.issuingDate).getTime() - new Date(a.issuingDate).getTime());
};


export const generateEvents = generateHistoricalEvents;