import mongoose from 'mongoose';

const ingestSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        index: true
    },
    customerId: {
        type: String,
        required: true,
        index: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

export default mongoose.model('Ingest', ingestSchema);
