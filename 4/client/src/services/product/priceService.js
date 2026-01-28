/**
 * Price Service
 * Business logic for price calculations, validation, and transformations
 */

import * as priceApi from '../../api/priceApi';
import { formatCurrency, formatBillingPeriod } from '../../utils/priceFormatters';

/**
 * Validates price data
 * @param {Object} priceData - Price data to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validatePrice(priceData) {
    const errors = {};

    // Validate pricing model
    if (!priceData.pricingModel) {
        errors.pricingModel = 'Pricing model is required';
    }

    // Validate amount for flat-rate
    if (priceData.pricingModel === 'flat-rate' && !priceData.amount) {
        errors.amount = 'Amount is required for flat-rate pricing';
    }

    // Validate tiers for tiered pricing
    if (['tiered', 'graduated', 'volume'].includes(priceData.pricingModel)) {
        if (!priceData.tiers || priceData.tiers.length === 0) {
            errors.tiers = 'At least one tier is required';
        } else {
            // Validate each tier
            priceData.tiers.forEach((tier, index) => {
                if (!tier.unitPrice && !tier.flatFee) {
                    errors[`tier_${index}`] = `Tier ${index + 1} must have unit price or flat fee`;
                }
            });
        }
    }

    // Validate usage-based pricing
    if (priceData.pricingModel === 'usage-based' && !priceData.meter) {
        errors.meter = 'Meter is required for usage-based pricing';
    }

    // Validate package pricing
    if (priceData.pricingModel === 'package' && !priceData.packageQuantity) {
        errors.packageQuantity = 'Package quantity is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Calculates the total price for a given quantity
 * @param {Object} price - Price object
 * @param {number} quantity - Quantity to calculate for
 * @returns {number} - Total price
 */
export function calculateTotalPrice(price, quantity = 1) {
    let total = 0;

    switch (price.pricingModel) {
        case 'flat-rate':
            total = (parseFloat(price.amount) || 0) * quantity;
            break;

        case 'package':
            const packagesNeeded = Math.ceil(quantity / (price.packageQuantity || 1));
            total = (parseFloat(price.amount) || 0) * packagesNeeded;
            break;

        case 'tiered':
        case 'graduated':
        case 'volume':
        case 'usage-based':
            if (price.pricingModel === 'usage-based' && price.usageType !== 'per-tier') {
                total = (parseFloat(price.amount) || 0) * quantity;
            } else if (price.tiers && price.tiers.length > 0) {
                total = calculateTieredPrice(price, quantity);
            }
            break;

        default:
            total = (parseFloat(price.amount) || 0) * quantity;
    }

    return total;
}

/**
 * Calculates price for tiered pricing models
 * @param {Object} price - Price object with tiers
 * @param {number} quantity - Quantity
 * @returns {number} - Total price
 */
function calculateTieredPrice(price, quantity) {
    let total = 0;
    let remaining = quantity;

    for (let i = 0; i < price.tiers.length; i++) {
        const tier = price.tiers[i];
        const firstUnit = i === 0 ? 1 : (parseInt(price.tiers[i - 1].upTo) + 1 || 1);
        const lastUnit = tier.upTo === null || tier.upTo === undefined ? Infinity : parseInt(tier.upTo);
        const unitPrice = parseFloat(tier.unitPrice) || 0;
        const flatFee = parseFloat(tier.flatFee) || 0;

        if (remaining > 0) {
            const unitsInTier = Math.min(remaining, lastUnit - firstUnit + 1);

            if (price.tieredType === 'volume' || price.tierMode === 'volume') {
                // Volume: all units at this tier's rate
                total = (unitPrice * quantity) + flatFee;
                break;
            } else {
                // Graduated: each tier's units at tier's rate
                total += (unitPrice * unitsInTier) + flatFee;
            }
            remaining -= unitsInTier;
        }
    }

    return total;
}

/**
 * Formats a price object for display
 * @param {Object} price - Price object
 * @returns {Object} - Formatted price details
 */
export function formatPriceForDisplay(price) {
    return {
        amount: formatCurrency(price.amount, price.currency),
        billingPeriod: formatBillingPeriod(price.billingPeriod),
        model: price.pricingModel,
        type: price.pricingType,
    };
}

/**
 * Transforms price data from API format to UI format
 * @param {Object} apiPrice - Price from API
 * @returns {Object} - Transformed price for UI
 */
export function transformPriceFromApi(apiPrice) {
    return {
        ...apiPrice,
        id: apiPrice._id || apiPrice.id,
        // Ensure tiers is always an array
        tiers: apiPrice.tiers || [],
        // Convert any string numbers to actual numbers
        amount: apiPrice.amount ? parseFloat(apiPrice.amount) : 0,
        priceName: apiPrice.priceName || '', // Map priceName
    };
}

/**
 * Transforms price data from UI format to API format
 * @param {Object} uiPrice - Price from UI
 * @returns {Object} - Transformed price for API
 */
export function transformPriceToApi(uiPrice) {
    const apiPrice = {
        priceName: uiPrice.priceName, // Added priceName
        pricingModel: uiPrice.pricingModel,
        pricingType: uiPrice.pricingType,
        currency: uiPrice.currency || 'INR',
        amount: uiPrice.amount,
        billingPeriod: uiPrice.billingPeriod,
        includeTaxInPrice: uiPrice.includeTaxInPrice,
        tiers: uiPrice.tiers,
        tieredType: uiPrice.tieredType,
        usageType: uiPrice.usageType,
        meter: uiPrice.meter,
        packageQuantity: uiPrice.packageQuantity,
        minimumAmount: uiPrice.minimumAmount,
        maximumAmount: uiPrice.maximumAmount,
        suggestedAmount: uiPrice.suggestedAmount,
    };

    // Remove undefined fields
    Object.keys(apiPrice).forEach(key => {
        if (apiPrice[key] === undefined) {
            delete apiPrice[key];
        }
    });

    return apiPrice;
}

/**
 * Adds a new price to a product
 * @param {string} productId - Product ID
 * @param {Object} priceData - Price data
 * @returns {Promise<Object>} - Created price
 */
export async function addPrice(productId, priceData) {
    // Validate
    const validation = validatePrice(priceData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformPriceToApi(priceData);
        const createdPrice = await priceApi.addPrice(productId, apiData);
        return transformPriceFromApi(createdPrice);
    } catch (error) {
        console.error('Error adding price:', error);
        throw new Error('Failed to add price. Please try again.');
    }
}

/**
 * Updates an existing price
 * @param {string} productId - Product ID
 * @param {number} priceIndex - Price index
 * @param {Object} priceData - Updated price data
 * @returns {Promise<Object>} - Updated price
 */
export async function updatePrice(productId, priceIndex, priceData) {
    // Validate
    const validation = validatePrice(priceData);
    if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
    }

    try {
        const apiData = transformPriceToApi(priceData);
        const updatedPrice = await priceApi.updatePrice(productId, priceIndex, apiData);
        return transformPriceFromApi(updatedPrice);
    } catch (error) {
        console.error('Error updating price:', error);
        throw new Error('Failed to update price. Please try again.');
    }
}

/**
 * Deletes a price from a product
 * @param {string} productId - Product ID
 * @param {number} priceIndex - Price index
 * @returns {Promise<void>}
 */
export async function deletePrice(productId, priceIndex) {
    try {
        await priceApi.deletePrice(productId, priceIndex);
    } catch (error) {
        console.error('Error deleting price:', error);
        throw new Error('Failed to delete price. Please try again.');
    }
}
