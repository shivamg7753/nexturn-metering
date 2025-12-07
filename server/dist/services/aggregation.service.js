"use strict";
/**
 * Aggregation Service
 * Handles event aggregation logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateEvents = void 0;
/**
 * Aggregate events based on configuration
 */
const aggregateEvents = (events, config) => {
    const { aggregation, field } = config;
    switch (aggregation) {
        case 'count':
            return events.length;
        case 'sum':
            if (!field)
                return 0;
            return events.reduce((sum, e) => sum + (Number(e.properties[field]) || 0), 0);
        case 'max':
            if (!field)
                return 0;
            return Math.max(...events.map(e => Number(e.properties[field]) || 0), 0);
        case 'unique_count':
            if (!field)
                return 0;
            const uniqueValues = new Set(events.map(e => e.properties[field]));
            return uniqueValues.size;
        default:
            return 0;
    }
};
exports.aggregateEvents = aggregateEvents;
