import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Meter from './models/Meter.js';

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
            pricing: p.pricing,
            taxCategory: p.taxCategory,
            status: p.status,
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
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({
            id: product._id,
            name: product.name,
            pricing: product.pricing,
            taxCategory: product.taxCategory,
            status: product.status,
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
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({
            id: product._id,
            name: product.name,
            pricing: product.pricing,
            taxCategory: product.taxCategory,
            status: product.status,
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
