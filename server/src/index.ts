import express from 'express';
import cors from 'cors';
import { db } from './db';
import apiRoutes from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import connectDB from './config/db.config';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Mount modular API routes (meters, customers, usage)
app.use('/api', apiRoutes);

// --- Legacy Routes (To be modularized) ---
// NOTE: Meters, Customers, and Usage endpoints are now in modular routes
// The following endpoints demonstrate the legacy pattern and should be refactored similarly

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: 'mongo' });
});

// --- Add-Ons Endpoints ---
app.get('/api/addons', async (req, res) => {
  try {
    const addons = await db.addOns.find({});
    res.json(addons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
});

app.post('/api/addons', async (req, res) => {
  try {
    const { name, type, creditAmountCents } = req.body;
    // Mongoose create returns a Promise
    const newAddOn = await db.addOns.create({ name, type, creditAmountCents });
    res.json(newAddOn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create add-on' });
  }
});

app.put('/api/addons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, creditAmountCents } = req.body;
    const updatedAddOn = await db.addOns.findOneAndUpdate(
      { id },
      { name, type, creditAmountCents, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedAddOn) return res.status(404).json({ error: 'Add-on not found' });
    res.json(updatedAddOn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update add-on' });
  }
});

// --- Features Endpoints ---
app.get('/api/features', async (req, res) => {
  try {
    const features = await db.features.find({});
    res.json(features);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

app.post('/api/features', async (req, res) => {
  try {
    const { name, code, description, associations } = req.body;
    // Auto-generate code if not provided
    const featureCode = code || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Store associations as JSON string if provided
    const associationsStr = associations ? JSON.stringify(associations) : undefined;

    const newFeature = await db.features.create({
      name,
      code: featureCode,
      description,
      associations: associationsStr
    });
    res.json(newFeature);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

app.put('/api/features/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, associations } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (code) updates.code = code;
    if (description !== undefined) updates.description = description;
    if (associations) updates.associations = JSON.stringify(associations);

    const updatedFeature = await db.features.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    );

    if (!updatedFeature) return res.status(404).json({ error: 'Feature not found' });
    res.json(updatedFeature);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

// 1. Event Schemas
app.get('/api/schemas', async (req, res) => {
  try {
    const schemas = await db.eventSchemas.find({});
    res.json(schemas.map(s => ({ ...s.toObject(), dimensions: JSON.parse(s.dimensions) })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch schemas' });
  }
});

app.post('/api/schemas', async (req, res) => {
  try {
    const { name, description, dimensions, status } = req.body;
    const schema = await db.eventSchemas.create({
      name,
      description,
      dimensions: typeof dimensions === 'string' ? dimensions : JSON.stringify(dimensions || {}),
      status: status || 'draft',
    });
    res.json(schema);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create schema' });
  }
});

app.put('/api/schemas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, dimensions, status } = req.body;

    // Fetch existing schema to check constraints
    const existingSchema = await db.eventSchemas.findOne({ id });
    if (!existingSchema) return res.status(404).json({ error: 'Schema not found' });

    const updates: any = { updatedAt: new Date() };

    // If status is provided, update it (lifecycle transition)
    if (status) {
      updates.status = status;
    }

    // Rules:
    // 1. If currently Draft, allow editing everything.
    // 2. If currently Active/Archived, only status change allowed (or NO edits to definition).
    // User requirement: "when schema is active we cant edit it... so we can edit when its status is draft"

    const isDraft = existingSchema.status === 'draft';
    const isUpdatingDefinition = name || description || dimensions;

    if (!isDraft && isUpdatingDefinition) {
      // Allow name/desc update? Usually strict versioning prevents this. 
      // Sticking to strict interpretation: No definition edits if not draft.
      // However, if the user sends the same data, maybe filter?
      // For now, if they try to update definition fields while not draft, we ignore them OR error. 
      // Let's ERROR to be clear, or just ignore. ignoring is safer for simple UIs.
      // But wait, if I ignore, the UI might think it saved.
      // Let's check if the values are actually changing? No, simpler:
      // If not draft, only apply status update.

      // actually, usually Description is editable. Name/Dimensions are locked.
      // User said "active we cant edit it". I'll assume LOCK ALL definition.
    } else {
      // Draft, or making no definition changes (just status)
      if (name) updates.name = name;
      if (description) updates.description = description;
      if (dimensions) updates.dimensions = typeof dimensions === 'string' ? dimensions : JSON.stringify(dimensions || {});
    }

    const schema = await db.eventSchemas.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    );
    if (!schema) return res.status(404).json({ error: 'Schema not found' });
    res.json({ ...schema.toObject(), dimensions: JSON.parse(schema.dimensions) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update schema' });
  }
});

// 2. Meters (MOVED TO MODULAR ROUTES - see routes/meters.routes.ts)
// app.post('/api/meters', ...) - Now in meters.controller.ts
// app.get('/api/meters', ...) - Now in meters.controller.ts

// 3. Ingest Events
app.post('/api/events', async (req, res) => {
  try {
    const { transactionId, eventSchemaId, timestamp, properties, customerId } = req.body;

    // Validate schema exists
    const schema = await db.eventSchemas.findOne({ id: eventSchemaId });
    if (!schema) {
      return res.status(400).json({ error: `Event schema '${eventSchemaId}' not found` });
    }

    // Idempotency check
    const existingEvent = await db.events.findOne({ transactionId });

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

    const event = await db.events.create({
      transactionId,
      eventSchemaId,
      timestamp: eventTimestamp, // Mongoose expects Date object or valid string
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
    const plans = await db.plans.find({});
    res.json(plans.map(p => ({
      ...p.toObject(),
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
    // Assuming ID is passed, but schema handles default if not. If passed, Mongoose uses it.
    // If id is passed, we should use it.
    const planData: any = {
      name,
      description,
      interval,
      type,
      intervalCount,
      amountCents,
      currency,
      charges: JSON.stringify(charges || []),
      payInAdvance,
      trialPeriod,
      productId: req.body.productId,
      status: req.body.status || 'draft'
    };
    if (id) planData.id = id;

    const plan = await db.plans.create(planData);
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

app.put('/api/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, interval, type, intervalCount, amountCents, currency, charges, payInAdvance, trialPeriod, productId } = req.body;
    const plan = await db.plans.findOneAndUpdate(
      { id },
      {
        name,
        description,
        interval,
        type,
        intervalCount,
        amountCents,
        currency,
        charges: JSON.stringify(charges || []),
        payInAdvance,
        trialPeriod,
        productId,
        status: req.body.status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// 5.5 Subscriptions
app.get('/api/subscriptions', async (req, res) => {
  try {
    const subscriptions = await db.subscriptions.find({});
    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const { customerId, planId, status, startDate, endDate, billingTime, overriddenPlan } = req.body;

    const initialStatus = status || 'active';

    // Validate Plan exists
    const newPlan = await db.plans.findOne({ id: planId });
    if (!newPlan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    try {
      const fs = require('fs');
      fs.appendFileSync('debug.log', `[${new Date().toISOString()}] CHECK: customer=${customerId} plan=${planId} productId='${newPlan.productId}' status=${initialStatus}\n`);
    } catch (e) { }

    // Enforce One Active Plan Per Product
    if (initialStatus === 'active' && newPlan.productId) {
      const activeSubscriptions = await db.subscriptions.find({
        customerId,
        status: 'active'
      });

      for (const sub of activeSubscriptions) {
        const existingPlan = await db.plans.findOne({ id: sub.planId });
        // If existing plan belongs to the same product, reject
        if (existingPlan && existingPlan.productId === newPlan.productId) {
          return res.status(400).json({
            error: `Customer already has an active subscription for this product (${existingPlan.productId}). Only one active plan allowed per product.`
          });
        }
      }
    }

    const subscription = await db.subscriptions.create({
      customerId,
      planId,
      status: initialStatus,
      startDate: startDate || new Date(),
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

// Update subscription (e.g., cancel)
app.patch('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const subscription = await db.subscriptions.findOneAndUpdate(
      { id },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// 7. Events List (Recent Activity)
app.get('/api/events/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const events = await db.events.find({ customerId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(events.map(e => ({ ...e.toObject(), properties: JSON.parse(e.properties) })));
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
    const subscriptions = await db.subscriptions.find({ customerId, status: 'active' });
    const planIds = subscriptions.map(s => s.planId);
    const plans = await db.plans.find({ id: { $in: planIds } });

    // 2. Fetch all events for the customer
    // Note: In production, this should be time-boxed (e.g., current billing period)
    const events = await db.events.find({ customerId });

    const parsedEvents = events.map(e => ({
      ...e.toObject(),
      properties: JSON.parse(e.properties),
    }));

    // 3. Group by Endpoint
    const usageByEndpoint: Record<string, {
      endpoint: string,
      costCents: number,
      requestCount: number,
      bandwidthBytes: number
    }> = {};

    const meters = await db.meters.find({});

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
