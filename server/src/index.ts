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

// 4. Simulate Events

// Quota Check for Simulation
app.get('/api/simulate/quota-check', async (req, res) => {
  try {
    const { customerId, accountIds, eventSchemaId, eventCount, properties } = req.query;

    // Validate required fields
    if (!customerId || !accountIds || !eventSchemaId || !eventCount) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    const targetAccountIds = JSON.parse(accountIds as string);
    const count = parseInt(eventCount as string);
    const eventProperties = properties ? JSON.parse(properties as string) : {};

    // Get event schema to find associated meters
    const schema = await db.eventSchemas.findOne({ id: eventSchemaId });
    if (!schema) {
      return res.status(404).json({ error: 'Event schema not found' });
    }

    // Get all meters that use this schema
    const meters = await db.meters.find({ eventSchemaId });

    const quotaChecks: any[] = [];

    // Check quota for each account
    for (const accountId of targetAccountIds) {
      console.log('=== Checking account:', accountId);

      // Get active subscriptions for this account
      const subscriptions = await db.subscriptions.find({
        customerId: accountId,
        status: 'active'
      });

      console.log('Found subscriptions:', subscriptions.length);
      console.log('Subscriptions:', subscriptions);

      if (subscriptions.length === 0) {
        console.log('No subscriptions found for account:', accountId);
        continue; // Skip accounts with no subscriptions
      }

      // Get plans for these subscriptions
      const planIds = subscriptions.map(sub => sub.planId);
      console.log('Looking for plans with IDs:', planIds);

      const plans = await db.plans.find({ id: { $in: planIds } });
      console.log('Found plans:', plans.length);
      if (plans.length > 0) {
        console.log('Plan details:', plans.map((p: any) => ({ id: p.id, name: p.name, hasCharges: !!p.charges })));
      }

      // Collect all billable metric IDs from the plans
      const metricIds = plans.flatMap(plan =>
        (JSON.parse(plan.charges as string || '[]') as any[])
          .filter((c: any) => c.type === 'usage' && c.billableMetricId)
          .map((c: any) => c.billableMetricId)
      );

      // Fetch all relevant meters for the plans
      const meters = await db.meters.find({ id: { $in: metricIds } });

      // Check ALL charges in plans for quotas (not just meter-based)
      for (const plan of plans) {
        const charges = JSON.parse(plan.charges as string || '[]');
        console.log('Plan', plan.name, 'has', charges.length, 'charges');

        for (const charge of charges) {
          console.log('Checking charge:', charge.name, 'type:', charge.type);

          // Check for quota in all possible locations (like QuotaUsageCard does)
          let quotaValue =
            charge.entitlementLimit ||           // Entitlement charges
            charge.properties?.quota ||          // Usage-based charges
            charge.quota ||                      // Direct quota field
            charge.properties?.maxUnits ||       // Max units
            charge.properties?.maxLicenseQuantity || // License limits
            charge.properties?.creditsToBeIssued;    // Credit-based

          // Tiered/Volume Limit Logic - ROBUST CHECK (Matching Frontend QuotaUsageCard)
          if (!quotaValue && charge.tiers && Array.isArray(charge.tiers) && charge.tiers.length > 0) {
            console.log('Checking tiers for quota:', charge.tiers);

            // Filter out tiers that are clearly infinite
            const finiteTiers = charge.tiers.filter((t: any) =>
              t.lastUnit !== null &&
              t.lastUnit !== undefined &&
              t.lastUnit !== '∞' &&
              String(t.lastUnit) !== ''
            );

            console.log('Finite tiers found:', finiteTiers.length, 'Total tiers:', charge.tiers.length);

            // If all tiers are finite, use the max limit
            if (finiteTiers.length === charge.tiers.length && finiteTiers.length > 0) {
              const maxLimit = Math.max(...finiteTiers.map((t: any) => Number(t.lastUnit)));
              if (maxLimit > 0 && !isNaN(maxLimit)) quotaValue = maxLimit;
            } else if (charge.tiers[0] && charge.tiers[0].lastUnit && charge.tiers[0].lastUnit !== '∞') {
              // Fallback: Use the FIRST tier's limit (e.g. Free Tier limit)
              const firstTierLimit = Number(charge.tiers[0].lastUnit);
              if (firstTierLimit > 0 && !isNaN(firstTierLimit)) {
                console.log('Using First Tier limit as quota:', firstTierLimit);
                quotaValue = firstTierLimit;
              }
            }
          }

          if (quotaValue === undefined || quotaValue === null || quotaValue === '' || quotaValue === 0) {
            console.log('No quota found for charge:', charge.name);
            continue;
          }

          console.log('✅ Found quota:', quotaValue, 'for charge:', charge.name);
          const quotaLimit = Number(quotaValue);

          // Calculate current usage based on charge type
          let currentUsage = 0;
          let simulatedUsage = 0;

          if (charge.type === 'entitlement') {
            // ENTITLEMENT: Calculate from events with feature property
            console.log('Processing ENTITLEMENT charge');
            const featureName = charge.properties?.featureName || charge.name;

            const allEvents = await db.events.find({ customerId: accountId });
            const matchingEvents = allEvents.filter(e => {
              try {
                const props = typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties;
                return props[featureName] !== undefined;
              } catch {
                return false;
              }
            });

            currentUsage = matchingEvents.reduce((sum, e) => {
              try {
                const props = typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties;
                return sum + (Number(props[featureName]) || 0);
              } catch {
                return sum;
              }
            }, 0);

            // Simulated usage for entitlement
            simulatedUsage = (Number(eventProperties[featureName]) || 0) * count;
            console.log('Entitlement usage:', currentUsage, 'simulated:', simulatedUsage);

          } else if (charge.type === 'usage' && charge.billableMetricId) {
            // USAGE: Calculate from meter
            console.log('Processing USAGE charge');
            const meter = meters.find(m => m.id === charge.billableMetricId);

            if (meter) {
              console.log('Found meter:', meter.name, 'Aggregation:', meter.aggregation, 'Schema:', meter.eventSchemaId);
              if (meter.filter) console.log('Meter Filter:', meter.filter);

              const meterEvents = await db.events.find({
                eventSchemaId: meter.eventSchemaId,
                customerId: accountId
              });
              console.log('Events with schema match:', meterEvents.length);

              const parsedEvents = meterEvents.map(e => ({
                ...e.toObject(),
                properties: typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties,
              }));

              let filteredEvents = parsedEvents;
              if (meter.filter) {
                try {
                  const rawFilter = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
                  const filters = Array.isArray(rawFilter) ? rawFilter : [rawFilter];
                  filteredEvents = parsedEvents.filter(event => {
                    return filters.every((filter: any) => {
                      const val = event.properties[filter.key];
                      return String(val) === String(filter.value);
                    });
                  });
                } catch (e) { console.log('Filter Parsing Error', e); }
              }

              console.log('Events after filter:', filteredEvents.length);

              if (meter.aggregation === 'count') {
                currentUsage = filteredEvents.length;
                simulatedUsage = count;
                console.log('Count Aggregation: +', count);
              } else if (meter.aggregation === 'sum' && meter.field) {
                const fieldName = meter.field;
                currentUsage = filteredEvents.reduce((sum, event) => {
                  return sum + (Number(event.properties[fieldName]) || 0);
                }, 0);
                const simVal = Number(eventProperties[meter.field]) || 0;
                simulatedUsage = simVal * count;
                console.log('Sum Aggregation:', fieldName, 'SimVal:', simVal, 'Count:', count, 'Total Sim:', simulatedUsage);
              }
            } else {
              console.log('❌ Meter not found for ID:', charge.billableMetricId);
              console.log('Available meters:', meters.map(m => m.id));
            }

          } else {
            // GENERIC/LICENSE: Show limit but no usage calculation
            console.log('Processing', charge.type, 'charge - showing limit only');
            currentUsage = 0;
            simulatedUsage = 0;
          }

          const totalAfterSimulation = currentUsage + simulatedUsage;
          const remaining = quotaLimit - currentUsage;
          const wouldExceed = totalAfterSimulation > quotaLimit;

          // Determine the target field for input simulation
          let targetField = '';
          if (charge.type === 'entitlement') {
            const featureName = charge.properties?.featureName || charge.name;
            targetField = featureName;
          } else if (charge.type === 'usage' && charge.billableMetricId) {
            const meter = meters.find(m => m.id === charge.billableMetricId);
            if (meter && meter.aggregation === 'sum' && meter.field) {
              targetField = meter.field;
            }
          }

          // Collect debug info
          const allUserEvents = await db.events.find({ customerId: accountId });
          const distinctSchemas = [...new Set(allUserEvents.map((e: any) => e.eventSchemaId))];

          let sampleKeys: string[] = [];
          if (allUserEvents.length > 0) {
            const lastEvent = allUserEvents[allUserEvents.length - 1];
            try {
              const props = typeof lastEvent.properties === 'string' ? JSON.parse(lastEvent.properties) : lastEvent.properties;
              sampleKeys = Object.keys(props);
            } catch { }
          }

          // Define meter variable for scope access (should be defined in block above)
          const meterForDebug = (charge.type === 'usage' && charge.billableMetricId)
            ? meters.find(m => m.id === charge.billableMetricId)
            : undefined;

          let targetFieldReason = '';
          if (targetField) {
            targetFieldReason = 'Resolved from Schema/Feature';
          } else {
            if (charge.type === 'usage') {
              if (!meterForDebug) targetFieldReason = 'Meter not found';
              else if (meterForDebug.aggregation === 'count') targetFieldReason = 'Aggregation is count (No input needed)';
              else if (!meterForDebug.field) targetFieldReason = 'Meter field is undefined';
              else targetFieldReason = 'Unknown usage error';
            } else if (charge.type === 'entitlement') {
              targetFieldReason = 'Entitlement (Should have resolved)';
            }
          }

          quotaChecks.push({
            accountId,
            planId: plan.id,
            planName: plan.name,
            meterName: charge.name,
            chargeType: charge.type,
            targetField,
            currentUsage,
            quota: quotaLimit,
            remaining: Math.max(0, remaining),
            simulatedUsage,
            totalAfterSimulation,
            wouldExceed,
            // Debug Fields
            meterSchemaId: meterForDebug ? meterForDebug.eventSchemaId : 'N/A',
            meterAggregation: meterForDebug ? meterForDebug.aggregation : 'N/A',
            meterField: meterForDebug ? meterForDebug.field : 'N/A',
            userEventSchemas: distinctSchemas,
            matchedEventCount: meterForDebug ? (currentUsage > 0 ? 'Usage > 0' : `0 (Check Filters)`) : 0,
            sampleEventKeys: sampleKeys,
            targetFieldReason // <--- New debug field
          });
        }
      }
    }

    // Determine if simulation is allowed (all quotas must be ok)
    const anyExceeded = quotaChecks.some(check => check.wouldExceed);
    const allowed = !anyExceeded;

    res.json({
      allowed,
      quotas: quotaChecks,
      message: anyExceeded
        ? 'Quota would be exceeded - simulation not allowed'
        : 'Simulation allowed'
    });

  } catch (error) {
    console.error('Error checking quota:', error);
    res.status(500).json({ error: 'Failed to check quota' });
  }
});

