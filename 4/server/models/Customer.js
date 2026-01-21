import mongoose from 'mongoose';

// Helper function to generate customer ID
const generateCustomerId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'cus_';
    for (let i = 0; i < 14; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        unique: true,
        default: generateCustomerId
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    language: {
        type: String,
        default: 'English (United States)'
    },
    paymentMethod: {
        type: String,
        default: null
    },
    businessName: {
        type: String,
        default: null
    },
    individualName: {
        type: String,
        default: null
    },
    billingDetails: {
        type: String,
        default: null
    },
    nextInvoiceNumber: {
        type: String,
        default: null
    },
    taxLocationStatus: {
        type: String,
        default: 'Unknown location'
    },
    taxStatus: {
        type: String,
        default: 'Taxable'
    }
}, {
    timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

