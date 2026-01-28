import mongoose from 'mongoose';

/**
 * Database Configuration
 * Handles MongoDB connection
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/productcatalogue';

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDatabase;
