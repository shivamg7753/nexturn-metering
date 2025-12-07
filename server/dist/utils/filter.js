"use strict";
/**
 * Filter evaluation utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFilters = exports.evaluateFilters = exports.evaluateFilter = void 0;
/**
 * Evaluate a filter against event properties
 */
const evaluateFilter = (eventProperties, filter) => {
    const eventValue = eventProperties[filter.key];
    const targetValue = filter.value;
    if (eventValue === undefined && filter.operator !== 'not_equals')
        return false;
    switch (filter.operator) {
        case 'equals':
            return String(eventValue) === String(targetValue);
        case 'not_equals':
            return String(eventValue) !== String(targetValue);
        case 'gt':
            return Number(eventValue) > Number(targetValue);
        case 'lt':
            return Number(eventValue) < Number(targetValue);
        case 'contains':
            return String(eventValue).includes(String(targetValue));
        default:
            return String(eventValue) === String(targetValue);
    }
};
exports.evaluateFilter = evaluateFilter;
/**
 * Evaluate multiple filters against event properties
 */
const evaluateFilters = (eventProperties, filters) => {
    for (const filter of filters) {
        if (!(0, exports.evaluateFilter)(eventProperties, filter)) {
            return false;
        }
    }
    return true;
};
exports.evaluateFilters = evaluateFilters;
/**
 * Normalize filters from various formats
 */
const normalizeFilters = (rawFilter) => {
    if (Array.isArray(rawFilter)) {
        return rawFilter;
    }
    if (typeof rawFilter === 'object' && rawFilter !== null) {
        return Object.entries(rawFilter).map(([key, value]) => ({
            key,
            operator: 'equals',
            value
        }));
    }
    return [];
};
exports.normalizeFilters = normalizeFilters;
