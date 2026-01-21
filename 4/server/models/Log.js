import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    resourceId: {
        type: String,
        required: true,
        index: true
    },
    resourceType: {
        type: String, // 'product', 'meter', etc.
        required: true
    },
    method: {
        type: String, // 'POST', 'GET', 'PUT', 'DELETE'
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Log', logSchema);