app.post('/api/simulate', async (req, res) => {
  try {
    const { customerId, accountSelection, accountIds, eventSchemaId, eventConfig } = req.body;

    // Validate required fields
    if (!customerId || !eventSchemaId || !eventConfig) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate customer exists
    const customer = await db.customers.findOne({ id: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Validate event schema exists
    const schema = await db.eventSchemas.findOne({ id: eventSchemaId });
    if (!schema) {
      return res.status(404).json({ error: 'Event schema not found' });
    }

    // Determine target accounts
    let targetAccountIds = [];
    if (accountSelection === 'all') {
      // Find all accounts for this customer
      const allCustomerAccounts = await db.customers.find({
        $or: [
          { id: customerId },
          { 'metadata': new RegExp(`"parentCustomerId":"${customerId}"`) }
        ]
      });
      targetAccountIds = allCustomerAccounts.map(a => a.id);
    } else if (accountSelection === 'specific') {
      if (!accountIds || accountIds.length === 0) {
        return res.status(400).json({ error: 'No account IDs provided for specific selection' });
      }
      targetAccountIds = accountIds;
    } else {
      return res.status(400).json({ error: 'Invalid account selection type' });
    }

    // Validate accounts exist
    for (const accountId of targetAccountIds) {
      const account = await db.customers.findOne({ id: accountId });
      if (!account) {
        return res.status(404).json({ error: `Account ${accountId} not found` });
      }
    }

    const { count = 1, properties = {} } = eventConfig;
    const eventsToCreate = Math.min(Math.max(1, count), 100); // Limit to 1-100 events

    // ===== QUOTA VALIDATION =====
    // Check quotas before creating events (Universal check logic)
    const quotaChecks: any[] = [];
    const meters = await db.meters.find({ eventSchemaId });

    for (const accountId of targetAccountIds) {
      // Get ALL subscriptions and filter (same as GET endpoint fix)
      const allSubscriptions = await db.subscriptions.find({});
      const subscriptions = allSubscriptions.filter(
        (s: any) => s.customerId === accountId && s.status === 'active'
      );

      if (subscriptions.length > 0) {
        const planIds = subscriptions.map(sub => sub.planId);
        const plans = await db.plans.find({ id: { $in: planIds } });

        // Check ALL charges in plans for quotas
        for (const plan of plans) {
          const charges = JSON.parse(plan.charges as string || '[]');

          for (const charge of charges) {
            // Check for quota definitions
            const quotaValue =
              charge.entitlementLimit ||
              charge.properties?.quota ||
              charge.quota ||
              charge.properties?.maxUnits ||
              charge.properties?.maxLicenseQuantity ||
              charge.properties?.creditsToBeIssued;

            if (quotaValue === undefined || quotaValue === null || quotaValue === '' || quotaValue === 0) {
              continue;
            }

            const quotaLimit = Number(quotaValue);

            // Calculate current usage based on charge type
            let currentUsage = 0;
            let simulatedUsage = 0;

            if (charge.type === 'entitlement' && charge.featureId) {
              // ENTITLEMENT: Calculate from events with feature property
              const featureName = charge.properties?.featureName || charge.name;

              const allEvents = await db.events.find({ customerId: accountId });
              const matchingEvents = allEvents.filter(e => {
                try {
                  const props = typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties;
                  return props[featureName] !== undefined;
                } catch {
                  return false;
                }
              });

              currentUsage = matchingEvents.reduce((sum, e) => {
                try {
                  const props = typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties;
                  return sum + (Number(props[featureName]) || 0);
                } catch {
                  return sum;
                }
              }, 0);

              // Simulated usage for entitlement
              simulatedUsage = (Number(properties[featureName]) || 0) * eventsToCreate;

            } else if (charge.type === 'usage' && charge.billableMetricId) {
              // USAGE: Calculate from meter
              const meter = meters.find(m => m.id === charge.billableMetricId);

              if (meter) {
                const meterEvents = await db.events.find({
                  eventSchemaId: meter.eventSchemaId,
                  customerId: accountId
                });

                const parsedEvents = meterEvents.map(e => ({
                  ...e.toObject(),
                  properties: typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties,
                }));

                let filteredEvents = parsedEvents;
                if (meter.filter) {
                  try {
                    const rawFilter = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
                    const filters = Array.isArray(rawFilter) ? rawFilter : [rawFilter];
                    filteredEvents = parsedEvents.filter(event => {
                      return filters.every((filter: any) => {
                        const val = event.properties[filter.key];
                        return String(val) === String(filter.value);
                      });
                    });
                  } catch (e) { }
                }

                if (meter.aggregation === 'count') {
                  currentUsage = filteredEvents.length;
                  simulatedUsage = eventsToCreate;
                } else if (meter.aggregation === 'sum' && meter.field) {
                  const fieldName = meter.field;
                  currentUsage = filteredEvents.reduce((sum, event) => {
                    return sum + (Number(event.properties[fieldName]) || 0);
                  }, 0);
                  simulatedUsage = (Number(properties[meter.field]) || 0) * eventsToCreate;
                }
              }
            }

            const totalAfterSimulation = currentUsage + simulatedUsage;
            const remaining = quotaLimit - currentUsage;
            const wouldExceed = totalAfterSimulation > quotaLimit;

            quotaChecks.push({
              accountId,
              meterName: charge.name,
              chargeType: charge.type,
              currentUsage,
              quota: quotaLimit,
              remaining: Math.max(0, remaining),
              simulatedUsage,
              totalAfterSimulation,
              wouldExceed
            });
          }
        }
      }
    }

    // Block if ANY quota would be exceeded
    const exceededCheck = quotaChecks.find(check => check.wouldExceed);
    if (exceededCheck) {
      return res.status(403).json({
        error: 'Quota exceeded - simulation not allowed',
        details: exceededCheck
      });
    }
    // ===== END QUOTA VALIDATION =====

    const createdEvents: any[] = [];
    const now = new Date();

    for (let i = 0; i < eventsToCreate; i++) {
      for (const accountId of targetAccountIds) {
        // Generate unique transaction ID
        const transactionId = `sim_${Date.now()}_${accountId}_${i}_${Math.random().toString(36).substring(7)}`;

        // Create timestamp with slight variation (spread events over last minute)
        const timestamp = new Date(now.getTime() - (eventsToCreate - i - 1) * 1000);

        let startDate = properties.startDate ? new Date(properties.startDate) : undefined;
        let endDate = properties.endDate ? new Date(properties.endDate) : undefined;

        // If productId is present, try to find subscription dates
        if (req.body.productId && !startDate && !endDate) {
          try {
            // Find ALL subscriptions for this customer
            const allSubs = await db.subscriptions.find({});
            const activeSubs = allSubs.filter((s: any) => s.customerId === accountId && s.status === 'active');

            if (activeSubs.length > 0) {
              const planIds = activeSubs.map((s: any) => s.planId);
              const plans = await db.plans.find({ id: { $in: planIds } });

              const relevantPlan = plans.find((p: any) => p.productId === req.body.productId);

              if (relevantPlan) {
                const subscription = activeSubs.find((s: any) => s.planId === relevantPlan.id);
                if (subscription) {
                  startDate = subscription.startDate;
                  endDate = subscription.endDate || undefined;
                }
              }
            }
          } catch (err) {
            console.error('Error fetching subscription dates:', err);
          }
        }

        // Create event
        const event = await db.events.create({
          transactionId,
          eventSchemaId,
          timestamp,
          properties: JSON.stringify(properties),
          customerId: accountId,
          productId: req.body.productId, // Save Product ID
          startDate,
          endDate
        });

        createdEvents.push(event);
      }
    }

    res.json({
      success: true,
      eventsCreated: createdEvents.length,
      events: createdEvents.map(e => ({
        ...e.toObject(),
        properties: JSON.parse(e.properties)
      }))
    });
  } catch (error) {
    console.error('Error simulating events:', error);
    res.status(500).json({ error: 'Failed to simulate events' });
  }
});

// 5. Customers (MOVED TO MODULAR ROUTES - see routes/customers.routes.ts)
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
