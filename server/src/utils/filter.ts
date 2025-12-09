/**
 * Filter evaluation utilities
 */

export interface Filter {
    key: string;
    operator: 'equals' | 'not_equals' | 'gt' | 'lt' | 'contains';
    value: any;
}

/**
 * Evaluate a filter against event properties
 */
export const evaluateFilter = (eventProperties: any, filter: Filter): boolean => {
    const eventValue = eventProperties[filter.key];
    const targetValue = filter.value;

    if (eventValue === undefined && filter.operator !== 'not_equals') return false;

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

/**
 * Evaluate multiple filters against event properties
 */
export const evaluateFilters = (eventProperties: any, filters: Filter[]): boolean => {
    for (const filter of filters) {
        if (!evaluateFilter(eventProperties, filter)) {
            return false;
        }
    }
    return true;
};

/**
 * Normalize filters from various formats
 */
export const normalizeFilters = (rawFilter: any): Filter[] => {
    if (Array.isArray(rawFilter)) {
        return rawFilter;
    }

    if (typeof rawFilter === 'object' && rawFilter !== null) {
        return Object.entries(rawFilter).map(([key, value]) => ({
            key,
            operator: 'equals' as const,
            value
        }));
    }

    return [];
};
