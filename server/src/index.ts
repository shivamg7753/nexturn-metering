import express from 'express';
import cors from 'cors';
import { db } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



// --- Routes ---

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Add-Ons Endpoints ---
app.get('/api/addons', (req, res) => {
  res.json(db.addOns.getAll());
});

app.post('/api/addons', (req, res) => {
  try {
    const { name, type, creditAmountCents } = req.body;
    const newAddOn = db.addOns.create({ name, type, creditAmountCents });
    res.json(newAddOn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create add-on' });
  }
});

// --- Features Endpoints ---
app.get('/api/features', (req, res) => {
  res.json(db.features.getAll());
});

app.post('/api/features', (req, res) => {
  try {
    const { name, code, description } = req.body;
    const newFeature = db.features.create({ name, code, description });
    res.json(newFeature);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

// 1. Event Schemas
app.post('/api/schemas', async (req, res) => {
  try {
    const { name, description, dimensions } = req.body;
    const schema = db.eventSchemas.create({
      name,
      description,
      dimensions: JSON.stringify(dimensions || {}),
    });
    res.json(schema);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create schema' });
  }
});

app.get('/api/schemas', async (req, res) => {
  const schemas = db.eventSchemas.getAll();
  res.json(schemas.map(s => ({ ...s, dimensions: JSON.parse(s.dimensions) })));
});

// 2. Meters
app.post('/api/meters', async (req, res) => {
  try {
    const { name, description, eventSchemaId, aggregation, field, filter, window } = req.body;
    const meter = db.meters.create({
      name,
      description,
      eventSchemaId,
      aggregation,
      field,
      filter: JSON.stringify(filter || {}),
      window,
    });
    res.json(meter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create meter' });
  }
});

app.get('/api/meters', async (req, res) => {
  const meters = db.meters.getAll();
  res.json(meters.map(m => ({ ...m, filter: JSON.parse(m.filter || '{}') })));
});

// 3. Ingest Events
app.post('/api/events', async (req, res) => {
  try {
    const { transactionId, eventSchemaId, timestamp, properties, customerId } = req.body;

    // Validate schema exists
    const schema = db.eventSchemas.find(s => s.id === eventSchemaId);
    if (!schema) {
      return res.status(400).json({ error: `Event schema '${eventSchemaId}' not found` });
    }

    // Idempotency check
    const existingEvent = db.events.find(e => e.transactionId === transactionId);

    if (existingEvent) {
      return res.json(existingEvent);
    }

    // Parse and validate timestamp, fallback to current time if invalid
    let eventTimestamp = new Date();
    if (timestamp) {
      const parsedTimestamp = new Date(timestamp);
      if (!isNaN(parsedTimestamp.getTime())) {
        eventTimestamp = parsedTimestamp;
      } else {
        console.warn(`Invalid timestamp received: ${timestamp}, using current time`);
      }
    }

    const event = db.events.create({
      transactionId,
      eventSchemaId,
      timestamp: eventTimestamp.toISOString(),
      properties: JSON.stringify(properties || {}),
      customerId,
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to ingest event' });
  }
});

// 4. Customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = db.customers.getAll();
    res.json(customers.map(c => ({
      ...c,
      billingAddress: JSON.parse(c.billingAddress as string || '{}'),
      metadata: JSON.parse(c.metadata as string || '{}'),
      subscriptions: [], // Populate if needed
      appliedCoupons: []
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { id, name, email, externalId, billingAddress, metadata } = req.body;
    const customer = db.customers.create({
      id,
      name,
      email,
      externalId,
      billingAddress: JSON.stringify(billingAddress || {}),
      metadata: JSON.stringify(metadata || {}),
      currency: 'USD',
      customerType: 'individual'
    });
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// 5. Plans
app.get('/api/plans', async (req, res) => {
  try {
    const plans = db.plans.getAll();
    res.json(plans.map(p => ({
      ...p,
      charges: JSON.parse(p.charges as string || '[]'),
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const { id, name, description, interval, type, intervalCount, amountCents, currency, charges, payInAdvance, trialPeriod } = req.body;
    const plan = db.plans.create({
      id,
      name,
      description,
      interval,
      type,
      intervalCount,
      amountCents,
      currency,
      charges: JSON.stringify(charges || []),
      payInAdvance,
      trialPeriod
    });
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

app.put('/api/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, interval, type, intervalCount, amountCents, currency, charges, payInAdvance, trialPeriod } = req.body;
    const plan = db.plans.update(id, {
      name,
      description,
      interval,
      type,
      intervalCount,
      amountCents,
      currency,
      charges: JSON.stringify(charges || []),
      payInAdvance,
      trialPeriod
    });
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// 5.5 Subscriptions
app.get('/api/subscriptions', async (req, res) => {
  try {
    const subscriptions = db.subscriptions.getAll();
    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const { customerId, planId, status, startDate, endDate, billingTime, overriddenPlan } = req.body;
    const subscription = db.subscriptions.create({
      customerId,
      planId,
      status: status || 'active',
      startDate: startDate || new Date().toISOString(),
      endDate,
      billingTime: billingTime || 'calendar',
      overriddenPlan: overriddenPlan ? JSON.stringify(overriddenPlan) : null,
      externalId: `sub_ext_${Date.now()}`
    });
    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// 6. Usage
app.get('/api/usage/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { from, to } = req.query;

    const startDate = from ? new Date(from as string) : new Date(0);
    const endDate = to ? new Date(to as string) : new Date();

    // 1. Get Customer's Active Subscriptions
    const subscriptions = db.subscriptions.filter(s =>
      s.customerId === customerId && s.status === 'active'
    );

    // 2. Get Plans for these subscriptions
    const planIds = subscriptions.map(s => s.planId);
    const plans = db.plans.filter(p => planIds.includes(p.id));

    // 3. Extract relevant Meter IDs from Plan Charges
    const relevantMeterIds = new Set<string>();
    for (const plan of plans) {
      const charges = JSON.parse(plan.charges as string || '[]');
      for (const charge of charges) {
        if (charge.billableMetricId) {
          relevantMeterIds.add(charge.billableMetricId);
        }
      }
    }

    // 4. Fetch only relevant meters
    let meters: any[] = [];
    if (relevantMeterIds.size > 0) {
      meters = db.meters.filter(m => relevantMeterIds.has(m.id));
    } else {
      meters = [];
    }

    const usage = [];

    for (const meter of meters) {
      // Fetch events for this meter's schema and customer within range
      const events = db.events.filter(e =>
        e.eventSchemaId === meter.eventSchemaId &&
        e.customerId === customerId &&
        new Date(e.timestamp) >= startDate &&
        new Date(e.timestamp) <= endDate
      );

      // Parse properties
      const parsedEvents = events.map(e => ({
        ...e,
        properties: JSON.parse(e.properties),
      }));

      // Apply Filter
      const rawFilter = JSON.parse(meter.filter || '[]');
      const filters = Array.isArray(rawFilter) ? rawFilter : Object.entries(rawFilter).map(([k, v]) => ({ key: k, operator: 'equals', value: v }));

      const filteredEvents = parsedEvents.filter(e => {
        for (const filter of filters) {
          const eventValue = e.properties[filter.key];
          const targetValue = filter.value;

          if (eventValue === undefined && filter.operator !== 'not_equals') return false;

          switch (filter.operator) {
            case 'equals':
              if (String(eventValue) !== String(targetValue)) return false;
              break;
            case 'not_equals':
              if (String(eventValue) === String(targetValue)) return false;
              break;
            case 'gt':
              if (Number(eventValue) <= Number(targetValue)) return false;
              break;
            case 'lt':
              if (Number(eventValue) >= Number(targetValue)) return false;
              break;
            case 'contains':
              if (!String(eventValue).includes(String(targetValue))) return false;
              break;
            default:
              if (String(eventValue) !== String(targetValue)) return false;
          }
        }
        return true;
      });

      // Aggregate
      let value = 0;
      if (meter.aggregation === 'count') {
        value = filteredEvents.length;
      } else if (meter.aggregation === 'sum' && meter.field) {
        value = filteredEvents.reduce((sum, e) => sum + (Number(e.properties[meter.field!]) || 0), 0);
      } else if (meter.aggregation === 'max' && meter.field) {
        value = Math.max(...filteredEvents.map(e => Number(e.properties[meter.field!]) || 0), 0);
      } else if (meter.aggregation === 'unique_count' && meter.field) {
        const uniqueValues = new Set(filteredEvents.map(e => e.properties[meter.field!]));
        value = uniqueValues.size;
      }

      // Calculate Cost
      let costCents = 0;
      let currency = 'USD'; // Default

      // Find the charge for this meter in the active plans
      for (const plan of plans) {
        const charges = JSON.parse(plan.charges as string || '[]');
        const charge = charges.find((c: any) => c.billableMetricId === meter.id);

        if (charge) {
          currency = plan.currency;
          const price = Number(charge.properties?.amountCents || 0);

          if (charge.chargeModel === 'standard') {
            costCents = value * price;
          } else if (charge.chargeModel === 'package') {
            const packageSize = Number(charge.properties?.packageSize || 1);
            const packages = Math.ceil(value / packageSize);
            costCents = packages * price;
          }
          // TODO: Implement volume/tiered pricing
          break; // Assume one active charge per meter for now
        }
      }

      usage.push({
        meterId: meter.id,
        meterName: meter.name,
        value,
        costCents,
        currency,
        window: { from: startDate, to: endDate },
      });
    }

    res.json({ customerId, usage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate usage' });
  }
});

// 7. Events List (Recent Activity)
app.get('/api/events/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const events = db.events.filter(e => e.customerId === customerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    res.json(events.map(e => ({ ...e, properties: JSON.parse(e.properties) })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// 8. Analytics: Usage Breakdown by Endpoint
app.get('/api/analytics/usage-by-endpoint/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    // 1. Get Customer's Active Subscriptions & Plans
    const subscriptions = db.subscriptions.filter(s => s.customerId === customerId && s.status === 'active');
    const planIds = subscriptions.map(s => s.planId);
    const plans = db.plans.filter(p => planIds.includes(p.id));

    // 2. Fetch all events for the customer
    // Note: In production, this should be time-boxed (e.g., current billing period)
    const events = db.events.filter(e => e.customerId === customerId);

    const parsedEvents = events.map(e => ({
      ...e,
      properties: JSON.parse(e.properties),
    }));

    // 3. Group by Endpoint
    const usageByEndpoint: Record<string, {
      endpoint: string,
      costCents: number,
      requestCount: number,
      bandwidthBytes: number
    }> = {};

    const meters = db.meters.getAll();

    // Process each event
    for (const event of parsedEvents) {
      const endpoint = event.properties.endpoint || 'unknown';

      if (!usageByEndpoint[endpoint]) {
        usageByEndpoint[endpoint] = { endpoint, costCents: 0, requestCount: 0, bandwidthBytes: 0 };
      }

      const stats = usageByEndpoint[endpoint];

      // Update raw stats
      stats.requestCount++;
      if (event.properties.request_size_bytes || event.properties.response_size_bytes) {
        stats.bandwidthBytes += (Number(event.properties.request_size_bytes) || 0) + (Number(event.properties.response_size_bytes) || 0);
      }

      // Calculate Cost Contribution for this event
      // Iterate over all active meters to see if this event matches
      for (const meter of meters) {
        if (meter.eventSchemaId === event.eventSchemaId) {
          // Check filters
          const rawFilter = JSON.parse(meter.filter || '[]');
          const filters = Array.isArray(rawFilter) ? rawFilter : Object.entries(rawFilter).map(([k, v]) => ({ key: k, operator: 'equals', value: v }));

          let matches = true;
          for (const filter of filters) {
            const val = event.properties[filter.key];
            if (String(val) !== String(filter.value)) { matches = false; break; }
          }

          if (matches) {
            // Find charge in active plans
            for (const plan of plans) {
              const charges = JSON.parse(plan.charges as string || '[]');
              const charge = charges.find((c: any) => c.billableMetricId === meter.id);

              if (charge) {
                const price = Number(charge.properties?.amountCents || 0);
                let effectiveUnitPrice = 0;

                if (charge.chargeModel === 'standard') {
                  effectiveUnitPrice = price;
                } else if (charge.chargeModel === 'package') {
                  const packageSize = Number(charge.properties?.packageSize || 1);
                  effectiveUnitPrice = price / packageSize;
                }

                // Calculate contribution based on aggregation
                if (meter.aggregation === 'count') {
                  stats.costCents += effectiveUnitPrice;
                } else if (meter.aggregation === 'sum' && meter.field) {
                  const val = Number(event.properties[meter.field]) || 0;
                  stats.costCents += val * effectiveUnitPrice;
                }
              }
            }
          }
        }
      }
    }

    res.json(Object.values(usageByEndpoint));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate breakdown' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
