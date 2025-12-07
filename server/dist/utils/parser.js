"use strict";
/**
 * JSON parsing utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArray = exports.parseProperties = exports.safeJSONParse = void 0;
/**
 * Safely parse JSON string with fallback
 */
const safeJSONParse = (jsonString, fallback) => {
    if (typeof jsonString !== 'string') {
        return jsonString;
    }
    try {
        return JSON.parse(jsonString);
    }
    catch (_a) {
        return fallback;
    }
};
exports.safeJSONParse = safeJSONParse;
/**
 * Parse properties field from database
 */
const parseProperties = (properties) => {
    return (0, exports.safeJSONParse)(properties, {});
};
exports.parseProperties = parseProperties;
/**
 * Parse array field from database
 */
const parseArray = (arrayString) => {
    return (0, exports.safeJSONParse)(arrayString, []);
};
exports.parseArray = parseArray;
