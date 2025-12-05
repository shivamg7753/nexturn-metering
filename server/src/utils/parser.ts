/**
 * JSON parsing utilities
 */

/**
 * Safely parse JSON string with fallback
 */
export const safeJSONParse = <T = any>(jsonString: string | any, fallback: T): T => {
    if (typeof jsonString !== 'string') {
        return jsonString;
    }

    try {
        return JSON.parse(jsonString) as T;
    } catch {
        return fallback;
    }
};

/**
 * Parse properties field from database
 */
export const parseProperties = (properties: any): Record<string, any> => {
    return safeJSONParse(properties, {});
};

/**
 * Parse array field from database
 */
export const parseArray = <T = any>(arrayString: any): T[] => {
    return safeJSONParse(arrayString, []);
};
