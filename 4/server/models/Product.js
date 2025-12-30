import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    pricing: { type: String, required: true },
    taxCategory: { type: String, default: 'Preset: None' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
