import Product from '../models/Product.js';
import Log from '../models/Log.js';
import Event from '../models/Event.js';
import { formatDate } from '../utils/dateFormatter.js';
import { createLog } from '../utils/logHelper.js';
import { createEvent } from '../utils/eventHelper.js';

/**
 * Product Controller
 * Handles all product-related business logic
 */

/**
 * Get all products with optional status filter
 */
export const getAllProducts = async (req, res) => {
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
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

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
};

/**
 * Create a new product
 */
export const createProduct = async (req, res) => {
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
};

/**
 * Update an existing product
 */
export const updateProduct = async (req, res) => {
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
        await createLog(product._id, 'product', 'POST', `/api/products/${product._id}`, 200);
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
};

/**
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        await createLog(product._id, 'product', 'DELETE', `/api/products/${product._id}`, 200);

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get product logs
 */
export const getProductLogs = async (req, res) => {
    try {
        const logs = await Log.find({ resourceId: req.params.id, resourceType: 'product' })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get product events
 */
export const getProductEvents = async (req, res) => {
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
};

/**
 * Clear all products (development only)
 */
export const clearAllProducts = async (req, res) => {
    try {
        await Product.deleteMany({});
        await Log.deleteMany({ resourceType: 'product' });
        await Event.deleteMany({ resourceType: 'product' });
        res.json({ message: 'All products cleared' });
    } catch (err) {
    }
};

/**
 * Add a new price to an existing product
 */
export const addPrice = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Add the new price to the prices array
        product.prices.push(req.body);
        await product.save();

        // Log and Event
        await createLog(product._id, 'product', 'POST', `/api/products/${product._id}/prices`, 201);
        await createEvent(product._id, 'product', `A new price was added to product ${product.name}`);

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
};

/**
 * Update a specific price by index
 */
export const updatePrice = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const priceIndex = parseInt(req.params.priceIndex);
        if (priceIndex < 0 || priceIndex >= product.prices.length) {
            return res.status(404).json({ error: 'Price not found' });
        }

        // Update the price at the specified index
        product.prices[priceIndex] = req.body;
        await product.save();

        // Log and Event
        await createLog(product._id, 'product', 'PUT', `/api/products/${product._id}/prices/${priceIndex}`, 200);
        await createEvent(product._id, 'product', `Price #${priceIndex + 1} was updated for product ${product.name}`);

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
};

/**
 * Delete a specific price by index
 */
export const deletePrice = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const priceIndex = parseInt(req.params.priceIndex);
        if (priceIndex < 0 || priceIndex >= product.prices.length) {
            return res.status(404).json({ error: 'Price not found' });
        }

        // Prevent deleting the last price
        if (product.prices.length === 1) {
            return res.status(400).json({ error: 'Cannot delete the last price. Products must have at least one price.' });
        }

        // Remove the price at the specified index
        product.prices.splice(priceIndex, 1);
        await product.save();

        // Log and Event
        await createLog(product._id, 'product', 'DELETE', `/api/products/${product._id}/prices/${priceIndex}`, 200);
        await createEvent(product._id, 'product', `Price #${priceIndex + 1} was deleted from product ${product.name}`);

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
};
