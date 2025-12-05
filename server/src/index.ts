import express from 'express';
import cors from 'cors';
import { db } from './db';
import apiRoutes from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount modular API routes (meters, customers, usage)
app.use('/api', apiRoutes);

// --- Legacy Routes (To be modularized) ---
// NOTE: Meters, Customers, and Usage endpoints are now in modular routes
// The following endpoints demonstrate the legacy pattern and should be refactored similarly

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

// 2. Meters (MOVED TO MODULAR ROUTES - see routes/meters.routes.ts)
// app.post('/api/meters', ...) - Now in meters.controller.ts
// app.get('/api/meters', ...) - Now in meters.controller.ts

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

// 4. Customers (MOVED TO MODULAR ROUTES - see routes/customers.routes.ts)
// app.get('/api/customers', ...) - Now in customers.controller.ts
// app.post('/api/customers', ...) - Now in customers.controller.ts

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

// 6. Usage (MOVED TO MODULAR ROUTES - see routes/usage.routes.ts)
// app.get('/api/usage/:customerId', ...) - Now in usage.controller.ts + usage.service.ts
// Business logic extracted to services/usage.service.ts

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

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Modular routes active for: /api/meters, /api/customers, /api/usage`);
});
