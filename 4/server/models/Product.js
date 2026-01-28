import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
    priceName: { type: String }, // Name for the price plan
    pricingType: { type: String, enum: ['one-time', 'recurring'], default: 'recurring' },
    pricingModel: {
        type: String,
        enum: ['flat-rate', 'package', 'tiered', 'graduated', 'volume', 'usage-based', 'customer-chooses-price'],
        default: 'flat-rate'
    },
    currency: { type: String, default: 'INR' },
    amount: { type: Number },

    // For tiered/graduated/volume pricing
    tiers: [{
        upTo: { type: Number }, // null for infinity
        unitPrice: { type: Number },
        flatFee: { type: Number }
    }],

    // For usage-based pricing
    usageType: { type: String, enum: ['per-unit', 'per-package', 'per-tier'] },
    tieredType: { type: String, enum: ['graduated', 'volume'] },
    meter: { type: String }, // Meter ID reference

    // For package pricing
    packageQuantity: { type: Number },

    // For customer-chooses-price
    minimumAmount: { type: Number },
    maximumAmount: { type: Number },
    suggestedAmount: { type: Number },

    billingPeriod: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'every-3-months', 'every-6-months', 'custom'],
        default: 'monthly'
    },
    includeTaxInPrice: { type: String, enum: ['auto', 'inclusive', 'exclusive'], default: 'auto' },

    // Advanced options
    priceDescription: { type: String },
    lookupKey: { type: String },

    // Multi-currency support
    additionalCurrencies: [{
        currency: { type: String },
        amount: { type: Number }
    }]
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    statementDescriptor: { type: String },
    unitLabel: { type: String },
    taxCategory: { type: String, default: 'Preset: None' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },

    // Legacy field for backward compatibility
    pricing: { type: String },

    // New structured pricing
    prices: [priceSchema]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
