"use strict";
/**
 * Pricing Service
 * Handles pricing calculations for different charge models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveUnitPrice = exports.calculateCost = void 0;
/**
 * Calculate cost based on charge model
 */
const calculateCost = (usage, charge) => {
    var _a, _b;
    const price = Number(((_a = charge.properties) === null || _a === void 0 ? void 0 : _a.amountCents) || 0);
    switch (charge.chargeModel) {
        case 'standard':
            return usage * price;
        case 'package':
            const packageSize = Number(((_b = charge.properties) === null || _b === void 0 ? void 0 : _b.packageSize) || 1);
            const packages = Math.ceil(usage / packageSize);
            return packages * price;
        case 'volume':
            // Simplified volume pricing
            return usage * price;
        default:
            return 0;
    }
};
exports.calculateCost = calculateCost;
/**
 * Calculate effective unit price for analytics
 */
const getEffectiveUnitPrice = (charge) => {
    var _a, _b;
    const price = Number(((_a = charge.properties) === null || _a === void 0 ? void 0 : _a.amountCents) || 0);
    switch (charge.chargeModel) {
        case 'standard':
            return price;
        case 'package':
            const packageSize = Number(((_b = charge.properties) === null || _b === void 0 ? void 0 : _b.packageSize) || 1);
            return price / packageSize;
        default:
            return price;
    }
};
exports.getEffectiveUnitPrice = getEffectiveUnitPrice;
