import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    resourceId: {
        type: String,
        required: true,
        index: true
    },
    resourceType: {
        type: String, // 'product', 'meter', etc.
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Event', eventSchema);
