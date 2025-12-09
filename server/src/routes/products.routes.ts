import { Router } from 'express';
import { db } from '../db';
import crypto from 'crypto';

const router = Router();

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await db.products.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get a single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.products.findOne({ id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Generate UUID for product code
    const code = crypto.randomUUID();

    const product = await db.products.create({
      name,
      code,
      description: description || null,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updates: any = { updatedAt: new Date() };

    if (name) {
      updates.name = name;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    const product = await db.products.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.products.findOneAndDelete({ id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
