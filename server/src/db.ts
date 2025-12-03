import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- Interfaces ---

export interface EventSchema {
  id: string;
  name: string;
  description: string | null;
  dimensions: string; // JSON string
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

interface DatabaseData {
  eventSchemas: EventSchema[];
  meters: Meter[];
  events: Event[];
  customers: Customer[];
  plans: Plan[];
  subscriptions: Subscription[];
  addOns: AddOn[];
  features: Feature[];
}

// --- JSON DB Class ---

const DB_FILE = path.join(__dirname, '../data.json');

class JsonDB {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseData = {
        eventSchemas: [],
        meters: [],
        events: [],
        customers: [],
        plans: [],
        subscriptions: [],
        addOns: [],
        features: [],
      };
      this.saveData(initialData);
      return initialData;
    }
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(rawData);
    // Ensure new fields exist for backward compatibility
    if (!data.addOns) data.addOns = [];
    if (!data.features) data.features = [];
    return data;
  }

  private saveData(data: DatabaseData) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- Generic Helpers ---

  generateId(prefix: string = ''): string {
    return prefix + crypto.randomUUID();
  }

  // --- Collections ---

  get eventSchemas() {
    return {
      getAll: () => this.data.eventSchemas,
      find: (predicate: (item: EventSchema) => boolean) => this.data.eventSchemas.find(predicate),
      filter: (predicate: (item: EventSchema) => boolean) => this.data.eventSchemas.filter(predicate),
      create: (item: Omit<EventSchema, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newItem: EventSchema = {
          ...item,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.eventSchemas.push(newItem);
        this.persist();
        return newItem;
      }
    };
  }

  get meters() {
    return {
      getAll: () => this.data.meters,
      find: (predicate: (item: Meter) => boolean) => this.data.meters.find(predicate),
      filter: (predicate: (item: Meter) => boolean) => this.data.meters.filter(predicate),
      create: (item: Omit<Meter, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newItem: Meter = {
          ...item,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.meters.push(newItem);
        this.persist();
        return newItem;
      }
    };
  }

  get events() {
    return {
      getAll: () => this.data.events,
      find: (predicate: (item: Event) => boolean) => this.data.events.find(predicate),
      filter: (predicate: (item: Event) => boolean) => this.data.events.filter(predicate),
      create: (item: Omit<Event, 'id' | 'createdAt'>) => {
        const newItem: Event = {
          ...item,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
        };
        this.data.events.push(newItem);
        this.persist();
        return newItem;
      }
    };
  }

  get customers() {
    return {
      getAll: () => this.data.customers,
      find: (predicate: (item: Customer) => boolean) => this.data.customers.find(predicate),
      filter: (predicate: (item: Customer) => boolean) => this.data.customers.filter(predicate),
      create: (item: Omit<Customer, 'createdAt' | 'updatedAt'>) => {
        const newItem: Customer = {
          ...item,
          // ID is usually passed in for customers, but if not generate one
          id: item.id || this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.customers.push(newItem);
        this.persist();
        return newItem;
      }
    };
  }

  get plans() {
    return {
      getAll: () => this.data.plans,
      find: (predicate: (item: Plan) => boolean) => this.data.plans.find(predicate),
      filter: (predicate: (item: Plan) => boolean) => this.data.plans.filter(predicate),
      create: (item: Omit<Plan, 'createdAt' | 'updatedAt'>) => {
        const newItem: Plan = {
          ...item,
          id: item.id || this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.plans.push(newItem);
        this.persist();
        return newItem;
      },
      update: (id: string, updates: Partial<Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>>) => {
        const index = this.data.plans.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`Plan with id ${id} not found`);

        const updatedItem = {
          ...this.data.plans[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.data.plans[index] = updatedItem;
        this.persist();
        return updatedItem;
      }
    };
  }

  get subscriptions() {
    return {
      getAll: () => this.data.subscriptions,
      find: (predicate: (item: Subscription) => boolean) => this.data.subscriptions.find(predicate),
      filter: (predicate: (item: Subscription) => boolean) => this.data.subscriptions.filter(predicate),
      create: (item: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newItem: Subscription = {
          ...item,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.subscriptions.push(newItem);
        this.persist();
        return newItem;
      }
    };
  }

  get addOns() {
    return {
      getAll: () => this.data.addOns,
      find: (predicate: (item: AddOn) => boolean) => this.data.addOns.find(predicate),
      filter: (predicate: (item: AddOn) => boolean) => this.data.addOns.filter(predicate),
      create: (item: Omit<AddOn, 'id' | 'createdAt'>) => {
        const newItem: AddOn = {
          ...item,
          id: `addon_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        this.data.addOns.push(newItem);
        this.persist();
        return newItem;
      }
    };
  }

  get features() {
    return {
      getAll: () => this.data.features,
      find: (predicate: (item: Feature) => boolean) => this.data.features.find(predicate),
      filter: (predicate: (item: Feature) => boolean) => this.data.features.filter(predicate),
      create: (item: Omit<Feature, 'id' | 'createdAt'>) => {
        const newItem: Feature = {
          ...item,
          id: `feat_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        this.data.features.push(newItem);
        this.persist();
        return newItem;
      }
    };
  }
}

export const db = new JsonDB();
