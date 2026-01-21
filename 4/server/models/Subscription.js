import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: String,
        quantity: {
            type: Number,
            default: 1
        },
        price: Number, // Calculated price per unit
        priceDetails: mongoose.Schema.Types.Mixed // Store complete pricing information
    }],
    duration: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: Date, // null means forever
        isForever: {
            type: Boolean,
            default: false
        }
    },
    billingStartDate: {
        type: Date,
        required: true
    },
    trialDays: {
        type: Number,
        default: 0
    },
    collectTaxAutomatically: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: Map,
        of: String,
        default: {}
    },
    status: {
        type: String,
        enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid'],
        default: 'active'
    },
    couponCode: String,
    manualTax: Number
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
