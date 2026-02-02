import Subscription from '../models/Subscription.js';
import Product from '../models/Product.js';
import Ingest from '../models/Ingest.js';
import Meter from '../models/Meter.js';

/**
 * Subscription Controller
 * Handles all subscription-related business logic
 */

/**
 * Get all subscriptions with optional customer filter
 */
export const getAllSubscriptions = async (req, res) => {
    try {
        const { customerId, productId } = req.query;
        let filter = {};

        if (customerId) {
            filter.customerId = customerId;
        }

        if (productId) {
            filter['products.productId'] = productId;
        }

        const subscriptions = await Subscription.find(filter)
            .populate('customerId', 'name email customerId')
            .sort({ createdAt: -1 });

        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get single subscription by ID
 */
export const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('customerId', 'name email customerId');

        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

        // Convert to plain object to allow adding dynamic fields
        const subObj = subscription.toObject();

        // For each usage-based product, calculate aggregated usage
        for (let i = 0; i < subObj.products.length; i++) {
            const product = subObj.products[i];
            const priceDetails = product.priceDetails;

            // Check if it's usage-based and has a meter
            if (priceDetails?.pricingModel === 'usage-based' && priceDetails?.meter) {
                const meterId = priceDetails.meter;

                // Fetch the meter to get the human-readable slug (eventName)
                const meter = await Meter.findById(meterId);
                const meterSlug = meter?.eventName;

                const cusStr = subscription.customerId?.customerId;
                const cusId = subscription.customerId?._id?.toString();

                console.log(`Aggregating usage for Meter ID: ${meterId}, Slug: ${meterSlug}, Customer: ${cusStr} / ${cusId}`);

                // Build matchers for $or query
                const eventMatchers = [{ eventName: meterId }];
                if (meterSlug) eventMatchers.push({ eventName: meterSlug });

                const customerMatchers = [];
                if (cusStr) customerMatchers.push({ customerId: cusStr });
                if (cusId) customerMatchers.push({ customerId: cusId });

                if (customerMatchers.length > 0) {
                    // Aggregate usage events for this customer and event
                    const events = await Ingest.find({
                        $or: eventMatchers,
                        customerId: { $in: customerMatchers.map(m => m.customerId) }
                    });

                    // Calculate total value
                    const totalUsage = events.reduce((sum, event) => {
                        // Check both slug and ID in payload
                        const val = event.payload?.[meterSlug]?.value ||
                            event.payload?.[meterId]?.value || 1;
                        return sum + (parseFloat(val) || 0);
                    }, 0);

                    // Update quantity dynamically in the response
                    subObj.products[i].quantity = totalUsage;
                    subObj.products[i].isLiveUsage = true;
                }
            }
        }

        res.json(subObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Create a new subscription
 */
export const createSubscription = async (req, res) => {
    try {
        // Fetch product details for all products in the subscription
        const productsWithDetails = await Promise.all(
            (req.body.products || []).map(async (productItem) => {
                const product = await Product.findById(productItem.productId);
                if (!product) {
                    throw new Error(`Product not found: ${productItem.productId}`);
                }

                // Get the price based on index if provided, or default to first
                let selectedPrice = null;

                if (productItem.priceIndex !== undefined && Number.isInteger(productItem.priceIndex)) {
                    if (product.prices && product.prices[productItem.priceIndex]) {
                        selectedPrice = product.prices[productItem.priceIndex];
                    }
                }

                // Fallback to first price if no index or invalid index
                if (!selectedPrice && product.prices && product.prices.length > 0) {
                    selectedPrice = product.prices[0];
                }

                let price = 0;
                let priceDetails = null;

                if (selectedPrice) {
                    priceDetails = selectedPrice;

                    // Calculate price based on pricing model
                    if (selectedPrice.pricingModel === 'flat-rate') {
                        price = selectedPrice.amount || 0;
                    } else if (selectedPrice.pricingModel === 'package') {
                        // Package pricing uses tiers structure, not amount
                        if (selectedPrice.tiers && selectedPrice.tiers.length > 0) {
                            price = selectedPrice.tiers[0].unitPrice || selectedPrice.tiers[0].flatFee || 0;
                        } else {
                            // Fallback to amount if tiers not present
                            price = selectedPrice.amount || 0;
                        }
                    } else if (selectedPrice.pricingModel === 'tiered' || selectedPrice.pricingModel === 'graduated' || selectedPrice.pricingModel === 'volume') {
                        // For tiered/graduated/volume, use first tier price
                        if (selectedPrice.tiers && selectedPrice.tiers.length > 0) {
                            price = selectedPrice.tiers[0].unitPrice || selectedPrice.tiers[0].flatFee || 0;
                        }
                    } else if (selectedPrice.pricingModel === 'usage-based') {
                        // For usage-based, try to get from tiers or fallback to amount
                        if (selectedPrice.tiers && selectedPrice.tiers.length > 0) {
                            price = selectedPrice.tiers[0].unitPrice || selectedPrice.tiers[0].flatFee || 0;
                        } else {
                            price = selectedPrice.amount || 0;
                        }
                    }
                    else if (selectedPrice.pricingModel === 'customer-chooses-price') {
                        // For customer-chooses-price, use suggested amount
                        price = selectedPrice.suggestedAmount || selectedPrice.minimumAmount || 0;
                    }
                }

                return {
                    productId: product._id,
                    productName: product.name,
                    quantity: productItem.quantity || 1,
                    price: price,
                    priceDetails: priceDetails
                };
            })
        );

        const subscriptionData = {
            customerId: req.body.customerId,
            products: productsWithDetails,
            duration: {
                startDate: req.body.duration?.startDate || new Date(),
                endDate: req.body.duration?.endDate || null,
                isForever: req.body.duration?.isForever || false
            },
            billingStartDate: req.body.billingStartDate || new Date(),
            trialDays: req.body.trialDays || 0,
            collectTaxAutomatically: req.body.collectTaxAutomatically || false,
            metadata: req.body.metadata || {},
            status: req.body.trialDays > 0 ? 'trialing' : 'active',
            couponCode: req.body.couponCode || null,
            manualTax: req.body.manualTax || null
        };

        const subscription = new Subscription(subscriptionData);
        await subscription.save();

        const populatedSubscription = await Subscription.findById(subscription._id)
            .populate('customerId', 'name email');

        res.status(201).json(populatedSubscription);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Update an existing subscription
 */
export const updateSubscription = async (req, res) => {
    try {
        const updateData = {
            products: req.body.products,
            duration: req.body.duration,
            billingStartDate: req.body.billingStartDate,
            trialDays: req.body.trialDays,
            collectTaxAutomatically: req.body.collectTaxAutomatically,
            metadata: req.body.metadata,
            status: req.body.status,
            couponCode: req.body.couponCode,
            manualTax: req.body.manualTax
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const subscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('customerId', 'name email');

        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

        res.json(subscription);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Delete/cancel a subscription
 */
export const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.params.id);
        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
