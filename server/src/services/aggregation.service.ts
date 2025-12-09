/**
 * Aggregation Service
 * Handles event aggregation logic
 */

export interface AggregationConfig {
    aggregation: string;
    field?: string;
}

export interface ParsedEvent {
    properties: Record<string, any>;
    [key: string]: any;
}

/**
 * Aggregate events based on configuration
 */
export const aggregateEvents = (
    events: ParsedEvent[],
    config: AggregationConfig
): number => {
    const { aggregation, field } = config;

    switch (aggregation) {
        case 'count':
            return events.length;

        case 'sum':
            if (!field) return 0;
            return events.reduce((sum, e) => sum + (Number(e.properties[field]) || 0), 0);

        case 'max':
            if (!field) return 0;
            return Math.max(...events.map(e => Number(e.properties[field]) || 0), 0);

        case 'unique_count':
            if (!field) return 0;
            const uniqueValues = new Set(events.map(e => e.properties[field]));
            return uniqueValues.size;

        default:
            return 0;
    }
};
