const API_URL = 'http://localhost:3000/api';

export const api = {
  // Schemas
  getSchemas: async () => {
    const res = await fetch(`${API_URL}/schemas`);
    return res.json();
  },
  createSchema: async (data: any) => {
    const res = await fetch(`${API_URL}/schemas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Meters
  getMeters: async () => {
    const res = await fetch(`${API_URL}/meters`);
    return res.json();
  },
  createMeter: async (data: any) => {
    const res = await fetch(`${API_URL}/meters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // Plans
  getPlans: async () => {
    const res = await fetch(`${API_URL}/plans`);
    return res.json();
  },
  createPlan: async (data: any) => {
    const res = await fetch(`${API_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updatePlan: async (data: any) => {
    const res = await fetch(`${API_URL}/plans/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deletePlan: async (id: string) => {
    const res = await fetch(`${API_URL}/plans/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Subscriptions
  getSubscriptions: async () => {
    const res = await fetch(`${API_URL}/subscriptions`);
    return res.json();
  },
  createSubscription: async (data: any) => {
    const res = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Usage
  getUsage: async (customerId: string, from?: Date, to?: Date) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const res = await fetch(`${API_URL}/usage/${customerId}?${params.toString()}`);
    return res.json();
  },

  // Add-Ons
  getAddOns: async () => {
    const res = await fetch(`${API_URL}/addons`);
    return res.json();
  },
  createAddOn: async (data: any) => {
    const res = await fetch(`${API_URL}/addons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Features
  getFeatures: async () => {
    const res = await fetch(`${API_URL}/features`);
    return res.json();
  },
  createFeature: async (data: any) => {
    const res = await fetch(`${API_URL}/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Customers
  getCustomers: async () => {
    const res = await fetch(`${API_URL}/customers`);
    return res.json();
  },

  // Generic Get
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint.replace('/api', '')}`);
    return res.json();
  }
};
