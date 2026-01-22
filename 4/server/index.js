import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Meter from './models/Meter.js';
import Customer from './models/Customer.js';
import Subscription from './models/Subscription.js';
import Log from './models/Log.js';
import Event from './models/Event.js';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/productcatalogue';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

// Helper to format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// Helper: Create Log
const createLog = async (resourceId, resourceType, method, endpoint, statusCode) => {
    try {
        await Log.create({
            resourceId,
            resourceType,
            method,
            endpoint,
            statusCode
        });
    } catch (err) {
        console.error('Error creating log:', err);
    }
};

// Helper: Create Event
const createEvent = async (resourceId, resourceType, description) => {
    try {
        await Event.create({
            resourceId,
            resourceType,
            description
        });
    } catch (err) {
        console.error('Error creating event:', err);
    }
};

// Health endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clear all data (for development - remove seeded mock data)
app.delete('/api/meters/all/clear', async (req, res) => {
    try {
        await Meter.deleteMany({});
        res.json({ message: 'All meters cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/all/clear', async (req, res) => {
    try {
        await Product.deleteMany({});
        await Log.deleteMany({ resourceType: 'product' });
        await Event.deleteMany({ resourceType: 'product' });
        res.json({ message: 'All products cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products with optional status filter
app.get('/api/products', async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        const allProducts = await Product.find();

        const counts = {
            all: allProducts.length,
            active: allProducts.filter(p => p.status === 'active').length,
            archived: allProducts.filter(p => p.status === 'archived').length
        };

        const formattedProducts = products.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            imageUrl: p.imageUrl,
            statementDescriptor: p.statementDescriptor,
            unitLabel: p.unitLabel,
            pricing: p.pricing,
            taxCategory: p.taxCategory,
            status: p.status,
            prices: p.prices,
            created: formatDate(p.createdAt),
            updated: formatDate(p.updatedAt)
        }));

        res.json({ products: formattedProducts, counts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Return full product data for editing
        res.json({
            id: product._id,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            statementDescriptor: product.statementDescriptor,
            unitLabel: product.unitLabel,
            pricing: product.pricing,
            taxCategory: product.taxCategory,
            status: product.status,
            prices: product.prices,
            created: formatDate(product.createdAt),
            updated: formatDate(product.updatedAt)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get product logs
app.get('/api/products/:id/logs', async (req, res) => {
    try {
        const logs = await Log.find({ resourceId: req.params.id, resourceType: 'product' })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get product events
app.get('/api/products/:id/events', async (req, res) => {
    try {
        const events = await Event.find({ resourceId: req.params.id, resourceType: 'product' })
            .sort({ createdAt: -1 })
            .limit(10);

        const formattedEvents = events.map(e => ({
            text: e.description,
            time: new Date(e.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(e.createdAt).toLocaleDateString('en-GB', { month: 'numeric', day: 'numeric', year: '2-digit' })
        }));

        res.json(formattedEvents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            statementDescriptor: req.body.statementDescriptor,
            unitLabel: req.body.unitLabel,
            taxCategory: req.body.taxCategory,
            status: req.body.status || 'active',
            pricing: req.body.pricing,
            prices: req.body.prices || []
        };

        const product = new Product(productData);
        await product.save();

        // Log and Event
        await createLog(product._id, 'product', 'POST', '/api/products', 201);
        await createEvent(product._id, 'product', `A product with ID ${product._id} was created`);

        res.status(201).json({
            id: product._id,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            statementDescriptor: product.statementDescriptor,
            unitLabel: product.unitLabel,
            pricing: product.pricing,
            taxCategory: product.taxCategory,
            status: product.status,
            prices: product.prices,
            created: formatDate(product.createdAt),
            updated: formatDate(product.updatedAt)
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            statementDescriptor: req.body.statementDescriptor,
            unitLabel: req.body.unitLabel,
            taxCategory: req.body.taxCategory,
            status: req.body.status,
            pricing: req.body.pricing,
            prices: req.body.prices
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Log and Event
        await createLog(product._id, 'product', 'POST', `/api/products/${product._id}`, 200); // Using POST as per mock, typically PUT
        await createEvent(product._id, 'product', `A product with ID ${product._id} was updated`);

        res.json({
            id: product._id,
            name: product.name,
            description: product.description,
            imageUrl: product.imageUrl,
            statementDescriptor: product.statementDescriptor,
            unitLabel: product.unitLabel,
            pricing: product.pricing,
            taxCategory: product.taxCategory,
            status: product.status,
            prices: product.prices,
            created: formatDate(product.createdAt),
            updated: formatDate(product.updatedAt)
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Log (Note: Events are usually tied to existing resources, but we can log the deletion)
        await createLog(product._id, 'product', 'DELETE', `/api/products/${product._id}`, 200);

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== METER ROUTES ==========

// Helper to format datetime
const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(/\//g, '/') + ', ' + new Date(date).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit'
    });
};

// Get all meters
app.get('/api/meters', async (req, res) => {
    try {
        const meters = await Meter.find().sort({ createdAt: -1 });
        const formattedMeters = meters.map(m => ({
            id: m._id,
            displayName: m.displayName,
            eventName: m.eventName,
            aggregationMethod: m.aggregationMethod,
            eventIngestion: m.eventIngestion,
            status: m.status,
            created: formatDateTime(m.createdAt)
        }));
        res.json({ meters: formattedMeters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single meter
app.get('/api/meters/:id', async (req, res) => {
    try {
        const meter = await Meter.findById(req.params.id);
        if (!meter) return res.status(404).json({ error: 'Meter not found' });
        res.json(meter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create meter
app.post('/api/meters', async (req, res) => {
    try {
        const meter = new Meter(req.body);
        await meter.save();
        res.status(201).json({
            id: meter._id,
            displayName: meter.displayName,
            eventName: meter.eventName,
            aggregationMethod: meter.aggregationMethod,
            eventIngestion: meter.eventIngestion,
            status: meter.status,
            created: formatDateTime(meter.createdAt)
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update meter
app.put('/api/meters/:id', async (req, res) => {
    try {
        const meter = await Meter.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!meter) return res.status(404).json({ error: 'Meter not found' });
        res.json(meter);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete meter
app.delete('/api/meters/:id', async (req, res) => {
    try {
        const meter = await Meter.findByIdAndDelete(req.params.id);
        if (!meter) return res.status(404).json({ error: 'Meter not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== CUSTOMER ROUTES ==========

// Get all customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        const formattedCustomers = customers.map(c => ({
            id: c._id,
            name: c.name,
            email: c.email,
            language: c.language,
            paymentMethod: c.paymentMethod,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }));
        res.json(formattedCustomers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single customer
app.get('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        res.json({
            id: customer._id,
            customerId: customer.customerId,
            name: customer.name,
            email: customer.email,
            language: customer.language,
            paymentMethod: customer.paymentMethod,
            businessName: customer.businessName,
            individualName: customer.individualName,
            billingDetails: customer.billingDetails,
            nextInvoiceNumber: customer.nextInvoiceNumber,
            taxLocationStatus: customer.taxLocationStatus,
            taxStatus: customer.taxStatus,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create customer
app.post('/api/customers', async (req, res) => {
    try {
        const customerData = {
            name: req.body.name,
            email: req.body.email,
            language: req.body.language || 'English (United States)',
            paymentMethod: req.body.paymentMethod || null
        };

        const customer = new Customer(customerData);
        await customer.save();

        res.status(201).json({
            id: customer._id,
            name: customer.name,
            email: customer.email,
            language: customer.language,
            paymentMethod: customer.paymentMethod,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            language: req.body.language,
            paymentMethod: req.body.paymentMethod
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        res.json({
            id: customer._id,
            name: customer.name,
            email: customer.email,
            language: customer.language,
            paymentMethod: customer.paymentMethod,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== SUBSCRIPTION ROUTES ==========

// Get all subscriptions (with optional customer filter)
app.get('/api/subscriptions', async (req, res) => {
    try {
        const { customerId } = req.query;
        let filter = {};

        if (customerId) {
            filter.customerId = customerId;
        }

        const subscriptions = await Subscription.find(filter)
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 });

        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single subscription
app.get('/api/subscriptions/:id', async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('customerId', 'name email');

        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

        res.json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create subscription
app.post('/api/subscriptions', async (req, res) => {
    try {
        // Fetch product details for all products in the subscription
        const productsWithDetails = await Promise.all(
            (req.body.products || []).map(async (productItem) => {
                const product = await Product.findById(productItem.productId);
                if (!product) {
                    throw new Error(`Product not found: ${productItem.productId}`);
                }

                // Get the first price or calculate based on pricing
                let price = 0;
                let priceDetails = null;

                // Get the price based on index if provided, or default to first
                let selectedPrice = null;

                if (productItem.priceIndex !== undefined && Number.isInteger(productItem.priceIndex)) {
                    if (product.prices && product.prices[productItem.priceIndex]) {
                        selectedPrice = product.prices[productItem.priceIndex];
                    }
                }

                // Fallback to first price if no index or invalid index (backward compatibility)
                if (!selectedPrice && product.prices && product.prices.length > 0) {
                    selectedPrice = product.prices[0];
                }

                if (selectedPrice) {
                    priceDetails = selectedPrice;

                    // Calculate price based on pricing model
                    if (selectedPrice.pricingModel === 'flat-rate') {
                        price = selectedPrice.amount || 0;
                    } else if (selectedPrice.pricingModel === 'tiered' || selectedPrice.pricingModel === 'graduated') {
                        // For tiered/graduated, use first tier price
                        if (selectedPrice.tiers && selectedPrice.tiers.length > 0) {
                            price = selectedPrice.tiers[0].unitPrice || selectedPrice.tiers[0].flatFee || 0;
                        }
                    }
                }

                return {
                    productId: product._id,
                    productName: product.name,
                    quantity: productItem.quantity || 1,
                    price: price,
                    priceDetails: priceDetails
                };
            })
        );

        const subscriptionData = {
            customerId: req.body.customerId,
            products: productsWithDetails,
            duration: {
                startDate: req.body.duration?.startDate || new Date(),
                endDate: req.body.duration?.endDate || null,
                isForever: req.body.duration?.isForever || false
            },
            billingStartDate: req.body.billingStartDate || new Date(),
            trialDays: req.body.trialDays || 0,
            collectTaxAutomatically: req.body.collectTaxAutomatically || false,
            metadata: req.body.metadata || {},
            status: req.body.trialDays > 0 ? 'trialing' : 'active',
            couponCode: req.body.couponCode || null,
            manualTax: req.body.manualTax || null
        };

        const subscription = new Subscription(subscriptionData);
        await subscription.save();

        const populatedSubscription = await Subscription.findById(subscription._id)
            .populate('customerId', 'name email');

        res.status(201).json(populatedSubscription);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update subscription
app.put('/api/subscriptions/:id', async (req, res) => {
    try {
        const updateData = {
            products: req.body.products,
            duration: req.body.duration,
            billingStartDate: req.body.billingStartDate,
            trialDays: req.body.trialDays,
            collectTaxAutomatically: req.body.collectTaxAutomatically,
            metadata: req.body.metadata,
            status: req.body.status,
            couponCode: req.body.couponCode,
            manualTax: req.body.manualTax
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const subscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('customerId', 'name email');

        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

        res.json(subscription);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete/cancel subscription
app.delete('/api/subscriptions/:id', async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.params.id);
        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Seed sample data - DISABLED (only show real database data)
// Uncomment this function and the call in app.listen if you need sample data
/*
const seedData = async () => {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
        const sampleProducts = [
            { name: 'Rate Card Price 2', pricing: '2 prices', taxCategory: 'General - Electronically Supplied Services', status: 'active' },
            { name: 'example v1 tiered price', pricing: '2 prices', taxCategory: 'General - Electronically Supplied Services', status: 'active' },
            { name: 'Example Services', pricing: 'US$100.00', taxCategory: 'Preset: None', status: 'active' },
            { name: 'hotdog 2', pricing: '2 prices', taxCategory: 'General - Electronically Supplied Services', status: 'active' },
            { name: 'Premium Plan', pricing: 'US$299.00', taxCategory: 'General - Electronically Supplied Services', status: 'active' },
            { name: 'Basic Subscription', pricing: 'US$49.00', taxCategory: 'Preset: None', status: 'archived' },
            { name: 'Enterprise License', pricing: '5 prices', taxCategory: 'General - Electronically Supplied Services', status: 'active' },
            { name: 'Starter Pack', pricing: 'US$19.00', taxCategory: 'Preset: None', status: 'archived' },
        ];
        await Product.insertMany(sampleProducts);
        console.log('Sample products seeded');
    }

    const meterCount = await Meter.countDocuments();
    if (meterCount === 0) {
        const sampleMeters = [
            { displayName: 'ben token', eventName: 'ben_token', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'Ungrouped One Dimension', eventName: 'ungrouped_one_dimension', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'Ungrouped Meter', eventName: 'ungrouped_meter', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'SMS units', eventName: 'dentally_sms_event_2', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'API calls meter', eventName: 'dres_meter_2', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'API calls meter', eventName: 'dres_meter', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'Chat API Requests 2', eventName: 'chat_api_requests_2', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'chat api requests', eventName: 'chat_api_requests', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
            { displayName: 'Pro Meter YY', eventName: 'pro_meter_yy', aggregationMethod: 'Sum', eventIngestion: 'Raw', status: 'Active' },
        ];
        await Meter.insertMany(sampleMeters);
        console.log('Sample meters seeded');
    }
};
*/

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // await seedData(); // Disabled - no mock data
});
