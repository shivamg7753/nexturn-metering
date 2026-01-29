/**
 * Utility functions for formatting price data for display
 */

/**
 * Maps billing periods to human-readable strings
 */
const BILLING_PERIOD_MAP = {
    'daily': 'day',
    'weekly': 'week',
    'monthly': 'month',
    'yearly': 'year',
    'every-3-months': '3 months',
    'every-6-months': '6 months',
};

/**
 * Formats a currency amount with its symbol and proper decimal places
 * @param {string|number} amount - The amount to format
 * @param {string} currency - The currency code (e.g., 'INR', 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount || 0);
};

/**
 * Formats a billing period for display (e.g., "monthly" -> "month")
 * @param {object|string} priceDetails - The price object or billing period string
 * @returns {string} Formatted billing period
 */
export const formatBillingPeriod = (priceDetails) => {
    const period = typeof priceDetails === 'string'
        ? priceDetails
        : (priceDetails?.billingPeriod || 'monthly');

    return period.replace('ly', '').replace('every-', 'every ');
};

/**
 * Formats a price object into a "Starts at" display string
 * @param {object} price - The price object
 * @returns {string} Formatted display string
 */
export const formatPriceDisplay = (price) => {
    let amount = price.amount || '0.00';
    const currency = price.currency || 'INR';

    // For tiered, graduated, or volume pricing, get the first tier's price
    if ((['tiered', 'graduated', 'volume'].includes(price.pricingModel) || (price.pricingModel === 'usage-based' && price.usageType === 'per-tier')) && price.tiers && price.tiers.length > 0) {
        const firstTier = price.tiers[0];
        const unitPrice = firstTier.unitPrice || 0;
        const flatFee = firstTier.flatFee || 0;

        // If both unitPrice and flatFee exist, show in format: "per unit + flat fee / period"
        if (unitPrice > 0 && flatFee > 0) {
            const period = BILLING_PERIOD_MAP[price.billingPeriod] || price.billingPeriod || 'month';
            return `Starts at ${formatCurrency(unitPrice, currency)} per unit + ${formatCurrency(flatFee, currency)} / ${period}`;
        }
        // Otherwise use the first non-zero value
        amount = unitPrice || flatFee || '0.00';
    }

    let displayText = `Starts at ${formatCurrency(amount, currency)}`;

    // For package pricing, show "per X units" instead of billing period
    if (price.pricingModel === 'package') {
        // Check if package pricing has tiers with dual pricing (unitPrice + flatFee)
        if (price.tiers && price.tiers.length > 0) {
            const firstTier = price.tiers[0];
            const unitPrice = firstTier.unitPrice || 0;
            const flatFee = firstTier.flatFee || 0;

            // If both unitPrice and flatFee exist, show in dual format
            if (unitPrice > 0 && flatFee > 0) {
                const period = BILLING_PERIOD_MAP[price.billingPeriod] || price.billingPeriod || 'month';
                return `Starts at ${formatCurrency(unitPrice, currency)} per unit + ${formatCurrency(flatFee, currency)} / ${period}`;
            }
            // If only one exists, use it
            if (unitPrice > 0 || flatFee > 0) {
                displayText = `Starts at ${formatCurrency(unitPrice || flatFee, currency)} per unit`;
                return displayText;
            }
        }
        // Default package pricing format
        const packageQty = price.packageQuantity || 1;
        displayText += ` per ${packageQty} unit${packageQty > 1 ? 's' : ''}`;
    }
    // For package usage-based pricing
    else if (price.pricingModel === 'usage-based' && price.usageType === 'per-package') {
        const packageQty = price.packageQuantity || 1;
        displayText += ` per ${packageQty} unit${packageQty > 1 ? 's' : ''}`;
    }
    // For tiered, graduated, volume, or usage-based pricing, show "per unit"
    else if (['tiered', 'graduated', 'volume', 'usage-based'].includes(price.pricingModel)) {
        displayText += ' per unit';
    }
    // For regular recurring pricing, show the billing period
    else if (price.pricingType === 'recurring' && price.billingPeriod) {
        const period = BILLING_PERIOD_MAP[price.billingPeriod] || price.billingPeriod;
        displayText += ` Per ${period}`;
    }

    return displayText;
};

/**
 * Generates a detailed description of the pricing model and type
 * @param {object} price - The price object
 * @returns {string} Detailed description string (e.g., "per unit • metered • recurring")
 */
export const getPricingDescription = (price) => {
    const parts = [];

    // Add pricing model details
    if (price.pricingModel === 'usage-based') {
        if (price.usageType === 'per-unit') {
            parts.push('per unit');
        } else if (price.usageType === 'per-package') {
            parts.push('per package');
        } else if (price.usageType === 'per-tier') {
            if (['graduated', 'volume'].includes(price.tieredType || price.tierMode)) {
                parts.push(price.tieredType || price.tierMode);
            }
        }

        if (price.meter) {
            parts.push(`metered by ${price.meter}`);
        } else {
            parts.push('usage based');
        }
    } else if (price.pricingModel === 'tiered') {
        if (['graduated', 'volume'].includes(price.tieredType || price.tierMode)) {
            parts.push(price.tieredType || price.tierMode);
        } else {
            parts.push('tiered');
        }
    } else if (price.pricingModel === 'package') {
        parts.push(`package (${price.packageQuantity || price.packageSize || 'N/A'} units)`);
    } else {
        parts.push(price.pricingModel.replace('-', ' '));
    }

    // Add pricing type (recurring/one-off)
    parts.push(price.pricingType);

    return parts.join(' • ');
};
