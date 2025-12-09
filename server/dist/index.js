"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const index_1 = __importDefault(require("./routes/index"));
const errorHandler_1 = require("./middleware/errorHandler");
const db_config_1 = __importDefault(require("./config/db.config"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Connect to MongoDB
(0, db_config_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount modular API routes (meters, customers, usage)
app.use('/api', index_1.default);
// --- Legacy Routes (To be modularized) ---
// NOTE: Meters, Customers, and Usage endpoints are now in modular routes
// The following endpoints demonstrate the legacy pattern and should be refactored similarly
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', db: 'mongo' });
});
// --- Add-Ons Endpoints ---
app.get('/api/addons', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const addons = yield db_1.db.addOns.find({});
        res.json(addons);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch addons' });
    }
}));
app.post('/api/addons', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, creditAmountCents } = req.body;
        // Mongoose create returns a Promise
        const newAddOn = yield db_1.db.addOns.create({ name, type, creditAmountCents });
        res.json(newAddOn);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create add-on' });
    }
}));
// --- Features Endpoints ---
app.get('/api/features', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const features = yield db_1.db.features.find({});
        res.json(features);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch features' });
    }
}));
app.post('/api/features', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, description } = req.body;
        const newFeature = yield db_1.db.features.create({ name, code, description });
        res.json(newFeature);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create feature' });
    }
}));
// 1. Event Schemas
app.post('/api/schemas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, dimensions, status } = req.body;
        const schema = yield db_1.db.eventSchemas.create({
            name,
            description,
            dimensions: typeof dimensions === 'string' ? dimensions : JSON.stringify(dimensions || {}),
            status: status || 'draft',
        });
        res.json(schema);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create schema' });
    }
}));
app.get('/api/schemas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schemas = yield db_1.db.eventSchemas.find({});
        res.json(schemas.map(s => (Object.assign(Object.assign({}, s.toObject()), { dimensions: JSON.parse(s.dimensions) }))));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch schemas' });
    }
}));
app.put('/api/schemas/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, dimensions, status } = req.body;
        // Fetch existing schema to check constraints
        const existingSchema = yield db_1.db.eventSchemas.findOne({ id });
        if (!existingSchema)
            return res.status(404).json({ error: 'Schema not found' });
        const updates = { updatedAt: new Date() };
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
        }
        else {
            // Draft, or making no definition changes (just status)
            if (name)
                updates.name = name;
            if (description)
                updates.description = description;
            if (dimensions)
                updates.dimensions = typeof dimensions === 'string' ? dimensions : JSON.stringify(dimensions || {});
        }
        const schema = yield db_1.db.eventSchemas.findOneAndUpdate({ id }, updates, { new: true });
        if (!schema)
            return res.status(404).json({ error: 'Schema not found' });
        res.json(Object.assign(Object.assign({}, schema.toObject()), { dimensions: JSON.parse(schema.dimensions) }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update schema' });
    }
}));
// 2. Meters (MOVED TO MODULAR ROUTES - see routes/meters.routes.ts)
// app.post('/api/meters', ...) - Now in meters.controller.ts
// app.get('/api/meters', ...) - Now in meters.controller.ts
// 3. Ingest Events
app.post('/api/events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { transactionId, eventSchemaId, timestamp, properties, customerId } = req.body;
        // Validate schema exists
        const schema = yield db_1.db.eventSchemas.findOne({ id: eventSchemaId });
        if (!schema) {
            return res.status(400).json({ error: `Event schema '${eventSchemaId}' not found` });
        }
        // Idempotency check
        const existingEvent = yield db_1.db.events.findOne({ transactionId });
        if (existingEvent) {
            return res.json(existingEvent);
        }
        // Parse and validate timestamp, fallback to current time if invalid
        let eventTimestamp = new Date();
        if (timestamp) {
            const parsedTimestamp = new Date(timestamp);
            if (!isNaN(parsedTimestamp.getTime())) {
                eventTimestamp = parsedTimestamp;
            }
            else {
                console.warn(`Invalid timestamp received: ${timestamp}, using current time`);
            }
        }
        const event = yield db_1.db.events.create({
            transactionId,
            eventSchemaId,
            timestamp: eventTimestamp, // Mongoose expects Date object or valid string
            properties: JSON.stringify(properties || {}),
            customerId,
        });
        res.json(event);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to ingest event' });
    }
}));
// 4. Customers (MOVED TO MODULAR ROUTES - see routes/customers.routes.ts)
// app.get('/api/customers', ...) - Now in customers.controller.ts
// app.post('/api/customers', ...) - Now in customers.controller.ts
// 5. Plans
app.get('/api/plans', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plans = yield db_1.db.plans.find({});
        res.json(plans.map(p => (Object.assign(Object.assign({}, p.toObject()), { charges: JSON.parse(p.charges || '[]') }))));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
}));
app.post('/api/plans', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, description, interval, type, intervalCount, amountCents, currency, charges, payInAdvance, trialPeriod } = req.body;
        // Assuming ID is passed, but schema handles default if not. If passed, Mongoose uses it.
        // If id is passed, we should use it.
        const planData = {
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
        };
        if (id)
            planData.id = id;
        const plan = yield db_1.db.plans.create(planData);
        res.json(plan);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
}));
app.put('/api/plans/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, interval, type, intervalCount, amountCents, currency, charges, payInAdvance, trialPeriod } = req.body;
        const plan = yield db_1.db.plans.findOneAndUpdate({ id }, {
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
            updatedAt: new Date(),
        }, { new: true });
        if (!plan)
            return res.status(404).json({ error: 'Plan not found' });
        res.json(plan);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
}));
// 5.5 Subscriptions
app.get('/api/subscriptions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptions = yield db_1.db.subscriptions.find({});
        res.json(subscriptions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
}));
app.post('/api/subscriptions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, planId, status, startDate, endDate, billingTime, overriddenPlan } = req.body;
        const subscription = yield db_1.db.subscriptions.create({
            customerId,
            planId,
            status: status || 'active',
            startDate: startDate || new Date(),
            endDate,
            billingTime: billingTime || 'calendar',
            overriddenPlan: overriddenPlan ? JSON.stringify(overriddenPlan) : null,
            externalId: `sub_ext_${Date.now()}`
        });
        res.json(subscription);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
}));
// 6. Usage (MOVED TO MODULAR ROUTES - see routes/usage.routes.ts)
// app.get('/api/usage/:customerId', ...) - Now in usage.controller.ts + usage.service.ts
// Business logic extracted to services/usage.service.ts
// 7. Events List (Recent Activity)
app.get('/api/events/:customerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        const events = yield db_1.db.events.find({ customerId })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(events.map(e => (Object.assign(Object.assign({}, e.toObject()), { properties: JSON.parse(e.properties) }))));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}));
// 8. Analytics: Usage Breakdown by Endpoint
app.get('/api/analytics/usage-by-endpoint/:customerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { customerId } = req.params;
        // 1. Get Customer's Active Subscriptions & Plans
        const subscriptions = yield db_1.db.subscriptions.find({ customerId, status: 'active' });
        const planIds = subscriptions.map(s => s.planId);
        const plans = yield db_1.db.plans.find({ id: { $in: planIds } });
        // 2. Fetch all events for the customer
        // Note: In production, this should be time-boxed (e.g., current billing period)
        const events = yield db_1.db.events.find({ customerId });
        const parsedEvents = events.map(e => (Object.assign(Object.assign({}, e.toObject()), { properties: JSON.parse(e.properties) })));
        // 3. Group by Endpoint
        const usageByEndpoint = {};
        const meters = yield db_1.db.meters.find({});
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
                        if (String(val) !== String(filter.value)) {
                            matches = false;
                            break;
                        }
                    }
                    if (matches) {
                        // Find charge in active plans
                        for (const plan of plans) {
                            const charges = JSON.parse(plan.charges || '[]');
                            const charge = charges.find((c) => c.billableMetricId === meter.id);
                            if (charge) {
                                const price = Number(((_a = charge.properties) === null || _a === void 0 ? void 0 : _a.amountCents) || 0);
                                let effectiveUnitPrice = 0;
                                if (charge.chargeModel === 'standard') {
                                    effectiveUnitPrice = price;
                                }
                                else if (charge.chargeModel === 'package') {
                                    const packageSize = Number(((_b = charge.properties) === null || _b === void 0 ? void 0 : _b.packageSize) || 1);
                                    effectiveUnitPrice = price / packageSize;
                                }
                                // Calculate contribution based on aggregation
                                if (meter.aggregation === 'count') {
                                    stats.costCents += effectiveUnitPrice;
                                }
                                else if (meter.aggregation === 'sum' && meter.field) {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate breakdown' });
    }
}));
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Modular routes active for: /api/meters, /api/customers, /api/usage`);
});
