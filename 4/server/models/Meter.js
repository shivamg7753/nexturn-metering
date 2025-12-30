import mongoose from 'mongoose';

const meterSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    eventName: { type: String, required: true },
    aggregationMethod: {
        type: String,
        enum: ['Sum', 'Count', 'Last'],
        default: 'Sum'
    },
    eventIngestion: {
        type: String,
        enum: ['Raw', 'Pre-aggregated'],
        default: 'Raw'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    // Advanced settings
    dimensions: [{ type: String }], // e.g., ['model', 'token_type', 'region']
    valueKey: { type: String, default: 'value' }, // Payload key for usage value
    customerMappingKey: { type: String, default: 'stripe_customer_id' }, // Payload key for customer ID
}, { timestamps: true });

export default mongoose.model('Meter', meterSchema);
