/**
 * Schema Validators
 * Validation functions for data schemas
 */

/**
 * Validates pricing tier data
 * @param {Object} tier - Tier data to validate
 * @param {number} index - Tier index
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validatePricingTier(tier, index) {
    const errors = {};

    if (!tier.unitPrice && !tier.flatFee) {
        errors[`tier_${index}`] = `Tier ${index + 1} must have either unit price or flat fee`;
    }

    if (tier.unitPrice && isNaN(parseFloat(tier.unitPrice))) {
        errors[`tier_${index}_unitPrice`] = 'Invalid unit price';
    }

    if (tier.flatFee && isNaN(parseFloat(tier.flatFee))) {
        errors[`tier_${index}_flatFee`] = 'Invalid flat fee';
    }

    if (tier.upTo !== null && tier.upTo !== undefined) {
        const upTo = parseInt(tier.upTo);
        if (isNaN(upTo) || upTo < 1) {
            errors[`tier_${index}_upTo`] = 'Invalid tier upper limit';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates array of pricing tiers
 * @param {Array} tiers - Array of tiers
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validatePricingTiers(tiers) {
    if (!Array.isArray(tiers) || tiers.length === 0) {
        return {
            isValid: false,
            errors: { tiers: 'At least one tier is required' }
        };
    }

    const allErrors = {};
    let isValid = true;

    tiers.forEach((tier, index) => {
        const validation = validatePricingTier(tier, index);
        if (!validation.isValid) {
            isValid = false;
            Object.assign(allErrors, validation.errors);
        }
    });

    // Validate tier sequence
    for (let i = 1; i < tiers.length; i++) {
        const prevTier = tiers[i - 1];
        const currentTier = tiers[i];

        if (prevTier.upTo === null || prevTier.upTo === undefined) {
            allErrors[`tier_${i}`] = 'Previous tier must have an upper limit';
            isValid = false;
        }
    }

    return {
        isValid,
        errors: allErrors
    };
}

/**
 * Validates product pricing data
 * @param {Object} pricingData - Pricing data to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validatePricingData(pricingData) {
    const errors = {};

    if (!pricingData.pricingModel) {
        errors.pricingModel = 'Pricing model is required';
    }

    if (!pricingData.pricingType) {
        errors.pricingType = 'Pricing type is required';
    }

    if (!pricingData.currency) {
        errors.currency = 'Currency is required';
    }

    // Model-specific validation
    switch (pricingData.pricingModel) {
        case 'flat-rate':
            if (!pricingData.amount || parseFloat(pricingData.amount) <= 0) {
                errors.amount = 'Amount must be greater than 0';
            }
            break;

        case 'tiered':
        case 'graduated':
        case 'volume':
            const tierValidation = validatePricingTiers(pricingData.tiers);
            if (!tierValidation.isValid) {
                Object.assign(errors, tierValidation.errors);
            }
            break;

        case 'usage-based':
            if (!pricingData.meter) {
                errors.meter = 'Meter is required for usage-based pricing';
            }
            if (pricingData.usageType === 'per-tier') {
                const tierValidation = validatePricingTiers(pricingData.tiers);
                if (!tierValidation.isValid) {
                    Object.assign(errors, tierValidation.errors);
                }
            }
            break;

        case 'package':
            if (!pricingData.packageQuantity || parseInt(pricingData.packageQuantity) <= 0) {
                errors.packageQuantity = 'Package quantity must be greater than 0';
            }
            if (!pricingData.amount || parseFloat(pricingData.amount) <= 0) {
                errors.amount = 'Amount must be greater than 0';
            }
            break;

        case 'customer-chooses-price':
            if (pricingData.minimumAmount && pricingData.maximumAmount) {
                if (parseFloat(pricingData.minimumAmount) >= parseFloat(pricingData.maximumAmount)) {
                    errors.maximumAmount = 'Maximum must be greater than minimum';
                }
            }
            break;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates customer address data
 * @param {Object} address - Address data to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validateAddress(address) {
    const errors = {};

    if (address.country && address.country.length !== 2) {
        errors.country = 'Invalid country code (must be 2 letters)';
    }

    if (address.postalCode && !/^[A-Z0-9\s\-]+$/i.test(address.postalCode)) {
        errors.postalCode = 'Invalid postal code format';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates metadata object
 * @param {Object} metadata - Metadata to validate
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validateMetadata(metadata) {
    const errors = {};

    if (metadata && typeof metadata !== 'object') {
        errors.metadata = 'Metadata must be an object';
    }

    // Check for circular references
    try {
        JSON.stringify(metadata);
    } catch (error) {
        errors.metadata = 'Invalid metadata (circular reference detected)';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
