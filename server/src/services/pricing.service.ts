/**
 * Pricing Service
 * Handles pricing calculations for different charge models
 */

export interface ChargeProperties {
    amountCents?: number;
    packageSize?: number;
    [key: string]: any;
}

export interface Charge {
    chargeModel: string;
    properties?: ChargeProperties;
}

/**
 * Calculate cost based on charge model
 */
export const calculateCost = (
    usage: number,
    charge: Charge
): number => {
    const price = Number(charge.properties?.amountCents || 0);

    switch (charge.chargeModel) {
        case 'standard':
            return usage * price;

        case 'package':
            const packageSize = Number(charge.properties?.packageSize || 1);
            const packages = Math.ceil(usage / packageSize);
            return packages * price;

        case 'volume':
            // Simplified volume pricing
            return usage * price;

        default:
            return 0;
    }
};

/**
 * Calculate effective unit price for analytics
 */
export const getEffectiveUnitPrice = (charge: Charge): number => {
    const price = Number(charge.properties?.amountCents || 0);

    switch (charge.chargeModel) {
        case 'standard':
            return price;

        case 'package':
            const packageSize = Number(charge.properties?.packageSize || 1);
            return price / packageSize;

        default:
            return price;
    }
};
